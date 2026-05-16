import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowRight,
  CheckCircle,
  Code,
  Headphones,
  Heart,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

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
    title: "Teknisnya rapi",
    desc: "Website dibuat cepat, responsif, aman, dan mudah dirawat. Bagian teknis tidak kami jadikan beban untuk klien.",
  },
  {
    icon: Heart,
    title: "Komunikasi sederhana",
    desc: "Progress, revisi, dan keputusan desain dijelaskan dengan bahasa yang mudah dipahami, bukan istilah teknis yang memusingkan.",
  },
  {
    icon: Headphones,
    title: "Support setelah live",
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
  "Harga, timeline, dan revisi dibahas di depan",
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
    <div className="bg-[#020611]">
      <section className="px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <FadeUp>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#071225] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-200/70">
              <Users className="h-4 w-4 text-blue-300" />
              Tentang MFWEB
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Kami membantu bisnis lokal punya website yang bekerja jelas.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-blue-100/65">
              Bukan sekadar tampilan bagus. Kami merapikan cara bisnis Anda diperkenalkan,
              dihubungi, ditemukan di Google, dan dikelola setelah website live.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/contact">
                <Button size="lg" className="h-14 rounded-xl bg-blue-600 px-7 font-bold text-white hover:bg-blue-500">
                  Diskusi kebutuhan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button size="lg" variant="outline" className="h-14 rounded-xl border-white/10 bg-white/5 px-7 font-bold text-white hover:bg-white/10">
                  Lihat hasil kerja
                </Button>
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={0.12}>
            <div className="rounded-2xl border border-white/10 bg-[#071225] p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10">
                  <Shield className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="font-semibold text-white">Yang biasanya kami rapikan</p>
                  <p className="text-sm text-blue-200/50">Dari halaman publik sampai dokumen kerja.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Profil bisnis", "Alur kontak", "SEO dasar", "Dashboard konten", "Lead tools", "Proposal dan invoice"].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-blue-100/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#071225] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <FadeUp>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#020611] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-200/60">
              Cara kami melihat proyek
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Website yang baik harus mudah dipercaya, mudah dipakai, dan mudah dilanjutkan.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-blue-100/65">
              <p>
                Banyak bisnis sudah punya produk bagus, tetapi calon pelanggan masih ragu karena informasi online-nya kurang jelas. Di titik itu, website bukan hiasan. Website menjadi tempat orang mengecek kredibilitas sebelum menghubungi.
              </p>
              <p>
                Karena itu kami tidak hanya mengejar visual. Kami membantu menyusun struktur halaman, CTA, konten dasar, performa, dan alat pendukung seperti lead finder, proposal, serta invoice agar alur kerja bisnis lebih rapi.
              </p>
            </div>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="rounded-2xl border border-white/10 bg-[#020611] p-5">
                  <div className="text-2xl font-black text-white sm:text-3xl">{stat.num}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-blue-200/45">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeUp className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Prinsip kerja yang kami jaga
            </h2>
            <p className="mt-4 text-blue-100/60">
              Ini yang membuat proyek terasa lebih tertata dari brief awal sampai website benar-benar digunakan.
            </p>
          </FadeUp>

          <StaggerChildren className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="h-full rounded-2xl border border-white/10 bg-[#071225] p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10">
                    <value.icon className="h-5 w-5 text-blue-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-blue-100/60">{value.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#06111f] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <FadeUp>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Apa yang bisa Anda harapkan?
            </h2>
            <p className="mt-5 text-blue-100/60">
              Kami lebih suka menjanjikan hal yang bisa dicek: struktur, performa, akses admin, dan komunikasi yang jelas.
            </p>
          </FadeUp>

          <StaggerChildren className="grid gap-3 sm:grid-cols-2">
            {checks.map((check) => (
              <StaggerItem key={check}>
                <div className="flex h-full gap-3 rounded-xl border border-white/10 bg-[#020611] p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <span className="text-sm leading-relaxed text-blue-100/70">{check}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#071225] p-8 text-center sm:p-12">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Punya bisnis yang perlu dirapikan online?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-blue-100/60">
            Ceritakan kondisi sekarang, target pelanggan, dan referensi yang Anda suka. Kami bantu susun langkah paling masuk akal.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/contact">
              <Button size="lg" className="h-14 rounded-xl bg-blue-600 px-8 font-bold text-white hover:bg-blue-500">
                Mulai konsultasi
              </Button>
            </Link>
            <Link href="/layanan">
              <Button size="lg" variant="outline" className="h-14 rounded-xl border-white/10 bg-white/5 px-8 font-bold text-white hover:bg-white/10">
                Lihat layanan
              </Button>
            </Link>
          </div>
        </FadeUp>
      </section>

      <Script
        id="json-ld-breadcrumb-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}
