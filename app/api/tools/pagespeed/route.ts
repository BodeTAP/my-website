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

type CachedResult = {
  score: number;
  metrics: Record<string, { value: string; numericValue: number }>;
  opportunities: { title: string; description: string; displayValue?: string }[];
  url: string;
  strategy: string;
};

// In-memory cache: 1 hour TTL per URL+strategy
const cache = new Map<string, { data: CachedResult; expiresAt: number }>();

function getCached(key: string): CachedResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key: string, data: CachedResult) {
  cache.set(key, { data, expiresAt: Date.now() + 60 * 60 * 1000 }); // 1 hour
}

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

  // Return cached result if available
  const cacheKey = `${strategy}:${targetUrl}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  const apiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(targetUrl)}&strategy=${strategy}&category=performance` +
    (apiKey ? `&key=${apiKey}` : "");

  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(35_000) });
    const data = await res.json() as {
      error?: { message: string; code?: number; status?: string };
      lighthouseResult?: {
        categories: Record<string, { score: number }>;
        audits: Record<string, LighthouseAudit>;
      };
    };

    if (!res.ok) {
      const errMsg = data.error?.message ?? "";
      const isQuota = errMsg.toLowerCase().includes("quota") || res.status === 429;
      return NextResponse.json(
        {
          error: isQuota
            ? "Kuota API hari ini habis. Coba lagi besok, atau cek langsung di Google PageSpeed Insights."
            : errMsg || "Gagal mengambil data dari PageSpeed API",
          quotaExceeded: isQuota,
          directUrl: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(targetUrl)}&form_factor=${strategy}`,
        },
        { status: 400 }
      );
    }

    const cats = data.lighthouseResult?.categories ?? {};
    const audits = data.lighthouseResult?.audits ?? {};
    const score = Math.round((cats.performance?.score ?? 0) * 100);

    const m = (id: string) => ({
      value: audits[id]?.displayValue ?? "–",
      numericValue: audits[id]?.numericValue ?? 0,
    });

    const result: CachedResult = {
      score,
      metrics: {
        fcp:  m("first-contentful-paint"),
        lcp:  m("largest-contentful-paint"),
        tbt:  m("total-blocking-time"),
        cls:  m("cumulative-layout-shift"),
        si:   m("speed-index"),
        ttfb: m("server-response-time"),
      },
      opportunities: Object.values(audits)
        .filter((a) => a.score !== null && a.score < 0.9 && a.details?.type === "opportunity")
        .slice(0, 5)
        .map((a) => ({ title: a.title, description: a.description, displayValue: a.displayValue })),
      url: targetUrl,
      strategy,
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
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
