import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Scenario 2: Upload photoUrl to Blob
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

    // Scenario 1: Search Pexels
    const { title, query } = body;
    let keyword = query;

    if (!keyword && title) {
      keyword = title.split(/\s+/).filter((w: string) => w.length > 3).slice(0, 3).join(" ");
    }

    if (!keyword) return NextResponse.json({ error: "Query atau judul diperlukan" }, { status: 400 });

    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=9&orientation=landscape`,
      {
        headers: { Authorization: process.env.PEXELS_API_KEY || "" },
      }
    );

    const data = await pexelsRes.json();
    const photos = data.photos.map((p: any) => ({
      id: p.id,
      url: p.src.medium,
      photographer: p.photographer,
      pexelsUrl: p.url,
    }));

    return NextResponse.json(photos);
  } catch (err) {
    console.error("[AI-Cover]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
