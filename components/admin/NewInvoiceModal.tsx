"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Client = { id: string; businessName: string; user: { name: string | null; email: string } };
type LineItem = { label: string; amount: number };

const PACKAGE_PRESETS: { label: string; items: LineItem[] }[] = [
  { label: "Landing Page (Rp 800rb)",   items: [{ label: "Landing Page — Desain 1 Halaman",        amount: 800_000 }] },
  { label: "Compro Simple (Rp 1,5jt)", items: [{ label: "Company Profile Simple — 3-4 Halaman",   amount: 1_500_000 }] },
  { label: "Compro Pro (Rp 3,5jt)",    items: [{ label: "Company Profile Pro — 5-7 Halaman",      amount: 3_500_000 }] },
  { label: "Toko Online (Rp 5,4jt)",   items: [{ label: "Toko Online E-commerce",                 amount: 5_400_000 }] },
];

const ADDON_PRESETS: LineItem[] = [
  { label: "Blog / Artikel",              amount: 300_000 },
  { label: "Booking / Reservasi Online",  amount: 700_000 },
  { label: "SEO Optimization",            amount: 500_000 },
  { label: "Multi Bahasa",                amount: 500_000 },
  { label: "WhatsApp Business API",       amount: 800_000 },
  { label: "Setup Google Analytics + Ads",amount: 300_000 },
  { label: "Paket Maintenance 3 Bulan",   amount: 900_000 },
  { label: "Domain .com (1 Tahun)",       amount: 150_000 },
  { label: "Revisi Tambahan",             amount: 200_000 },
  { label: "DP 50%",                      amount: 0 },  // user fills amount
];

function generateInvoiceNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900) + 100;
  return `INV-${y}${m}-${rand}`;
}

function displayRp(val: number) {
  return val > 0 ? val.toLocaleString("id-ID") : "";
}

function parseRp(str: string) {
  return parseInt(str.replace(/\D/g, "") || "0", 10);
}

export default function NewInvoiceModal({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [clientId, setClientId]       = useState("");
  const [invoiceNo, setInvoiceNo]     = useState(generateInvoiceNo());
  const [dueDate, setDueDate]         = useState("");
  const [whatsappMsg, setWhatsappMsg] = useState("");
  const [lineItems, setLineItems]     = useState<LineItem[]>([{ label: "", amount: 0 }]);

  const total = lineItems.reduce((s, i) => s + (i.amount || 0), 0);

  function handleOpen() {
    setInvoiceNo(generateInvoiceNo());
    setClientId(""); setDueDate(""); setWhatsappMsg(""); setError("");
    setLineItems([{ label: "", amount: 0 }]);
    setOpen(true);
  }

  function handleClientChange(id: string) {
    setClientId(id);
    const client = clients.find(c => c.id === id);
    if (client) {
      setWhatsappMsg(
        `Halo ${client.user.name ?? client.businessName}, berikut tagihan ${invoiceNo} dari MFWEB. ` +
        `Mohon segera dikonfirmasi pembayarannya. Terima kasih.`
      );
    }
  }

  function addItem() { setLineItems(prev => [...prev, { label: "", amount: 0 }]); }
  function removeItem(i: number) { setLineItems(prev => prev.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, field: "label" | "amount", val: string) {
    setLineItems(prev => prev.map((item, idx) =>
      idx !== i ? item : { ...item, [field]: field === "amount" ? parseRp(val) : val }
    ));
  }

  function applyPackagePreset(preset: typeof PACKAGE_PRESETS[0]) {
    setLineItems(prev => {
      const empty = prev.filter(i => !i.label && !i.amount);
      return [...preset.items, ...prev.filter(i => i.label || i.amount), ...(empty.length ? [] : [{ label: "", amount: 0 }])];
    });
  }

  function addAddonPreset(addon: LineItem) {
    setLineItems(prev => {
      const empty = prev.findIndex(i => !i.label && !i.amount);
      if (empty !== -1) {
        return prev.map((item, idx) => idx === empty ? { ...addon } : item);
      }
      return [...prev, { ...addon }];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const validItems = lineItems.filter(i => i.label.trim() && i.amount > 0);
    if (validItems.length === 0) { setError("Tambahkan minimal 1 item tagihan dengan label dan jumlah."); return; }
    if (!clientId) { setError("Pilih klien terlebih dahulu."); return; }
    if (total <= 0) { setError("Total tagihan harus lebih dari 0."); return; }

    setLoading(true);
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId, invoiceNo,
        description: validItems.map(i => i.label).join(", "),
        amount: total,
        lineItems: validItems,
        dueDate: dueDate || undefined,
        whatsappMsg: whatsappMsg || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Gagal membuat invoice."); setLoading(false); return; }
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={handleOpen} className="bg-blue-600 hover:bg-blue-500 text-white">
        <Plus className="w-4 h-4 mr-2" /> Invoice Baru
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0a1628]/90 backdrop-blur z-10 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">Invoice Baru</h2>
              <button onClick={() => setOpen(false)} className="text-blue-200/50 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">

              {/* Klien */}
              <div>
                <Label className="text-blue-200 text-sm mb-1.5 block">Klien *</Label>
                <select required value={clientId} onChange={e => handleClientChange(e.target.value)}
                  className="w-full h-10 rounded-lg px-3 text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="" className="bg-[#0d1b35]">— Pilih klien —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#0d1b35]">
                      {c.businessName} ({c.user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* No + Due */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-blue-200 text-sm mb-1.5 block">No. Invoice *</Label>
                  <Input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} required
                    className="bg-white/5 border-white/10 text-white font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-blue-200 text-sm mb-1.5 block">Jatuh Tempo</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="bg-white/5 border-white/10 text-white [color-scheme:dark]" />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <Label className="text-blue-200 text-sm">Rincian Tagihan *</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Package preset */}
                    <select onChange={e => { const p = PACKAGE_PRESETS[parseInt(e.target.value)]; if (p) applyPackagePreset(p); e.target.value = ""; }}
                      defaultValue=""
                      className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-blue-300 focus:outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0d1b35]">+ Preset paket</option>
                      {PACKAGE_PRESETS.map((p, i) => <option key={i} value={i} className="bg-[#0d1b35]">{p.label}</option>)}
                    </select>
                    {/* Addon preset */}
                    <select onChange={e => { const a = ADDON_PRESETS[parseInt(e.target.value)]; if (a) addAddonPreset(a); e.target.value = ""; }}
                      defaultValue=""
                      className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-blue-300 focus:outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0d1b35]">+ Add-on</option>
                      {ADDON_PRESETS.map((a, i) => <option key={i} value={i} className="bg-[#0d1b35]">{a.label}</option>)}
                    </select>
                    <button type="button" onClick={addItem} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Item custom
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={item.label}
                        onChange={e => updateItem(i, "label", e.target.value)}
                        placeholder="Nama layanan / item"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:border-blue-500/50"
                      />
                      <div className="relative w-36 shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-200/40 text-xs pointer-events-none">Rp</span>
                        <input
                          value={displayRp(item.amount)}
                          onChange={e => updateItem(i, "amount", e.target.value)}
                          placeholder="0"
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-2 py-2 text-white text-sm placeholder:text-blue-200/30 focus:outline-none focus:border-blue-500/50 text-right"
                        />
                      </div>
                      <button type="button" onClick={() => removeItem(i)}
                        disabled={lineItems.length === 1}
                        className="p-1.5 text-red-400/50 hover:text-red-400 transition-colors shrink-0 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                  <span className="text-blue-200/60 text-sm">Total Tagihan</span>
                  <span className="text-white font-black text-xl">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* WA message */}
              <div>
                <Label className="text-blue-200 text-sm mb-1.5 block">
                  Pesan WhatsApp
                  <span className="text-blue-200/30 text-xs ml-1">(otomatis saat tagih)</span>
                </Label>
                <Textarea value={whatsappMsg} onChange={e => setWhatsappMsg(e.target.value)}
                  rows={3} placeholder="Pilih klien untuk mengisi otomatis..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 resize-none text-sm"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white min-w-30">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buat Invoice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
