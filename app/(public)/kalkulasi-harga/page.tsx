import type { Metadata } from "next";
import PriceCalculator from "./PriceCalculator";
import { FadeUp } from "@/components/public/motion";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/public/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mfweb.maffisorp.id";

export const metadata: Metadata = {
  title: "Kalkulator Estimasi Harga Website",
  description: "Hitung estimasi biaya pembuatan website untuk bisnis Anda secara instan. Pilih tipe website dan fitur yang dibutuhkan.",
  alternates: { canonical: "/kalkulasi-harga" },
};

export default function KalkulasiPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Beranda", item: SITE_URL },
    { name: "Kalkulasi Harga", item: `${SITE_URL}/kalkulasi-harga` },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-kalkulasi-harga" data={breadcrumbJsonLd} />

      {/* ── Full-Width Deep Slate Hero ────────────────────── */}
      <section className="w-full bg-[#1E242E] text-white pt-28 pb-16 sm:pt-32 sm:pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Kalkulasi Harga" }]} />

          <div className="max-w-3xl mx-auto text-center mt-6">
            <FadeUp>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-8 bg-slate-500" />
                <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                  Estimasi Investasi Digital
                </span>
                <span className="h-px w-8 bg-slate-500" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15] mb-4">
                Hitung estimasi biaya website Anda
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Pilih model website dan fitur fungsional yang bisnis Anda perlukan. Dapatkan perkiraan anggaran awal secara transparan dan terukur.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Calculator Main Section ───────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PriceCalculator />
        </div>
      </section>
    </div>
  );
}
