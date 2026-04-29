import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchPaymentChannels } from "@/lib/tripay";
import { sendWA } from "@/lib/whatsapp";
import { subHours } from "date-fns";
import { after } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const channels = await fetchPaymentChannels();
    
    if (!channels || channels.length === 0) {
      throw new Error("No payment channels returned");
    }

    await prisma.siteSetting.upsert({
      where: { key: "tripay_health_status" },
      create: { key: "tripay_health_status", value: "ok" },
      update: { value: "ok" },
    });

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    const lastAlert = await prisma.siteSetting.findUnique({
      where: { key: "tripay_last_alert_at" },
    });

    const shouldAlert = !lastAlert || new Date(lastAlert.value) < subHours(new Date(), 1);

    if (shouldAlert) {
      const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
      if (adminPhone) {
        after(async () => {
          await sendWA(adminPhone, "🚨 Tripay payment channels tidak bisa diakses");
          await prisma.siteSetting.upsert({
            where: { key: "tripay_last_alert_at" },
            create: { key: "tripay_last_alert_at", value: new Date().toISOString() },
            update: { value: new Date().toISOString() },
          });
        });
      }
    }

    return NextResponse.json({ status: "error", message: (err as Error).message });
  }
}
