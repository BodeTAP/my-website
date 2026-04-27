import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function PATCH(req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, description, price, features, isActive } = await req.json();

  const pkg = await prisma.maintenancePackage.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(price !== undefined && { price: Math.round(Number(price)) }),
      ...(features !== undefined && { features: Array.isArray(features) ? features : [] }),
      ...(isActive !== undefined && { isActive }),
    },
  });
  return NextResponse.json(pkg);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.maintenancePackage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
