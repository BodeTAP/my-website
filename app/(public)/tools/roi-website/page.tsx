import type { Metadata } from "next";
import ROICalculator from "./ROICalculator";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildPublicBreadcrumbJsonLd } from "@/components/public/JsonLd";

export const metadata: Metadata = {
  title: "Kalkulator ROI Website Bisnis — Hitung Keuntungan",
  description: "Hitung estimasi keuntungan dan ROI jika bisnis Anda memiliki website. Masukkan estimasi pengunjung, conversion rate, dan nilai order untuk melihat potensi revenue.",
  alternates: { canonical: "/tools/roi-website" },
};

export default function ROIPage() {
  const breadcrumbJsonLd = buildPublicBreadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Kalkulator ROI Website", path: "/tools/roi-website" },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-roi-website" data={breadcrumbJsonLd} />

      {/* Hero */}
      <section className="w-full bg-[#1E242E] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Kalkulator ROI Website" }]} />
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-slate-500" />
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                Free Utility
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Kalkulator ROI Website Bisnis
            </h1>
            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Berapa potensi pertumbuhan laba yang dapat dihasilkan website untuk bisnis Anda? Hitung estimasi traffic, konversi leads, proyeksi omzet tahunan, dan masa pengembalian modal secara realistis.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <ROICalculator />
        </div>
      </section>
    </div>
  );
}
