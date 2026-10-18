"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchCheck, CheckCircle2, AlertTriangle, XCircle, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Status = "pass" | "warn" | "fail";
type Check = {
  id: string;
  label: string;
  status: Status;
  detail: string;
  points: number;
  maxPoints: number;
};
type Result = { score: number; url: string; checks: Check[] };

const STATUS = {
  pass: { icon: CheckCircle2, text: "text-emerald-700", bg: "border-slate-200 bg-white" },
  warn: { icon: AlertTriangle, text: "text-amber-700", bg: "border-amber-200 bg-amber-50/40" },
  fail: { icon: XCircle, text: "text-rose-700", bg: "border-rose-200 bg-rose-50/40" },
};

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Kondisi Baik" : score >= 50 ? "Perlu Perbaikan" : "Kritis";
  const textColor = score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-rose-600";
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
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
      <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${textColor}`}>{label}</span>
    </div>
  );
}

export default function SeoChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/tools/seo-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Terjadi kesalahan");
      else setResult(data as Result);
    } catch {
      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const passCount = result?.checks.filter((c) => c.status === "pass").length ?? 0;
  const warnCount = result?.checks.filter((c) => c.status === "warn").length ?? 0;
  const failCount = result?.checks.filter((c) => c.status === "fail").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-px w-6 bg-slate-400" />
          <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
            Analisis On-Page
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          Masukkan URL Website
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Analisis akan memeriksa metadata, struktur heading, dan faktor teknis pada URL yang diberikan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="https://namabisnis.com"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono"
          />
          <Button
            onClick={handleCheck}
            disabled={loading || !url.trim()}
            className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 px-8 disabled:opacity-50 whitespace-nowrap transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
                Menganalisis...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SearchCheck className="w-4 h-4" /> Cek Skor SEO
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-5 border border-rose-200 bg-rose-50 text-rose-900 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{error}</p>
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
            {/* Score overview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreGauge score={result.score} />
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1 block">
                    SEO On-Page Audit
                  </span>
                  <h3 className="text-slate-900 font-mono font-bold text-lg mb-4 break-all">{result.url}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-900 font-mono font-bold text-sm">{passCount}</span>
                      <span className="text-slate-600 text-xs">Lolos</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-slate-900 font-mono font-bold text-sm">{warnCount}</span>
                      <span className="text-slate-600 text-xs">Perhatian</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-slate-900 font-mono font-bold text-sm">{failCount}</span>
                      <span className="text-slate-600 text-xs">Gagal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-px w-6 bg-slate-400" />
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                  Rincian Parameter
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Pemeriksaan Detail ({result.checks.length} faktor)
              </h3>
              <div className="space-y-2.5">
                {result.checks.map((check, i) => {
                  const { icon: Icon, text, bg } = STATUS[check.status];
                  return (
                    <motion.div
                      key={check.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-start gap-3 p-4 rounded-xl border ${bg}`}
                    >
                      <Icon className={`w-4 h-4 ${text} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-slate-900 text-sm font-bold">{check.label}</span>
                          <span className={`text-xs font-mono font-semibold ${text} shrink-0`}>
                            {check.points}/{check.maxPoints} poin
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed">{check.detail}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            {(failCount > 0 || warnCount > 0) && (
              <div className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-8 text-center">
                <h4 className="text-xl font-bold text-white mb-2">Perlu Optimasi SEO Menyeluruh?</h4>
                <p className="text-slate-300 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                  Konsultasikan arsitektur website dan strategi SEO teknis bersama kami untuk mendongkrak peringkat Google bisnis Anda.
                </p>
                <Link href="/contact">
                  <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 h-11 transition-colors">
                    Konsultasi SEO Gratis <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs font-mono">
          Masukkan URL website di atas untuk memulai audit on-page SEO.
        </div>
      )}
    </div>
  );
}
