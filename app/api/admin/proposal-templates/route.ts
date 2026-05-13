import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/permissions";
import { ensureDefaultProposalTemplates, parseSections, parseVariables } from "@/lib/proposalTemplates";

export async function GET() {
  const denied = await requireApiPermission("proposals");
  if (denied) return denied;

  await ensureDefaultProposalTemplates();
  const templates = await prisma.proposalTemplate.findMany({
    where: { clientId: null, isDefault: true },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const denied = await requireApiPermission("proposals");
  if (denied) return denied;

  const body = await req.json();
  const sections = parseSections(body.sections);
  const variables = parseVariables(body.variables);

  if (!body.name?.trim()) return NextResponse.json({ error: "Nama template wajib diisi" }, { status: 400 });
  if (sections.length === 0) return NextResponse.json({ error: "Template harus punya minimal satu section" }, { status: 400 });

  const template = await prisma.proposalTemplate.create({
    data: {
      clientId: null,
      name: body.name.trim(),
      category: body.category?.trim() || "General",
      description: body.description?.trim() || null,
      sections,
      variables,
      isDefault: true,
      isActive: body.isActive !== false,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}

