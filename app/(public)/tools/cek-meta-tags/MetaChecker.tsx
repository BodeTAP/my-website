"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle, CheckCircle2, XCircle, Globe } from "lucide-react";
import type { MetaResult } from "@/app/api/tools/meta-tags/route";

function truncate(s: string | null, n: number) {
  if (!s) return null;
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className={`mt-0.5 shrink-0 ${value ? "text-green-400" : "text-red-400/60"}`}>
        {value ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-blue-200/50 text-xs mb-0.5">{label}</p>
        {value
          ? <p className="text-white text-sm break-words">{value}</p>
          : <p className="text-red-400/50 text-sm italic">Tidak ditemukan</p>}
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

  // Google preview: title max 60 chars, desc max 160 chars
  const googleTitle = truncate(result?.og.title ?? result?.title ?? null, 60);
  const googleDesc  = truncate(result?.og.description ?? result?.description ?? null, 160);
  const googleUrl   = result?.url ?? "";

  // OG image URL
  const ogImage = result?.og.image ?? result?.twitter.image ?? null;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">
          <span className="text-purple-400 mr-2">01</span> Masukkan URL Website
        </h2>
        <p className="text-blue-200/40 text-sm mb-5">Analisis meta tags yang digunakan untuk Google & media sosial.</p>
        <div className="flex gap-3">
          <input
            type="url" value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCheck()}
            placeholder="https://namabisnis.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-blue-200/25 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={handleCheck} disabled={loading || !url.trim()}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            {loading
              ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/></svg> Menganalisis...</>
              : <><Search className="w-4 h-4" /> Cek</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            {/* Google Search Preview */}
            <div className="glass rounded-2xl p-5">
              <p className="text-blue-200/50 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Preview Google Search
              </p>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="flex items-center gap-2 mb-1">
                  {result.favicon && (
                    <Image src={result.favicon} alt="" width={16} height={16} className="w-4 h-4 rounded-sm" unoptimized onError={() => {}} />
                  )}
                  <p className="text-gray-500 text-xs truncate">{googleUrl}</p>
                </div>
                <p className="text-[#1a0dab] text-lg font-medium leading-tight hover:underline cursor-pointer mb-1">
                  {googleTitle ?? <span className="text-red-400 italic text-sm">Tidak ada title</span>}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {googleDesc ?? <span className="text-red-400 italic">Tidak ada meta description</span>}
                </p>
              </div>
            </div>

            {/* Social Share Preview */}
            <div className="glass rounded-2xl p-5">
              <p className="text-blue-200/50 text-xs font-semibold uppercase tracking-wider mb-4">
                Preview Share Media Sosial (Facebook / WhatsApp)
              </p>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-w-sm">
                {ogImage ? (
                  <Image src={ogImage} alt="OG Image" width={500} height={260} className="w-full h-40 object-cover" unoptimized onError={() => {}} />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Tidak ada gambar (og:image)</p>
                  </div>
                )}
                <div className="p-3">
                  {result.og.siteName && <p className="text-gray-500 text-xs uppercase mb-1">{result.og.siteName}</p>}
                  <p className="text-gray-900 font-semibold text-sm leading-snug">
                    {result.og.title ?? result.title ?? <span className="text-red-400 italic">Tidak ada judul</span>}
                  </p>
                  {(result.og.description ?? result.description) && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                      {result.og.description ?? result.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Raw tags */}
            <div className="glass rounded-2xl p-5">
              <p className="text-blue-200/50 text-xs font-semibold uppercase tracking-wider mb-4">Detail Meta Tags</p>
              <div className="space-y-0">
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
        <div className="text-center py-8 text-blue-200/25 text-sm">
          ← Masukkan URL website untuk melihat meta tags-nya
        </div>
      )}
    </div>
  );
}
