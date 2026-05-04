"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const BISNIS_TYPES = [
  "UMKM / Usaha Kecil", "Restoran & Kuliner", "Klinik & Kesehatan",
  "Properti & Kontraktor", "Pendidikan & Kursus", "Fashion & Retail",
  "Jasa & Konsultan", "Teknologi & Startup", "Lainnya",
];

const WEBSITE_TYPES = [
  "Landing Page", "Company Profile", "Toko Online (E-commerce)",
  "Blog / Portal Berita", "Sistem Booking / Reservasi", "Portal / Aplikasi Custom",
];

const FITUR_OPTIONS = [
  "Blog / CMS", "Payment Gateway", "Sistem Booking", "Live Chat / WhatsApp",
  "Multi Bahasa", "SEO Setup", "Galeri Foto/Video", "Form Kontak",
  "Google Maps", "Login Member",
];

const HALAMAN_OPTIONS = ["1-3 halaman", "4-7 halaman", "8-15 halaman", "15+ halaman"];

const TIMELINE_OPTIONS = [
  "Cepat (< 1 minggu)", "Normal (2-3 minggu)", "Santai (> 1 bulan)",
];

function renderLine(line: string, i: number) {
  if (line.startsWith("## ")) {
    return <h3 key={i} className="text-white font-bold text-base mt-5 mb-2 first:mt-0">{line.slice(3)}</h3>;
  }
  if (line.startsWith("**") && line.endsWith("**")) {
    return <p key={i} className="text-blue-300 font-semibold">{line.slice(2, -2)}</p>;
  }
  if (line.startsWith("- ")) {
    return <li key={i} className="text-blue-100/80 ml-4 list-disc">{line.slice(2)}</li>;
  }
  if (line.match(/^\d+\./)) {
    return <li key={i} className="text-blue-100/80 ml-4 list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
  }
  if (line === "") return <div key={i} className="h-1" />;
  // inline bold
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p key={i} className="text-blue-100/70 leading-relaxed">
      {parts.map((part, j) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
          : part
      )}
    </p>
  );
}

export default function PricingEstimator() {
  const [form, setForm] = useState({
    bisnisType: "",
    websiteType: "",
    fitur: [] as string[],
    halaman: "4-7 halaman",
    timeline: "Normal (2-3 minggu)",
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const toggleFitur = (f: string) =>
    setForm((prev) => ({
      ...prev,
      fitur: prev.fitur.includes(f) ? prev.fitur.filter((x) => x !== f) : [...prev.fitur, f],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bisnisType || !form.websiteType) return;
    setLoading(true);
    setResult("");
    setError("");
    setDone(false);

    try {
      const res = await fetch("/api/tools/estimasi-harga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal memproses estimasi");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        text += decoder.decode(value, { stream: true });
        setResult(text);
      }
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult("");
    setDone(false);
    setError("");
  };

  return (
    <div className="space-y-6">
      {!result && !loading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Jenis Bisnis */}
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
            <label className="text-white font-semibold text-sm">Jenis Bisnis Anda *</label>
            <div className="flex flex-wrap gap-2">
              {BISNIS_TYPES.map((b) => (
                <button key={b} type="button" onClick={() => setForm((f) => ({ ...f, bisnisType: b }))}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    form.bisnisType === b
                      ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                      : "bg-white/5 border-white/10 text-blue-200/60 hover:border-white/20 hover:text-white"
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Jenis Website */}
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
            <label className="text-white font-semibold text-sm">Jenis Website yang Dibutuhkan *</label>
            <div className="flex flex-wrap gap-2">
              {WEBSITE_TYPES.map((w) => (
                <button key={w} type="button" onClick={() => setForm((f) => ({ ...f, websiteType: w }))}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    form.websiteType === w
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                      : "bg-white/5 border-white/10 text-blue-200/60 hover:border-white/20 hover:text-white"
                  }`}>
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Fitur Tambahan */}
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
            <label className="text-white font-semibold text-sm">Fitur Tambahan <span className="text-blue-200/40 font-normal">(opsional)</span></label>
            <div className="flex flex-wrap gap-2">
              {FITUR_OPTIONS.map((f) => (
                <button key={f} type="button" onClick={() => toggleFitur(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    form.fitur.includes(f)
                      ? "bg-teal-500/20 border-teal-500/50 text-teal-300"
                      : "bg-white/5 border-white/10 text-blue-200/60 hover:border-white/20 hover:text-white"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Halaman & Timeline */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
              <label className="text-white font-semibold text-sm">Jumlah Halaman</label>
              <div className="flex flex-wrap gap-2">
                {HALAMAN_OPTIONS.map((h) => (
                  <button key={h} type="button" onClick={() => setForm((f) => ({ ...f, halaman: h }))}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      form.halaman === h
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                        : "bg-white/5 border-white/10 text-blue-200/60 hover:border-white/20 hover:text-white"
                    }`}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
              <label className="text-white font-semibold text-sm">Target Waktu</label>
              <div className="flex flex-wrap gap-2">
                {TIMELINE_OPTIONS.map((t) => (
                  <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, timeline: t }))}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      form.timeline === t
                        ? "bg-green-500/20 border-green-500/50 text-green-300"
                        : "bg-white/5 border-white/10 text-blue-200/60 hover:border-white/20 hover:text-white"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <Button type="submit" disabled={!form.bisnisType || !form.websiteType}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white h-12 rounded-xl font-semibold gap-2 shadow-[0_0_20px_rgba(234,88,12,0.3)] disabled:opacity-40">
            <Sparkles className="w-4 h-4" />
            Hitung Estimasi Sekarang
          </Button>
        </form>
      )}

      {/* Streaming result */}
      {(result || loading) && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 border border-white/5 min-h-48">
            {loading && !result && (
              <div className="flex items-center gap-3 text-blue-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">AI sedang menghitung estimasi...</span>
              </div>
            )}
            <div className="prose prose-sm max-w-none space-y-1">
              {result.split("\n").map((line, i) => renderLine(line, i))}
              {loading && (
                <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          </div>

          {done && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="flex-1">
                <Button className="w-full bg-orange-600 hover:bg-orange-500 text-white gap-2">
                  Konsultasi Gratis Sekarang <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" onClick={handleReset}
                className="border-white/10 text-blue-200/60 hover:text-white hover:bg-white/5 gap-2">
                <RefreshCw className="w-4 h-4" /> Hitung Ulang
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
