import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransaction, TripayItem } from "@/lib/tripay";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

type Params = { params: Promise<{ invoiceNo: string }> };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.id";

export async function POST(req: NextRequest, { params }: Params) {
  // Rate limit: 5 requests per minute per IP
  const ip = getClientIP(req);
  const rl = rateLimit(`pay:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi." }, { status: 429 });
  }

  const { invoiceNo } = await params;
  const decoded = decodeURIComponent(invoiceNo);

  const invoice = await prisma.invoice.findUnique({
    where:   { invoiceNo: decoded },
    include: { client: { include: { user: { select: { name: true, email: true } } } } },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  if (invoice.status === "PAID") return NextResponse.json({ error: "Invoice sudah lunas" }, { status: 400 });

  // Return existing payment URL if available
  if (invoice.paymentUrl && invoice.tripayRef) {
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

    return NextResponse.json({ paymentUrl: tx.checkout_url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal membuat transaksi";
    console.error("[Tripay Public Pay] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
