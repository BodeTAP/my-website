import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Globe,
  MessageCircle,
  ReceiptText,
  Search,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DomainChecker from "@/components/public/DomainChecker";
import PricingSection from "@/components/public/PricingSection";
import TestimonialCarousel from "@/components/public/TestimonialCarousel";
import HeroStats from "@/components/public/HeroStats";
import FAQSection from "@/components/public/FAQSection";
import PerspectiveLayerShowcase from "@/components/public/PerspectiveLayerShowcase";
import { FadeUp, FadeIn, StaggerChildren, StaggerItem, ScaleIn, HoverCard } from "@/components/public/motion";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, SITE_SETTING_DEFAULTS } from "@/lib/siteSettings";
import { getToolSettings } from "@/lib/toolSettings";
import { JsonLd } from "@/components/public/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";
const pageTitle = "Jasa Website dan Tools Bisnis untuk UMKM";
const pageDescription =
  "MFWEB membantu bisnis lokal membuat website yang jelas, mudah ditemukan, dan didukung tools untuk cari lead, buat proposal, serta invoice PDF.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/",
    siteName: "MFWEB",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "MFWEB" }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/og-image.png"],
  },
};

const LEGACY_HERO_HEADLINE =
  "Website Profesional yang Mendatangkan Klien, Bukan Sekadar Pajangan";
const LEGACY_HERO_SUBHEADLINE =
  "Ubah bisnis lokal Anda menjadi pemain besar di era digital. Miliki website super cepat, ramah SEO, dan siap bersaing di halaman pertama Google. Selesai dalam 3 hari!";
const LEGACY_PRIMARY_CTA = "Mulai Buat Website Saya";
const LEGACY_SECONDARY_CTA = "Lihat Hasil Kerja Kami";

const DEFAULT_HERO_HEADLINE =
  "Website dan Tools Bisnis untuk Membantu Calon Pelanggan Menghubungi Anda";
const DEFAULT_HERO_SUBHEADLINE =
  "MFWEB membantu bisnis lokal menyiapkan website yang jelas, mudah ditemukan, dan didukung tools untuk mencari lead, membuat proposal, serta mengirim invoice PDF.";

const toolCards = [
  {
    title: "Lead Finder",
    href: "/lead-finder",
    desc: "Cari prospek bisnis lokal, siapkan data outreach, dan prioritaskan lead yang paling siap dihubungi.",
    icon: Search,
    badge: "Prospecting",
  },
  {
    title: "Proposal Generator",
    href: "/tools/proposal-generator",
    desc: "Buat proposal PDF profesional dari template, brand kit, dan struktur penawaran yang siap dikirim.",
    icon: FileText,
    badge: "Closing",
  },
  {
    title: "Invoice Generator",
    href: "/tools/invoice-generator",
    desc: "Buat invoice PDF mandiri dengan template desain, detail item, diskon, dan PPN 11% opsional.",
    icon: ReceiptText,
    badge: "Billing",
  },
];
const STAT_DEFAULTS = [
  { num: "50+",    label: "Proyek selesai" },
  { num: "95%",    label: "Klien puas" },
  { num: "3 hari", label: "Rata-rata delivery" },
];

async function getHeroStats() {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: ["hero_stat_1_num","hero_stat_1_label","hero_stat_2_num","hero_stat_2_label","hero_stat_3_num","hero_stat_3_label"] } },
    });
    const m: Record<string, string> = {};
    for (const r of rows) m[r.key] = r.value;
    return [
      { num: m.hero_stat_1_num ?? "50+",    label: m.hero_stat_1_label ?? "Proyek selesai" },
      { num: m.hero_stat_2_num ?? "95%",    label: m.hero_stat_2_label ?? "Klien puas" },
      { num: m.hero_stat_3_num ?? "3 hari", label: m.hero_stat_3_label ?? "Rata-rata delivery" },
    ];
  } catch { return STAT_DEFAULTS; }
}

const FALLBACK_TESTIMONIALS = [
  { name: "Ibu Ratna",  business: "Klinik Gigi Sehat",    text: "Sejak punya website, pasien baru meningkat drastis. Banyak yang bilang nemunya dari pencarian Google! Desainnya sangat rapi.", rating: 5 },
  { name: "Pak Budi",   business: "Resto Nusantara",      text: "Proses pembuatannya cepat dan hasilnya melebihi ekspektasi saya. Sangat profesional dan timnya sangat responsif.", rating: 5 },
  { name: "Mba Sinta",  business: "Butik Mode",           text: "Sekarang customer bisa lihat koleksi dan order langsung dari website tanpa nunggu balasan chat. Omset naik 40%!", rating: 5 },
  { name: "Mas Doni",   business: "Bengkel Auto Jaya",    text: "Awalnya ragu butuh website, tapi ternyata banyak pelanggan baru datang karena lihat profil bengkel di internet. Keren!", rating: 5 },
  { name: "Kak Maya",   business: "Event Organizer",      text: "Tampilan website elegan dan kekinian. Klien jadi lebih percaya melihat portofolio kami yang tertata rapi. Sangat puas.", rating: 5 },
  { name: "Pak Hendra", business: "Distributor Kopi",     text: "Berkat website toko online, agen dari luar pulau bisa langsung pesan. Sistemnya mudah dimengerti, supportnya mantap.", rating: 5 },
  { name: "Ibu Ani",    business: "Toko Bunga Mawar",     text: "Pengerjaannya selesai dalam 3 hari! Saya kaget secepat itu tapi hasilnya sangat cantik. Orderan buket makin lancar.", rating: 5 },
  { name: "Pak Surya",  business: "Jasa Konstruksi",      text: "Desain website meyakinkan, cocok sekali dengan citra perusahaan saya. Harganya sangat transparan tanpa biaya tersembunyi.", rating: 5 },
  { name: "Mba Rina",   business: "Salon & Spa",          text: "Suka banget sama fiturnya. Pelanggan pada bilang websitenya gampang diakses di HP dan sangat user-friendly.", rating: 5 },
  { name: "Mas Reza",   business: "Rental Mobil",         text: "Website super cepat dan SEO-nya jalan. Waktu ketik rental mobil di kota saya, langsung nongol di halaman pertama!", rating: 5 },
];

async function getTestimonials() {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { featured: true },
      orderBy: { order: "asc" },
      select: { name: true, business: true, text: true, rating: true },
    });
    return rows.length > 0 ? rows : FALLBACK_TESTIMONIALS;
  } catch { return FALLBACK_TESTIMONIALS; }
}

async function getLatestArticles() {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { title: true, slug: true, excerpt: true, publishedAt: true, coverImage: true },
    });
  } catch {
    return [];
  }
}

async function getFeaturedPortfolios() {
  try {
    return await prisma.portfolio.findMany({
      where: { featured: true },
      orderBy: { order: "asc" },
      take: 3,
      select: { title: true, slug: true, description: true, coverImage: true, techStack: true, metrics: true },
    });
  } catch {
    return [];
  }
}

const benefits = [
  { icon: Globe,      title: "Info bisnis tersebar",  desc: "Calon pelanggan harus membuka Maps, Instagram, dan chat hanya untuk tahu layanan dan harga awal." },
  { icon: TrendingUp, title: "Sulit muncul di pencarian",    desc: "Website memberi halaman yang bisa dioptimasi untuk keyword lokal dan kebutuhan spesifik pelanggan." },
  { icon: Shield,     title: "Brand kurang meyakinkan",    desc: "Profil layanan, foto kerja, testimoni, dan kontak resmi membuat bisnis terlihat lebih siap menerima klien." },
  { icon: Zap,        title: "Respons lambat kehilangan lead",         desc: "CTA WhatsApp, formulir, dan halaman cepat membantu calon pelanggan bertindak tanpa menunggu balasan manual." },
];

// Testimonials now managed from admin and fetched dynamically.

export default async function HomePage() {
  const [articles, portfolios, testimonials, heroStats, settings, toolSettings] = await Promise.all([
    getLatestArticles(),
    getFeaturedPortfolios(),
    getTestimonials(),
    getHeroStats(),
    getSiteSettings(),
    getToolSettings(),
  ]);
  const siteUrl = settings.seo_canonical_base_url || settings.brand_site_url || SITE_URL;
  const heroHeadline =
    settings.home_hero_headline === LEGACY_HERO_HEADLINE ||
    settings.home_hero_headline === SITE_SETTING_DEFAULTS.home_hero_headline
      ? DEFAULT_HERO_HEADLINE
      : settings.home_hero_headline;
  const heroSubheadline =
    settings.home_hero_subheadline === LEGACY_HERO_SUBHEADLINE ||
    settings.home_hero_subheadline === SITE_SETTING_DEFAULTS.home_hero_subheadline
      ? DEFAULT_HERO_SUBHEADLINE
      : settings.home_hero_subheadline;
  const primaryCtaLabel =
    settings.home_primary_cta_label === LEGACY_PRIMARY_CTA
      ? SITE_SETTING_DEFAULTS.home_primary_cta_label
      : settings.home_primary_cta_label;
  const secondaryCtaLabel =
    settings.home_secondary_cta_label === LEGACY_SECONDARY_CTA
      ? SITE_SETTING_DEFAULTS.home_secondary_cta_label
      : settings.home_secondary_cta_label;
  const secondaryCtaUrl =
    settings.home_secondary_cta_url === "/portfolio"
      ? SITE_SETTING_DEFAULTS.home_secondary_cta_url
      : settings.home_secondary_cta_url;
  const whatsappNumber = settings.brand_public_whatsapp.replace(/\D/g, "");
  const welcomeCredits = toolSettings.signupBonus.enabled ? toolSettings.signupBonus.amount : 0;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Berapa lama waktu pengerjaan website?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Rata-rata 3\u20137 hari kerja tergantung paket dan kelengkapan materi dari Anda (foto, teks, logo). Landing page biasanya selesai dalam 2\u20133 hari.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah saya perlu paham teknologi atau coding?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tidak perlu sama sekali. Kami menangani semua hal teknis dari awal sampai website Anda live. Setelah selesai, kami juga memberikan panduan singkat cara memperbarui konten.",
        },
      },
      {
        "@type": "Question",
        name: "Bagaimana jika saya tidak puas dengan desainnya?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Setiap paket sudah termasuk revisi. Kami mengerjakan berdasarkan brief dan referensi yang Anda berikan, sehingga hasilnya sesuai ekspektasi.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah website saya bisa muncul di Google?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ya. Semua website yang kami buat sudah dioptimasi SEO dasar: struktur halaman yang benar, meta tag, kecepatan loading, dan mobile-friendly.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah ada biaya bulanan setelah website jadi?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Harga paket sudah mencakup domain dan hosting selama 1 tahun. Setelah tahun pertama, biaya perpanjangan sekitar Rp 400\u2013600 ribu per tahun.",
        },
      },
      {
        "@type": "Question",
        name: "Bisakah saya memperbarui konten sendiri setelah website jadi?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bisa. Website Anda dilengkapi dashboard admin sehingga Anda bisa mengganti teks, foto, harga, dan informasi lainnya sendiri tanpa bantuan developer.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah website tampil baik di HP?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "100%. Semua website kami dibangun dengan desain responsif \u2014 tampilan otomatis menyesuaikan layar HP, tablet, maupun desktop.",
        },
      },
      {
        "@type": "Question",
        name: "Apa yang terjadi jika ada masalah teknis setelah website live?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kami memberikan support teknis setelah website live. Jika ada bug atau masalah dari sisi kami, kami perbaiki tanpa biaya tambahan.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah MFWEB juga menyediakan tools bisnis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ya. MFWEB menyediakan tools bisnis seperti Lead Finder, Proposal Generator, dan Invoice Generator untuk membantu proses prospecting, penawaran, dan penagihan.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah Proposal Generator dan Invoice Generator bisa download PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bisa. Proposal Generator dan Invoice Generator dibuat untuk menghasilkan dokumen PDF yang bisa langsung diunduh dan dikirim ke klien.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah tools premium memakai sistem kredit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ya. Tools premium di portal klien menggunakan sistem kredit, sehingga pemakaian dapat dikontrol sesuai kebutuhan bisnis.",
        },
      },
    ],
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#business`,
    name: settings.brand_name,
    url: siteUrl,
    logo: new URL(settings.brand_logo_url, siteUrl).toString(),
    image: new URL(settings.brand_default_og_image, siteUrl).toString(),
    description: pageDescription,
    telephone: whatsappNumber ? `+${whatsappNumber}` : undefined,
    priceRange: "Rp 800K - Rp 5.4Jt",
    areaServed: {
      "@type": "Country",
      name: "Indonesia",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Paket Pembuatan Website",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Landing Page",
            description: "Desain 1 halaman, domain .com, hosting & SSL gratis 1 tahun",
          },
          price: "800000",
          priceCurrency: "IDR",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Compro Simple",
            description: "Desain 3-4 halaman, SEO dasar, email bisnis, domain .com",
          },
          price: "1500000",
          priceCurrency: "IDR",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Compro Pro",
            description: "Desain 5-7 halaman custom, multi bahasa, SEO dasar, email bisnis",
          },
          price: "3500000",
          priceCurrency: "IDR",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Toko Online",
            description: "Unlimited halaman, integrasi pembayaran, multi bahasa, SEO dasar",
          },
          price: "5400000",
          priceCurrency: "IDR",
        },
      ],
    },
  };

  const toolsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tools Bisnis MFWEB",
    itemListElement: toolCards.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: tool.title,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: `${siteUrl}${tool.href}`,
        description: tool.desc,
        offers: {
          "@type": "Offer",
          priceCurrency: "IDR",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <div className="relative overflow-x-clip bg-white text-slate-900 selection:bg-slate-200">
      {/* ── Hero: Full Width Deep Slate Section ── */}
      <section className="relative w-full bg-[#1E242E] text-white pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28 border-b border-slate-800 overflow-hidden">
        {/* Subtle architectural ambient gradient */}
        <div className="absolute inset-0 bg-radial-[at_top_right] from-slate-800/50 via-slate-900/20 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <FadeUp delay={0}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-px w-8 bg-slate-500" />
                  <span className="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-[0.22em] text-slate-300">
                    Studio Desain Web & Sistem Penjualan
                  </span>
                </div>
              </FadeUp>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-white">
                {heroHeadline}
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
                {heroSubheadline}
              </p>

              <FadeUp delay={0.2}>
                <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                  <Link href={settings.home_primary_cta_url || settings.brand_consultation_url || "/contact"}>
                    <Button size="lg" className="h-12 rounded-full bg-white px-7 text-slate-950 font-bold hover:bg-slate-100 shadow-sm text-sm">
                      {primaryCtaLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={secondaryCtaUrl || "/tools"}>
                    <Button size="lg" variant="outline" className="h-12 rounded-full border-slate-600 bg-transparent px-6 text-white hover:bg-slate-800 font-semibold text-sm">
                      {secondaryCtaLabel}
                    </Button>
                  </Link>
                </div>
              </FadeUp>

              <div className="mt-12 pt-8 border-t border-slate-700/60 max-w-md">
                <HeroStats stats={heroStats} />
              </div>
            </div>

            {/* 3D Perspective Layer Showcase */}
            <div className="relative flex items-center justify-center">
              <PerspectiveLayerShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tools Bisnis (Alur Jualan Digital) ───────────────────── */}
      <section className="border-y border-slate-200/80 bg-[#F8F9FA] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] items-center">
          <FadeUp>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Pipeline Bisnis
            </p>
            <h2 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl tracking-tight">
              Bukan cuma punya website. Alur closing juga dibantu.
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed text-base">
              Banyak bisnis sudah punya nomor WhatsApp dan Instagram, tapi masih
              bingung mencari prospek potensial, menyusun proposal penawaran, serta membuat dokumen
              invoice yang terpercaya. Tiga tools ini dirancang khusus untuk memotong proses manual tersebut.
              {welcomeCredits > 0 ? ` Akun baru mendapat ${welcomeCredits} kredit gratis untuk mencoba alurnya.` : ""}
            </p>
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <Link href="/tools">
                <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 px-6 font-semibold text-xs sm:text-sm h-11">
                  Buka Katalog Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/portal/register">
                <Button variant="outline" className="rounded-full border-slate-300 bg-white text-slate-800 hover:bg-slate-100 px-6 font-semibold text-xs sm:text-sm h-11">
                  Masuk Portal Klien
                </Button>
              </Link>
            </div>
          </FadeUp>

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {toolCards.map((tool, index) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group grid gap-4 p-6 transition-colors hover:bg-slate-50 sm:grid-cols-[auto_1fr_auto] items-center"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="mb-1.5 flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        0{index + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-base">{tool.title}</span>
                      <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {tool.badge}
                      </span>
                    </span>
                    <span className="block text-xs sm:text-sm leading-relaxed text-slate-600">
                      {tool.desc}
                    </span>
                  </span>
                  <span className="hidden items-center text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-900 sm:flex">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Domain Checker ───────────────────────────────────────── */}
      <section className="border-b border-slate-200/80 bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-10" delay={0.2}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Domain Bisnis Anda Masih Tersedia?
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto text-base">
              Cek sekarang sebelum didaftarkan pihak lain. Domain yang tepat adalah identitas paten aset digital bisnis Anda.
            </p>
          </FadeUp>
          <FadeIn delay={0.3}>
            <DomainChecker />
          </FadeIn>
        </div>
      </section>

      {/* ── Benefits (Yang Sering Terjadi) ────────────────────────── */}
      <section className="border-b border-slate-200/80 bg-[#F8F9FA] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] items-center">
          <FadeUp>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Evaluasi Masalah
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-slate-900 tracking-tight">
              Calon pelanggan sudah mencari. Pertanyaannya: mereka menemukan siapa?
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600 text-base">
              Website yang baik bukan sekadar pajangan digital. Ia menjawab keraguan mendasar
              calon pelanggan dan membangun rasa percaya sebelum mereka menekan tombol WhatsApp.
            </p>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {benefits.map((b) => (
              <StaggerItem key={b.title}>
                <div className="flex h-full gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    <b.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{b.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">{b.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── Portfolio Preview ─────────────────────────────────────── */}
      {portfolios.length > 0 && (
        <section className="border-t border-slate-200/80 bg-[#F8F9FA] py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="flex items-end justify-between mb-12">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Studi Kasus Nyata
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Hasil Kerja Terbaru
                </h2>
              </div>
              <Link href="/portfolio">
                <Button variant="ghost" className="rounded-full text-slate-700 hover:text-slate-950 hover:bg-slate-200/70 font-bold text-xs sm:text-sm">
                  Lihat Semua <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </Link>
            </FadeUp>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portfolios.map((p) => (
                <StaggerItem key={p.slug}>
                  <HoverCard className="h-full">
                    <Link href={`/portfolio/${p.slug}`}>
                      <div className="h-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 group hover:border-slate-300 hover:shadow-md">
                        <div className="h-48 bg-slate-100 overflow-hidden relative">
                          {p.coverImage ? (
                            <Image src={p.coverImage} alt={p.title} width={400} height={192} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Globe className="w-12 h-12 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-slate-900 font-bold text-base mb-1.5 group-hover:text-slate-700 transition-colors">{p.title}</h3>
                          {p.description && <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 mb-3.5 leading-relaxed">{p.description}</p>}
                          {p.metrics && (
                            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              {p.metrics}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* ── Blog Preview ──────────────────────────────────────────── */}
      {articles.length > 0 && (
        <section className="border-t border-slate-200/80 bg-white py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="flex items-end justify-between mb-12">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Wawasan Bisnis
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Tips & Artikel Praktis
                </h2>
              </div>
              <Link href="/blog">
                <Button variant="ghost" className="rounded-full text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-bold text-xs sm:text-sm">
                  Baca Semua <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </Link>
            </FadeUp>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((a) => (
                <StaggerItem key={a.slug}>
                  <HoverCard className="h-full">
                    <Link href={`/blog/${a.slug}`}>
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 group hover:border-slate-300 hover:shadow-md">
                        <div className="h-44 bg-slate-100 overflow-hidden relative">
                          {a.coverImage ? (
                            <Image src={a.coverImage} alt={a.title} width={400} height={176} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <FileText className="h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          {a.publishedAt && (
                            <p className="text-slate-400 text-xs font-medium mb-2">
                              {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(a.publishedAt))}
                            </p>
                          )}
                          <h3 className="text-slate-900 font-bold text-base mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors flex-1">{a.title}</h3>
                          {a.excerpt && <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">{a.excerpt}</p>}
                        </div>
                      </article>
                    </Link>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="border-t border-slate-200/80 bg-[#F8F9FA] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-12">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Ulasan Klien
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Apa Kata Klien Kami
            </h2>
            <p className="text-slate-600 max-w-md mx-auto text-base">
              Puluhan bisnis lokal mempercayakan identitas digital dan alur penjualan mereka kepada kami.
            </p>
          </FadeUp>
          <FadeIn delay={0.1}>
            <TestimonialCarousel testimonials={testimonials} />
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── Final CTA: Deep Slate Hero Block ──────────────────────── */}
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <ScaleIn>
            <div className="relative rounded-3xl bg-[#1E242E] text-white p-8 sm:p-14 border border-slate-700/60 shadow-2xl overflow-hidden">
              {/* Subtle ambient light */}
              <div className="absolute inset-0 bg-radial-[at_top_right] from-slate-800/40 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10">
                <FadeUp>
                  <h2 className="max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
                    Mau mulai dari website, lead, atau dokumen penawaran?
                  </h2>
                </FadeUp>

                <FadeUp delay={0.1}>
                  <p className="mt-5 max-w-2xl text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                    Ceritakan kondisi dan target bisnis Anda. Kami bantu pilih solusi yang paling masuk akal: landing page konversi cepat, company profile kredibel, atau tools pendukung sales.
                  </p>
                </FadeUp>

                <FadeUp delay={0.2}>
                  <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                    <Link href="/contact">
                      <Button size="lg" className="h-12 rounded-full bg-white px-7 text-slate-950 font-bold hover:bg-slate-100 shadow-sm text-sm">
                        Konsultasi Gratis
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <a
                      href={
                        whatsappNumber
                          ? `https://wa.me/${whatsappNumber}?text=Halo%20${encodeURIComponent(settings.brand_name)}%2C%20saya%20ingin%20konsultasi%20website`
                          : "/contact"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" variant="outline" className="h-12 rounded-full border-slate-600 bg-transparent px-6 text-slate-200 hover:bg-slate-800 font-semibold text-sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp Langsung
                      </Button>
                    </a>
                  </div>
                </FadeUp>

                <FadeUp delay={0.3}>
                  <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2.5 pt-8 border-t border-slate-700/60">
                    {["Harga transparan dibahas di awal", "Alur kerja rapi & terjadwal", "Dokumen & hak akses penuh milik Anda"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </FadeUp>
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>
      {/* JSON-LD Structured Data */}
      <JsonLd id="json-ld-faq" data={faqJsonLd} />
      <JsonLd id="json-ld-business" data={localBusinessJsonLd} />
      <JsonLd id="json-ld-tools" data={toolsJsonLd} />
    </div>
  );
}
