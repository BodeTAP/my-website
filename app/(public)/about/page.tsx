import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Code,
  Headphones,
  Heart,
  Shield,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/public/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";

export const metadata: Metadata = {
  title: "Tentang MFWEB - Tim Website untuk Bisnis Lokal",
  description:
    "MFWEB membantu bisnis lokal menyiapkan website yang jelas, cepat diakses, mudah dikelola, dan siap dipakai untuk menerima calon pelanggan.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Tentang MFWEB - Tim Website untuk Bisnis Lokal",
    description:
      "Tim website yang membantu bisnis lokal punya halaman, sistem, dan dokumen digital yang rapi.",
  },
};

const values = [
  {
    icon: Target,
    title: "Mulai dari kebutuhan bisnis",
    desc: "Kami menanyakan cara calon pelanggan menemukan Anda, informasi apa yang perlu jelas, dan tindakan apa yang ingin diarahkan.",
  },
  {
    icon: Code,
    title: "Teknisnya rapi & efisien",
    desc: "Website dibuat cepat, responsif, aman, dan mudah dirawat. Bagian teknis tidak kami jadikan beban untuk klien.",
  },
  {
    icon: Heart,
    title: "Komunikasi sederhana",
    desc: "Progress, revisi, dan keputusan desain dijelaskan dengan bahasa yang mudah dipahami, bukan istilah teknis yang memusingkan.",
  },
  {
    icon: Headphones,
    title: "Dukungan berkelanjutan",
    desc: "Setelah website online, kami tetap membantu jika ada kendala teknis, perubahan kecil, atau pertanyaan penggunaan dashboard.",
  },
];

const stats = [
  { num: "50+", label: "Proyek selesai" },
  { num: "3-7 hari", label: "Rata-rata pengerjaan" },
  { num: "1 tahun", label: "Domain dan hosting awal" },
  { num: "WA", label: "Jalur support utama" },
];

const checks = [
  "Struktur halaman dibuat jelas untuk pengunjung baru",
  "CTA WhatsApp, formulir, atau tombol kontak dipasang sesuai kebutuhan",
  "SEO dasar, sitemap, dan metadata disiapkan sejak awal",
  "Tampilan dicek di HP, tablet, dan desktop sebelum live",
  "Dashboard admin disiapkan untuk konten yang perlu sering diganti",
  "Harga, timeline, dan revisi dibahas transparan di depan",
];

export default function AboutPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Beranda", item: SITE_URL },
    { name: "Tentang Kami", item: `${SITE_URL}/about` },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-about" data={breadcrumbJsonLd} />

      {/* ── Full-Width Deep Slate Hero ────────────────────── */}
      <section className="w-full bg-[#1E242E] text-white pt-28 pb-16 sm:pt-32 sm:pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Tentang Kami" }]} />

          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end mt-6">
            <FadeUp>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-slate-500" />
                <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                  Profil & Filosofi Studio
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Kami membantu bisnis lokal punya website yang bekerja jelas.
              </h1>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl">
                Bukan sekadar tampilan visual. Kami merapikan cara bisnis Anda diperkenalkan,
                dihubungi, ditemukan di Google, dan dikelola setelah website resmi diluncurkan.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button className="h-12 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 transition-colors">
                    Diskusi kebutuhan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button
                    variant="outline"
                    className="h-12 rounded-full border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white px-8 transition-colors"
                  >
                    Lihat hasil kerja
                  </Button>
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="rounded-2xl border border-slate-800 bg-[#161B22] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                    <Shield className="h-5 w-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-base">Yang kami rapikan untuk Anda</p>
                    <p className="text-xs text-slate-400">Dari halaman publik sampai dokumen kerja operasional.</p>
                  </div>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    "Profil & Kredibilitas Bisnis",
                    "Alur Konversi WhatsApp",
                    "SEO Fundamental & Indexing",
                    "Dashboard Pengelolaan",
                    "Katalog & Portofolio",
                    "Proposal & Invoice Bisnis",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-xs font-medium text-slate-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Perspective & Stats Section ───────────────────── */}
      <section className="py-20 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <FadeUp>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-6 bg-slate-400" />
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                  Prinsip Fundamental
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl leading-tight">
                Website yang baik harus mudah dipercaya, mudah dipakai, dan terukur.
              </h2>
              <div className="mt-6 space-y-4 text-base text-slate-600 leading-relaxed">
                <p>
                  Banyak bisnis sudah memiliki produk berkualitas tinggi, namun calon pelanggan masih ragu karena profil digitalnya tidak meyakinkan. Di titik itu, website bukan sekadar estetika, melainkan instrumen kepercayaan utama sebelum pelanggan memutuskan untuk bertransaksi.
                </p>
                <p>
                  Karena itu, kami fokus pada substansi: hierarki informasi yang runut, navigasi intuitif, performa cepat di perangkat mobile, dan integrasi operasional seperti generator invoice dan proposal yang mempercepat alur kerja bisnis Anda.
                </p>
              </div>
            </FadeUp>

            <StaggerChildren className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                    <div className="text-3xl font-bold text-slate-900">{stat.num}</div>
                    <div className="mt-1 text-xs font-mono uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ── Values Grid ───────────────────────────────────── */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="max-w-2xl mb-14">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-6 bg-slate-400" />
              <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                Standar Layanan
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Prinsip kerja yang selalu kami jaga
            </h2>
            <p className="mt-3 text-slate-600">
              Menjaga proses pengerjaan tetap transparan, terukur, dan bebas dari kebingungan teknis sejak hari pertama.
            </p>
          </FadeUp>

          <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    <value.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{value.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Deliverables Checklist ────────────────────────── */}
      <section className="py-20 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <FadeUp>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-6 bg-slate-400" />
                <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                  Transparansi Scope
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Apa yang bisa Anda harapkan?
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Kami lebih suka menjanjikan hal yang konkret dan dapat diverifikasi: struktur yang rapi, skor performa tinggi, kemudahan update konten, serta komunikasi yang lugas.
              </p>
            </FadeUp>

            <StaggerChildren className="grid gap-3.5 sm:grid-cols-2">
              {checks.map((check) => (
                <StaggerItem key={check}>
                  <div className="flex h-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" />
                    <span className="text-sm leading-relaxed text-slate-700 font-medium">{check}</span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </section>

      {/* ── Final CTA Block ───────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-8 sm:p-14 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-8 bg-slate-500" />
                <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                  Mulai Perjalanan Digital
                </span>
                <span className="h-px w-8 bg-slate-500" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Punya bisnis yang siap dirapikan online?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-300 text-base leading-relaxed">
                Ceritakan profil bisnis Anda sekarang, target audiens yang dituju, dan preferensi fungsional yang diinginkan. Tim kami akan menyiapkan skema solusi paling tepat.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/contact">
                  <Button className="h-12 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 transition-colors">
                    Mulai konsultasi gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/layanan">
                  <Button
                    variant="outline"
                    className="h-12 rounded-full border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white px-8 transition-colors"
                  >
                    Lihat semua layanan
                  </Button>
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
