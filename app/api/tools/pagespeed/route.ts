import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export const runtime = "nodejs";

type LighthouseAudit = {
  score: number | null;
  title: string;
  description: string;
  numericValue?: number;
  displayValue?: string;
  details?: { type: string };
};

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = rateLimit(`pagespeed:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi dalam 1 menit." },
      { status: 429 }
    );
  }

  const rawUrl = req.nextUrl.searchParams.get("url");
  const strategy = req.nextUrl.searchParams.get("strategy") === "desktop" ? "desktop" : "mobile";

  if (!rawUrl) return NextResponse.json({ error: "URL diperlukan" }, { status: 400 });

  let targetUrl: string;
  try {
    const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    targetUrl = parsed.toString();
  } catch {
    return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
  }

  const key = process.env.GOOGLE_PAGESPEED_API_KEY;
  const apiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(targetUrl)}&strategy=${strategy}&category=performance` +
    (key ? `&key=${key}` : "");

  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(35_000) });
    const data = await res.json() as {
      error?: { message: string };
      lighthouseResult?: {
        categories: Record<string, { score: number }>;
        audits: Record<string, LighthouseAudit>;
      };
    };

    if (!res.ok) {
      const msg = data.error?.message ?? "Gagal mengambil data dari PageSpeed API";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const cats = data.lighthouseResult?.categories ?? {};
    const audits = data.lighthouseResult?.audits ?? {};

    const score = Math.round((cats.performance?.score ?? 0) * 100);

    const m = (id: string) => ({
      value: audits[id]?.displayValue ?? "–",
      numericValue: audits[id]?.numericValue ?? 0,
    });

    const metrics = {
      fcp:  m("first-contentful-paint"),
      lcp:  m("largest-contentful-paint"),
      tbt:  m("total-blocking-time"),
      cls:  m("cumulative-layout-shift"),
      si:   m("speed-index"),
      ttfb: m("server-response-time"),
    };

    const opportunities = Object.values(audits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.details?.type === "opportunity")
      .slice(0, 5)
      .map((a) => ({ title: a.title, description: a.description, displayValue: a.displayValue }));

    return NextResponse.json({ score, metrics, opportunities, url: targetUrl, strategy });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("abort") || msg.includes("timeout")) {
      return NextResponse.json(
        { error: "Waktu habis — website mungkin sangat lambat atau tidak bisa diakses" },
        { status: 408 }
      );
    }
    return NextResponse.json({ error: "Gagal menghubungi API. Coba lagi." }, { status: 500 });
  }
}
