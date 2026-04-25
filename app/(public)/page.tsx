import Link from "next/link";
import { ArrowRight, Globe, TrendingUp, Shield, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DomainChecker from "@/components/public/DomainChecker";
import PricingSection from "@/components/public/PricingSection";
import TestimonialCarousel from "@/components/public/TestimonialCarousel";
import HeroStats from "@/components/public/HeroStats";
import FAQSection from "@/components/public/FAQSection";
import { FadeUp, FadeIn, StaggerChildren, StaggerItem, ScaleIn, HoverCard } from "@/components/public/motion";
import { prisma } from "@/lib/prisma";

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
  { name: "Ibu Ratna",  business: "Klinik Gigi Sehat",    text: "Sejak punya website, pasien baru meningkat drastis. Banyak yang bilang nemunya dari Google!", rating: 5 },
  { name: "Pak Budi",   business: "Resto Nusantara",      text: "Proses pembuatannya cepat dan hasilnya melebihi ekspektasi saya. Sangat profesional.", rating: 5 },
  { name: "Mba Sinta",  business: "Butik Mode",           text: "Sekarang customer bisa lihat koleksi dan order langsung dari website. Omset naik 40%!", rating: 5 },
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

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Tingkatkan Kredibilitas{" "}
              <span className="text-gradient">Bisnis Lokal Anda</span>{" "}
              dengan Website Profesional
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-blue-100/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Bisnis Anda sudah ada di Google Maps — tapi itu belum cukup. Website profesional
              memberi Anda kontrol penuh, tampil lebih kredibel, dan mudah ditemukan calon pelanggan.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/contact">
                <Button size="lg" className="btn-shine bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 shadow-lg shadow-blue-500/25 text-base">
                  Konsultasi Gratis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 px-8 text-base">
                  Lihat Portofolio
                </Button>
              </Link>
            </div>
          </FadeUp>

          <HeroStats stats={heroStats} />
        </div>
      </section>

      {/* ── Domain Checker ───────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Domain Bisnis Anda Masih Tersedia?
            </h2>
            <p className="text-blue-200/60 max-w-xl mx-auto">
              Cek sekarang sebelum didaftar orang lain. Domain yang bagus adalah aset bisnis Anda.
            </p>
          </FadeUp>
          <FadeIn delay={0.15}>
            <DomainChecker />
          </FadeIn>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
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
                            <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                            <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
    </div>
  );
}
