import { NextRequest, NextResponse } from "next/server";

import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { hashIP, trackAnonymousUsage } from "@/lib/freemium";
import { generateFreemiumInvoicePdf } from "@/lib/tools/freemiumInvoicePdf";
import { track } from "@vercel/analytics/server";

export const runtime = "nodejs";

/**
 * POST /api/tools/invoice-generator/pdf
 *
 * Generates and streams the freemium invoice PDF (with watermark).
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const ipHash = hashIP(ip);

    const { allowed } = await rateLimit(`freemium:invoice_pdf:${ipHash}`, 10, 86_400_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Batas download PDF gratis tercapai. Daftar akun untuk akses penuh." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const {
      invoiceNo,
      fromName,
      toName,
      items,
      includeTax,
      createdAt,
      email,
    } = body as {
      invoiceNo?: string;
      fromName?: string;
      toName?: string;
      items?: Array<{ description: string; quantity: number; price: number }>;
      includeTax?: boolean;
      createdAt?: string;
      email?: string;
    };

    if (!fromName?.trim() || !toName?.trim() || !invoiceNo?.trim()) {
      return NextResponse.json({ error: "Data invoice tidak lengkap" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Item invoice tidak boleh kosong" }, { status: 400 });
    }

    // Recompute totals server-side from line items — never trust client-supplied
    // subtotal/tax/total (they could disagree with the items and print mismatched figures).
    const safeItems = items.map((it) => ({
      description: String(it.description ?? "").trim(),
      quantity: Math.max(0, Number(it.quantity) || 0),
      price: Math.max(0, Number(it.price) || 0),
    }));
    const computedSubtotal = safeItems.reduce(
      (sum, it) => sum + Math.round(it.quantity * it.price),
      0,
    );
    const computedTax = includeTax ? Math.round(computedSubtotal * 0.11) : 0;
    const computedTotal = computedSubtotal + computedTax;

    const pdfBytes = await generateFreemiumInvoicePdf({
      invoiceNo: invoiceNo.trim(),
      fromName: fromName.trim(),
      toName: toName.trim(),
      items: safeItems,
      subtotal: computedSubtotal,
      tax: computedTax,
      total: computedTotal,
      includeTax: !!includeTax,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });

    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    const validEmail = trimmedEmail.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    await trackAnonymousUsage(ipHash, "invoice_generator", {
      action: "pdf_download",
      email: validEmail ? trimmedEmail : null,
      fromName: fromName.trim(),
      toName: toName.trim(),
    });
    // Server-side Vercel Analytics (not blockable by ad blockers)
    track("freemium_pdf_downloaded_server", {
      tool: "invoice_generator",
      email_captured: validEmail,
    });

    const filename = `invoice-${invoiceNo.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32) || "freemium"}.pdf`;

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBytes.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[FreemiumInvoicePdf] error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
