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

// ── Data ─────────────────────────────────────────────────────────────────────

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
    desc: "1 halaman untuk iklan & promosi",
    baseMin: 800_000,
    baseMax: 800_000,
    color: "blue",
  },
  {
    id: "compro-simple",
    icon: Building2,
    label: "Company Profile Simple",
    desc: "3–4 halaman, desain standar profesional",
    baseMin: 1_500_000,
    baseMax: 1_500_000,
    color: "indigo",
  },
  {
    id: "compro-pro",
    icon: Building2,
    label: "Company Profile Pro",
    desc: "5–7 halaman, desain custom & modern",
    baseMin: 3_500_000,
    baseMax: 3_500_000,
    color: "purple",
  },
  {
    id: "toko",
    icon: ShoppingCart,
    label: "Toko Online",
    desc: "E-commerce lengkap siap berjualan",
    baseMin: 5_400_000,
    baseMax: 5_400_000,
    color: "teal",
    note: "Termasuk payment gateway setup",
  },
  {
    id: "app-web",
    icon: LayoutDashboard,
    label: "Aplikasi Web Bisnis",
    desc: "Kasir, booking, member, atau sistem custom",
    baseMin: 5_000_000,
    baseMax: 15_000_000,
    color: "violet",
    note: "Harga final setelah konsultasi fitur",
  },
];

type Addon = {
  id: string;
  label: string;
  desc: string;
  price: number;
  incompatible?: string[]; // type IDs that can't use this
  only?: string[];         // only available for these type IDs
};

const ADDONS: Addon[] = [
  { id: "blog",       label: "Blog / Artikel",             desc: "Kelola artikel & tips untuk SEO",              price: 300_000, incompatible: ["landing"] },
  { id: "booking",    label: "Booking / Reservasi Online",  desc: "Form jadwal appointment otomatis",              price: 700_000, incompatible: ["landing"] },
  { id: "catalog",    label: "Katalog Produk",              desc: "Halaman produk dengan filter & search",         price: 500_000, only: ["compro-simple", "compro-pro"] },
  { id: "multilang",  label: "Multi Bahasa",                desc: "Indonesia + Inggris (atau bahasa lain)",        price: 500_000, incompatible: ["landing"] },
  { id: "livechat",   label: "Live Chat Widget",            desc: "Chat langsung via Crisp atau Tawk.to",          price: 200_000 },
  { id: "member",     label: "Area Member / Login",         desc: "Halaman khusus untuk pelanggan terdaftar",      price: 1_500_000, incompatible: ["landing"] },
  { id: "seo-basic",  label: "SEO Optimization",            desc: "Audit + optimasi keyword lokal",                price: 500_000 },
  { id: "whatsapp",   label: "WhatsApp Business API",       desc: "Otomatisasi pesan & notifikasi via WA",        price: 800_000 },
  { id: "analytics",  label: "Setup Google Analytics + Ads", desc: "Tag Manager, GA4, dan pixel iklan",           price: 300_000 },
  { id: "maintenance", label: "Paket Maintenance 3 Bulan", desc: "Update konten + support teknis 3 bulan",        price: 900_000 },
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

// ── Component ─────────────────────────────────────────────────────────────────

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
    // Remove addons incompatible with new type
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
    ? `Halo MFWEB, saya ingin konsultasi pembuatan ${isApp ? "aplikasi web" : "website"}.\n\nEstimasi saya:\n- Tipe: ${type.label}\n- Fitur tambahan: ${selectedAddons.size > 0 ? [...selectedAddons].map((id) => ADDONS.find((a) => a.id === id)?.label).join(", ") : "tidak ada"}\n- Total estimasi: ${formatRp(total)}\n\nBoleh saya konsultasi lebih lanjut?`
    : "Halo MFWEB, saya ingin konsultasi layanan.";

  return (
    <div className="space-y-6">
      {/* Step 1 — Pilih tipe */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">
          <span className="text-blue-400 mr-2">01</span> Pilih Tipe Website
        </h2>
        <p className="text-blue-200/40 text-sm mb-5">Pilih yang paling sesuai dengan kebutuhan bisnis Anda.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TYPES.map((t) => {
            const c = COLOR_MAP[t.color];
            const isSelected = selectedType === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => handleTypeSelect(t.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative p-5 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? `${c.bg} ${c.border} ring-2 ${c.ring}`
                    : "glass border-white/8 hover:border-white/20"
                }`}
              >
                {isSelected && (
                  <motion.span layoutId="check" className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </motion.span>
                )}
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                  <t.icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <p className="text-white font-semibold text-sm mb-0.5">{t.label}</p>
                <p className="text-blue-200/50 text-xs mb-2">{t.desc}</p>
                <p className={`font-bold text-sm ${c.text}`}>
                  {t.baseMin === t.baseMax ? formatRp(t.baseMin) : `${formatRp(t.baseMin)} – ${formatRp(t.baseMax)}`}
                </p>
                {t.note && <p className="text-blue-200/30 text-xs mt-0.5">{t.note}</p>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — Add-ons */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-white font-semibold mb-1">
              <span className="text-blue-400 mr-2">02</span> Pilih Fitur Tambahan
            </h2>
            <p className="text-blue-200/40 text-sm mb-5">Opsional — pilih sesuai kebutuhan spesifik bisnis Anda.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableAddons.map((addon) => {
                const isOn = selectedAddons.has(addon.id);
                return (
                  <motion.button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150 ${
                      isOn ? "bg-blue-600/15 border-blue-500/40" : "glass border-white/8 hover:border-white/20"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                      isOn ? "bg-blue-600 border-blue-500" : "border-white/20"
                    }`}>
                      {isOn && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${isOn ? "text-white" : "text-blue-200/80"}`}>{addon.label}</span>
                        <span className="text-blue-400 text-xs font-semibold">+{formatRp(addon.price)}</span>
                      </div>
                      <p className="text-blue-200/40 text-xs mt-0.5">{addon.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3 — Total */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-6 border border-blue-500/20 glow-blue"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-white font-semibold mb-1">
                  <span className="text-blue-400 mr-2">03</span> Estimasi Biaya
                </h2>
                <p className="text-blue-200/40 text-sm">Harga dapat berubah setelah konsultasi detail.</p>
              </div>

              <div className="text-right">
                <motion.p
                  key={total}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl font-black text-white"
                >
                  {formatRp(total)}
                </motion.p>
                {addonTotal > 0 && (
                  <p className="text-blue-200/40 text-xs mt-1">
                    Basis {formatRp(type!.baseMin)} + fitur {formatRp(addonTotal)}
                  </p>
                )}
              </div>
            </div>

            {/* Breakdown */}
            {selectedAddons.size > 0 && (
              <div className="mt-5 pt-5 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200/50">{type?.label}</span>
                  <span className="text-blue-200/70">{formatRp(type!.baseMin)}</span>
                </div>
                {[...selectedAddons].map((id) => {
                  const a = ADDONS.find((x) => x.id === id);
                  if (!a) return null;
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-blue-200/50">+ {a.label}</span>
                      <span className="text-blue-400">+{formatRp(a.price)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5">
                  <span className="text-white">Total Estimasi</span>
                  <span className="text-white">{formatRp(total)}</span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 mt-4 p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
              <Info className="w-4 h-4 text-yellow-400/70 shrink-0 mt-0.5" />
              <p className="text-yellow-400/70 text-xs leading-relaxed">
                Ini adalah estimasi awal. Harga final ditentukan setelah konsultasi dan disesuaikan dengan kebutuhan spesifik bisnis Anda. Semua paket sudah termasuk domain .com dan hosting 1 tahun pertama.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full btn-shine bg-blue-600 hover:bg-blue-500 text-white h-12">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Konsultasi via WhatsApp
                </Button>
              </a>
              <Link href="/contact" className="flex-1">
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 h-12">
                  Kirim Brief Detail
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!selectedType && (
        <div className="text-center py-8 text-blue-200/25 text-sm">
          ← Pilih tipe website di atas untuk melihat estimasi harga
        </div>
      )}
    </div>
  );
}
