import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId, invoiceNo, description, amount, dueDate, whatsappMsg } = await req.json();

  if (!clientId || !invoiceNo?.trim() || !amount) {
    return NextResponse.json({ error: "Klien, nomor invoice, dan jumlah wajib diisi." }, { status: 400 });
  }

  const existing = await prisma.invoice.findUnique({ where: { invoiceNo: invoiceNo.trim() } });
  if (existing) {
    return NextResponse.json({ error: "Nomor invoice sudah digunakan." }, { status: 409 });
  }

  const invoice = await prisma.invoice.create({
    data: {
      clientId,
      invoiceNo: invoiceNo.trim(),
      description: description?.trim() || null,
      amount: Math.round(Number(amount)),
      dueDate: dueDate ? new Date(dueDate) : null,
      whatsappMsg: whatsappMsg?.trim() || null,
      status: "UNPAID",
    },
    include: { client: { include: { user: { select: { name: true } } } } },
  });

  return NextResponse.json(invoice, { status: 201 });
}
