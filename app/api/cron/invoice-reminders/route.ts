import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWA, waMsg } from "@/lib/whatsapp";
import { differenceInDays, startOfDay } from "date-fns";
import { after } from "next/server";
import { getSiteSettings, renderSettingTemplate } from "@/lib/siteSettings";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getSiteSettings();

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
    const validDays = settings.invoice_reminder_schedule_days
      .split(",")
      .map((day) => Number.parseInt(day.trim(), 10))
      .filter(Number.isFinite);

    if (validDays.includes(daysDiff)) {
      sentCount++;
      
      after(async () => {
        if (!inv.client.phone) {
          console.warn(`[InvoiceReminder] Client ${inv.clientId} tidak punya nomor WA — reminder dilewati`);
          return;
        }
        const clientName = inv.client.user.name || "Klien";
        const paymentUrl = inv.paymentUrl ?? `${settings.brand_site_url}/bayar/${inv.invoiceNo}`;
        const templateMessage = settings.template_wa_invoice_reminder
          ? renderSettingTemplate(settings.template_wa_invoice_reminder, {
              brandName: settings.brand_name,
              clientName,
              invoiceNo: inv.invoiceNo,
              amount: `Rp ${inv.amount.toLocaleString("id-ID")}`,
              dueDate: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(inv.dueDate!),
              paymentUrl,
              daysLeft: daysDiff,
            })
          : "";
        await sendWA(
          inv.client.phone,
          templateMessage || waMsg.invoiceReminder(
            clientName,
            inv.invoiceNo,
            inv.amount,
            inv.dueDate!,
            paymentUrl,
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
