"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Info } from "lucide-react";

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="space-y-5">
        {/* Industri */}
        <div className="glass rounded-2xl p-5">
          <label className="text-white font-semibold text-sm block mb-3">
            <span className="text-blue-400 mr-2">01</span> Jenis Bisnis
          </label>
          <select
            value={industryIdx}
            onChange={e => handleIndustryChange(parseInt(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
          >
            {INDUSTRIES.map((ind, i) => (
              <option key={i} value={i} className="bg-[#0a1628]">{ind.label}</option>
            ))}
          </select>
        </div>

        {/* Estimasi pengunjung */}
        <div className="glass rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <label className="text-white font-semibold text-sm">
              <span className="text-blue-400 mr-2">02</span> Estimasi Pengunjung/Bulan
            </label>
            <span className="text-blue-400 font-bold">{visitors.toLocaleString()}</span>
          </div>
          <input
            type="range" min={50} max={10000} step={50}
            value={visitors}
            onChange={e => setVisitors(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-blue-200/30 text-xs mt-1">
            <span>50</span><span>10.000</span>
          </div>
        </div>

        {/* Conversion rate */}
        <div className="glass rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <label className="text-white font-semibold text-sm">
              <span className="text-blue-400 mr-2">03</span> Conversion Rate
            </label>
            <span className="text-blue-400 font-bold">{convRate}%</span>
          </div>
          <input
            type="range" min={0.5} max={10} step={0.5}
            value={convRate}
            onChange={e => setConvRate(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-blue-200/30 text-xs mt-1">
            <span>0.5%</span><span>10%</span>
          </div>
          <p className="text-blue-200/35 text-xs mt-2 flex items-start gap-1">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Rata-rata website bisnis lokal: 1–3%
          </p>
        </div>

        {/* Nilai order */}
        <div className="glass rounded-2xl p-5">
          <label className="text-white font-semibold text-sm block mb-3">
            <span className="text-blue-400 mr-2">04</span> Rata-rata Nilai Order
          </label>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-blue-200/50 text-sm">
              Default industri: <strong className="text-white">{formatRp(industry.avg)}</strong> {industry.label2}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={customOrder}
              onChange={e => setCustomOrder(e.target.checked)}
              className="accent-blue-500 w-4 h-4"
            />
            <label className="text-blue-200/60 text-sm">Ubah nilai order</label>
          </div>
          {customOrder && (
            <div className="mt-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/40 text-sm">Rp</span>
              <input
                type="number"
                value={avgOrder}
                onChange={e => setAvgOrder(parseInt(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
              />
            </div>
          )}
        </div>

        {/* Paket website */}
        <div className="glass rounded-2xl p-5">
          <label className="text-white font-semibold text-sm block mb-3">
            <span className="text-blue-400 mr-2">05</span> Paket Website MFWEB
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PACKAGES.map((p, i) => (
              <button
                key={i}
                onClick={() => setPackageIdx(i)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  packageIdx === i
                    ? "bg-blue-600/15 border-blue-500/40"
                    : "glass border-white/8 hover:border-white/20"
                }`}
              >
                <p className="text-white text-xs font-medium line-clamp-1">{p.label}</p>
                <p className="text-blue-400 text-xs font-bold mt-0.5">{formatRp(p.price)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="space-y-4">
        {/* Main results */}
        <div className="glass rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-bold">Estimasi Hasil</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <div>
                <p className="text-blue-200/60 text-sm">Leads / Bulan</p>
                <p className="text-blue-200/35 text-xs">dari {visitors.toLocaleString()} pengunjung × {convRate}%</p>
              </div>
              <span className="text-white font-black text-2xl">{leadsPerMonth}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <div>
                <p className="text-blue-200/60 text-sm">Potensi Revenue / Bulan</p>
                <p className="text-blue-200/35 text-xs">{leadsPerMonth} leads × {formatRp(customOrder ? avgOrder : industry.avg)}</p>
              </div>
              <span className="text-teal-400 font-black text-2xl">{formatRp(revenuePerMonth)}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <div>
                <p className="text-blue-200/60 text-sm">Potensi Revenue / Tahun</p>
              </div>
              <span className="text-teal-400 font-black text-2xl">{formatRp(revenuePerYear)}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <div>
                <p className="text-blue-200/60 text-sm">Biaya Website</p>
                <p className="text-blue-200/35 text-xs">{pkg.label}</p>
              </div>
              <span className="text-white font-bold">{formatRp(pkg.price)}</span>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 mt-2">
              <div className="flex justify-between items-center mb-1">
                <p className="text-blue-200/70 text-sm font-medium">ROI Website (per tahun)</p>
                <span className="text-white font-black text-3xl">{roi.toLocaleString()}%</span>
              </div>
              {paybackMonths !== null && (
                <p className="text-blue-200/40 text-xs">
                  Modal kembali dalam ≈ <strong className="text-blue-300">{paybackMonths} bulan</strong>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="glass rounded-xl p-4 border border-amber-500/10">
          <p className="text-amber-400/60 text-xs leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1" />
            Ini adalah estimasi berdasarkan input yang diisi. Hasil aktual bergantung pada kualitas website, strategi marketing, dan kondisi bisnis masing-masing.
          </p>
        </div>

        {/* CTA */}
        <Link href="/contact" className="block">
          <div className="glass rounded-2xl p-5 border border-blue-500/10 text-center hover:border-blue-500/30 transition-colors">
            <p className="text-white font-semibold mb-1">ROI {roi.toLocaleString()}% terdengar menarik?</p>
            <p className="text-blue-200/50 text-sm mb-4">Konsultasi gratis — kami bantu rancang strategi website yang tepat untuk bisnis Anda.</p>
            <span className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Mulai Konsultasi <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
