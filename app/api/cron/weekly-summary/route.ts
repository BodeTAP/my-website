import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWA } from "@/lib/whatsapp";
import { subDays } from "date-fns";
import { after } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = subDays(new Date(), 7);

  const [leads, paidInvoices, unpaidOld, projects, tickets] = await Promise.all([
    prisma.lead.findMany({
      where: { createdAt: { gte: weekStart } },
      select: { businessName: true },
    }),
    prisma.invoice.aggregate({
      where: { status: "PAID", paidAt: { gte: weekStart } },
      _count: true,
      _sum: { amount: true },
    }),
    prisma.invoice.count({
      where: { status: "UNPAID", createdAt: { lt: weekStart } },
    }),
    prisma.project.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.ticket.count({
      where: { status: "OPEN" },
    }),
  ]);

  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
  if (!adminPhone) return NextResponse.json({ error: "Admin phone not set" }, { status: 500 });

  const leadList = leads.length > 0 
    ? leads.map(l => `- ${l.businessName}`).join("\n")
    : "- Tidak ada lead baru";

  const projectStats = projects
    .map(p => `- ${p.status}: ${p._count}`)
    .join("\n") || "- Tidak ada proyek aktif";

  const message = 
    `📊 *Weekly Business Summary*\n` +
    `📅 7 hari terakhir\n\n` +
    `📈 *Leads Baru:* ${leads.length}\n${leadList}\n\n` +
    `💰 *Invoices Lunas:* ${paidInvoices._count} (Rp ${paidInvoices._sum.amount?.toLocaleString("id-ID") || 0})\n` +
    `⏳ *Invoices Menunggak (>7hr):* ${unpaidOld}\n\n` +
    `🛠️ *Status Proyek:*\n${projectStats}\n\n` +
    `🎫 *Tiket Open:* ${tickets}\n\n` +
    `_MFWEB Admin Automation_`;

  after(async () => {
    await sendWA(adminPhone, message);
  });

  return NextResponse.json({ success: true });
}
