import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/permissions";
import { parseSections, parseVariables } from "@/lib/proposalTemplates";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireApiPermission("proposals");
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.proposalTemplate.findFirst({
    where: { id, clientId: null, isDefault: true },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const sections = parseSections(body.sections);
  const variables = parseVariables(body.variables);

  if (!body.name?.trim()) return NextResponse.json({ error: "Nama template wajib diisi" }, { status: 400 });
  if (sections.length === 0) return NextResponse.json({ error: "Template harus punya minimal satu section" }, { status: 400 });

  const template = await prisma.proposalTemplate.update({
    where: { id },
    data: {
      name: body.name.trim(),
      category: body.category?.trim() || "General",
      description: body.description?.trim() || null,
      sections,
      variables,
      isActive: body.isActive !== false,
    },
  });

  return NextResponse.json({ template });
}

export async function DELETE(_req: Request, { params }: Params) {
  const denied = await requireApiPermission("proposals");
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.proposalTemplate.findFirst({
    where: { id, clientId: null, isDefault: true },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });

  await prisma.proposalTemplate.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}

