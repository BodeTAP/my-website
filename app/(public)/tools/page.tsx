import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, SearchCheck, Wand2, QrCode, TrendingUp, Tags, ArrowRight } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

export const metadata: Metadata = {
  title: "Tools Gratis untuk Website & Bisnis — MFWEB",
  description:
    "Cek kecepatan website, analisis SEO, dan generator nama bisnis secara gratis. Tools online dari MFWEB untuk pemilik bisnis lokal.",
  alternates: { canonical: "/tools" },
};

const tools = [
  {
    href: "/tools/cek-kecepatan",
    icon: Gauge,
    color: "blue" as const,
    label: "Cek Kecepatan Website",
    desc: "Audit performa website Anda dengan Google PageSpeed Insights. Dapatkan skor dan rekomendasi perbaikan dalam 30 detik.",
    tags: ["Core Web Vitals", "Mobile & Desktop", "Skor 0–100"],
  },
  {
    href: "/tools/cek-seo",
    icon: SearchCheck,
    color: "teal" as const,
    label: "Cek SEO Score",
    desc: "Analisis 13 faktor SEO penting — title, meta description, H1, OG tags, HTTPS, schema markup, dan banyak lagi.",
    tags: ["13 Faktor SEO", "On-Page Analysis", "Rekomendasi Instan"],
  },
  {
    href: "/tools/generator-nama",
    icon: Wand2,
    color: "purple" as const,
    label: "Generator Nama Bisnis",
    desc: "Generate ratusan ide nama bisnis dan slogan dalam hitungan detik. Pilih industri dan gaya, langsung dapat inspirasi.",
    tags: ["10 Industri", "5 Gaya Nama", "Lengkap dengan Slogan"],
  },
  {
    href: "/tools/qr-code",
    icon: QrCode,
    color: "green" as const,
    label: "Generator QR Code",
    desc: "Buat QR Code untuk URL website, nomor WhatsApp, atau teks bebas. Download PNG langsung, gratis tanpa daftar.",
    tags: ["URL / Link", "WhatsApp", "Download PNG"],
  },
  {
    href: "/tools/roi-website",
    icon: TrendingUp,
    color: "teal" as const,
    label: "Kalkulator ROI Website",
    desc: "Hitung estimasi keuntungan jika bisnis Anda punya website. Input pengunjung & conversion rate, lihat potensi revenue dan ROI.",
    tags: ["8 Jenis Industri", "Estimasi Revenue", "Payback Period"],
  },
  {
    href: "/tools/cek-meta-tags",
    icon: Tags,
    color: "purple" as const,
    label: "Cek Meta Tags",
    desc: "Lihat preview website Anda di Google Search, Facebook, dan WhatsApp. Cek title, description, og:image sekaligus.",
    tags: ["Google Preview", "OG Card Preview", "12 Meta Tags"],
  },
];

const COLOR = {
  blue:   { bg: "bg-blue-600/10",   border: "border-blue-500/25",   text: "text-blue-400",   badge: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  teal:   { bg: "bg-teal-600/10",   border: "border-teal-500/25",   text: "text-teal-400",   badge: "bg-teal-500/10 text-teal-300 border-teal-500/20" },
  purple: { bg: "bg-purple-600/10", border: "border-purple-500/25", text: "text-purple-400", badge: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
  green:  { bg: "bg-green-600/10",  border: "border-green-500/25",  text: "text-green-400",  badge: "bg-green-500/10 text-green-300 border-green-500/20" },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-blue-300 mb-6 border border-blue-500/20">
            🛠️ Tools Gratis
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Tools Gratis untuk <span className="text-gradient">Bisnis Anda</span>
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Analisis website dan dapatkan inspirasi bisnis tanpa biaya. Gunakan tools ini untuk
            mengidentifikasi masalah dan menemukan peluang pertumbuhan.
          </p>
        </FadeUp>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const c = COLOR[tool.color];
            return (
              <StaggerItem key={tool.href}>
                <Link href={tool.href} className="group block h-full">
                  <div
                    className={`relative h-full glass rounded-2xl p-6 border ${c.border} hover:border-opacity-60 transition-all duration-300 flex flex-col`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-5`}>
                      <tool.icon className={`w-6 h-6 ${c.text}`} />
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                        GRATIS
                      </span>
                    </div>
                    <h2 className="text-white font-bold text-lg mb-2">{tool.label}</h2>
                    <p className="text-blue-200/60 text-sm leading-relaxed mb-5 flex-1">{tool.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {tool.tags.map((tag) => (
                        <span key={tag} className={`text-[11px] px-2 py-0.5 rounded-md border ${c.badge}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 text-sm font-medium ${c.text} group-hover:gap-3 transition-all duration-200`}
                    >
                      Gunakan Tool <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerChildren>

        <FadeUp className="mt-16 glass rounded-2xl p-8 border border-blue-500/10 text-center">
          <p className="text-blue-200/50 text-sm mb-2">Sudah tahu masalah website Anda?</p>
          <h3 className="text-white font-bold text-xl mb-3">Konsultasi Gratis dengan Tim MFWEB</h3>
          <p className="text-blue-200/50 text-sm max-w-md mx-auto mb-6">
            Kami bantu analisis lebih dalam dan buat rencana perbaikan konkret untuk bisnis Anda.
          </p>
          <Link href="/contact">
            <span className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Mulai Konsultasi Gratis <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </FadeUp>
      </div>
    </div>
  );
}
