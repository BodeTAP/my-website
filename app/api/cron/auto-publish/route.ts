import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAndUploadCoverImage } from "@/lib/ai";
import Anthropic from "@anthropic-ai/sdk";
import { sendWA } from "@/lib/whatsapp";

// Solusi C: extend batas waktu Vercel (butuh Pro plan, fallback aman di Hobby)
export const maxDuration = 60;

const MFWEB_CONTEXT = `
MFWEB adalah jasa pembuatan website profesional untuk bisnis lokal Indonesia.
Layanan: website company profile, landing page, toko online, portofolio.
Target klien: UMKM, pengusaha lokal, bisnis kuliner, klinik, salon, bengkel, properti.
Harga mulai Rp 800.000. Platform: mfweb.maffisorp.id.
`.trim();

function generateSlug(title: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const base  = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `${base}-${date}`;
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

    // 1. Ambil data dari DB secara paralel
    const [categories, existingArticles] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.article.findMany({
        select:  { title: true },
        orderBy: { createdAt: "desc" },
        take:    50,
      }),
    ]);

    const existingTitles = existingArticles.map(a => a.title);
    const categoryList   = categories.length > 0
      ? categories.map(c => `- id: "${c.id}", name: "${c.name}"`).join("\n")
      : "Tidak ada kategori";
    const existingList   = existingTitles.length > 0
      ? `\n\nTopik yang SUDAH ada (jangan ulangi):\n${existingTitles.slice(0, 30).map(t => `- ${t}`).join("\n")}`
      : "";

    // 2. Solusi A: SATU panggilan Claude — pilih topik + tulis artikel sekaligus
    const response = await anthropic.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 4500,
      system: `Kamu adalah content writer berpengalaman untuk ${MFWEB_CONTEXT}

TUGAS: Pilih 1 topik terbaik yang belum pernah ditulis, lalu langsung tulis artikelnya.

Kriteria topik:
- Relevan dengan kebutuhan calon klien MFWEB
- Berpotensi menarik traffic dari Google
- Belum pernah ditulis (lihat daftar existing di bawah)
- Dalam Bahasa Indonesia

Aturan penulisan artikel:
- Mulai dengan cerita pendek atau skenario relatable bagi pemilik UMKM
- Gunakan bahasa sehari-hari, hindari kata formal yang kaku
- Sertakan contoh bisnis nyata: warung makan, bengkel, salon, klinik, toko kelontong
- Gunakan angka spesifik, bukan kata seperti "banyak" atau "sering"
- Variasikan panjang kalimat
- HINDARI: "dalam era", "di tengah", "tentunya", "perlu diketahui", "sangat penting", "tidak dapat dipungkiri", "pada dasarnya"
- Akhiri dengan 1 actionable step yang bisa langsung dilakukan pembaca
- Panjang artikel: 900-1200 kata

Kategori yang tersedia:
${categoryList}
${existingList}

Kembalikan JSON valid SAJA (tanpa teks lain):
{
  "topic": "topik yang kamu pilih (1 kalimat)",
  "title": "judul artikel yang menarik",
  "content": "konten HTML lengkap (<h2>, <h3>, <p>, <ul>, <li>, <strong>)",
  "excerpt": "ringkasan 1-2 kalimat",
  "metaTitle": "meta title maks 60 karakter",
  "metaDesc": "meta description 120-160 karakter",
  "tags": ["tag1", "tag2", "tag3"],
  "suggestedCategoryId": "id kategori paling sesuai atau null"
}`,
      messages: [{ role: "user", content: "Pilih topik terbaik hari ini dan tulis artikelnya sekarang." }],
    });

    const text      = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Respons AI tidak mengandung JSON valid");

    const parsed = JSON.parse(jsonMatch[0]) as {
      topic:               string;
      title:               string;
      content:             string;
      excerpt:             string;
      metaTitle:           string;
      metaDesc:            string;
      tags:                string[];
      suggestedCategoryId: string | null;
    };

    // 3. Validasi kategori
    const validCategoryId = parsed.suggestedCategoryId &&
      categories.find(c => c.id === parsed.suggestedCategoryId)
        ? parsed.suggestedCategoryId
        : null;

    // 4. Generate slug + cek duplikat
    let slug       = generateSlug(parsed.title);
    const dupCheck = await prisma.article.findUnique({ where: { slug } });
    if (dupCheck) slug = `${slug}-${Date.now()}`;

    // 5. Simpan artikel ke DB TANPA menunggu cover image
    const article = await prisma.article.create({
      data: {
        title:       parsed.title,
        slug,
        excerpt:     parsed.excerpt,
        content:     parsed.content,
        coverImage:  null, // akan diupdate di background
        metaTitle:   parsed.metaTitle,
        metaDesc:    parsed.metaDesc,
        status:      "PUBLISHED",
        publishedAt: new Date(),
        tags:        parsed.tags ?? [],
        categoryId:  validCategoryId,
      },
    });

    console.log(`[AutoPublish] ✅ Artikel "${parsed.title}" (${slug}) disimpan. Kategori: ${validCategoryId ?? "none"}`);

    // 6. Solusi B: Cover image + WA notif dijalankan di BACKGROUND (non-blocking)
    after(async () => {
      try {
        // Fetch & upload cover image di background
        const coverImage = await fetchAndUploadCoverImage(parsed.topic ?? parsed.title, "articles");
        if (coverImage) {
          await prisma.article.update({
            where: { id: article.id },
            data:  { coverImage },
          });
          console.log(`[AutoPublish] 🖼 Cover image diupdate untuk "${parsed.title}"`);
        }

        // Kirim notifikasi WA ke admin
        const adminPhone    = process.env.ADMIN_WHATSAPP_NUMBER;
        const categoryName  = validCategoryId
          ? categories.find(c => c.id === validCategoryId)?.name ?? "-"
          : "Tanpa Kategori";

        if (adminPhone) {
          await sendWA(
            adminPhone,
            `🤖 *Artikel baru dipublish otomatis!*\n\n` +
            `📝 *${parsed.title}*\n` +
            `🏷 Kategori: ${categoryName}\n` +
            `🖼 Cover: ${coverImage ? "✅ Ada" : "❌ Tidak ada"}\n\n` +
            `Cek di admin panel untuk review.\n\n_MFWEB Auto-Publisher_`,
          ).catch(e => console.error("[AutoPublish] WA error:", e));
        }
      } catch (bgErr) {
        console.error("[AutoPublish] Background task error:", bgErr);
      }
    });

    // 7. Return response segera — tidak menunggu background tasks
    return NextResponse.json({
      success:    true,
      topic:      parsed.topic,
      title:      parsed.title,
      slug,
      categoryId: validCategoryId,
      message:    "Artikel tersimpan. Cover image sedang diproses di background.",
    });

  } catch (err) {
    console.error("[AutoPublish] Error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
