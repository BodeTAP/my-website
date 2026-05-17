import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { parseInvoiceDesign } from "@/lib/invoiceDesign";
import { prisma } from "@/lib/prisma";
import InvoiceDetailClient, { type InvoiceDetailView } from "./InvoiceDetailClient";

type Params = { params: Promise<{ id: string }> };
type RawItem = {
  description?: unknown;
  quantity?: unknown;
  price?: unknown;
};

function dateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function lineItems(value: unknown): InvoiceDetailView["lineItems"] {
  if (!Array.isArray(value)) return [{ description: "Layanan website", quantity: 1, price: 0 }];

  const items = (value as RawItem[]).map((item) => ({
    description: typeof item.description === "string" ? item.description : "",
    quantity: typeof item.quantity === "number" ? item.quantity : Number(item.quantity ?? 1),
    price: typeof item.price === "number" ? item.price : Number(item.price ?? 0),
  })).filter((item) => item.description);

  return items.length > 0 ? items : [{ description: "Layanan website", quantity: 1, price: 0 }];
}

export default async function PortalInvoiceDetailPage({ params }: Params) {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const { id } = await params;
  const invoice = await prisma.generatedInvoice.findFirst({
    where: { id, clientId: user.client.id },
  });
  if (!invoice) notFound();

  return (
    <InvoiceDetailClient
      invoice={{
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        title: invoice.title,
        fromName: invoice.fromName,
        fromEmail: invoice.fromEmail ?? "",
        fromPhone: invoice.fromPhone ?? "",
        fromAddress: invoice.fromAddress ?? "",
        billToName: invoice.billToName,
        billToEmail: invoice.billToEmail ?? "",
        billToPhone: invoice.billToPhone ?? "",
        billToAddress: invoice.billToAddress ?? "",
        issueDate: dateInput(invoice.issueDate),
        dueDate: dateInput(invoice.dueDate),
        lineItems: lineItems(invoice.lineItems),
        discount: invoice.discount,
        includeTax: invoice.taxAmount > 0,
        notes: invoice.notes ?? "",
        footer: invoice.footer ?? "",
        status: invoice.status,
        design: parseInvoiceDesign(invoice.design),
        createdAt: invoice.createdAt.toISOString(),
      }}
    />
  );
}
