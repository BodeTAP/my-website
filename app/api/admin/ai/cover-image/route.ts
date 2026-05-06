import { NextRequest, NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { translateToVisualKeyword, uploadPhotoToBlob } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

// In-memory cache for Pexels search results — 1 hour TTL
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
  const { allowed } = await rateLimit(`ai-cover:${session!.user!.email}`, 30, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Terlalu banyak request AI. Coba lagi dalam 1 jam." }, { status: 429 });

  try {
    const body = await req.json();
    const { title, query, photoUrl } = body;

    // Mode Upload: upload photoUrl ke Vercel Blob
    if (photoUrl) {
      const url = await uploadPhotoToBlob(photoUrl, "covers");
      if (!url) return NextResponse.json({ error: "Gagal mengupload gambar" }, { status: 500 });
      return NextResponse.json({ url });
    }

    // Mode Cari: terjemahkan topik ke keyword Inggris visual, lalu query Pexels
    if (!photoUrl && !title && !query) return NextResponse.json({ error: "Query atau judul diperlukan." }, { status: 400 });
    const rawKeyword = (query || title || "").slice(0, 300);

    const englishKeyword = await translateToVisualKeyword(rawKeyword);
    console.log(`[AI-Cover] "${rawKeyword}" → "${englishKeyword}"`);

    const cacheKey = `pexels:${englishKeyword}`;
    const cached = getPexelsCache(cacheKey);
    if (cached) return NextResponse.json(cached);

    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(englishKeyword)}&per_page=9&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY || "" } }
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
    return NextResponse.json(photos);
  } catch (err) {
    console.error("[AI-Cover]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
