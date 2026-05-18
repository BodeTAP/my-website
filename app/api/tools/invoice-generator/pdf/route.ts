import { NextRequest, NextResponse } from "next/server";

import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { hashIP, trackAnonymousUsage } from "@/lib/freemium";
import { generateFreemiumInvoicePdf } from "@/lib/tools/freemiumInvoicePdf";

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
      subtotal,
      tax,
      total,
      includeTax,
      createdAt,
      email,
    } = body as {
      invoiceNo?: string;
      fromName?: string;
      toName?: string;
      items?: Array<{ description: string; quantity: number; price: number }>;
      subtotal?: number;
      tax?: number;
      total?: number;
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
    if (
      typeof subtotal !== "number" ||
      typeof total !== "number" ||
      typeof tax !== "number"
    ) {
      return NextResponse.json({ error: "Total invoice tidak valid" }, { status: 400 });
    }

    const pdfBytes = await generateFreemiumInvoicePdf({
      invoiceNo: invoiceNo.trim(),
      fromName: fromName.trim(),
      toName: toName.trim(),
      items: items.map((it) => ({
        description: String(it.description ?? "").trim(),
        quantity: Number(it.quantity) || 0,
        price: Number(it.price) || 0,
      })),
      subtotal,
      tax,
      total,
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
