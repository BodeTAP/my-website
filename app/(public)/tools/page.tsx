import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, SearchCheck, Wand2, QrCode, TrendingUp, Tags, Calculator, ArrowRight, Wrench, Sparkles, Search, Coins, FileText, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem, HoverCard, ScaleIn } from "@/components/public/motion";
import { getToolSettings } from "@/lib/toolSettings";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mfweb.maffisorp.id";
const pageTitle = "Tools Gratis & Premium untuk Website, Lead, Proposal, Invoice | MFWEB";
const pageDescription =
  "Gunakan tools gratis dan premium MFWEB untuk audit website, cari lead, buat proposal PDF, invoice PDF, QR code, estimasi harga, dan optimasi bisnis.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/tools" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/tools",
    siteName: "MFWEB",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/opengraph-image"],
  },
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
    desc: "Cari ide nama bisnis dan slogan dari beberapa gaya kata. Cocok untuk tahap awal validasi brand.",
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
    desc: "Hitung perkiraan dampak website terhadap lead, omzet, dan waktu balik modal dengan asumsi yang bisa Anda ubah.",
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
  {
    href: "/tools/estimasi-harga",
    icon: Calculator,
    color: "green" as const,
    label: "Estimasi Harga Website",
    desc: "Dapatkan estimasi biaya website dari pilihan jenis bisnis, fitur, dan timeline pengerjaan.",
    tags: ["Estimasi Awal", "Breakdown Biaya", "Rekomendasi Paket"],
  },
];

function getPaidTools(settings: Awaited<ReturnType<typeof getToolSettings>>) {
  return [
    {
      href: "/lead-finder",
      icon: Search,
      color: "blue" as const,
      label: "Lead Finder",
      desc: "Temukan prospek bisnis lokal dari Google Maps, filter kontak yang layak dihubungi, simpan list, dan export CSV.",
      tags: ["Google Maps", "Saved Lists", "Export CSV"],
      price: `Mulai ${settings.leadFinder.standardCost} kredit`,
    },
    {
      href: "/tools/proposal-generator",
      icon: FileText,
      color: "purple" as const,
      label: "Proposal Generator",
      desc: "Buat proposal bisnis profesional dari template, simpan brand kit, lalu download PDF siap kirim ke prospek.",
      tags: ["Template", "Brand Kit", "PDF"],
      price: `${settings.proposalGenerator.creditCost} kredit`,
    },
    {
      href: "/tools/invoice-generator",
      icon: ReceiptText,
      color: "teal" as const,
      label: "Invoice Generator",
      desc: "Buat invoice PDF mandiri dengan template desain, PPN 11% opsional, edit detail, duplicate, dan status manual.",
      tags: ["PPN 11%", "Duplicate", "PDF"],
      price: `${settings.invoiceGenerator.creditCost} kredit`,
    },
  ];
}

const COLOR = {
  blue:   { bg: "bg-blue-600/15",   border: "border-blue-500/30",   text: "text-blue-400",   badge: "bg-blue-500/10 text-blue-300 border-blue-500/20", glow: "bg-blue-600/30" },
  teal:   { bg: "bg-teal-600/15",   border: "border-teal-500/30",   text: "text-teal-400",   badge: "bg-teal-500/10 text-teal-300 border-teal-500/20", glow: "bg-teal-600/30" },
  purple: { bg: "bg-purple-600/15", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500/10 text-purple-300 border-purple-500/20", glow: "bg-purple-600/30" },
  green:  { bg: "bg-green-600/15",  border: "border-green-500/30",  text: "text-green-400",  badge: "bg-green-500/10 text-green-300 border-green-500/20", glow: "bg-green-600/30" },
};

export default async function ToolsPage() {
  const toolSettings = await getToolSettings();
  const paidTools = getPaidTools(toolSettings);
  const welcomeCredits = toolSettings.signupBonus.enabled ? toolSettings.signupBonus.amount : 0;

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#071225] px-5 py-2 text-xs font-bold uppercase tracking-widest text-blue-200/70 mb-8">
              <Wrench className="w-4 h-4 text-teal-400" />
              Tools MFWEB
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
              Tools untuk cek website, cari prospek, dan membuat dokumen bisnis
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-blue-200/70 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Gunakan tools gratis untuk audit ringan, atau tools premium di portal
              untuk lead finder, proposal PDF, dan invoice PDF.
            </p>
          </FadeUp>
          {welcomeCredits > 0 && (
            <FadeUp delay={0.25}>
              <div className="mx-auto mb-10 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-200">
                <Sparkles className="h-4 w-4" />
                Akun baru dapat {welcomeCredits} kredit gratis untuk mencoba tools premium.
              </div>
            </FadeUp>
          )}
        </div>
      </section>

      {/* ── Tools Grid ────────────────────────────────────── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-6xl">
          <FadeUp className="mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-amber-300">
                  <Coins className="h-4 w-4" />
                  Tools Premium
                </div>
                <h2 className="text-3xl font-black text-white sm:text-4xl">Tools berbayar untuk kerja operasional</h2>
                <p className="mt-3 max-w-2xl text-blue-200/60">
                  Pakai kredit portal untuk prospecting, proposal, dan invoice PDF. Dirancang untuk workflow klien yang berulang.
                  {welcomeCredits > 0 ? ` Daftar akun baru dan mulai dengan ${welcomeCredits} kredit gratis.` : ""}
                </p>
              </div>
              <Link href="/portal/register" className="w-fit">
                <Button className="h-11 rounded-xl bg-blue-600 px-5 font-black text-white hover:bg-blue-500">
                  Buat akun portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {paidTools.map((tool) => {
              const c = COLOR[tool.color];
              return (
                <StaggerItem key={tool.href}>
                  <HoverCard className="h-full">
                    <Link href={tool.href} className="group block h-full">
                      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-amber-500/15 bg-[#071225] p-7 transition-colors duration-300 hover:border-amber-400/35">
                        <div className="relative z-10 mb-6 flex items-start justify-between gap-4">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${c.bg} border border-white/5`}>
                            <tool.icon className={`h-7 w-7 ${c.text}`} />
                          </div>
                          <div className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                            {tool.price}
                          </div>
                        </div>
                        <h3 className="relative z-10 text-2xl font-black text-white">{tool.label}</h3>
                        <p className="relative z-10 mt-3 flex-1 text-sm leading-relaxed text-blue-200/60">{tool.desc}</p>
                        <div className="relative z-10 mt-6 flex flex-wrap gap-2">
                          {tool.tags.map((tag) => (
                            <span key={tag} className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${c.badge}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className={`relative z-10 mt-7 flex items-center gap-2 text-sm font-bold ${c.text} transition-all duration-300 group-hover:gap-4`}>
                          Lihat landing page <ArrowRight className="h-4 w-4" />
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

      <section className="py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="mb-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Tools gratis</h2>
            <p className="mt-3 max-w-2xl text-blue-200/60">
              Audit ringan dan generator praktis yang bisa digunakan tanpa login.
            </p>
          </FadeUp>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => {
              const c = COLOR[tool.color];
              return (
                <StaggerItem key={tool.href}>
                  <HoverCard className="h-full">
                    <Link href={tool.href} className="group block h-full">
                      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#071225] p-8 transition-colors duration-300 hover:border-white/20">
                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className={`w-16 h-16 rounded-2xl ${c.bg} border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                            <tool.icon className={`w-8 h-8 ${c.text}`} />
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-green-400" />
                            <span className="text-[10px] font-bold text-green-400 tracking-widest uppercase">Gratis</span>
                          </div>
                        </div>
                        
                        <h2 className="text-white font-black text-2xl mb-4 relative z-10">{tool.label}</h2>
                        <p className="text-blue-200/60 text-base leading-relaxed mb-8 flex-1 relative z-10">{tool.desc}</p>
                        
                        <div className="flex flex-wrap gap-2.5 mb-8 relative z-10">
                          {tool.tags.map((tag) => (
                            <span key={tag} className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${c.badge} backdrop-blur-md`}>
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
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScaleIn>
            <div className="rounded-2xl border border-white/10 bg-[#071225] p-10 sm:p-16">
              <FadeUp className="relative">
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                  Butuh audit yang lebih rapi?
                </h2>
              </FadeUp>
              <FadeUp delay={0.1} className="relative">
                <p className="text-blue-200/60 mb-12 text-lg max-w-2xl mx-auto leading-relaxed">
                  Jika hasil tools menunjukkan banyak catatan, kami bisa bantu cek
                  manual dan susun prioritas perbaikan yang paling berdampak.
                </p>
              </FadeUp>
              <FadeUp delay={0.2} className="relative">
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                  <Link href="/contact">
                    <Button size="lg" className="bg-teal-600 hover:bg-teal-500 text-white px-10 h-14 text-base font-bold transition-colors rounded-xl group">
                      Konsultasi website <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/layanan">
                    <Button size="lg" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-14 px-10 text-base font-bold rounded-xl hover:border-white/20 transition-colors">
                      Lihat layanan
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


