import type { Metadata } from "next";
import MetaChecker from "./MetaChecker";
import Breadcrumb from "@/components/public/Breadcrumb";

export const metadata: Metadata = {
  title: "Cek Meta Tags Website — Preview Google & Sosmed Gratis | MFWEB",
  description: "Lihat meta tags website Anda dan preview tampilan di Google Search, Facebook, dan WhatsApp. Cek title, description, og:image, dan lainnya secara instan.",
  alternates: { canonical: "/tools/cek-meta-tags" },
};

export default function CekMetaTagsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Cek Meta Tags" }]} />
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-purple-300 mb-6 border border-purple-500/20">
            🔍 Gratis Selamanya
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Cek <span className="text-gradient">Meta Tags</span> Website
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Lihat bagaimana website Anda tampil di Google Search, Facebook, dan WhatsApp.
            Cek title, description, og:image, dan semua meta tags sekaligus.
          </p>
        </div>
        <MetaChecker />
      </div>
    </div>
  );
}
