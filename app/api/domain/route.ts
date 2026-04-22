import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "Query domain diperlukan" }, { status: 400 });
  }

  // Normalize domain: jika tidak ada ekstensi, tambahkan .com
  const domain = q.includes(".") ? q.toLowerCase() : `${q.toLowerCase()}.com`;

  try {
    const apiKey = process.env.DOMAINR_API_KEY;

    if (!apiKey) {
      // Fallback simulasi jika API key belum diisi (untuk development)
      const available = !["google", "facebook", "youtube", "tokopedia"].some((d) =>
        domain.includes(d)
      );
      return NextResponse.json({ domain, available });
    }

    const res = await fetch(
      `https://domainr.p.rapidapi.com/v2/status?domain=${encodeURIComponent(domain)}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "domainr.p.rapidapi.com",
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) throw new Error("Gagal mengecek domain dari API");

    const data = await res.json();
    const statusStr: string = data?.status?.[0]?.status ?? "";
    const available = statusStr.includes("undelegated") || statusStr.includes("inactive") || statusStr === "";

    return NextResponse.json({ domain, available });
  } catch {
    return NextResponse.json({ error: "Gagal mengecek ketersediaan domain" }, { status: 502 });
  }
}
