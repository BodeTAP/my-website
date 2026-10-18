"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Building2,
  ShoppingCart,
  Check,
  ArrowRight,
  MessageCircle,
  Info,
  LayoutDashboard,
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
  note?: string;
};

const TYPES: WebsiteType[] = [
  {
    id: "landing",
    icon: Megaphone,
    label: "Landing Page",
    desc: "1 halaman spesifik untuk kampanye iklan & konversi promosi",
    baseMin: 800_000,
    baseMax: 800_000,
  },
  {
    id: "compro-simple",
    icon: Building2,
    label: "Company Profile Standar",
    desc: "3–4 halaman profil perusahaan profesional dan terstruktur",
    baseMin: 1_500_000,
    baseMax: 1_500_000,
  },
  {
    id: "compro-pro",
    icon: Building2,
    label: "Company Profile Eksekutif",
    desc: "5–7 halaman dengan desain custom eksklusif & fitur lengkap",
    baseMin: 3_500_000,
    baseMax: 3_500_000,
  },
  {
    id: "toko",
    icon: ShoppingCart,
    label: "E-Commerce / Toko Online",
    desc: "Sistem katalog & checkout terintegrasi pembayaran otomatis",
    baseMin: 5_400_000,
    baseMax: 5_400_000,
    note: "Termasuk integrasi Payment Gateway & Kurir",
  },
  {
    id: "app-web",
    icon: LayoutDashboard,
    label: "Web App / Sistem Custom",
    desc: "Sistem operasional kasir, booking, member, atau portal khusus",
    baseMin: 5_000_000,
    baseMax: 15_000_000,
    note: "Memerlukan diskusi teknis mendalam",
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
  { id: "blog",       label: "Sistem Blog & Artikel",       desc: "Fitur kelola artikel untuk optimasi SEO organik",   price: 300_000, incompatible: ["landing"] },
  { id: "booking",    label: "Sistem Booking Jadwal",       desc: "Form reservasi jadwal yang terhubung ke kalender", price: 700_000, incompatible: ["landing"] },
  { id: "catalog",    label: "Katalog Produk Interaktif",   desc: "Halaman grid produk dengan filter dan pencarian",  price: 500_000, only: ["compro-simple", "compro-pro"] },
  { id: "multilang",  label: "Dukungan Multi-Bahasa",       desc: "Website bilingual (Bahasa Indonesia & Inggris)",   price: 500_000, incompatible: ["landing"] },
  { id: "livechat",   label: "Widget Live Chat",            desc: "Widget percakapan melayang di sudut halaman",      price: 200_000 },
  { id: "member",     label: "Area Portal Member",          desc: "Sistem login autentikasi untuk klien khusus",     price: 1_500_000, incompatible: ["landing"] },
  { id: "seo-basic",  label: "Optimasi SEO Fundamental",    desc: "Penyusunan metadata, sitemap, dan keyword lokal",  price: 500_000 },
  { id: "whatsapp",   label: "Integrasi WhatsApp Cepat",    desc: "Floating CTA dan generator pesan instan otomatis", price: 300_000 },
  { id: "analytics",  label: "Setup Analytics & Pixel",     desc: "Pemasangan Google Analytics 4 dan Meta Pixel",     price: 300_000 },
  { id: "maintenance", label: "Paket Maintenance 3 Bulan",  desc: "Dukungan teknis dan pembaruan minor 3 bulan",      price: 900_000 },
];

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
    ? `Halo Tim MFWEB,\n\nSaya ingin berkonsultasi mengenai pembuatan ${isApp ? "Aplikasi Web / Sistem Custom" : "Website baru"}.\n\nBerikut ringkasan hasil kalkulator web:\n- Model Website: *${type.label}*\n- Fitur Tambahan: ${selectedAddons.size > 0 ? "*" + [...selectedAddons].map((id) => ADDONS.find((a) => a.id === id)?.label).join(", ") + "*" : "_Tanpa Fitur Tambahan_"}\n- Estimasi Anggaran: *${formatRp(total)}*\n\nMohon informasi langkah selanjutnya untuk mendiskusikan teknis proyek ini.`
    : "Halo Tim MFWEB, saya ingin konsultasi layanan pembuatan website.";

  return (
    <div className="space-y-8">
      {/* Step 1 — Pilih Model Website */}
      <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-10 shadow-xs">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
            01
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Pilih Model Website</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Pilih tipe website yang paling sesuai dengan target bisnis Anda saat ini.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TYPES.map((t) => {
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTypeSelect(t.id)}
                className={`relative p-5 sm:p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}>
                  <t.icon className="w-5 h-5" />
                </div>
                <h3 className="text-slate-900 font-bold text-base mb-1">{t.label}</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4 min-h-[32px]">{t.desc}</p>
                
                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-mono text-xs font-semibold">
                  {t.baseMin === t.baseMax ? formatRp(t.baseMin) : `Mulai ${formatRp(t.baseMin)}`}
                </div>
                {t.note && (
                  <p className="text-slate-400 text-[10px] mt-3 font-mono uppercase tracking-wider">{t.note}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — Kustomisasi Fitur Tambahan */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-10 shadow-xs"
          >
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
                02
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Fitur Fungsional Tambahan</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Pilih modul opsional untuk memperkuat fungsionalitas website Anda.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {availableAddons.map((addon) => {
                const isOn = selectedAddons.has(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isOn 
                        ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-xs" 
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                      isOn ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {isOn && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <span className={`text-sm font-bold tracking-tight ${isOn ? "text-slate-900" : "text-slate-800"}`}>
                          {addon.label}
                        </span>
                        <span className="text-slate-700 font-mono text-xs font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          +{formatRp(addon.price)}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">{addon.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3 — Ringkasan & Kalkulasi Anggaran */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-7 sm:p-10"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Kalkulasi Anggaran</h2>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm max-w-sm">
                  Estimasi investasi digital berdasarkan konfigurasi tipe dan modul yang Anda pilih.
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Total Estimasi Investasi
                </p>
                <motion.p
                  key={total}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-tight"
                >
                  {formatRp(total)}
                </motion.p>
                {addonTotal > 0 && (
                  <div className="inline-flex items-center gap-2 mt-3 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
                    <span>Basis: {formatRp(type!.baseMin)}</span>
                    <span className="text-slate-600">|</span>
                    <span>Fitur: +{formatRp(addonTotal)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown List */}
            {selectedAddons.size > 0 && (
              <div className="mt-6 space-y-2.5">
                <div className="flex justify-between items-center text-xs sm:text-sm p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300 font-medium">{type?.label} (Pondasi Utama)</span>
                  <span className="text-white font-mono font-semibold">{formatRp(type!.baseMin)}</span>
                </div>
                {[...selectedAddons].map((id) => {
                  const a = ADDONS.find((x) => x.id === id);
                  if (!a) return null;
                  return (
                    <div key={id} className="flex justify-between items-center text-xs sm:text-sm p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                      <span className="text-slate-300">{a.label}</span>
                      <span className="text-slate-300 font-mono font-medium">+{formatRp(a.price)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-3 mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs leading-relaxed text-slate-400">
              <Info className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Catatan:</strong> Kalkulasi ini adalah perkiraan awal. Biaya final disepakati bersama setelah sesi diskusi kebutuhan. Estimasi sudah mencakup <strong className="text-slate-200">Domain .com (1 tahun), Hosting, dan SSL aktif.</strong>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3.5 mt-8">
              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 h-12 rounded-full font-medium text-sm transition-colors cursor-pointer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Kunci Estimasi Ini via WhatsApp
                </Button>
              </a>
              <Link href="/contact" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white h-12 rounded-full font-medium text-sm transition-colors cursor-pointer"
                >
                  Kirim Brief Rinci via Formulir
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty helper state */}
      {!selectedType && (
        <div className="text-center py-6">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Pilih model website pada langkah 01 di atas untuk melanjutkan
          </p>
        </div>
      )}
    </div>
  );
}
