"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const PACKAGES = [
  { label: "Landing Page",          price: 800_000 },
  { label: "Company Profile Simple", price: 1_500_000 },
  { label: "Company Profile Pro",    price: 3_500_000 },
  { label: "Toko Online",            price: 5_400_000 },
];

const INDUSTRIES = [
  { label: "Kuliner / F&B",          avg: 75_000,    label2: "per transaksi" },
  { label: "Fashion / Pakaian",       avg: 200_000,   label2: "per order" },
  { label: "Jasa (salon, bengkel…)", avg: 150_000,   label2: "per kunjungan" },
  { label: "Kesehatan / Kecantikan",  avg: 300_000,   label2: "per sesi" },
  { label: "Properti / Konstruksi",   avg: 5_000_000, label2: "per proyek" },
  { label: "Toko Online Umum",        avg: 250_000,   label2: "per order" },
  { label: "Pendidikan / Kursus",     avg: 500_000,   label2: "per murid" },
  { label: "Lainnya",                 avg: 200_000,   label2: "per transaksi" },
];

function formatRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000)         return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function ROICalculator() {
  const [visitors,    setVisitors]    = useState(500);
  const [convRate,    setConvRate]    = useState(2);
  const [industryIdx, setIndustryIdx] = useState(0);
  const [packageIdx,  setPackageIdx]  = useState(1);
  const [avgOrder,    setAvgOrder]    = useState(INDUSTRIES[0].avg);
  const [customOrder, setCustomOrder] = useState(false);

  const industry = INDUSTRIES[industryIdx];
  const pkg      = PACKAGES[packageIdx];

  const leadsPerMonth    = Math.round(visitors * convRate / 100);
  const revenuePerMonth  = leadsPerMonth * (customOrder ? avgOrder : industry.avg);
  const revenuePerYear   = revenuePerMonth * 12;
  const roi              = pkg.price > 0 ? Math.round((revenuePerYear / pkg.price) * 100) : 0;
  const paybackMonths    = revenuePerMonth > 0 ? Math.ceil(pkg.price / revenuePerMonth) : null;

  function handleIndustryChange(idx: number) {
    setIndustryIdx(idx);
    if (!customOrder) setAvgOrder(INDUSTRIES[idx].avg);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="space-y-5">
        {/* Industri */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Parameter 1</span>
          </div>
          <label className="text-slate-900 font-bold text-sm block mb-3">
            Kategori Usaha
          </label>
          <select
            value={industryIdx}
            onChange={e => handleIndustryChange(parseInt(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium cursor-pointer transition-all"
          >
            {INDUSTRIES.map((ind, i) => (
              <option key={i} value={i}>{ind.label}</option>
            ))}
          </select>
        </div>

        {/* Estimasi pengunjung */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Parameter 2</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-slate-900 font-bold text-sm">
              Proyeksi Pengunjung / Bulan
            </label>
            <span className="text-slate-900 font-mono font-bold">{visitors.toLocaleString()}</span>
          </div>
          <input
            type="range" min={50} max={10000} step={50}
            value={visitors}
            onChange={e => setVisitors(parseInt(e.target.value))}
            className="w-full accent-slate-900 cursor-pointer"
          />
          <div className="flex justify-between text-slate-400 font-mono text-xs mt-1">
            <span>50</span><span>10.000</span>
          </div>
        </div>

        {/* Conversion rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Parameter 3</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-slate-900 font-bold text-sm">
              Tingkat Konversi (Conversion Rate)
            </label>
            <span className="text-slate-900 font-mono font-bold">{convRate}%</span>
          </div>
          <input
            type="range" min={0.5} max={10} step={0.5}
            value={convRate}
            onChange={e => setConvRate(parseFloat(e.target.value))}
            className="w-full accent-slate-900 cursor-pointer"
          />
          <div className="flex justify-between text-slate-400 font-mono text-xs mt-1">
            <span>0.5%</span><span>10%</span>
          </div>
          <p className="text-slate-500 text-xs mt-2.5 flex items-start gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
            Rata-rata standar industri website UMKM & jasa: 1–3%
          </p>
        </div>

        {/* Nilai order */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Parameter 4</span>
          </div>
          <label className="text-slate-900 font-bold text-sm block mb-2">
            Nilai Rata-rata Penjualan (Average Ticket)
          </label>
          <p className="text-slate-500 text-xs font-mono mb-3">
            Rata-rata kategori ini: <span className="font-bold text-slate-900">{formatRp(industry.avg)}</span> {industry.label2}
          </p>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={customOrder}
              onChange={e => setCustomOrder(e.target.checked)}
              className="accent-slate-900 w-4 h-4 rounded"
            />
            <span className="text-slate-700 text-sm font-medium">Kustomisasi nilai nominal sendiri</span>
          </label>
          {customOrder && (
            <div className="mt-3 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">Rp</span>
              <input
                type="number"
                value={avgOrder}
                onChange={e => setAvgOrder(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-slate-900 font-mono text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          )}
        </div>

        {/* Paket website */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Parameter 5</span>
          </div>
          <label className="text-slate-900 font-bold text-sm block mb-3">
            Pilihan Paket Pembuatan Website
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {PACKAGES.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPackageIdx(i)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  packageIdx === i
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <p className={`text-xs font-medium line-clamp-1 ${packageIdx === i ? "text-white" : "text-slate-900"}`}>
                  {p.label}
                </p>
                <p className={`text-xs font-mono font-bold mt-1 ${packageIdx === i ? "text-slate-300" : "text-slate-600"}`}>
                  {formatRp(p.price)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output Projection */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-slate-800" />
            <h3 className="text-lg font-bold text-slate-900">Proyeksi Hasil Investasi</h3>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex justify-between items-center py-4">
              <div>
                <p className="text-slate-700 text-sm font-semibold">Prospek Masuk / Bulan</p>
                <p className="text-slate-400 font-mono text-xs">{visitors.toLocaleString()} pengunjung × {convRate}%</p>
              </div>
              <span className="text-slate-900 font-mono font-bold text-2xl">{leadsPerMonth}</span>
            </div>

            <div className="flex justify-between items-center py-4">
              <div>
                <p className="text-slate-700 text-sm font-semibold">Potensi Omzet / Bulan</p>
                <p className="text-slate-400 font-mono text-xs">{leadsPerMonth} leads × {formatRp(customOrder ? avgOrder : industry.avg)}</p>
              </div>
              <span className="text-slate-900 font-mono font-bold text-2xl">{formatRp(revenuePerMonth)}</span>
            </div>

            <div className="flex justify-between items-center py-4">
              <div>
                <p className="text-slate-700 text-sm font-semibold">Potensi Omzet / Tahun</p>
                <p className="text-slate-400 font-mono text-xs">Akumulasi 12 bulan operasional</p>
              </div>
              <span className="text-slate-900 font-mono font-bold text-2xl">{formatRp(revenuePerYear)}</span>
            </div>

            <div className="flex justify-between items-center py-4">
              <div>
                <p className="text-slate-700 text-sm font-semibold">Investasi Website (Awal)</p>
                <p className="text-slate-400 font-mono text-xs">{pkg.label}</p>
              </div>
              <span className="text-slate-600 font-mono font-bold text-lg">{formatRp(pkg.price)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#1E242E] text-white p-6 mt-6">
            <div className="flex justify-between items-baseline mb-2">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Proyeksi ROI Tahunan</p>
              <span className="text-3xl font-mono font-bold text-white">{roi.toLocaleString()}%</span>
            </div>
            {paybackMonths !== null && (
              <p className="text-slate-300 text-xs font-mono">
                Estimasi modal investasi kembali dalam kurun waktu ≈ <strong className="text-white underline">{paybackMonths} bulan</strong>.
              </p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-slate-500 text-xs leading-relaxed font-mono">
            <Info className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
            Kalkulasi ini merupakan simulasi matematis berdasarkan parameter yang dimasukkan. Angka riil bergantung pada strategi pemasaran digital dan daya saing penawaran Anda.
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-6 sm:p-8 text-center">
          <h4 className="text-lg font-bold text-white mb-2">Tertarik Mewujudkan Target Ini?</h4>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Konsultasikan struktur website berorientasi konversi bersama tim spesialis kami hari ini secara gratis.
          </p>
          <Link href="/contact">
            <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 h-11 transition-colors">
              Mulai Konsultasi Strategi <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
