import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/cron/publish-scheduled
 *
 * Publish semua artikel DRAFT yang scheduledAt-nya sudah lewat.
 *
 * Keamanan: header x-cron-secret harus cocok dengan env CRON_SECRET.
 * Juga menerima format Vercel Cron: Authorization: Bearer {CRON_SECRET}
 *
 * Setup gratis via cron-job.org:
 *   URL    : https://[domain]/api/cron/publish-scheduled
 *   Method : POST
 *   Header : x-cron-secret: [nilai CRON_SECRET]
 *   Schedule: setiap jam (0 * * * *)
 *
 * Atau gunakan Vercel Cron (Pro plan) dengan vercel.json:
 *   { "crons": [{ "path": "/api/cron/publish-scheduled", "schedule": "0 * * * *" }] }
 */
export async function POST(req: NextRequest) {
  const secret  = process.env.CRON_SECRET;
  const given   =
    req.headers.get("x-cron-secret") ??
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!secret || given !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const result = await prisma.article.updateMany({
    where: {
      status:      "DRAFT",
      scheduledAt: { lte: now, not: null },
    },
    data: {
      status:      "PUBLISHED",
      publishedAt: now,
      scheduledAt: null,
    },
  });

  console.log(`[CRON] publish-scheduled: ${result.count} artikel diterbitkan pada ${now.toISOString()}`);

  return NextResponse.json({ published: result.count, at: now.toISOString() });
}

// Allow GET for quick health-check / manual trigger via browser (admin only)
export async function GET(req: NextRequest) {
  return POST(req);
}
