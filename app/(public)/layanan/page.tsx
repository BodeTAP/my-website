import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  ShoppingCart,
  Building2,
  Megaphone,
  Search,
  Smartphone,
  Palette,
  BarChart3,
  CheckCircle,
  Clock,
  MessageCircle,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, FadeIn, StaggerChildren, StaggerItem, ScaleIn, HoverCard } from "@/components/public/motion";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";
const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Website & Layanan Digital untuk Bisnis",
  description:
    "Layanan lengkap MFWEB: pembuatan landing page, company profile, toko online, dan optimasi SEO. Mulai dari Rp 800K, termasuk domain dan hosting gratis.",
  alternates: { canonical: "/layanan" },
  openGraph: {
    title: "Jasa Pembuatan Website & Layanan Digital | MFWEB",
    description:
      "Landing page, company profile, toko online, optimasi SEO. Mulai Rp 800K, termasuk domain + hosting.",
  },
};

const services = [
  {
    icon: Megaphone,
    title: "Landing Page",
    slug: "landing-page",
    desc: "Halaman promosi yang dirancang untuk mengubah pengunjung menjadi pelanggan. Cocok untuk iklan, launch produk, dan kampanye marketing.",
    features: [
      "Desain 1 halaman persuasif",
      "Copywriting yang menjual",
      "Integrasi WhatsApp & CTA",
      "Mobile-responsive",
      "Optimasi kecepatan loading",
    ],
    price: "800K",
    color: "blue",
  },
  {
    icon: Building2,
    title: "Company Profile",
    slug: "company-profile",
    desc: "Website profesional untuk menampilkan profil bisnis Anda secara lengkap. Tingkatkan kredibilitas dan kepercayaan calon pelanggan.",
    features: [
      "3-7 halaman (Simple / Pro)",
      "Desain custom & modern",
      "SEO dasar untuk Google",
      "Email bisnis profesional",
      "Dashboard admin",
    ],
    price: "1,5 - 3,5 Juta",
    color: "indigo",
  },
  {
    icon: ShoppingCart,
    title: "Toko Online",
    slug: "toko-online",
    desc: "Website e-commerce lengkap dengan keranjang belanja, integrasi pembayaran, dan manajemen produk. Siap berjualan 24 jam.",
    features: [
      "Unlimited halaman produk",
      "Integrasi metode pembayaran",
      "Manajemen pesanan & stok",
      "Multi bahasa",
      "Dashboard admin lengkap",
    ],
    price: "5,4 Juta",
    color: "teal",
  },
  {
    icon: Search,
    title: "Optimasi SEO",
    slug: "optimasi-seo",
    desc: "Tingkatkan visibilitas website Anda di Google. Kami optimasi dari sisi teknis, konten, hingga strategi keyword agar bisnis Anda mudah ditemukan.",
    features: [
      "Audit SEO menyeluruh",
      "Optimasi kata kunci lokal",
      "Structured data (JSON-LD)",
      "Konten SEO-friendly",
      "Laporan perkembangan ranking",
    ],
    price: "Konsultasi",
    color: "purple",
  },
];

const process_steps = [
  {
    step: "01",
    title: "Konsultasi Gratis",
    desc: "Ceritakan kebutuhan bisnis Anda. Kami analisa dan berikan rekomendasi solusi terbaik.",
    icon: MessageCircle,
  },
  {
    step: "02",
    title: "Desain & Pengembangan",
    desc: "Tim kami mulai merancang dan membangun website sesuai brief yang sudah disepakati.",
    icon: Palette,
  },
  {
    step: "03",
    title: "Review & Revisi",
    desc: "Anda review hasilnya. Jika ada yang perlu diperbaiki, kami revisi sampai Anda puas.",
    icon: BarChart3,
  },
  {
    step: "04",
    title: "Launch & Support",
    desc: "Website Anda go live! Kami berikan training singkat dan support teknis berkelanjutan.",
    icon: Globe,
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue:   { bg: "bg-blue-600/15", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500" },
  indigo: { bg: "bg-indigo-600/15", border: "border-indigo-500/30", text: "text-indigo-400", badge: "bg-indigo-500" },
  teal:   { bg: "bg-teal-600/15", border: "border-teal-500/30", text: "text-teal-400", badge: "bg-teal-500" },
  purple: { bg: "bg-purple-600/15", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500" },
};

export default function LayananPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Layanan", item: `${SITE_URL}/layanan` },
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    provider: { "@type": "Organization", name: "MFWEB", url: SITE_URL },
    serviceType: "Web Development",
    areaServed: { "@type": "Country", name: "Indonesia" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Layanan Pembuatan Website",
      itemListElement: services
        .filter((s) => s.price !== "Konsultasi")
        .map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s.title, description: s.desc },
          price: s.price === "800K" ? "800000" : s.price === "5,4 Juta" ? "5400000" : "1500000",
          priceCurrency: "IDR",
        })),
    },
  };

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

        <div className="max-w-4xl mx-auto text-center relative">
          <FadeUp>
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-blue-300 mb-8 border border-blue-500/20">
              <Globe className="w-3.5 h-3.5" />
              Layanan Kami
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Solusi Website <span className="text-gradient">Lengkap</span>{" "}
              untuk Bisnis Anda
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-blue-100/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Dari landing page sederhana sampai toko online kompleks — kami membangun website
              yang tidak hanya tampil menarik, tapi juga menghasilkan pelanggan baru.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="btn-shine bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 shadow-lg shadow-blue-500/25">
                  Konsultasi Gratis <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/#pricing">
                <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 px-8">
                  Lihat Harga
                </Button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Layanan <span className="text-gradient">Unggulan</span> Kami
            </h2>
            <p className="text-blue-200/60 max-w-xl mx-auto">
              Pilih layanan yang sesuai kebutuhan bisnis Anda. Setiap layanan sudah termasuk
              konsultasi gratis sebelum pengerjaan.
            </p>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => {
              const c = colorMap[service.color];
              const waText = `Halo MFWEB, saya tertarik dengan layanan ${service.title}. Boleh konsultasi lebih lanjut?`;
              return (
                <StaggerItem key={service.slug}>
                  <HoverCard className="h-full">
                    <div className={`glass rounded-2xl p-7 h-full flex flex-col hover:${c.border} transition-colors duration-300 group`}>
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-5">
                        <ScaleIn className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                          <service.icon className={`w-6 h-6 ${c.text}`} />
                        </ScaleIn>
                        <div>
                          <h3 className="text-white font-bold text-lg">{service.title}</h3>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-blue-200/40 text-xs">Mulai</span>
                            <span className={`font-bold ${c.text}`}>Rp {service.price}</span>
                          </div>
                        </div>
                      </div>

                      {/* Desc */}
                      <p className="text-blue-200/60 text-sm leading-relaxed mb-5">{service.desc}</p>

                      {/* Features */}
                      <ul className="space-y-2 mb-6 flex-1">
                        {service.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5">
                            <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${c.text}`} />
                            <span className="text-blue-100/70 text-sm">{f}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <a
                        href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto"
                      >
                        <Button className={`w-full h-11 font-semibold border ${c.border} bg-white/5 hover:bg-white/10 text-white`}>
                          Konsultasi Layanan Ini
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </a>
                      <Link href={`/layanan/${service.slug}`} className="mt-2 block">
                        <Button variant="ghost" className="w-full h-9 text-blue-400/60 hover:text-blue-300 text-xs">
                          Lihat Detail Layanan →
                        </Button>
                      </Link>
                    </div>
                  </HoverCard>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Cara Kerja <span className="text-gradient">Kami</span>
            </h2>
            <p className="text-blue-200/60 max-w-xl mx-auto">
              4 langkah sederhana dari konsultasi sampai website Anda live.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {process_steps.map((step, i) => (
              <FadeUp key={step.step} delay={i * 0.1}>
                <div className="glass rounded-2xl p-6 text-center hover:border-blue-500/30 transition-colors group relative">
                  <div className="text-6xl font-black text-blue-500/10 absolute top-4 right-4 select-none">
                    {step.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600/35 transition-colors">
                    <step.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-blue-200/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guarantee ─────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="glass rounded-3xl p-8 sm:p-12 text-center glow-blue relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/15 mb-6">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Garansi Kepuasan <span className="text-gradient">100%</span>
                </h2>
                <p className="text-blue-200/60 max-w-xl mx-auto mb-8 leading-relaxed">
                  Setiap paket sudah termasuk revisi. Kami tidak berhenti sampai Anda benar-benar puas
                  dengan hasilnya. Jika ada kendala setelah website live, kami bantu tanpa biaya tambahan.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-blue-200/70 border border-white/5">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Pengerjaan 3-7 hari
                  </div>
                  <div className="flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-blue-200/70 border border-white/5">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    100% Mobile-friendly
                  </div>
                  <div className="flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-blue-200/70 border border-white/5">
                    <Headphones className="w-4 h-4 text-blue-400" />
                    Support 24/7
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
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
                  Mulai Bangun Website <span className="text-gradient">Sekarang</span>
                </h2>
              </FadeUp>
              <FadeUp delay={0.1} className="relative">
                <p className="text-blue-200/60 mb-8">
                  Konsultasi gratis tanpa biaya dan tanpa komitmen. Ceritakan kebutuhan Anda,
                  kami berikan solusi terbaik.
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
                    href={`https://wa.me/${WA}?text=Halo%20MFWEB%2C%20saya%20ingin%20konsultasi%20layanan%20website`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 px-8">
                      💬 WhatsApp Langsung
                    </Button>
                  </a>
                </div>
              </FadeUp>
            </div>
          </ScaleIn>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
    </div>
  );
}
