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
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">
          <span className="text-purple-400 mr-2">01</span> Pilih Industri & Gaya
        </h2>
        <p className="text-blue-200/40 text-sm mb-5">Sesuaikan dengan karakter bisnis Anda.</p>

        <div className="space-y-5">
          <div>
            <label className="text-blue-200/60 text-xs mb-2 block">Industri / Bidang Bisnis</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer"
            >
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value} className="bg-[#0a1628] text-white">
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-blue-200/60 text-xs mb-2 block">Gaya Nama</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                    style === s.value
                      ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                      : "glass border-white/10 text-blue-200/60 hover:border-white/20"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-blue-200/60 text-xs mb-2 block">
              Kata Kunci <span className="text-blue-200/30">(opsional)</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) void handleGenerate();
              }}
              placeholder="Contoh: nama pemilik, kota, atau kata unik"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-blue-200/30 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <Button
            onClick={() => void handleGenerate()}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 text-white h-11 px-8"
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            {loading ? "Memproses..." : "Generate Nama"}
          </Button>
          {results.length > 0 && (
            <Button
              onClick={() => void handleGenerate()}
              disabled={loading}
              variant="outline"
              className="h-11 border-white/10 text-white hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Generate Ulang
            </Button>
          )}
        </div>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-white font-semibold text-sm">Hasil Generate ({results.length} nama)</h3>
              <span className="text-blue-200/30 text-xs">Klik Salin untuk copy nama + slogan</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((r, i) => (
                <motion.div
                  key={`${r.name}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="group bg-white/3 border border-white/8 hover:border-purple-500/30 rounded-xl p-4 transition-colors"
                >
                  <p className="text-white font-bold text-lg mb-1">{r.name}</p>
                  <p className="text-blue-200/50 text-xs leading-relaxed mb-3">{r.slogan}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleCopy(i, r.name, r.slogan)}
                      className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {copiedIdx === i ? (
                        <><Check className="w-3.5 h-3.5" /> Disalin!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Salin</>
                      )}
                    </button>
                    <a
                      href={`https://wa.me/${WA}?text=${encodeURIComponent(
                        `Halo MFWEB, saya ingin membuat website untuk bisnis saya:\n\nNama Bisnis: ${r.name}\nSlogan: ${r.slogan}\n\nBoleh konsultasi pembuatan website?`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Buat Website
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 text-center">
              <p className="text-blue-200/40 text-xs">
                Tidak menemukan yang cocok?{" "}
                <button
                  onClick={() => void handleGenerate()}
                  disabled={loading}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Generate ulang
                </button>{" "}
                untuk hasil baru.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {results.length === 0 && (
        <div className="text-center py-8 text-blue-200/25 text-sm">
          Pilih industri dan gaya, lalu klik Generate Nama
        </div>
      )}
    </div>
  );
}
