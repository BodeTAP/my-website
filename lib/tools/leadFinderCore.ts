/**
 * Lead Finder Core Logic
 *
 * Extracted from the portal route to be shared between:
 * - /api/portal/tools/lead-finder (authenticated, full results)
 * - /api/tools/lead-finder (public freemium, capped results)
 *
 * This module handles ONLY the Google Places search logic.
 * Auth, credits, rate limiting, and social scan remain in the route handlers.
 */

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

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "linkedin" | "youtube" | "x";
export type SocialScanStatus = "NOT_REQUESTED" | "NO_WEBSITE" | "FOUND" | "NOT_FOUND" | "FAILED" | "SKIPPED";
export type SocialLinks = Partial<Record<SocialPlatform, string>>;
export type SocialScanResult = {
  status: SocialScanStatus;
  links: SocialLinks;
  error?: string;
};

export type SearchMode = "standard" | "deep";

type SearchPlan = {
  fullQuery: string;
  coords: { lat: number; lng: number } | null;
  pages: number;
};

export type LeadFinderSearchParams = {
  query: string;
  city: string;
  mode?: SearchMode;
  maxResults?: number;
};

export type LeadFinderSearchResult = {
  places: PlaceLead[];
  rawTotal: number;
  searchQueries: number;
  usedBias: boolean;
  fullQuery: string;
};

const PAGE_SIZE = 20;
const STANDARD_MAX_PAGES = 3;
const DEEP_RESULT_CAP = 240;
const DEEP_PLAN_CAP = 18;

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


export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
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

export function getCityCoords(query: string): { lat: number; lng: number } | null {
  const lower = query.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return null;
}

export function uniqueStrings(values: string[]) {
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

export function buildKeywordVariants(query: string) {
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

export function buildAreaVariants(city: string) {
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

export function buildSearchPlans(query: string, city: string, mode: SearchMode): SearchPlan[] {
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

export function getRawPlaceKey(place: Record<string, unknown>) {
  const id = place.id as string | undefined;
  if (id) return `id:${id}`;

  const name = (place.displayName as { text?: string } | undefined)?.text ?? "";
  const address = (place.formattedAddress as string | undefined) ?? "";
  const phone = (place.nationalPhoneNumber as string | undefined) ?? "";
  return `fallback:${name.toLowerCase()}|${address.toLowerCase()}|${phone}`;
}


function emptySocialScan(status: SocialScanStatus): SocialScanResult {
  return { status, links: {} };
}

async function fetchPage(
  apiKey: string,
  textQuery: string,
  coords: { lat: number; lng: number } | null,
  pageToken?: string,
) {
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
}

/**
 * Execute a Lead Finder search against Google Places API.
 *
 * This function contains the core search logic shared between the portal
 * (authenticated) and public (freemium) routes.
 *
 * It does NOT handle:
 * - Authentication / session checks
 * - Credit deduction
 * - Rate limiting (caller is responsible)
 * - Social scan (caller attaches after)
 * - alreadySaved check (caller handles with normalizePhone)
 *
 * @param params.query - The search keyword (e.g. "salon kecantikan")
 * @param params.city - The city to search in (e.g. "Bandung")
 * @param params.mode - "standard" (default) or "deep" search mode
 * @param params.maxResults - Optional cap on the number of results returned
 */
export async function executeLeadFinderSearch(
  params: LeadFinderSearchParams,
): Promise<LeadFinderSearchResult> {
  const { query, city, mode = "standard", maxResults } = params;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY belum dikonfigurasi");
  }

  const searchMode: SearchMode = mode === "deep" ? "deep" : "standard";
  const fullQuery = city.trim() ? `${query.trim()} di ${city.trim()}` : query.trim();

  const searchPlans = buildSearchPlans(query.trim(), city.trim(), searchMode);
  const rawByKey = new Map<string, Record<string, unknown>>();
  let rawTotal = 0;

  const effectiveCap = maxResults ?? DEEP_RESULT_CAP;

  const addRawPlaces = (places: Record<string, unknown>[]) => {
    rawTotal += places.length;
    for (const place of places) {
      if (rawByKey.size >= effectiveCap) break;
      rawByKey.set(getRawPlaceKey(place), place);
    }
  };

  const fetchPlan = async (plan: SearchPlan) => {
    const records: Record<string, unknown>[] = [];
    let nextToken: string | undefined;

    for (let i = 0; i < plan.pages; i++) {
      const data = await fetchPage(apiKey, plan.fullQuery, plan.coords, nextToken);
      const pagePlaces = data.places ?? [];
      records.push(...pagePlaces);

      nextToken = data.nextPageToken;
      if (!nextToken) break;
    }

    return records;
  };

  const [basePlan, ...variantPlans] = searchPlans;
  addRawPlaces(await fetchPlan(basePlan));

  if (searchMode === "deep" && rawByKey.size < effectiveCap) {
    for (let i = 0; i < variantPlans.length; i += 4) {
      const batch = variantPlans.slice(i, i + 4);
      const settled = await Promise.allSettled(batch.map((plan) => fetchPlan(plan)));

      for (const result of settled) {
        if (result.status === "fulfilled") addRawPlaces(result.value);
        if (rawByKey.size >= effectiveCap) break;
      }

      if (rawByKey.size >= effectiveCap) break;
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
      phoneNorm: "", // Caller sets this with normalizePhone if needed
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

  // Apply maxResults cap if specified (for freemium)
  const cappedPlaces = maxResults ? places.slice(0, maxResults) : places;

  return {
    places: cappedPlaces,
    rawTotal,
    searchQueries: searchPlans.length,
    usedBias: searchPlans.some((plan) => !!plan.coords),
    fullQuery,
  };
}
