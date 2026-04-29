import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWA, waMsg } from "@/lib/whatsapp";
import { differenceInDays, startOfDay } from "date-fns";
import { after } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      status: "UNPAID",
      dueDate: { not: null },
      reminderSentAt: null,
    },
    include: {
      client: {
        include: { user: true },
      },
    },
  });

  const today = startOfDay(new Date());
  let sentCount = 0;

  for (const inv of invoices) {
    const daysDiff = differenceInDays(startOfDay(inv.dueDate!), today);
    const validDays = [3, 1, 0, -1];

    if (validDays.includes(daysDiff)) {
      sentCount++;
      
      after(async () => {
        await sendWA(
          inv.client.phone!,
          waMsg.invoiceReminder(
            inv.client.user.name || "Klien",
            inv.invoiceNo,
            inv.amount,
            inv.dueDate!,
            inv.paymentUrl,
            daysDiff
          )
        );
        
        await prisma.invoice.update({
          where: { id: inv.id },
          data: { reminderSentAt: new Date() },
        });
      });
    }
  }

  return NextResponse.json({ sent: sentCount });
}
