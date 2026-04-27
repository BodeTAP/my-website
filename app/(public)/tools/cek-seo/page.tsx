import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SeoChecker from "./SeoChecker";

export const metadata: Metadata = {
  title: "Cek SEO Score Website Gratis — Analisis On-Page | MFWEB",
  description:
    "Analisis SEO website Anda secara gratis. Cek 13 faktor SEO penting termasuk title, meta description, H1, OG tags, HTTPS, schema markup, dan lainnya.",
  alternates: { canonical: "/tools/cek-seo" },
};

export default function CekSeoPage() {
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
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-teal-300 mb-6 border border-teal-500/20">
            🔍 Gratis Selamanya
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Cek <span className="text-gradient">SEO Score</span> Website
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Analisis 13 faktor SEO on-page penting di website Anda. Gratis, instan, tanpa instalasi apapun.
          </p>
        </div>
        <SeoChecker />
      </div>
    </div>
  );
}
