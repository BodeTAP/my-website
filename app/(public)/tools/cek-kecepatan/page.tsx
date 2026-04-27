import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SpeedChecker from "./SpeedChecker";

export const metadata: Metadata = {
  title: "Cek Kecepatan Website Gratis — PageSpeed Insights | MFWEB",
  description:
    "Cek kecepatan dan performa website Anda secara gratis menggunakan Google PageSpeed Insights. Dapatkan Core Web Vitals dan rekomendasi perbaikan instan.",
  alternates: { canonical: "/tools/cek-kecepatan" },
};

export default function CekKecepatanPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-blue-400/70 hover:text-blue-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Semua Tools
        </Link>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-blue-300 mb-6 border border-blue-500/20">
            ⚡ Gratis Selamanya
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Cek Kecepatan <span className="text-gradient">Website Anda</span>
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Powered by Google PageSpeed Insights. Masukkan URL website dan dapatkan skor performa
            beserta rekomendasi perbaikan dalam 30 detik.
          </p>
        </div>
        <SpeedChecker />
      </div>
    </div>
  );
}
