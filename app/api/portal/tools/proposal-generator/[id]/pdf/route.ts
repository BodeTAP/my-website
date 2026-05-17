import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type GeneratedProposalContent, parseSections } from "@/lib/proposalTemplates";
import { parseProposalDesign } from "@/lib/proposalDesign";
import { generateProposalPdf } from "@/lib/tools/proposalPdf";

type Params = { params: Promise<{ id: string }> };

function parseContent(value: unknown): GeneratedProposalContent {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    title: typeof record.title === "string" ? record.title : "Proposal",
    sections: parseSections(record.sections),
  };
}

async function getClientId() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, clientId: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true, businessName: true } } },
  });

  if (!user?.client) return { status: 404 as const, clientId: null };
  return { status: 200 as const, clientId: user.client.id, businessName: user.client.businessName };
}

export async function GET(req: NextRequest, { params }: Params) {
  const { status, clientId, businessName } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const proposal = await prisma.generatedProposal.findFirst({
    where: { id, clientId },
  });
  if (!proposal) return NextResponse.json({ error: "Proposal tidak ditemukan" }, { status: 404 });

  const content = parseContent(proposal.content);
  const design = parseProposalDesign(proposal.design);

  const pdfBytes = await generateProposalPdf({
    title: proposal.title,
    proposalNo: proposal.proposalNo ?? proposal.id.slice(0, 8).toUpperCase(),
    prospectName: proposal.prospectName,
    businessName: proposal.businessName,
    whatsapp: proposal.whatsapp,
    validUntil: proposal.validUntil,
    notes: proposal.notes,
    templateName: proposal.templateName,
    status: proposal.status,
    design,
    content,
    createdAt: proposal.createdAt,
    senderBusinessName: businessName ?? "Proposal Bisnis",
  });

  const fileName = content.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "proposal";
  const disposition = req.nextUrl.searchParams.get("preview") === "1" ? "inline" : "attachment";

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${fileName}.pdf"`,
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "default-src 'self'; frame-ancestors 'self'",
    },
  });
}
