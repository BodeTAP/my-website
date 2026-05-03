import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransaction, TripayItem } from "@/lib/tripay";
import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { sendWA, waMsg, normalizePhone } from "@/lib/whatsapp";

type Params = { params: Promise<{ invoiceNo: string }> };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.id";

export async function POST(req: NextRequest, { params }: Params) {
  const ip = getClientIP(req);
  const rl = await rateLimit(`pay:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi." }, { status: 429 });
  }

  const { invoiceNo } = await params;
  const decoded = decodeURIComponent(invoiceNo);

  // Payment method is required
  let method = "QRIS2";
  let methodName = "QRIS";
  try {
    const body = await req.json() as { method?: string; methodName?: string };
    if (body.method) method = body.method;
    if (body.methodName) methodName = body.methodName;
  } catch { /* no body = use default */ }

  const invoice = await prisma.invoice.findUnique({
    where:   { invoiceNo: decoded },
    include: { client: { include: { user: { select: { name: true, email: true } } } } },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  if (invoice.status === "PAID") return NextResponse.json({ error: "Invoice sudah lunas" }, { status: 400 });

  // Return existing payment URL if available — still re-send WA so client has the link handy
  if (invoice.paymentUrl && invoice.tripayRef) {
    const phone = invoice.client.phone;
    const name  = invoice.client.user.name ?? invoice.client.businessName;
    if (phone) {
      after(async () => {
        await sendWA(
          normalizePhone(phone),
          waMsg.paymentInitiated(name, invoice.invoiceNo, invoice.amount, methodName, invoice.paymentUrl!),
        );
      });
    }
    return NextResponse.json({ paymentUrl: invoice.paymentUrl });
  }

  type StoredItem = { label: string; amount: number };
  const stored = (invoice.lineItems as StoredItem[]) ?? [];
  const orderItems: TripayItem[] = stored.length > 0 && stored.some(i => i.label)
    ? stored.filter(i => i.label).map(i => ({ name: i.label, price: i.amount, quantity: 1 }))
    : [{ name: invoice.description ?? "Jasa Pembuatan Website — MFWEB", price: invoice.amount, quantity: 1 }];

  const clientName  = invoice.client.user.name ?? invoice.client.businessName;
  const clientEmail = invoice.client.user.email;
  const clientPhone = invoice.client.phone ?? undefined;

  try {
    const tx = await createTransaction({
      method,
      merchantRef:   invoice.invoiceNo,
      amount:        invoice.amount,
      customerName:  clientName,
      customerEmail: clientEmail,
      customerPhone: clientPhone,
      orderItems,
      returnUrl:     `${SITE}/bayar/${encodeURIComponent(invoice.invoiceNo)}`,
      callbackUrl:   `${SITE}/api/webhooks/tripay`,
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data:  { tripayRef: tx.reference, paymentUrl: tx.checkout_url },
    });

    const phone = invoice.client.phone;
    const name  = invoice.client.user.name ?? invoice.client.businessName;
    if (phone) {
      after(async () => {
        await sendWA(
          normalizePhone(phone),
          waMsg.paymentInitiated(name, invoice.invoiceNo, invoice.amount, methodName, tx.checkout_url, tx.pay_code),
        );
      });
    }

    return NextResponse.json({ paymentUrl: tx.checkout_url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal membuat transaksi";
    console.error("[Tripay Public Pay] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
