"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, RefreshCw, Sparkles } from "lucide-react";
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

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
      : part,
  );
}

function cleanLine(line: string) {
  return line
    .replace(/^`{3,}\w*/, "")
    .replace(/`{3,}$/g, "")
    .trim();
}

function renderLine(rawLine: string, i: number) {
  const line = cleanLine(rawLine);
  if (!line) return <div key={i} className="h-2" />;
  if (/^-{3,}$/.test(line) || /^\|?\s*:?-{3,}/.test(line) || /^[|\-\s:]+$/.test(line)) {
    return null;
  }

  const heading = line.match(/^#{1,6}\s+(.+)$/);
  if (heading) {
    return (
      <h3 key={i} className="text-white font-bold text-base sm:text-lg mt-6 mb-3 first:mt-0 flex items-start gap-2 break-words">
        <span className="mt-1 size-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.8)] shrink-0" />
        <span>{heading[1].replace(/\*\*/g, "")}</span>
      </h3>
    );
  }

  const cells = line.startsWith("|")
    ? line.split("|").map((cell) => cell.trim()).filter(Boolean)
    : [];
  if (cells.length >= 2) {
    return (
      <div key={i} className="grid gap-2 sm:grid-cols-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
        {cells.map((cell, j) => (
          <span key={j} className={j === 0 ? "text-white font-semibold break-words" : "text-blue-100/75 break-words"}>
            {renderInline(cell)}
          </span>
        ))}
      </div>
    );
  }

  if (line.startsWith("**") && line.endsWith("**")) {
    return <p key={i} className="text-blue-100 font-semibold break-words">{line.slice(2, -2)}</p>;
  }

  if (line.startsWith("- ")) {
    return (
      <div key={i} className="flex items-start gap-2 text-blue-100/75 leading-relaxed">
        <CheckCircle2 className="mt-0.5 size-4 text-emerald-300 shrink-0" />
        <p className="min-w-0 break-words">{renderInline(line.slice(2))}</p>
      </div>
    );
  }

  if (line.match(/^\d+\./)) {
    return (
      <div key={i} className="rounded-xl border border-blue-400/10 bg-blue-400/[0.04] px-4 py-3 text-blue-100/80 leading-relaxed break-words">
        {renderInline(line.replace(/^\d+\.\s*/, ""))}
      </div>
    );
  }

  const isPriceLine = /rp\s?\d|harga|estimasi|total|range/i.test(line);
  return (
    <p
      key={i}
      className={`leading-relaxed break-words ${
        isPriceLine
          ? "rounded-xl bg-orange-400/[0.07] border border-orange-300/10 px-4 py-3 text-orange-100"
          : "text-blue-100/72"
      }`}
    >
      {renderInline(line)}
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
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
            <div className="rounded-2xl border border-white/10 bg-[#071327]/80 overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="size-4 text-orange-300 shrink-0" />
                  <p className="text-sm font-semibold text-white">Hasil estimasi website</p>
                </div>
                {done && <span className="text-xs text-emerald-300">Selesai</span>}
              </div>
              <div className="space-y-2 p-5 sm:p-6 text-sm">
                {result.split("\n").map((line, i) => renderLine(line, i))}
              </div>
              {loading && (
                <span className="mx-6 mb-5 inline-block h-4 w-1.5 bg-blue-400 align-middle animate-pulse" />
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
