import { NextRequest, NextResponse } from "next/server";

import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { hashIP, trackAnonymousUsage } from "@/lib/freemium";
import { generateFreemiumProposalPdf } from "@/lib/tools/freemiumProposalPdf";
import { track } from "@vercel/analytics/server";

export const runtime = "nodejs";

/**
 * POST /api/tools/proposal-generator/pdf
 *
 * Generates and streams the freemium proposal PDF (with watermark).
 * Separate from the JSON `/api/tools/proposal-generator` endpoint so the
 * preview can render instantly while download happens on demand.
 *
 * Quota: lighter rate limit (10 PDFs / 24h / IP) since the user already
 * "spent" their generate quota when creating the JSON preview, and PDF
 * generation is server work we want to bound.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const ipHash = hashIP(ip);

    const { allowed } = await rateLimit(`freemium:proposal_pdf:${ipHash}`, 10, 86_400_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Batas download PDF gratis tercapai. Daftar akun untuk akses penuh." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const {
      prospectName,
      businessName,
      serviceDescription,
      price,
      validDays,
      createdAt,
      email,
    } = body as {
      prospectName?: string;
      businessName?: string;
      serviceDescription?: string;
      price?: number;
      validDays?: number;
      createdAt?: string;
      email?: string;
    };

    if (!prospectName?.trim() || !businessName?.trim() || !serviceDescription?.trim()) {
      return NextResponse.json({ error: "Data proposal tidak lengkap" }, { status: 400 });
    }
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Harga tidak valid" }, { status: 400 });
    }

    const pdfBytes = await generateFreemiumProposalPdf({
      prospectName: prospectName.trim(),
      businessName: businessName.trim(),
      serviceDescription: serviceDescription.trim(),
      price,
      validDays: validDays && validDays > 0 ? validDays : 30,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });

    // Track download + optional email capture (anonymous, no PII enforcement)
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    const validEmail = trimmedEmail.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    await trackAnonymousUsage(ipHash, "proposal_generator", {
      action: "pdf_download",
      email: validEmail ? trimmedEmail : null,
      prospectName: prospectName.trim(),
      businessName: businessName.trim(),
    });
    // Server-side Vercel Analytics (not blockable by ad blockers).
    // Await so the event isn't dropped when the serverless function freezes.
    await track("freemium_pdf_downloaded_server", {
      tool: "proposal_generator",
      email_captured: validEmail,
    });

    const filename = `proposal-${prospectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32) || "freemium"}.pdf`;

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
    console.error("[FreemiumProposalPdf] error:", err);
    return NextResponse.json({ error: "Gagal membuat PDF. Coba lagi." }, { status: 500 });
  }
}
