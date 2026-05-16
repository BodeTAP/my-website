import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

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

async function generateInvoiceNo(clientId: string) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.generatedInvoice.count({ where: { clientId } });
  return `IG-${date}-${String(count + 1).padStart(3, "0")}`;
}

export async function POST(_req: Request, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const current = await prisma.generatedInvoice.findFirst({
    where: { id, clientId },
  });
  if (!current) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });

  const invoiceNo = await generateInvoiceNo(clientId);
  const invoice = await prisma.generatedInvoice.create({
    data: {
      clientId,
      invoiceNo,
      templateName: current.templateName,
      title: `${current.title} (Copy)`.slice(0, 120),
      fromName: current.fromName,
      fromEmail: current.fromEmail,
      fromPhone: current.fromPhone,
      fromAddress: current.fromAddress,
      billToName: current.billToName,
      billToEmail: current.billToEmail,
      billToPhone: current.billToPhone,
      billToAddress: current.billToAddress,
      issueDate: new Date(),
      dueDate: current.dueDate,
      lineItems: current.lineItems as Prisma.InputJsonValue,
      subtotal: current.subtotal,
      discount: current.discount,
      taxLabel: current.taxLabel,
      taxAmount: current.taxAmount,
      total: current.total,
      notes: current.notes,
      footer: current.footer,
      design: current.design as Prisma.InputJsonValue,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}
