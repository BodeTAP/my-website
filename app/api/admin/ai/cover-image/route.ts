import { NextRequest, NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { logAiUsage, translateToVisualKeyword, uploadPhotoToBlob } from "@/lib/ai";
import { getEnabledAiSettings } from "@/lib/aiSettings";
import { rateLimit } from "@/lib/rateLimit";

const pexelsCache = new Map<string, { data: unknown; expiresAt: number }>();
function getPexelsCache(key: string) {
  const entry = pexelsCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) { pexelsCache.delete(key); return null; }
  return entry.data;
}
function setPexelsCache(key: string, data: unknown) {
  pexelsCache.set(key, { data, expiresAt: Date.now() + 60 * 60 * 1000 });
}

type PexelsPhoto = { id: number; src: { medium: string }; photographer: string; url: string };

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;
  const session = await auth();
  const aiGate = await getEnabledAiSettings("coverImage");
  if (!aiGate.enabled) {
    logAiUsage({
      feature: "cover_image",
      model: aiGate.settings.features.coverImage.model,
      status: "blocked",
      actor: session!.user!.email,
      logging: aiGate.settings.usageLogging,
    });
    return aiGate.response;
  }

  const aiSettings = aiGate.settings;
  const aiConfig = aiSettings.features.coverImage;
  const { allowed } = await rateLimit(`ai-cover:${session!.user!.email}`, aiConfig.rateLimit, aiConfig.rateWindowMs);
  if (!allowed) return NextResponse.json({ error: "Terlalu banyak request AI. Coba lagi nanti." }, { status: 429 });

  try {
    const body = await req.json();
    const { title, query, photoUrl } = body;

    if (photoUrl) {
      const url = await uploadPhotoToBlob(photoUrl, aiSettings.coverBlobPrefix);
      if (!url) return NextResponse.json({ error: "Gagal mengupload gambar" }, { status: 500 });
      return NextResponse.json({ url });
    }

    if (!title && !query) return NextResponse.json({ error: "Query atau judul diperlukan." }, { status: 400 });
    const rawKeyword = String(query || title || "").slice(0, 300);
    const englishKeyword = await translateToVisualKeyword(rawKeyword, aiSettings);
    console.log(`[AI-Cover] "${rawKeyword}" -> "${englishKeyword}"`);

    const cacheKey = `pexels:${englishKeyword}:${aiSettings.coverPexelsPerPage}:${aiSettings.coverOrientation}`;
    const cached = getPexelsCache(cacheKey);
    if (cached) return NextResponse.json(cached);

    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(englishKeyword)}&per_page=${aiSettings.coverPexelsPerPage}&orientation=${encodeURIComponent(aiSettings.coverOrientation)}`,
      { headers: { Authorization: process.env.PEXELS_API_KEY || "" } },
    );

    const data = await pexelsRes.json();
    const photos = ((data as { photos?: PexelsPhoto[] }).photos ?? []).map((p) => ({
      id:           p.id,
      url:          p.src.medium,
      photographer: p.photographer,
      pexelsUrl:    p.url,
      keyword:      englishKeyword,
    }));

    setPexelsCache(cacheKey, photos);
    logAiUsage({
      feature: "cover_image",
      model: aiConfig.model,
      status: "success",
      actor: session!.user!.email,
      metadata: { resultCount: photos.length },
      logging: aiSettings.usageLogging,
    });
    return NextResponse.json(photos);
  } catch (err) {
    console.error("[AI-Cover]", err);
    logAiUsage({
      feature: "cover_image",
      model: aiConfig.model,
      status: "error",
      actor: session!.user!.email,
      error: err instanceof Error ? err.message : "Unknown error",
      logging: aiSettings.usageLogging,
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
