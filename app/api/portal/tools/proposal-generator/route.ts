import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { deductCredits, getClientBalance, refundCredits } from "@/lib/credits";
import { prisma } from "@/lib/prisma";
import {
  inferProposalTitle,
  parseSections,
  PROPOSAL_GENERATOR_COST,
  renderTemplateSections,
} from "@/lib/proposalTemplates";

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

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function GET() {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const proposals = await prisma.generatedProposal.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ proposals });
}

export async function POST(req: NextRequest) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const body = await req.json();
  const templateId = typeof body.templateId === "string" ? body.templateId : "";
  const input = asRecord(body.input);

  if (!templateId) return NextResponse.json({ error: "Template wajib dipilih" }, { status: 400 });

  const template = await prisma.proposalTemplate.findFirst({
    where: {
      id: templateId,
      isActive: true,
      OR: [
        { isDefault: true, clientId: null },
        { clientId },
      ],
    },
  });

  if (!template) return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });

  const balance = await getClientBalance(clientId);
  if (balance < PROPOSAL_GENERATOR_COST) {
    return NextResponse.json(
      { error: "Kredit tidak cukup", balance, requiredCredits: PROPOSAL_GENERATOR_COST },
      { status: 402 },
    );
  }

  const sections = parseSections(template.sections);
  if (sections.length === 0) {
    return NextResponse.json({ error: "Template belum memiliki konten" }, { status: 400 });
  }

  const title = inferProposalTitle(template.name, input);
  const content = {
    title,
    sections: renderTemplateSections(sections, input),
  };

  const deductResult = await deductCredits(
    clientId,
    PROPOSAL_GENERATOR_COST,
    "proposal_generator",
    `Generate proposal: ${title}`,
    { templateId, templateName: template.name },
  );

  if (!deductResult.ok) {
    return NextResponse.json(
      { error: deductResult.error ?? "Kredit tidak cukup", balance: deductResult.newBalance },
      { status: 402 },
    );
  }

  try {
    const proposal = await prisma.generatedProposal.create({
      data: {
        clientId,
        templateId: template.id,
        title,
        prospectName: typeof input.prospectName === "string" ? input.prospectName : null,
        templateName: template.name,
        input: asJson(input),
        content: asJson(content),
      },
    });

    return NextResponse.json({ proposal, balance: deductResult.newBalance }, { status: 201 });
  } catch (error) {
    await refundCredits(clientId, PROPOSAL_GENERATOR_COST, `Refund gagal generate proposal: ${title}`, { templateId });
    console.error("[ProposalGenerator]", error);
    return NextResponse.json({ error: "Gagal menyimpan proposal" }, { status: 500 });
  }
}

