import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendHostingExpiryEmail } from "@/lib/email";
import { sendWA, waMsg } from "@/lib/whatsapp";

const CRON_SECRET = process.env.CRON_SECRET;

function daysBetween(a: Date, b: Date) {
  return Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

// POST /api/cron/hosting-expiry
// Dipanggil oleh cron-job.org setiap hari jam 07.00 WIB
export async function POST(req: NextRequest) {
  // Verifikasi CRON_SECRET untuk keamanan
  const secret = req.headers.get("x-cron-secret");
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now   = new Date();
  const MILESTONES = [7, 14, 30]; // hari pengiriman notifikasi

  const records = await prisma.hostingRecord.findMany({
    where: { status: "ACTIVE" },
    include: {
      client: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  const results: string[] = [];

  for (const record of records) {
    const clientName = record.client.user.name ?? "Klien";
    const clientEmail = record.client.user.email;
    const clientPhone = record.client?.phone ?? "";

    // Cek domain, hosting, ssl secara terpisah
    const checks: { type: "domain" | "hosting" | "ssl"; expiry: Date | null }[] = [
      { type: "domain",  expiry: record.domainExpiry },
      { type: "hosting", expiry: record.hostingExpiry },
      { type: "ssl",     expiry: record.sslExpiry },
    ];

    for (const { type, expiry } of checks) {
      if (!expiry) continue;

      const daysLeft = daysBetween(expiry, now);
      if (daysLeft < 0) continue; // sudah expired, skip

      // Tentukan milestone mana yang harus dikirim
      let shouldSend = false;
      let milestoneField: "notif30SentAt" | "notif14SentAt" | "notif7SentAt" | null = null;

      if (daysLeft <= 7 && !record.notif7SentAt) {
        shouldSend = true;
        milestoneField = "notif7SentAt";
      } else if (daysLeft <= 14 && !record.notif14SentAt) {
        shouldSend = true;
        milestoneField = "notif14SentAt";
      } else if (daysLeft <= 30 && !record.notif30SentAt) {
        shouldSend = true;
        milestoneField = "notif30SentAt";
      }

      if (!shouldSend || !milestoneField) continue;

      const label = `${record.domainName} [${type}] H-${daysLeft}`;
      try {
        // 1. Kirim Email
        await sendHostingExpiryEmail(clientEmail, clientName, record.domainName, expiry, daysLeft, type);

        // 2. Kirim WhatsApp (jika ada nomor)
        if (clientPhone) {
          const msg = waMsg.hostingExpiry(clientName, record.domainName, expiry, daysLeft, type);
          await sendWA(clientPhone, msg);
        }

        // 3. Simpan in-app notification
        await prisma.notification.create({
          data: {
            clientId: record.clientId,
            type:     "HOSTING_EXPIRY",
            title:    `${type === "domain" ? "Domain" : type === "hosting" ? "Hosting" : "SSL"} akan expired dalam ${daysLeft} hari`,
            body:     `${record.domainName} akan expired pada ${expiry.toLocaleDateString("id-ID")}. Segera perpanjang.`,
            link:     "/portal/hosting",
          },
        });

        // 4. Tandai milestone sudah terkirim (hanya update field yang relevan)
        await prisma.hostingRecord.update({
          where: { id: record.id },
          data:  { [milestoneField]: now },
        });

        results.push(`✅ Notif terkirim: ${label}`);
      } catch (err) {
        results.push(`❌ Gagal: ${label} — ${String(err)}`);
      }
    }
  }

  return NextResponse.json({
    ok:      true,
    checked: records.length,
    sent:    results.length,
    results,
  });
}
