import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/tripay";
import { sendWA, waMsg } from "@/lib/whatsapp";

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

    await prisma.invoice.updateMany({
      where: { tripayRef: reference },
      data:  {
        status: "PAID",
        paidAt: paid_at ? new Date(paid_at * 1000) : new Date(),
      },
    });

    console.log(`[Tripay Webhook] Invoice ${reference} ditandai LUNAS`);

    // Send WA notifications after response via after()
    if (invoice) {
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
  }

  return NextResponse.json({ success: true });
}
