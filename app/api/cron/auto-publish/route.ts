import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createJsonObjectWithRetry,
  fetchAndUploadCoverImage,
  logAiUsage,
  renderAiPrompt,
} from "@/lib/ai";
import { getEnabledAiSettings } from "@/lib/aiSettings";
import type { AiModel, AiSettings } from "@/lib/aiConfig";
import { sendWA } from "@/lib/whatsapp";

function generateSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  if (slug.length > 60) {
    slug = slug.slice(0, 60);
    const lastHyphen = slug.lastIndexOf("-");
    if (lastHyphen > 30) slug = slug.slice(0, lastHyphen);
  }

  return slug;
}

async function generateTopic(
  model: AiModel,
  settings: AiSettings,
  existingTitles: string[],
  categories: { id: string; name: string }[],
): Promise<{ topic: string; categoryId: string | null }> {
  const categoryList = categories.length > 0
    ? categories.map(c => `- id: "${c.id}", name: "${c.name}"`).join("\n")
    : "Tidak ada kategori";

  const existingList = existingTitles.length > 0
    ? `\nTopik yang SUDAH ditulis (jangan ulangi):\n${existingTitles.slice(0, settings.autoPublishExistingTopicCount).map(t => `- ${t}`).join("\n")}`
    : "";

  const system = renderAiPrompt(settings.autoPublishTopicPrompt, {
    categoryList,
    existingList,
  });

  return createJsonObjectWithRetry<{ topic: string; categoryId: string | null }>({
    model,
    maxTokens: settings.autoPublishTopicMaxTokens,
    system,
    messages: [{ role: "user", content: "Pilih 1 topik artikel terbaik untuk hari ini." }],
    retry: settings.jsonRetryEnabled,
  });
}

async function generateArticle(
  model: AiModel,
  settings: AiSettings,
  topic: string,
  categories: { id: string; name: string }[],
): Promise<{
  title: string; content: string; excerpt: string;
  metaTitle: string; metaDesc: string; tags: string[];
  suggestedCategoryId: string | null;
}> {
  const categoryList = categories.map(c => `- id: "${c.id}", name: "${c.name}"`).join("\n");
  const system = renderAiPrompt(settings.features.autoPublish.prompt, {
    categoryList,
  });

  return createJsonObjectWithRetry<{
    title: string; content: string; excerpt: string;
    metaTitle: string; metaDesc: string; tags: string[];
    suggestedCategoryId: string | null;
  }>({
    model,
    maxTokens: settings.features.autoPublish.maxTokens,
    system,
    messages: [{ role: "user", content: `Tulis artikel tentang: ${topic}` }],
    retry: settings.jsonRetryEnabled,
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const given  = req.headers.get("x-cron-secret")
    ?? req.headers.get("authorization")?.replace("Bearer ", "");

  if (!secret || given !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const aiGate = await getEnabledAiSettings("autoPublish");
  if (!aiGate.enabled) {
    logAiUsage({
      feature: "auto_publish",
      model: aiGate.settings.features.autoPublish.model,
      status: "blocked",
      actor: "cron",
      logging: aiGate.settings.usageLogging,
    });
    return aiGate.response;
  }
  const aiSettings = aiGate.settings;
  const aiConfig = aiSettings.features.autoPublish;

  try {
    const [categories, existingArticles] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.article.findMany({
        select:  { title: true },
        orderBy: { createdAt: "desc" },
        take:    aiSettings.autoPublishRecentArticleCount,
      }),
    ]);

    const existingTitles = existingArticles.map(a => a.title);
    const { topic, categoryId: suggestedId } = await generateTopic(aiConfig.model, aiSettings, existingTitles, categories);
    console.log(`[AutoPublish] Topik dipilih AI: "${topic}"`);

    const parsed = await generateArticle(aiConfig.model, aiSettings, topic, categories);
    const finalCategoryId = parsed.suggestedCategoryId ?? suggestedId ?? null;
    const validCategoryId = finalCategoryId && categories.find(c => c.id === finalCategoryId)
      ? finalCategoryId
      : null;

    let slug = generateSlug(parsed.title);
    let finalSlug = slug;
    let attempt = 0;
    while (attempt < 5) {
      const dupCheck = await prisma.article.findUnique({ where: { slug: finalSlug } });
      if (!dupCheck) break;
      attempt++;
      finalSlug = attempt === 1
        ? `${slug}-${Date.now()}`
        : `${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    }
    slug = finalSlug;

    const coverImage = aiSettings.autoPublishCoverEnabled
      ? await fetchAndUploadCoverImage(topic, aiSettings.autoPublishBlobPrefix, aiSettings)
      : null;

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

    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
    if (adminPhone && aiSettings.autoPublishNotifyWa) {
      after(async () => {
        const categoryName = validCategoryId
          ? categories.find(c => c.id === validCategoryId)?.name ?? "-"
          : "Tanpa Kategori";

        await sendWA(
          adminPhone,
          `Artikel baru dipublish otomatis!\n\n` +
          `${parsed.title}\n` +
          `Kategori: ${categoryName}\n` +
          `Cover: ${coverImage ? "Ada" : "Tidak ada"}\n\n` +
          `Cek di admin panel untuk review.\n\n_MFWEB Auto-Publisher_`,
        ).catch(e => console.error("[AutoPublish] WA error:", e));
      });
    }

    console.log(`[AutoPublish] Artikel "${parsed.title}" (${slug}) berhasil dipublish. Kategori: ${validCategoryId ?? "none"}`);
    logAiUsage({
      feature: "auto_publish",
      model: aiConfig.model,
      status: "success",
      actor: "cron",
      metadata: { articleId: article.id, topic, slug, hasCover: !!coverImage },
      logging: aiSettings.usageLogging,
    });

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
    logAiUsage({
      feature: "auto_publish",
      model:   aiConfig.model,
      status:  "error",
      actor:   "cron",
      error:   err instanceof Error ? err.message : "Unknown error",
      logging: aiSettings.usageLogging,
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
