import { NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export async function GET(req: Request) {
  const ip = getClientIP(req);
  const { allowed } = rateLimit(`domain:${ip}`, 30, 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "Query domain diperlukan" }, { status: 400 });
  }

  const domain = q.includes(".") ? q.toLowerCase() : `${q.toLowerCase()}.com`;

  try {
    // RDAP — protokol resmi ICANN, gratis, tanpa API key
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (res.status === 404) {
      return NextResponse.json({ domain, available: true });
    }

    if (res.ok) {
      return NextResponse.json({ domain, available: false });
    }

    throw new Error(`RDAP status ${res.status}`);
  } catch {
    return NextResponse.json({ error: "Gagal mengecek ketersediaan domain" }, { status: 502 });
  }
}
