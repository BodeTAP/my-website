import { NextRequest, NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getEnabledAiSettings } from "@/lib/aiSettings";
import { createJsonArrayWithRetry, logAiUsage, renderAiPrompt } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

// POST /api/admin/ai/suggest-topics
export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;
  const session = await auth();
  const aiGate = await getEnabledAiSettings("suggestTopics");
  if (!aiGate.enabled) {
    logAiUsage({
      feature: "suggest_topics",
      model: aiGate.settings.features.suggestTopics.model,
      status: "blocked",
      actor: session!.user!.email,
      logging: aiGate.settings.usageLogging,
    });
    return aiGate.response;
  }

  const aiSettings = aiGate.settings;
  const aiConfig = aiSettings.features.suggestTopics;
  const { allowed } = await rateLimit(`ai-topics:${session!.user!.email}`, aiConfig.rateLimit, aiConfig.rateWindowMs);
  if (!allowed) return NextResponse.json({ error: "Terlalu banyak request AI. Coba lagi nanti." }, { status: 429 });

  try {
    const { categoryId, count = 6 } = await req.json();
    const safeCount = Math.min(Math.max(1, Number(count) || 6), 10);

    const [categories, recentArticles] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.article.findMany({
        select: { title: true, categoryId: true },
        orderBy: { createdAt: "desc" },
        take: aiSettings.autoPublishRecentArticleCount,
      }),
    ]);

    const filteredCategory = categoryId
      ? categories.find(c => c.id === categoryId)
      : null;

    const categoryContext = filteredCategory
      ? `Fokus pada kategori: "${filteredCategory.name}".`
      : `Kategori yang tersedia: ${categories.map(c => c.name).join(", ")}.`;

    const existingTitles = recentArticles.length > 0
      ? `\n\nTopik yang SUDAH ditulis (JANGAN ulangi atau buat yang terlalu mirip):\n${recentArticles.map(a => `- ${a.title}`).join("\n")}`
      : "";

    const system = renderAiPrompt(aiConfig.prompt, {
      count: safeCount,
      categoryContext,
      existingTitles,
    });

    const topics = await createJsonArrayWithRetry<unknown[]>({
      model: aiConfig.model,
      maxTokens: aiConfig.maxTokens,
      system,
      messages: [{ role: "user", content: `Berikan ${safeCount} ide topik artikel blog terbaik untuk MFWEB.` }],
      retry: aiSettings.jsonRetryEnabled,
    });

    logAiUsage({
      feature: "suggest_topics",
      model: aiConfig.model,
      status: "success",
      actor: session!.user!.email,
      logging: aiSettings.usageLogging,
    });
    return NextResponse.json({
      topics,
      meta: {
        categoriesAvailable: categories.length,
        existingArticles: recentArticles.length,
      },
    });
  } catch (err) {
    console.error("[AI-SuggestTopics]", err);
    logAiUsage({
      feature: "suggest_topics",
      model: aiConfig.model,
      status: "error",
      actor: session!.user!.email,
      error: err instanceof Error ? err.message : "Unknown error",
      logging: aiSettings.usageLogging,
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
