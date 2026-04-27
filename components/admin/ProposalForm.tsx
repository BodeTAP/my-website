"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Lead = { id: string; name: string; businessName: string; whatsapp: string };
type LineItem = { label: string; price: number };

const PACKAGES: Record<string, { label: string; price: number; desc: string }> = {
  "landing-page":  { label: "Landing Page",            price: 800_000,   desc: "1 halaman untuk iklan & promosi" },
  "compro-simple": { label: "Company Profile Simple",  price: 1_500_000, desc: "3–4 halaman, desain standar profesional" },
  "compro-pro":    { label: "Company Profile Pro",     price: 3_500_000, desc: "5–7 halaman, desain custom & modern" },
  "toko-online":   { label: "Toko Online (E-commerce)",price: 5_400_000, desc: "Unlimited halaman, siap berjualan online" },
  "custom":        { label: "Paket Custom",            price: 0,         desc: "Harga ditentukan dari item custom" },
};

const ADDONS: { id: string; label: string; price: number; incompatible?: string[] }[] = [
  { id: "blog",        label: "Blog / Artikel",              price: 300_000,   incompatible: ["landing-page"] },
  { id: "booking",     label: "Booking / Reservasi Online",  price: 700_000,   incompatible: ["landing-page"] },
  { id: "catalog",     label: "Katalog Produk",              price: 500_000 },
  { id: "multilang",   label: "Multi Bahasa",                price: 500_000,   incompatible: ["landing-page"] },
  { id: "livechat",    label: "Live Chat Widget",            price: 200_000 },
  { id: "member",      label: "Area Member / Login",         price: 1_500_000, incompatible: ["landing-page"] },
  { id: "seo-basic",   label: "SEO Optimization",            price: 500_000 },
  { id: "whatsapp-api",label: "WhatsApp Business API",       price: 800_000 },
  { id: "analytics",   label: "Setup Google Analytics + Ads",price: 300_000 },
  { id: "maintenance", label: "Paket Maintenance 3 Bulan",   price: 900_000 },
];

const TIMELINES = ["1–2 minggu", "2–3 minggu", "3–4 minggu", "4–6 minggu", "6–8 minggu"];

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function ProposalForm({
  leads,
  defaultLeadId,
}: {
  leads: Lead[];
  defaultLeadId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Client info
  const [leadId, setLeadId]           = useState(defaultLeadId ?? "");
  const [clientName, setClientName]   = useState("");
  const [businessName, setBizName]    = useState("");
  const [whatsapp, setWhatsapp]       = useState("");

  // Package
  const [pkgType, setPkgType]         = useState("compro-pro");
  const [addons, setAddons]           = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<LineItem[]>([]);

  // Details
  const [timeline, setTimeline]       = useState("2–3 minggu");
  const [validUntil, setValidUntil]   = useState("");
  const [notes, setNotes]             = useState("");
  const [error, setError]             = useState("");

  // Auto-fill from lead
  useEffect(() => {
    if (!leadId) return;
    const lead = leads.find(l => l.id === leadId);
    if (lead) { setClientName(lead.name); setBizName(lead.businessName); setWhatsapp(lead.whatsapp); }
  }, [leadId, leads]);

  // Remove incompatible addons when package changes
  useEffect(() => {
    setAddons(prev => {
      const next = new Set(prev);
      for (const id of next) {
        const a = ADDONS.find(x => x.id === id);
        if (a?.incompatible?.includes(pkgType)) next.delete(id);
      }
      return next;
    });
  }, [pkgType]);

  const basePkg = PACKAGES[pkgType];
  const basePrice   = basePkg?.price ?? 0;
  const addonTotal  = [...addons].reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price ?? 0), 0);
  const customTotal = customItems.reduce((s, i) => s + (i.price || 0), 0);
  const total       = basePrice + addonTotal + customTotal;

  function toggleAddon(id: string) {
    setAddons(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function addCustomItem() {
    setCustomItems(prev => [...prev, { label: "", price: 0 }]);
  }

  function updateCustomItem(idx: number, field: "label" | "price", val: string | number) {
    setCustomItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  }

  function removeCustomItem(idx: number) {
    setCustomItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setError("");
    if (!clientName.trim() || !businessName.trim()) {
      setError("Nama klien dan nama bisnis wajib diisi."); return;
    }

    const addonItems: LineItem[] = [...addons].map(id => {
      const a = ADDONS.find(x => x.id === id)!;
      return { label: a.label, price: a.price };
    });

    startTransition(async () => {
      const res = await fetch("/api/admin/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: leadId || undefined,
          clientName: clientName.trim(),
          businessName: businessName.trim(),
          whatsapp: whatsapp.trim() || undefined,
          packageType: pkgType,
          packageLabel: basePkg?.label ?? pkgType,
          addons: addonItems,
          customItems: customItems.filter(c => c.label.trim()),
          basePrice,
          totalPrice: total,
          timeline,
          validUntil: validUntil || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal menyimpan"); return; }
      router.push(`/admin/proposals/${data.id}`);
    });
  }

  const availableAddons = ADDONS.filter(a => !a.incompatible?.includes(pkgType));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Left: Form ─────────────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Client info */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Informasi Klien</h3>
          <div className="space-y-3">
            <div>
              <label className="text-blue-200/60 text-xs mb-1 block">Dari Lead (opsional)</label>
              <select
                value={leadId}
                onChange={e => setLeadId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
              >
                <option value="" className="bg-[#0a1628]">— Tidak dari lead / isi manual —</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id} className="bg-[#0a1628]">
                    {l.businessName} ({l.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-blue-200/60 text-xs mb-1 block">Nama Kontak *</label>
                <input
                  value={clientName} onChange={e => setClientName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-blue-200/60 text-xs mb-1 block">Nama Bisnis *</label>
                <input
                  value={businessName} onChange={e => setBizName(e.target.value)}
                  placeholder="Toko Maju Jaya"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
            <div>
              <label className="text-blue-200/60 text-xs mb-1 block">WhatsApp</label>
              <input
                value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
        </div>

        {/* Package selector */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Pilih Paket</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(PACKAGES).map(([key, pkg]) => {
              const selected = pkgType === key;
              return (
                <button
                  key={key} onClick={() => setPkgType(key)}
                  className={`relative text-left p-4 rounded-xl border transition-all ${
                    selected
                      ? "bg-blue-600/15 border-blue-500/50"
                      : "glass border-white/8 hover:border-white/20"
                  }`}
                >
                  {selected && (
                    <span className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                  <p className="text-white font-semibold text-sm mb-0.5">{pkg.label}</p>
                  <p className="text-blue-200/50 text-xs mb-2">{pkg.desc}</p>
                  <p className="text-blue-400 font-bold text-sm">
                    {key === "custom" ? "Sesuai item" : formatRp(pkg.price)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Addons */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Fitur Tambahan (Add-on)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableAddons.map(addon => {
              const on = addons.has(addon.id);
              return (
                <button
                  key={addon.id} onClick={() => toggleAddon(addon.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    on ? "bg-blue-600/15 border-blue-500/40" : "glass border-white/8 hover:border-white/20"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    on ? "bg-blue-600 border-blue-500" : "border-white/20"
                  }`}>
                    {on && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${on ? "text-white" : "text-blue-200/80"}`}>{addon.label}</p>
                    <p className="text-blue-400 text-xs">+{formatRp(addon.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom items */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-blue-200/60 text-sm">Item Custom</p>
              <button onClick={addCustomItem} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Tambah Item
              </button>
            </div>
            {customItems.length === 0 && (
              <p className="text-blue-200/30 text-xs">Belum ada item custom.</p>
            )}
            {customItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  value={item.label}
                  onChange={e => updateCustomItem(idx, "label", e.target.value)}
                  placeholder="Nama layanan"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:border-blue-500/50"
                />
                <input
                  type="number"
                  value={item.price || ""}
                  onChange={e => updateCustomItem(idx, "price", parseInt(e.target.value) || 0)}
                  placeholder="Harga"
                  className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:border-blue-500/50"
                />
                <button onClick={() => removeCustomItem(idx)} className="p-2 text-red-400/60 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Detail Proposal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-blue-200/60 text-xs mb-1 block">Estimasi Timeline</label>
              <select
                value={timeline} onChange={e => setTimeline(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
              >
                {TIMELINES.map(t => <option key={t} value={t} className="bg-[#0a1628]">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-blue-200/60 text-xs mb-1 block">Berlaku Hingga (opsional)</label>
              <input
                type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-blue-200/60 text-xs mb-1 block">Catatan Tambahan (opsional)</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Misal: harga sudah termasuk domain .com 1 tahun, revisi 3x..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm px-1">{error}</p>}
      </div>

      {/* ── Right: Summary ──────────────────────────────────────────────────── */}
      <div className="lg:col-span-1">
        <div className="glass rounded-2xl p-5 sticky top-24">
          <h3 className="text-white font-semibold mb-4">Ringkasan Harga</h3>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-blue-200/60 truncate max-w-[60%]">{basePkg?.label}</span>
              <span className="text-white font-medium">{formatRp(basePrice)}</span>
            </div>
            {[...addons].map(id => {
              const a = ADDONS.find(x => x.id === id)!;
              return (
                <div key={id} className="flex justify-between text-sm">
                  <span className="text-blue-200/50 truncate max-w-[60%]">+ {a.label}</span>
                  <span className="text-blue-400">+{formatRp(a.price)}</span>
                </div>
              );
            })}
            {customItems.filter(c => c.label).map((c, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-blue-200/50 truncate max-w-[60%]">+ {c.label}</span>
                <span className="text-blue-400">+{formatRp(c.price)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 mb-5">
            <div className="flex justify-between items-baseline">
              <span className="text-blue-200/60 text-sm">Total Estimasi</span>
              <span className="text-white font-black text-2xl">{formatRp(total)}</span>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={pending}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11 font-semibold mb-2"
          >
            {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan & Lihat Proposal"}
          </Button>
          <p className="text-blue-200/30 text-xs text-center">PDF bisa didownload setelah tersimpan</p>
        </div>
      </div>
    </div>
  );
}
