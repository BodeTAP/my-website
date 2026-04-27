import type { Metadata } from "next";
import PriceCalculator from "./PriceCalculator";
import Breadcrumb from "@/components/public/Breadcrumb";

export const metadata: Metadata = {
  title: "Kalkulator Estimasi Harga Website",
  description: "Hitung estimasi biaya pembuatan website untuk bisnis Anda secara instan. Pilih tipe website dan fitur yang dibutuhkan.",
  alternates: { canonical: "/kalkulasi-harga" },
};

export default function KalkulasiPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[{ label: "Kalkulator Harga" }]} />
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-blue-300 mb-6 border border-blue-500/20">
            🧮 Kalkulator Harga
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Estimasi Biaya <span className="text-gradient">Website Anda</span>
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Pilih tipe website dan fitur yang Anda butuhkan. Estimasi harga muncul secara otomatis.
            Harga final tergantung dari detail kebutuhan saat konsultasi.
          </p>
        </div>
        <PriceCalculator />
      </div>
    </div>
  );
}
