import { NextResponse, after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceCreatedEmail, validateEmailConfig } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { sendWA, waMsg } from "@/lib/whatsapp";

export async function POST(req: Request) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId, invoiceNo, description, amount, lineItems, dueDate, whatsappMsg: customWaMsg } = await req.json();

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
      whatsappMsg: customWaMsg?.trim() || null,
      status: "UNPAID",
    },
    include: { client: { include: { user: { select: { name: true, email: true } } } } },
  });

  const clientEmail = invoice.client.user.email;
  const clientName  = invoice.client.user.name ?? invoice.client.businessName;
  const clientPhone = invoice.client.phone;
  const rpAmount    = `Rp ${invoice.amount.toLocaleString("id-ID")}`;

  // Pre-flight checks — detect config issues before after()
  const emailConfig = validateEmailConfig();
  const warnings: string[] = [];

  if (!clientPhone) {
    warnings.push("Klien tidak memiliki nomor WhatsApp — notifikasi WA dilewati.");
  }
  if (!emailConfig.valid) {
    warnings.push(`Notifikasi email dilewati: ${emailConfig.error}`);
  }

  // In-app notification (synchronous, fast)
  createNotification(
    invoice.clientId,
    "INVOICE_NEW",
    "Invoice Baru Diterbitkan",
    `Invoice ${invoice.invoiceNo} sebesar ${rpAmount} telah diterbitkan. Silakan cek halaman invoice.`,
    "/portal/invoices",
  ).catch((e) => console.error("[Notif] invoice create:", e));

  // Email + WA — run after response via after()
  after(async () => {
    // Email
    if (emailConfig.valid && clientEmail) {
      try {
        await sendInvoiceCreatedEmail(clientEmail, clientName, invoice.invoiceNo, invoice.amount, invoice.dueDate);
        console.log(`[Email] Invoice ${invoice.invoiceNo} terkirim ke ${clientEmail}`);
      } catch (e) {
        console.error(`[Email] Invoice ${invoice.invoiceNo} GAGAL:`, e);
      }
    }

    // WhatsApp
    if (clientPhone) {
      const payUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/bayar/${invoice.invoiceNo}`;
      const sent = await sendWA(
        clientPhone,
        waMsg.invoiceNew(clientName, invoice.invoiceNo, invoice.amount, invoice.dueDate, payUrl),
      );
      if (!sent) {
        console.error(`[WA] Invoice ${invoice.invoiceNo}: gagal kirim ke ${clientPhone}`);
      }
    }
  });

  return NextResponse.json(
    { ...invoice, warnings: warnings.length > 0 ? warnings : undefined },
    { status: 201 }
  );
}
