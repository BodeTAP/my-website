import { NextRequest, NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getEnabledAiSettings } from "@/lib/aiSettings";
import { createJsonObjectWithRetry, logAiUsage, renderAiPrompt } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;
  const session = await auth();
  const aiGate = await getEnabledAiSettings("draftArticle");
  if (!aiGate.enabled) {
    logAiUsage({ feature: "draft_article", model: aiGate.settings.features.draftArticle.model, status: "blocked", actor: session!.user!.email, logging: aiGate.settings.usageLogging });
    return aiGate.response;
  }
  const aiSettings = aiGate.settings;
  const aiConfig = aiSettings.features.draftArticle;
  const { allowed } = await rateLimit(`ai-draft:${session!.user!.email}`, aiConfig.rateLimit, aiConfig.rateWindowMs);
  if (!allowed) return NextResponse.json({ error: "Terlalu banyak request AI. Coba lagi nanti." }, { status: 429 });

  try {
    const { topic, keywords, tone, length } = await req.json();
    // Input validation
    if (!topic?.trim()) return NextResponse.json({ error: "Topik wajib diisi." }, { status: 400 });
    if (topic.length > aiSettings.articleMaxTopicChars) return NextResponse.json({ error: `Topik maksimal ${aiSettings.articleMaxTopicChars} karakter.` }, { status: 400 });
    const safeKeywords = Array.isArray(keywords) ? keywords.slice(0, aiSettings.articleMaxKeywords).map((k: unknown) => String(k).slice(0, 100)) : [];

    // Ambil daftar kategori dari database
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });

    const categoryList = categories.length > 0
      ? categories.map(c => `- id: "${c.id}", name: "${c.name}"`).join("\n")
      : "Tidak ada kategori tersedia";

    const system = renderAiPrompt(aiConfig.prompt, {
      tone: tone || aiSettings.articleDefaultTone,
      length: length || aiSettings.articleDefaultLength,
      categoryList,
    });

    const prompt = `Write a high-quality blog article about: ${topic}. 
Keywords to include: ${safeKeywords.join(", ") || "relevant industry terms"}.`;

    const data = await createJsonObjectWithRetry<Record<string, unknown>>({
      model:     aiConfig.model,
      maxTokens: aiConfig.maxTokens,
      system,
      messages:  [{ role: "user", content: prompt }],
      retry:     aiSettings.jsonRetryEnabled,
    });

    // Sertakan daftar kategori lengkap dalam response agar frontend bisa sinkron
    logAiUsage({ feature: "draft_article", model: aiConfig.model, status: "success", actor: session!.user!.email, logging: aiSettings.usageLogging });
    return NextResponse.json({ ...data, availableCategories: categories });
  } catch (err) {
    console.error("[AI-Draft]", err);
    logAiUsage({
      feature: "draft_article",
      model:   aiConfig.model,
      status:  "error",
      actor:   session!.user!.email,
      error:   err instanceof Error ? err.message : "Unknown error",
      logging: aiSettings.usageLogging,
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
