import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { deductCredits, getClientBalance, refundCredits } from "@/lib/credits";
import { getClientInvoiceDesign, invoiceDesignToJson, sanitizeInvoiceDesign } from "@/lib/invoiceDesign";
import { prisma } from "@/lib/prisma";
import { getToolSettings } from "@/lib/toolSettings";

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

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function getClient() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, client: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      client: {
        select: {
          id: true,
          businessName: true,
          phone: true,
          address: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!user?.client) return { status: 404 as const, client: null };
  return { status: 200 as const, client: user.client };
}

async function generateInvoiceNo(_clientId: string) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `IG-${date}-${random}`;
}

export async function GET() {
  const { status, client } = await getClient();
  if (!client) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const invoices = await prisma.generatedInvoice.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const { status, client } = await getClient();
  if (!client) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const toolSettings = await getToolSettings();
  if (!toolSettings.invoiceGenerator.enabled) {
    return NextResponse.json({ error: "Invoice Generator sedang nonaktif." }, { status: 503 });
  }

  const creditCost = toolSettings.invoiceGenerator.creditCost;
  const balance = await getClientBalance(client.id);
  if (balance < creditCost) {
    return NextResponse.json({ error: "Kredit tidak cukup", balance, requiredCredits: creditCost }, { status: 402 });
  }

  const body = asRecord(await req.json().catch(() => ({})));
  const design = body.design ? sanitizeInvoiceDesign(body.design) : await getClientInvoiceDesign(client.id);
  const templateName = asString(body.templateName, design.layout).slice(0, 80) || design.layout;
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
  const discount = Math.min(asMoney(body.discount), subtotal);
  const includeTax = typeof body.includeTax === "boolean"
    ? body.includeTax
    : toolSettings.invoiceGenerator.defaultIncludeTax;
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = includeTax ? Math.round(taxableAmount * 0.11) : 0;
  const total = Math.max(0, subtotal - discount + taxAmount);
  if (total <= 0) return NextResponse.json({ error: "Total invoice harus lebih dari 0." }, { status: 400 });

  const invoiceNo = await generateInvoiceNo(client.id);
  const title = asString(body.title, "Invoice").slice(0, 120) || "Invoice";
  const billToName = asString(body.billToName).slice(0, 120);
  if (!billToName) return NextResponse.json({ error: "Nama penerima invoice wajib diisi." }, { status: 400 });

  const issueDate = parseDate(body.issueDate, new Date()) ?? new Date();
  const dueDate = parseDate(body.dueDate, addDays(toolSettings.invoiceGenerator.defaultDueDays));
  const fromName = asString(body.fromName, client.businessName).slice(0, 120) || client.businessName;

  const deductResult = await deductCredits(
    client.id,
    creditCost,
    "invoice_generator",
    `Generate invoice: ${title}`,
    { invoiceNo, billToName },
  );

  if (!deductResult.ok) {
    return NextResponse.json(
      { error: deductResult.error ?? "Kredit tidak cukup", balance: deductResult.newBalance },
      { status: 402 },
    );
  }

  try {
    const invoice = await prisma.generatedInvoice.create({
      data: {
        clientId: client.id,
        invoiceNo,
        templateName,
        title,
        fromName,
        fromEmail: asString(body.fromEmail, client.user.email).slice(0, 160) || null,
        fromPhone: asString(body.fromPhone, client.phone ?? "").slice(0, 60) || null,
        fromAddress: asString(body.fromAddress, client.address ?? "").slice(0, 500) || null,
        billToName,
        billToEmail: asString(body.billToEmail).slice(0, 160) || null,
        billToPhone: asString(body.billToPhone).slice(0, 60) || null,
        billToAddress: asString(body.billToAddress).slice(0, 500) || null,
        issueDate,
        dueDate,
        lineItems: lineItems as unknown as Prisma.InputJsonValue,
        subtotal,
        discount,
        taxLabel: includeTax ? "PPN 11%" : null,
        taxAmount,
        total,
        notes: asString(body.notes).slice(0, 1000) || null,
        footer: asString(body.footer, toolSettings.invoiceGenerator.defaultFooter).slice(0, 500) || null,
        design: invoiceDesignToJson(design),
      },
    });

    return NextResponse.json({ invoice, balance: deductResult.newBalance }, { status: 201 });
  } catch (error) {
    await refundCredits(client.id, creditCost, `Refund gagal generate invoice: ${title}`, { invoiceNo });
    console.error("[InvoiceGenerator]", error);
    return NextResponse.json({ error: "Gagal menyimpan invoice" }, { status: 500 });
  }
}
