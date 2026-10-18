"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Copy, Check, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343";

const INDUSTRIES = [
  { value: "teknologi", label: "Teknologi / IT" },
  { value: "kuliner", label: "Kuliner / F&B" },
  { value: "fashion", label: "Fashion / Pakaian" },
  { value: "kesehatan", label: "Kesehatan / Kecantikan" },
  { value: "properti", label: "Properti / Konstruksi" },
  { value: "jasa", label: "Jasa / Konsultasi" },
  { value: "pendidikan", label: "Pendidikan / Pelatihan" },
  { value: "retail", label: "Retail / Toko" },
  { value: "otomotif", label: "Otomotif / Bengkel" },
  { value: "hiburan", label: "Hiburan / Event" },
];

const STYLES = [
  { value: "profesional", label: "Profesional" },
  { value: "modern", label: "Modern & Tech" },
  { value: "kreatif", label: "Kreatif" },
  { value: "tradisional", label: "Lokal / Tradisional" },
  { value: "internasional", label: "Internasional" },
];

type NameSuggestion = {
  name: string;
  slogan: string;
};

export default function NameGenerator() {
  const [industry, setIndustry] = useState("teknologi");
  const [style, setStyle] = useState("profesional");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<NameSuggestion[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tools/generator-nama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, style, keyword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal generate nama bisnis");
      setResults(Array.isArray(data.suggestions) ? data.suggestions : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal generate nama bisnis");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(idx: number, name: string, slogan: string) {
    void navigator.clipboard.writeText(`${name}\n${slogan}`);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-px w-6 bg-slate-400" />
          <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
            Parameter Ide
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          Pilih Industri & Karakter Bisnis
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Kombinasikan kategori bidang usaha dan nuansa brand yang ingin Anda bangun.
        </p>

        <div className="space-y-5">
          <div>
            <label className="text-slate-900 font-bold text-xs mb-2 block uppercase tracking-wider font-mono">
              Industri / Bidang Usaha
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all cursor-pointer font-medium"
            >
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-900 font-bold text-xs mb-2 block uppercase tracking-wider font-mono">
              Gaya & Karakter Nama
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStyle(s.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                    style === s.value
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-900 font-bold text-xs mb-2 block uppercase tracking-wider font-mono">
              Kata Kunci Relevan <span className="text-slate-400 font-normal font-sans">(opsional)</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) void handleGenerate();
              }}
              placeholder="Contoh: kopi, kota Malang, premium, eco"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={() => void handleGenerate()}
            disabled={loading}
            className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 px-8 disabled:opacity-50 transition-colors"
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            {loading ? "Memproses Ide..." : "Generate Nama"}
          </Button>
          {results.length > 0 && (
            <Button
              onClick={() => void handleGenerate()}
              disabled={loading}
              variant="outline"
              className="rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-11 px-6 font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Buat Ide Baru
            </Button>
          )}
        </div>
        {error && <p className="mt-4 text-sm text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-200">{error}</p>}
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  Inspirasi Brand
                </span>
                <h3 className="text-lg font-bold text-slate-900">Rekomendasi Nama ({results.length})</h3>
              </div>
              <span className="text-slate-400 text-xs font-mono">Klik salin untuk menyalin ke clipboard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((r, i) => (
                <motion.div
                  key={`${r.name}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 p-5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <p className="text-slate-900 font-bold text-lg mb-1 tracking-tight">{r.name}</p>
                    <p className="text-slate-600 text-xs leading-relaxed mb-4">{r.slogan}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60 flex-wrap">
                    <button
                      onClick={() => handleCopy(i, r.name, r.slogan)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-700 hover:text-slate-900 font-medium transition-colors"
                    >
                      {copiedIdx === i ? (
                        <><Check className="w-3.5 h-3.5 text-emerald-600" /> Disalin!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5 text-slate-500" /> Salin</>
                      )}
                    </button>
                    <a
                      href={`https://wa.me/${WA}?text=${encodeURIComponent(
                        `Halo MFWEB, saya ingin membuat website untuk bisnis saya:\n\nNama Bisnis: ${r.name}\nSlogan: ${r.slogan}\n\nBoleh konsultasi pembuatan website?`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-900 hover:underline font-semibold ml-auto"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-slate-800" /> Bikin Website
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {results.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs font-mono">
          Pilih industri dan gaya di atas, lalu tekan tombol Generate Nama untuk memulai.
        </div>
      )}
    </div>
  );
}
