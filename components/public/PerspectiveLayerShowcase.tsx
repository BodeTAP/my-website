"use client";

import React, { useState } from "react";
import { Globe, Search, FileText, Receipt, CheckCircle } from "lucide-react";
import { BrandLogoIcon } from "@/components/brand/BrandLogo";

/**
 * PerspectiveLayerShowcase
 *
 * Authentic 3D fanned-out cascade with zero-glitch architecture:
 * 1. Decoupled hit-testing: Static non-translating hit areas prevent any hover-flicker loops.
 * 2. Proper Z-depth scaling: The active card is brought dynamically to the highest Z-elevation (150px)
 *    and highest zIndex (50), ensuring it is never obscured by other cards.
 */
export default function PerspectiveLayerShowcase() {
  const [activeLayer, setActiveLayer] = useState<number>(0);

  const tabs = [
    { id: 0, label: "01 Website", icon: Globe },
    { id: 1, label: "02 Leads", icon: Search },
    { id: 2, label: "03 Proposal", icon: FileText },
    { id: 3, label: "04 Invoice", icon: Receipt },
  ];

  // Dynamic 3D depth: active card rises cleanly above all others
  const getTranslateZ = (index: number) => {
    if (activeLayer === index) return 145;
    // Base depth keeps resting cascade natural
    return (3 - index) * 16;
  };

  const getZIndex = (index: number) => {
    if (activeLayer === index) return 50;
    return 10 - index;
  };

  return (
    <div className="relative w-full py-4 flex flex-col items-center justify-center select-none overflow-visible">
      {/* 3D Perspective Canvas Container */}
      <div
        className="relative w-full max-w-[460px] sm:max-w-[500px] h-[480px] sm:h-[530px] flex items-center justify-center"
        style={{
          perspective: "1600px",
          perspectiveOrigin: "50% 32%",
        }}
      >
        <div
          className="relative w-[340px] sm:w-[390px] h-[430px] sm:h-[460px] transform-gpu"
          style={{
            transform: "rotateX(46deg) rotateZ(-26deg) rotateY(10deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* ── Layer 3 (Bottom): Invoice Generator Document ── */}
          <div
            className="absolute inset-x-0 top-48 sm:top-52 h-[225px] pointer-events-none"
            style={{
              transform: `translateZ(${getTranslateZ(3)}px)`,
              zIndex: getZIndex(3),
              transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease",
              opacity: activeLayer === 3 ? 1 : 0.88,
            }}
          >
            <div
              className={`w-full h-full rounded-2xl bg-white border p-4 sm:p-5 transition-all duration-300 ${
                activeLayer === 3
                  ? "border-slate-900 shadow-[0_35px_65px_-12px_rgba(0,0,0,0.45)] ring-2 ring-slate-900"
                  : "border-slate-200/90 shadow-[0_16px_35px_-12px_rgba(0,0,0,0.22)]"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white">
                    <Receipt className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-slate-900 block leading-none">INVOICE RESMI #INV-882</span>
                    <span className="text-[9px] text-slate-400 font-mono">15 Okt 2026 • Jatuh Tempo 22 Okt</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Lunas
                </span>
              </div>

              <div className="space-y-1.5 text-[10px] text-slate-600 mb-2.5">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span>Pembuatan Website Company Profile + Domain (1 Th)</span>
                  <span className="font-mono font-bold text-slate-900">Rp 2.450.000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span>Optimasi Kecepatan & Setup Google Search Console</span>
                  <span className="font-mono font-bold text-slate-900">Rp 500.000</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1.5 text-[11px] font-bold text-slate-900">
                <span className="text-slate-500 text-[10px]">Total Tagihan (Inc. PPN 11%)</span>
                <span className="font-mono text-sm text-slate-950">Rp 3.274.500</span>
              </div>
            </div>
          </div>

          {/* ── Layer 2: Proposal Generator Document ── */}
          <div
            className="absolute inset-x-0 top-32 sm:top-36 h-[225px] pointer-events-none"
            style={{
              transform: `translateZ(${getTranslateZ(2)}px)`,
              zIndex: getZIndex(2),
              transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease",
              opacity: activeLayer === 2 ? 1 : 0.88,
            }}
          >
            <div
              className={`w-full h-full rounded-2xl bg-white border p-4 sm:p-5 transition-all duration-300 ${
                activeLayer === 2
                  ? "border-slate-900 shadow-[0_35px_65px_-12px_rgba(0,0,0,0.45)] ring-2 ring-slate-900"
                  : "border-slate-200/90 shadow-[0_16px_35px_-12px_rgba(0,0,0,0.20)]"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <BrandLogoIcon size={20} variant="light" />
                  <span className="text-[11px] font-black tracking-tight text-slate-900">PROPOSAL PENAWARAN DIGITAL</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  PDF Siap Kirim
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Klien Sasaran</span>
                  <span className="text-[10px] font-bold text-slate-900 block truncate">Klinik Gigi Sehat</span>
                  <span className="text-[8px] text-slate-500">Kediri, Jawa Timur</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Estimasi Timeline</span>
                  <span className="text-[10px] font-bold text-slate-900 block">4 Hari Pengerjaan</span>
                  <span className="text-[8px] text-emerald-600 font-semibold">Garansi Revisi Aktif</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  Termasuk Copywriting + Setup Mobile
                </span>
                <span className="text-slate-400 font-mono">Hal. 1 dari 4</span>
              </div>
            </div>
          </div>

          {/* ── Layer 1: Lead Finder Interface ── */}
          <div
            className="absolute inset-x-0 top-16 sm:top-18 h-[225px] pointer-events-none"
            style={{
              transform: `translateZ(${getTranslateZ(1)}px)`,
              zIndex: getZIndex(1),
              transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease",
              opacity: activeLayer === 1 ? 1 : 0.88,
            }}
          >
            <div
              className={`w-full h-full rounded-2xl bg-[#FAFAFC] border p-4 sm:p-5 transition-all duration-300 ${
                activeLayer === 1
                  ? "border-slate-900 shadow-[0_35px_65px_-12px_rgba(0,0,0,0.45)] ring-2 ring-slate-900"
                  : "border-slate-200/90 shadow-[0_16px_35px_-12px_rgba(0,0,0,0.18)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center">
                    <Search className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-black text-slate-900">Lead Finder: Hasil Prospek Kota</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  32 Ditemukan
                </span>
              </div>

              <div className="space-y-1.5 text-[9px]">
                <div className="bg-white p-2 rounded-xl border border-slate-200/70 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="font-bold text-slate-900 block text-[10px]">Restoran Rasa Nusantara</span>
                    <span className="text-slate-400 text-[8px]">Jl. Veteran No. 42 • Rating 4.8</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80 font-bold text-[8px] block">
                      Belum Ada Web
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">0812-3490-xxxx</span>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-xl border border-slate-200/70 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="font-bold text-slate-900 block text-[10px]">Bengkel Motor Presisi</span>
                    <span className="text-slate-400 text-[8px]">Kecamatan Kota • Rating 4.9</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80 font-bold text-[8px] block">
                      Belum Ada Web
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">0821-8812-xxxx</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Layer 0 (Top-most): Modern Website Viewport ── */}
          <div
            className="absolute inset-x-0 top-0 h-[235px] pointer-events-none"
            style={{
              transform: `translateZ(${getTranslateZ(0)}px)`,
              zIndex: getZIndex(0),
              transition: "transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease",
              opacity: activeLayer === 0 ? 1 : 0.88,
            }}
          >
            <div
              className={`w-full h-full rounded-2xl bg-white border p-4 sm:p-5 transition-all duration-300 ${
                activeLayer === 0
                  ? "border-slate-900 shadow-[0_35px_65px_-12px_rgba(0,0,0,0.45)] ring-2 ring-slate-900"
                  : "border-slate-200 shadow-[0_16px_35px_-12px_rgba(0,0,0,0.18)]"
              }`}
            >
              {/* Browser Dots Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-full px-3 py-0.5 text-[9px] text-slate-500 font-mono">
                  https://klienbisnis.com
                </div>
                <Globe className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Viewport Hero */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-2.5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Website Company Profile
                </span>
                <h4 className="text-sm font-black text-slate-900 leading-tight mb-1">
                  Jasa Profesional Siap Ditemukan Pelanggan.
                </h4>
                <p className="text-[9px] text-slate-500 leading-relaxed mb-2 line-clamp-2">
                  Desain cepat, SEO lokal, integrasi WhatsApp, dan katalog produk siap jual.
                </p>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
                    Hubungi WhatsApp
                  </span>
                  <span className="text-[8px] text-slate-500 font-medium">Buka Profil →</span>
                </div>
              </div>

              {/* Mini Footer Strip */}
              <div className="flex items-center justify-between text-[8px] text-slate-400 px-0.5">
                <span>99.9% Cloud Uptime</span>
                <span>•</span>
                <span>Mobile Responsive</span>
                <span>•</span>
                <span className="font-bold text-slate-800">MFWEB Engine</span>
              </div>
            </div>
          </div>

          {/* ── Stationary Hit-Test Overlay (100% stable, zero flicker loop) ── */}
          <div
            className="absolute inset-0 pointer-events-auto"
            style={{
              transform: "translateZ(180px)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Zone 0: Top strip (Website) */}
            <div
              className="absolute inset-x-0 top-0 h-[65px] cursor-pointer"
              onMouseEnter={() => setActiveLayer(0)}
              onClick={() => setActiveLayer(0)}
            />
            {/* Zone 1: Second strip (Leads) */}
            <div
              className="absolute inset-x-0 top-[65px] h-[65px] cursor-pointer"
              onMouseEnter={() => setActiveLayer(1)}
              onClick={() => setActiveLayer(1)}
            />
            {/* Zone 2: Third strip (Proposal) */}
            <div
              className="absolute inset-x-0 top-[130px] h-[65px] cursor-pointer"
              onMouseEnter={() => setActiveLayer(2)}
              onClick={() => setActiveLayer(2)}
            />
            {/* Zone 3: Bottom card area (Invoice) */}
            <div
              className="absolute inset-x-0 top-[195px] h-[230px] cursor-pointer"
              onMouseEnter={() => setActiveLayer(3)}
              onClick={() => setActiveLayer(3)}
            />
          </div>

        </div>
      </div>

      {/* ── Interactive Layer Control Pills (100% stable control) ── */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeLayer === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onMouseEnter={() => setActiveLayer(tab.id)}
              onClick={() => setActiveLayer(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white text-slate-950 shadow-md ring-1 ring-slate-300 scale-105"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
