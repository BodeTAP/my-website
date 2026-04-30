"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

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
  const [mounted, setMounted] = useState(false);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [clientId, setClientId]       = useState("");
  const [invoiceNo, setInvoiceNo]     = useState(generateInvoiceNo());
  const [dueDate, setDueDate]         = useState("");
  const [whatsappMsg, setWhatsappMsg] = useState("");
  const [lineItems, setLineItems]     = useState<LineItem[]>([{ label: "", amount: 0 }]);

  useEffect(() => setMounted(true), []);

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

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setOpen(false)} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative glass rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl shadow-black/80 border border-white/10"
            style={{ background: "rgba(5, 11, 20, 0.95)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-10 bg-white/5">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 ring-1 ring-teal-500/20 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl leading-none mb-1.5 tracking-tight">Invoice Baru</h2>
                  <p className="text-blue-200/50 text-sm">Buat tagihan resmi untuk klien.</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-blue-200/40 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-6 relative z-10">
              
              {/* Klien */}
              <div>
                <Label className="text-blue-200 font-medium text-sm mb-2 block">Kepada Klien <span className="text-teal-400">*</span></Label>
                <select required value={clientId} onChange={e => handleClientChange(e.target.value)}
                  className="w-full h-11 rounded-xl px-4 text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all cursor-pointer"
                >
                  <option value="" className="bg-[#0d1b35]">— Pilih entitas klien —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#0d1b35]">
                      {c.businessName} ({c.user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* No + Due */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-blue-200 font-medium text-sm mb-2 block">No. Referensi Invoice <span className="text-teal-400">*</span></Label>
                  <Input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} required
                    className="bg-white/5 border-white/10 text-white font-mono text-sm h-11 rounded-xl focus:border-teal-500/50 focus:ring-teal-500/50" />
                </div>
                <div>
                  <Label className="text-blue-200 font-medium text-sm mb-2 block">Batas Waktu Pembayaran (Jatuh Tempo)</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="bg-white/5 border-white/10 text-white [color-scheme:dark] h-11 rounded-xl focus:border-teal-500/50 focus:ring-teal-500/50" />
                </div>
              </div>

              {/* Line items */}
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <div className="flex items-start sm:items-center justify-between mb-4 flex-col sm:flex-row gap-3">
                  <Label className="text-white font-semibold text-base">Rincian Tagihan <span className="text-teal-400">*</span></Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select onChange={e => { const p = PACKAGE_PRESETS[parseInt(e.target.value)]; if (p) applyPackagePreset(p); e.target.value = ""; }}
                      defaultValue=""
                      className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-teal-300 font-medium focus:outline-none cursor-pointer transition-colors"
                    >
                      <option value="" className="bg-[#0d1b35]">+ Preset Paket</option>
                      {PACKAGE_PRESETS.map((p, i) => <option key={i} value={i} className="bg-[#0d1b35]">{p.label}</option>)}
                    </select>
                    <select onChange={e => { const a = ADDON_PRESETS[parseInt(e.target.value)]; if (a) addAddonPreset(a); e.target.value = ""; }}
                      defaultValue=""
                      className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-teal-300 font-medium focus:outline-none cursor-pointer transition-colors"
                    >
                      <option value="" className="bg-[#0d1b35]">+ Preset Add-on</option>
                      {ADDON_PRESETS.map((a, i) => <option key={i} value={i} className="bg-[#0d1b35]">{a.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item, i) => (
                    <div key={i} className="flex gap-2 sm:gap-3 items-center group/item">
                      <input
                        value={item.label}
                        onChange={e => updateItem(i, "label", e.target.value)}
                        placeholder="Nama layanan / deskripsi item"
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-blue-200/20 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                      />
                      <div className="relative w-28 sm:w-40 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/40 text-xs font-medium pointer-events-none">Rp</span>
                        <input
                          value={displayRp(item.amount)}
                          onChange={e => updateItem(i, "amount", e.target.value)}
                          placeholder="0"
                          className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm placeholder:text-blue-200/20 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 text-right font-medium transition-all"
                        />
                      </div>
                      <button type="button" onClick={() => removeItem(i)}
                        disabled={lineItems.length === 1}
                        className="p-2 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shrink-0 disabled:opacity-20 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addItem} className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors flex items-center gap-1.5 pt-2 px-1">
                    <Plus className="w-4 h-4" /> Tambah baris item
                  </button>
                </div>

                {/* Total */}
                <div className="flex justify-between items-end mt-6 pt-5 border-t border-white/10">
                  <span className="text-blue-200/50 text-sm font-medium uppercase tracking-wider">Total Tagihan Keseluruhan</span>
                  <span className="text-white font-black text-2xl tracking-tight">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* WA message */}
              <div>
                <Label className="text-blue-200 font-medium text-sm mb-2 block flex items-center gap-2">
                  Template Pesan WhatsApp
                  <span className="text-blue-200/30 text-xs font-normal border border-white/10 px-2 py-0.5 rounded-full bg-white/5">Otomatisasi</span>
                </Label>
                <Textarea value={whatsappMsg} onChange={e => setWhatsappMsg(e.target.value)}
                  rows={4} placeholder="Pesan pengantar tagihan yang akan dikirim via WhatsApp... (Akan terisi otomatis saat memilih klien)"
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/20 resize-none text-sm rounded-xl focus:border-teal-500/50 focus:ring-teal-500/50 leading-relaxed"
                />
              </div>

              {error && (
                <motion.p initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" /> {error}
                </motion.p>
              )}

            </form>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3 shrink-0">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-blue-200/70 hover:text-white hover:bg-white/10 rounded-xl px-6 h-11">
                Batal
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={loading} className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl px-8 h-11 font-bold shadow-[0_0_20px_rgba(13,148,136,0.3)] transition-all">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Terbitkan Invoice"}
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Button onClick={handleOpen} className="bg-teal-600 hover:bg-teal-500 text-white h-11 px-6 rounded-xl font-semibold shadow-[0_0_20px_rgba(13,148,136,0.3)] hover:shadow-[0_0_30px_rgba(13,148,136,0.5)] transition-all hover:-translate-y-0.5">
        <Plus className="w-5 h-5 mr-2" />
        Buat Tagihan Baru
      </Button>

      {mounted ? createPortal(modalContent, document.body) : null}
    </>
  );
}
