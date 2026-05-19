import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/leads/broadcast/[id]
 * Returns per-recipient details for a specific broadcast log.
 */
export async function GET(req: NextRequest, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("broadcast");
  if (denied) return denied;

  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const page    = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(10, Number(searchParams.get("perPage") ?? "50")));
  const status  = searchParams.get("status") ?? "ALL";

  const log = await prisma.broadcastLog.findUnique({ where: { id } });
  if (!log) return NextResponse.json({ error: "Broadcast log tidak ditemukan" }, { status: 404 });

  const where = {
    broadcastId: id,
    ...(status !== "ALL" ? { status } : {}),
  };

  const [total, recipients] = await Promise.all([
    prisma.broadcastRecipient.count({ where }),
    prisma.broadcastRecipient.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip:  (page - 1) * perPage,
      take:  perPage,
      include: {
        lead: {
          select: { id: true, name: true, businessName: true, waOptInStatus: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    log,
    recipients,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  });
}
