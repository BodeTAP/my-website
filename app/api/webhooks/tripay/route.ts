import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/tripay";

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
    reference:   string;
    merchant_ref:string;
    status:      string;
    paid_at?:    number;
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { reference, status, paid_at } = payload;

  console.log(`[Tripay Webhook] ref=${reference} status=${status}`);

  if (status === "PAID") {
    await prisma.invoice.updateMany({
      where: { tripayRef: reference },
      data:  {
        status:  "PAID",
        paidAt:  paid_at ? new Date(paid_at * 1000) : new Date(),
      },
    });
    console.log(`[Tripay Webhook] Invoice ${reference} ditandai LUNAS`);
  }

  // Tripay expects a 200 response with JSON
  return NextResponse.json({ success: true });
}
