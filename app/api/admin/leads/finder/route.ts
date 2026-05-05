import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/whatsapp";
import { rateLimit } from "@/lib/rateLimit";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export type PlaceLead = {
  placeId:        string;
  name:           string;
  address:        string;
  phone:          string;
  phoneNorm:      string;
  website:        string | null;
  category:       string;
  hasWebsite:     boolean;
  alreadySaved:   boolean;
  // New fields
  rating:         number | null;
  ratingCount:    number | null;
  businessStatus: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY" | null;
  isOpen:         boolean | null;
};

// City → approximate lat/lng for locationBias
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "jakarta":          { lat: -6.2088,  lng: 106.8456 },
  "jakarta selatan":  { lat: -6.2615,  lng: 106.8106 },
  "jakarta utara":    { lat: -6.1381,  lng: 106.8451 },
  "jakarta barat":    { lat: -6.1675,  lng: 106.7637 },
  "jakarta timur":    { lat: -6.2250,  lng: 106.9004 },
  "jakarta pusat":    { lat: -6.1862,  lng: 106.8340 },
  "bandung":          { lat: -6.9175,  lng: 107.6191 },
  "surabaya":         { lat: -7.2575,  lng: 112.7521 },
  "medan":            { lat:  3.5952,  lng:  98.6722 },
  "semarang":         { lat: -6.9932,  lng: 110.4203 },
  "makassar":         { lat: -5.1477,  lng: 119.4327 },
  "palembang":        { lat: -2.9761,  lng: 104.7754 },
  "tangerang":        { lat: -6.1783,  lng: 106.6319 },
  "depok":            { lat: -6.4025,  lng: 106.7942 },
  "bekasi":           { lat: -6.2383,  lng: 106.9756 },
  "bogor":            { lat: -6.5971,  lng: 106.8060 },
  "yogyakarta":       { lat: -7.7956,  lng: 110.3695 },
  "solo":             { lat: -7.5755,  lng: 110.8243 },
  "malang":           { lat: -7.9797,  lng: 112.6304 },
  "denpasar":         { lat: -8.6705,  lng: 115.2126 },
  "bali":             { lat: -8.3405,  lng: 115.0920 },
  "balikpapan":       { lat: -1.2675,  lng: 116.8289 },
  "samarinda":        { lat: -0.5022,  lng: 117.1536 },
  "pontianak":        { lat: -0.0263,  lng: 109.3425 },
  "pekanbaru":        { lat:  0.5071,  lng: 101.4478 },
  "batam":            { lat:  1.0456,  lng: 104.0305 },
  "manado":           { lat:  1.4748,  lng: 124.8421 },
  "banjarmasin":      { lat: -3.3194,  lng: 114.5908 },
  "padang":           { lat: -0.9471,  lng: 100.4172 },
  "lampung":          { lat: -5.4292,  lng: 105.2613 },
  "cirebon":          { lat: -6.7063,  lng: 108.5570 },
  "tasikmalaya":      { lat: -7.3274,  lng: 108.2207 },
  "sukabumi":         { lat: -6.9277,  lng: 106.9300 },
  "cilegon":          { lat: -6.0023,  lng: 106.0052 },
  "serang":           { lat: -6.1201,  lng: 106.1503 },
};

function getCityCoords(query: string): { lat: number; lng: number } | null {
  const lower = query.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 30 searches per hour per admin session
  const session = await auth();
  const adminEmail = session?.user?.email ?? "unknown";
  const { allowed, retryAfterMs } = await rateLimit(`finder:${adminEmail}`, 30, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak pencarian. Coba lagi dalam ${Math.ceil(retryAfterMs / 60000)} menit.` },
      { status: 429 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY belum dikonfigurasi" }, { status: 503 });

  try {
    const { query, pages = 3, city = "" } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query tidak boleh kosong" }, { status: 400 });

    // Build full query — combine category + city
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

    // Try to get precise coordinates for locationBias
    const coords = getCityCoords(fullQuery) ?? getCityCoords(city ?? "");

    const fetchPage = async (pageToken?: string) => {
      const body: Record<string, unknown> = {
        textQuery:      fullQuery,
        maxResultCount: 20,
        languageCode:   "id",
      };

      // Use locationBias with circle if we have city coordinates
      if (coords) {
        body.locationBias = {
          circle: {
            center: { latitude: coords.lat, longitude: coords.lng },
            radius: 30000, // 30km radius
          },
        };
      }

      if (pageToken) body.pageToken = pageToken;

      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type":     "application/json",
          "X-Goog-Api-Key":   apiKey,
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

    const maxPages = Math.min(Math.max(1, pages), 3);
    const allRaw: Record<string, unknown>[] = [];
    let nextToken: string | undefined;

    for (let i = 0; i < maxPages; i++) {
      const data = await fetchPage(nextToken);
      allRaw.push(...(data.places ?? []));
      nextToken = data.nextPageToken;
      if (!nextToken) break;
    }

    const places: PlaceLead[] = allRaw.map((p) => {
      const name           = (p.displayName as { text?: string })?.text ?? "";
      const phone          = (p.nationalPhoneNumber as string) ?? "";
      const website        = (p.websiteUri as string) ?? null;
      const businessStatus = (p.businessStatus as PlaceLead["businessStatus"]) ?? null;
      const openingHours   = p.currentOpeningHours as { openNow?: boolean } | undefined;

      return {
        placeId:        (p.id as string) ?? "",
        name,
        address:        (p.formattedAddress as string) ?? "",
        phone,
        phoneNorm:      phone ? normalizePhone(phone) : "",
        website,
        category:       (p.primaryTypeDisplayName as { text?: string })?.text ?? "",
        hasWebsite:     !!website,
        alreadySaved:   false,
        rating:         typeof p.rating === "number" ? Math.round(p.rating * 10) / 10 : null,
        ratingCount:    typeof p.userRatingCount === "number" ? p.userRatingCount : null,
        businessStatus,
        isOpen:         openingHours?.openNow ?? null,
      };
    });

    // Cek nomor mana yang sudah ada di DB
    const phones = places.map((p) => p.phoneNorm).filter(Boolean);
    if (phones.length > 0) {
      const existing = await prisma.lead.findMany({
        where:  { whatsapp: { in: phones } },
        select: { whatsapp: true },
      });
      const savedPhones = new Set(existing.map((e) => e.whatsapp));
      for (const p of places) {
        if (p.phoneNorm && savedPhones.has(p.phoneNorm)) p.alreadySaved = true;
      }
    }

    return NextResponse.json({
      places,
      total:     places.length,
      fullQuery,
      usedBias:  !!coords,
    });
  } catch (err) {
    console.error("[LeadFinder]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
