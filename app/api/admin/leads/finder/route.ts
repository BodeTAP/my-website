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
    const { query, maxResults = 20 } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query tidak boleh kosong" }, { status: 400 });

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type":    "application/json",
        "X-Goog-Api-Key":  apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.nationalPhoneNumber",
          "places.websiteUri",
          "places.primaryTypeDisplayName",
        ].join(","),
      },
      body: JSON.stringify({
        textQuery:      query.trim(),
        maxResultCount: Math.min(maxResults, 20),
        languageCode:   "id",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: `Google Places API error: ${res.status}`, detail: err }, { status: 502 });
    }

    const data = await res.json() as { places?: Record<string, unknown>[] };
    const places: PlaceLead[] = (data.places ?? []).map((p) => {
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
        alreadySaved: false, // akan di-update di bawah
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
