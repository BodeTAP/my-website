import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/tripay";
import { sendWA, waMsg } from "@/lib/whatsapp";

type InvoiceLineItem = {
  type?: string;
  packageId?: string;
};

/**
 * POST /api/webhooks/tripay
 *
 * Daftarkan URL ini sebagai Callback URL di dashboard Tripay:
 *   https://[domain]/api/webhooks/tripay
 */
export async function POST(req: NextRequest) {
  const rawBody   = await req.text();
  const signature = req.headers.get("x-callback-signature") ?? "";

  // Verify signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("[Tripay Webhook] Signature tidak valid");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    reference:      string;
    merchant_ref:   string;
    status:         string;
    paid_at?:       number;
    payment_method?: string;
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { reference, status, paid_at } = payload;
  const paymentMethod = payload.payment_method ?? "–";

  console.log(`[Tripay Webhook] ref=${reference} status=${status}`);

  const STATUS_MAP: Record<string, string> = {
    PAID:    "PAID",
    UNPAID:  "UNPAID",
    EXPIRED: "EXPIRED",
    FAILED:  "FAILED",
  };
  const mappedStatus = STATUS_MAP[status];
  if (!mappedStatus) {
    console.warn(`[Tripay Webhook] Status tidak dikenal: ${status}`);
    return NextResponse.json({ success: true });
  }

  if (status === "PAID") {
    // Fetch invoice + client before update so we have phone + name
    const invoice = await prisma.invoice.findFirst({
      where:   { tripayRef: reference },
      include: {
        client: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    const updateResult = await prisma.invoice.updateMany({
      where: { tripayRef: reference, status: { not: "PAID" } },
      data:  {
        status: "PAID",
        paidAt: paid_at ? new Date(paid_at * 1000) : new Date(),
      },
    });

    const newlyPaid = updateResult.count > 0;
    console.log(
      newlyPaid
        ? `[Tripay Webhook] Invoice ${reference} ditandai LUNAS`
        : `[Tripay Webhook] Invoice ${reference} sudah pernah ditandai LUNAS`,
    );

    if (invoice && newlyPaid) {
      const lineItems = Array.isArray(invoice.lineItems)
        ? (invoice.lineItems as unknown as InvoiceLineItem[])
        : [];
      const creditItem = lineItems.find((item) => item.type === "credit_package");

      if (creditItem?.packageId) {
        const existingTopup = await prisma.creditTransaction.findFirst({
          where: {
            clientId: invoice.clientId,
            type: "TOPUP",
            meta: { path: ["invoiceId"], equals: invoice.id },
          },
          select: { id: true },
        });

        const pkg = await prisma.creditPackage.findUnique({
          where: { id: String(creditItem.packageId) },
        });

        if (pkg && !existingTopup) {
          const { topupCredits } = await import("@/lib/credits");
          await topupCredits(
            invoice.clientId,
            pkg.credits + pkg.bonusCredit,
            `Pembelian Paket ${pkg.name}`,
            pkg.id,
            { invoiceId: invoice.id, invoiceNo: invoice.invoiceNo, tripayRef: reference },
          );
        }
      }
    }

    // Send WA notifications after response via after()
    if (invoice && newlyPaid) {
      const clientName  = invoice.client.user.name ?? invoice.client.businessName;
      const adminPhone  = process.env.ADMIN_WHATSAPP_NUMBER ?? process.env.WHATSAPP_NUMBER;

      after(async () => {
        // WA ke klien (jika ada nomor)
        if (invoice.client.phone) {
          await sendWA(
            invoice.client.phone,
            waMsg.paymentPaid(clientName, invoice.invoiceNo, invoice.amount, paymentMethod),
          );
        }
        // WA ke admin
        if (adminPhone) {
          await sendWA(
            adminPhone,
            waMsg.paymentReceivedAdmin(
              clientName,
              invoice.client.businessName,
              invoice.invoiceNo,
              invoice.amount,
              paymentMethod,
            ),
          );
        }
      });
    }
  } else {
    // EXPIRED or FAILED — just update status, no WA needed
    await prisma.invoice.updateMany({
      where: { tripayRef: reference },
      data:  { status: mappedStatus as "EXPIRED" | "FAILED" },
    });
    console.log(`[Tripay Webhook] Invoice ${reference} → ${mappedStatus}`);
  }

  return NextResponse.json({ success: true });
}
