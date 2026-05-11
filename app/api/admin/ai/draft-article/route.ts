import { NextRequest, NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getEnabledAiSettings } from "@/lib/aiSettings";
import { extractJsonObject, getAnthropic, logAiUsage } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;
  const session = await auth();
  const { allowed } = await rateLimit(`ai-draft:${session!.user!.email}`, 20, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Terlalu banyak request AI. Coba lagi dalam 1 jam." }, { status: 429 });
  const aiGate = await getEnabledAiSettings("featureArticle");
  if (!aiGate.enabled) {
    logAiUsage({ feature: "draft_article", model: aiGate.settings.model, status: "blocked", actor: session!.user!.email });
    return aiGate.response;
  }
  const aiSettings = aiGate.settings;

  try {
    const { topic, keywords, tone, length } = await req.json();
    // Input validation
    if (!topic?.trim()) return NextResponse.json({ error: "Topik wajib diisi." }, { status: 400 });
    if (topic.length > 500) return NextResponse.json({ error: "Topik maksimal 500 karakter." }, { status: 400 });
    const safeKeywords = Array.isArray(keywords) ? keywords.slice(0, 10).map((k: unknown) => String(k).slice(0, 100)) : [];
    const anthropic = getAnthropic();

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
Keywords to include: ${safeKeywords.join(", ") || "relevant industry terms"}.`;

    const response = await anthropic.messages.create({
      model: aiSettings.model,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const data = extractJsonObject<Record<string, unknown>>(text);

    // Sertakan daftar kategori lengkap dalam response agar frontend bisa sinkron
    logAiUsage({ feature: "draft_article", model: aiSettings.model, status: "success", actor: session!.user!.email });
    return NextResponse.json({ ...data, availableCategories: categories });
  } catch (err) {
    console.error("[AI-Draft]", err);
    logAiUsage({
      feature: "draft_article",
      model:   aiSettings.model,
      status:  "error",
      actor:   session!.user!.email,
      error:   err instanceof Error ? err.message : "Unknown error",
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
