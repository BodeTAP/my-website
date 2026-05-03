import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export const runtime = "nodejs";

const PRIVATE_HOST_RE = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^0\.0\.0\.0$/,
];

type Status = "pass" | "warn" | "fail";
type Check = {
  id: string;
  label: string;
  status: Status;
  detail: string;
  points: number;
  maxPoints: number;
};

function analyzeSEO(html: string, url: string): { score: number; url: string; checks: Check[] } {
  const checks: Check[] = [];
  let totalPoints = 0;
  let maxPoints = 0;

  function add(id: string, label: string, mp: number, status: Status, detail: string, pts?: number) {
    const earned = pts !== undefined ? pts : status === "pass" ? mp : 0;
    totalPoints += earned;
    maxPoints += mp;
    checks.push({ id, label, status, detail, points: earned, maxPoints: mp });
  }

  // 1. Title
  const titleRaw = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.replace(/<[^>]+>/g, "").trim() ?? null;
  const tl = titleRaw?.length ?? 0;
  if (!titleRaw)       add("title", "Tag Title", 10, "fail", "Tag <title> tidak ditemukan");
  else if (tl < 30 || tl > 70) add("title", "Tag Title", 10, "warn", `Panjang ${tl} karakter (optimal: 50–60)`, 6);
  else                 add("title", "Tag Title", 10, "pass", `"${titleRaw.slice(0, 55)}${tl > 55 ? "…" : ""}" (${tl} karakter)`);

  // 2. Meta description
  const desc =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1] ?? null;
  const dl = desc?.trim().length ?? 0;
  if (!desc)           add("meta-desc", "Meta Description", 10, "fail", "Meta description tidak ditemukan");
  else if (dl < 100 || dl > 170) add("meta-desc", "Meta Description", 10, "warn", `Panjang ${dl} karakter (optimal: 120–160)`, 6);
  else                 add("meta-desc", "Meta Description", 10, "pass", `${dl} karakter — ideal`);

  // 3. H1
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1s.length === 0)     add("h1", "Tag H1", 10, "fail", "Tidak ada tag H1 di halaman");
  else if (h1s.length > 1)  add("h1", "Tag H1", 10, "warn", `${h1s.length} tag H1 ditemukan (seharusnya 1)`, 5);
  else {
    const t = h1s[0][1].replace(/<[^>]+>/g, "").trim();
    add("h1", "Tag H1", 10, "pass", `"${t.slice(0, 60)}${t.length > 60 ? "…" : ""}"`);
  }

  // 4. H2
  const h2s = [...html.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/gi)];
  if (h2s.length === 0) add("h2", "Tag H2", 5, "warn", "Tidak ada tag H2 — struktur heading kurang optimal", 0);
  else                  add("h2", "Tag H2", 5, "pass", `${h2s.length} tag H2 ditemukan`);

  // 5. Image alt text
  const allImgs = [...html.matchAll(/<img[^>]+>/gi)];
  const altImgs = allImgs.filter((m) => /alt=["'][^"']+["']/i.test(m[0]));
  if (allImgs.length === 0) {
    add("img-alt", "Alt Text Gambar", 10, "pass", "Tidak ada gambar di halaman");
  } else {
    const ratio = altImgs.length / allImgs.length;
    if (ratio === 1)       add("img-alt", "Alt Text Gambar", 10, "pass", `Semua ${allImgs.length} gambar punya alt text`);
    else if (ratio >= 0.7) add("img-alt", "Alt Text Gambar", 10, "warn", `${altImgs.length}/${allImgs.length} gambar punya alt text`, 6);
    else                   add("img-alt", "Alt Text Gambar", 10, "fail", `Hanya ${altImgs.length}/${allImgs.length} gambar punya alt text`);
  }

  // 6. Canonical
  const canonical =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] ?? null;
  if (!canonical) add("canonical", "Canonical URL", 5, "warn", "Canonical URL tidak ditemukan", 0);
  else            add("canonical", "Canonical URL", 5, "pass", canonical.slice(0, 60));

  // 7. Robots
  const robots = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/i)?.[1] ?? null;
  if (robots && /noindex/i.test(robots))
    add("robots", "Meta Robots", 5, "fail", "Halaman di-noindex — tidak terindeks Google");
  else
    add("robots", "Meta Robots", 5, "pass", robots ?? "Default (index, follow)");

  // 8. Open Graph
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)/i)?.[1] ?? null;
  const ogDesc  = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)/i)?.[1] ?? null;
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)/i)?.[1] ?? null;
  const ogCount = [ogTitle, ogDesc, ogImage].filter(Boolean).length;
  if (ogCount === 3)      add("og", "Open Graph (OG)", 10, "pass", "og:title, og:description, og:image — lengkap");
  else if (ogCount > 0) {
    const miss = [!ogTitle && "og:title", !ogDesc && "og:description", !ogImage && "og:image"].filter(Boolean).join(", ");
    add("og", "Open Graph (OG)", 10, "warn", `${ogCount}/3 OG tags — kurang: ${miss}`, Math.round(10 * ogCount / 3));
  } else                  add("og", "Open Graph (OG)", 10, "fail", "Tidak ada OG tags — buruk untuk share sosmed");

  // 9. HTTPS
  if (url.startsWith("https://"))
    add("https", "HTTPS / SSL", 10, "pass", "Website menggunakan HTTPS ✓");
  else
    add("https", "HTTPS / SSL", 10, "fail", "Website tidak pakai HTTPS — berpengaruh pada peringkat SEO");

  // 10. Viewport
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  if (viewport) add("viewport", "Mobile Viewport", 5, "pass", "Meta viewport ditemukan — mobile-friendly");
  else          add("viewport", "Mobile Viewport", 5, "fail", "Tidak ada meta viewport — kemungkinan tidak mobile-friendly");

  // 11. Favicon
  const favicon = /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html);
  add("favicon", "Favicon", 5, favicon ? "pass" : "warn", favicon ? "Favicon ditemukan" : "Favicon tidak ditemukan", favicon ? 5 : 0);

  // 12. JSON-LD
  const jsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
  add("jsonld", "Structured Data (JSON-LD)", 5, jsonLd ? "pass" : "warn",
    jsonLd ? "Schema markup ditemukan" : "Tidak ada JSON-LD — rekomendasi: tambahkan schema", jsonLd ? 5 : 0);

  // 13. Word count
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wc = text.split(/\s+/).filter((w) => w.length > 2).length;
  if (wc >= 300)       add("content", "Panjang Konten", 5, "pass", `~${wc.toLocaleString()} kata terdeteksi`);
  else if (wc >= 100)  add("content", "Panjang Konten", 5, "warn", `~${wc} kata (disarankan min. 300 kata)`, 3);
  else                 add("content", "Panjang Konten", 5, "fail", `~${wc} kata — konten terlalu sedikit`);

  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  return { score, url, checks };
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const rl = await rateLimit(`seocheck:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi dalam 1 menit." },
      { status: 429 }
    );
  }

  let body: { url?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Request tidak valid" }, { status: 400 }); }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : null;
  if (!rawUrl) return NextResponse.json({ error: "URL diperlukan" }, { status: 400 });

  let parsed: URL;
  try { parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`); }
  catch { return NextResponse.json({ error: "URL tidak valid" }, { status: 400 }); }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Hanya URL HTTP/HTTPS yang diperbolehkan" }, { status: 400 });
  }
  if (PRIVATE_HOST_RE.some((r) => r.test(parsed.hostname))) {
    return NextResponse.json({ error: "URL tidak dapat diakses" }, { status: 400 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MFWEBBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "id,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Website mengembalikan HTTP ${res.status}` }, { status: 400 });
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html")) {
      return NextResponse.json({ error: "URL bukan halaman HTML" }, { status: 400 });
    }

    const rawHtml = await res.text();
    const html = rawHtml.slice(0, 500_000);
    const finalUrl = res.url || parsed.toString();

    return NextResponse.json(analyzeSEO(html, finalUrl));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("abort") || msg.includes("timeout")) {
      return NextResponse.json({ error: "Waktu habis — website tidak merespons" }, { status: 408 });
    }
    return NextResponse.json(
      { error: "Tidak dapat mengakses website. Pastikan URL benar dan website online." },
      { status: 400 }
    );
  }
}
