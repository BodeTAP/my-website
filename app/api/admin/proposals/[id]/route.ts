import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") return null;
  return session;
}

export async function GET(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { lead: true },
  });
  if (!proposal) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json(proposal);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const proposal = await prisma.proposal.update({
    where: { id },
    data: {
      ...(body.status      !== undefined && { status: body.status }),
      ...(body.clientName  !== undefined && { clientName: body.clientName }),
      ...(body.businessName!== undefined && { businessName: body.businessName }),
      ...(body.whatsapp    !== undefined && { whatsapp: body.whatsapp }),
      ...(body.packageType !== undefined && { packageType: body.packageType }),
      ...(body.packageLabel!== undefined && { packageLabel: body.packageLabel }),
      ...(body.addons      !== undefined && { addons: body.addons }),
      ...(body.customItems !== undefined && { customItems: body.customItems }),
      ...(body.basePrice   !== undefined && { basePrice: body.basePrice }),
      ...(body.totalPrice  !== undefined && { totalPrice: body.totalPrice }),
      ...(body.timeline    !== undefined && { timeline: body.timeline }),
      ...(body.validUntil  !== undefined && { validUntil: body.validUntil ? new Date(body.validUntil) : null }),
      ...(body.notes       !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json(proposal);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.proposal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
