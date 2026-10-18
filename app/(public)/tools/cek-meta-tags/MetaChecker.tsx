"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, CheckCircle2, XCircle, Globe, Share2 } from "lucide-react";
import type { MetaResult } from "@/app/api/tools/meta-tags/route";
import { Button } from "@/components/ui/button";

function truncate(s: string | null, n: number) {
  if (!s) return null;
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className={`mt-0.5 shrink-0 ${value ? "text-emerald-600" : "text-rose-400"}`}>
        {value ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-500 font-mono text-xs uppercase tracking-wider mb-0.5">{label}</p>
        {value
          ? <p className="text-slate-900 font-medium text-sm break-words">{value}</p>
          : <p className="text-slate-400 text-sm italic">Tidak ditemukan</p>}
      </div>
    </div>
  );
}

export default function MetaChecker() {
  const [url,     setUrl]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<MetaResult | null>(null);
  const [error,   setError]   = useState("");

  async function handleCheck() {
    if (!url.trim()) return;
    setLoading(true); setResult(null); setError("");
    try {
      const res  = await fetch("/api/tools/meta-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Terjadi kesalahan");
      else setResult(data as MetaResult);
    } catch { setError("Tidak dapat terhubung ke server."); }
    finally { setLoading(false); }
  }

  // Google preview
  const googleTitle = truncate(result?.og.title ?? result?.title ?? null, 60);
  const googleDesc  = truncate(result?.og.description ?? result?.description ?? null, 160);
  const googleUrl   = result?.url ?? "";

  // OG image URL
  const ogImage = result?.og.image ?? result?.twitter.image ?? null;

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-px w-6 bg-slate-400" />
          <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
            Analisis Metadata
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          Masukkan URL Website
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Sistem akan membedah tag meta dasar, Open Graph, dan Twitter card yang terpasang pada halaman.
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
                <Search className="w-4 h-4" /> Cek Meta Tags
              </span>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl p-5 border border-rose-200 bg-rose-50 text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Google Search Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-700 font-bold">
                  Pratinjau Google Search
                </h3>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  {result.favicon && (
                    <Image src={result.favicon} alt="" width={16} height={16} className="w-4 h-4 rounded-xs" unoptimized onError={() => {}} />
                  )}
                  <p className="text-slate-500 font-mono text-xs truncate">{googleUrl}</p>
                </div>
                <p className="text-blue-700 text-base font-semibold leading-snug hover:underline cursor-pointer mb-1.5">
                  {googleTitle ?? <span className="text-rose-600 italic text-sm">Tidak ada tag title</span>}
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {googleDesc ?? <span className="text-rose-600 italic">Tidak ada meta description</span>}
                </p>
              </div>
            </div>

            {/* Social Share Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-700 font-bold">
                  Pratinjau Kartu Media Sosial (Facebook / WhatsApp / LinkedIn)
                </h3>
              </div>
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white max-w-md shadow-xs">
                {ogImage ? (
                  <Image src={ogImage} alt="OG Image" width={500} height={260} className="w-full h-44 object-cover" unoptimized onError={() => {}} />
                ) : (
                  <div className="w-full h-36 bg-slate-100 flex items-center justify-center border-b border-slate-200">
                    <p className="text-slate-400 text-xs font-mono">Gambar Open Graph (og:image) tidak ditemukan</p>
                  </div>
                )}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                  {result.og.siteName && (
                    <p className="text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-1">{result.og.siteName}</p>
                  )}
                  <p className="text-slate-900 font-bold text-sm leading-snug">
                    {result.og.title ?? result.title ?? <span className="text-rose-600 italic">Tidak ada judul</span>}
                  </p>
                  {(result.og.description ?? result.description) && (
                    <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {result.og.description ?? result.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Raw tags */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-6 bg-slate-400" />
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                  Daftar Tag Lengkap
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Detail Parameter Meta</h3>
              <div className="divide-y divide-slate-100">
                <Row label="Title"              value={result.title} />
                <Row label="Meta Description"   value={result.description} />
                <Row label="Canonical URL"       value={result.canonical} />
                <Row label="Robots"              value={result.robots} />
                <Row label="og:title"            value={result.og.title} />
                <Row label="og:description"      value={result.og.description} />
                <Row label="og:image"            value={result.og.image} />
                <Row label="og:site_name"        value={result.og.siteName} />
                <Row label="twitter:card"        value={result.twitter.card} />
                <Row label="twitter:title"       value={result.twitter.title} />
                <Row label="twitter:description" value={result.twitter.description} />
                <Row label="twitter:image"       value={result.twitter.image} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs font-mono">
          Ketikkan alamat URL website di atas untuk melihat pratinjau media sosial dan meta tags.
        </div>
      )}
    </div>
  );
}
