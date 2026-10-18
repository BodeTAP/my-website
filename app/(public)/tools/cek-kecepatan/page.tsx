import type { Metadata } from "next";
import SpeedChecker from "./SpeedChecker";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildPublicBreadcrumbJsonLd } from "@/components/public/JsonLd";

export const metadata: Metadata = {
  title: "Cek Kecepatan Website Gratis — PageSpeed Insights",
  description:
    "Cek kecepatan dan performa website Anda secara gratis menggunakan Google PageSpeed Insights. Dapatkan Core Web Vitals dan rekomendasi perbaikan instan.",
  alternates: { canonical: "/tools/cek-kecepatan" },
};

export default function CekKecepatanPage() {
  const breadcrumbJsonLd = buildPublicBreadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Cek Kecepatan Website", path: "/tools/cek-kecepatan" },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-cek-kecepatan" data={breadcrumbJsonLd} />

      {/* Hero */}
      <section className="w-full bg-[#1E242E] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Cek Kecepatan Website" }]} />
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-slate-500" />
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                Free Utility
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Cek Kecepatan Website
            </h1>
            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Didukung oleh Google PageSpeed Insights. Masukkan URL website Anda untuk menganalisis performa Core Web Vitals dan mendapatkan rekomendasi perbaikan teknis.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form & Results */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <SpeedChecker />
        </div>
      </section>
    </div>
  );
}
