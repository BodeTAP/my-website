import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NameGenerator from "./NameGenerator";

export const metadata: Metadata = {
  title: "Generator Nama Bisnis & Slogan Gratis | MFWEB",
  description:
    "Generate ratusan ide nama bisnis dan slogan dalam hitungan detik. Gratis, instan, sesuai industri dan gaya yang Anda pilih.",
  alternates: { canonical: "/tools/generator-nama" },
};

export default function GeneratorNamaPage() {
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
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-purple-300 mb-6 border border-purple-500/20">
            ✨ Gratis Selamanya
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Generator <span className="text-gradient">Nama Bisnis</span>
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Dapatkan inspirasi nama bisnis yang unik beserta slogan yang menarik dalam hitungan detik.
            Pilih industri dan gaya, langsung generate.
          </p>
        </div>
        <NameGenerator />
      </div>
    </div>
  );
}
