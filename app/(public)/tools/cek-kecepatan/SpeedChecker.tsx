"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gauge, Monitor, Smartphone, ArrowRight, AlertCircle, Clock,
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
    ? { ring: "#34d399", text: "text-green-400", label: "Sangat Baik" }
    : s >= 50
    ? { ring: "#fb923c", text: "text-orange-400", label: "Perlu Perbaikan" }
    : { ring: "#f87171", text: "text-red-400", label: "Buruk" };

const METRIC_INFO: Record<string, { label: string; desc: string; thresholds: [number, number] }> = {
  fcp:  { label: "First Contentful Paint", desc: "Konten pertama muncul",      thresholds: [1800, 3000] },
  lcp:  { label: "Largest Contentful Paint", desc: "Elemen terbesar muncul",   thresholds: [2500, 4000] },
  tbt:  { label: "Total Blocking Time",     desc: "Browser terblokir JS",      thresholds: [200, 600] },
  cls:  { label: "Cumulative Layout Shift", desc: "Seberapa banyak konten bergeser", thresholds: [0.1, 0.25] },
  si:   { label: "Speed Index",             desc: "Kecepatan tampilan visual",  thresholds: [3400, 5800] },
  ttfb: { label: "Time to First Byte",      desc: "Waktu server merespons",     thresholds: [800, 1800] },
};

function metricStatus(id: string, v: number): "good" | "warn" | "poor" {
  const t = METRIC_INFO[id]?.thresholds ?? [0, 0];
  return v <= t[0] ? "good" : v <= t[1] ? "warn" : "poor";
}

const DOT: Record<string, string> = { good: "bg-green-400", warn: "bg-orange-400", poor: "bg-red-400" };
const TXT: Record<string, string> = { good: "text-green-400", warn: "text-orange-400", poor: "text-red-400" };

function ScoreGauge({ score }: { score: number }) {
  const { ring, text, label } = SCORE_COLOR(score);
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={r} fill="none" stroke={ring} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-4xl font-black text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {score}
          </motion.span>
          <span className="text-xs text-blue-200/40">/100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold ${text}`}>{label}</span>
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
      setError({ message: "Tidak dapat terhubung ke server. Coba lagi." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">
          <span className="text-blue-400 mr-2">01</span> Masukkan URL Website
        </h2>
        <p className="text-blue-200/40 text-sm mb-5">
          Masukkan URL lengkap, misal: <span className="text-blue-300">https://namabisnis.com</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="https://namabisnis.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-blue-200/30 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <div className="flex gap-2 shrink-0">
            {(["mobile", "desktop"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                  strategy === s
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                    : "glass border-white/10 text-blue-200/50 hover:border-white/20"
                }`}
              >
                {s === "mobile" ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                {s === "mobile" ? "Mobile" : "Desktop"}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={handleCheck}
          disabled={loading || !url.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-8 disabled:opacity-50"
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
              <Gauge className="w-4 h-4" /> Cek Kecepatan
            </span>
          )}
        </Button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`glass rounded-xl p-4 border flex flex-col gap-3 ${
              error.quotaExceeded ? "border-amber-500/25" : "border-red-500/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${error.quotaExceeded ? "text-amber-400" : "text-red-400"}`} />
              <p className={`text-sm ${error.quotaExceeded ? "text-amber-300" : "text-red-300"}`}>
                {error.message}
              </p>
            </div>
            {error.quotaExceeded && error.directUrl && (
              <a
                href={error.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2.5 w-fit"
              >
                <ArrowRight className="w-4 h-4" />
                Cek langsung di Google PageSpeed Insights →
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
            className="space-y-5"
          >
            {/* Score card */}
            <div className="glass rounded-2xl p-6 border border-blue-500/10">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreGauge score={result.score} />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-blue-200/40 text-xs">
                      Performance Score ({result.strategy === "mobile" ? "Mobile" : "Desktop"})
                    </p>
                    {result.cached && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        cached
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-base mb-2 break-all">{result.url}</h3>
                  <p className="text-blue-200/50 text-sm">
                    {result.score >= 90
                      ? "Website Anda sangat cepat! Pertahankan performa ini."
                      : result.score >= 50
                      ? "Ada ruang perbaikan. Cek rekomendasi di bawah."
                      : "Website perlu perbaikan serius. Tim kami siap membantu."}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 text-sm">Core Web Vitals & Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(result.metrics).map(([id, metric]) => {
                  const st = metricStatus(id, metric.numericValue);
                  const info = METRIC_INFO[id];
                  return (
                    <div key={id} className="bg-white/3 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${DOT[st]}`} />
                        <span className="text-blue-200/50 text-[11px] truncate">{info?.label ?? id}</span>
                      </div>
                      <p className={`text-xl font-bold ${TXT[st]}`}>{metric.value}</p>
                      <p className="text-blue-200/30 text-[11px] mt-0.5">{info?.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Opportunities */}
            {result.opportunities.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 text-sm">
                  Peluang Perbaikan ({result.opportunities.length})
                </h3>
                <div className="space-y-3">
                  {result.opportunities.map((op, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                      <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-medium">
                          {op.title}
                          {op.displayValue && (
                            <span className="text-orange-400 ml-2 text-xs">{op.displayValue}</span>
                          )}
                        </p>
                        <p className="text-blue-200/40 text-xs mt-0.5 line-clamp-2">{op.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-6 border border-blue-500/10 text-center">
              <p className="text-white font-semibold mb-2">Butuh Bantuan Memperbaiki Performa?</p>
              <p className="text-blue-200/50 text-sm mb-4">
                Tim MFWEB siap mengoptimalkan kecepatan dan Core Web Vitals website Anda.
              </p>
              <Link href="/contact">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                  Konsultasi Gratis <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && !error && (
        <div className="text-center py-8 text-blue-200/25 text-sm">
          ← Masukkan URL website untuk melihat skor performa
        </div>
      )}
    </div>
  );
}
