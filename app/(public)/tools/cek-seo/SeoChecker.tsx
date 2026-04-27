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
  pass: { icon: CheckCircle2, text: "text-green-400", bg: "border-green-500/10 bg-green-500/3" },
  warn: { icon: AlertTriangle, text: "text-orange-400", bg: "border-orange-500/10 bg-orange-500/3" },
  fail: { icon: XCircle, text: "text-red-400", bg: "border-red-500/10 bg-red-500/3" },
};

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 75 ? "#34d399" : score >= 50 ? "#fb923c" : "#f87171";
  const label = score >= 75 ? "Baik" : score >= 50 ? "Perlu Perbaikan" : "Kritis";
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
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
      <span className="text-sm font-semibold" style={{ color }}>SEO Score {label}</span>
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
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const passCount = result?.checks.filter((c) => c.status === "pass").length ?? 0;
  const warnCount = result?.checks.filter((c) => c.status === "warn").length ?? 0;
  const failCount = result?.checks.filter((c) => c.status === "fail").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">
          <span className="text-teal-400 mr-2">01</span> Masukkan URL Website
        </h2>
        <p className="text-blue-200/40 text-sm mb-5">Analisis akan dilakukan pada halaman yang Anda masukkan.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="https://namabisnis.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-blue-200/30 text-sm focus:outline-none focus:border-teal-500/50 transition-colors"
          />
          <Button
            onClick={handleCheck}
            disabled={loading || !url.trim()}
            className="bg-teal-600 hover:bg-teal-500 text-white h-11 px-8 disabled:opacity-50 whitespace-nowrap"
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
                <SearchCheck className="w-4 h-4" /> Cek SEO
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
            className="glass rounded-xl p-4 border border-red-500/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
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
            {/* Score overview */}
            <div className="glass rounded-2xl p-6 border border-teal-500/10">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreGauge score={result.score} />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-blue-200/40 text-xs mb-1">SEO On-Page Analysis</p>
                  <h3 className="text-white font-bold text-base mb-3 break-all">{result.url}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-bold text-lg">{passCount}</span>
                      <span className="text-blue-200/50 text-sm">Lulus</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 font-bold text-lg">{warnCount}</span>
                      <span className="text-blue-200/50 text-sm">Peringatan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-bold text-lg">{failCount}</span>
                      <span className="text-blue-200/50 text-sm">Gagal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 text-sm">
                Detail Pemeriksaan ({result.checks.length} faktor)
              </h3>
              <div className="space-y-2">
                {result.checks.map((check, i) => {
                  const { icon: Icon, text, bg } = STATUS[check.status];
                  return (
                    <motion.div
                      key={check.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${bg}`}
                    >
                      <Icon className={`w-4 h-4 ${text} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-white text-sm font-medium">{check.label}</span>
                          <span className={`text-xs font-bold ${text} shrink-0`}>
                            {check.points}/{check.maxPoints} poin
                          </span>
                        </div>
                        <p className="text-blue-200/50 text-xs mt-0.5">{check.detail}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {(failCount > 0 || warnCount > 0) && (
              <div className="glass rounded-2xl p-6 border border-teal-500/10 text-center">
                <p className="text-white font-semibold mb-2">Perlu Perbaikan SEO?</p>
                <p className="text-blue-200/50 text-sm mb-4">
                  Tim MFWEB siap membantu memperbaiki semua faktor SEO yang bermasalah di website Anda.
                </p>
                <Link href="/contact">
                  <Button className="bg-teal-600 hover:bg-teal-500 text-white">
                    Konsultasi SEO Gratis <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && !error && (
        <div className="text-center py-8 text-blue-200/25 text-sm">
          ← Masukkan URL website untuk analisis SEO
        </div>
      )}
    </div>
  );
}
