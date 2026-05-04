import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { getAiSettings } from "@/lib/aiSettings";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { topic, keywords, tone, length } = await req.json();
    const [anthropic, aiSettings] = [
      new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      await getAiSettings(),
    ];

    // Ambil daftar kategori dari database
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });

    const categoryList = categories.length > 0
      ? categories.map(c => `- id: "${c.id}", name: "${c.name}"`).join("\n")
      : "Tidak ada kategori tersedia";

    const system = `You are an expert SEO content writer for Indonesian local businesses.
Write in Bahasa Indonesia.
Produce HTML compatible with Tiptap editor (use <h2>, <h3>, <p>, <ul>, <li>, <strong> tags).
Return a JSON object with: title, content (HTML string), excerpt (1-2 sentences plain text summary for article listing), metaTitle, metaDescription, suggestedTags (array), suggestedCategoryId (string or null), and suggestedCategoryName (string or null).
The tone should be ${tone || "informative"}.
The length should be ${length || "medium"}.

Available categories in the system (choose the MOST relevant one based on the article topic, use the exact id):
${categoryList}

If none of the available categories match, set suggestedCategoryId and suggestedCategoryName to null.`;

    const prompt = `Write a high-quality blog article about: ${topic}. 
Keywords to include: ${keywords?.join(", ") || "relevant industry terms"}.`;

    const response = await anthropic.messages.create({
      model: aiSettings.model,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gagal mengurai respons AI");
    
    const data = JSON.parse(jsonMatch[0]);

    // Sertakan daftar kategori lengkap dalam response agar frontend bisa sinkron
    return NextResponse.json({ ...data, availableCategories: categories });
  } catch (err) {
    console.error("[AI-Draft]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
