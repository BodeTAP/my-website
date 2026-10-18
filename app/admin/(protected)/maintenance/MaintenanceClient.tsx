"use client";

import { useState, useEffect } from "react";
import {
  Package, Plus, Pencil, Trash2, X, Loader2, Check,
  Receipt, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/hooks/useConfirm";
import { FadeUp } from "@/components/public/motion";
import MaintenanceSearch from "./MaintenanceSearch";
import MaintenanceFilter from "./MaintenanceFilter";
import MaintenancePagination from "./MaintenancePagination";

type Pkg = { id: string; name: string; description: string | null; price: number; features: string[]; isActive: boolean };
type Sub = {
  id: string; status: string; startDate: string; nextBillingDate: string; notes: string | null;
  client: { businessName: string; user: { name: string | null } };
  package: { name: string; price: number };
};
type Client = { id: string; businessName: string };

function formatRp(n: number) { return "Rp " + n.toLocaleString("id-ID"); }
function formatDate(d: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAUSED: "bg-amber-50 text-amber-700 border-amber-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};
const STATUS_LABELS: Record<string, string> = { ACTIVE: "Aktif", PAUSED: "Dijeda", CANCELLED: "Dibatalkan" };

// ── Package Modal ──────────────────────────────────────────────────────────────
function PackageModal({ pkg, onClose, onSave }: {
  pkg?: Pkg; onClose: () => void; onSave: (p: Pkg) => void;
}) {
  const [form, setForm] = useState({
    name: pkg?.name ?? "",
    description: pkg?.description ?? "",
    price: pkg?.price ?? "",
    isActive: pkg?.isActive ?? true,
  });
  const [features, setFeatures] = useState<string[]>(pkg?.features ?? []);
  const [featInput, setFeatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addFeat = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = featInput.trim();
      if (v && !features.includes(v)) setFeatures((f) => [...f, v]);
      setFeatInput("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const isEdit = !!pkg;
    const res = await fetch(
      isEdit ? `/api/admin/maintenance/packages/${pkg.id}` : "/api/admin/maintenance/packages",
      { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), features }) }
    );
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-slate-900 font-bold text-lg mb-5">{pkg ? "Edit Paket" : "Tambah Paket"}</h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-slate-700 font-medium text-sm">Nama Paket *</Label>
              <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Paket Basic" className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-slate-700 font-medium text-sm">Harga / Bulan (Rp) *</Label>
              <Input required type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="300000" className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Deskripsi</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Update konten, backup bulanan, support via WhatsApp..."
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Fitur yang Termasuk <span className="text-slate-400 text-xs font-normal">(Enter untuk tambah)</span></Label>
            <Input value={featInput} onChange={(e) => setFeatInput(e.target.value)} onKeyDown={addFeat}
              placeholder="Update konten website..." className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
            {features.length > 0 && (
              <div className="space-y-1 pt-1">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 flex-1 text-xs">{f}</span>
                    <button type="button" onClick={() => setFeatures((fs) => fs.filter((x) => x !== f))}
                      className="text-slate-400 hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? "bg-slate-900" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-xs ${form.isActive ? "left-5.5" : "left-0.5"}`} />
            </button>
            <span className="text-slate-700 text-sm">Paket aktif (bisa dipilih)</span>
          </div>
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs rounded-xl">Batal</Button>
            <Button type="submit" disabled={loading} className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Subscription Modal ────────────────────────────────────────────────────────
function SubModal({ packages, clients, onClose, onSave }: {
  packages: Pkg[]; clients: Client[];
  onClose: () => void; onSave: (s: Sub) => void;
}) {
  const [form, setForm] = useState({ clientId: "", packageId: "", startDate: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/admin/maintenance/subscriptions", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    onSave(data);
  };

  const activePackages = packages.filter((p) => p.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-slate-900 font-bold text-lg mb-5">Tambah Langganan Klien</h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Klien *</Label>
            <select required value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
              className="w-full h-10 rounded-xl px-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900">
              <option value="">— Pilih klien —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.businessName}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Paket *</Label>
            <select required value={form.packageId} onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value }))}
              className="w-full h-10 rounded-xl px-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900">
              <option value="">— Pilih paket —</option>
              {activePackages.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {formatRp(p.price)}/bln</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Tanggal Mulai</Label>
            <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-medium text-sm">Catatan</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="Catatan internal..." className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none" />
          </div>
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs rounded-xl">Batal</Button>
            <Button type="submit" disabled={loading} className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambah Langganan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MaintenanceClient({
  packages: initial, subscriptions: initSubs, clients, pagination
}: {
  packages: Pkg[]; subscriptions: Sub[]; clients: Client[];
  pagination: { total: number; totalPages: number; startIdx: number; endIdx: number };
}) {
  const [tab, setTab] = useState<"subs" | "pkgs">("subs");
  const [packages, setPackages] = useState(initial);
  const [subs, setSubs] = useState(initSubs);
  const [pkgModal, setPkgModal] = useState<Pkg | true | null>(null);
  const [subModal, setSubModal] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [changing, setChanging] = useState<string | null>(null);
  const { confirm, node } = useConfirm();

  // Sync state when searchParams changes data from server
  useEffect(() => {
    void Promise.resolve().then(() => setSubs(initSubs));
  }, [initSubs]);

  const handleGenerateInvoice = async (subId: string) => {
    if (!await confirm("Generate invoice bulan ini?", { description: "Invoice baru akan dibuat untuk langganan ini.", confirmLabel: "Generate", variant: "warning" })) return;
    setGenerating(subId);
    const res = await fetch(`/api/admin/maintenance/subscriptions/${subId}`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setSubs((prev) => prev.map((s) => s.id === subId ? { ...s, nextBillingDate: data.nextBillingDate } : s));
      alert(`Invoice ${data.invoice.invoiceNo} berhasil dibuat!`);
    }
    setGenerating(null);
  };

  const handleStatusChange = async (subId: string, status: string) => {
    setChanging(subId);
    const res = await fetch(`/api/admin/maintenance/subscriptions/${subId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) setSubs((prev) => prev.map((s) => s.id === subId ? { ...s, status: data.status } : s));
    setChanging(null);
  };

  const handleDeletePkg = async (id: string) => {
    if (!await confirm("Hapus paket ini?", { description: "Paket yang dihapus tidak bisa dikembalikan." })) return;
    await fetch(`/api/admin/maintenance/packages/${id}`, { method: "DELETE" });
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Maintenance & Retainer</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola paket langganan dan langganan aktif klien</p>
        </div>
        <Button
          onClick={() => tab === "subs" ? setSubModal(true) : setPkgModal(true)}
          className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl shadow-xs font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          {tab === "subs" ? "Tambah Langganan" : "Tambah Paket"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl mb-6 w-fit">
        {(["subs", "pkgs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              tab === t ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}>
            {t === "subs" ? <><Users className="w-4 h-4 inline mr-1.5" />Langganan ({subs.length})</> : <><Package className="w-4 h-4 inline mr-1.5" />Paket ({packages.length})</>}
          </button>
        ))}
      </div>

      {/* Subscriptions Tab */}
      {tab === "subs" && (
        <>
          <FadeUp delay={0.1}>
            <div className="bg-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-slate-200 shadow-2xs relative z-10">
              <MaintenanceSearch />
              <MaintenanceFilter />
            </div>
          </FadeUp>

          <div className="space-y-3">
          {subs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Belum ada langganan aktif.</p>
            </div>
          ) : subs.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-slate-900 font-semibold">{s.client.businessName}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                    <span className="text-slate-900 text-sm font-medium">{s.package.name}</span>
                    <span className="text-slate-600 text-sm">{formatRp(s.package.price)}/bln</span>
                  </div>
                  <div className="text-slate-500 text-xs flex gap-4 flex-wrap">
                    <span>Mulai: {formatDate(s.startDate)}</span>
                    <span>Tagihan berikutnya: <span className="text-slate-700 font-medium">{formatDate(s.nextBillingDate)}</span></span>
                  </div>
                  {s.notes && <p className="text-slate-500 text-xs mt-1 italic">{s.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status dropdown */}
                  <select
                    value={s.status}
                    disabled={changing === s.id}
                    onChange={(e) => handleStatusChange(s.id, e.target.value)}
                    className="h-8 text-xs rounded-xl px-2.5 bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="PAUSED">Dijeda</option>
                    <option value="CANCELLED">Dibatalkan</option>
                  </select>
                  {s.status === "ACTIVE" && (
                    <Button size="sm" onClick={() => handleGenerateInvoice(s.id)}
                      disabled={generating === s.id}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl h-8 text-xs font-medium shadow-2xs">
                      {generating === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Receipt className="w-3.5 h-3.5 mr-1" />Invoice</>}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>

          {pagination.total > 0 && (
            <FadeUp delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-2xl border border-slate-200 shadow-2xs relative z-10 mt-6">
                <p className="text-xs text-slate-500 font-medium">
                  Menampilkan <span className="text-slate-900 font-semibold">{pagination.startIdx}-{pagination.endIdx}</span> dari <span className="text-slate-900 font-semibold">{pagination.total}</span> langganan
                </p>
                <MaintenancePagination totalPages={pagination.totalPages} />
              </div>
            </FadeUp>
          )}
        </>
      )}

      {/* Packages Tab */}
      {tab === "pkgs" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Belum ada paket. Buat paket pertama!</p>
            </div>
          ) : packages.map((p) => (
            <div key={p.id} className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow relative ${!p.isActive ? "opacity-60 bg-slate-50/50" : ""}`}>
              {!p.isActive && (
                <span className="absolute top-3 right-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">Nonaktif</span>
              )}
              <h3 className="text-slate-900 font-bold mb-1 text-base">{p.name}</h3>
              <p className="text-slate-900 font-bold text-xl mb-2">{formatRp(p.price)}<span className="text-slate-500 text-sm font-normal">/bln</span></p>
              {p.description && <p className="text-slate-600 text-xs mb-3">{p.description}</p>}
              {p.features.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <button onClick={() => setPkgModal(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors shadow-2xs">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDeletePkg(p.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 text-xs font-medium transition-colors shadow-2xs">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {pkgModal && (
        <PackageModal
          pkg={pkgModal === true ? undefined : pkgModal}
          onClose={() => setPkgModal(null)}
          onSave={(saved) => {
            setPackages((prev) => {
              const idx = prev.findIndex((p) => p.id === saved.id);
              if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
              return [...prev, saved];
            });
            setPkgModal(null);
          }}
        />
      )}
      {subModal && (
        <SubModal
          packages={packages}
          clients={clients}
          onClose={() => setSubModal(false)}
          onSave={(saved) => { setSubs((prev) => [saved, ...prev]); setSubModal(false); }}
        />
      )}
      {node}
    </div>
  );
}
