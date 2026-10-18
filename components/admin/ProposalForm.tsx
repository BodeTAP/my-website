"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2, Loader2, Package, Calendar, Receipt, UserSearch } from "lucide-react";
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
  const defaultLead = defaultLeadId ? leads.find((lead) => lead.id === defaultLeadId) : undefined;
  const [leadId, setLeadId]           = useState(defaultLeadId ?? "");
  const [clientName, setClientName]   = useState(defaultLead?.name ?? "");
  const [businessName, setBizName]    = useState(defaultLead?.businessName ?? "");
  const [whatsapp, setWhatsapp]       = useState(defaultLead?.whatsapp ?? "");

  // Package
  const [pkgType, setPkgType]         = useState("compro-pro");
  const [addons, setAddons]           = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<LineItem[]>([]);

  // Details
  const [timeline, setTimeline]       = useState("2–3 minggu");
  const [validUntil, setValidUntil]   = useState("");
  const [notes, setNotes]             = useState("");
  const [error, setError]             = useState("");

  const basePkg = PACKAGES[pkgType];
  const basePrice   = basePkg?.price ?? 0;
  const addonTotal  = [...addons].reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price ?? 0), 0);
  const customTotal = customItems.reduce((s, i) => s + (i.price || 0), 0);
  const total       = basePrice + addonTotal + customTotal;

  function toggleAddon(id: string) {
    setAddons(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function selectLead(nextLeadId: string) {
    setLeadId(nextLeadId);
    const lead = leads.find((item) => item.id === nextLeadId);
    if (!lead) return;
    setClientName(lead.name);
    setBizName(lead.businessName);
    setWhatsapp(lead.whatsapp);
  }

  function selectPackage(nextPkgType: string) {
    setPkgType(nextPkgType);
    setAddons(prev => {
      const next = new Set(prev);
      for (const id of next) {
        const addon = ADDONS.find((item) => item.id === id);
        if (addon?.incompatible?.includes(nextPkgType)) next.delete(id);
      }
      return next;
    });
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
        <FadeUp delay={0.1} className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <h3 className="text-slate-900 font-bold text-lg mb-5 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">1</span>
            Informasi Klien
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-slate-900 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Pilih Dari Leads (Opsional)</label>
              <div className="relative">
                <select
                  value={leadId}
                  onChange={e => selectLead(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-slate-900 appearance-none focus:ring-1 focus:ring-slate-900 transition-all cursor-pointer"
                >
                  <option value="" className="bg-white text-slate-500">— Isi Manual —</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id} className="bg-white text-slate-900">
                      {l.businessName} ({l.name})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <UserSearch className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-900 text-xs font-semibold uppercase tracking-wider block">Nama Kontak *</label>
                <input
                  value={clientName} onChange={e => setClientName(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-900 text-xs font-semibold uppercase tracking-wider block">Nama Bisnis *</label>
                <input
                  value={businessName} onChange={e => setBizName(e.target.value)}
                  placeholder="Misal: PT Karya Maju"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-slate-900 text-xs font-semibold uppercase tracking-wider block">WhatsApp</label>
              <input
                value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-mono"
              />
            </div>
          </div>
        </FadeUp>

        {/* Package selector */}
        <FadeUp delay={0.2} className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <h3 className="text-slate-900 font-bold text-lg mb-5 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">2</span>
            Paket Utama
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(PACKAGES).map(([key, pkg]) => {
              const selected = pkgType === key;
              return (
                <button
                  key={key} onClick={() => selectPackage(key)}
                  className={`relative text-left p-4 sm:p-5 rounded-2xl border transition-all ${
                    selected
                      ? "bg-[#1E242E] border-slate-900 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {selected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <p className={`font-bold text-sm mb-1 ${selected ? "text-white" : "text-slate-900"}`}>{pkg.label}</p>
                  <p className={`text-xs mb-3 pr-4 leading-relaxed ${selected ? "text-slate-300" : "text-slate-500"}`}>{pkg.desc}</p>
                  <div className="mt-auto">
                    <p className={`font-bold text-base ${selected ? "text-white" : "text-slate-900"}`}>
                      {key === "custom" ? "Fleksibel" : formatRp(pkg.price)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </FadeUp>

        {/* Addons */}
        <FadeUp delay={0.3} className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <h3 className="text-slate-900 font-bold text-lg mb-5 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">3</span>
            Fitur Tambahan (Add-ons)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableAddons.map(addon => {
              const on = addons.has(addon.id);
              return (
                <button
                  key={addon.id} onClick={() => toggleAddon(addon.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    on ? "bg-slate-900 text-white border-slate-900 shadow-xs" : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    on ? "bg-white text-slate-900 border-white" : "border-slate-300 bg-white"
                  }`}>
                    {on && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${on ? "text-white" : "text-slate-900"}`}>{addon.label}</p>
                    <p className={`text-[11px] font-medium mt-0.5 ${on ? "text-slate-300" : "text-slate-500"}`}>+{formatRp(addon.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom items */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <p className="text-slate-900 font-bold text-sm">Item Custom</p>
                <p className="text-slate-500 text-xs">Layanan di luar paket standar.</p>
              </div>
              <Button onClick={addCustomItem} size="sm" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl h-8 text-xs font-semibold shadow-2xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Item
              </Button>
            </div>
            
            <div className="space-y-2.5">
              {customItems.length === 0 && (
                <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-slate-400 text-xs">Tidak ada item custom.</p>
                </div>
              )}
              {customItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <input
                    value={item.label}
                    onChange={e => updateCustomItem(idx, "label", e.target.value)}
                    placeholder="Nama layanan (misal: Setup Server VPS)"
                    className="flex-1 bg-white border border-slate-200 px-3 py-2 text-slate-900 text-xs rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                  />
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">Rp</span>
                      <input
                        type="number"
                        value={item.price || ""}
                        onChange={e => updateCustomItem(idx, "price", parseInt(e.target.value) || 0)}
                        placeholder="Harga"
                        className="w-full sm:w-32 bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-2 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-slate-900 font-semibold"
                      />
                    </div>
                    <button onClick={() => removeCustomItem(idx)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Details */}
        <FadeUp delay={0.4} className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <h3 className="text-slate-900 font-bold text-lg mb-5 flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">4</span>
            Detail Eksekusi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-slate-900 text-xs font-semibold uppercase tracking-wider block">Estimasi Timeline</label>
              <div className="relative">
                <select
                  value={timeline} onChange={e => setTimeline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-slate-900 appearance-none focus:ring-1 focus:ring-slate-900 transition-all cursor-pointer"
                >
                  {TIMELINES.map(t => <option key={t} value={t} className="bg-white text-slate-900">{t}</option>)}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-900 text-xs font-semibold uppercase tracking-wider block">Berlaku Hingga</label>
              <input
                type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-900 text-xs font-semibold uppercase tracking-wider block">Syarat & Ketentuan / Catatan (Opsional)</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Tambahkan catatan khusus untuk klien di sini..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none transition-all"
            />
          </div>
        </FadeUp>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-rose-200 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-rose-700 font-bold text-xs">!</span>
            </div>
            <p className="text-rose-700 text-xs sm:text-sm font-semibold">{error}</p>
          </div>
        )}
      </div>

      {/* ── Right: Summary Fixed Panel ────────────────────────────────────────── */}
      <div className="xl:col-span-1">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 sticky top-24 shadow-xs">
          <h3 className="text-slate-900 font-bold text-base mb-5 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-800" />
            Kalkulasi Biaya
          </h3>

          <div className="space-y-3.5 mb-5">
            <div className="flex justify-between items-start text-xs sm:text-sm">
              <div className="flex items-start gap-2 max-w-[65%]">
                <Package className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <span className="text-slate-900 font-medium leading-snug">{basePkg?.label}</span>
              </div>
              <span className="text-slate-900 font-bold whitespace-nowrap">{formatRp(basePrice)}</span>
            </div>
            
            {[...addons].map(id => {
              const a = ADDONS.find(x => x.id === id)!;
              return (
                <div key={id} className="flex justify-between items-start text-xs pl-6">
                  <span className="text-slate-500 leading-snug pr-4">+ {a.label}</span>
                  <span className="text-slate-900 font-semibold whitespace-nowrap">+{formatRp(a.price)}</span>
                </div>
              );
            })}
            
            {customItems.filter(c => c.label).map((c, i) => (
              <div key={i} className="flex justify-between items-start text-xs pl-6">
                <span className="text-slate-500 leading-snug pr-4">+ {c.label}</span>
                <span className="text-slate-900 font-semibold whitespace-nowrap">+{formatRp(c.price)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 mb-5">
            <div className="flex justify-between items-end">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Estimasi</span>
              <span className="text-slate-900 font-bold text-2xl tracking-tight">
                {formatRp(total)}
              </span>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={pending}
            className="w-full bg-[#1E242E] hover:bg-slate-800 text-white h-11 rounded-xl font-semibold shadow-xs transition-colors"
          >
            {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan Proposal"}
          </Button>
          <p className="text-slate-400 text-[11px] text-center mt-3 font-medium">
            Anda dapat mengunduh PDF atau membagikan link setelah proposal tersimpan.
          </p>
        </div>
      </div>
    </div>
  );
}
