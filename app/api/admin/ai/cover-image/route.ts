import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { translateToVisualKeyword, uploadPhotoToBlob } from "@/lib/ai";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Mode Upload: upload photoUrl ke Vercel Blob
    if (body.photoUrl) {
      const url = await uploadPhotoToBlob(body.photoUrl, "covers");
      if (!url) return NextResponse.json({ error: "Gagal mengupload gambar" }, { status: 500 });
      return NextResponse.json({ url });
    }

    // Mode Cari: terjemahkan topik ke keyword Inggris visual, lalu query Pexels
    const { title, query } = body;
    const rawKeyword = query || title;
    if (!rawKeyword) return NextResponse.json({ error: "Query atau judul diperlukan" }, { status: 400 });

    const englishKeyword = await translateToVisualKeyword(rawKeyword);
    console.log(`[AI-Cover] "${rawKeyword}" → "${englishKeyword}"`);

    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(englishKeyword)}&per_page=9&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY || "" } }
    );

    const data   = await pexelsRes.json();
    const photos = (data.photos ?? []).map((p: any) => ({
      id:           p.id,
      url:          p.src.medium,
      photographer: p.photographer,
      pexelsUrl:    p.url,
      keyword:      englishKeyword,
    }));

    return NextResponse.json(photos);
  } catch (err) {
    console.error("[AI-Cover]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
