import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { invoiceDesignToJson, sanitizeInvoiceDesign } from "@/lib/invoiceDesign";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};

const STATUS_OPTIONS = new Set(["DRAFT", "SENT", "PAID", "VOID"]);

function asRecord(value: unknown): Record<string, unknown> {
  return !value || typeof value !== "object" || Array.isArray(value) ? {} : value as Record<string, unknown>;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 1000) : fallback;
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

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseLineItems(value: unknown): InvoiceItem[] {
  const rawItems = Array.isArray(value) ? value : [];
  return rawItems
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
}

async function getClientId() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, clientId: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });

  if (!user?.client) return { status: 404 as const, clientId: null };
  return { status: 200 as const, clientId: user.client.id };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const invoice = await prisma.generatedInvoice.findFirst({ where: { id, clientId } });
  if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ invoice });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const current = await prisma.generatedInvoice.findFirst({ where: { id, clientId } });
  if (!current) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });

  const body = asRecord(await req.json().catch(() => ({})));
  const lineItems = body.lineItems === undefined
    ? parseLineItems(current.lineItems)
    : parseLineItems(body.lineItems);
  if (lineItems.length === 0) return NextResponse.json({ error: "Tambahkan minimal 1 item invoice." }, { status: 400 });

  const subtotal = lineItems.reduce((sum, item) => sum + Math.round(item.quantity * item.price), 0);
  const discount = Math.min(asMoney(body.discount ?? current.discount), subtotal);
  const includeTax = body.includeTax === undefined
    ? current.taxAmount > 0
    : body.includeTax === true;
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = includeTax ? Math.round(taxableAmount * 0.11) : 0;
  const total = Math.max(0, taxableAmount + taxAmount);
  if (total <= 0) return NextResponse.json({ error: "Total invoice harus lebih dari 0." }, { status: 400 });

  const nextStatus = asString(body.status, current.status).toUpperCase();
  if (!STATUS_OPTIONS.has(nextStatus)) {
    return NextResponse.json({ error: "Status invoice tidak valid." }, { status: 400 });
  }

  const data: Prisma.GeneratedInvoiceUpdateInput = {
    title: asString(body.title, current.title).slice(0, 120) || current.title,
    fromName: asString(body.fromName, current.fromName).slice(0, 120) || current.fromName,
    fromEmail: asString(body.fromEmail, current.fromEmail ?? "").slice(0, 160) || null,
    fromPhone: asString(body.fromPhone, current.fromPhone ?? "").slice(0, 60) || null,
    fromAddress: asString(body.fromAddress, current.fromAddress ?? "").slice(0, 500) || null,
    billToName: asString(body.billToName, current.billToName).slice(0, 120) || current.billToName,
    billToEmail: asString(body.billToEmail, current.billToEmail ?? "").slice(0, 160) || null,
    billToPhone: asString(body.billToPhone, current.billToPhone ?? "").slice(0, 60) || null,
    billToAddress: asString(body.billToAddress, current.billToAddress ?? "").slice(0, 500) || null,
    issueDate: parseDate(body.issueDate) ?? current.issueDate,
    dueDate: body.dueDate === undefined ? current.dueDate : parseDate(body.dueDate),
    lineItems: lineItems as unknown as Prisma.InputJsonValue,
    subtotal,
    discount,
    taxLabel: includeTax ? "PPN 11%" : null,
    taxAmount,
    total,
    notes: asString(body.notes, current.notes ?? "").slice(0, 1000) || null,
    footer: asString(body.footer, current.footer ?? "").slice(0, 500) || null,
    status: nextStatus,
  };

  if (body.design !== undefined) data.design = invoiceDesignToJson(sanitizeInvoiceDesign(body.design));

  const invoice = await prisma.generatedInvoice.update({
    where: { id: current.id },
    data,
  });

  return NextResponse.json({ invoice });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const deleted = await prisma.generatedInvoice.deleteMany({
    where: { id, clientId },
  });

  if (deleted.count === 0) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
