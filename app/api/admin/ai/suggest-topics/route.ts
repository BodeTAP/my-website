import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { getAiSettings } from "@/lib/aiSettings";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

// POST /api/admin/ai/suggest-topics
export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { categoryId, count = 6 } = await req.json();

    // Ambil konteks dari database secara paralel
    const [categories, recentArticles] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.article.findMany({
        select: { title: true, categoryId: true },
        orderBy: { createdAt: "desc" },
        take: 50, // 50 artikel terakhir sebagai konteks "topik yang sudah ditulis"
      }),
    ]);

    // Filter berdasarkan kategori jika diberikan
    const filteredCategory = categoryId
      ? categories.find(c => c.id === categoryId)
      : null;

    const categoryContext = filteredCategory
      ? `Fokus pada kategori: "${filteredCategory.name}".`
      : `Kategori yang tersedia: ${categories.map(c => c.name).join(", ")}.`;

    const existingTitles = recentArticles.length > 0
      ? `\n\nTopik yang SUDAH ditulis (JANGAN ulangi atau buat yang terlalu mirip):\n${recentArticles.map(a => `- ${a.title}`).join("\n")}`
      : "";

    const [anthropic, aiSettings] = [
      new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      await getAiSettings(),
    ];

    const response = await anthropic.messages.create({
      model:      aiSettings.model,
      max_tokens: 2000,
      system: `Kamu adalah content strategist untuk MFWEB, sebuah jasa pembuatan website profesional untuk bisnis lokal Indonesia.

Profil bisnis MFWEB:
- Layanan: Pembuatan website, landing page, toko online, company profile
- Target klien: UMKM, bisnis lokal, pengusaha kecil-menengah Indonesia
- Harga: mulai Rp 800.000
- Keunggulan: desain premium, SEO-friendly, mobile-friendly, cepat
- Platform: mfweb.maffisorp.id

Tugasmu: Buat ${count} ide topik artikel blog yang:
1. Relevan dengan kebutuhan/masalah target klien MFWEB
2. Berpotensi menarik traffic dari Google (search intent jelas)
3. Membangun kepercayaan calon klien untuk menggunakan jasa MFWEB
4. Variatif — campurkan topik educational, how-to, dan comparison
5. Dalam Bahasa Indonesia

${categoryContext}${existingTitles}

Kembalikan JSON array SAJA (tanpa teks lain):
[
  {
    "title": "Judul artikel yang menarik dan spesifik",
    "categoryName": "Nama kategori yang paling sesuai dari daftar yang tersedia",
    "categoryId": "id kategori yang sesuai (gunakan id persis dari daftar, atau null jika tidak ada yang cocok)",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "searchIntent": "informational | commercial | how-to",
    "difficulty": "mudah | sedang | sulit",
    "description": "Alasan kenapa topik ini relevan dan potensial (1 kalimat)"
  }
]`,
      messages: [{ role: "user", content: `Berikan ${count} ide topik artikel blog terbaik untuk MFWEB.` }],
    });

    const text      = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Gagal mengurai respons AI");

    const topics = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      topics,
      meta: {
        categoriesAvailable: categories.length,
        existingArticles:    recentArticles.length,
      },
    });
  } catch (err) {
    console.error("[AI-SuggestTopics]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
