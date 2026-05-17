import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("clients");
  if (denied) return denied;

  const clients = await prisma.client.findMany({
    orderBy: { businessName: "asc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(clients);
}
