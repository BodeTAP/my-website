import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/whatsapp";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export type PlaceLead = {
  placeId:      string;
  name:         string;
  address:      string;
  phone:        string;
  phoneNorm:    string;
  website:      string | null;
  category:     string;
  hasWebsite:   boolean;
  alreadySaved: boolean;
};

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY belum dikonfigurasi" }, { status: 503 });

  try {
    const { query, pages = 3 } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query tidak boleh kosong" }, { status: 400 });

    const FIELD_MASK = [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.nationalPhoneNumber",
      "places.websiteUri",
      "places.primaryTypeDisplayName",
      "nextPageToken",
    ].join(",");

    const fetchPage = async (pageToken?: string) => {
      const body: Record<string, unknown> = {
        textQuery:      query.trim(),
        maxResultCount: 20,
        languageCode:   "id",
      };
      if (pageToken) body.pageToken = pageToken;

      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type":    "application/json",
          "X-Goog-Api-Key":  apiKey,
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

    // Ambil hingga `pages` halaman (maks 3 = 60 hasil)
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
      const name    = (p.displayName as { text?: string })?.text ?? "";
      const phone   = (p.nationalPhoneNumber as string) ?? "";
      const website = (p.websiteUri as string) ?? null;
      return {
        placeId:      (p.id as string) ?? "",
        name,
        address:      (p.formattedAddress as string) ?? "",
        phone,
        phoneNorm:    phone ? normalizePhone(phone) : "",
        website,
        category:     (p.primaryTypeDisplayName as { text?: string })?.text ?? "",
        hasWebsite:   !!website,
        alreadySaved: false,
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

    return NextResponse.json({ places, total: places.length });
  } catch (err) {
    console.error("[LeadFinder]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
