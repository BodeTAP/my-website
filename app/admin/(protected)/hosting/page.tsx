"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Globe, Server, Shield, Plus, Pencil, Trash2, Loader2,
  AlertTriangle, CheckCircle, Clock, ChevronDown, X, Search,
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

function ExpiryBadge({ dateStr, label }: { dateStr: string | null; label: string }) {
  if (!dateStr) return <span className="text-white/20 text-xs">—</span>;
  const days = daysLeft(dateStr);
  const date = new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const color = days === null ? "white/30"
    : days < 0 ? "red-500" : days <= 7 ? "red-400" : days <= 14 ? "orange-400" : days <= 30 ? "yellow-400" : "green-400";
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-xs font-semibold text-${color}`}>
        {days === null ? "—" : days < 0 ? "Expired" : `${days}h lagi`}
      </span>
      <span className="text-white/40 text-[10px]">{date}</span>
    </div>
  );
}

const EMPTY_FORM = {
  clientId: "", domainName: "", domainProvider: "", domainExpiry: "",
  hostingProvider: "", hostingPlan: "", hostingExpiry: "",
  sslExpiry: "", status: "ACTIVE", notes: "",
};

export default function AdminHostingPage() {
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

  useEffect(() => { fetchAll(); }, []);

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
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md ${
          toast.ok ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          {toast.ok ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      <FadeUp>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Manajemen Hosting</h1>
            <p className="text-blue-200/50 text-sm mt-1">Pantau domain, hosting, dan SSL semua klien dari satu tempat.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Record
          </button>
        </div>
      </FadeUp>

      {/* Stats */}
      <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Record",  value: stats.total,   icon: Globe,         color: "blue" },
          { label: "Aktif",         value: stats.active,  icon: CheckCircle,   color: "green" },
          { label: "Kritis (≤14h)", value: stats.kritis,  icon: AlertTriangle, color: "orange" },
          { label: "Expired",       value: stats.expired, icon: Clock,         color: "red" },
        ].map(({ label, value, icon: Icon, color }) => (
          <StaggerItem key={label}>
            <div className={`glass rounded-2xl p-5 border border-${color}-500/20 bg-${color}-500/5`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">{label}</span>
                <Icon className={`w-4 h-4 text-${color}-400`} />
              </div>
              <p className="text-3xl font-black text-white">{value}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* Filter & Search */}
      <FadeUp delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari domain atau nama klien..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["ALL", "ACTIVE", "KRITIS", "EXPIRED", "SUSPENDED"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  filterStatus === s
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                    : "bg-black/30 border-white/10 text-white/50 hover:text-white hover:border-white/20"
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
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Tidak ada record ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Domain / Klien", "Domain Expired", "Hosting Expired", "SSL Expired", "Status", "Aksi"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedFiltered.map(r => {
                    const minDays = Math.min(
                      daysLeft(r.domainExpiry)  ?? 999,
                      daysLeft(r.hostingExpiry) ?? 999,
                      daysLeft(r.sslExpiry)     ?? 999
                    );
                    const rowGlow = minDays <= 7 ? "bg-red-500/5" : minDays <= 14 ? "bg-orange-500/5" : "";
                    return (
                      <tr key={r.id} className={`hover:bg-white/5 transition-colors ${rowGlow}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                              <Globe className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{r.domainName}</p>
                              <p className="text-white/40 text-xs">{r.client.user.name ?? r.client.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><ExpiryBadge dateStr={r.domainExpiry}  label="Domain" /></td>
                        <td className="px-5 py-4"><ExpiryBadge dateStr={r.hostingExpiry} label="Hosting" /></td>
                        <td className="px-5 py-4"><ExpiryBadge dateStr={r.sslExpiry}     label="SSL" /></td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            r.status === "ACTIVE"    ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                            r.status === "EXPIRED"   ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                            "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              className="p-2 rounded-lg text-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id, r.domainName)}
                              className="p-2 rounded-lg text-red-400/60 hover:text-red-300 hover:bg-red-500/10 transition-all"
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass p-4 sm:px-6 rounded-2xl border border-white/5 relative z-10 mt-6">
            <p className="text-xs text-blue-200/40 font-medium">
              Menampilkan <span className="text-blue-200">{startIdx}-{endIdx}</span> dari <span className="text-blue-200">{totalItems}</span> record
            </p>
            <HostingPagination totalPages={totalPages} />
          </div>
        </FadeUp>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 w-full max-w-2xl border border-white/10 bg-[#050b14]/95 shadow-[0_0_80px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-white font-black text-xl">
                {editRecord ? "Edit Record Hosting" : "Tambah Record Hosting"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Klien */}
              <div className="space-y-2">
                <label className="text-white/60 text-[11px] font-bold uppercase tracking-widest">Klien *</label>
                <select
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
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

              <div className="border-t border-white/5 pt-5 space-y-4">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Informasi Hosting</p>
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
                <div className="space-y-2">
                  <label className="text-white/60 text-[11px] font-bold uppercase tracking-widest">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
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
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 font-bold text-sm transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={pending || !form.clientId || !form.domainName}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="space-y-2">
      <label className="text-white/60 text-[11px] font-bold uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
      />
    </div>
  );
}
