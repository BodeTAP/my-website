import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseInvoiceDesign } from "@/lib/invoiceDesign";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/tools/invoicePdf";

type Params = { params: Promise<{ id: string }> };
type InvoiceItem = { description?: unknown; quantity?: unknown; price?: unknown };

function itemText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function itemNumber(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });
  if (!user?.client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { id } = await params;
  const invoice = await prisma.generatedInvoice.findFirst({
    where: { id, clientId: user.client.id },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });

  const design = parseInvoiceDesign(invoice.design);
  const rawItems = Array.isArray(invoice.lineItems) ? (invoice.lineItems as InvoiceItem[]) : [];
  const lineItems = rawItems.map((item, index) => ({
    description: itemText(item.description, `Item ${index + 1}`),
    quantity: itemNumber(item.quantity, 1),
    price: itemNumber(item.price, 0),
  }));

  const pdfBytes = await generateInvoicePdf({
    invoiceNo: invoice.invoiceNo,
    title: invoice.title,
    fromName: invoice.fromName,
    fromEmail: invoice.fromEmail,
    fromPhone: invoice.fromPhone,
    fromAddress: invoice.fromAddress,
    billToName: invoice.billToName,
    billToEmail: invoice.billToEmail,
    billToPhone: invoice.billToPhone,
    billToAddress: invoice.billToAddress,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    lineItems,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    taxLabel: invoice.taxLabel,
    taxAmount: invoice.taxAmount,
    total: invoice.total,
    notes: invoice.notes,
    footer: invoice.footer,
    design,
  });

  const buffer = Buffer.from(pdfBytes);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNo}.pdf"`,
      "Content-Length": String(buffer.length),
    },
  });
}
