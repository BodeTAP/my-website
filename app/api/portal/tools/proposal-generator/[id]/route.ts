import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type GeneratedProposalContent, parseSections } from "@/lib/proposalTemplates";
import { proposalDesignToJson, sanitizeProposalDesign } from "@/lib/proposalDesign";

type Params = { params: Promise<{ id: string }> };

const STATUS_LABELS = new Set(["DRAFT", "SENT", "ACCEPTED", "DECLINED"]);

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

function parseContent(value: unknown): GeneratedProposalContent {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    title: typeof record.title === "string" ? record.title : "Proposal",
    sections: parseSections(record.sections),
  };
}

export async function GET(_req: Request, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const proposal = await prisma.generatedProposal.findFirst({
    where: { id, clientId },
  });
  if (!proposal) return NextResponse.json({ error: "Proposal tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ proposal });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const proposal = await prisma.generatedProposal.findFirst({
    where: { id, clientId },
    select: { id: true, content: true },
  });
  if (!proposal) return NextResponse.json({ error: "Proposal tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const nextStatus = typeof body.status === "string" && STATUS_LABELS.has(body.status) ? body.status : undefined;
  const prospectName = typeof body.prospectName === "string" ? body.prospectName.trim() : undefined;
  const businessName = typeof body.businessName === "string" ? body.businessName.trim() : undefined;
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : undefined;
  const notes = typeof body.notes === "string" ? body.notes.trim() : undefined;
  const validUntil = typeof body.validUntil === "string" ? body.validUntil : undefined;
  const design = body.design ? sanitizeProposalDesign(body.design) : undefined;
  const content = parseContent(proposal.content);

  const updated = await prisma.generatedProposal.update({
    where: { id },
    data: {
      ...(title && {
        title,
        content: asJson({ ...content, title }),
      }),
      ...(nextStatus && { status: nextStatus }),
      ...(prospectName !== undefined && { prospectName: prospectName || null }),
      ...(businessName !== undefined && { businessName: businessName || null }),
      ...(whatsapp !== undefined && { whatsapp: whatsapp || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
      ...(design && { design: proposalDesignToJson(design) }),
    },
  });

  return NextResponse.json({ proposal: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const proposal = await prisma.generatedProposal.findFirst({
    where: { id, clientId },
    select: { id: true },
  });
  if (!proposal) return NextResponse.json({ error: "Proposal tidak ditemukan" }, { status: 404 });

  await prisma.generatedProposal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
