import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { deductCredits, getClientBalance, refundCredits } from "@/lib/credits";
import { prisma } from "@/lib/prisma";
import {
  inferProposalTitle,
  parseSections,
  renderTemplateSections,
} from "@/lib/proposalTemplates";
import {
  getClientProposalDesign,
  proposalDesignToJson,
  sanitizeProposalDesign,
} from "@/lib/proposalDesign";
import { getToolSettings } from "@/lib/toolSettings";

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

function getText(input: Record<string, unknown>, key: string) {
  const value = input[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function generateProposalNo(clientId: string) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.generatedProposal.count({ where: { clientId } });
  return `PG-${date}-${String(count + 1).padStart(3, "0")}`;
}

export async function GET() {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const proposals = await prisma.generatedProposal.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ proposals });
}

export async function POST(req: NextRequest) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const body = await req.json();
  const templateId = typeof body.templateId === "string" ? body.templateId : "";
  const input = asRecord(body.input);
  const design = body.design ? sanitizeProposalDesign(body.design) : await getClientProposalDesign(clientId);

  if (!templateId) return NextResponse.json({ error: "Template wajib dipilih" }, { status: 400 });

  const toolSettings = await getToolSettings();
  if (!toolSettings.proposalGenerator.enabled) {
    return NextResponse.json({ error: "Proposal Generator sedang nonaktif." }, { status: 503 });
  }
  const creditCost = toolSettings.proposalGenerator.creditCost;

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
  if (balance < creditCost) {
    return NextResponse.json(
      { error: "Kredit tidak cukup", balance, requiredCredits: creditCost },
      { status: 402 },
    );
  }

  const sections = parseSections(template.sections);
  if (sections.length === 0) {
    return NextResponse.json({ error: "Template belum memiliki konten" }, { status: 400 });
  }

  const title = inferProposalTitle(template.name, input);
  const proposalNo = await generateProposalNo(clientId);
  const prospectName = getText(input, "prospectName");
  const businessName = getText(input, "businessName");
  const whatsapp = getText(input, "whatsapp");
  const notes = getText(input, "notes");
  const validUntilText = getText(input, "validUntil");
  const content = {
    title,
    sections: renderTemplateSections(sections, input),
  };

  const deductResult = await deductCredits(
    clientId,
    creditCost,
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
        proposalNo,
        title,
        prospectName,
        businessName,
        whatsapp,
        validUntil: validUntilText ? new Date(validUntilText) : null,
        notes,
        templateName: template.name,
        design: proposalDesignToJson(design),
        input: asJson(input),
        content: asJson(content),
      },
    });

    return NextResponse.json({ proposal, balance: deductResult.newBalance }, { status: 201 });
  } catch (error) {
    await refundCredits(clientId, creditCost, `Refund gagal generate proposal: ${title}`, { templateId });
    console.error("[ProposalGenerator]", error);
    return NextResponse.json({ error: "Gagal menyimpan proposal" }, { status: 500 });
  }
}
