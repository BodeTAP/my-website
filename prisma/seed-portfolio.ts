import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Placeholder images from Unsplash (free, no auth needed)
const COVERS = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", // restaurant
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80", // retail store
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80", // clinic/health
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80", // beauty salon
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80", // tech/laptop
  "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80", // property
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", // fitness
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", // education
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", // cafe
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80", // ecommerce
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", // catering
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", // fashion
];

const PORTFOLIOS = [
  {
    title: "Warung Makan Bu Sari",
    slug: "warung-makan-bu-sari",
    description: "Website menu digital dan reservasi online untuk warung makan legendaris di Yogyakarta. Dilengkapi galeri foto makanan dan sistem pemesanan meja.",
    clientName: "Bu Sari — Yogyakarta",
    techStack: ["Next.js", "Tailwind CSS", "WhatsApp Integration"],
    liveUrl: null,
    metrics: "+340% pengunjung baru dalam 2 bulan",
    coverImage: COVERS[0],
    order: 1,
    featured: true,
  },
  {
    title: "Toko Batik Nusantara",
    slug: "toko-batik-nusantara",
    description: "Toko online batik premium dengan katalog produk lengkap, sistem pembayaran terintegrasi, dan fitur custom order untuk batik tulis.",
    clientName: "Batik Nusantara — Solo",
    techStack: ["Next.js", "Prisma", "Midtrans", "Vercel"],
    liveUrl: null,
    metrics: "Rp 45 juta omzet bulan pertama",
    coverImage: COVERS[1],
    order: 2,
    featured: true,
  },
  {
    title: "Klinik Sehat Bersama",
    slug: "klinik-sehat-bersama",
    description: "Website klinik modern dengan sistem booking dokter online, informasi layanan kesehatan, dan portal pasien untuk riwayat kunjungan.",
    clientName: "dr. Hendra — Jakarta Selatan",
    techStack: ["Next.js", "PostgreSQL", "Tailwind CSS"],
    liveUrl: null,
    metrics: "Booking online naik 5x lipat",
    coverImage: COVERS[2],
    order: 3,
    featured: true,
  },
  {
    title: "Salon Cantik Permata",
    slug: "salon-cantik-permata",
    description: "Website salon kecantikan dengan fitur booking treatment online, galeri hasil kerja, dan program loyalitas pelanggan digital.",
    clientName: "Permata Beauty — Bandung",
    techStack: ["Next.js", "Framer Motion", "WhatsApp Bot"],
    liveUrl: null,
    metrics: "Antrian booking penuh 2 minggu ke depan",
    coverImage: COVERS[3],
    order: 4,
    featured: false,
  },
  {
    title: "CV Maju Teknologi",
    slug: "cv-maju-teknologi",
    description: "Company profile profesional untuk perusahaan IT lokal. Menampilkan portofolio proyek, tim, dan layanan dengan animasi modern.",
    clientName: "CV Maju Teknologi — Surabaya",
    techStack: ["Next.js", "TypeScript", "Framer Motion"],
    liveUrl: null,
    metrics: "3 klien enterprise baru dalam sebulan",
    coverImage: COVERS[4],
    order: 5,
    featured: false,
  },
  {
    title: "Properti Indah Realty",
    slug: "properti-indah-realty",
    description: "Platform listing properti dengan pencarian canggih, virtual tour, dan sistem lead generation untuk agen properti di Bali.",
    clientName: "Indah Realty — Bali",
    techStack: ["Next.js", "Google Maps API", "Prisma"],
    liveUrl: null,
    metrics: "120 leads baru per bulan",
    coverImage: COVERS[5],
    order: 6,
    featured: true,
  },
  {
    title: "Gym Fit Indonesia",
    slug: "gym-fit-indonesia",
    description: "Website gym modern dengan jadwal kelas online, membership digital, dan tracking progress member. Terintegrasi dengan WhatsApp untuk reminder.",
    clientName: "Fit Indonesia — Jakarta",
    techStack: ["Next.js", "Tailwind CSS", "Supabase"],
    liveUrl: null,
    metrics: "+200 member baru dalam 3 bulan",
    coverImage: COVERS[6],
    order: 7,
    featured: false,
  },
  {
    title: "Bimbel Pintar Cerdas",
    slug: "bimbel-pintar-cerdas",
    description: "Platform bimbingan belajar online dengan jadwal kelas, materi digital, dan sistem pembayaran SPP otomatis. Melayani 500+ siswa.",
    clientName: "Bimbel Pintar — Bekasi",
    techStack: ["Next.js", "Prisma", "Midtrans", "Vercel"],
    liveUrl: null,
    metrics: "Efisiensi admin naik 80%",
    coverImage: COVERS[7],
    order: 8,
    featured: false,
  },
  {
    title: "Kafe Kopi Kenangan",
    slug: "kafe-kopi-kenangan",
    description: "Website kafe aesthetic dengan menu digital, sistem pre-order, dan loyalty program. Desain Instagram-worthy yang meningkatkan brand awareness.",
    clientName: "Kopi Kenangan — Malang",
    techStack: ["Next.js", "Tailwind CSS", "Instagram API"],
    liveUrl: null,
    metrics: "10.000 pengunjung website/bulan",
    coverImage: COVERS[8],
    order: 9,
    featured: false,
  },
  {
    title: "Toko Online Serba Ada",
    slug: "toko-online-serba-ada",
    description: "E-commerce lengkap dengan 500+ produk, manajemen stok real-time, multi-payment gateway, dan dashboard penjualan untuk UMKM.",
    clientName: "Serba Ada Shop — Semarang",
    techStack: ["Next.js", "Prisma", "Midtrans", "Vercel Blob"],
    liveUrl: null,
    metrics: "Rp 120 juta GMV bulan ke-3",
    coverImage: COVERS[9],
    order: 10,
    featured: true,
  },
  {
    title: "Catering Ibu Rumahan",
    slug: "catering-ibu-rumahan",
    description: "Website catering dengan sistem pemesanan paket, kalkulator harga otomatis, dan galeri dokumentasi acara. Melayani 50+ event per bulan.",
    clientName: "Dapur Ibu — Depok",
    techStack: ["Next.js", "WhatsApp Integration", "Google Calendar"],
    liveUrl: null,
    metrics: "Pesanan naik 3x setelah launch",
    coverImage: COVERS[10],
    order: 11,
    featured: false,
  },
  {
    title: "Butik Fashion Lokal",
    slug: "butik-fashion-lokal",
    description: "Toko fashion lokal dengan lookbook digital, size guide interaktif, dan fitur wishlist. Desain premium yang mencerminkan brand identity.",
    clientName: "Lokal Butik — Bandung",
    techStack: ["Next.js", "Framer Motion", "Vercel Blob"],
    liveUrl: null,
    metrics: "Konversi online 4.2% (rata-rata industri 1.5%)",
    coverImage: COVERS[11],
    order: 12,
    featured: false,
  },
];

async function seedPortfolio() {
  console.log("🌱 Seeding portfolio data...");

  let created = 0;
  let skipped = 0;

  for (const item of PORTFOLIOS) {
    try {
      await prisma.portfolio.upsert({
        where: { slug: item.slug },
        create: item,
        update: {
          title:       item.title,
          description: item.description,
          clientName:  item.clientName,
          techStack:   item.techStack,
          metrics:     item.metrics,
          coverImage:  item.coverImage,
          order:       item.order,
          featured:    item.featured,
        },
      });
      created++;
      console.log(`  ✅ ${item.title}`);
    } catch (err) {
      skipped++;
      console.error(`  ❌ ${item.title}:`, err);
    }
  }

  console.log(`\n✅ Portfolio seeded: ${created} items, ${skipped} skipped`);
}

seedPortfolio()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
