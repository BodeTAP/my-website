import type { Metadata } from "next";
import NameGenerator from "./NameGenerator";
import Breadcrumb from "@/components/public/Breadcrumb";
import { getAiSettings } from "@/lib/aiSettings";

export const metadata: Metadata = {
  title: "Generator Nama Bisnis & Slogan Gratis | MFWEB",
  description:
    "Generate ratusan ide nama bisnis dan slogan dalam hitungan detik. Gratis, instan, sesuai industri dan gaya yang Anda pilih.",
  alternates: { canonical: "/tools/generator-nama" },
};

export default async function GeneratorNamaPage() {
  const aiSettings = await getAiSettings();

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Generator Nama Bisnis" }]} />
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
        {aiSettings.featureNameGenerator ? (
          <NameGenerator />
        ) : (
          <div className="glass rounded-2xl p-8 border border-white/10 text-center">
            <h2 className="text-white font-semibold mb-2">Generator nama sedang nonaktif</h2>
            <p className="text-blue-200/50 text-sm">
              Tool ini sedang dimatikan sementara oleh admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
