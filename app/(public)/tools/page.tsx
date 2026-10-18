import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Coins,
  FileText,
  Gauge,
  QrCode,
  ReceiptText,
  Search,
  SearchCheck,
  Tags,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/public/JsonLd";
import { getToolSettings } from "@/lib/toolSettings";
import { getWelcomeCreditBreakdown } from "@/lib/welcomeCredits";
import { FadeUp } from "@/components/public/motion";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mfweb.maffisorp.id";
const pageTitle = "Tools Website, Lead Finder, Proposal, dan Invoice";
const pageDescription =
  "Katalog tools MFWEB untuk cek performa website, cari prospek bisnis lokal, membuat proposal PDF, invoice PDF, QR code, dan audit SEO.";

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

const freeTools = [
  {
    href: "/tools/cek-kecepatan",
    icon: Gauge,
    label: "Cek Kecepatan Website",
    desc: "Cek performa, skor PageSpeed, dan Core Web Vitals dari Google.",
    tags: ["Performa", "Core Web Vitals"],
  },
  {
    href: "/tools/cek-seo",
    icon: SearchCheck,
    label: "Cek SEO Score",
    desc: "Audit meta tags, heading structure, SSL, Open Graph, dan schema dasar.",
    tags: ["On-Page", "Schema"],
  },
  {
    href: "/tools/cek-meta-tags",
    icon: Tags,
    label: "Cek Meta Tags",
    desc: "Simulasi tampilan link website di Google Search dan sosial media.",
    tags: ["Preview", "Social Share"],
  },
  {
    href: "/tools/estimasi-harga",
    icon: Calculator,
    label: "Estimasi Harga Website",
    desc: "Kalkulasi cepat perkiraan biaya berdasarkan jenis platform dan fitur.",
    tags: ["Estimasi", "Kalkulator"],
  },
  {
    href: "/tools/qr-code",
    icon: QrCode,
    label: "Generator QR Code",
    desc: "Generate QR code instan untuk link website, WhatsApp, atau kontak bisnis.",
    tags: ["QR Code", "PNG Download"],
  },
  {
    href: "/tools/roi-website",
    icon: TrendingUp,
    label: "Kalkulator ROI Website",
    desc: "Hitung proyeksi konversi lead dan perputaran modal dari website baru.",
    tags: ["ROI", "Proyeksi"],
  },
  {
    href: "/tools/generator-nama",
    icon: Wand2,
    label: "Generator Nama Bisnis",
    desc: "Eksplorasi ide nama brand dan tagline untuk bisnis baru Anda.",
    tags: ["Brand Idea", "Slogan"],
  },
];

function getPaidTools(settings: Awaited<ReturnType<typeof getToolSettings>>) {
  return [
    {
      href: "/lead-finder",
      icon: Search,
      label: "Lead Finder",
      desc: "Cari data kontak bisnis lokal dari Google Maps, sortir yang berkualitas, dan export ke CSV siap follow-up.",
      tags: ["Google Maps", "Export CSV", "Filter Kontak"],
      price: `Mulai ${settings.leadFinder.standardCost} kredit`,
    },
    {
      href: "/tools/proposal-generator",
      icon: FileText,
      label: "Proposal Generator",
      desc: "Buat dokumen proposal penawaran PDF profesional dengan custom template, brand kit, dan arsip terpusat.",
      tags: ["Template Rapi", "Brand Kit", "PDF Instan"],
      price: `${settings.proposalGenerator.creditCost} kredit`,
    },
    {
      href: "/tools/invoice-generator",
      icon: ReceiptText,
      label: "Invoice Generator",
      desc: "Susun tagihan invoice bisnis dengan rincian layanan, diskon, PPN 11%, dan status pembayaran mandiri.",
      tags: ["PPN 11%", "Arsip Dokumen", "PDF Resmi"],
      price: `${settings.invoiceGenerator.creditCost} kredit`,
    },
  ];
}

export default async function ToolsPage() {
  const toolSettings = await getToolSettings();
  const paidTools = getPaidTools(toolSettings);
  const welcomeCredits = toolSettings.signupBonus.enabled ? toolSettings.signupBonus.amount : 0;
  const welcomeBonusBreakdown =
    welcomeCredits > 0 ? getWelcomeCreditBreakdown(welcomeCredits, toolSettings).summary : "";
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Beranda", item: SITE_URL },
    { name: "Tools", item: `${SITE_URL}/tools` },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-tools" data={breadcrumbJsonLd} />

      {/* ── Full-Width Deep Slate Hero ────────────────────── */}
      <section className="w-full bg-[#1E242E] text-white pt-28 pb-16 sm:pt-32 sm:pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Tools" }]} />

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end mt-6">
            <FadeUp>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-slate-500" />
                <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                  Katalog Tools & Utilitas Bisnis
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Tools praktis untuk cek website dan percepat proses sales
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Gunakan alat yang tepat untuk pekerjaan hari ini: audit performa, cari prospek lokal terarah, buat proposal komersial, atau siapkan invoice resmi.
              </p>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="rounded-2xl border border-slate-800 bg-[#161B22] p-6 text-white">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Akun & Sistem Kredit Portal</p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Tools premium menggunakan sistem kredit yang terjangkau. Tools audit gratis dapat langsung digunakan tanpa login.
                    </p>
                    {welcomeCredits > 0 && (
                      <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-mono text-slate-300">
                        {welcomeBonusBreakdown
                          ? `Bonus: ${welcomeCredits} kredit gratis (${welcomeBonusBreakdown}).`
                          : `Bonus: ${welcomeCredits} kredit gratis untuk akun baru.`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Premium Tools Section ─────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-px w-6 bg-slate-400" />
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                  Portal Tools
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Tools untuk pekerjaan berulang & otomasi
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                Tersimpan di dashboard portal klien, menjaga riwayat dokumen, dan siap mendukung produktivitas sales Anda.
              </p>
            </div>
            <Link href="/portal/register" className="w-fit">
              <Button className="h-11 rounded-full bg-slate-900 text-white hover:bg-slate-800 px-6 font-medium text-sm transition-colors">
                Daftar Akun Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {paidTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-mono font-medium text-slate-700">
                      {tool.price}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.label}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-5">{tool.desc}</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100 mb-4">
                    {tool.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-900 group-hover:text-slate-700">
                    Buka tool
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Free Tools Section ────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-slate-400" />
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                Utilitas Gratis
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Audit cepat & kalkulator tanpa login
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Gunakan langsung di browser untuk pengecekan awal sebelum menentukan prioritas perbaikan.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {freeTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-[#F8F9FA] p-5 shadow-xs hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-800 shadow-xs">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-slate-700 transition-colors">
                      {tool.label}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1 mb-4">
                    {tool.desc}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 mt-auto">
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom Consultation Bar ───────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-8 sm:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Butuh bantuan menganalisis hasil audit?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                Kirimkan link website atau hasil pengecekan Anda. Tim kami akan membantu menyusun rekomendasi prioritas perbaikan yang paling rasional.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/contact">
                <Button className="h-11 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-6 text-sm transition-colors">
                  Konsultasi Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/layanan">
                <Button
                  variant="outline"
                  className="h-11 rounded-full border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white px-6 font-medium text-sm transition-colors"
                >
                  Lihat Semua Layanan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
