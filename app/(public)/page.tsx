import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
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
import { FadeUp, FadeIn, StaggerChildren, StaggerItem, ScaleIn, HoverCard } from "@/components/public/motion";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, SITE_SETTING_DEFAULTS } from "@/lib/siteSettings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";
const pageTitle = "Jasa Website dan Tools Bisnis untuk UMKM | MFWEB";
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
  const [articles, portfolios, testimonials, heroStats, settings] = await Promise.all([
    getLatestArticles(),
    getFeaturedPortfolios(),
    getTestimonials(),
    getHeroStats(),
    getSiteSettings(),
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
    <div className="relative overflow-x-clip">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)]">
          <div className="relative">
          <FadeUp delay={0}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Untuk bisnis lokal yang ingin lebih mudah ditemukan dan dihubungi
            </div>
          </FadeUp>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {heroHeadline}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-blue-100/68 sm:text-lg">
            {heroSubheadline}
          </p>

          <FadeUp delay={0.2}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={settings.home_primary_cta_url || settings.brand_consultation_url || "/contact"}>
                <Button size="lg" className="h-12 rounded-lg bg-blue-600 px-6 text-white shadow-none hover:bg-blue-500">
                  {primaryCtaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={secondaryCtaUrl || "/tools"}>
                <Button size="lg" variant="outline" className="h-12 rounded-lg border-white/12 bg-white/[0.03] px-6 text-white hover:bg-white/[0.07]">
                  {secondaryCtaLabel}
                </Button>
              </Link>
            </div>
          </FadeUp>

          <div className="mt-10">
            <HeroStats stats={heroStats} />
          </div>
          </div>

          <FadeUp delay={0.25} className="relative">
            <div className="rounded-2xl border border-white/10 bg-[#071225] p-4 shadow-2xl shadow-black/25">
              <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-4">
                <div>
                  <p className="text-sm font-bold text-white">Alur jualan MFWEB</p>
                  <p className="text-xs text-blue-100/45">Dari ditemukan sampai tagihan siap kirim</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
                  Workflow nyata
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Globe,
                    label: "Website ditemukan",
                    text: "Calon pelanggan melihat layanan, lokasi, portofolio, dan CTA WhatsApp.",
                    meta: "Google + mobile",
                  },
                  {
                    icon: Search,
                    label: "Lead dicari",
                    text: "Lead Finder membantu menemukan bisnis lokal yang bisa diprospek.",
                    meta: "Data prospek",
                  },
                  {
                    icon: FileText,
                    label: "Proposal dikirim",
                    text: "Penawaran dibuat sebagai PDF dengan brand kit yang konsisten.",
                    meta: "PDF siap kirim",
                  },
                  {
                    icon: ReceiptText,
                    label: "Invoice selesai",
                    text: "Tagihan dibuat rapi, termasuk item layanan dan PPN 11% opsional.",
                    meta: "Dokumen final",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="rounded-xl border border-white/8 bg-white/[0.035] p-4">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/12 text-blue-200">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-bold text-white">{item.label}</p>
                          <p className="text-xs text-blue-100/40">{item.meta}</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-blue-100/58">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#06111f] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <FadeUp>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-emerald-200/75">
              Tools bisnis
            </p>
            <h2 className="max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              Bukan cuma punya website. Alur jualannya juga dibantu.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-blue-100/58">
              Banyak bisnis sudah punya nomor WhatsApp dan Instagram, tapi masih
              bingung mencari prospek, menulis penawaran, dan membuat dokumen
              tagihan yang rapi. Tiga tools ini dibuat untuk bagian itu.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/tools">
                <Button className="rounded-lg bg-blue-600 text-white hover:bg-blue-500">
                  Buka Katalog Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/portal/register">
                <Button variant="outline" className="rounded-lg border-white/10 text-white hover:bg-white/[0.06]">
                  Masuk Portal Klien
                </Button>
              </Link>
            </div>
          </FadeUp>

          <div className="divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/[0.025]">
            {toolCards.map((tool, index) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group grid gap-4 p-5 transition-colors hover:bg-white/[0.035] sm:grid-cols-[auto_1fr_auto]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/12 text-blue-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="mb-1 flex items-center gap-3">
                      <span className="text-sm font-semibold text-blue-100/45">
                        0{index + 1}
                      </span>
                      <span className="font-bold text-white">{tool.title}</span>
                      <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-black uppercase text-amber-200">
                        {tool.badge}
                      </span>
                    </span>
                    <span className="block text-sm leading-relaxed text-blue-100/56">
                      {tool.desc}
                    </span>
                  </span>
                  <span className="hidden items-center text-blue-200 transition-transform group-hover:translate-x-1 sm:flex">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Domain Checker ───────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-10" delay={0.2}>
            <h2 className="text-3xl font-bold text-white mb-3">
              Domain Bisnis Anda Masih Tersedia?
            </h2>
            <p className="text-blue-200/60 max-w-xl mx-auto">
              Cek sekarang sebelum didaftar orang lain. Domain yang bagus adalah aset bisnis Anda.
            </p>
          </FadeUp>
          <FadeIn delay={0.4}>
            <DomainChecker />
          </FadeIn>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <FadeUp>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-blue-200/55">
              Yang sering terjadi
            </p>
            <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
              Calon pelanggan sudah mencari. Pertanyaannya: mereka menemukan siapa?
            </h2>
            <p className="mt-5 leading-relaxed text-blue-100/58">
              Website yang baik bukan pajangan. Ia menjawab pertanyaan dasar
              calon pelanggan sebelum mereka menekan tombol WhatsApp.
            </p>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {benefits.map((b) => (
              <StaggerItem key={b.title}>
                <div className="flex h-full gap-4 rounded-xl border border-white/8 bg-white/[0.025] p-5">
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-blue-200">
                    <b.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-blue-100/55">{b.desc}</p>
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
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <FadeUp className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Hasil Kerja Terbaru</h2>
                <p className="text-blue-200/60">Website yang telah kami bangun untuk klien</p>
              </div>
              <Link href="/portfolio">
                <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-white/5">
                  Lihat semua <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </FadeUp>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portfolios.map((p) => (
                <StaggerItem key={p.slug}>
                  <HoverCard className="h-full">
                    <Link href={`/portfolio/${p.slug}`}>
                      <div className="h-full cursor-pointer overflow-hidden rounded-xl border border-white/8 bg-white/[0.025] transition-colors duration-300 group hover:border-blue-400/25">
                        <div className="h-48 bg-linear-to-br from-blue-900/50 to-blue-800/20 overflow-hidden">
                          {p.coverImage ? (
                            <Image src={p.coverImage} alt={p.title} width={400} height={192} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Globe className="w-16 h-16 text-blue-500/30" />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="text-white font-semibold mb-1 group-hover:text-blue-300 transition-colors">{p.title}</h3>
                          {p.description && <p className="text-blue-200/50 text-sm line-clamp-2 mb-3">{p.description}</p>}
                          {p.metrics && (
                            <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                              <TrendingUp className="w-3.5 h-3.5" />
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
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <FadeUp className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Tips & Artikel</h2>
                <p className="text-blue-200/60">Panduan praktis untuk mengelola website dan pemasaran online</p>
              </div>
              <Link href="/blog">
                <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-white/5">
                  Baca semua <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </FadeUp>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((a) => (
                <StaggerItem key={a.slug}>
                  <HoverCard className="h-full">
                    <Link href={`/blog/${a.slug}`}>
                      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/8 bg-white/[0.025] transition-colors duration-300 group hover:border-blue-400/25">
                        <div className="h-40 bg-linear-to-br from-blue-900/40 to-indigo-900/20 overflow-hidden">
                          {a.coverImage ? (
                            <Image src={a.coverImage} alt={a.title} width={400} height={160} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-blue-300/25">
                              <FileText className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          {a.publishedAt && (
                            <p className="text-blue-400/60 text-xs mb-2">
                              {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(a.publishedAt))}
                            </p>
                          )}
                          <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors flex-1">{a.title}</h3>
                          {a.excerpt && <p className="text-blue-200/50 text-sm line-clamp-2">{a.excerpt}</p>}
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Apa Kata Klien Kami
            </h2>
            <p className="text-blue-200/60 max-w-md mx-auto">
              Lebih dari 50 bisnis lokal telah mempercayakan kehadiran digital mereka kepada kami.
            </p>
          </FadeUp>
          <FadeIn delay={0.1}>
            <TestimonialCarousel testimonials={testimonials} />
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScaleIn>
            <div className="rounded-2xl border border-white/10 bg-[#071225] p-8 sm:p-10">
              <FadeUp>
                <h2 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Mau mulai dari website, lead, atau dokumen penawaran?
                </h2>
              </FadeUp>

              <FadeUp delay={0.1}>
                <p className="mt-4 max-w-2xl text-blue-100/58 leading-relaxed">
                  Ceritakan kondisi bisnis Anda sekarang. Kami bantu pilih langkah
                  paling masuk akal: landing page, company profile, SEO, atau tools
                  untuk mempercepat proses sales.
                </p>
              </FadeUp>

              <FadeUp delay={0.2}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/contact">
                    <Button size="lg" className="h-12 rounded-lg bg-blue-600 px-6 text-white shadow-none hover:bg-blue-500">
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
                    <Button size="lg" variant="outline" className="h-12 rounded-lg border-green-500/25 px-6 text-green-300 hover:bg-green-500/10">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp Langsung
                    </Button>
                  </a>
                </div>
              </FadeUp>

              <FadeUp delay={0.3}>
                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                  {["Harga dibahas di awal", "Alur kerja jelas", "Dokumen siap dipakai"].map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-blue-100/50 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </FadeUp>
            </div>
          </ScaleIn>
        </div>
      </section>
      {/* JSON-LD Structured Data */}
      <Script
        id="json-ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="json-ld-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Script
        id="json-ld-tools"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsJsonLd) }}
      />
    </div>
  );
}
