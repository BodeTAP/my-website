"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Globe, Plus, Pencil, Trash2, Loader2,
  AlertTriangle, CheckCircle, Clock, X, Search,
} from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import { useSearchParams } from "next/navigation";
import HostingPagination from "./HostingPagination";

type HostingRecord = {
  id: string;
  clientId: string;
  domainName: string;
  domainProvider: string | null;
  domainExpiry: string | null;
  hostingProvider: string | null;
  hostingPlan: string | null;
  hostingExpiry: string | null;
  sslExpiry: string | null;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  notes: string | null;
  client: { user: { name: string | null; email: string } };
};

type Client = { id: string; businessName: string; user: { name: string | null; email: string } };

function daysLeft(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ dateStr }: { dateStr: string | null }) {
  if (!dateStr) return <span className="text-slate-300 text-xs">—</span>;
  const days = daysLeft(dateStr);
  const date = new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const color = days === null ? "text-slate-400"
    : days < 0 ? "text-rose-600" : days <= 7 ? "text-rose-600" : days <= 14 ? "text-amber-600" : days <= 30 ? "text-amber-500" : "text-emerald-600";
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-xs font-semibold ${color}`}>
        {days === null ? "—" : days < 0 ? "Expired" : `${days}h lagi`}
      </span>
      <span className="text-slate-500 text-[10px]">{date}</span>
    </div>
  );
}

const EMPTY_FORM = {
  clientId: "", domainName: "", domainProvider: "", domainExpiry: "",
  hostingProvider: "", hostingPlan: "", hostingExpiry: "",
  sslExpiry: "", status: "ACTIVE", notes: "",
};

export default function HostingClient() {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<HostingRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<HostingRecord | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  function showToast(ok: boolean, msg: string) {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchAll() {
    setLoading(true);
    const [rRes, cRes] = await Promise.all([
      fetch("/api/admin/hosting"),
      fetch("/api/admin/clients?limit=200"),
    ]);
    if (rRes.ok) setRecords(await rRes.json());
    if (cRes.ok) {
      const d = await cRes.json();
      setClients(d.clients ?? d);
    }
    setLoading(false);
  }

  useEffect(() => {
    void Promise.resolve().then(fetchAll);
  }, []);

  function openAdd() {
    setEditRecord(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  }

  function openEdit(r: HostingRecord) {
    setEditRecord(r);
    setForm({
      clientId:        r.clientId,
      domainName:      r.domainName,
      domainProvider:  r.domainProvider  ?? "",
      domainExpiry:    r.domainExpiry    ? r.domainExpiry.split("T")[0] : "",
      hostingProvider: r.hostingProvider ?? "",
      hostingPlan:     r.hostingPlan     ?? "",
      hostingExpiry:   r.hostingExpiry   ? r.hostingExpiry.split("T")[0] : "",
      sslExpiry:       r.sslExpiry       ? r.sslExpiry.split("T")[0] : "",
      status:          r.status,
      notes:           r.notes ?? "",
    });
    setShowModal(true);
  }

  function handleSave() {
    start(async () => {
      const method = editRecord ? "PATCH" : "POST";
      const url    = editRecord ? `/api/admin/hosting/${editRecord.id}` : "/api/admin/hosting";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        showToast(true, editRecord ? "Record diperbarui." : "Record ditambahkan.");
        setShowModal(false);
        fetchAll();
      } else {
        const d = await res.json();
        showToast(false, d.error ?? "Gagal menyimpan.");
      }
    });
  }

  function handleDelete(id: string, domain: string) {
    if (!confirm(`Hapus record "${domain}"?`)) return;
    start(async () => {
      const res = await fetch(`/api/admin/hosting/${id}`, { method: "DELETE" });
      if (res.ok) { showToast(true, "Record dihapus."); fetchAll(); }
      else showToast(false, "Gagal menghapus.");
    });
  }

  const filtered = records.filter(r => {
    const matchSearch = r.domainName.toLowerCase().includes(search.toLowerCase()) ||
      (r.client.user.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    // Filter berdasarkan kritis/perhatian
    if (filterStatus === "KRITIS") {
      const d = Math.min(daysLeft(r.domainExpiry) ?? 999, daysLeft(r.hostingExpiry) ?? 999, daysLeft(r.sslExpiry) ?? 999);
      return matchSearch && d <= 14;
    }
    return matchSearch && matchStatus;
  });

  const currentPage = Number(searchParams.get("page") ?? "1");
  const PER_PAGE = 10;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PER_PAGE);
  const startIdx = totalItems > 0 ? (currentPage - 1) * PER_PAGE + 1 : 0;
  const endIdx = Math.min(currentPage * PER_PAGE, totalItems);
  const paginatedFiltered = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const stats = {
    total:   records.length,
    active:  records.filter(r => r.status === "ACTIVE").length,
    kritis:  records.filter(r => {
      const d = Math.min(daysLeft(r.domainExpiry) ?? 999, daysLeft(r.hostingExpiry) ?? 999, daysLeft(r.sslExpiry) ?? 999);
      return d <= 14 && r.status === "ACTIVE";
    }).length,
    expired: records.filter(r => r.status === "EXPIRED").length,
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl backdrop-blur-md ${
          toast.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {toast.ok ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      <FadeUp>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Hosting</h1>
            <p className="text-slate-500 text-sm mt-1">Pantau domain, hosting, dan SSL semua klien dari satu tempat.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#1E242E] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Record
          </button>
        </div>
      </FadeUp>

      {/* Stats */}
      <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Record",  value: stats.total,   icon: Globe,         iconBg: "bg-slate-100 text-slate-700" },
          { label: "Aktif",         value: stats.active,  icon: CheckCircle,   iconBg: "bg-emerald-50 text-emerald-700" },
          { label: "Kritis (≤14h)", value: stats.kritis,  icon: AlertTriangle, iconBg: "bg-amber-50 text-amber-700" },
          { label: "Expired",       value: stats.expired, icon: Clock,         iconBg: "bg-rose-50 text-rose-700" },
        ].map(({ label, value, icon: Icon, iconBg }) => (
          <StaggerItem key={label}>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* Filter & Search */}
      <FadeUp delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari domain atau nama klien..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs transition-all"
            />
          </div>
          <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl flex-wrap">
            {["ALL", "ACTIVE", "KRITIS", "EXPIRED", "SUSPENDED"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === s
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {s === "ALL" ? "Semua" : s === "KRITIS" ? "⚠ Kritis" : s}
              </button>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* Table */}
      <FadeUp delay={0.15}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="font-semibold text-slate-600">Tidak ada record ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    {["Domain / Klien", "Domain Expired", "Hosting Expired", "SSL Expired", "Status", "Aksi"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedFiltered.map(r => {
                    const minDays = Math.min(
                      daysLeft(r.domainExpiry)  ?? 999,
                      daysLeft(r.hostingExpiry) ?? 999,
                      daysLeft(r.sslExpiry)     ?? 999
                    );
                    const rowGlow = minDays <= 7 ? "bg-rose-50/40" : minDays <= 14 ? "bg-amber-50/40" : "";
                    return (
                      <tr key={r.id} className={`hover:bg-slate-50/70 transition-colors ${rowGlow}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <Globe className="w-4 h-4 text-slate-700" />
                            </div>
                            <div>
                              <p className="text-slate-900 font-semibold text-sm">{r.domainName}</p>
                              <p className="text-slate-500 text-xs">{r.client.user.name ?? r.client.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><ExpiryBadge dateStr={r.domainExpiry} /></td>
                        <td className="px-5 py-4"><ExpiryBadge dateStr={r.hostingExpiry} /></td>
                        <td className="px-5 py-4"><ExpiryBadge dateStr={r.sslExpiry} /></td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            r.status === "ACTIVE"    ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            r.status === "EXPIRED"   ? "bg-rose-50 text-rose-700 border-rose-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id, r.domainName)}
                              className="p-2 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </FadeUp>

      {totalItems > 0 && (
        <FadeUp delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-2xl border border-slate-200 shadow-2xs relative z-10 mt-6">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="text-slate-900 font-semibold">{startIdx}-{endIdx}</span> dari <span className="text-slate-900 font-semibold">{totalItems}</span> record
            </p>
            <HostingPagination totalPages={totalPages} />
          </div>
        </FadeUp>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-xl">
                {editRecord ? "Edit Record Hosting" : "Tambah Record Hosting"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Klien */}
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-semibold uppercase tracking-wider">Klien *</label>
                <select
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
                >
                  <option value="">— Pilih Klien —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.user.name ?? c.user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Nama Domain *" placeholder="tokosaya.com" value={form.domainName}
                  onChange={v => setForm(f => ({ ...f, domainName: v }))} />
                <FormField label="Provider Domain" placeholder="Niagahoster, GoDaddy..." value={form.domainProvider}
                  onChange={v => setForm(f => ({ ...f, domainProvider: v }))} />
              </div>
              <FormField label="Expired Domain" type="date" value={form.domainExpiry}
                onChange={v => setForm(f => ({ ...f, domainExpiry: v }))} />

              <div className="border-t border-slate-100 pt-5 space-y-4">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Informasi Hosting</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Provider Hosting" placeholder="Niagahoster, Vercel..." value={form.hostingProvider}
                    onChange={v => setForm(f => ({ ...f, hostingProvider: v }))} />
                  <FormField label="Paket Hosting" placeholder="Business, Starter..." value={form.hostingPlan}
                    onChange={v => setForm(f => ({ ...f, hostingPlan: v }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Expired Hosting" type="date" value={form.hostingExpiry}
                    onChange={v => setForm(f => ({ ...f, hostingExpiry: v }))} />
                  <FormField label="Expired SSL" type="date" value={form.sslExpiry}
                    onChange={v => setForm(f => ({ ...f, sslExpiry: v }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 text-xs font-semibold uppercase tracking-wider">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
                <FormField label="Catatan" placeholder="Opsional..." value={form.notes}
                  onChange={v => setForm(f => ({ ...f, notes: v }))} />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-sm shadow-2xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={pending || !form.clientId || !form.domainName}
                  className="flex-1 py-2.5 rounded-xl bg-[#1E242E] hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : editRecord ? "Simpan Perubahan" : "Tambah Record"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-slate-700 text-xs font-semibold uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
      />
    </div>
  );
}
