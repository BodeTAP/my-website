import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTransaction } from "@/lib/tripay";
import { sendWA, waMsg } from "@/lib/whatsapp";
import { subHours } from "date-fns";
import { after } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
        reconciledCount++;
        
        await prisma.invoice.update({
          where: { id: inv.id },
          data: { 
            status: "PAID",
            paidAt: tripayTx.paid_at ? new Date(tripayTx.paid_at * 1000) : new Date(),
          },
        });

        after(async () => {
          const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
          if (adminPhone) {
            await sendWA(adminPhone, `⚠️ Reconciliation: Invoice ${inv.invoiceNo} ditandai LUNAS (webhook missed)`);
          }
          await sendWA(
            inv.client.phone!,
            waMsg.paymentPaid(
              inv.client.user.name || "Klien",
              inv.invoiceNo,
              inv.amount,
              "Tripay (Reconciled)"
            )
          );
        });
      }
    } catch (err) {
      console.error(`[RECONCILE] Error checking invoice ${inv.invoiceNo}:`, err);
    }
  }

  return NextResponse.json({ reconciled: reconciledCount });
}
