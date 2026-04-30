import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import Anthropic from "@anthropic-ai/sdk";
import { sendWA } from "@/lib/whatsapp";

const TOPICS = [
  "Berapa Harga Jasa Pembuatan Website untuk UMKM di 2026?",
  "5 Tanda Bisnis Anda Sudah Butuh Website Profesional",
  "Perbedaan Landing Page, Company Profile, dan Toko Online",
  "Cara Memilih Jasa Pembuatan Website yang Terpercaya",
  "Kenapa Website Bisnis Harus Mobile-Friendly di 2026",
  "Tips SEO Lokal untuk Bisnis yang Baru Punya Website",
  "Berapa Lama Proses Pembuatan Website Profesional?",
  "Website vs Instagram: Mana yang Lebih Efektif untuk Bisnis?",
  "5 Kesalahan Fatal Pemilik UMKM Saat Buat Website Sendiri",
  "Cara Menghitung ROI Website untuk Bisnis Anda",
  "Apa Itu Domain dan Hosting? Panduan untuk Pemula",
  "Kenapa Website Lambat Bisa Bikin Bisnis Rugi",
  "Manfaat Google Business Profile untuk Bisnis Lokal",
  "Cara Membuat Konten Website yang Menarik Pelanggan",
  "SSL Certificate: Apa Itu dan Kenapa Website Wajib Punya",
  "Panduan Lengkap Membuat Toko Online untuk UMKM",
  "Strategi Digital Marketing Sederhana untuk Bisnis Lokal",
  "Cara Optimalkan Website untuk Pencarian Google Maps",
  "Apa Bedanya Website Murah dan Website Profesional?",
  "Tips Menyiapkan Materi Sebelum Buat Website Baru",
  "Cara Meningkatkan Kepercayaan Pelanggan Lewat Website",
  "Fitur Apa Saja yang Wajib Ada di Website Restoran?",
  "Panduan Website untuk Klinik dan Praktek Dokter",
  "Cara Bisnis Bengkel Bisa Dapat Pelanggan dari Google",
  "Tips Website untuk Salon dan Spa yang Menarik",
  "Bagaimana Website Membantu Bisnis Properti Dapat Leads",
  "Panduan Website untuk Jasa Catering dan Event",
  "Cara Optimalkan Halaman Kontak di Website Bisnis",
  "Mengapa Foto Berkualitas Penting untuk Website Bisnis",
  "Cara Tracking Performa Website dengan Google Analytics",
];

function generateSlug(title: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `${base}-${date}`;
}

async function fetchCoverImage(topic: string, slug: string): Promise<string | null> {
  try {
    const keyword = topic.split(/\s+/).filter(w => w.length > 3).slice(0, 3).join(" ");
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY ?? "" } },
    );
    const data = await res.json() as { photos?: { src: { large: string } }[] };
    const photoUrl = data.photos?.[0]?.src.large;
    if (!photoUrl) return null;

    const imgRes  = await fetch(photoUrl);
    const buffer  = await imgRes.arrayBuffer();
    const blob    = await put(`articles/${slug}.jpg`, buffer, {
      access:      "public",
      contentType: "image/jpeg",
      token:       process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) { return POST(req); }

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const given  = req.headers.get("x-cron-secret")
    ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || given !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Pick next topic
    const setting    = await prisma.siteSetting.findUnique({ where: { key: "auto_publish_topic_index" } });
    const index      = parseInt(setting?.value ?? "0", 10);
    const topic      = TOPICS[index % TOPICS.length];
    const nextIndex  = (index + 1) % TOPICS.length;

    await prisma.siteSetting.upsert({
      where:  { key: "auto_publish_topic_index" },
      create: { key: "auto_publish_topic_index", value: String(nextIndex) },
      update: { value: String(nextIndex) },
    });

    // 2. Generate article via Claude Haiku
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response  = await anthropic.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: `Kamu adalah content writer berpengalaman untuk bisnis UMKM Indonesia.
Tulis artikel blog dalam Bahasa Indonesia dengan gaya yang natural dan conversational.

Aturan penulisan:
- Mulai dengan cerita pendek atau skenario yang relatable bagi pemilik UMKM
- Gunakan bahasa sehari-hari, hindari kata formal yang kaku
- Sertakan contoh bisnis nyata: warung makan, bengkel, salon, klinik, toko kelontong
- Gunakan angka spesifik bukan kata seperti "banyak" atau "sering"
- Variasikan panjang kalimat — campurkan kalimat pendek dan panjang
- HINDARI kata-kata ini: "dalam era", "di tengah", "tentunya", "perlu diketahui", "sangat penting", "tidak dapat dipungkiri", "pada dasarnya"
- Akhiri dengan 1 actionable step yang bisa langsung dilakukan pembaca
- Panjang artikel: 900-1200 kata

Format output HARUS berupa JSON valid:
{
  "title": "judul artikel",
  "content": "konten HTML (<h2>, <h3>, <p>, <ul>, <li>, <strong>)",
  "excerpt": "ringkasan 1-2 kalimat",
  "metaTitle": "meta title maks 60 karakter",
  "metaDesc": "meta description 120-160 karakter",
  "tags": ["tag1", "tag2", "tag3"]
}

Jangan tambahkan teks apapun di luar JSON.`,
      messages: [{ role: "user", content: `Tulis artikel tentang: ${topic}` }],
    });

    const text      = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Respons AI tidak mengandung JSON valid");
    const parsed = JSON.parse(jsonMatch[0]) as {
      title: string; content: string; excerpt: string;
      metaTitle: string; metaDesc: string; tags: string[];
    };

    // 3. Generate slug
    const slug = generateSlug(parsed.title);

    // 4. Fetch cover image (non-blocking failure)
    const coverImage = await fetchCoverImage(topic, slug);

    // 5. Save to DB
    const article = await prisma.article.create({
      data: {
        title:       parsed.title,
        slug,
        excerpt:     parsed.excerpt,
        content:     parsed.content,
        coverImage:  coverImage ?? null,
        metaTitle:   parsed.metaTitle,
        metaDesc:    parsed.metaDesc,
        status:      "PUBLISHED",
        publishedAt: new Date(),
        tags:        parsed.tags ?? [],
      },
    });

    // 6. Notify admin via WA
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
    if (adminPhone) {
      after(async () => {
        await sendWA(
          adminPhone,
          `🤖 Artikel baru dipublish otomatis!\n\n📝 *${parsed.title}*\n\nCek di admin panel untuk review.\n\n_MFWEB Auto-Publisher_`,
        ).catch((e) => console.error("[AutoPublish] WA error:", e));
      });
    }

    console.log(`[AutoPublish] Artikel "${parsed.title}" (${slug}) berhasil dipublish`);

    return NextResponse.json({
      success:        true,
      topic,
      title:          parsed.title,
      slug,
      hasCover:       !!coverImage,
      nextTopicIndex: nextIndex,
    });
  } catch (err) {
    console.error("[AutoPublish] Error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
