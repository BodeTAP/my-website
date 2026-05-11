import { NextRequest, NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { getEnabledAiSettings } from "@/lib/aiSettings";
import { createJsonObjectWithRetry, logAiUsage } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;
  const session = await auth();
  const aiGate = await getEnabledAiSettings("seoAnalyze");
  if (!aiGate.enabled) {
    logAiUsage({
      feature: "seo_analyze",
      model: aiGate.settings.features.seoAnalyze.model,
      status: "blocked",
      actor: session!.user!.email,
      logging: aiGate.settings.usageLogging,
    });
    return aiGate.response;
  }

  const aiSettings = aiGate.settings;
  const aiConfig = aiSettings.features.seoAnalyze;
  const { allowed } = await rateLimit(`ai-seo:${session!.user!.email}`, aiConfig.rateLimit, aiConfig.rateWindowMs);
  if (!allowed) return NextResponse.json({ error: "Terlalu banyak request AI. Coba lagi nanti." }, { status: 429 });

  try {
    const { title, content, metaTitle, metaDescription } = await req.json();
    if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "Title dan content wajib diisi." }, { status: 400 });

    const textOnly = content.replace(/<[^>]*>/g, " ").slice(0, 8000);
    const prompt = `Title: ${title}
Meta Title: ${metaTitle || "N/A"}
Meta Description: ${metaDescription || "N/A"}
Content: ${textOnly.slice(0, 5000)}`;

    const data = await createJsonObjectWithRetry<Record<string, unknown>>({
      model: aiConfig.model,
      maxTokens: aiConfig.maxTokens,
      system: aiConfig.prompt,
      messages: [{ role: "user", content: prompt }],
      retry: aiSettings.jsonRetryEnabled,
    });

    logAiUsage({
      feature: "seo_analyze",
      model: aiConfig.model,
      status: "success",
      actor: session!.user!.email,
      logging: aiSettings.usageLogging,
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error("[AI-SEO]", err);
    logAiUsage({
      feature: "seo_analyze",
      model: aiConfig.model,
      status: "error",
      actor: session!.user!.email,
      error: err instanceof Error ? err.message : "Unknown error",
      logging: aiSettings.usageLogging,
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
