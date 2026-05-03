import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Smartphone,
  Megaphone,
  Building2,
  ShoppingCart,
  Search,
  Star,
  Zap,
  Shield,
  Globe,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FadeUp,
  StaggerChildren,
  StaggerItem,
  HoverCard,
  ScaleIn,
} from "@/components/public/motion";
import Breadcrumb from "@/components/public/Breadcrumb";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";
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
    metaTitle:
      "Jasa Pembuatan Landing Page Profesional | Mulai Rp 800K — MFWEB",
    metaDesc:
      "Jasa pembuatan landing page yang mengkonversi pengunjung menjadi pelanggan. Desain persuasif, cepat, mobile-friendly. Mulai Rp 800K termasuk domain & hosting.",
    heroTitle: "Landing Page yang Mengubah Pengunjung Menjadi Pelanggan",
    heroSubtitle:
      "Satu halaman yang dirancang khusus untuk satu tujuan: mengubah trafik iklan menjadi leads dan penjualan nyata.",
    badge: "Mulai Rp 800K",
    icon: Megaphone,
    color: "blue",
    price: "Rp 800.000",
    priceNote: "Termasuk domain .com (1 tahun) & hosting gratis",
    description:
      "Landing page adalah senjata paling efektif untuk kampanye iklan digital. Dirancang dengan satu fokus: konversi. Setiap elemen — dari headline, gambar, sampai tombol CTA — dioptimasi untuk mendorong pengunjung mengambil tindakan.",
    features: [
      {
        title: "Desain 1 Halaman Full-Optimized",
        desc: "Layout persuasif yang mengalirkan perhatian pembaca dari atas ke tombol CTA tanpa distraksi.",
      },
      {
        title: "Copywriting yang Menjual",
        desc: "Teks halaman dibuat dengan prinsip copywriting: benefit-focused, mengatasi keberatan, dan mendorong urgensi.",
      },
      {
        title: "Integrasi WhatsApp & Form",
        desc: "CTA langsung terhubung ke WhatsApp atau form lead capture. Setiap klik langsung masuk ke inbox Anda.",
      },
      {
        title: "Loading Super Cepat",
        desc: "Dioptimasi agar load di bawah 2 detik. Halaman yang lambat kehilangan 50%+ pengunjung sebelum terbaca.",
      },
      {
        title: "Mobile-First Design",
        desc: "70%+ trafik iklan dari HP. Tampilan halaman dioptimasi untuk layar kecil terlebih dahulu.",
      },
      {
        title: "Integrasi Google Maps & Pixel",
        desc: "Sambungkan Google Analytics, Facebook Pixel, dan Maps untuk tracking performa iklan Anda.",
      },
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
      {
        q: "Berapa lama proses pengerjaan landing page?",
        a: "Rata-rata 2–3 hari kerja. Proses dimulai setelah Anda mengirimkan materi (foto, logo, teks produk/jasa). Jika materi lengkap sejak hari pertama, bisa selesai lebih cepat.",
      },
      {
        q: "Apakah bisa tambah halaman setelah jadi?",
        a: "Landing page dirancang khusus 1 halaman untuk fokus konversi. Jika butuh halaman lebih, kami rekomendasikan paket Company Profile.",
      },
      {
        q: "Apakah termasuk pembuatan konten/copywriting?",
        a: "Ya, kami bantu menyusun copywriting dasar berdasarkan informasi bisnis yang Anda berikan. Foto dan materi utama dari Anda.",
      },
      {
        q: "Bagaimana cara connect dengan iklan Facebook/Google?",
        a: "Setelah website selesai, kami bantu instalasi Facebook Pixel dan Google Analytics Tag sehingga iklan Anda bisa tracking konversi dengan tepat.",
      },
      {
        q: "Apakah ada garansi kalau tidak puas?",
        a: "Ada revisi sampai Anda puas dalam periode pengerjaan. Kami tidak tutup proyek sebelum Anda approve hasil akhirnya.",
      },
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
    metaDesc:
      "Website company profile profesional untuk bisnis lokal Indonesia. Desain custom, SEO-friendly, dashboard admin. Mulai Rp 1,5 juta termasuk domain & hosting.",
    heroTitle: "Website Company Profile yang Membangun Kepercayaan Pelanggan",
    heroSubtitle:
      "Tampilkan bisnis Anda secara profesional di internet. Lebih dari sekadar Google Maps — website adalah aset digital yang bekerja 24 jam untuk Anda.",
    badge: "Mulai Rp 1,5 Juta",
    icon: Building2,
    color: "indigo",
    price: "Rp 1.500.000 – 3.500.000",
    priceNote: "Tergantung paket Simple (3-4 hal) atau Pro (5-7 hal)",
    description:
      "Company profile website adalah representasi digital bisnis Anda yang lengkap. Menampilkan profil, layanan, portofolio, testimoni, dan cara menghubungi — semua dalam satu tempat yang mudah diakses kapan saja.",
    features: [
      {
        title: "3–7 Halaman Lengkap",
        desc: "Beranda, Tentang Kami, Layanan/Produk, Portofolio, Blog, Kontak. Setiap halaman dirancang untuk konversi.",
      },
      {
        title: "Desain Custom & Modern",
        desc: "Desain dibuat sesuai karakter brand Anda — bukan template cookie-cutter yang sama dengan ribuan website lain.",
      },
      {
        title: "SEO Dasar untuk Google",
        desc: "Struktur halaman, meta tag, sitemap, dan schema markup dipasang agar Google mudah menemukan dan mengindeks website Anda.",
      },
      {
        title: "Email Bisnis Profesional",
        desc: "Dapatkan email @namabisnis.com (mis. info@tokosaya.com) yang meningkatkan kredibilitas saat berkomunikasi dengan pelanggan.",
      },
      {
        title: "Dashboard Admin",
        desc: "Kelola konten website sendiri — ganti foto, teks, dan informasi tanpa harus tahu coding.",
      },
      {
        title: "Integrasi Maps & WhatsApp",
        desc: "Google Maps untuk arah, tombol WhatsApp untuk kontak instan — dua fitur yang paling banyak dicari pelanggan.",
      },
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
      {
        q: "Apa bedanya paket Simple dan Pro?",
        a: "Paket Simple (Rp 1,5 juta): 3-4 halaman dengan desain standar profesional. Paket Pro (Rp 3,5 juta): 5-7 halaman, desain custom penuh, lebih banyak akun email bisnis, dan fitur tambahan seperti multi bahasa.",
      },
      {
        q: "Berapa lama proses pengerjaannya?",
        a: "Paket Simple: 3–5 hari kerja. Paket Pro: 5–7 hari kerja. Estimasi dimulai setelah semua materi (foto, logo, teks) Anda kirimkan.",
      },
      {
        q: "Apakah saya bisa update konten sendiri setelah jadi?",
        a: "Ya. Setiap website company profile dilengkapi dashboard admin yang sederhana. Anda bisa ganti foto, teks, harga, dan informasi kontak tanpa bantuan developer.",
      },
      {
        q: "Apakah website akan muncul di Google?",
        a: "Kami pasang SEO dasar: sitemap, meta tag, dan schema markup. Untuk muncul di halaman pertama Google, butuh strategi konten dan SEO lanjutan yang kami tawarkan terpisah.",
      },
      {
        q: "Apakah bisa tambah fitur seperti booking atau form khusus?",
        a: "Bisa, dengan biaya tambahan tergantung kompleksitas. Diskusikan kebutuhan spesifik Anda saat konsultasi awal.",
      },
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
    metaDesc:
      "Jasa pembuatan toko online lengkap dengan sistem pembayaran, manajemen produk, dan dashboard admin. Mulai Rp 5,4 juta. Siap berjualan 24 jam online.",
    heroTitle: "Toko Online Siap Berjualan 24 Jam, 7 Hari Seminggu",
    heroSubtitle:
      "Buka pintu bisnis Anda ke seluruh Indonesia — bahkan dunia. Toko online yang kami bangun bukan sekadar tampil cantik, tapi juga mudah dikelola dan menghasilkan penjualan nyata.",
    badge: "Rp 5,4 Juta",
    icon: ShoppingCart,
    color: "teal",
    price: "Rp 5.400.000",
    priceNote:
      "Termasuk domain, hosting 1 tahun, dan setup integrasi pembayaran",
    description:
      "Toko online yang benar bukan hanya tempat memajang produk — ini adalah sistem penjualan otomatis yang menerima pesanan, memproses pembayaran, dan mengelola stok bahkan saat Anda tidur. Kami bangun dengan teknologi yang scalable untuk pertumbuhan bisnis jangka panjang.",
    features: [
      {
        title: "Unlimited Halaman Produk",
        desc: "Tampilkan ribuan produk dengan filter kategori, pencarian, dan sorting. Tidak ada batasan jumlah produk.",
      },
      {
        title: "Integrasi Metode Pembayaran",
        desc: "Transfer bank, QRIS, e-wallet (GoPay, OVO, ShopeePay), Alfamart/Indomaret, dan kartu kredit — semua dalam satu platform.",
      },
      {
        title: "Manajemen Pesanan & Stok",
        desc: "Dashboard lengkap untuk kelola pesanan masuk, update status pengiriman, dan pantau stok produk secara real-time.",
      },
      {
        title: "Multi Bahasa & Mata Uang",
        desc: "Siap melayani pelanggan lokal maupun internasional dengan dukungan bahasa dan mata uang berganda.",
      },
      {
        title: "Notifikasi Otomatis",
        desc: "Pelanggan dan penjual mendapat notifikasi email & WhatsApp otomatis untuk setiap pesanan, pembayaran, dan pengiriman.",
      },
      {
        title: "Dashboard Admin Lengkap",
        desc: "Laporan penjualan, grafik pendapatan, produk terlaris, dan manajemen pelanggan dalam satu tempat.",
      },
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
      {
        q: "Apakah sudah termasuk payment gateway?",
        a: "Ya, kami setup koneksi ke payment gateway pilihan (Midtrans/Xendit). Biaya transaksi payment gateway dikenakan oleh penyedia (biasanya 1-3% per transaksi), bukan oleh MFWEB.",
      },
      {
        q: "Berapa lama proses pengerjaan toko online?",
        a: "7–14 hari kerja tergantung jumlah produk dan kompleksitas fitur yang diminta. Setelah materi produk lengkap diterima.",
      },
      {
        q: "Apakah bisa impor produk dari Shopee/Tokopedia?",
        a: "Bisa dengan tools khusus untuk produk yang sudah ada. Kami bantu proses migrasi data produk dari platform lama.",
      },
      {
        q: "Apakah ada biaya bulanan setelah website jadi?",
        a: "Hosting dan domain perlu diperpanjang tahunan (sekitar Rp 600–800 ribu/tahun). Payment gateway punya biaya transaksi per pesanan, tidak ada biaya bulanan tetap ke MFWEB.",
      },
      {
        q: "Bagaimana cara mengelola pesanan dan pengiriman?",
        a: "Kami sediakan dashboard admin yang intuitif. Setiap pesanan masuk muncul di dashboard, Anda bisa update status pengiriman, cetak label, dan cek riwayat penjualan dengan mudah.",
      },
    ],
    stats: [
      { num: "7-14", label: "Hari selesai" },
      { num: "∞", label: "Jumlah produk" },
      { num: "10+", label: "Metode bayar" },
    ],
  },

  "optimasi-seo": {
    slug: "optimasi-seo",
    title: "SEO & Artikel",
    metaTitle: "Jasa SEO Bergaransi & Artikel SEO Friendly | MFWEB",
    metaDesc:
      "Layanan SEO Bergaransi halaman 1 Google dan penulisan artikel SEO original bebas plagiat. Tingkatkan trafik organik untuk bisnis lokal Anda.",
    heroTitle: "Layanan SEO Bergaransi Tembus Halaman 1 Google",
    heroSubtitle:
      "Tingkatkan trafik dan penjualan dengan strategi SEO yang tepat sasaran. Bergaransi masuk halaman pertama Google tanpa harus terus-menerus bayar iklan.",
    badge: "Garansi Halaman 1",
    icon: Search,
    color: "purple",
    price: "Mulai Rp 500.000",
    priceNote: "Untuk Paket SEO Bergaransi (Halaman 1 Google)",
    description:
      "Kami menyediakan layanan SEO menyeluruh: mulai dari optimasi agar website Anda masuk halaman pertama Google (SEO Bergaransi), perawatan bulanan untuk menaikkan trafik visitor, hingga layanan penulisan artikel original yang 100% SEO-friendly.",
    features: [
      {
        title: "SEO Bergaransi (Halaman 1 Google)",
        desc: "Garansi website masuk halaman 1 Google untuk keyword yang disepakati. Meliputi riset keyword, optimasi on-page (title, meta, speed), dan off-page (backlink berkualitas).",
      },
      {
        title: "SEO Bulanan (Target Visitor)",
        desc: "Fokus pada peningkatan jumlah pengunjung dan trafik stabil. Layanan mencakup optimasi lanjutan, perbaikan error website, server maintenance, dan laporang ranking berkala.",
      },
      {
        title: "Beli Artikel Original SEO Friendly",
        desc: "Tingkatkan otoritas website dengan artikel original (Bahasa Indonesia/Inggris). Bebas plagiat (lolos uji), keyword tertarget, dan optimasi struktur heading.",
      },
      {
        title: "Audit & Perbaikan Teknis",
        desc: "Analisa teknis website: kecepatan loading (Pagespeed), mobile-friendliness, perbaikan struktur URL, dan setup Google Webmaster Tools.",
      },
      {
        title: "Laporan Kinerja Transparan",
        desc: "Laporan komprehensif setiap bulan: posisi keyword di pencarian, jumlah traffic organik, dan analisa perkembangan website yang bisa Anda pantau.",
      },
      {
        title: "Bebas Pinalti (White-Hat)",
        desc: "Kami menggunakan teknik White-Hat SEO yang aman dan direkomendasikan. Tidak menggunakan spamming yang berisiko membuat website terkena penalti Google.",
      },
    ],
    forWhom: [
      "Bisnis lokal yang ingin websitenya mendominasi pencarian di kota/area tertentu",
      "Perusahaan yang ingin mengalahkan kompetitor di halaman pencarian",
      "Pemilik website yang butuh artikel original berkualitas untuk update blog rutin",
      "UMKM yang ingin mendapatkan pelanggan gratis dari Google tanpa bayar iklan terus-menerus",
    ],
    deliverables: [
      "Riset keyword dengan intensi beli tinggi",
      "Optimasi On-Page & Off-Page (Backlink)",
      "Artikel blog SEO-friendly (sesuai paket)",
      "Laporan audit & ranking bulanan",
      "Setup Google Analytics & Search Console",
      "Garansi pengerjaan ulang (S&K berlaku)",
    ],
    faqs: [
      {
        q: "Apa maksudnya SEO Bergaransi?",
        a: "Kami menggaransi website Anda akan masuk halaman 1 Google untuk setidaknya beberapa kata kunci (keyword) yang telah kita sepakati di awal. Jika gagal dalam waktu yang ditentukan, kami akan terus mengoptimasi tanpa biaya tambahan.",
      },
      {
        q: "Berapa lama sampai website masuk halaman 1?",
        a: "Tergantung tingkat persaingan keyword. Umumnya hasil mulai terlihat signifikan dalam 2–4 bulan untuk keyword lokal atau persaingan menengah. SEO adalah investasi jangka panjang.",
      },
      {
        q: "Apakah artikel yang dibuat benar-benar original?",
        a: "Tentu. Setiap artikel yang kami buat ditulis secara manual, dioptimasi untuk kaidah SEO terbaru, dan dicek menggunakan alat pendeteksi plagiarisme profesional untuk menjamin 100% original.",
      },
      {
        q: "Apa bedanya SEO Bergaransi dan SEO Bulanan?",
        a: "SEO Bergaransi fokus pada pencapaian peringkat halaman 1 untuk target keyword tertentu. Sedangkan SEO Bulanan difokuskan pada pemeliharaan performa dan peningkatan trafik pengunjung secara keseluruhan setiap bulannya.",
      },
      {
        q: "Apakah saya perlu membeli paket artikel juga?",
        a: "Tergantung kondisi website Anda. Jika website Anda belum memiliki konten yang cukup untuk bersaing dengan kompetitor, kami sangat menyarankan untuk menambah paket artikel original agar proses optimasi SEO jauh lebih maksimal.",
      },
    ],
    stats: [
      { num: "100%", label: "Artikel Original" },
      { num: "Top 10", label: "Ranking Google" },
      { num: "Aman", label: "White-Hat SEO" },
    ],
  },

  "aplikasi-web": {
    slug: "aplikasi-web",
    title: "Aplikasi Web Bisnis",
    metaTitle:
      "Jasa Pembuatan Aplikasi Web Bisnis — Kasir, Booking, Member | MFWEB",
    metaDesc:
      "Jasa pembuatan aplikasi web bisnis: sistem kasir & inventori, booking online, portal member, dan sistem custom. Mulai Rp 5 juta. Konsultasi gratis.",
    heroTitle: "Aplikasi Web yang Mengotomasi Operasional Bisnis Anda",
    heroSubtitle:
      "Lebih dari sekadar website — sistem digital yang bekerja di balik layar untuk mengelola kasir, booking, member, dan laporan bisnis Anda secara otomatis.",
    badge: "Mulai Rp 5 Juta",
    icon: LayoutDashboard,
    color: "violet",
    price: "Mulai Rp 5.000.000",
    priceNote:
      "Harga tergantung fitur dan kompleksitas sistem — konsultasi gratis",
    description:
      "Aplikasi web bisnis adalah sistem digital yang dirancang khusus untuk kebutuhan operasional bisnis Anda. Berbeda dengan website biasa, aplikasi web memiliki logika bisnis, manajemen data, dan panel admin yang memungkinkan tim Anda bekerja lebih efisien setiap hari.",
    features: [
      {
        title: "Login & Manajemen User",
        desc: "Sistem autentikasi aman dengan level akses berbeda — admin, kasir, manajer, atau pelanggan. Setiap user hanya lihat apa yang relevan untuk mereka.",
      },
      {
        title: "Database & Laporan Bisnis",
        desc: "Semua data tersimpan rapi dan bisa diolah menjadi laporan penjualan, stok, booking, atau metrik bisnis lain yang Anda butuhkan.",
      },
      {
        title: "Panel Admin Lengkap",
        desc: "Dashboard terpusat untuk monitor semua aktivitas bisnis — transaksi, inventori, jadwal, atau member — dari satu tempat yang mudah digunakan.",
      },
      {
        title: "Notifikasi Otomatis",
        desc: "WhatsApp dan email otomatis untuk konfirmasi booking, invoice, pengingat jadwal, atau alert stok menipis. Tidak perlu kirim manual lagi.",
      },
      {
        title: "Responsif & Mobile-Friendly",
        desc: "Aplikasi berjalan mulus di smartphone, tablet, maupun laptop — tim Anda bisa akses dari mana saja.",
      },
      {
        title: "Keamanan Data Bisnis",
        desc: "Data terenkripsi, backup otomatis, dan akses terproteksi. Informasi bisnis dan pelanggan Anda aman sepenuhnya.",
      },
    ],
    forWhom: [
      "Restoran atau kafe yang butuh sistem kasir & manajemen meja digital",
      "Klinik, salon, atau jasa yang mau terima booking online otomatis",
      "Bisnis dengan program loyalitas yang butuh sistem poin & member",
      "UMKM yang ingin digitalisasi proses operasional yang masih manual",
    ],
    deliverables: [
      "Aplikasi web siap pakai sesuai spesifikasi",
      "Panel admin untuk kelola data",
      "Sistem login & manajemen user",
      "Database & laporan bisnis",
      "Domain & hosting (1 tahun)",
      "Training penggunaan & dokumentasi",
      "Garansi bug 60 hari setelah launch",
    ],
    faqs: [
      {
        q: "Apa contoh aplikasi web bisnis yang bisa dibuat?",
        a: "Sistem kasir & inventori (POS), sistem booking & reservasi online, portal member & loyalty program, dashboard laporan bisnis, sistem antrian digital, atau sistem HR sederhana. Kami juga bangun sistem custom sesuai kebutuhan spesifik Anda.",
      },
      {
        q: "Berapa lama proses pengerjaannya?",
        a: "Rata-rata 14–30 hari kerja tergantung kompleksitas fitur. Kami kerjakan secara iteratif — Anda bisa lihat progress di setiap milestone dan memberikan feedback sebelum tahap berikutnya dimulai.",
      },
      {
        q: "Apa bedanya aplikasi web dengan website biasa?",
        a: "Website biasa menampilkan informasi statis (company profile, landing page). Aplikasi web memiliki logika bisnis — proses data, autentikasi user, manajemen inventori, laporan real-time, dan otomasi proses yang tidak bisa dilakukan website biasa.",
      },
      {
        q: "Apakah bisa diakses dari HP?",
        a: "Ya, semua aplikasi web yang kami bangun responsif dan bisa diakses dari browser di HP, tablet, atau laptop tanpa perlu install app. Untuk kebutuhan app native (Android/iOS), kami bisa diskusikan terpisah.",
      },
      {
        q: "Bagaimana dengan keamanan data pelanggan?",
        a: "Keamanan adalah prioritas. Kami implementasi enkripsi data, HTTPS, proteksi SQL injection dan XSS, serta backup otomatis berkala. Data bisnis dan pelanggan Anda tidak dibagikan ke pihak ketiga.",
      },
    ],
    stats: [
      { num: "14-30", label: "Hari pengerjaan" },
      { num: "3x", label: "Revisi gratis" },
      { num: "60", label: "Hari garansi bug" },
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
    openGraph: {
      title: service.metaTitle,
      description: service.metaDesc,
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}

const colorMap: Record<
  string,
  { bg: string; text: string; border: string; pill: string }
> = {
  blue: {
    bg: "bg-blue-600/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
    pill: "bg-blue-600",
  },
  indigo: {
    bg: "bg-indigo-600/15",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    pill: "bg-indigo-600",
  },
  teal: {
    bg: "bg-teal-600/15",
    text: "text-teal-400",
    border: "border-teal-500/30",
    pill: "bg-teal-600",
  },
  purple: {
    bg: "bg-purple-600/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
    pill: "bg-purple-600",
  },
  violet: {
    bg: "bg-violet-600/15",
    text: "text-violet-400",
    border: "border-violet-500/30",
    pill: "bg-violet-600",
  },
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
          {
            "@type": "ListItem",
            position: 2,
            name: "Layanan",
            item: `${SITE_URL}/layanan`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.title,
            item: `${SITE_URL}/layanan/${slug}`,
          },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

        <div className="max-w-4xl mx-auto relative">
          <Breadcrumb
            items={[
              { label: "Layanan", href: "/layanan" },
              { label: service.title },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeUp>
                <div
                  className={`inline-flex items-center gap-2 ${c.pill}/20 border ${c.border} px-4 py-1.5 rounded-full text-sm ${c.text} mb-6`}
                >
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
                <p className="text-blue-100/70 text-lg leading-relaxed mb-8">
                  {service.heroSubtitle}
                </p>
              </FadeUp>
              <FadeUp delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="btn-shine bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 shadow-lg shadow-blue-500/25 w-full sm:w-auto"
                    >
                      Konsultasi Gratis <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5 h-12 px-8 w-full sm:w-auto"
                    >
                      Kirim Brief
                    </Button>
                  </Link>
                </div>
              </FadeUp>
            </div>

            {/* Stats card */}
            <FadeUp delay={0.2}>
              <div className="glass rounded-2xl p-7 border border-white/5">
                <p className="text-blue-200/40 text-xs mb-1">
                  Harga mulai dari
                </p>
                <p className={`text-3xl font-bold ${c.text} mb-1`}>
                  {service.price}
                </p>
                <p className="text-blue-200/40 text-xs mb-6">
                  {service.priceNote}
                </p>

                <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/5">
                  {service.stats.map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-xl font-bold text-white">{s.num}</p>
                      <p className="text-blue-200/40 text-xs mt-0.5">
                        {s.label}
                      </p>
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
              Apa yang Termasuk dalam{" "}
              <span className="text-gradient">Layanan Ini</span>
            </h2>
            <p className="text-blue-200/60 max-w-lg mx-auto">
              {service.description}
            </p>
          </FadeUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {service.features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="glass rounded-2xl p-6 hover:border-blue-500/20 transition-colors h-full">
                  <CheckCircle className={`w-5 h-5 ${c.text} mb-3`} />
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-blue-200/50 text-sm leading-relaxed">
                    {f.desc}
                  </p>
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
              <h3 className="text-white font-bold text-lg mb-5">
                Layanan ini cocok untuk...
              </h3>
              <ul className="space-y-3">
                {service.forWhom.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Star className={`w-4 h-4 ${c.text} shrink-0 mt-0.5`} />
                    <span className="text-blue-200/70 text-sm leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="glass rounded-2xl p-7 h-full">
              <h3 className="text-white font-bold text-lg mb-5">
                Yang Anda Dapatkan
              </h3>
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

      {/* ── Custom Pricing for SEO ────────────────────────── */}
      {slug === "optimasi-seo" && <SEOPricingSection />}

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeUp className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Pertanyaan Seputar{" "}
              <span className="text-gradient">{service.title}</span>
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
                  Siap Mulai Layanan{" "}
                  <span className="text-gradient">{service.title}?</span>
                </h2>
                <p className="text-blue-200/60 mb-8 max-w-lg mx-auto">
                  Konsultasi gratis, tanpa biaya, tanpa komitmen. Ceritakan
                  kebutuhan Anda dan kami berikan solusi terbaik.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <a
                    href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="btn-shine bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 shadow-lg shadow-blue-500/25"
                    >
                      💬 WhatsApp Sekarang
                    </Button>
                  </a>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5 h-12 px-8"
                    >
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
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-blue-200/40 text-sm"
                    >
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
            <h3 className="text-white font-semibold text-lg">
              Layanan Lainnya
            </h3>
          </FadeUp>
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(services)
              .filter((s) => s.slug !== slug)
              .map((s) => {
                const sc = colorMap[s.color];
                return (
                  <StaggerItem key={s.slug}>
                    <Link href={`/layanan/${s.slug}`}>
                      <div className="glass rounded-xl p-4 hover:border-blue-500/20 transition-colors group text-center">
                        <div
                          className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                        >
                          <s.icon className={`w-5 h-5 ${sc.text}`} />
                        </div>
                        <p className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">
                          {s.title}
                        </p>
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
    <details
      className="glass rounded-2xl overflow-hidden group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none hover:bg-white/3 transition-colors">
        <span className="text-white font-medium text-sm sm:text-base leading-snug">
          {q}
        </span>
        <span className="shrink-0 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-blue-400 text-lg font-light group-open:rotate-45 transition-transform duration-200">
          +
        </span>
      </summary>
      <div className="px-6 pb-5 border-t border-white/5">
        <p className="text-blue-200/70 text-sm leading-relaxed pt-4">{a}</p>
      </div>
    </details>
  );
}

// Custom pricing section for Optimasi SEO matching the requested layout
function SEOPricingSection() {
  const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343";
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* SEO Services */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Paket Layanan{" "}
              <span className="text-gradient">SEO Bergaransi</span>
            </h2>
            <p className="text-blue-200/60 max-w-2xl mx-auto mb-4">
              Pilih paket yang sesuai dengan kebutuhan dan target pasar bisnis
              Anda.
            </p>
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-1.5 rounded-full text-sm font-medium">
              ⚠️ Ketentuan: Minimal masa kontrak 1 tahun
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="glass rounded-3xl p-8 border border-purple-500/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10">
                SEO Bergaransi <br />
                <span className="text-purple-400 text-sm font-normal">
                  Target Halaman 1 Google
                </span>
              </h3>

              <div className="space-y-4 mb-8">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-semibold text-sm mb-1">
                    5 Target Keyword
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-blue-200/40 line-through">
                      Rp 1.000.000
                    </span>
                    <span className="text-2xl font-bold text-purple-400">
                      Rp 500.000
                      <span className="text-xs text-blue-200/40 font-normal">
                        /bln
                      </span>
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-semibold text-sm mb-1">
                    10 Target Keyword
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-blue-200/40 line-through">
                      Rp 2.000.000
                    </span>
                    <span className="text-2xl font-bold text-purple-400">
                      Rp 1.000.000
                      <span className="text-xs text-blue-200/40 font-normal">
                        /bln
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold text-white mb-4">
                  Fitur Layanan:
                </p>
                <ul className="space-y-3">
                  {[
                    "Riset Keyword Lengkap",
                    "Optimasi SEO Onpage (Meta, Heading, dll)",
                    "Optimasi SEO Offpage (High DA Backlink)",
                    "Optimasi Kecepatan Website",
                    "Laporan Peringkat Bulanan",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-blue-200/70"
                    >
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />{" "}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent("Halo MFWEB, saya tertarik dengan Paket SEO Bergaransi Halaman 1 Google.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                  Pesan Sekarang
                </Button>
              </a>
            </div>

            {/* Card 2 */}
            <div className="glass rounded-3xl p-8 border border-blue-500/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10">
                SEO Bahasa Inggris <br />
                <span className="text-blue-400 text-sm font-normal">
                  Target Visitor & Trafik Stabil
                </span>
              </h3>

              <div className="space-y-4 mb-8">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-semibold text-sm mb-1">
                    5 Target Keyword
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-blue-400">
                      Rp 1.500.000
                      <span className="text-xs text-blue-200/40 font-normal">
                        /bln
                      </span>
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-white font-semibold text-sm mb-1">
                    10 Target Keyword
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-blue-400">
                      Rp 3.000.000
                      <span className="text-xs text-blue-200/40 font-normal">
                        /bln
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold text-white mb-4">
                  Fitur Layanan:
                </p>
                <ul className="space-y-3">
                  {[
                    "Semua fitur Optimasi Onpage & Offpage",
                    "Fokus peningkatan jumlah visitor nyata",
                    "Perbaikan Error Website (404, Broken Link)",
                    "Pemeliharaan Server Dasar",
                    "Laporan Trafik & Visitor Bulanan",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-blue-200/70"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />{" "}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent("Halo MFWEB, saya tertarik dengan Paket SEO Bulanan (Target Visitor).")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                  Pesan Sekarang
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Beli Artikel Original <br />
                <span className="text-gradient">SEO Friendly</span>
              </h2>
              <p className="text-blue-200/60 mb-8">
                Tingkatkan otoritas website Anda di mata Google dengan artikel
                original berkualitas tinggi yang ditulis khusus untuk target
                pasar Anda.
              </p>

              <div className="space-y-4">
                <div className="bg-black/30 rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-bold">
                      Artikel Bahasa Indonesia
                    </p>
                    <p className="text-xs text-blue-200/50">
                      Paket 100 Artikel
                    </p>
                  </div>
                  <span className="text-xl font-black text-green-400">
                    Rp 1.500.000
                  </span>
                </div>
                <div className="bg-black/30 rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-bold">
                      Artikel Bahasa Inggris
                    </p>
                    <p className="text-xs text-blue-200/50">
                      Paket 100 Artikel
                    </p>
                  </div>
                  <span className="text-xl font-black text-green-400">
                    Rp 2.000.000
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-8 border border-white/5 h-full">
              <p className="text-lg font-bold text-white mb-6">
                Fitur Penulisan:
              </p>
              <ul className="space-y-4">
                {[
                  "Ditulis manual oleh penulis manusia (Bukan AI)",
                  "Dijamin 100% Original & Lolos Uji Plagiat (Copyscape)",
                  "Panjang 500 - 1000 kata per artikel",
                  "Riset kata kunci (keyword) mendalam",
                  "Optimasi struktur Heading (H1, H2, H3)",
                  "Artikel siap dipublikasikan langsung ke website",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-blue-100/80"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent("Halo MFWEB, saya tertarik memesan Paket Artikel Original SEO Friendly.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white border border-white/10">
                  Pesan Artikel Saja
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
