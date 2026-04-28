import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTransaction, TripayItem } from "@/lib/tripay";

type Params = { params: Promise<{ id: string }> };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.id";

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:   { email: session.user.email },
    include: { client: true },
  });
  if (!user?.client) return NextResponse.json({ error: "Klien tidak ditemukan" }, { status: 404 });

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where:   { id },
    include: { client: { include: { user: { select: { name: true, email: true } } } } },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  if (invoice.clientId !== user.client.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (invoice.status === "PAID") return NextResponse.json({ error: "Invoice sudah lunas" }, { status: 400 });

  // Reuse existing payment URL if still valid
  if (invoice.paymentUrl && invoice.tripayRef) {
    return NextResponse.json({ paymentUrl: invoice.paymentUrl, ref: invoice.tripayRef });
  }

  // Build order items from lineItems or single description
  type StoredItem = { label: string; amount: number };
  const stored = (invoice.lineItems as StoredItem[]) ?? [];
  const orderItems: TripayItem[] = stored.length > 0
    ? stored.map(i => ({ name: i.label, price: i.amount, quantity: 1 }))
    : [{ name: invoice.description ?? "Jasa Pembuatan Website", price: invoice.amount, quantity: 1 }];

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
      returnUrl:     `${SITE}/portal/invoices?ref=${invoice.invoiceNo}`,
      callbackUrl:   `${SITE}/api/webhooks/tripay`,
    });

    // Persist reference and payment URL
    await prisma.invoice.update({
      where: { id },
      data:  { tripayRef: tx.reference, paymentUrl: tx.checkout_url },
    });

    return NextResponse.json({ paymentUrl: tx.checkout_url, ref: tx.reference });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal membuat transaksi";
    console.error("[Tripay] createTransaction error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
