"use client";

import { useState } from "react";
import {
  Package, Plus, Pencil, Trash2, X, Loader2, Check,
  RefreshCw, Receipt, ChevronDown, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  PAUSED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-blue-200/40 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-white font-bold text-lg mb-5">{pkg ? "Edit Paket" : "Tambah Paket"}</h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-blue-200 text-sm">Nama Paket *</Label>
              <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Paket Basic" className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-blue-200 text-sm">Harga / Bulan (Rp) *</Label>
              <Input required type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="300000" className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-blue-200 text-sm">Deskripsi</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Update konten, backup bulanan, support via WhatsApp..."
              className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-blue-200 text-sm">Fitur yang Termasuk <span className="text-blue-200/30 text-xs">(Enter untuk tambah)</span></Label>
            <Input value={featInput} onChange={(e) => setFeatInput(e.target.value)} onKeyDown={addFeat}
              placeholder="Update konten website..." className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30" />
            {features.length > 0 && (
              <div className="space-y-1 pt-1">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span className="text-blue-200/70 flex-1">{f}</span>
                    <button type="button" onClick={() => setFeatures((fs) => fs.filter((x) => x !== f))}
                      className="text-blue-200/30 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? "bg-blue-600" : "bg-white/10"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isActive ? "left-5.5" : "left-0.5"}`} />
            </button>
            <span className="text-blue-200 text-sm">Paket aktif (bisa dipilih)</span>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-blue-200/60 hover:text-white">Batal</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-blue-200/40 hover:text-white"><X className="w-5 h-5" /></button>
        <h2 className="text-white font-bold text-lg mb-5">Tambah Langganan Klien</h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-blue-200 text-sm">Klien *</Label>
            <select required value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
              className="w-full h-10 rounded-md px-3 bg-white/5 border border-white/10 text-white text-sm">
              <option value="" className="bg-[#0d1b35]">— Pilih klien —</option>
              {clients.map((c) => <option key={c.id} value={c.id} className="bg-[#0d1b35]">{c.businessName}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-blue-200 text-sm">Paket *</Label>
            <select required value={form.packageId} onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value }))}
              className="w-full h-10 rounded-md px-3 bg-white/5 border border-white/10 text-white text-sm">
              <option value="" className="bg-[#0d1b35]">— Pilih paket —</option>
              {activePackages.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0d1b35]">{p.name} — {formatRp(p.price)}/bln</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-blue-200 text-sm">Tanggal Mulai</Label>
            <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-blue-200 text-sm">Catatan</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="Catatan internal..." className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-blue-200/60 hover:text-white">Batal</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
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
  packages: initial, subscriptions: initSubs, clients,
}: {
  packages: Pkg[]; subscriptions: Sub[]; clients: Client[];
}) {
  const [tab, setTab] = useState<"subs" | "pkgs">("subs");
  const [packages, setPackages] = useState(initial);
  const [subs, setSubs] = useState(initSubs);
  const [pkgModal, setPkgModal] = useState<Pkg | true | null>(null);
  const [subModal, setSubModal] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [changing, setChanging] = useState<string | null>(null);

  const handleGenerateInvoice = async (subId: string) => {
    if (!confirm("Generate invoice bulan ini untuk langganan ini?")) return;
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
    if (!confirm("Hapus paket ini?")) return;
    await fetch(`/api/admin/maintenance/packages/${id}`, { method: "DELETE" });
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance & Retainer</h1>
          <p className="text-blue-200/50 text-sm mt-1">Kelola paket langganan dan langganan aktif klien</p>
        </div>
        <Button
          onClick={() => tab === "subs" ? setSubModal(true) : setPkgModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {tab === "subs" ? "Tambah Langganan" : "Tambah Paket"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 w-fit">
        {(["subs", "pkgs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              tab === t ? "bg-blue-600 text-white" : "text-blue-200/50 hover:text-white"
            }`}>
            {t === "subs" ? <><Users className="w-4 h-4 inline mr-1.5" />Langganan ({subs.length})</> : <><Package className="w-4 h-4 inline mr-1.5" />Paket ({packages.length})</>}
          </button>
        ))}
      </div>

      {/* Subscriptions Tab */}
      {tab === "subs" && (
        <div className="space-y-3">
          {subs.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Users className="w-10 h-10 text-blue-500/20 mx-auto mb-3" />
              <p className="text-blue-200/40">Belum ada langganan aktif.</p>
            </div>
          ) : subs.map((s) => (
            <div key={s.id} className="glass rounded-2xl p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-white font-semibold">{s.client.businessName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                    <span className="text-blue-300 text-sm font-medium">{s.package.name}</span>
                    <span className="text-blue-200/60 text-sm">{formatRp(s.package.price)}/bln</span>
                  </div>
                  <div className="text-blue-200/40 text-xs flex gap-4 flex-wrap">
                    <span>Mulai: {formatDate(s.startDate)}</span>
                    <span>Tagihan berikutnya: <span className="text-blue-300/60">{formatDate(s.nextBillingDate)}</span></span>
                  </div>
                  {s.notes && <p className="text-blue-200/40 text-xs mt-1 italic">{s.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status dropdown */}
                  <select
                    value={s.status}
                    disabled={changing === s.id}
                    onChange={(e) => handleStatusChange(s.id, e.target.value)}
                    className="h-8 text-xs rounded-lg px-2 bg-white/5 border border-white/10 text-blue-200/70"
                  >
                    <option value="ACTIVE" className="bg-[#0d1b35]">Aktif</option>
                    <option value="PAUSED" className="bg-[#0d1b35]">Dijeda</option>
                    <option value="CANCELLED" className="bg-[#0d1b35]">Dibatalkan</option>
                  </select>
                  {s.status === "ACTIVE" && (
                    <Button size="sm" onClick={() => handleGenerateInvoice(s.id)}
                      disabled={generating === s.id}
                      className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/20 h-8 text-xs">
                      {generating === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Receipt className="w-3.5 h-3.5 mr-1" />Invoice</>}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Packages Tab */}
      {tab === "pkgs" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.length === 0 ? (
            <div className="col-span-3 glass rounded-2xl p-12 text-center">
              <Package className="w-10 h-10 text-blue-500/20 mx-auto mb-3" />
              <p className="text-blue-200/40">Belum ada paket. Buat paket pertama!</p>
            </div>
          ) : packages.map((p) => (
            <div key={p.id} className={`glass rounded-2xl p-5 relative ${!p.isActive ? "opacity-50" : ""}`}>
              {!p.isActive && (
                <span className="absolute top-3 right-3 text-xs text-yellow-400/60 border border-yellow-400/20 px-2 py-0.5 rounded-full">Nonaktif</span>
              )}
              <h3 className="text-white font-bold mb-1">{p.name}</h3>
              <p className="text-blue-300 font-semibold text-lg mb-2">{formatRp(p.price)}<span className="text-blue-200/40 text-sm font-normal">/bln</span></p>
              {p.description && <p className="text-blue-200/50 text-xs mb-3">{p.description}</p>}
              {p.features.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-blue-200/60">
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <button onClick={() => setPkgModal(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-blue-400/50 hover:text-blue-300 hover:bg-white/5 text-xs transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDeletePkg(p.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/5 text-xs transition-colors">
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
    </div>
  );
}
