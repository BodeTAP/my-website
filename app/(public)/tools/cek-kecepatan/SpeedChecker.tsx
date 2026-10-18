"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gauge, Monitor, Smartphone, ArrowRight, AlertCircle, Clock, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Strategy = "mobile" | "desktop";
type Metric = { value: string; numericValue: number };
type Result = {
  score: number;
  url: string;
  strategy: Strategy;
  metrics: Record<string, Metric>;
  opportunities: { title: string; description: string; displayValue?: string }[];
  cached?: boolean;
};
type ErrorState = {
  message: string;
  quotaExceeded?: boolean;
  directUrl?: string;
};

const SCORE_COLOR = (s: number) =>
  s >= 90
    ? { ring: "#10b981", text: "text-emerald-600", label: "Sangat Baik" }
    : s >= 50
    ? { ring: "#f59e0b", text: "text-amber-600", label: "Perlu Perbaikan" }
    : { ring: "#ef4444", text: "text-rose-600", label: "Kurang Optimal" };

const METRIC_INFO: Record<string, { label: string; desc: string; thresholds: [number, number] }> = {
  fcp:  { label: "First Contentful Paint", desc: "Konten pertama muncul",      thresholds: [1800, 3000] },
  lcp:  { label: "Largest Contentful Paint", desc: "Elemen terbesar muncul",   thresholds: [2500, 4000] },
  tbt:  { label: "Total Blocking Time",     desc: "Browser terblokir JS",      thresholds: [200, 600] },
  cls:  { label: "Cumulative Layout Shift", desc: "Pergeseran tata letak",     thresholds: [0.1, 0.25] },
  si:   { label: "Speed Index",             desc: "Kecepatan tampilan visual",  thresholds: [3400, 5800] },
  ttfb: { label: "Time to First Byte",      desc: "Respons server pertama",    thresholds: [800, 1800] },
};

function metricStatus(id: string, v: number): "good" | "warn" | "poor" {
  const t = METRIC_INFO[id]?.thresholds ?? [0, 0];
  return v <= t[0] ? "good" : v <= t[1] ? "warn" : "poor";
}

const DOT: Record<string, string> = { good: "bg-emerald-500", warn: "bg-amber-500", poor: "bg-rose-500" };
const TXT: Record<string, string> = { good: "text-emerald-700", warn: "text-amber-700", poor: "text-rose-700" };

function ScoreGauge({ score }: { score: number }) {
  const { ring, text, label } = SCORE_COLOR(score);
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={r} fill="none" stroke={ring} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-3xl font-bold font-mono text-slate-900" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {score}
          </motion.span>
          <span className="text-[11px] font-mono text-slate-400">/ 100</span>
        </div>
      </div>
      <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${text}`}>{label}</span>
    </div>
  );
}

export default function SpeedChecker() {
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);

  async function handleCheck() {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`/api/tools/pagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}`);
      const data = await res.json();
      if (!res.ok) {
        setError({
          message: data.error ?? "Terjadi kesalahan",
          quotaExceeded: data.quotaExceeded ?? false,
          directUrl: data.directUrl,
        });
      } else {
        setResult(data as Result);
      }
    } catch {
      setError({ message: "Tidak dapat terhubung ke server. Silakan coba lagi." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-px w-6 bg-slate-400" />
          <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
            Analisis URL
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          Masukkan Alamat Website
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Gunakan format lengkap, contoh: <span className="font-mono text-slate-800">https://namabisnis.com</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="https://namabisnis.com"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono"
          />
          <div className="flex gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(["mobile", "desktop"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStrategy(s)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  strategy === s
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s === "mobile" ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                {s === "mobile" ? "Mobile" : "Desktop"}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleCheck}
          disabled={loading || !url.trim()}
          className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 px-8 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              Menganalisis... (20–30 detik)
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Gauge className="w-4 h-4" /> Mulai Analisis Kecepatan
            </span>
          )}
        </Button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-2xl p-5 border flex flex-col gap-3 ${
              error.quotaExceeded ? "border-amber-200 bg-amber-50 text-amber-900" : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{error.message}</p>
            </div>
            {error.quotaExceeded && error.directUrl && (
              <a
                href={error.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-900 bg-white border border-slate-200 rounded-full px-4 py-2 hover:bg-slate-50 transition-colors w-fit"
              >
                Cek langsung di Google PageSpeed Insights
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Score card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreGauge score={result.score} />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start flex-wrap">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                      Performance Score ({result.strategy === "mobile" ? "Mobile" : "Desktop"})
                    </span>
                    {result.cached && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        cached
                      </span>
                    )}
                  </div>
                  <h3 className="text-slate-900 font-mono font-bold text-lg mb-2 break-all">{result.url}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {result.score >= 90
                      ? "Website Anda berkinerja sangat baik. Pertahankan optimasi aset dan responsivitas ini."
                      : result.score >= 50
                      ? "Performa cukup stabil namun masih memiliki peluang optimasi untuk pengalaman pengguna yang lebih cepat."
                      : "Kecepatan muat masih di bawah standar optimal. Segera tinjau rekomendasi perbaikan berikut."}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-6 bg-slate-400" />
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                  Metrik Teknis
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Core Web Vitals & Kecepatan</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(result.metrics).map(([id, metric]) => {
                  const st = metricStatus(id, metric.numericValue);
                  const info = METRIC_INFO[id];
                  return (
                    <div key={id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${DOT[st]}`} />
                        <span className="text-slate-600 text-xs font-medium truncate">{info?.label ?? id}</span>
                      </div>
                      <p className={`text-xl font-bold font-mono ${TXT[st]}`}>{metric.value}</p>
                      <p className="text-slate-500 text-[11px] mt-1">{info?.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Opportunities */}
            {result.opportunities.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-px w-6 bg-slate-400" />
                  <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                    Rekomendasi
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Peluang Optimasi ({result.opportunities.length})
                </h3>
                <div className="space-y-3">
                  {result.opportunities.map((op, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <Clock className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-900 text-sm font-bold">
                          {op.title}
                          {op.displayValue && (
                            <span className="ml-2 font-mono text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              {op.displayValue}
                            </span>
                          )}
                        </p>
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed">{op.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consultation CTA */}
            <div className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-8 text-center">
              <h4 className="text-xl font-bold text-white mb-2">Butuh Bantuan Memperbaiki Performa?</h4>
              <p className="text-slate-300 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                Tim teknis MFWEB siap membantu audit performa menyeluruh, optimalisasi Core Web Vitals, dan percepatan server website Anda.
              </p>
              <Link href="/contact">
                <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 h-11 transition-colors">
                  Konsultasi Gratis <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs font-mono">
          Ketikkan alamat URL website di atas dan tekan tombol untuk memulai analisis.
        </div>
      )}
    </div>
  );
}
