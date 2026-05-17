import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientInvoiceDesign, sanitizeInvoiceDesign } from "@/lib/invoiceDesign";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { generateInvoicePdf } from "@/lib/tools/invoicePdf";

type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 500) : fallback;
}

function asMoney(value: unknown) {
  const number = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.min(Math.round(number), 999_999_999);
}

function asQuantity(value: unknown) {
  const number = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(number) || number <= 0) return 1;
  return Math.min(Math.round(number * 100) / 100, 999);
}

function parseDate(value: unknown, fallback?: Date) {
  if (typeof value !== "string" || !value.trim()) return fallback ?? null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback ?? null : date;
}

async function getClientId() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, clientId: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true, businessName: true, phone: true, address: true, user: { select: { name: true, email: true } } } } },
  });

  if (!user?.client) return { status: 404 as const, clientId: null };
  return { status: 200 as const, clientId: user.client.id, client: user.client };
}

export async function POST(req: NextRequest) {
  const { status, clientId, client } = await getClientId();
  if (!clientId || !client) {
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });
  }

  // Rate limit: max 10 previews per hour per client
  const rl = await rateLimit(`invoice-preview:${clientId}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak preview. Coba lagi nanti.", retryAfterMs: rl.retryAfterMs },
      { status: 429 },
    );
  }

  const body = asRecord(await req.json().catch(() => ({})));
  const design = body.design ? sanitizeInvoiceDesign(body.design) : await getClientInvoiceDesign(clientId);

  const rawItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  const lineItems: InvoiceItem[] = rawItems
    .map((item) => {
      const record = asRecord(item);
      return {
        description: asString(record.description).slice(0, 160),
        quantity: asQuantity(record.quantity),
        price: asMoney(record.price),
      };
    })
    .filter((item) => item.description && item.price > 0)
    .slice(0, 20);

  if (lineItems.length === 0) {
    return NextResponse.json({ error: "Tambahkan minimal 1 item invoice." }, { status: 400 });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + Math.round(item.quantity * item.price), 0);
  const discountValue = Math.min(asMoney(body.discount), subtotal);
  const includeTax = typeof body.includeTax === "boolean" ? body.includeTax : false;
  const taxableAmount = Math.max(0, subtotal - discountValue);
  const taxAmountValue = includeTax ? Math.round(taxableAmount * 0.11) : 0;
  const totalValue = Math.max(0, subtotal - discountValue + taxAmountValue);

  if (totalValue <= 0) {
    return NextResponse.json({ error: "Total invoice harus lebih dari 0." }, { status: 400 });
  }

  const billToName = asString(body.billToName).slice(0, 120);
  if (!billToName) {
    return NextResponse.json({ error: "Nama penerima invoice wajib diisi." }, { status: 400 });
  }

  const fromName = asString(body.fromName, client.businessName).slice(0, 120) || client.businessName;
  const issueDate = parseDate(body.issueDate, new Date()) ?? new Date();
  const dueDateValue = parseDate(body.dueDate);

  const pdfBytes = await generateInvoicePdf({
    invoiceNo: "PREVIEW",
    title: asString(body.title, "Invoice").slice(0, 120) || "Invoice",
    fromName,
    fromEmail: asString(body.fromEmail, client.user.email).slice(0, 160) || null,
    fromPhone: asString(body.fromPhone, client.phone ?? "").slice(0, 60) || null,
    fromAddress: asString(body.fromAddress, client.address ?? "").slice(0, 500) || null,
    billToName,
    billToEmail: asString(body.billToEmail).slice(0, 160) || null,
    billToPhone: asString(body.billToPhone).slice(0, 60) || null,
    billToAddress: asString(body.billToAddress).slice(0, 500) || null,
    issueDate,
    dueDate: dueDateValue,
    lineItems,
    subtotal,
    discount: discountValue,
    taxLabel: includeTax ? "PPN 11%" : null,
    taxAmount: taxAmountValue,
    total: totalValue,
    notes: asString(body.notes).slice(0, 1000) || null,
    footer: asString(body.footer).slice(0, 500) || null,
    design,
  });

  const fileName = asString(body.title, "invoice").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "invoice-preview";

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}-preview.pdf"`,
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "default-src 'self'; frame-ancestors 'self'",
    },
  });
}
