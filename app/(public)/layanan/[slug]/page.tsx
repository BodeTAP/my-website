import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight, CheckCircle, Clock, Smartphone, ArrowLeft,
  Megaphone, Building2, ShoppingCart, Search, Star,
  Zap, Shield, Globe, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem, HoverCard, ScaleIn } from "@/components/public/motion";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";
const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343";

type ServiceData = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  heroTitle: string;
  heroSubtitle: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  price: string;
  priceNote: string;
  description: string;
  features: { title: string; desc: string }[];
  forWhom: string[];
  deliverables: string[];
  faqs: { q: string; a: string }[];
  stats: { num: string; label: string }[];
};

const services: Record<string, ServiceData> = {
  "landing-page": {
    slug: "landing-page",
    title: "Landing Page",
    metaTitle: "Jasa Pembuatan Landing Page Profesional | Mulai Rp 800K — MFWEB",
    metaDesc: "Jasa pembuatan landing page yang mengkonversi pengunjung menjadi pelanggan. Desain persuasif, cepat, mobile-friendly. Mulai Rp 800K termasuk domain & hosting.",
    heroTitle: "Landing Page yang Mengubah Pengunjung Menjadi Pelanggan",
    heroSubtitle: "Satu halaman yang dirancang khusus untuk satu tujuan: mengubah trafik iklan menjadi leads dan penjualan nyata.",
    badge: "Mulai Rp 800K",
    icon: Megaphone,
    color: "blue",
    price: "Rp 800.000",
    priceNote: "Termasuk domain .com (1 tahun) & hosting gratis",
    description: "Landing page adalah senjata paling efektif untuk kampanye iklan digital. Dirancang dengan satu fokus: konversi. Setiap elemen — dari headline, gambar, sampai tombol CTA — dioptimasi untuk mendorong pengunjung mengambil tindakan.",
    features: [
      { title: "Desain 1 Halaman Full-Optimized", desc: "Layout persuasif yang mengalirkan perhatian pembaca dari atas ke tombol CTA tanpa distraksi." },
      { title: "Copywriting yang Menjual", desc: "Teks halaman dibuat dengan prinsip copywriting: benefit-focused, mengatasi keberatan, dan mendorong urgensi." },
      { title: "Integrasi WhatsApp & Form", desc: "CTA langsung terhubung ke WhatsApp atau form lead capture. Setiap klik langsung masuk ke inbox Anda." },
      { title: "Loading Super Cepat", desc: "Dioptimasi agar load di bawah 2 detik. Halaman yang lambat kehilangan 50%+ pengunjung sebelum terbaca." },
      { title: "Mobile-First Design", desc: "70%+ trafik iklan dari HP. Tampilan halaman dioptimasi untuk layar kecil terlebih dahulu." },
      { title: "Integrasi Google Maps & Pixel", desc: "Sambungkan Google Analytics, Facebook Pixel, dan Maps untuk tracking performa iklan Anda." },
    ],
    forWhom: [
      "Pelaku UMKM yang sedang menjalankan iklan Google/Meta",
      "Bisnis yang ingin launch produk atau promo baru",
      "Jasa dan layanan yang ingin dapat leads dari internet",
      "Yang sudah punya website tapi konversinya rendah",
    ],
    deliverables: [
      "File desain (Figma/Adobe XD)",
      "Kode website siap deploy",
      "Domain .com aktif (1 tahun)",
      "Hosting gratis (1 tahun)",
      "SSL certificate (HTTPS)",
      "Panduan singkat pengelolaan",
    ],
    faqs: [
      { q: "Berapa lama proses pengerjaan landing page?", a: "Rata-rata 2–3 hari kerja. Proses dimulai setelah Anda mengirimkan materi (foto, logo, teks produk/jasa). Jika materi lengkap sejak hari pertama, bisa selesai lebih cepat." },
      { q: "Apakah bisa tambah halaman setelah jadi?", a: "Landing page dirancang khusus 1 halaman untuk fokus konversi. Jika butuh halaman lebih, kami rekomendasikan paket Company Profile." },
      { q: "Apakah termasuk pembuatan konten/copywriting?", a: "Ya, kami bantu menyusun copywriting dasar berdasarkan informasi bisnis yang Anda berikan. Foto dan materi utama dari Anda." },
      { q: "Bagaimana cara connect dengan iklan Facebook/Google?", a: "Setelah website selesai, kami bantu instalasi Facebook Pixel dan Google Analytics Tag sehingga iklan Anda bisa tracking konversi dengan tepat." },
      { q: "Apakah ada garansi kalau tidak puas?", a: "Ada revisi sampai Anda puas dalam periode pengerjaan. Kami tidak tutup proyek sebelum Anda approve hasil akhirnya." },
    ],
    stats: [
      { num: "2-3", label: "Hari selesai" },
      { num: "1", label: "Revisi gratis" },
      { num: "<2s", label: "Load time" },
    ],
  },

  "company-profile": {
    slug: "company-profile",
    title: "Company Profile",
    metaTitle: "Jasa Pembuatan Website Company Profile Profesional | MFWEB",
    metaDesc: "Website company profile profesional untuk bisnis lokal Indonesia. Desain custom, SEO-friendly, dashboard admin. Mulai Rp 1,5 juta termasuk domain & hosting.",
    heroTitle: "Website Company Profile yang Membangun Kepercayaan Pelanggan",
    heroSubtitle: "Tampilkan bisnis Anda secara profesional di internet. Lebih dari sekadar Google Maps — website adalah aset digital yang bekerja 24 jam untuk Anda.",
    badge: "Mulai Rp 1,5 Juta",
    icon: Building2,
    color: "indigo",
    price: "Rp 1.500.000 – 3.500.000",
    priceNote: "Tergantung paket Simple (3-4 hal) atau Pro (5-7 hal)",
    description: "Company profile website adalah representasi digital bisnis Anda yang lengkap. Menampilkan profil, layanan, portofolio, testimoni, dan cara menghubungi — semua dalam satu tempat yang mudah diakses kapan saja.",
    features: [
      { title: "3–7 Halaman Lengkap", desc: "Beranda, Tentang Kami, Layanan/Produk, Portofolio, Blog, Kontak. Setiap halaman dirancang untuk konversi." },
      { title: "Desain Custom & Modern", desc: "Desain dibuat sesuai karakter brand Anda — bukan template cookie-cutter yang sama dengan ribuan website lain." },
      { title: "SEO Dasar untuk Google", desc: "Struktur halaman, meta tag, sitemap, dan schema markup dipasang agar Google mudah menemukan dan mengindeks website Anda." },
      { title: "Email Bisnis Profesional", desc: "Dapatkan email @namabisnis.com (mis. info@tokosaya.com) yang meningkatkan kredibilitas saat berkomunikasi dengan pelanggan." },
      { title: "Dashboard Admin", desc: "Kelola konten website sendiri — ganti foto, teks, dan informasi tanpa harus tahu coding." },
      { title: "Integrasi Maps & WhatsApp", desc: "Google Maps untuk arah, tombol WhatsApp untuk kontak instan — dua fitur yang paling banyak dicari pelanggan." },
    ],
    forWhom: [
      "Bisnis retail, restoran, atau jasa lokal yang ingin tampil profesional",
      "Klinik, salon, bengkel, atau usaha yang ingin dapat pelanggan dari Google",
      "UMKM yang mau naik kelas dari sekadar profil WhatsApp atau Instagram",
      "Startup atau freelancer yang butuh portofolio online",
    ],
    deliverables: [
      "3-7 halaman website siap pakai",
      "Domain .com (1 tahun)",
      "Hosting & SSL gratis (1 tahun)",
      "Email bisnis 1–5 akun",
      "Dashboard admin untuk kelola konten",
      "Panduan penggunaan & training",
    ],
    faqs: [
      { q: "Apa bedanya paket Simple dan Pro?", a: "Paket Simple (Rp 1,5 juta): 3-4 halaman dengan desain standar profesional. Paket Pro (Rp 3,5 juta): 5-7 halaman, desain custom penuh, lebih banyak akun email bisnis, dan fitur tambahan seperti multi bahasa." },
      { q: "Berapa lama proses pengerjaannya?", a: "Paket Simple: 3–5 hari kerja. Paket Pro: 5–7 hari kerja. Estimasi dimulai setelah semua materi (foto, logo, teks) Anda kirimkan." },
      { q: "Apakah saya bisa update konten sendiri setelah jadi?", a: "Ya. Setiap website company profile dilengkapi dashboard admin yang sederhana. Anda bisa ganti foto, teks, harga, dan informasi kontak tanpa bantuan developer." },
      { q: "Apakah website akan muncul di Google?", a: "Kami pasang SEO dasar: sitemap, meta tag, dan schema markup. Untuk muncul di halaman pertama Google, butuh strategi konten dan SEO lanjutan yang kami tawarkan terpisah." },
      { q: "Apakah bisa tambah fitur seperti booking atau form khusus?", a: "Bisa, dengan biaya tambahan tergantung kompleksitas. Diskusikan kebutuhan spesifik Anda saat konsultasi awal." },
    ],
    stats: [
      { num: "3-7", label: "Hari selesai" },
      { num: "3-7", label: "Halaman" },
      { num: "24/7", label: "Online terus" },
    ],
  },

  "toko-online": {
    slug: "toko-online",
    title: "Toko Online",
    metaTitle: "Jasa Pembuatan Toko Online / E-Commerce Profesional | MFWEB",
    metaDesc: "Jasa pembuatan toko online lengkap dengan sistem pembayaran, manajemen produk, dan dashboard admin. Mulai Rp 5,4 juta. Siap berjualan 24 jam online.",
    heroTitle: "Toko Online Siap Berjualan 24 Jam, 7 Hari Seminggu",
    heroSubtitle: "Buka pintu bisnis Anda ke seluruh Indonesia — bahkan dunia. Toko online yang kami bangun bukan sekadar tampil cantik, tapi juga mudah dikelola dan menghasilkan penjualan nyata.",
    badge: "Rp 5,4 Juta",
    icon: ShoppingCart,
    color: "teal",
    price: "Rp 5.400.000",
    priceNote: "Termasuk domain, hosting 1 tahun, dan setup integrasi pembayaran",
    description: "Toko online yang benar bukan hanya tempat memajang produk — ini adalah sistem penjualan otomatis yang menerima pesanan, memproses pembayaran, dan mengelola stok bahkan saat Anda tidur. Kami bangun dengan teknologi yang scalable untuk pertumbuhan bisnis jangka panjang.",
    features: [
      { title: "Unlimited Halaman Produk", desc: "Tampilkan ribuan produk dengan filter kategori, pencarian, dan sorting. Tidak ada batasan jumlah produk." },
      { title: "Integrasi Metode Pembayaran", desc: "Transfer bank, QRIS, e-wallet (GoPay, OVO, ShopeePay), Alfamart/Indomaret, dan kartu kredit — semua dalam satu platform." },
      { title: "Manajemen Pesanan & Stok", desc: "Dashboard lengkap untuk kelola pesanan masuk, update status pengiriman, dan pantau stok produk secara real-time." },
      { title: "Multi Bahasa & Mata Uang", desc: "Siap melayani pelanggan lokal maupun internasional dengan dukungan bahasa dan mata uang berganda." },
      { title: "Notifikasi Otomatis", desc: "Pelanggan dan penjual mendapat notifikasi email & WhatsApp otomatis untuk setiap pesanan, pembayaran, dan pengiriman." },
      { title: "Dashboard Admin Lengkap", desc: "Laporan penjualan, grafik pendapatan, produk terlaris, dan manajemen pelanggan dalam satu tempat." },
    ],
    forWhom: [
      "UMKM yang mau jualan online tanpa tergantung marketplace (Shopee/Tokopedia)",
      "Bisnis yang mau punya toko sendiri dan tidak bayar komisi ke marketplace",
      "Brand yang butuh kontrol penuh atas pengalaman belanja pelanggan",
      "Bisnis dengan banyak produk yang butuh sistem manajemen yang rapi",
    ],
    deliverables: [
      "Website toko online full-featured",
      "Domain .com (1 tahun)",
      "Hosting & SSL (1 tahun)",
      "5 akun email bisnis",
      "Setup integrasi payment gateway",
      "Input produk awal (hingga 20 produk)",
      "Training manajemen toko",
    ],
    faqs: [
      { q: "Apakah sudah termasuk payment gateway?", a: "Ya, kami setup koneksi ke payment gateway pilihan (Midtrans/Xendit). Biaya transaksi payment gateway dikenakan oleh penyedia (biasanya 1-3% per transaksi), bukan oleh MFWEB." },
      { q: "Berapa lama proses pengerjaan toko online?", a: "7–14 hari kerja tergantung jumlah produk dan kompleksitas fitur yang diminta. Setelah materi produk lengkap diterima." },
      { q: "Apakah bisa impor produk dari Shopee/Tokopedia?", a: "Bisa dengan tools khusus untuk produk yang sudah ada. Kami bantu proses migrasi data produk dari platform lama." },
      { q: "Apakah ada biaya bulanan setelah website jadi?", a: "Hosting dan domain perlu diperpanjang tahunan (sekitar Rp 600–800 ribu/tahun). Payment gateway punya biaya transaksi per pesanan, tidak ada biaya bulanan tetap ke MFWEB." },
      { q: "Bagaimana cara mengelola pesanan dan pengiriman?", a: "Kami sediakan dashboard admin yang intuitif. Setiap pesanan masuk muncul di dashboard, Anda bisa update status pengiriman, cetak label, dan cek riwayat penjualan dengan mudah." },
    ],
    stats: [
      { num: "7-14", label: "Hari selesai" },
      { num: "∞", label: "Jumlah produk" },
      { num: "10+", label: "Metode bayar" },
    ],
  },

  "optimasi-seo": {
    slug: "optimasi-seo",
    title: "Optimasi SEO",
    metaTitle: "Jasa Optimasi SEO Website Bisnis Lokal Indonesia | MFWEB",
    metaDesc: "Layanan optimasi SEO untuk bisnis lokal Indonesia. Audit SEO, optimasi keyword lokal, structured data, dan konten SEO-friendly. Hubungi untuk konsultasi gratis.",
    heroTitle: "Muncul di Halaman Pertama Google, Tanpa Iklan Berbayar",
    heroSubtitle: "SEO yang benar adalah investasi jangka panjang — satu kali optimasi yang terus menghasilkan pengunjung organik gratis selama bertahun-tahun.",
    badge: "Konsultasi Gratis",
    icon: Search,
    color: "purple",
    price: "Mulai Rp 1.500.000",
    priceNote: "Tergantung scope pekerjaan — hubungi untuk proposal",
    description: "SEO (Search Engine Optimization) adalah proses mengoptimasi website agar muncul di posisi teratas Google saat calon pelanggan mencari bisnis seperti Anda. Berbeda dengan iklan yang berhenti saat budget habis, trafik dari SEO bersifat organik dan berkelanjutan.",
    features: [
      { title: "Audit SEO Menyeluruh", desc: "Analisa teknis website: kecepatan, mobile-friendliness, struktur URL, broken links, dan semua faktor yang mempengaruhi ranking." },
      { title: "Riset Keyword Lokal", desc: "Temukan kata kunci yang benar-benar dicari calon pelanggan Anda di Google — bukan asumsi. Fokus pada keyword dengan intent beli tinggi." },
      { title: "Optimasi On-Page", desc: "Optimasi title tag, meta description, heading struktur, internal linking, dan schema markup di setiap halaman website." },
      { title: "Structured Data (JSON-LD)", desc: "Pasang schema markup agar Google bisa menampilkan rich snippet — bintang rating, harga, FAQ — di hasil pencarian." },
      { title: "Konten SEO-Friendly", desc: "Buat atau optimalkan artikel blog yang menjawab pertanyaan calon pelanggan dan membangun otoritas website di Google." },
      { title: "Laporan Ranking Bulanan", desc: "Laporan transparan setiap bulan: posisi keyword, traffic organik, dan analisa perkembangan yang bisa Anda monitor sendiri." },
    ],
    forWhom: [
      "Bisnis yang mau dapat pelanggan dari Google tanpa bayar iklan terus-menerus",
      "Website yang sudah ada tapi tidak muncul di halaman pertama Google",
      "Bisnis lokal yang ingin dominasi pencarian di kota/area tertentu",
      "UMKM yang mau bersaing dengan bisnis besar di Google",
    ],
    deliverables: [
      "Laporan audit SEO lengkap",
      "Daftar target keyword prioritas",
      "Optimasi on-page semua halaman",
      "Setup Google Search Console & Analytics",
      "Instalasi structured data",
      "Laporan perkembangan bulanan",
    ],
    faqs: [
      { q: "Berapa lama sampai muncul di Google?", a: "SEO butuh waktu — biasanya hasil mulai terlihat dalam 2–4 bulan. Untuk keyword lokal yang kurang kompetitif bisa lebih cepat. SEO adalah marathon, bukan sprint." },
      { q: "Apakah SEO menjamin posisi #1?", a: "Tidak ada yang bisa menjamin posisi #1 — siapapun yang berjanji seperti itu perlu diwaspadai. Yang kami jaminkan adalah peningkatan performa website secara teknis dan konten yang sesuai best practices Google." },
      { q: "Apa bedanya SEO dengan Google Ads?", a: "Google Ads adalah iklan berbayar — Anda bayar per klik, dan berhenti saat budget habis. SEO mengoptimasi website agar muncul di hasil organik (bukan iklan) — tidak ada biaya per klik, dan hasilnya berkelanjutan." },
      { q: "Apakah SEO perlu dilakukan terus-menerus?", a: "Idealnya ya — SEO adalah ongoing process. Setelah optimasi awal, perlu monitoring rutin dan update konten untuk mempertahankan dan meningkatkan posisi. Kami tawarkan paket maintenance SEO bulanan." },
      { q: "Apakah bisa untuk website yang sudah lama?", a: "Justru website yang sudah ada lebih mudah dioptimasi karena sudah punya history di Google. Kami lakukan audit mendalam dan identifikasi area yang paling berdampak untuk diperbaiki pertama." },
    ],
    stats: [
      { num: "2-4", label: "Bulan hasil awal" },
      { num: "0", label: "Biaya per klik" },
      { num: "∞", label: "Trafik organik" },
    ],
  },
};

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug];
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDesc,
    alternates: { canonical: `/layanan/${slug}` },
    openGraph: { title: service.metaTitle, description: service.metaDesc },
  };
}

export function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}

const colorMap: Record<string, { bg: string; text: string; border: string; pill: string }> = {
  blue:   { bg: "bg-blue-600/15",   text: "text-blue-400",   border: "border-blue-500/30",   pill: "bg-blue-600" },
  indigo: { bg: "bg-indigo-600/15", text: "text-indigo-400", border: "border-indigo-500/30", pill: "bg-indigo-600" },
  teal:   { bg: "bg-teal-600/15",   text: "text-teal-400",   border: "border-teal-500/30",   pill: "bg-teal-600" },
  purple: { bg: "bg-purple-600/15", text: "text-purple-400", border: "border-purple-500/30", pill: "bg-purple-600" },
};

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params;
  const service = services[slug];
  if (!service) notFound();

  const c = colorMap[service.color];
  const waText = `Halo MFWEB, saya tertarik dengan layanan ${service.title}. Boleh konsultasi lebih lanjut?`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Layanan", item: `${SITE_URL}/layanan` },
          { "@type": "ListItem", position: 3, name: service.title, item: `${SITE_URL}/layanan/${slug}` },
        ],
      },
      {
        "@type": "Service",
        name: service.title,
        description: service.metaDesc,
        provider: { "@type": "Organization", name: "MFWEB", url: SITE_URL },
        areaServed: { "@type": "Country", name: "Indonesia" },
        url: `${SITE_URL}/layanan/${slug}`,
      },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

        <div className="max-w-4xl mx-auto relative">
          {/* Breadcrumb */}
          <FadeUp>
            <div className="flex items-center gap-2 text-blue-200/40 text-sm mb-8">
              <Link href="/layanan" className="hover:text-blue-300 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Semua Layanan
              </Link>
              <span>/</span>
              <span className="text-blue-200/60">{service.title}</span>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeUp>
                <div className={`inline-flex items-center gap-2 ${c.pill}/20 border ${c.border} px-4 py-1.5 rounded-full text-sm ${c.text} mb-6`}>
                  <service.icon className="w-4 h-4" />
                  {service.badge}
                </div>
              </FadeUp>
              <FadeUp delay={0.1}>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                  {service.heroTitle}
                </h1>
              </FadeUp>
              <FadeUp delay={0.2}>
                <p className="text-blue-100/70 text-lg leading-relaxed mb-8">{service.heroSubtitle}</p>
              </FadeUp>
              <FadeUp delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="btn-shine bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 shadow-lg shadow-blue-500/25 w-full sm:w-auto">
                      Konsultasi Gratis <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 px-8 w-full sm:w-auto">
                      Kirim Brief
                    </Button>
                  </Link>
                </div>
              </FadeUp>
            </div>

            {/* Stats card */}
            <FadeUp delay={0.2}>
              <div className="glass rounded-2xl p-7 border border-white/5">
                <p className="text-blue-200/40 text-xs mb-1">Harga mulai dari</p>
                <p className={`text-3xl font-bold ${c.text} mb-1`}>{service.price}</p>
                <p className="text-blue-200/40 text-xs mb-6">{service.priceNote}</p>

                <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/5">
                  {service.stats.map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-xl font-bold text-white">{s.num}</p>
                      <p className="text-blue-200/40 text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              Apa yang Termasuk dalam <span className="text-gradient">Layanan Ini</span>
            </h2>
            <p className="text-blue-200/60 max-w-lg mx-auto">{service.description}</p>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {service.features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="glass rounded-2xl p-6 hover:border-blue-500/20 transition-colors h-full">
                  <CheckCircle className={`w-5 h-5 ${c.text} mb-3`} />
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-blue-200/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── For Whom + Deliverables ───────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeUp>
            <div className="glass rounded-2xl p-7 h-full">
              <h3 className="text-white font-bold text-lg mb-5">Layanan ini cocok untuk...</h3>
              <ul className="space-y-3">
                {service.forWhom.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Star className={`w-4 h-4 ${c.text} shrink-0 mt-0.5`} />
                    <span className="text-blue-200/70 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="glass rounded-2xl p-7 h-full">
              <h3 className="text-white font-bold text-lg mb-5">Yang Anda Dapatkan</h3>
              <ul className="space-y-3">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-blue-200/70 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeUp className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Pertanyaan Seputar <span className="text-gradient">{service.title}</span>
            </h2>
          </FadeUp>
          <div className="space-y-3">
            {service.faqs.map((faq, i) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ScaleIn>
            <div className="glass rounded-3xl p-10 sm:p-12 text-center glow-blue relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-transparent pointer-events-none" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Siap Mulai Layanan <span className="text-gradient">{service.title}?</span>
                </h2>
                <p className="text-blue-200/60 mb-8 max-w-lg mx-auto">
                  Konsultasi gratis, tanpa biaya, tanpa komitmen. Ceritakan kebutuhan Anda dan kami berikan solusi terbaik.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <a href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="btn-shine bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 shadow-lg shadow-blue-500/25">
                      💬 WhatsApp Sekarang
                    </Button>
                  </a>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 px-8">
                      Kirim Brief via Form
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-5 mt-8">
                  {[
                    { icon: Clock, label: "Respon < 1 jam" },
                    { icon: Shield, label: "Tanpa komitmen" },
                    { icon: Zap, label: "Estimasi gratis" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-blue-200/40 text-sm">
                      <item.icon className="w-4 h-4 text-blue-400" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* Other services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="mb-8">
            <h3 className="text-white font-semibold text-lg">Layanan Lainnya</h3>
          </FadeUp>
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(services).filter((s) => s.slug !== slug).map((s) => {
              const sc = colorMap[s.color];
              return (
                <StaggerItem key={s.slug}>
                  <Link href={`/layanan/${s.slug}`}>
                    <div className="glass rounded-xl p-4 hover:border-blue-500/20 transition-colors group text-center">
                      <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <s.icon className={`w-5 h-5 ${sc.text}`} />
                      </div>
                      <p className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">{s.title}</p>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>
    </div>
  );
}

// Simple inline FAQ accordion (no client import needed — server component)
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  return (
    <details className="glass rounded-2xl overflow-hidden group" style={{ animationDelay: `${index * 60}ms` }}>
      <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none hover:bg-white/3 transition-colors">
        <span className="text-white font-medium text-sm sm:text-base leading-snug">{q}</span>
        <span className="shrink-0 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-blue-400 text-lg font-light group-open:rotate-45 transition-transform duration-200">+</span>
      </summary>
      <div className="px-6 pb-5 border-t border-white/5">
        <p className="text-blue-200/70 text-sm leading-relaxed pt-4">{a}</p>
      </div>
    </details>
  );
}
