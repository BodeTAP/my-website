import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import Anthropic from "@anthropic-ai/sdk";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

/** Gunakan Claude untuk menerjemahkan topik Bahasa Indonesia → keyword Inggris yang visual-friendly untuk Pexels */
async function translateToVisualKeyword(topic: string): Promise<string> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 60,
      system: `You are a visual keyword specialist. 
Given an Indonesian article topic, return ONLY 2-3 short English keywords that best represent a relevant stock photo for that topic.
Focus on visual elements (objects, people, settings), not abstract concepts.
Example: "Cara Meningkatkan Penjualan UMKM" → "small business owner shop indonesia"
Return ONLY the keywords, nothing else.`,
      messages: [{ role: "user", content: topic }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    return text || topic;
  } catch {
    // Fallback ke keyword asli jika Claude gagal
    return topic;
  }
}

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Mode Upload: upload photoUrl ke Vercel Blob
    if (body.photoUrl) {
      const res = await fetch(body.photoUrl);
      const buffer = await res.arrayBuffer();
      const contentType = res.headers.get("content-type") || "image/jpeg";
      const ext = contentType.split("/")[1] || "jpg";
      const filename = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const blob = await put(filename, buffer, {
        access: "public",
        contentType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return NextResponse.json({ url: blob.url });
    }

    // Mode Cari: terjemahkan topik ke keyword Inggris visual, lalu query Pexels
    const { title, query } = body;
    const rawKeyword = query || title;
    if (!rawKeyword) return NextResponse.json({ error: "Query atau judul diperlukan" }, { status: 400 });

    // Terjemahkan ke Bahasa Inggris yang visual-friendly
    const englishKeyword = await translateToVisualKeyword(rawKeyword);
    console.log(`[AI-Cover] Keyword: "${rawKeyword}" → "${englishKeyword}"`);

    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(englishKeyword)}&per_page=9&orientation=landscape`,
      {
        headers: { Authorization: process.env.PEXELS_API_KEY || "" },
      }
    );

    const data = await pexelsRes.json();
    const photos = (data.photos ?? []).map((p: any) => ({
      id:           p.id,
      url:          p.src.medium,
      photographer: p.photographer,
      pexelsUrl:    p.url,
      keyword:      englishKeyword, // Sertakan keyword yang digunakan untuk debugging
    }));

    return NextResponse.json(photos);
  } catch (err) {
    console.error("[AI-Cover]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
