import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

const PRIVATE_HOST_RE = [
  /^localhost$/i, /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^169\.254\./,
];

export type MetaResult = {
  url:         string;
  title:       string | null;
  description: string | null;
  og: { title: string | null; description: string | null; image: string | null; siteName: string | null; type: string | null };
  twitter: { card: string | null; title: string | null; description: string | null; image: string | null };
  canonical:   string | null;
  favicon:     string | null;
  robots:      string | null;
};

function get(html: string, patterns: RegExp[]): string | null {
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return null;
}

function parseMetaTags(html: string, baseUrl: string): MetaResult {
  const url = baseUrl;

  const title = get(html, [/<title[^>]*>([\s\S]*?)<\/title>/i]);
  const description = get(html, [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
  ]);

  const ogProp = (prop: string) => get(html, [
    new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']*)`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, "i"),
  ]);

  const twProp = (prop: string) => get(html, [
    new RegExp(`<meta[^>]+name=["']twitter:${prop}["'][^>]+content=["']([^"']*)`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:${prop}["']`, "i"),
  ]);

  const canonical = get(html, [
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i,
  ]);

  const faviconRaw = get(html, [
    /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i,
  ]);

  // Resolve favicon to absolute URL
  let favicon: string | null = null;
  if (faviconRaw) {
    try {
      favicon = new URL(faviconRaw, baseUrl).toString();
    } catch { favicon = faviconRaw; }
  }

  const robots = get(html, [/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/i]);

  return {
    url, title, description,
    og: { title: ogProp("title"), description: ogProp("description"), image: ogProp("image"), siteName: ogProp("site_name"), type: ogProp("type") },
    twitter: { card: twProp("card"), title: twProp("title"), description: twProp("description"), image: twProp("image") },
    canonical, favicon, robots,
  };
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = rateLimit(`metatags:${ip}`, 5, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });

  const { url: rawUrl } = await req.json().catch(() => ({ url: "" })) as { url?: string };
  if (!rawUrl?.trim()) return NextResponse.json({ error: "URL diperlukan" }, { status: 400 });

  let parsed: URL;
  try { parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`); }
  catch { return NextResponse.json({ error: "URL tidak valid" }, { status: 400 }); }

  if (!["http:", "https:"].includes(parsed.protocol)) return NextResponse.json({ error: "Hanya HTTP/HTTPS" }, { status: 400 });
  if (PRIVATE_HOST_RE.some(r => r.test(parsed.hostname))) return NextResponse.json({ error: "URL tidak dapat diakses" }, { status: 400 });

  try {
    const res = await fetch(parsed.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MFWEBBot/1.0)", Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) return NextResponse.json({ error: `Server mengembalikan HTTP ${res.status}` }, { status: 400 });

    const html = (await res.text()).slice(0, 300_000);
    return NextResponse.json(parseMetaTags(html, res.url || parsed.toString()));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("abort") || msg.includes("timeout")) return NextResponse.json({ error: "Website tidak merespons" }, { status: 408 });
    return NextResponse.json({ error: "Tidak dapat mengakses website" }, { status: 400 });
  }
}
