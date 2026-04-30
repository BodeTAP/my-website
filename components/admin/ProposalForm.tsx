"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2, Loader2, Sparkles, Building2, Package, LayoutGrid, Calendar, Receipt, UserSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/public/motion";

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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative items-start">
      {/* ── Left: Form ─────────────────────────────────────────────────────── */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Client info */}
        <FadeUp delay={0.1} className="glass rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] pointer-events-none" />
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs ring-1 ring-blue-500/30">1</span>
            Informasi Klien
          </h3>
          <div className="space-y-5 relative z-10">
            <div>
              <label className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider mb-2 block">Pilih Dari Leads (Opsional)</label>
              <div className="relative">
                <select
                  value={leadId}
                  onChange={e => setLeadId(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500/50 appearance-none focus:ring-1 focus:ring-teal-500/50 transition-all cursor-pointer"
                >
                  <option value="" className="bg-[#0a1628]">— Isi Manual —</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id} className="bg-[#0a1628]">
                      {l.businessName} ({l.name})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <UserSearch className="w-4 h-4 text-blue-200/40" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider block">Nama Kontak *</label>
                <input
                  value={clientName} onChange={e => setClientName(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/20 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider block">Nama Bisnis *</label>
                <input
                  value={businessName} onChange={e => setBizName(e.target.value)}
                  placeholder="Misal: PT Karya Maju"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/20 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider block">WhatsApp</label>
              <input
                value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/20 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-mono"
              />
            </div>
          </div>
        </FadeUp>

        {/* Package selector */}
        <FadeUp delay={0.2} className="glass rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none" />
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs ring-1 ring-emerald-500/30">2</span>
            Paket Utama
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            {Object.entries(PACKAGES).map(([key, pkg]) => {
              const selected = pkgType === key;
              return (
                <button
                  key={key} onClick={() => setPkgType(key)}
                  className={`relative text-left p-5 rounded-2xl border transition-all overflow-hidden ${
                    selected
                      ? "bg-emerald-600/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                      : "bg-black/20 border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {selected && (
                    <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-bl-2xl">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  <p className={`font-bold text-[15px] mb-1 ${selected ? "text-emerald-300" : "text-white"}`}>{pkg.label}</p>
                  <p className="text-blue-200/50 text-xs mb-3 pr-4 leading-relaxed h-8">{pkg.desc}</p>
                  <div className="mt-auto">
                    <p className={`font-black text-lg ${selected ? "text-white" : "text-blue-400"}`}>
                      {key === "custom" ? "Fleksibel" : formatRp(pkg.price)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </FadeUp>

        {/* Addons */}
        <FadeUp delay={0.3} className="glass rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] pointer-events-none" />
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
            <span className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs ring-1 ring-purple-500/30">3</span>
            Fitur Tambahan (Add-ons)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            {availableAddons.map(addon => {
              const on = addons.has(addon.id);
              return (
                <button
                  key={addon.id} onClick={() => toggleAddon(addon.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all group ${
                    on ? "bg-purple-600/15 border-purple-500/40 ring-1 ring-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]" : "bg-black/20 border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    on ? "bg-purple-500 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]" : "border-white/20 group-hover:border-white/40"
                  }`}>
                    {on && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${on ? "text-white" : "text-blue-200/80 group-hover:text-white transition-colors"}`}>{addon.label}</p>
                    <p className={`text-xs font-medium mt-0.5 ${on ? "text-purple-300" : "text-blue-400/70"}`}>+{formatRp(addon.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom items */}
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold">Item Custom</p>
                <p className="text-blue-200/40 text-xs mt-0.5">Layanan di luar paket standar.</p>
              </div>
              <Button onClick={addCustomItem} size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl h-9">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {customItems.length === 0 && (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl bg-black/20">
                  <p className="text-blue-200/30 text-sm">Tidak ada item custom.</p>
                </div>
              )}
              {customItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 bg-black/20 p-2 sm:p-1.5 rounded-2xl border border-white/10">
                  <input
                    value={item.label}
                    onChange={e => updateCustomItem(idx, "label", e.target.value)}
                    placeholder="Nama layanan (misal: Setup Server VPS)"
                    className="flex-1 bg-transparent border-none px-3 py-2 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:ring-1 focus:ring-white/10 rounded-xl"
                  />
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/40 text-sm font-medium">Rp</span>
                      <input
                        type="number"
                        value={item.price || ""}
                        onChange={e => updateCustomItem(idx, "price", parseInt(e.target.value) || 0)}
                        placeholder="Harga"
                        className="w-full sm:w-36 bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                    <button onClick={() => removeCustomItem(idx)} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Details */}
        <FadeUp delay={0.4} className="glass rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] pointer-events-none" />
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs ring-1 ring-amber-500/30">4</span>
            Detail Eksekusi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 relative z-10">
            <div className="space-y-2">
              <label className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider block">Estimasi Timeline</label>
              <div className="relative">
                <select
                  value={timeline} onChange={e => setTimeline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500/50 appearance-none focus:ring-1 focus:ring-teal-500/50 transition-all cursor-pointer"
                >
                  {TIMELINES.map(t => <option key={t} value={t} className="bg-[#0a1628]">{t}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Calendar className="w-4 h-4 text-blue-200/40" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider block">Berlaku Hingga</label>
              <input
                type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            <label className="text-blue-200/60 text-xs font-semibold uppercase tracking-wider block">Syarat & Ketentuan / Catatan (Opsional)</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Tambahkan catatan khusus untuk klien di sini..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 resize-none transition-all"
            />
          </div>
        </FadeUp>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-red-400 font-bold text-xs">!</span>
            </div>
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* ── Right: Summary Fixed Panel ────────────────────────────────────────── */}
      <div className="xl:col-span-1">
        <div className="glass rounded-3xl p-6 border border-white/5 sticky top-24 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none opacity-50" />
          
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
            <Receipt className="w-5 h-5 text-teal-400" />
            Kalkulasi Biaya
          </h3>

          <div className="space-y-4 mb-6 relative z-10">
            <div className="flex justify-between items-start text-sm">
              <div className="flex items-start gap-2 max-w-[65%]">
                <Package className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-white font-medium leading-snug">{basePkg?.label}</span>
              </div>
              <span className="text-white font-bold whitespace-nowrap">{formatRp(basePrice)}</span>
            </div>
            
            {[...addons].map(id => {
              const a = ADDONS.find(x => x.id === id)!;
              return (
                <div key={id} className="flex justify-between items-start text-sm pl-6">
                  <span className="text-blue-200/60 leading-snug pr-4">+ {a.label}</span>
                  <span className="text-purple-300 whitespace-nowrap">+{formatRp(a.price)}</span>
                </div>
              );
            })}
            
            {customItems.filter(c => c.label).map((c, i) => (
              <div key={i} className="flex justify-between items-start text-sm pl-6">
                <span className="text-blue-200/60 leading-snug pr-4">+ {c.label}</span>
                <span className="text-purple-300 whitespace-nowrap">+{formatRp(c.price)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-5 mb-6 relative z-10">
            <div className="flex justify-between items-end">
              <span className="text-blue-200/60 text-sm font-medium uppercase tracking-wider mb-1">Total Estimasi</span>
              <span className="text-white font-black text-3xl bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-md">
                {formatRp(total)}
              </span>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={pending}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white h-12 rounded-xl font-bold shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all relative z-10"
          >
            {pending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sedang Menyimpan...</> : "Simpan Proposal"}
          </Button>
          <p className="text-blue-200/30 text-[11px] text-center mt-3 font-medium relative z-10">
            Anda dapat mengunduh PDF atau membagikan link <br/>setelah proposal tersimpan.
          </p>
        </div>
      </div>
    </div>
  );
}
