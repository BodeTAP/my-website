import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import type { Metadata } from "next";
import { ArrowRight, Globe, TrendingUp, Shield, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DomainChecker from "@/components/public/DomainChecker";
import PricingSection from "@/components/public/PricingSection";
import TestimonialCarousel from "@/components/public/TestimonialCarousel";
import HeroStats from "@/components/public/HeroStats";
import FAQSection from "@/components/public/FAQSection";
import { FadeUp, FadeIn, StaggerChildren, StaggerItem, ScaleIn, HoverCard, StaggerWords } from "@/components/public/motion";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
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
  { icon: Globe,      title: "Terlihat Lebih Profesional",  desc: "Website memberi kesan serius dan terpercaya, jauh melampaui profil Google Maps." },
  { icon: TrendingUp, title: "Mudah Ditemukan di Google",    desc: "Kami bangun website yang dioptimasi SEO agar bisnis Anda muncul di pencarian lokal." },
  { icon: Shield,     title: "Kontrol Penuh atas Merek",    desc: "Tampilkan produk, harga, dan cerita bisnis Anda sendiri tanpa ketergantungan platform lain." },
  { icon: Zap,        title: "Loading Super Cepat",         desc: "Website yang lambat kehilangan 53% pengunjung. Kami pastikan situs Anda memuat dalam detik." },
];

// Testimonials now managed from admin — fetched dynamically

export default async function HomePage() {
  const [articles, portfolios, testimonials, heroStats] = await Promise.all([
    getLatestArticles(),
    getFeaturedPortfolios(),
    getTestimonials(),
    getHeroStats(),
  ]);

  // JSON-LD: FAQ Page + LocalBusiness + Service
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
    ],
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#business`,
    name: "MFWEB",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/og-image.png`,
    description:
      "Jasa pembuatan website profesional untuk bisnis lokal. Website cepat, menarik, dan SEO-friendly.",
    telephone: "+62-822-2168-2343",
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

  return (
    <div className="relative overflow-x-clip">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Animated orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-blue-400/8 rounded-full blur-3xl pointer-events-none animate-float-delay" />

        <div className="max-w-4xl mx-auto text-center relative">
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-blue-300 mb-8 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Tersedia untuk proyek baru
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <StaggerWords
              text="Website Profesional yang Mendatangkan Klien, Bukan Sekadar Pajangan"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6"
            />
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="text-blue-100/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Ubah bisnis lokal Anda menjadi pemain besar di era digital. Miliki website super cepat, ramah SEO, dan siap bersaing di halaman pertama Google. Selesai dalam 3 hari!
            </p>
          </FadeUp>

          <FadeUp delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 relative z-20">
              <Link href="/contact">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-14 rounded-full shadow-[0_0_40px_-10px_rgba(37,99,235,0.6)] text-base font-semibold transition-all hover:scale-105 btn-shine">
                  Mulai Buat Website Saya
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button size="lg" variant="outline" className="glass border-white/10 text-white hover:bg-white/10 h-14 px-8 rounded-full text-base font-medium transition-all hover:scale-105">
                  Lihat Hasil Kerja Kami
                </Button>
              </Link>
            </div>
          </FadeUp>

          {/* Browser Mockup Visual Punch */}
          <FadeUp delay={0.5} className="w-full max-w-4xl mx-auto relative hidden sm:block mb-16 pointer-events-none select-none">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
            
            <div className="relative glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Browser Header */}
              <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="mx-auto bg-black/20 rounded-md px-4 py-1 text-[11px] text-blue-200/50 flex items-center gap-2 border border-white/5">
                  <Globe className="w-3 h-3" />
                  bisnis-anda.com
                </div>
                <div className="w-10"></div>
              </div>
              {/* Mockup Body */}
              <div className="h-[280px] relative bg-[#060b14]/80 p-6 flex flex-col">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
                
                <div className="flex gap-6 h-full relative z-10">
                  {/* Left Sidebar */}
                  <div className="w-40 flex flex-col gap-3 border-r border-white/5 pr-6">
                    <div className="h-5 w-20 bg-white/10 rounded mb-4" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-3/4 bg-white/5 rounded" />
                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                  </div>
                  {/* Main Content */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-1/3 bg-blue-500/20 rounded" />
                      <div className="h-6 w-20 bg-blue-600/30 rounded-full" />
                    </div>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="h-20 glass bg-white/5 rounded-xl border border-white/5 flex flex-col justify-center p-4">
                        <div className="h-2 w-12 bg-white/20 rounded mb-2" />
                        <div className="h-5 w-16 bg-blue-400/40 rounded" />
                      </div>
                      <div className="h-20 glass bg-white/5 rounded-xl border border-white/5 flex flex-col justify-center p-4">
                        <div className="h-2 w-12 bg-white/20 rounded mb-2" />
                        <div className="h-5 w-10 bg-green-400/40 rounded" />
                      </div>
                      <div className="h-20 glass bg-white/5 rounded-xl border border-white/5 flex flex-col justify-center p-4">
                        <div className="h-2 w-12 bg-white/20 rounded mb-2" />
                        <div className="h-5 w-20 bg-purple-400/40 rounded" />
                      </div>
                    </div>
                    {/* Chart area */}
                    <div className="flex-1 mt-2 glass bg-white/5 rounded-xl border border-white/5 p-4 overflow-hidden relative">
                      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-linear-to-t from-blue-500/10 to-transparent" />
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,100 L0,60 Q25,30 50,50 T100,20 L100,100 Z" fill="url(#gradMockup)" opacity="0.3" />
                        <path d="M0,60 Q25,30 50,50 T100,20" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
                        <defs>
                          <linearGradient id="gradMockup" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Fade out bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[#060b14] to-transparent z-20" />
              </div>
            </div>
          </FadeUp>

          <HeroStats stats={heroStats} />
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-[-200px] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Mengapa Bisnis Anda <span className="text-gradient">Butuh Website?</span>
            </h2>
            <p className="text-blue-200/60 max-w-xl mx-auto">
              Di era digital, kehadiran online yang profesional adalah perbedaan antara bisnis yang
              berkembang dan yang tertinggal.
            </p>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <StaggerItem key={b.title}>
                <HoverCard className="h-full">
                  <div className="glass rounded-2xl p-6 hover:border-blue-500/40 transition-colors duration-300 group h-full">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-5 group-hover:bg-blue-600/35 transition-colors">
                      <b.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{b.title}</h3>
                    <p className="text-blue-200/50 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                </HoverCard>
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
                      <div className="glass rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors duration-300 group cursor-pointer h-full">
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
                <p className="text-blue-200/60">Panduan untuk pemilik bisnis di era digital</p>
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
                      <article className="glass rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors duration-300 group h-full flex flex-col">
                        <div className="h-40 bg-linear-to-br from-blue-900/40 to-indigo-900/20 overflow-hidden">
                          {a.coverImage ? (
                            <Image src={a.coverImage} alt={a.title} width={400} height={160} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">📰</div>
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
        <div className="absolute top-0 left-[-100px] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-[-100px] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Apa Kata <span className="text-gradient">Klien Kami</span>
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
        <div className="max-w-3xl mx-auto text-center">
          <ScaleIn>
            <div className="glass rounded-3xl p-10 sm:p-14 glow-blue relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-transparent pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

              <FadeUp className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Siap Membawa Bisnis Anda{" "}
                  <span className="text-gradient">ke Level Berikutnya?</span>
                </h2>
              </FadeUp>

              <FadeUp delay={0.1} className="relative">
                <p className="text-blue-200/60 mb-8">
                  Konsultasi gratis, tanpa biaya, tanpa komitmen. Kami bantu Anda memahami solusi terbaik.
                </p>
              </FadeUp>

              <FadeUp delay={0.2} className="relative">
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/contact">
                    <Button size="lg" className="btn-shine bg-blue-600 hover:bg-blue-500 text-white px-10 h-12 shadow-lg shadow-blue-500/25">
                      Konsultasi Gratis Sekarang
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <a
                    href={`https://wa.me/${process.env.WHATSAPP_NUMBER ?? "6282221682343"}?text=Halo%20MFWEB%2C%20saya%20ingin%20konsultasi%20website`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 h-12 px-8">
                      💬 WhatsApp Langsung
                    </Button>
                  </a>
                </div>
              </FadeUp>

              <FadeUp delay={0.3} className="relative">
                <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
                  {["Tanpa biaya tersembunyi", "Pengerjaan cepat", "Revisi sampai puas"].map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-blue-300/60 text-xs">
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
    </div>
  );
}
