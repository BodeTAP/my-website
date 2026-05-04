import type { Metadata } from "next";
import Breadcrumb from "@/components/public/Breadcrumb";
import PricingEstimator from "./PricingEstimator";

export const metadata: Metadata = {
  title: "Estimasi Harga Pembuatan Website Gratis | MFWEB",
  description:
    "Dapatkan estimasi biaya pembuatan website secara instan menggunakan AI. Gratis, tanpa registrasi. Pilih jenis bisnis, fitur, dan timeline Anda.",
  alternates: { canonical: "/tools/estimasi-harga" },
};

export default function EstimasiHargaPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Estimasi Harga Website" }]} />

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-orange-300 mb-6 border border-orange-500/20">
            ✨ Powered by AI · Gratis
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Estimasi Harga <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Website</span>
          </h1>
          <p className="text-blue-200/60 max-w-lg mx-auto">
            Isi detail proyek Anda dan AI kami akan memberikan estimasi harga beserta breakdown komponen dalam hitungan detik.
          </p>
        </div>

        <PricingEstimator />

        <p className="text-center text-blue-200/30 text-xs mt-8">
          Estimasi bersifat indikatif. Harga final ditentukan setelah konsultasi dan analisis kebutuhan lengkap.
        </p>
      </div>
    </div>
  );
}
