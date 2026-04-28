import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceCreatedEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { sendWA, waMsg } from "@/lib/whatsapp";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId, invoiceNo, description, amount, lineItems, dueDate, whatsappMsg } = await req.json();

  if (!clientId || !invoiceNo?.trim() || !amount) {
    return NextResponse.json({ error: "Klien, nomor invoice, dan jumlah wajib diisi." }, { status: 400 });
  }

  // Only allow alphanumeric, hyphens, and dots — blocks any special chars in headers/PDF
  if (!/^[A-Z0-9\-\.]{3,30}$/i.test(invoiceNo.trim())) {
    return NextResponse.json({ error: "Nomor invoice hanya boleh mengandung huruf, angka, dan tanda hubung." }, { status: 400 });
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
      lineItems: Array.isArray(lineItems) ? lineItems : [],
      dueDate: dueDate ? new Date(dueDate) : null,
      whatsappMsg: whatsappMsg?.trim() || null,
      status: "UNPAID",
    },
    include: { client: { include: { user: { select: { name: true, email: true } } } } },
  });

  // Non-blocking email + in-app notification
  const clientEmail = invoice.client.user.email;
  const clientName  = invoice.client.user.name ?? invoice.client.businessName;
  const rpAmount    = `Rp ${invoice.amount.toLocaleString("id-ID")}`;
  if (clientEmail) {
    sendInvoiceCreatedEmail(clientEmail, clientName, invoice.invoiceNo, invoice.amount, invoice.dueDate)
      .catch(() => {});
  }
  createNotification(
    invoice.clientId,
    "INVOICE_NEW",
    "Invoice Baru Diterbitkan",
    `Invoice ${invoice.invoiceNo} sebesar ${rpAmount} telah diterbitkan. Silakan cek halaman invoice.`,
    "/portal/invoices",
  ).catch(() => {});
  if (invoice.client.phone) {
    sendWA(
      invoice.client.phone,
      waMsg.invoiceNew(clientName, invoice.invoiceNo, invoice.amount, invoice.dueDate),
    ).catch(() => {});
  }

  return NextResponse.json(invoice, { status: 201 });
}
