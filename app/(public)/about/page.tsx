import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, CheckCircle, Users, Zap, Shield, Heart, Code, Headphones, Sparkles, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem, ScaleIn, HoverCard } from "@/components/public/motion";

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
    desc: "Kami menghargai waktu Anda. Proyek diselesaikan sesuai deadline yang disepakati, tanpa drama maupun penundaan.",
  },
  {
    icon: Shield,
    title: "Kualitas Tanpa Kompromi",
    desc: "Setiap website dibangun dengan standar kode tertinggi — super cepat, aman, mobile-friendly, dan SEO-ready.",
  },
  {
    icon: Heart,
    title: "Klien adalah Mitra",
    desc: "Kami tidak sekadar membuat website lalu pergi. Kami mendampingi bisnis Anda tumbuh di era digital jangka panjang.",
  },
  {
    icon: Headphones,
    title: "Support Penuh Dedikasi",
    desc: "Ada kendala teknis? Tim support kami selalu siaga via WhatsApp untuk membantu menyelesaikan masalah Anda.",
  },
];

const stats = [
  { num: "50+", label: "Proyek Selesai" },
  { num: "95%", label: "Klien Sangat Puas" },
  { num: "3 Hari", label: "Rata-rata Delivery" },
  { num: "24/7", label: "Support Aktif" },
];

const reasons = [
  "Website dibangun custom murni, bukan template generik",
  "Sudah termasuk bundling domain .com + hosting SSD + SSL",
  "Dioptimasi algoritma SEO agar mendominasi Google",
  "Loading super cepat (Skor metrik 90+ di PageSpeed Insights)",
  "Responsif dan mulus sempurna di semua ukuran layar",
  "Dashboard admin mandiri untuk update konten tanpa coding",
  "Sistem revisi yang adil sampai Anda benar-benar puas",
  "Harga transparan di awal, nol biaya tersembunyi",
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
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/20 to-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeUp delay={0}>
            <div className="inline-flex items-center gap-2 glass px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-blue-300 mb-8 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-blue-500/5">
              <Users className="w-4 h-4 text-blue-400" />
              Tentang MFWEB
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
              Katalisator Digital <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Bisnis Lokal</span> Indonesia
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-blue-200/70 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Kami memadukan estetika desain kelas dunia dengan performa kode tingkat tinggi untuk melahirkan website yang <strong className="text-white">memukau secara visual dan menghasilkan secara finansial</strong>.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-blue-400 mb-6">
                  <Target className="w-4 h-4" /> Visi & Misi
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                  Mengapa Kami <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Ada?</span>
                </h2>
                <div className="space-y-6 text-blue-200/70 text-lg leading-relaxed">
                  <p>
                    Mayoritas bisnis lokal di Indonesia memiliki potensi produk yang luar biasa, namun masih tertinggal karena <strong className="text-white">jejak digital yang kurang meyakinkan</strong>.
                  </p>
                  <p>
                    Berangkat dari kegelisahan tersebut, tim engineer dan desainer kami mendirikan MFWEB. Misi kami sederhana: menjadi jembatan terkuat bagi UMKM dan perusahaan lokal untuk <strong className="text-white">mendominasi pasar online</strong>.
                  </p>
                  <p>
                    Kami percaya bahwa setiap website bukanlah sekadar halaman brosur mati. Ia adalah <strong className="text-white">karyawan digital Anda yang bekerja 24 jam sehari, 7 hari seminggu</strong> untuk mendatangkan prospek berkualitas tiada henti.
                  </p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="glass rounded-[40px] p-8 sm:p-10 border border-blue-500/20 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)] bg-[#040d1a]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 grid grid-cols-2 gap-6">
                  {stats.map((s, i) => (
                    <div key={s.label} className="bg-black/40 backdrop-blur-md rounded-3xl p-6 text-center border border-white/5 hover:border-blue-500/30 transition-colors group">
                      <div className="text-4xl sm:text-5xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors tracking-tight">{s.num}</div>
                      <div className="text-blue-200/50 text-[11px] font-bold uppercase tracking-widest">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
              Prinsip <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Fundamental</span>
            </h2>
            <p className="text-blue-200/60 max-w-2xl mx-auto text-lg leading-relaxed">
              Empat pilar utama yang mendasari setiap baris kode yang kami ketik dan setiap piksel desain yang kami rancang.
            </p>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <StaggerItem key={v.title}>
                <HoverCard className="h-full">
                  <div className="glass rounded-3xl p-8 hover:border-blue-500/40 transition-colors duration-500 group h-full relative overflow-hidden bg-black/20">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                    
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] relative z-10">
                      <v.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-3 relative z-10">{v.title}</h3>
                    <p className="text-blue-200/60 text-sm leading-relaxed relative z-10">{v.desc}</p>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <FadeUp delay={0.15} className="order-2 lg:order-1">
              <div className="glass rounded-[40px] p-8 sm:p-12 border border-indigo-500/20 relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.05)] bg-[#050b14]">
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                      <Code className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-black text-2xl tracking-tight">Tech Stack Modern</p>
                      <p className="text-indigo-300/70 text-sm font-medium mt-1">Standar industri global</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/50 backdrop-blur-xl p-6 rounded-3xl border border-white/5 mb-2">
                    <div className="flex flex-wrap gap-3">
                      {["Next.js", "React 18", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma ORM", "Framer Motion", "Vercel Edge"].map((t) => (
                        <span key={t} className="text-sm font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-4 py-2 rounded-xl shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-purple-400 mb-6">
                <Rocket className="w-4 h-4" /> Keunggulan Kompetitif
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                Standar Kami <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Berbeda</span>
              </h2>
              <p className="text-blue-200/60 mb-10 text-lg leading-relaxed">
                Kami tidak pernah menggunakan jalan pintas. Setiap baris kode dirancang khusus untuk memenangkan kompetisi di industri spesifik Anda.
              </p>
              <ul className="space-y-5">
                {reasons.map((r) => (
                  <li key={r} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="text-blue-50/80 text-base font-medium">{r}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>

          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScaleIn>
            <div className="glass rounded-[40px] p-10 sm:p-16 border border-white/5 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.05)] bg-[#030914]/80">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
              
              <FadeUp className="relative">
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                  Siap Berkolaborasi Bersama <span className="text-gradient">Kami?</span>
                </h2>
              </FadeUp>
              <FadeUp delay={0.1} className="relative">
                <p className="text-blue-200/60 mb-12 text-lg max-w-2xl mx-auto leading-relaxed">
                  Tidak perlu ragu. Ceritakan visi bisnis Anda kepada kami, dan mari kita rancang strategi untuk mewujudkannya di ranah digital.
                </p>
              </FadeUp>
              <FadeUp delay={0.2} className="relative">
                <div className="flex flex-col sm:flex-row justify-center gap-5">
                  <Link href="/contact">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-10 h-14 text-base font-bold shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all rounded-xl group">
                      Jadwalkan Konsultasi <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/layanan">
                    <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-14 px-10 text-base font-bold rounded-xl glass hover:border-white/20 transition-all">
                      Eksplorasi Layanan
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
