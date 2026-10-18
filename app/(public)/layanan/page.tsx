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
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/public/Breadcrumb";
import {
  FadeUp,
  StaggerChildren,
  StaggerItem,
  ScaleIn,
  HoverCard,
} from "@/components/public/motion";
import { JsonLd } from "@/components/public/JsonLd";

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
    desc: "Halaman promosi fokus tinggi yang dirancang untuk mengubah pengunjung iklan menjadi leads WhatsApp dan calon pembeli.",
    features: [
      "Desain 1 halaman persuasif & modern",
      "Bantuan penulisan copywriting fokus closing",
      "Integrasi tombol WhatsApp & formulir leads",
      "Tampilan mobile-first ultra responsif",
      "Optimasi kecepatan loading (PageSpeed A)",
    ],
    price: "800K",
  },
  {
    icon: Building2,
    title: "Company Profile",
    slug: "company-profile",
    desc: "Website profil bisnis resmi untuk memperkuat reputasi perusahaan, memamerkan portofolio, dan meyakinkan klien korporat.",
    features: [
      "3-7 halaman struktur bisnis (Simple / Pro)",
      "Desain custom & identitas visual terpadu",
      "Setup SEO dasar agar mudah ditemukan di Google",
      "Akun email bisnis resmi (@namabisnis.com)",
      "Dashboard admin untuk update konten mandiri",
    ],
    price: "1,5 Juta",
  },
  {
    icon: ShoppingCart,
    title: "Toko Online",
    slug: "toko-online",
    desc: "Platform katalog dan e-commerce mandiri tanpa potongan komisi pihak ketiga. Lengkap dengan checkout dan kalkulasi ongkir.",
    features: [
      "Katalog produk tak terbatas",
      "Integrasi metode pembayaran otomatis & manual",
      "Manajemen pesanan, stok, dan notifikasi order",
      "Fitur multi bahasa atau multi mata uang",
      "Panel kontrol admin penjualan terpadu",
    ],
    price: "5,4 Juta",
  },
  {
    icon: Search,
    title: "Optimasi SEO",
    slug: "optimasi-seo",
    desc: "Strategi optimasi kata kunci pencarian lokal dan nasional agar website Anda menduduki halaman pertama Google secara organik.",
    features: [
      "Audit teknis dan perbaikan arsitektur on-page",
      "Riset kata kunci potensial bernilai beli tinggi",
      "Implementasi structured data (JSON-LD Rich Snippet)",
      "Panduan struktur konten ramah mesin pencari",
      "Laporan progres visibilitas & ranking bulanan",
    ],
    price: "Konsultasi",
  },
  {
    icon: LayoutDashboard,
    title: "Aplikasi Web Bisnis Custom",
    slug: "aplikasi-web",
    desc: "Sistem operasional custom sesuai alur bisnis unik Anda: modul inventori, kasir cabang, portal klien, atau dashboard booking terpusat.",
    features: [
      "Arsitektur database relasional & role manajemen user",
      "Dashboard analitik performa bisnis real-time",
      "Integrasi WhatsApp Bot & notifikasi otomatis",
      "Akses cloud cepat & aman dengan proteksi data",
      "Progressive Web App (PWA) siap diinstal di HP",
    ],
    price: "15 Juta",
  },
];

const process_steps = [
  {
    step: "01",
    title: "Konsultasi & Brief",
    desc: "Ceritakan kebutuhan spesifik dan target pembeli Anda. Kami bantu pilih ruang lingkup yang tepat tanpa membebani budget.",
    icon: MessageCircle,
  },
  {
    step: "02",
    title: "Desain & Prototyping",
    desc: "Penyusunan wireframe, pemilihan tipografi, tata letak konten, dan visual antarmuka disesuaikan dengan karakter brand Anda.",
    icon: Palette,
  },
  {
    step: "03",
    title: "Pengembangan & Uji",
    desc: "Koding bersih berkecepatan tinggi, integrasi WhatsApp, dan pengujian ketat di berbagai ukuran layar HP serta desktop.",
    icon: BarChart3,
  },
  {
    step: "04",
    title: "Peluncuran & Serah Terima",
    desc: "Domain aktif, SSL terpasang, pendaftaran Google Search Console selesai, dan akses dashboard diserahkan seutuhnya.",
    icon: Globe,
  },
];

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
    <div className="bg-white text-slate-900 selection:bg-slate-200">
      {/* ── Hero Header: Full Width Deep Slate ────────────────── */}
      <section className="relative w-full bg-[#1E242E] text-white pt-28 pb-16 sm:pt-32 sm:pb-24 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-radial-[at_top_right] from-slate-800/40 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Layanan" }]} />

          <div className="max-w-3xl mt-4">
            <FadeUp>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-slate-500" />
                <span className="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Katalog Layanan Digital & Website
                </span>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
                Website dan sistem digital yang siap menopang bisnis Anda.
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal mb-8">
                Pilih paket sesuai tahap pertumbuhan usaha Anda: mulai dari landing page untuk kampanye cepat, company profile untuk kredibilitas, toko online 24 jam, hingga sistem aplikasi custom.
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3.5">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-white px-7 text-slate-950 font-bold hover:bg-slate-100 shadow-sm text-sm"
                  >
                    Konsultasi Kebutuhan
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/kalkulasi-harga">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-slate-600 bg-transparent px-6 text-white hover:bg-slate-800 font-semibold text-sm"
                  >
                    Simulasi Estimasi Biaya
                  </Button>
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Services Grid ──────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-14 max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Pilihan Paket
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Solusi terukur dengan ruang lingkup yang jelas.
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed text-base">
              Setiap paket sudah mencakup domain .com, cloud hosting, sertifikat keamanan SSL, dan garansi revisi sampai sesuai brief awal.
            </p>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {services.slice(0, 4).map((service) => {
              const waText = `Halo MFWEB, saya tertarik dengan layanan ${service.title}. Boleh konsultasi lebih lanjut?`;
              return (
                <StaggerItem key={service.slug} className="h-full">
                  <HoverCard className="h-full">
                    <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 h-full flex flex-col shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-900">
                          <service.icon className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">
                            Mulai Dari
                          </span>
                          <span className="font-extrabold text-xl text-slate-900">
                            {service.price === "Konsultasi"
                              ? "Konsultasi"
                              : `Rp ${service.price}`}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
                          {service.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                          {service.desc}
                        </p>

                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/70 mb-6">
                          <p className="text-slate-400 text-[11px] uppercase tracking-wider font-bold mb-3">
                            Ruang Lingkup Fitur:
                          </p>
                          <ul className="space-y-2.5">
                            {service.features.map((f) => (
                              <li key={f} className="flex items-start gap-2.5">
                                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-900" />
                                <span className="text-slate-700 text-xs sm:text-sm leading-snug">
                                  {f}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
                        <a
                          href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button className="w-full h-11 font-bold text-xs rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xs">
                            Konsultasi via WA
                          </Button>
                        </a>
                        <Link href={`/layanan/${service.slug}`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full h-11 font-semibold text-xs rounded-full border-slate-200 text-slate-700 hover:bg-slate-100"
                          >
                            Detail Lengkap
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              );
            })}

            {/* Enterprise Service Card Spanning 2 Columns */}
            {services[4] &&
              (() => {
                const service = services[4];
                const waText = `Halo MFWEB, saya tertarik dengan layanan Enterprise: ${service.title}. Boleh atur waktu meeting?`;
                return (
                  <StaggerItem className="lg:col-span-2">
                    <HoverCard className="h-full">
                      <div className="relative rounded-3xl bg-[#1E242E] text-white p-8 sm:p-12 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col lg:flex-row gap-8 lg:gap-14 items-center">
                        <div className="absolute inset-0 bg-radial-[at_top_right] from-slate-800/40 via-transparent to-transparent pointer-events-none" />

                        <div className="flex-1 relative z-10">
                          <div className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-200 mb-5 shadow-xs">
                            <Zap className="w-3.5 h-3.5 text-amber-400" /> Sistem Custom
                          </div>
                          <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
                            {service.title}
                          </h3>
                          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-xl font-normal">
                            {service.desc}
                          </p>

                          <div className="bg-slate-800/80 border border-slate-700/80 px-5 py-3 rounded-2xl w-fit">
                            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold block mb-0.5">
                              Estimasi Investasi
                            </span>
                            <span className="font-black text-2xl text-white">
                              Rp {service.price}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 w-full relative z-10">
                          <div className="bg-slate-900/80 p-6 sm:p-7 rounded-2xl border border-slate-700/80 mb-6">
                            <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-4">
                              Spesifikasi Sistem:
                            </p>
                            <ul className="space-y-3">
                              {service.features.map((f) => (
                                <li key={f} className="flex items-start gap-3">
                                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="text-slate-200 text-xs sm:text-sm font-medium">
                                    {f}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <a
                              href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1"
                            >
                              <Button className="w-full h-12 font-bold text-xs rounded-full bg-white text-slate-950 hover:bg-slate-100 shadow-sm">
                                Jadwalkan Diskusi Teknis
                              </Button>
                            </a>
                            <Link href={`/layanan/${service.slug}`} className="flex-1">
                              <Button
                                variant="outline"
                                className="w-full h-12 font-semibold text-xs rounded-full border-slate-600 text-white hover:bg-slate-800"
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

      {/* ── Process Steps: Pure White ──────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16 max-w-2xl mx-auto">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Workflow Pengerjaan
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Transparan dari awal sampai rilis.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Alur pengerjaan terstruktur rapi agar Anda selalu mengetahui perkembangan proyek dan website siap dipakai tepat waktu.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process_steps.map((step, i) => (
              <FadeUp key={step.step} delay={i * 0.1}>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7 h-full flex flex-col shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-2xs">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      STEP {step.step}
                    </span>
                  </div>

                  <h3 className="text-slate-900 font-bold text-base mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guarantee & Quality Standards ─────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          <ScaleIn>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200 mb-6">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Standar Kualitas & Komitmen Kami
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto mb-10 text-sm sm:text-base leading-relaxed">
                Kami memastikan setiap baris kode dan elemen visual memberikan dampak nyata bagi kredibilitas serta konversi bisnis Anda.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <Clock className="w-5 h-5 text-slate-800 mb-3" />
                  <p className="text-slate-900 font-bold text-sm mb-1">Timeline Terjadwal</p>
                  <p className="text-slate-500 text-xs leading-relaxed">Jadwal pengerjaan disepakati di awal dengan target delivery yang pasti.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <Smartphone className="w-5 h-5 text-slate-800 mb-3" />
                  <p className="text-slate-900 font-bold text-sm mb-1">100% Mobile Ready</p>
                  <p className="text-slate-500 text-xs leading-relaxed">Tampilan nyaman dan responsif saat diakses dari HP, tablet, maupun laptop.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <Headphones className="w-5 h-5 text-slate-800 mb-3" />
                  <p className="text-slate-900 font-bold text-sm mb-1">Dukungan Teknis</p>
                  <p className="text-slate-500 text-xs leading-relaxed">Bantuan teknis dan panduan pengelolaan konten setelah website resmi live.</p>
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* ── Final CTA: Deep Slate Hero Block ──────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="relative rounded-3xl bg-[#1E242E] text-white p-8 sm:p-14 border border-slate-700/60 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-radial-[at_top_right] from-slate-800/40 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
                  Siap membangun aset website bisnis Anda?
                </h2>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                  Konsultasikan gambaran bisnis Anda bersama kami. Kami berikan rekomendasi solusi yang proporsional sesuai target pasar Anda.
                </p>

                <div className="flex flex-col sm:flex-row gap-3.5">
                  <Link href="/contact">
                    <Button
                      size="lg"
                      className="h-12 rounded-full bg-white px-7 text-slate-950 font-bold hover:bg-slate-100 shadow-sm text-sm"
                    >
                      Mulai Konsultasi Gratis
                      <ArrowRight className="ml-2 w-4 h-4" />
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
                      className="h-12 rounded-full border-slate-600 bg-transparent px-6 text-slate-200 hover:bg-slate-800 font-semibold text-sm"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <JsonLd id="json-ld-breadcrumb-layanan" data={breadcrumbJsonLd} />
      <JsonLd id="json-ld-service-layanan" data={serviceJsonLd} />
    </div>
  );
}
