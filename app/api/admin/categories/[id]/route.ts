import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("articles");
  if (denied) return denied;

  const { id } = await params;
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const category = await prisma.category.update({ where: { id }, data: { name: name.trim(), slug } });
  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("articles");
  if (denied) return denied;

  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
