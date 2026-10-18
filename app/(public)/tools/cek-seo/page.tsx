import type { Metadata } from "next";
import SeoChecker from "./SeoChecker";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildPublicBreadcrumbJsonLd } from "@/components/public/JsonLd";

export const metadata: Metadata = {
  title: "Cek SEO Score Website Gratis — Analisis On-Page",
  description:
    "Analisis SEO website Anda secara gratis. Cek 13 faktor SEO penting termasuk title, meta description, H1, OG tags, HTTPS, schema markup, dan lainnya.",
  alternates: { canonical: "/tools/cek-seo" },
};

export default function CekSeoPage() {
  const breadcrumbJsonLd = buildPublicBreadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Cek SEO Score", path: "/tools/cek-seo" },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-cek-seo" data={breadcrumbJsonLd} />

      {/* Hero */}
      <section className="w-full bg-[#1E242E] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Cek SEO Score" }]} />
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-slate-500" />
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                Free Utility
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Cek SEO Score Website
            </h1>
            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Analisis 13 faktor SEO on-page penting di website Anda. Dapatkan laporan kepatuhan struktur halaman, meta tag, heading, dan indeksasi secara instan.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form & Results */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <SeoChecker />
        </div>
      </section>
    </div>
  );
}
