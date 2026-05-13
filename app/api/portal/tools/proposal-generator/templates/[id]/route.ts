import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSections, parseVariables } from "@/lib/proposalTemplates";

type Params = { params: Promise<{ id: string }> };

async function getClientId() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, clientId: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });

  if (!user?.client) return { status: 404 as const, clientId: null };
  return { status: 200 as const, clientId: user.client.id };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const existing = await prisma.proposalTemplate.findFirst({
    where: { id, clientId, isDefault: false },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const sections = parseSections(body.sections);
  const variables = parseVariables(body.variables);

  if (!body.name?.trim()) return NextResponse.json({ error: "Nama template wajib diisi" }, { status: 400 });
  if (sections.length === 0) return NextResponse.json({ error: "Template harus memiliki minimal satu section" }, { status: 400 });

  const template = await prisma.proposalTemplate.update({
    where: { id },
    data: {
      name: body.name.trim(),
      category: body.category?.trim() || "Custom",
      description: body.description?.trim() || null,
      sections,
      variables,
      isActive: body.isActive !== false,
    },
  });

  return NextResponse.json({ template });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const existing = await prisma.proposalTemplate.findFirst({
    where: { id, clientId, isDefault: false },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });

  await prisma.proposalTemplate.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}

