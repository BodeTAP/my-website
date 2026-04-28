import type { Metadata } from "next";
import ROICalculator from "./ROICalculator";
import Breadcrumb from "@/components/public/Breadcrumb";

export const metadata: Metadata = {
  title: "Kalkulator ROI Website Bisnis — Hitung Keuntungan | MFWEB",
  description: "Hitung estimasi keuntungan dan ROI jika bisnis Anda memiliki website. Masukkan estimasi pengunjung, conversion rate, dan nilai order untuk melihat potensi revenue.",
  alternates: { canonical: "/tools/roi-website" },
};

export default function ROIPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Kalkulator ROI Website" }]} />
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-teal-300 mb-6 border border-teal-500/20">
            📈 Gratis Selamanya
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Kalkulator <span className="text-gradient">ROI Website</span>
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Berapa keuntungan yang bisa didapat jika bisnis Anda punya website?
            Hitung estimasi leads, revenue, dan ROI-nya sekarang.
          </p>
        </div>
        <ROICalculator />
      </div>
    </div>
  );
}
