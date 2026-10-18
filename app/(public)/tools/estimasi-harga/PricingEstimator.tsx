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
      ? <strong key={j} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>
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
      <h3 key={i} className="text-slate-900 font-bold text-base sm:text-lg mt-6 mb-3 first:mt-0 flex items-center gap-2 break-words">
        <span className="size-2 rounded-full bg-slate-900 shrink-0" />
        <span>{heading[1].replace(/\*\*/g, "")}</span>
      </h3>
    );
  }

  const cells = line.startsWith("|")
    ? line.split("|").map((cell) => cell.trim()).filter(Boolean)
    : [];
  if (cells.length >= 2) {
    return (
      <div key={i} className="grid gap-2 sm:grid-cols-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
        {cells.map((cell, j) => (
          <span key={j} className={j === 0 ? "text-slate-900 font-bold break-words" : "text-slate-600 break-words"}>
            {renderInline(cell)}
          </span>
        ))}
      </div>
    );
  }

  if (line.startsWith("**") && line.endsWith("**")) {
    return <p key={i} className="text-slate-900 font-bold break-words">{line.slice(2, -2)}</p>;
  }

  if (line.startsWith("- ")) {
    return (
      <div key={i} className="flex items-start gap-2.5 text-slate-700 leading-relaxed text-sm">
        <CheckCircle2 className="mt-0.5 size-4 text-emerald-600 shrink-0" />
        <p className="min-w-0 break-words">{renderInline(line.slice(2))}</p>
      </div>
    );
  }

  if (line.match(/^\d+\./)) {
    return (
      <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 text-sm leading-relaxed break-words">
        {renderInline(line.replace(/^\d+\.\s*/, ""))}
      </div>
    );
  }

  const isPriceLine = /rp\s?\d|harga|estimasi|total|range/i.test(line);
  return (
    <p
      key={i}
      className={`leading-relaxed break-words text-sm ${
        isPriceLine
          ? "rounded-xl bg-[#1E242E] text-white px-4 py-3 font-mono font-medium"
          : "text-slate-600"
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-px w-6 bg-slate-400" />
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Langkah 1</span>
            </div>
            <label className="text-slate-900 font-bold text-sm block">Jenis Usaha / Industri *</label>
            <div className="flex flex-wrap gap-2">
              {BISNIS_TYPES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, bisnisType: b }))}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.bisnisType === b
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Jenis Website */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-px w-6 bg-slate-400" />
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Langkah 2</span>
            </div>
            <label className="text-slate-900 font-bold text-sm block">Model Website yang Dibutuhkan *</label>
            <div className="flex flex-wrap gap-2">
              {WEBSITE_TYPES.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, websiteType: w }))}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.websiteType === w
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Fitur Tambahan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-px w-6 bg-slate-400" />
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">Langkah 3</span>
            </div>
            <label className="text-slate-900 font-bold text-sm block">
              Fitur Tambahan <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {FITUR_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFitur(f)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.fitur.includes(f)
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Halaman & Timeline */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <label className="text-slate-900 font-bold text-sm block">Estimasi Halaman</label>
              <div className="flex flex-wrap gap-2">
                {HALAMAN_OPTIONS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, halaman: h }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.halaman === h
                        ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <label className="text-slate-900 font-bold text-sm block">Target Pengerjaan</label>
              <div className="flex flex-wrap gap-2">
                {TIMELINE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, timeline: t }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.timeline === t
                        ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-rose-600 text-sm bg-rose-50 p-4 rounded-xl border border-rose-200">{error}</p>}

          <Button
            type="submit"
            disabled={!form.bisnisType || !form.websiteType}
            className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-12 font-medium gap-2 disabled:opacity-40 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Hitung Estimasi Biaya
          </Button>
        </form>
      )}

      {/* Streaming result */}
      {(result || loading) && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            {loading && !result && (
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">AI sedang menyusun rincian estimasi biaya...</span>
              </div>
            )}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="size-4 text-slate-700 shrink-0" />
                  <p className="text-sm font-bold text-slate-900">Rincian Estimasi Proyek</p>
                </div>
                {done && (
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    Selesai
                  </span>
                )}
              </div>
              <div className="space-y-3 p-6 sm:p-8 text-sm">
                {result.split("\n").map((line, i) => renderLine(line, i))}
              </div>
              {loading && (
                <span className="mx-6 mb-5 inline-block h-4 w-1.5 bg-slate-900 align-middle animate-pulse" />
              )}
            </div>
          </div>

          {done && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="flex-1">
                <Button className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white h-12 font-medium gap-2 transition-colors">
                  Konsultasi Spesifikasi Gratis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-12 px-6 gap-2 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" /> Hitung Ulang
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
