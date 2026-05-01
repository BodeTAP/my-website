"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Building2, ShoppingCart, Check,
  ArrowRight, MessageCircle, Info, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343";

type WebsiteType = {
  id: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  baseMin: number;
  baseMax: number;
  color: string;
  note?: string;
};

const TYPES: WebsiteType[] = [
  {
    id: "landing",
    icon: Megaphone,
    label: "Landing Page",
    desc: "1 halaman spesifik untuk iklan & konversi promosi",
    baseMin: 800_000,
    baseMax: 800_000,
    color: "blue",
  },
  {
    id: "compro-simple",
    icon: Building2,
    label: "Company Profile Standar",
    desc: "3–4 halaman untuk profil perusahaan profesional",
    baseMin: 1_500_000,
    baseMax: 1_500_000,
    color: "indigo",
  },
  {
    id: "compro-pro",
    icon: Building2,
    label: "Company Profile Eksekutif",
    desc: "5–7 halaman dengan desain custom eksklusif",
    baseMin: 3_500_000,
    baseMax: 3_500_000,
    color: "purple",
  },
  {
    id: "toko",
    icon: ShoppingCart,
    label: "E-Commerce / Toko Online",
    desc: "Sistem toko lengkap siap menerima pesanan",
    baseMin: 5_400_000,
    baseMax: 5_400_000,
    color: "teal",
    note: "Termasuk integrasi Payment Gateway & Kurir",
  },
  {
    id: "app-web",
    icon: LayoutDashboard,
    label: "Web App / Custom Sistem",
    desc: "Sistem kasir, booking, member, atau portal khusus",
    baseMin: 5_000_000,
    baseMax: 15_000_000,
    color: "violet",
    note: "Memerlukan konsultasi mendalam",
  },
];

type Addon = {
  id: string;
  label: string;
  desc: string;
  price: number;
  incompatible?: string[];
  only?: string[];
};

const ADDONS: Addon[] = [
  { id: "blog",       label: "Sistem Blog & Artikel",       desc: "Fitur kelola konten untuk mendongkrak SEO organik",   price: 300_000, incompatible: ["landing"] },
  { id: "booking",    label: "Sistem Booking Pintar",       desc: "Form jadwal reservasi yang sinkron dengan kalender",    price: 700_000, incompatible: ["landing"] },
  { id: "catalog",    label: "Katalog Produk Interaktif",   desc: "Halaman grid produk dengan filter dan pencarian",       price: 500_000, only: ["compro-simple", "compro-pro"] },
  { id: "multilang",  label: "Website Multi-Bahasa",        desc: "Dukungan Bahasa Indonesia & Inggris (Bilingual)",       price: 500_000, incompatible: ["landing"] },
  { id: "livechat",   label: "Widget Live Chat",            desc: "Fitur chat melayang (Crisp/Tawk.to) di sudut web",      price: 200_000 },
  { id: "member",     label: "Portal Area Member",          desc: "Sistem login untuk pelanggan khusus atau karyawan",     price: 1_500_000, incompatible: ["landing"] },
  { id: "seo-basic",  label: "Optimasi SEO Fundamental",    desc: "Audit performa, meta tags, dan injeksi keyword lokal",  price: 500_000 },
  { id: "whatsapp",   label: "Integrasi WhatsApp Business", desc: "Tombol CTA mengambang dan template pesan instan",       price: 300_000 },
  { id: "analytics",  label: "Setup Analytics & Pixel",     desc: "Pemasangan Google Analytics 4 dan Facebook Pixel",      price: 300_000 },
  { id: "maintenance", label: "Paket Maintenance 3 Bulan",  desc: "Garansi dukungan teknis dan update minor selama 3 bulan",price: 900_000 },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  blue:   { bg: "bg-blue-600/15",   border: "border-blue-500/50",   text: "text-blue-400",   ring: "ring-blue-500/30" },
  indigo: { bg: "bg-indigo-600/15", border: "border-indigo-500/50", text: "text-indigo-400", ring: "ring-indigo-500/30" },
  purple: { bg: "bg-purple-600/15", border: "border-purple-500/50", text: "text-purple-400", ring: "ring-purple-500/30" },
  teal:   { bg: "bg-teal-600/15",   border: "border-teal-500/50",   text: "text-teal-400",   ring: "ring-teal-500/30" },
  violet: { bg: "bg-violet-600/15", border: "border-violet-500/50", text: "text-violet-400", ring: "ring-violet-500/30" },
};

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} Juta`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function PriceCalculator() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const type = TYPES.find((t) => t.id === selectedType);

  const availableAddons = useMemo(() => {
    if (!selectedType) return [];
    return ADDONS.filter((a) => {
      if (a.incompatible?.includes(selectedType)) return false;
      if (a.only && !a.only.includes(selectedType)) return false;
      return true;
    });
  }, [selectedType]);

  const { total, addonTotal } = useMemo(() => {
    if (!type) return { total: 0, addonTotal: 0 };
    const addonTotal = [...selectedAddons].reduce((sum, id) => {
      const a = ADDONS.find((x) => x.id === id);
      return sum + (a?.price ?? 0);
    }, 0);
    return { total: type.baseMin + addonTotal, addonTotal };
  }, [type, selectedAddons]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleTypeSelect = (id: string) => {
    setSelectedType(id);
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      for (const addonId of next) {
        const a = ADDONS.find((x) => x.id === addonId);
        if (a?.incompatible?.includes(id) || (a?.only && !a.only.includes(id))) {
          next.delete(addonId);
        }
      }
      return next;
    });
  };

  const isApp = selectedType === "app-web";
  const waMessage = type
    ? `Halo Tim MFWEB,\n\nSaya ingin berkonsultasi mengenai pembuatan ${isApp ? "Aplikasi Web / Sistem Custom" : "Website baru"}.\n\nBerikut ringkasan hasil kalkulator web:\n- Kategori Platform: *${type.label}*\n- Fitur Tambahan: ${selectedAddons.size > 0 ? "*" + [...selectedAddons].map((id) => ADDONS.find((a) => a.id === id)?.label).join(", ") + "*" : "_Tanpa Fitur Tambahan_"}\n- Estimasi Awal Anggaran: *${formatRp(total)}*\n\nMohon informasi langkah selanjutnya untuk mendiskusikan teknis proyek ini.`
    : "Halo Tim MFWEB, saya ingin konsultasi layanan pembuatan website.";

  return (
    <div className="space-y-8 relative z-10">
      {/* Step 1 — Pilih tipe */}
      <div className="glass rounded-[32px] p-8 sm:p-10 border border-white/5 bg-[#050b14]/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] shrink-0">
              <span className="text-blue-400 font-black text-xl">01</span>
            </div>
            <div>
              <h2 className="text-white font-black text-2xl tracking-tight">Pilih Basis Platform</h2>
              <p className="text-blue-200/50 text-sm mt-1">Pilih pondasi utama yang paling merepresentasikan model bisnis Anda.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TYPES.map((t) => {
              const c = COLOR_MAP[t.color];
              const isSelected = selectedType === t.id;
              return (
                <motion.button
                  key={t.id}
                  onClick={() => handleTypeSelect(t.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-6 rounded-2xl border text-left transition-all duration-300 ${
                    isSelected
                      ? `${c.bg} ${c.border} ring-1 ${c.ring} shadow-[0_0_30px_rgba(0,0,0,0.3)]`
                      : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {isSelected && (
                    <motion.div layoutId="checkType" className={`absolute top-4 right-4 w-6 h-6 ${c.bg} border ${c.border} rounded-full flex items-center justify-center shadow-lg`}>
                      <Check className={`w-3.5 h-3.5 ${c.text}`} />
                    </motion.div>
                  )}
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4 border ${isSelected ? c.border : "border-transparent"}`}>
                    <t.icon className={`w-6 h-6 ${c.text}`} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{t.label}</h3>
                  <p className="text-blue-200/50 text-xs leading-relaxed mb-4 min-h-[32px]">{t.desc}</p>
                  
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isSelected ? c.bg + " " + c.border : "bg-white/5 border-white/5"}`}>
                    <span className={`font-black text-sm tracking-wide ${c.text}`}>
                      {t.baseMin === t.baseMax ? formatRp(t.baseMin) : `Mulai ${formatRp(t.baseMin)}`}
                    </span>
                  </div>
                  {t.note && <p className="text-white/30 text-[10px] mt-3 font-semibold uppercase tracking-wider">{t.note}</p>}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 2 — Add-ons */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-[32px] p-8 sm:p-10 border border-white/5 bg-[#050b14]/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] shrink-0">
                  <span className="text-indigo-400 font-black text-xl">02</span>
                </div>
                <div>
                  <h2 className="text-white font-black text-2xl tracking-tight">Kustomisasi Fitur</h2>
                  <p className="text-blue-200/50 text-sm mt-1">Pilih fitur opsional untuk memperkuat fungsionalitas platform Anda.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableAddons.map((addon) => {
                  const isOn = selectedAddons.has(addon.id);
                  return (
                    <motion.button
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-200 ${
                        isOn 
                          ? "bg-indigo-600/10 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                          : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                        isOn ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/40" : "border-white/20 bg-black/50"
                      }`}>
                        {isOn && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <span className={`text-base font-bold tracking-tight ${isOn ? "text-white" : "text-blue-200/80"}`}>{addon.label}</span>
                          <span className="text-indigo-400 text-xs font-black bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">+{formatRp(addon.price)}</span>
                        </div>
                        <p className="text-blue-200/40 text-xs leading-relaxed">{addon.desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3 — Total */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-[40px] p-8 sm:p-12 border border-blue-500/30 bg-gradient-to-br from-[#050b14] to-[#0a1128] shadow-[0_0_80px_rgba(37,99,235,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-blue-400 font-black text-xl">03</span>
                    <h2 className="text-white font-black text-2xl tracking-tight">Kalkulasi Anggaran</h2>
                  </div>
                  <p className="text-blue-200/50 text-sm max-w-sm">
                    Estimasi investasi digital yang perlu Anda persiapkan berdasarkan konfigurasi di atas.
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <motion.p
                    key={total}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter"
                  >
                    {formatRp(total)}
                  </motion.p>
                  {addonTotal > 0 && (
                    <div className="inline-flex items-center gap-2 mt-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                      <span className="text-blue-200/50 text-[10px] font-bold uppercase tracking-wider">Basis: {formatRp(type!.baseMin)}</span>
                      <span className="text-white/20 text-[10px]">|</span>
                      <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider">Fitur: {formatRp(addonTotal)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Breakdown */}
              {selectedAddons.size > 0 && (
                <div className="mt-8 space-y-3">
                  <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-blue-200/70 font-semibold">{type?.label}</span>
                    <span className="text-white font-bold">{formatRp(type!.baseMin)}</span>
                  </div>
                  {[...selectedAddons].map((id) => {
                    const a = ADDONS.find((x) => x.id === id);
                    if (!a) return null;
                    return (
                      <div key={id} className="flex justify-between items-center text-sm p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                        <span className="text-indigo-200/70">{a.label}</span>
                        <span className="text-indigo-400 font-bold">+{formatRp(a.price)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-start gap-3 mt-8 p-4 sm:p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-yellow-100/70 text-sm leading-relaxed">
                  <strong className="text-yellow-400">Disclaimer:</strong> Ini adalah kalkulasi estimasi awal. Harga final akan ditetapkan setelah sesi bedah kebutuhan secara mendalam. Biaya di atas sudah mencakup <strong className="text-white">Hosting Premium, Domain .com, dan SSL untuk 1 tahun pertama.</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white h-14 rounded-xl font-black text-base shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Kunci Penawaran Ini via WhatsApp
                  </Button>
                </a>
                <Link href="/contact" className="flex-1">
                  <Button variant="outline" className="w-full glass border-white/10 text-white hover:bg-white/5 hover:border-white/20 h-14 rounded-xl font-bold text-base transition-all">
                    Jadwalkan Konsultasi Gratis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!selectedType && (
        <div className="text-center pt-8 pb-12">
          <p className="text-blue-200/30 text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-blue-200/20" />
            Selesaikan Langkah 01 Di Atas
            <span className="w-8 h-px bg-blue-200/20" />
          </p>
        </div>
      )}
    </div>
  );
}
