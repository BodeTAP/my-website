import type { Metadata } from "next";
import MetaChecker from "./MetaChecker";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildPublicBreadcrumbJsonLd } from "@/components/public/JsonLd";

export const metadata: Metadata = {
  title: "Cek Meta Tags Website — Preview Google & Sosmed Gratis",
  description: "Lihat meta tags website Anda dan preview tampilan di Google Search, Facebook, dan WhatsApp. Cek title, description, og:image, dan lainnya secara instan.",
  alternates: { canonical: "/tools/cek-meta-tags" },
};

export default function CekMetaTagsPage() {
  const breadcrumbJsonLd = buildPublicBreadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Cek Meta Tags", path: "/tools/cek-meta-tags" },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-cek-meta-tags" data={breadcrumbJsonLd} />

      {/* Hero */}
      <section className="w-full bg-[#1E242E] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Cek Meta Tags" }]} />
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-slate-500" />
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                Free Utility
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Cek Meta Tags & Social Preview
            </h1>
            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Pratinjau tampilan tautan website Anda saat muncul di Google Search, Facebook, LinkedIn, dan WhatsApp. Periksa Open Graph, Twitter Card, dan tag canonical secara lengkap.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form & Results */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <MetaChecker />
        </div>
      </section>
    </div>
  );
}
