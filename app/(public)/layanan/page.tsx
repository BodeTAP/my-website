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
  LayoutDashboard,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FadeUp,
  StaggerChildren,
  StaggerItem,
  ScaleIn,
  HoverCard,
} from "@/components/public/motion";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";
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
    price: "1,5 Juta",
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
  {
    icon: LayoutDashboard,
    title: "Aplikasi Web Bisnis",
    slug: "aplikasi-web",
    desc: "Sistem digital cerdas untuk operasional bisnis skala menengah ke atas — mencakup manajemen inventori, kasir, portal HR, booking online khusus, hingga dashboard analitik custom sesuai roadmap perusahaan Anda.",
    features: [
      "Sistem Multi-Role & Manajemen User",
      "Database Relasional & Pelaporan Kustom",
      "Panel Admin Eksklusif MFWEB",
      "Otomatisasi Notifikasi (WA/Email)",
      "Progressive Web App (PWA) Ready",
    ],
    price: "15 Juta",
    color: "violet",
  },
];

const process_steps = [
  {
    step: "01",
    title: "Konsultasi Gratis",
    desc: "Ceritakan kebutuhan spesifik Anda. Tim kami analisa pasar dan merancang solusi digital yang tepat sasaran.",
    icon: MessageCircle,
  },
  {
    step: "02",
    title: "Tahap Eksekusi",
    desc: "Mulai dari sketsa antarmuka (UI/UX) hingga penulisan kode, kami kerjakan dengan metrik performa tinggi.",
    icon: Palette,
  },
  {
    step: "03",
    title: "Uji & Revisi",
    desc: "Anda akan mendapatkan akses pratinjau. Kami lakukan uji responsivitas dan merevisi hingga desain sesuai ekspektasi.",
    icon: BarChart3,
  },
  {
    step: "04",
    title: "Rilis Publik",
    desc: "Domain terhubung, optimasi selesai. Website Anda resmi online dan siap mendatangkan ratusan konversi baru.",
    icon: Globe,
  },
];

const colorMap: Record<
  string,
  { bg: string; border: string; text: string; badge: string }
> = {
  blue: {
    bg: "bg-blue-600/15",
    border: "border-blue-500/30",
    text: "text-blue-400",
    badge: "bg-blue-500",
  },
  indigo: {
    bg: "bg-indigo-600/15",
    border: "border-indigo-500/30",
    text: "text-indigo-400",
    badge: "bg-indigo-500",
  },
  teal: {
    bg: "bg-teal-600/15",
    border: "border-teal-500/30",
    text: "text-teal-400",
    badge: "bg-teal-500",
  },
  purple: {
    bg: "bg-purple-600/15",
    border: "border-purple-500/30",
    text: "text-purple-400",
    badge: "bg-purple-500",
  },
  violet: {
    bg: "bg-violet-600/15",
    border: "border-violet-500/30",
    text: "text-violet-400",
    badge: "bg-violet-500",
  },
};

export default function LayananPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Layanan",
        item: `${SITE_URL}/layanan`,
      },
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
          itemOffered: {
            "@type": "Service",
            name: s.title,
            description: s.desc,
          },
          price:
            s.price === "800K"
              ? "800000"
              : s.price === "5,4 Juta"
                ? "5400000"
                : s.price === "15 Juta"
                  ? "15000000"
                  : "1500000",
          priceCurrency: "IDR",
        })),
    },
  };

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/20 to-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 glass px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-blue-300 mb-8 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-blue-500/5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Layanan Digital Premium
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
              Solusi Website{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Lengkap
              </span>{" "}
              <br className="hidden sm:block" />
              untuk Akselerasi Bisnis Anda
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-blue-200/70 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Dari landing page sederhana pembawa konversi, hingga sistem
              aplikasi bisnis kompleks. Kami merancang dengan{" "}
              <strong className="text-white">estetika</strong> dan membangun
              untuk <strong className="text-white">performa</strong>.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-14 text-base font-bold shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all rounded-xl group"
                >
                  Konsultasi Proyek{" "}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/kalkulasi-harga">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 h-14 px-10 text-base font-bold rounded-xl glass hover:border-white/20 transition-all"
                >
                  Lihat Estimasi Harga
                </Button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeUp className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
              Katalog{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Layanan
              </span>{" "}
              Kami
            </h2>
            <p className="text-blue-200/60 max-w-2xl mx-auto text-lg leading-relaxed">
              Setiap layanan sudah melalui riset pasar dan terbukti membantu
              ribuan bisnis skala kecil hingga menengah untuk tumbuh secara
              digital.
            </p>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.slice(0, 4).map((service) => {
              const c = colorMap[service.color];
              const waText = `Halo MFWEB, saya tertarik dengan layanan ${service.title}. Boleh konsultasi lebih lanjut?`;
              return (
                <StaggerItem key={service.slug}>
                  <HoverCard className="h-full">
                    <div className="glass rounded-3xl p-8 sm:p-10 h-full flex flex-col border border-white/5 hover:border-white/20 transition-all duration-500 group relative overflow-hidden bg-black/10">
                      {/* Glow Behind */}
                      <div
                        className={`absolute -right-20 -top-20 w-64 h-64 ${c.bg} blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                      />

                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8 relative z-10">
                        <ScaleIn
                          className={`w-16 h-16 rounded-2xl ${c.bg} border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg`}
                        >
                          <service.icon className={`w-8 h-8 ${c.text}`} />
                        </ScaleIn>
                        <div className="sm:text-right bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/5 self-start h-fit">
                          <span className="text-blue-200/40 text-[10px] uppercase tracking-widest font-bold block mb-0.5">
                            Mulai Dari
                          </span>
                          <span className={`font-black text-xl ${c.text}`}>
                            {service.price === "Konsultasi"
                              ? "Konsultasi"
                              : `Rp ${service.price}`}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex-1">
                        <h3 className="text-white font-black text-2xl mb-3">
                          {service.title}
                        </h3>
                        <p className="text-blue-200/60 text-base leading-relaxed mb-8">
                          {service.desc}
                        </p>

                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8">
                          <p className="text-white/80 text-[11px] uppercase tracking-widest font-bold mb-4">
                            Fitur Utama:
                          </p>
                          <ul className="space-y-3.5">
                            {service.features.map((f) => (
                              <li key={f} className="flex items-start gap-3">
                                <CheckCircle
                                  className={`w-4 h-4 shrink-0 mt-0.5 ${c.text}`}
                                />
                                <span className="text-blue-100/70 text-sm font-medium">
                                  {f}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex flex-col sm:flex-row gap-4 relative z-10 mt-auto">
                        <a
                          href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            className={`w-full h-12 font-bold text-sm bg-white text-black hover:bg-gray-200 shadow-xl transition-all`}
                          >
                            Konsultasi via WA
                          </Button>
                        </a>
                        <Link
                          href={`/layanan/${service.slug}`}
                          className="flex-1"
                        >
                          <Button
                            variant="ghost"
                            className="w-full h-12 text-white bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold"
                          >
                            Pelajari Detail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              );
            })}

            {/* Premium 5th Item Spanning 2 Columns */}
            {services[4] &&
              (() => {
                const service = services[4];
                const c = colorMap[service.color];
                const waText = `Halo MFWEB, saya tertarik dengan layanan Enterprise: ${service.title}. Boleh atur waktu meeting?`;
                return (
                  <StaggerItem className="lg:col-span-2">
                    <HoverCard className="h-full">
                      <div className="glass rounded-3xl p-8 sm:p-12 h-full flex flex-col lg:flex-row gap-8 lg:gap-16 border border-white/10 hover:border-violet-500/30 transition-all duration-700 group relative overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.05)] bg-gradient-to-br from-[#050b14] to-[#0a0514]">
                        <div
                          className={`absolute left-0 bottom-0 w-[500px] h-[500px] ${c.bg} blur-[120px] rounded-full pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-1000`}
                        />

                        <div className="flex-1 relative z-10 flex flex-col justify-center">
                          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-violet-400 mb-6 w-fit shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                            <Zap className="w-4 h-4" /> Solusi Enterprise
                          </div>
                          <h3 className="text-white font-black text-3xl sm:text-4xl mb-4 leading-tight">
                            {service.title}
                          </h3>
                          <p className="text-blue-200/70 text-lg leading-relaxed mb-6 max-w-xl">
                            {service.desc}
                          </p>

                          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md w-fit px-6 py-4 rounded-2xl border border-white/5 mb-8 lg:mb-0">
                            <div>
                              <span className="text-blue-200/40 text-[10px] uppercase tracking-widest font-bold block mb-1">
                                Mulai Dari
                              </span>
                              <span className={`font-black text-2xl ${c.text}`}>
                                Rp {service.price}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 relative z-10 flex flex-col">
                          <div className="bg-black/30 p-6 sm:p-8 rounded-3xl border border-white/10 flex-1 mb-8">
                            <p className="text-white/90 text-sm font-bold uppercase tracking-widest mb-6">
                              Spesifikasi Sistem Utama:
                            </p>
                            <ul className="space-y-4">
                              {service.features.map((f) => (
                                <li key={f} className="flex items-center gap-4">
                                  <div
                                    className={`w-8 h-8 rounded-full ${c.bg} border border-violet-500/30 flex items-center justify-center shrink-0`}
                                  >
                                    <CheckCircle
                                      className={`w-4 h-4 ${c.text}`}
                                    />
                                  </div>
                                  <span className="text-blue-50/80 text-base font-medium">
                                    {f}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <a
                              href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1"
                            >
                              <Button
                                className={`w-full h-14 font-black text-base bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all rounded-xl`}
                              >
                                Jadwalkan Meeting Spesifikasi
                              </Button>
                            </a>
                            <Link
                              href={`/layanan/${service.slug}`}
                              className="flex-1 sm:flex-none sm:w-1/3"
                            >
                              <Button
                                variant="ghost"
                                className="w-full h-14 text-white bg-white/5 hover:bg-white/10 border border-white/10 text-base font-bold rounded-xl"
                              >
                                Pelajari Detail
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </HoverCard>
                  </StaggerItem>
                );
              })()}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Process (Connected Journey) ───────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeUp className="text-center mb-24">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
              Bagaimana Kami{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Bekerja?
              </span>
            </h2>
            <p className="text-blue-200/60 max-w-2xl mx-auto text-lg leading-relaxed">
              Kami menyederhanakan proses digitalisasi yang kompleks menjadi 4
              langkah transparan. Anda selalu dilibatkan dan mendapatkan
              *update* di setiap tahapnya.
            </p>
          </FadeUp>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6 relative z-10">
              {process_steps.map((step, i) => (
                <FadeUp key={step.step} delay={i * 0.1}>
                  <div className="relative flex flex-col items-center text-center group">
                    <div className="w-24 h-24 rounded-full bg-[#050b14] border-[6px] border-[#030914] ring-2 ring-blue-500/20 flex items-center justify-center mb-8 relative z-10 group-hover:ring-blue-400 group-hover:scale-110 transition-all duration-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full group-hover:opacity-100 transition-opacity" />
                      <step.icon className="w-8 h-8 text-blue-400 relative z-10 group-hover:text-blue-300 transition-colors" />
                    </div>
                    <div className="absolute top-0 -right-4 lg:-right-8 text-8xl font-black text-blue-500/[0.03] select-none pointer-events-none group-hover:text-blue-500/10 transition-colors duration-500">
                      {step.step}
                    </div>

                    <h3 className="text-white font-bold text-xl mb-3 relative z-10">
                      {step.title}
                    </h3>
                    <p className="text-blue-200/60 text-sm leading-relaxed max-w-[260px] mx-auto relative z-10">
                      {step.desc}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Guarantee ─────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <ScaleIn>
            <div className="glass rounded-[40px] p-10 sm:p-16 text-center border border-emerald-500/20 relative overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.05)] bg-[#040d1a]">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 mb-8 ring-1 ring-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                  Kepuasan Anda,{" "}
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Komitmen Utama Kami
                  </span>
                </h2>
                <p className="text-blue-100/80 max-w-3xl mx-auto mb-12 text-lg leading-relaxed font-medium">
                  Kami tidak berhenti bekerja sampai Anda benar-benar puas
                  dengan hasilnya. Semua layanan transparan, tepat waktu, dan
                  berorientasi pada penciptaan nilai tambah untuk bisnis Anda.
                </p>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 shadow-lg hover:border-emerald-500/30 transition-colors">
                    <Clock className="w-6 h-6 text-emerald-400" />
                    <span className="text-white font-bold text-sm">
                      Target Pengerjaan Tepat Waktu
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 shadow-lg hover:border-emerald-500/30 transition-colors">
                    <Smartphone className="w-6 h-6 text-emerald-400" />
                    <span className="text-white font-bold text-sm">
                      Jaminan 100% Responsif
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 shadow-lg hover:border-emerald-500/30 transition-colors">
                    <Headphones className="w-6 h-6 text-emerald-400" />
                    <span className="text-white font-bold text-sm">
                      Tim Support Siaga Kapanpun
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeUp>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">
              Siap Memulai Proyek{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Digital
              </span>{" "}
              Anda?
            </h2>
            <p className="text-blue-200/60 mb-10 text-xl max-w-2xl mx-auto leading-relaxed">
              Ribuan peluang di dunia digital menunggu Anda. Hubungi kami
              sekarang untuk merencanakan strategi eksekusi website Anda.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-14 text-base font-bold shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all rounded-xl group"
                >
                  Mulai Diskusi via Email{" "}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a
                href={`https://wa.me/${WA}?text=Halo%20MFWEB%2C%20saya%20ingin%20konsultasi%20layanan%20website`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 h-14 px-10 text-base font-bold rounded-xl glass hover:border-white/20 transition-all"
                >
                  💬 Konsultasi via WhatsApp
                </Button>
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </div>
  );
}
