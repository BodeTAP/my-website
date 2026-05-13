import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVisibleProposalTemplates, parseSections, parseVariables } from "@/lib/proposalTemplates";

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

export async function GET() {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const templates = await getVisibleProposalTemplates(clientId);
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const body = await req.json();
  const sections = parseSections(body.sections);
  const variables = parseVariables(body.variables);

  if (!body.name?.trim()) return NextResponse.json({ error: "Nama template wajib diisi" }, { status: 400 });
  if (sections.length === 0) return NextResponse.json({ error: "Template harus memiliki minimal satu section" }, { status: 400 });

  const template = await prisma.proposalTemplate.create({
    data: {
      clientId,
      name: body.name.trim(),
      category: body.category?.trim() || "Custom",
      description: body.description?.trim() || null,
      sections,
      variables,
      isDefault: false,
      isActive: true,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}

