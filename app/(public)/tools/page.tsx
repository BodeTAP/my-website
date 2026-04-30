import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, SearchCheck, Wand2, QrCode, TrendingUp, Tags, ArrowRight, Wrench, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem, HoverCard, ScaleIn } from "@/components/public/motion";

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
    desc: "Audit performa website Anda dengan Google PageSpeed Insights. Dapatkan metrik kecepatan dan rekomendasi teknis seketika.",
    tags: ["Core Web Vitals", "Mobile & Desktop", "Skor Performa"],
  },
  {
    href: "/tools/cek-seo",
    icon: SearchCheck,
    color: "teal" as const,
    label: "Cek SEO Score",
    desc: "Analisis belasan faktor SEO On-Page krusial — termasuk title, meta description, hierarki heading, tag OG, hingga HTTPS.",
    tags: ["On-Page SEO", "Schema Markup", "Saran Optimasi"],
  },
  {
    href: "/tools/generator-nama",
    icon: Wand2,
    color: "purple" as const,
    label: "Generator Nama Bisnis",
    desc: "Kehabisan ide nama? Generate ratusan kombinasi nama bisnis profesional dan slogan catchy hanya dalam hitungan detik.",
    tags: ["10+ Industri", "Pilihan Gaya Kata", "Slogan Unik"],
  },
  {
    href: "/tools/qr-code",
    icon: QrCode,
    color: "green" as const,
    label: "Generator QR Code",
    desc: "Buat QR Code resolusi tinggi untuk menautkan menu, website, atau chat WhatsApp langsung. Bebas unduh tanpa registrasi.",
    tags: ["URL / Link", "Format WhatsApp", "Resolusi Tinggi"],
  },
  {
    href: "/tools/roi-website",
    icon: TrendingUp,
    color: "teal" as const,
    label: "Kalkulator ROI Digital",
    desc: "Visualisasikan potensi keuntungan. Hitung estimasi cuan bisnis Anda bila memiliki website yang teroptimasi dengan baik.",
    tags: ["Estimasi Revenue", "Payback Period", "Konversi Prospek"],
  },
  {
    href: "/tools/cek-meta-tags",
    icon: Tags,
    color: "purple" as const,
    label: "Cek Meta Tags Sosial",
    desc: "Intip bagaimana tautan website Anda ditampilkan saat dibagikan ke Google Search, Facebook, Twitter, dan WhatsApp.",
    tags: ["Card Preview", "Twitter Card", "Resolusi Gambar"],
  },
];

const COLOR = {
  blue:   { bg: "bg-blue-600/15",   border: "border-blue-500/30",   text: "text-blue-400",   badge: "bg-blue-500/10 text-blue-300 border-blue-500/20", glow: "bg-blue-600/30" },
  teal:   { bg: "bg-teal-600/15",   border: "border-teal-500/30",   text: "text-teal-400",   badge: "bg-teal-500/10 text-teal-300 border-teal-500/20", glow: "bg-teal-600/30" },
  purple: { bg: "bg-purple-600/15", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500/10 text-purple-300 border-purple-500/20", glow: "bg-purple-600/30" },
  green:  { bg: "bg-green-600/15",  border: "border-green-500/30",  text: "text-green-400",  badge: "bg-green-500/10 text-green-300 border-green-500/20", glow: "bg-green-600/30" },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-teal-600/20 to-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 glass px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-teal-300 mb-8 border border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.15)] bg-teal-500/5">
              <Wrench className="w-4 h-4 text-teal-400" />
              Resource Center
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
              Koleksi Tools <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">Gratis</span> <br className="hidden sm:block" />Untuk Eksekusi Cepat
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-blue-200/70 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Analisis performa website Anda dan temukan ide cemerlang untuk bisnis tanpa biaya sepeser pun. Dirancang khusus untuk mempermudah operasional Anda.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Tools Grid ────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => {
              const c = COLOR[tool.color];
              return (
                <StaggerItem key={tool.href}>
                  <HoverCard className="h-full">
                    <Link href={tool.href} className="group block h-full">
                      <div className="glass rounded-[32px] p-8 border border-white/5 hover:border-white/20 transition-all duration-500 flex flex-col relative overflow-hidden bg-[#050b14] h-full shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        {/* Glow effect on hover */}
                        <div className={`absolute -right-20 -top-20 w-64 h-64 ${c.glow} blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className={`w-16 h-16 rounded-2xl ${c.bg} border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                            <tool.icon className={`w-8 h-8 ${c.text}`} />
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.15)] animate-pulse-slow backdrop-blur-md">
                            <Sparkles className="w-3 h-3 text-green-400" />
                            <span className="text-[10px] font-bold text-green-400 tracking-widest uppercase">Gratis</span>
                          </div>
                        </div>
                        
                        <h2 className="text-white font-black text-2xl mb-4 relative z-10">{tool.label}</h2>
                        <p className="text-blue-200/60 text-base leading-relaxed mb-8 flex-1 relative z-10">{tool.desc}</p>
                        
                        <div className="flex flex-wrap gap-2.5 mb-8 relative z-10">
                          {tool.tags.map((tag) => (
                            <span key={tag} className={`textxs font-bold px-3 py-1.5 rounded-lg border ${c.badge} backdrop-blur-md`}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className={`flex items-center gap-2 text-sm font-bold ${c.text} group-hover:gap-4 transition-all duration-300 relative z-10 mt-auto`}>
                          Gunakan Tool Ini <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  </HoverCard>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScaleIn>
            <div className="glass rounded-[40px] p-10 sm:p-16 border border-white/5 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.05)] bg-[#030914]/80">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 via-blue-600/5 to-transparent pointer-events-none" />
              
              <FadeUp className="relative">
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                  Ketahui Akar Masalah <span className="text-gradient">Website Anda?</span>
                </h2>
              </FadeUp>
              <FadeUp delay={0.1} className="relative">
                <p className="text-blue-200/60 mb-12 text-lg max-w-2xl mx-auto leading-relaxed">
                  Jika tools di atas menunjukkan hasil yang kurang memuaskan, tim ahli kami siap melakukan audit mendalam secara manual. Bebas biaya konsultasi.
                </p>
              </FadeUp>
              <FadeUp delay={0.2} className="relative">
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                  <Link href="/contact">
                    <Button size="lg" className="bg-teal-600 hover:bg-teal-500 text-white px-10 h-14 text-base font-bold shadow-[0_0_30px_rgba(13,148,136,0.4)] hover:shadow-[0_0_40px_rgba(13,148,136,0.6)] transition-all rounded-xl group">
                      Mulai Konsultasi Ahli <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/layanan">
                    <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-14 px-10 text-base font-bold rounded-xl glass hover:border-white/20 transition-all">
                      Eksplorasi Jasa Kami
                    </Button>
                  </Link>
                </div>
              </FadeUp>
            </div>
          </ScaleIn>
        </div>
      </section>
    </div>
  );
}
