import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTransaction } from "@/lib/tripay";
import { sendWA, waMsg } from "@/lib/whatsapp";
import { subHours } from "date-fns";
import { after } from "next/server";
import { getSiteSettings, getAdminPhone, isWaNotifyEnabled } from "@/lib/siteSettings";

type InvoiceLineItem = {
  type?: string;
  packageId?: string;
};

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threshold = subHours(new Date(), 1);
  const invoices = await prisma.invoice.findMany({
    where: {
      status: "UNPAID",
      tripayRef: { not: null },
      createdAt: { lt: threshold },
    },
    include: {
      client: { include: { user: true } },
    },
  });

  let reconciledCount = 0;

  for (const inv of invoices) {
    try {
      console.log(`[RECONCILE] Checking invoice ${inv.invoiceNo} (Ref: ${inv.tripayRef})`);
      const tripayTx = await getTransaction(inv.tripayRef!);

      if (tripayTx.status === "PAID") {
        // Guard against race with the Tripay webhook: only proceed if WE are the
        // one flipping it to PAID. updateMany with status filter is atomic.
        const updateResult = await prisma.invoice.updateMany({
          where: { id: inv.id, status: { not: "PAID" } },
          data: {
            status: "PAID",
            paidAt: tripayTx.paid_at ? new Date(tripayTx.paid_at * 1000) : new Date(),
          },
        });

        if (updateResult.count === 0) {
          // Webhook already marked it paid — skip to avoid duplicate notifications/topup.
          continue;
        }

        reconciledCount++;

        // Replicate the webhook's idempotent credit top-up for credit-package invoices.
        const lineItems = Array.isArray(inv.lineItems)
          ? (inv.lineItems as unknown as InvoiceLineItem[])
          : [];
        const creditItem = lineItems.find((item) => item.type === "credit_package");
        if (creditItem?.packageId) {
          const existingTopup = await prisma.creditTransaction.findFirst({
            where: {
              clientId: inv.clientId,
              type: "TOPUP",
              meta: { path: ["invoiceId"], equals: inv.id },
            },
            select: { id: true },
          });
          const pkg = await prisma.creditPackage.findUnique({
            where: { id: String(creditItem.packageId) },
          });
          if (pkg && !existingTopup) {
            const { topupCredits } = await import("@/lib/credits");
            await topupCredits(
              inv.clientId,
              pkg.credits + pkg.bonusCredit,
              `Pembelian Paket ${pkg.name}`,
              pkg.id,
              { invoiceId: inv.id, invoiceNo: inv.invoiceNo, tripayRef: inv.tripayRef },
            );
          }
        }

        after(async () => {
          const settings = await getSiteSettings();
          const adminPhone = getAdminPhone(settings);
          if (adminPhone && isWaNotifyEnabled(settings, "wa_notify_payment_paid_admin")) {
            await sendWA(adminPhone, `⚠️ Reconciliation: Invoice ${inv.invoiceNo} ditandai LUNAS (webhook missed)`);
          }
          if (inv.client.phone && isWaNotifyEnabled(settings, "wa_notify_payment_paid_client")) {
            await sendWA(
              inv.client.phone,
              waMsg.paymentPaid(
                inv.client.user.name || "Klien",
                inv.invoiceNo,
                inv.amount,
                "Tripay (Reconciled)"
              )
            );
          }
        });
      }
    } catch (err) {
      console.error(`[RECONCILE] Error checking invoice ${inv.invoiceNo}:`, err);
    }
  }

  return NextResponse.json({ reconciled: reconciledCount });
}
