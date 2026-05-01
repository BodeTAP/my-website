import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAndUploadCoverImage } from "@/lib/ai";
import Anthropic from "@anthropic-ai/sdk";
import { sendWA } from "@/lib/whatsapp";

// Konteks bisnis MFWEB yang diberikan ke Claude untuk generate topik
const MFWEB_CONTEXT = `
MFWEB adalah jasa pembuatan website profesional untuk bisnis lokal Indonesia.
Layanan: website company profile, landing page, toko online, portofolio.
Target klien: UMKM, pengusaha lokal, bisnis kuliner, klinik, salon, bengkel, properti.
Harga mulai Rp 800.000. Platform: mfweb.maffisorp.id.
`.trim();

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

/** Minta Claude memilih topik baru yang belum pernah ditulis */
async function generateTopic(
  anthropic: Anthropic,
  existingTitles: string[],
  categories: { id: string; name: string }[],
): Promise<{ topic: string; categoryId: string | null }> {
  const categoryList = categories.length > 0
    ? categories.map(c => `- id: "${c.id}", name: "${c.name}"`).join("\n")
    : "Tidak ada kategori";

  const existingList = existingTitles.length > 0
    ? `\nTopik yang SUDAH ditulis (jangan ulangi):\n${existingTitles.slice(0, 30).map(t => `- ${t}`).join("\n")}`
    : "";

  const response = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system: `Kamu adalah content strategist untuk ${MFWEB_CONTEXT}

Pilih 1 topik artikel blog yang:
- Belum pernah ditulis (lihat daftar existing)
- Relevan dengan kebutuhan calon klien MFWEB
- Berpotensi menarik traffic dari Google
- Dalam Bahasa Indonesia

Kategori yang tersedia:
${categoryList}
${existingList}

Kembalikan JSON SAJA:
{ "topic": "Judul artikel yang menarik", "categoryId": "id kategori paling sesuai atau null" }`,
    messages: [{ role: "user", content: "Pilih 1 topik artikel terbaik untuk hari ini." }],
  });

  const text      = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gagal mengurai topik dari AI");

  return JSON.parse(jsonMatch[0]);
}

/** Generate artikel lengkap dari topik yang diberikan */
async function generateArticle(
  anthropic: Anthropic,
  topic: string,
  categories: { id: string; name: string }[],
): Promise<{
  title: string; content: string; excerpt: string;
  metaTitle: string; metaDesc: string; tags: string[];
  suggestedCategoryId: string | null;
}> {
  const categoryList = categories.map(c => `- id: "${c.id}", name: "${c.name}"`).join("\n");

  const response = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    system: `Kamu adalah content writer berpengalaman untuk ${MFWEB_CONTEXT}

Tulis artikel blog dalam Bahasa Indonesia dengan gaya natural dan conversational.

Aturan penulisan:
- Mulai dengan cerita pendek atau skenario yang relatable bagi pemilik UMKM
- Gunakan bahasa sehari-hari, hindari kata formal yang kaku
- Sertakan contoh bisnis nyata: warung makan, bengkel, salon, klinik, toko kelontong
- Gunakan angka spesifik bukan kata seperti "banyak" atau "sering"
- Variasikan panjang kalimat — campurkan kalimat pendek dan panjang
- HINDARI: "dalam era", "di tengah", "tentunya", "perlu diketahui", "sangat penting", "tidak dapat dipungkiri", "pada dasarnya"
- Akhiri dengan 1 actionable step yang bisa langsung dilakukan pembaca
- Panjang artikel: 900-1200 kata

Kategori yang tersedia (pilih yang paling sesuai):
${categoryList}

Format output HARUS berupa JSON valid:
{
  "title": "judul artikel",
  "content": "konten HTML (<h2>, <h3>, <p>, <ul>, <li>, <strong>)",
  "excerpt": "ringkasan 1-2 kalimat",
  "metaTitle": "meta title maks 60 karakter",
  "metaDesc": "meta description 120-160 karakter",
  "tags": ["tag1", "tag2", "tag3"],
  "suggestedCategoryId": "id kategori yang paling sesuai atau null"
}

Jangan tambahkan teks apapun di luar JSON.`,
    messages: [{ role: "user", content: `Tulis artikel tentang: ${topic}` }],
  });

  const text      = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Respons AI tidak mengandung JSON valid");

  return JSON.parse(jsonMatch[0]);
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
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // 1. Ambil kategori dan judul artikel yang sudah ada secara paralel
    const [categories, existingArticles] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.article.findMany({
        select:  { title: true },
        orderBy: { createdAt: "desc" },
        take:    50,
      }),
    ]);

    const existingTitles = existingArticles.map(a => a.title);

    // 2. Minta Claude pilih topik baru yang belum pernah ditulis
    const { topic, categoryId: suggestedId } = await generateTopic(anthropic, existingTitles, categories);
    console.log(`[AutoPublish] Topik dipilih AI: "${topic}"`);

    // 3. Generate artikel lengkap
    const parsed = await generateArticle(anthropic, topic, categories);

    // 4. Tentukan categoryId final (dari generate article atau dari generate topic)
    const finalCategoryId = parsed.suggestedCategoryId ?? suggestedId ?? null;

    // 5. Cek apakah kategori valid
    const validCategoryId = finalCategoryId && categories.find(c => c.id === finalCategoryId)
      ? finalCategoryId
      : null;

    // 6. Generate slug + cek duplikat
    let slug      = generateSlug(parsed.title);
    const dupCheck = await prisma.article.findUnique({ where: { slug } });
    if (dupCheck) slug = `${slug}-${Date.now()}`; // Tambah timestamp jika duplikat

    // 7. Fetch & upload cover image (dengan keyword auto-translated)
    const coverImage = await fetchAndUploadCoverImage(topic, "articles");

    // 8. Simpan ke database
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
        categoryId:  validCategoryId,
      },
    });

    // 9. Notifikasi WA ke admin (non-blocking)
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
    if (adminPhone) {
      after(async () => {
        const categoryName = validCategoryId
          ? categories.find(c => c.id === validCategoryId)?.name ?? "-"
          : "Tanpa Kategori";

        await sendWA(
          adminPhone,
          `🤖 *Artikel baru dipublish otomatis!*\n\n` +
          `📝 *${parsed.title}*\n` +
          `🏷 Kategori: ${categoryName}\n` +
          `🖼 Cover: ${coverImage ? "✅ Ada" : "❌ Tidak ada"}\n\n` +
          `Cek di admin panel untuk review.\n\n_MFWEB Auto-Publisher_`,
        ).catch(e => console.error("[AutoPublish] WA error:", e));
      });
    }

    console.log(`[AutoPublish] Artikel "${parsed.title}" (${slug}) berhasil dipublish. Kategori: ${validCategoryId ?? "none"}`);

    return NextResponse.json({
      success:    true,
      topic,
      title:      parsed.title,
      slug,
      categoryId: validCategoryId,
      hasCover:   !!coverImage,
    });
  } catch (err) {
    console.error("[AutoPublish] Error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
