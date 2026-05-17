import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import {
  parseSections,
  renderTemplateSections,
  inferProposalTitle,
} from "@/lib/proposalTemplates";
import {
  getClientProposalDesign,
  sanitizeProposalDesign,
} from "@/lib/proposalDesign";
import { generateProposalPdf } from "@/lib/tools/proposalPdf";

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

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function getText(input: Record<string, unknown>, key: string) {
  const value = input[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(req: NextRequest) {
  const { status, clientId, businessName } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  // Rate limit: max 10 previews per hour per client
  const rl = await rateLimit(`proposal-preview:${clientId}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak preview. Coba lagi nanti.", retryAfterMs: rl.retryAfterMs },
      { status: 429 },
    );
  }

  const body = await req.json();
  const templateId = typeof body.templateId === "string" ? body.templateId : "";
  const input = asRecord(body.input);
  const design = body.design ? sanitizeProposalDesign(body.design) : await getClientProposalDesign(clientId);

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

  const sections = parseSections(template.sections);
  if (sections.length === 0) {
    return NextResponse.json({ error: "Template belum memiliki konten" }, { status: 400 });
  }

  const title = inferProposalTitle(template.name, input);
  const prospectName = getText(input, "prospectName");
  const prospectBusiness = getText(input, "businessName");
  const whatsapp = getText(input, "whatsapp");
  const notes = getText(input, "notes");
  const validUntilText = getText(input, "validUntil");
  const content = {
    title,
    sections: renderTemplateSections(sections, input),
  };

  const pdfBytes = await generateProposalPdf({
    title,
    proposalNo: "PREVIEW",
    prospectName,
    businessName: prospectBusiness,
    whatsapp,
    validUntil: validUntilText ? new Date(validUntilText) : null,
    notes,
    templateName: template.name,
    status: "DRAFT",
    design,
    content,
    createdAt: new Date(),
    senderBusinessName: businessName ?? "Proposal Bisnis",
  });

  const fileName = title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "proposal-preview";

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}-preview.pdf"`,
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "default-src 'self'; frame-ancestors 'self'",
    },
  });
}
