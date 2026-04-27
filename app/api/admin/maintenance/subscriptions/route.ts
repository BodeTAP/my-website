import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function GET() {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const subs = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { businessName: true, user: { select: { name: true } } } },
      package: { select: { name: true, price: true } },
    },
  });
  return NextResponse.json(subs);
}

export async function POST(req: Request) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { clientId, packageId, startDate, notes } = await req.json();

  if (!clientId || !packageId) {
    return NextResponse.json({ error: "Klien dan paket wajib dipilih." }, { status: 400 });
  }

  const start = startDate ? new Date(startDate) : new Date();
  const nextBilling = new Date(start);
  nextBilling.setMonth(nextBilling.getMonth() + 1);

  const sub = await prisma.subscription.create({
    data: {
      clientId,
      packageId,
      startDate: start,
      nextBillingDate: nextBilling,
      notes: notes?.trim() || null,
    },
    include: {
      client: { select: { businessName: true, user: { select: { name: true } } } },
      package: { select: { name: true, price: true } },
    },
  });
  return NextResponse.json(sub, { status: 201 });
}
