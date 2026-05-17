import { NextRequest, NextResponse } from "next/server";

import {
  checkFreemiumQuota,
  getFreemiumSettings,
  trackAnonymousUsage,
} from "@/lib/freemium";
import { executeLeadFinderSearch } from "@/lib/tools/leadFinderCore";
import { normalizePhone } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await req.json();
    const { query, city = "" } = body as { query?: string; city?: string };

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Query tidak boleh kosong" },
        { status: 400 },
      );
    }

    // 2. Check if freemium is enabled for lead_finder
    const settings = await getFreemiumSettings("lead_finder");
    if (!settings.enabled) {
      return NextResponse.json(
        { error: "Free tier tidak tersedia untuk tool ini" },
        { status: 403 },
      );
    }

    // 3. Check rate limit / quota
    const quota = await checkFreemiumQuota(req, "lead_finder");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            "Batas penggunaan gratis tercapai. Daftar akun untuk akses penuh.",
          retryAfterMs: quota.retryAfterMs,
        },
        { status: 429 },
      );
    }

    // 4. Execute search with capped results
    const resultCap = settings.resultCap ?? 5;
    const searchResult = await executeLeadFinderSearch({
      query: query.trim(),
      city: city.trim(),
      mode: "standard",
      maxResults: resultCap,
    });

    const { places, fullQuery } = searchResult;

    // 5. Normalize phone numbers
    for (const place of places) {
      if (place.phone) {
        place.phoneNorm = normalizePhone(place.phone);
      }
    }

    // 6. Track anonymous usage
    await trackAnonymousUsage(quota.ipHash, "lead_finder", {
      query: query.trim(),
      city: city.trim(),
      results: places.length,
    });

    // 7. Return response
    return NextResponse.json({
      places,
      total: places.length,
      fullQuery,
      mode: "standard",
      freemium: true,
    });
  } catch (err) {
    console.error("[PublicLeadFinder]", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
