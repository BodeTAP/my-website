import type { Metadata } from "next";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildPublicBreadcrumbJsonLd } from "@/components/public/JsonLd";
import PricingEstimator from "./PricingEstimator";
import { getAiSettings } from "@/lib/aiSettings";

export const metadata: Metadata = {
  title: "Estimasi Harga Pembuatan Website Gratis",
  description:
    "Dapatkan estimasi biaya pembuatan website secara instan menggunakan AI. Gratis, tanpa registrasi. Pilih jenis bisnis, fitur, dan timeline Anda.",
  alternates: { canonical: "/tools/estimasi-harga" },
};

export default async function EstimasiHargaPage() {
  const aiSettings = await getAiSettings();
  const breadcrumbJsonLd = buildPublicBreadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Estimasi Harga Website", path: "/tools/estimasi-harga" },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-estimasi-harga" data={breadcrumbJsonLd} />

      {/* Hero */}
      <section className="w-full bg-[#1E242E] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Estimasi Harga Website" }]} />
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-slate-500" />
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                AI Utility
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Kalkulator Estimasi Biaya Website
            </h1>
            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Tentukan ruang lingkup bisnis, model website, dan fitur yang dibutuhkan. AI kami akan memproyeksikan estimasi investasi dan breakdown pengerjaan secara transparan.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          {aiSettings.features.pricingEstimator.enabled ? (
            <PricingEstimator />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h2 className="text-slate-900 font-bold mb-2">Estimasi harga sedang dinonaktifkan</h2>
              <p className="text-slate-600 text-sm">
                Layanan estimasi otomatis sedang menjalani pemeliharaan berkala. Silakan hubungi kami langsung via WhatsApp untuk penawaran.
              </p>
            </div>
          )}

          <p className="text-center text-slate-400 text-xs font-mono mt-8">
            * Estimasi bersifat indikatif. Biaya final ditentukan berdasarkan spesifikasi teknis dan ruang lingkup akhir.
          </p>
        </div>
      </section>
    </div>
  );
}
