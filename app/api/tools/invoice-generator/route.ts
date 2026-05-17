import { NextRequest, NextResponse } from "next/server";

import {
  checkFreemiumQuota,
  getFreemiumSettings,
  trackAnonymousUsage,
} from "@/lib/freemium";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InvoiceItemInput = {
  description: string;
  quantity: number;
  price: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await req.json();
    const { fromName, toName, items, includeTax } = body as {
      fromName?: string;
      toName?: string;
      items?: InvoiceItemInput[];
      includeTax?: boolean;
    };

    if (!fromName?.trim()) {
      return NextResponse.json(
        { error: "Nama pengirim (fromName) wajib diisi" },
        { status: 400 },
      );
    }

    if (!toName?.trim()) {
      return NextResponse.json(
        { error: "Nama penerima (toName) wajib diisi" },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Minimal 1 item invoice diperlukan" },
        { status: 400 },
      );
    }

    if (items.length > 10) {
      return NextResponse.json(
        { error: "Maksimal 10 item untuk free tier" },
        { status: 400 },
      );
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description?.trim()) {
        return NextResponse.json(
          { error: `Item ${i + 1}: deskripsi wajib diisi` },
          { status: 400 },
        );
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        return NextResponse.json(
          { error: `Item ${i + 1}: quantity harus lebih dari 0` },
          { status: 400 },
        );
      }
      if (typeof item.price !== "number" || item.price <= 0) {
        return NextResponse.json(
          { error: `Item ${i + 1}: price harus lebih dari 0` },
          { status: 400 },
        );
      }
    }

    // 2. Check if freemium is enabled for invoice_generator
    const settings = await getFreemiumSettings("invoice_generator");
    if (!settings.enabled) {
      return NextResponse.json(
        { error: "Free tier tidak tersedia untuk tool ini" },
        { status: 403 },
      );
    }

    // 3. Check rate limit / quota
    const quota = await checkFreemiumQuota(req, "invoice_generator");
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

    // 4. Generate simplified invoice content
    const processedItems = items.map((item) => {
      const total = Math.round(item.quantity * item.price);
      return {
        description: item.description.trim(),
        quantity: item.quantity,
        price: item.price,
        total,
        totalFormatted: formatRupiah(total),
      };
    });

    const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = includeTax ? Math.round(subtotal * 0.11) : 0;
    const total = subtotal + tax;

    const invoice = {
      number: `INV-${Date.now().toString(36).toUpperCase()}`,
      from: fromName.trim(),
      to: toName.trim(),
      items: processedItems,
      subtotal,
      subtotalFormatted: formatRupiah(subtotal),
      tax,
      taxFormatted: includeTax ? formatRupiah(tax) : null,
      total,
      totalFormatted: formatRupiah(total),
      includeTax: !!includeTax,
      createdAt: new Date().toISOString(),
    };

    // 5. Track anonymous usage
    await trackAnonymousUsage(quota.ipHash, "invoice_generator", {
      fromName: fromName.trim(),
      toName: toName.trim(),
      itemCount: items.length,
    });

    // 6. Return response with watermark flag
    return NextResponse.json({
      invoice,
      watermark: true,
      freemium: true,
    });
  } catch (err) {
    console.error("[PublicInvoiceGenerator]", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
