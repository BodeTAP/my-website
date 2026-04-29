import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWA } from "@/lib/whatsapp";
import { after } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const overdue = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      nextBillingDate: { lt: new Date() },
    },
    include: {
      client: true,
      package: true,
    },
  });

  if (overdue.length === 0) {
    return NextResponse.json({ message: "No overdue subscriptions" });
  }

  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
  if (!adminPhone) return NextResponse.json({ error: "Admin phone not set" }, { status: 500 });

  const list = overdue
    .map((s) => `- ${s.client.businessName} (${s.package.name})`)
    .join("\n");
  
  const message = `⚠️ ${overdue.length} langganan belum di-generate invoice:\n${list}`;

  after(async () => {
    await sendWA(adminPhone, message);
  });

  return NextResponse.json({ alerted: overdue.length });
}
