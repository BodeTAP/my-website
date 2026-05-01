import type { Metadata } from "next";
import PriceCalculator from "./PriceCalculator";
import { FadeUp } from "@/components/public/motion";
import { Calculator } from "lucide-react";

export const metadata: Metadata = {
  title: "Kalkulator Estimasi Harga Website — MFWEB",
  description: "Hitung estimasi biaya pembuatan website untuk bisnis Anda secara instan. Pilih tipe website dan fitur yang dibutuhkan.",
  alternates: { canonical: "/kalkulasi-harga" },
};

export default function KalkulasiPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030914]">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/20 to-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          <FadeUp delay={0} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-blue-300 mb-8 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-blue-500/5">
              <Calculator className="w-4 h-4 text-blue-400" />
              Kalkulator Harga
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Hitung <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Investasi</span> <br className="hidden sm:block" />Digital Anda
            </h1>
            <p className="text-blue-200/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Pilih tipe platform dan fitur tambahan yang bisnis Anda butuhkan. Dapatkan estimasi anggaran awal secara transparan dan instan.
            </p>
          </FadeUp>

          <PriceCalculator />
        </div>
      </div>
    </div>
  );
}
