import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function generateProposalNo(clientId: string) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.generatedProposal.count({ where: { clientId } });
  return `PG-${date}-${String(count + 1).padStart(3, "0")}`;
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const source = await prisma.generatedProposal.findFirst({
    where: { id, clientId },
  });
  if (!source) return NextResponse.json({ error: "Proposal tidak ditemukan" }, { status: 404 });

  const proposalNo = await generateProposalNo(clientId);
  const newTitle = `Copy - ${source.title}`;

  // Update content title to match
  let contentJson: Prisma.InputJsonValue;
  if (source.content && typeof source.content === "object" && !Array.isArray(source.content)) {
    const record = source.content as Record<string, unknown>;
    contentJson = asJson({ ...record, title: newTitle });
  } else {
    contentJson = asJson(source.content);
  }

  const duplicate = await prisma.generatedProposal.create({
    data: {
      clientId,
      templateId: source.templateId,
      proposalNo,
      title: newTitle,
      prospectName: source.prospectName,
      businessName: source.businessName,
      whatsapp: source.whatsapp,
      validUntil: source.validUntil,
      notes: source.notes,
      templateName: source.templateName,
      design: source.design ? asJson(source.design) : undefined,
      input: asJson(source.input),
      content: contentJson,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ proposal: duplicate }, { status: 201 });
}
