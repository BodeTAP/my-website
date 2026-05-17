import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deductCredits, getClientBalance } from "@/lib/credits";
import { rateLimit } from "@/lib/rateLimit";
import { getToolSettings } from "@/lib/toolSettings";
import { normalizePhone } from "@/lib/whatsapp";
import {
  executeLeadFinderSearch,
  type PlaceLead,
  type SocialPlatform,
  type SocialScanStatus,
  type SocialLinks,
  type SocialScanResult,
} from "@/lib/tools/leadFinderCore";

export const runtime = "nodejs";

export type { PlaceLead, SocialPlatform, SocialScanStatus, SocialLinks, SocialScanResult };

type SearchMode = "standard" | "deep";

const SOCIAL_SCAN_COST_FALLBACK = 10;
const SOCIAL_SCAN_CACHE_DAYS = 30;
const SOCIAL_SCAN_TIMEOUT_MS = 10000;
const SOCIAL_SCAN_CONCURRENCY = 5;
const SOCIAL_SCAN_MAX_WEBSITES = 80;
const SOCIAL_SCAN_MAX_BYTES = 512 * 1024;

const SOCIAL_DOMAINS: Record<SocialPlatform, RegExp> = {
  instagram: /(^|\.)instagram\.com$/i,
  facebook: /(^|\.)facebook\.com$/i,
  tiktok: /(^|\.)tiktok\.com$/i,
  linkedin: /(^|\.)linkedin\.com$/i,
  youtube: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i,
  x: /(^|\.)x\.com$|(^|\.)twitter\.com$/i,
};

const SOCIAL_SCAN_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
} as const;

function emptySocialScan(status: SocialScanStatus, error?: string): SocialScanResult {
  return { status, links: {}, ...(error ? { error } : {}) };
}

function normalizeWebsiteUrl(value: string | null | undefined) {
  if (!value) return null;

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    parsed.hash = "";
    parsed.search = "";
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return parsed.toString();
  } catch {
    return null;
  }
}

function getHostnameWithOptionalWww(websiteUrl: string) {
  const parsed = new URL(websiteUrl);
  if (parsed.hostname.startsWith("www.")) return null;

  parsed.hostname = `www.${parsed.hostname}`;
  return parsed.toString();
}

function getErrorMessage(err: unknown) {
  if (!(err instanceof Error)) return "Gagal scan website";
  if (err.name === "TimeoutError" || err.name === "AbortError") return `Timeout ${Math.round(SOCIAL_SCAN_TIMEOUT_MS / 1000)} detik`;
  if ("code" in err && typeof err.code === "string") return err.code;
  if (err.message) return err.message.slice(0, 120);
  return "Gagal scan website";
}

function isPrivateIpAddress(address: string) {
  if (address === "::1") return true;
  if (address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:")) return true;

  const parts = address.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return false;

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 0
  );
}

async function assertPublicWebsiteUrl(websiteUrl: string) {
  const parsed = new URL(websiteUrl);
  const hostname = parsed.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Host lokal tidak boleh discan");
  }

  if (isIP(hostname)) {
    if (isPrivateIpAddress(hostname)) throw new Error("IP private tidak boleh discan");
    return;
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  if (records.some((record) => isPrivateIpAddress(record.address))) {
    throw new Error("Host private tidak boleh discan");
  }
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#47;/g, "/")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function platformFromUrl(rawUrl: string): SocialPlatform | null {
  try {
    const host = new URL(rawUrl).hostname.replace(/^www\./, "");
    for (const [platform, pattern] of Object.entries(SOCIAL_DOMAINS) as Array<[SocialPlatform, RegExp]>) {
      if (pattern.test(host)) return platform;
    }
  } catch {
    return null;
  }

  return null;
}

function socialScanFromDirectSocialUrl(rawUrl: string): SocialScanResult | null {
  const platform = platformFromUrl(rawUrl);
  if (!platform) return null;

  const links: SocialLinks = {};
  links[platform] = rawUrl;
  return { status: "FOUND", links };
}

function normalizeSocialUrl(rawUrl: string, baseUrl: string) {
  try {
    const parsed = new URL(decodeHtmlEntities(rawUrl), baseUrl);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function extractSocialLinks(html: string, websiteUrl: string): SocialLinks {
  const links: SocialLinks = {};
  const hrefPattern = /\bhref\s*=\s*["']([^"']+)["']/gi;
  const rawSocialPattern = /https?:\/\/(?:www\.)?(?:instagram\.com|facebook\.com|tiktok\.com|linkedin\.com|youtube\.com|youtu\.be|x\.com|twitter\.com)\/[^\s"'<>)]*/gi;
  const candidates = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = hrefPattern.exec(html)) !== null) {
    candidates.add(match[1]);
  }

  while ((match = rawSocialPattern.exec(html)) !== null) {
    candidates.add(match[0]);
  }

  for (const candidate of candidates) {
    const normalized = normalizeSocialUrl(candidate, websiteUrl);
    if (!normalized) continue;

    const platform = platformFromUrl(normalized);
    if (!platform || links[platform]) continue;

    links[platform] = normalized;
  }

  return links;
}

async function readLimitedText(res: Response) {
  const reader = res.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > SOCIAL_SCAN_MAX_BYTES) break;
    chunks.push(value);
  }

  return new TextDecoder().decode(Buffer.concat(chunks));
}

function socialLinksFromCache(value: unknown): SocialLinks {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const links: SocialLinks = {};

  for (const platform of Object.keys(SOCIAL_DOMAINS) as SocialPlatform[]) {
    const url = (value as Record<string, unknown>)[platform];
    if (typeof url === "string") links[platform] = url;
  }

  return links;
}

function getSocialScanCacheDelegate() {
  return (prisma as unknown as {
    leadFinderSocialScanCache?: {
      findFirst: (args: {
        where: { websiteUrl: string; scannedAt: { gte: Date } };
        select: { socialLinks: true; status: true; error: true };
      }) => Promise<{ socialLinks: unknown; status: string; error: string | null } | null>;
      upsert: (args: {
        where: { websiteUrl: string };
        update: { socialLinks: SocialLinks; status: SocialScanStatus; error: string | null; scannedAt: Date };
        create: { websiteUrl: string; socialLinks: SocialLinks; status: SocialScanStatus; error: string | null };
      }) => Promise<unknown>;
    };
  }).leadFinderSocialScanCache;
}

async function scanWebsiteSocialLinks(websiteUrl: string): Promise<SocialScanResult> {
  const normalizedUrl = normalizeWebsiteUrl(websiteUrl);
  if (!normalizedUrl) return emptySocialScan("FAILED", "URL website tidak valid");

  const directSocialScan = socialScanFromDirectSocialUrl(normalizedUrl);
  if (directSocialScan) return directSocialScan;

  const cacheAfter = new Date(Date.now() - SOCIAL_SCAN_CACHE_DAYS * 24 * 60 * 60 * 1000);
  const cache = getSocialScanCacheDelegate();
  const cached = cache
    ? await cache.findFirst({
        where: {
          websiteUrl: normalizedUrl,
          scannedAt: { gte: cacheAfter },
        },
        select: { socialLinks: true, status: true, error: true },
      }).catch((err) => {
        console.warn("[PortalLeadFinder] Social scan cache read failed", err);
        return null;
      })
    : null;

  if (cached) {
    return {
      status: cached.status as SocialScanStatus,
      links: socialLinksFromCache(cached.socialLinks),
      ...(cached.error ? { error: cached.error } : {}),
    };
  }

  let result: SocialScanResult | null = null;

  const scanUrls = [normalizedUrl, getHostnameWithOptionalWww(normalizedUrl)].filter(Boolean) as string[];
  const errors: string[] = [];

  for (const scanUrl of scanUrls) {
    try {
      await assertPublicWebsiteUrl(scanUrl);

      const res = await fetch(scanUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(SOCIAL_SCAN_TIMEOUT_MS),
        headers: SOCIAL_SCAN_HEADERS,
      });

      if (!res.ok) {
        errors.push(`${new URL(scanUrl).hostname}: HTTP ${res.status}`);
        continue;
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        errors.push(`${new URL(scanUrl).hostname}: Konten bukan HTML`);
        continue;
      }

      const finalUrl = res.url || scanUrl;
      const html = await readLimitedText(res);
      const links = extractSocialLinks(html, finalUrl);
      result = {
        status: Object.keys(links).length > 0 ? "FOUND" : "NOT_FOUND",
        links,
      };
      break;
    } catch (err) {
      errors.push(`${new URL(scanUrl).hostname}: ${getErrorMessage(err)}`);
    }
  }

  if (!result) {
    result = emptySocialScan("FAILED", errors.slice(0, 2).join("; ") || "Gagal scan website");
  }

  if (cache) {
    await cache.upsert({
      where: { websiteUrl: normalizedUrl },
      update: {
        socialLinks: result.links,
        status: result.status,
        error: result.error ?? null,
        scannedAt: new Date(),
      },
      create: {
        websiteUrl: normalizedUrl,
        socialLinks: result.links,
        status: result.status,
        error: result.error ?? null,
      },
    }).catch((err) => {
      console.warn("[PortalLeadFinder] Social scan cache write failed", err);
    });
  }

  return result;
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
) {
  const results: R[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await task(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function attachSocialScans(places: PlaceLead[], enabled: boolean) {
  if (!enabled) return { scanned: 0, skipped: 0 };

  const websitePlaces = places.filter((place) => place.website);
  const scanTargets = websitePlaces.slice(0, SOCIAL_SCAN_MAX_WEBSITES);
  const skipped = Math.max(0, websitePlaces.length - scanTargets.length);

  for (const place of places) {
    if (!place.website) place.socialScan = emptySocialScan("NO_WEBSITE");
  }
  for (const place of websitePlaces.slice(SOCIAL_SCAN_MAX_WEBSITES)) {
    place.socialScan = emptySocialScan("SKIPPED", "Batas scan tercapai");
  }

  const results = await runWithConcurrency(scanTargets, SOCIAL_SCAN_CONCURRENCY, async (place) => ({
    place,
    result: await scanWebsiteSocialLinks(place.website!),
  }));

  for (const { place, result } of results) {
    place.socialScan = result;
  }

  return { scanned: scanTargets.length, skipped };
}

async function getSessionClient() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, clientId: null, email: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });

  if (!user?.client) return { status: 404 as const, clientId: null, email: session.user.email };
  return { status: 200 as const, clientId: user.client.id, email: session.user.email };
}

export async function POST(req: NextRequest) {
  const { status, clientId, email } = await getSessionClient();
  if (!clientId) {
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Client not found" },
      { status },
    );
  }

  const { allowed, retryAfterMs } = await rateLimit(`portal:lead-finder:${email ?? clientId}`, 20, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak pencarian. Coba lagi dalam ${Math.ceil(retryAfterMs / 60000)} menit.` },
      { status: 429 },
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY belum dikonfigurasi" }, { status: 503 });

  try {
    const { query, city = "", mode = "standard", socialScan = false } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query tidak boleh kosong" }, { status: 400 });

    const searchMode: SearchMode = mode === "deep" ? "deep" : "standard";
    const requestedSocialScan = socialScan === true;
    const toolSettings = await getToolSettings();
    if (!toolSettings.leadFinder.enabled) {
      return NextResponse.json({ error: "Lead Finder sedang nonaktif." }, { status: 503 });
    }
    if (requestedSocialScan && !toolSettings.leadFinder.socialScanEnabled) {
      return NextResponse.json({ error: "Social Scan sedang nonaktif." }, { status: 503 });
    }
    const shouldScanSocial = requestedSocialScan && toolSettings.leadFinder.socialScanEnabled;
    const baseCreditCost = searchMode === "deep" ? toolSettings.leadFinder.deepCost : toolSettings.leadFinder.standardCost;
    const socialScanCost = toolSettings.leadFinder.socialScanCost ?? SOCIAL_SCAN_COST_FALLBACK;
    const creditCost = baseCreditCost + (shouldScanSocial ? socialScanCost : 0);
    const balance = await getClientBalance(clientId);
    if (balance < creditCost) {
      return NextResponse.json({ error: "Kredit tidak cukup", balance, requiredCredits: creditCost }, { status: 402 });
    }

    // Use extracted core logic for the search
    const searchResult = await executeLeadFinderSearch({
      query: query.trim(),
      city: city.trim(),
      mode: searchMode,
    });

    const { places, rawTotal, searchQueries, usedBias, fullQuery } = searchResult;

    // Apply phoneNorm using normalizePhone (stays in route for alreadySaved check)
    for (const place of places) {
      if (place.phone) {
        place.phoneNorm = normalizePhone(place.phone);
      }
    }

    // Social scan (stays in route)
    const socialScanStats = await attachSocialScans(places, shouldScanSocial);

    // alreadySaved check (stays in route)
    const phones = places.map((p) => p.phoneNorm).filter(Boolean);
    if (phones.length > 0) {
      const existing = await prisma.lead.findMany({
        where: { whatsapp: { in: phones } },
        select: { whatsapp: true },
      });
      const savedPhones = new Set(existing.map((e) => e.whatsapp));
      for (const p of places) {
        if (p.phoneNorm && savedPhones.has(p.phoneNorm)) p.alreadySaved = true;
      }
    }

    const deductResult = await deductCredits(
      clientId,
      creditCost,
      "lead_finder",
      searchMode === "deep" ? `Deep Search: ${fullQuery}` : `Search: ${fullQuery}`,
      {
        query,
        city,
        mode: searchMode,
        results: places.length,
        rawTotal,
        searchQueries,
        socialScan: shouldScanSocial,
        socialScanStats,
      },
    );

    if (!deductResult.ok) {
      return NextResponse.json(
        { error: deductResult.error ?? "Kredit tidak cukup", balance: deductResult.newBalance },
        { status: 402 },
      );
    }

    return NextResponse.json({
      places,
      balance: deductResult.newBalance,
      total: places.length,
      fullQuery,
      mode: searchMode,
      creditCost,
      baseCreditCost,
      socialScanCost: shouldScanSocial ? socialScanCost : 0,
      socialScan: shouldScanSocial,
      socialScanStats,
      searchQueries,
      rawTotal,
      usedBias,
    });
  } catch (err) {
    console.error("[PortalLeadFinder]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
