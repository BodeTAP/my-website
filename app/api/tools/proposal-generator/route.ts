import { NextRequest, NextResponse } from "next/server";

import {
  checkFreemiumQuota,
  getFreemiumSettings,
  trackAnonymousUsage,
} from "@/lib/freemium";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRupiah(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

// ---------------------------------------------------------------------------
// POST /api/tools/proposal-generator
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Check if freemium is enabled for this tool
  const settings = await getFreemiumSettings("proposal_generator");
  if (!settings.enabled) {
    return NextResponse.json(
      { error: "Free tier tidak tersedia untuk tool ini" },
      { status: 403 },
    );
  }

  // 2. Check freemium quota (IP-based rate limit)
  const quota = await checkFreemiumQuota(req, "proposal_generator");
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: "Batas penggunaan gratis tercapai. Daftar akun untuk akses penuh.",
        retryAfterMs: quota.retryAfterMs,
      },
      { status: 429 },
    );
  }

  // 3. Parse and validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prospectName, businessName, serviceDescription, price } = body as {
    prospectName?: string;
    businessName?: string;
    serviceDescription?: string;
    price?: number;
  };

  if (!prospectName?.trim()) {
    return NextResponse.json({ error: "prospectName wajib diisi" }, { status: 400 });
  }
  if (!businessName?.trim()) {
    return NextResponse.json({ error: "businessName wajib diisi" }, { status: 400 });
  }
  if (!serviceDescription?.trim()) {
    return NextResponse.json({ error: "serviceDescription wajib diisi" }, { status: 400 });
  }
  if (price == null || typeof price !== "number" || price <= 0) {
    return NextResponse.json({ error: "price wajib berupa angka positif" }, { status: 400 });
  }

  // 4. Generate simplified proposal content (no AI)
  const proposal = {
    title: `Proposal untuk ${prospectName.trim()}`,
    from: businessName.trim(),
    to: prospectName.trim(),
    service: serviceDescription.trim(),
    price,
    priceFormatted: formatRupiah(price),
    validDays: 30,
    createdAt: new Date().toISOString(),
  };

  // 5. Track anonymous usage
  await trackAnonymousUsage(quota.ipHash, "proposal_generator", {
    prospectName: prospectName.trim(),
    businessName: businessName.trim(),
  });

  // 6. Return response with watermark flag
  return NextResponse.json({
    proposal,
    watermark: true,
    freemium: true,
  });
}
