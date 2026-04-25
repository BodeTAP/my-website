import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { ArrowRight, CheckCircle, Users, Zap, Shield, Heart, Globe, Code, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, FadeIn, StaggerChildren, StaggerItem, ScaleIn, HoverCard } from "@/components/public/motion";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";

export const metadata: Metadata = {
  title: "Tentang Kami — MFWEB Web Developer Profesional",
  description:
    "Kenali MFWEB lebih dekat. Kami adalah tim web developer profesional yang membantu bisnis lokal Indonesia tampil kredibel di internet sejak hari pertama.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Tentang Kami — MFWEB Web Developer Profesional",
    description:
      "Tim web developer profesional yang membantu bisnis lokal Indonesia tampil kredibel di internet.",
  },
};

const values = [
  {
    icon: Zap,
    title: "Cepat & Tepat Waktu",
    desc: "Kami menghargai waktu Anda. Proyek diselesaikan sesuai deadline yang disepakati, tanpa drama.",
  },
  {
    icon: Shield,
    title: "Kualitas Tanpa Kompromi",
    desc: "Setiap website dibangun dengan standar tinggi — cepat, aman, mobile-friendly, dan dioptimasi SEO.",
  },
  {
    icon: Heart,
    title: "Klien adalah Mitra",
    desc: "Kami tidak sekadar membuat website lalu pergi. Kami mendampingi bisnis Anda tumbuh di dunia digital.",
  },
  {
    icon: Headphones,
    title: "Support Setelah Launch",
    desc: "Ada kendala? Langsung hubungi via WhatsApp. Kami siap membantu kapan pun Anda butuhkan.",
  },
];

const stats = [
  { num: "50+", label: "Proyek Selesai" },
  { num: "95%", label: "Klien Puas" },
  { num: "3 Hari", label: "Rata-rata Delivery" },
  { num: "24/7", label: "Support WhatsApp" },
];

const reasons = [
  "Website dibangun custom, bukan template murahan",
  "Sudah termasuk domain .com + hosting + SSL",
  "Dioptimasi SEO agar muncul di Google",
  "Loading super cepat (skor 90+ di PageSpeed)",
  "Responsif sempurna di semua perangkat",
  "Dashboard admin untuk update konten sendiri",
  "Revisi sampai Anda puas",
  "Harga transparan, tanpa biaya tersembunyi",
];

export default function AboutPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Tentang Kami", item: `${SITE_URL}/about` },
    ],
  };

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute top-20 right-1/4 w-48 h-48 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none animate-float" />

        <div className="max-w-4xl mx-auto text-center relative">
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-blue-300 mb-8 border border-blue-500/20">
              <Users className="w-3.5 h-3.5" />
              Tentang Kami
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Kami Membantu{" "}
              <span className="text-gradient">Bisnis Lokal</span>{" "}
              Tampil Profesional di Internet
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-blue-100/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              MFWEB lahir dari satu keyakinan sederhana: setiap bisnis lokal di Indonesia
              berhak memiliki website profesional yang membantu mereka tumbuh dan bersaing di era digital.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div className="glass rounded-3xl p-8 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                  Cerita <span className="text-gradient">Kami</span>
                </h2>
                <div className="space-y-4 text-blue-100/70 text-sm sm:text-base leading-relaxed">
                  <p>
                    Banyak bisnis lokal yang sudah punya produk bagus, pelayanan prima, dan pelanggan setia
                    — tapi belum punya kehadiran online yang profesional. Mereka hanya mengandalkan Google Maps
                    atau media sosial.
                  </p>
                  <p>
                    Kami melihat celah itu. Dengan pengalaman di bidang web development, kami membangun MFWEB
                    untuk menjadi jembatan bagi bisnis lokal yang ingin tampil lebih kredibel dan mudah
                    ditemukan calon pelanggan melalui Google.
                  </p>
                  <p>
                    Setiap website yang kami buat bukan sekadar halaman online — ini adalah <strong className="text-white">aset digital</strong> yang
                    bekerja 24/7 untuk bisnis Anda.
                  </p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className="glass rounded-2xl p-5 text-center hover:border-blue-500/30 transition-colors"
                  >
                    <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{s.num}</div>
                    <div className="text-blue-200/50 text-xs sm:text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Nilai yang Kami <span className="text-gradient">Pegang Teguh</span>
            </h2>
            <p className="text-blue-200/60 max-w-xl mx-auto">
              Empat prinsip yang menjadi fondasi cara kami bekerja dengan setiap klien.
            </p>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <HoverCard className="h-full">
                  <div className="glass rounded-2xl p-6 hover:border-blue-500/40 transition-colors duration-300 group h-full">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-5 group-hover:bg-blue-600/35 transition-colors">
                      <v.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                    <p className="text-blue-200/50 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Kenapa Memilih <span className="text-gradient">MFWEB?</span>
              </h2>
              <p className="text-blue-200/60 mb-8">
                Kami bukan sekadar jasa buat website. Kami adalah partner digital yang memahami
                kebutuhan bisnis lokal Indonesia.
              </p>
              <ul className="space-y-3">
                {reasons.map((r) => (
                  <li key={r} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-blue-100/70 text-sm sm:text-base">{r}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="glass rounded-3xl p-8 glow-blue relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Tech Stack Modern</p>
                      <p className="text-blue-200/50 text-xs">Teknologi terkini untuk performa terbaik</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma", "Vercel", "SEO"].map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <ScaleIn>
            <div className="glass rounded-3xl p-10 sm:p-14 glow-blue relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-transparent pointer-events-none" />
              <FadeUp className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Siap Bekerja Sama dengan <span className="text-gradient">Kami?</span>
                </h2>
              </FadeUp>
              <FadeUp delay={0.1} className="relative">
                <p className="text-blue-200/60 mb-8">
                  Konsultasi gratis tanpa komitmen. Ceritakan bisnis Anda, kami bantu carikan solusi terbaik.
                </p>
              </FadeUp>
              <FadeUp delay={0.2} className="relative">
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/contact">
                    <Button size="lg" className="btn-shine bg-blue-600 hover:bg-blue-500 text-white px-10 h-12 shadow-lg shadow-blue-500/25">
                      Konsultasi Gratis <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/layanan">
                    <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 px-8">
                      Lihat Layanan Kami
                    </Button>
                  </Link>
                </div>
              </FadeUp>
            </div>
          </ScaleIn>
        </div>
      </section>

      <Script
        id="json-ld-breadcrumb-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}
