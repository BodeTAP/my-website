import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { BroadcastRecipientStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = new Set<string>(["QUEUED", "SENT", "FAILED", "SKIPPED", "OPTED_OUT"]);

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
  const rawStatus = searchParams.get("status") ?? "ALL";
  const statusFilter: BroadcastRecipientStatus | undefined =
    rawStatus !== "ALL" && VALID_STATUSES.has(rawStatus)
      ? (rawStatus as BroadcastRecipientStatus)
      : undefined;

  const log = await prisma.broadcastLog.findUnique({ where: { id } });
  if (!log) return NextResponse.json({ error: "Broadcast log tidak ditemukan" }, { status: 404 });

  const where = {
    broadcastId: id,
    ...(statusFilter !== undefined ? { status: statusFilter } : {}),
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

  // Conversion metric must be computed across the whole broadcast, not just the
  // current page — otherwise optInCount/sent is mismatched (page subset over full sent).
  const optInCount = await prisma.broadcastRecipient.count({
    where: {
      broadcastId: id,
      status: { in: ["QUEUED", "SENT"] },
      lead: { is: { waOptInStatus: "OPTED_IN" } },
    },
  });

  return NextResponse.json({
    log,
    recipients,
    total,
    optInCount,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  });
}
