import type { Metadata } from "next";
import NameGenerator from "./NameGenerator";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildPublicBreadcrumbJsonLd } from "@/components/public/JsonLd";
import { getAiSettings } from "@/lib/aiSettings";

export const metadata: Metadata = {
  title: "Generator Nama Bisnis & Slogan Gratis",
  description:
    "Generate ratusan ide nama bisnis dan slogan dalam hitungan detik. Gratis, instan, sesuai industri dan gaya yang Anda pilih.",
  alternates: { canonical: "/tools/generator-nama" },
};

export default async function GeneratorNamaPage() {
  const aiSettings = await getAiSettings();
  const breadcrumbJsonLd = buildPublicBreadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Generator Nama Bisnis", path: "/tools/generator-nama" },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-generator-nama" data={breadcrumbJsonLd} />

      {/* Hero */}
      <section className="w-full bg-[#1E242E] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Generator Nama Bisnis" }]} />
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-slate-500" />
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                AI Utility
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Generator Nama Bisnis & Slogan
            </h1>
            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Dapatkan puluhan inspirasi nama merek komersial yang berkarakter, unik, dan relevan dengan industri Anda beserta slogan pendampingnya.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          {aiSettings.features.nameGenerator.enabled ? (
            <NameGenerator />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h2 className="text-slate-900 font-bold mb-2">Generator nama sedang dinonaktifkan</h2>
              <p className="text-slate-600 text-sm">
                Fitur generator nama otomatis sedang menjalani pemeliharaan berkala oleh admin.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
