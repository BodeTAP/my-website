import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deductCredits, getClientBalance } from "@/lib/credits";
import { rateLimit } from "@/lib/rateLimit";
import { getToolSettings } from "@/lib/toolSettings";
import { normalizePhone } from "@/lib/whatsapp";

export const runtime = "nodejs";

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "linkedin" | "youtube" | "x";
export type SocialScanStatus = "NOT_REQUESTED" | "NO_WEBSITE" | "FOUND" | "NOT_FOUND" | "FAILED" | "SKIPPED";
export type SocialLinks = Partial<Record<SocialPlatform, string>>;
export type SocialScanResult = {
  status: SocialScanStatus;
  links: SocialLinks;
  error?: string;
};

export type PlaceLead = {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  phoneNorm: string;
  website: string | null;
  category: string;
  hasWebsite: boolean;
  alreadySaved: boolean;
  rating: number | null;
  ratingCount: number | null;
  businessStatus: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY" | null;
  isOpen: boolean | null;
  socialScan: SocialScanResult;
};

type SearchMode = "standard" | "deep";
type SearchPlan = {
  fullQuery: string;
  coords: { lat: number; lng: number } | null;
  pages: number;
};

const PAGE_SIZE = 20;
const STANDARD_MAX_PAGES = 3;
const DEEP_RESULT_CAP = 240;
const DEEP_PLAN_CAP = 18;
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

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "jakarta": { lat: -6.2088, lng: 106.8456 },
  "jakarta selatan": { lat: -6.2615, lng: 106.8106 },
  "jakarta utara": { lat: -6.1381, lng: 106.8451 },
  "jakarta barat": { lat: -6.1675, lng: 106.7637 },
  "jakarta timur": { lat: -6.2250, lng: 106.9004 },
  "jakarta pusat": { lat: -6.1862, lng: 106.8340 },
  "bandung": { lat: -6.9175, lng: 107.6191 },
  "surabaya": { lat: -7.2575, lng: 112.7521 },
  "medan": { lat: 3.5952, lng: 98.6722 },
  "semarang": { lat: -6.9932, lng: 110.4203 },
  "makassar": { lat: -5.1477, lng: 119.4327 },
  "palembang": { lat: -2.9761, lng: 104.7754 },
  "tangerang": { lat: -6.1783, lng: 106.6319 },
  "depok": { lat: -6.4025, lng: 106.7942 },
  "bekasi": { lat: -6.2383, lng: 106.9756 },
  "bogor": { lat: -6.5971, lng: 106.8060 },
  "yogyakarta": { lat: -7.7956, lng: 110.3695 },
  "solo": { lat: -7.5755, lng: 110.8243 },
  "malang": { lat: -7.9797, lng: 112.6304 },
  "denpasar": { lat: -8.6705, lng: 115.2126 },
  "bali": { lat: -8.3405, lng: 115.0920 },
  "kuta": { lat: -8.7215, lng: 115.1685 },
  "seminyak": { lat: -8.6897, lng: 115.1609 },
  "ubud": { lat: -8.5069, lng: 115.2625 },
  "canggu": { lat: -8.6478, lng: 115.1385 },
  "sanur": { lat: -8.7058, lng: 115.2620 },
  "nusa dua": { lat: -8.7997, lng: 115.2320 },
  "gianyar": { lat: -8.5352, lng: 115.3314 },
  "tabanan": { lat: -8.5407, lng: 115.1253 },
  "singaraja": { lat: -8.1120, lng: 115.0882 },
  "karangasem": { lat: -8.4537, lng: 115.6120 },
  "jimbaran": { lat: -8.7882, lng: 115.1607 },
  "balikpapan": { lat: -1.2675, lng: 116.8289 },
  "samarinda": { lat: -0.5022, lng: 117.1536 },
  "pontianak": { lat: -0.0263, lng: 109.3425 },
  "pekanbaru": { lat: 0.5071, lng: 101.4478 },
  "batam": { lat: 1.0456, lng: 104.0305 },
  "manado": { lat: 1.4748, lng: 124.8421 },
  "banjarmasin": { lat: -3.3194, lng: 114.5908 },
  "padang": { lat: -0.9471, lng: 100.4172 },
  "lampung": { lat: -5.4292, lng: 105.2613 },
  "cirebon": { lat: -6.7063, lng: 108.5570 },
  "tasikmalaya": { lat: -7.3274, lng: 108.2207 },
  "sukabumi": { lat: -6.9277, lng: 106.9300 },
  "cilegon": { lat: -6.0023, lng: 106.0052 },
  "serang": { lat: -6.1201, lng: 106.1503 },
};

function getCityCoords(query: string): { lat: number; lng: number } | null {
  const lower = query.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return null;
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function buildKeywordVariants(query: string) {
  const normalized = query.trim().toLowerCase();
  const variants = [query];

  if (normalized.includes("salon") || normalized.includes("kecantikan") || normalized.includes("beauty")) {
    variants.push("salon kecantikan", "beauty salon", "salon", "hair salon", "klinik kecantikan", "nail salon", "spa kecantikan");
  } else if (normalized.includes("restoran") || normalized.includes("makan") || normalized.includes("kuliner")) {
    variants.push("restoran", "rumah makan", "warung makan", "tempat makan", "kuliner");
  } else if (normalized.includes("kafe") || normalized.includes("cafe") || normalized.includes("kopi")) {
    variants.push("kafe", "cafe", "coffee shop", "kedai kopi");
  } else if (normalized.includes("klinik") || normalized.includes("dokter")) {
    variants.push("klinik", "klinik kesehatan", "praktek dokter", "medical clinic");
  } else {
    variants.push(`${query} terdekat`, `${query} terbaik`, `${query} murah`);
  }

  return uniqueStrings(variants).slice(0, 7);
}

function buildAreaVariants(city: string) {
  const trimmed = city.trim();
  if (!trimmed) return [""];

  const normalized = trimmed.toLowerCase();
  const areaMap: Record<string, string[]> = {
    bandung: [
      "Bandung",
      "Kota Bandung",
      "Cimahi",
      "Kabupaten Bandung",
      "Bandung Barat",
      "Dago Bandung",
      "Setiabudi Bandung",
      "Buahbatu Bandung",
      "Antapani Bandung",
      "Cibiru Bandung",
    ],
    jakarta: ["Jakarta", "Jakarta Selatan", "Jakarta Utara", "Jakarta Barat", "Jakarta Timur", "Jakarta Pusat"],
    surabaya: ["Surabaya", "Surabaya Barat", "Surabaya Timur", "Surabaya Selatan", "Surabaya Utara", "Sidoarjo", "Gresik"],
    denpasar: ["Denpasar", "Kuta", "Seminyak", "Sanur", "Canggu", "Jimbaran", "Ubud"],
    yogyakarta: ["Yogyakarta", "Sleman", "Bantul", "Wates", "Gunungkidul"],
    tangerang: ["Tangerang", "Kota Tangerang", "Kabupaten Tangerang", "Tangerang Selatan"],
    bekasi: ["Bekasi", "Kota Bekasi", "Kabupaten Bekasi", "Cikarang"],
    bogor: ["Bogor", "Kota Bogor", "Kabupaten Bogor", "Cibinong"],
  };

  for (const [key, areas] of Object.entries(areaMap)) {
    if (normalized.includes(key)) return uniqueStrings([trimmed, ...areas]).slice(0, 10);
  }

  return [trimmed];
}

function buildSearchPlans(query: string, city: string, mode: SearchMode): SearchPlan[] {
  const fullQuery = city.trim() ? `${query.trim()} di ${city.trim()}` : query.trim();
  const baseCoords = getCityCoords(fullQuery) ?? getCityCoords(city);

  if (mode === "standard") {
    return [{ fullQuery, coords: baseCoords, pages: STANDARD_MAX_PAGES }];
  }

  const plans: SearchPlan[] = [{ fullQuery, coords: baseCoords, pages: STANDARD_MAX_PAGES }];
  const seen = new Set([fullQuery.toLowerCase()]);
  const keywords = buildKeywordVariants(query);
  const areas = buildAreaVariants(city);

  for (const keyword of keywords) {
    for (const area of areas) {
      const nextQuery = area ? `${keyword} di ${area}` : keyword;
      const key = nextQuery.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      plans.push({
        fullQuery: nextQuery,
        coords: getCityCoords(nextQuery) ?? getCityCoords(area),
        pages: 1,
      });
      if (plans.length >= DEEP_PLAN_CAP) return plans;
    }
  }

  return plans;
}

function getRawPlaceKey(place: Record<string, unknown>) {
  const id = place.id as string | undefined;
  if (id) return `id:${id}`;

  const name = (place.displayName as { text?: string } | undefined)?.text ?? "";
  const address = (place.formattedAddress as string | undefined) ?? "";
  const phone = (place.nationalPhoneNumber as string | undefined) ?? "";
  return `fallback:${name.toLowerCase()}|${address.toLowerCase()}|${phone}`;
}

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

    const fullQuery = city?.trim() ? `${query.trim()} di ${city.trim()}` : query.trim();
    const FIELD_MASK = [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.nationalPhoneNumber",
      "places.websiteUri",
      "places.primaryTypeDisplayName",
      "places.rating",
      "places.userRatingCount",
      "places.businessStatus",
      "places.currentOpeningHours",
      "nextPageToken",
    ].join(",");

    const fetchPage = async (textQuery: string, coords: { lat: number; lng: number } | null, pageToken?: string) => {
      const body: Record<string, unknown> = {
        textQuery,
        pageSize: PAGE_SIZE,
        languageCode: "id",
      };

      if (coords) {
        body.locationBias = {
          circle: {
            center: { latitude: coords.lat, longitude: coords.lng },
            radius: 30000,
          },
        };
      }

      if (pageToken) body.pageToken = pageToken;

      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Google Places API error ${res.status}: ${JSON.stringify(err)}`);
      }
      return res.json() as Promise<{ places?: Record<string, unknown>[]; nextPageToken?: string }>;
    };

    const searchPlans = buildSearchPlans(query.trim(), city.trim(), searchMode);
    const rawByKey = new Map<string, Record<string, unknown>>();
    let rawTotal = 0;

    const addRawPlaces = (places: Record<string, unknown>[]) => {
      rawTotal += places.length;
      for (const place of places) {
        if (rawByKey.size >= DEEP_RESULT_CAP) break;
        rawByKey.set(getRawPlaceKey(place), place);
      }
    };

    const fetchPlan = async (plan: SearchPlan) => {
      const records: Record<string, unknown>[] = [];
      let nextToken: string | undefined;

      for (let i = 0; i < plan.pages; i++) {
        const data = await fetchPage(plan.fullQuery, plan.coords, nextToken);
        const pagePlaces = data.places ?? [];
        records.push(...pagePlaces);

        nextToken = data.nextPageToken;
        if (!nextToken) break;
      }

      return records;
    };

    const [basePlan, ...variantPlans] = searchPlans;
    addRawPlaces(await fetchPlan(basePlan));

    if (searchMode === "deep" && rawByKey.size < DEEP_RESULT_CAP) {
      for (let i = 0; i < variantPlans.length; i += 4) {
        const batch = variantPlans.slice(i, i + 4);
        const settled = await Promise.allSettled(batch.map((plan) => fetchPlan(plan)));

        for (const result of settled) {
          if (result.status === "fulfilled") addRawPlaces(result.value);
          if (rawByKey.size >= DEEP_RESULT_CAP) break;
        }

        if (rawByKey.size >= DEEP_RESULT_CAP) break;
      }
    }

    const allRaw = Array.from(rawByKey.values());
    const places: PlaceLead[] = allRaw.map((p) => {
      const name = (p.displayName as { text?: string })?.text ?? "";
      const phone = (p.nationalPhoneNumber as string) ?? "";
      const website = (p.websiteUri as string) ?? null;
      const businessStatus = (p.businessStatus as PlaceLead["businessStatus"]) ?? null;
      const openingHours = p.currentOpeningHours as { openNow?: boolean } | undefined;

      return {
        placeId: (p.id as string) ?? "",
        name,
        address: (p.formattedAddress as string) ?? "",
        phone,
        phoneNorm: phone ? normalizePhone(phone) : "",
        website,
        category: (p.primaryTypeDisplayName as { text?: string })?.text ?? "",
        hasWebsite: !!website,
        alreadySaved: false,
        rating: typeof p.rating === "number" ? Math.round(p.rating * 10) / 10 : null,
        ratingCount: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
        businessStatus,
        isOpen: openingHours?.openNow ?? null,
        socialScan: emptySocialScan("NOT_REQUESTED"),
      };
    });

    const socialScanStats = await attachSocialScans(places, shouldScanSocial);

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
        searchQueries: searchPlans.length,
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
      searchQueries: searchPlans.length,
      rawTotal,
      usedBias: searchPlans.some((plan) => !!plan.coords),
    });
  } catch (err) {
    console.error("[PortalLeadFinder]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
