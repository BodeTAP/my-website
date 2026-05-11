import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("clients");
  if (denied) return denied;

  const { id } = await params;
  const { status } = await req.json();
  const form = await prisma.onboardingForm.update({ where: { id }, data: { status } });
  return NextResponse.json(form);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("clients");
  if (denied) return denied;

  const { id } = await params;
  await prisma.onboardingForm.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
