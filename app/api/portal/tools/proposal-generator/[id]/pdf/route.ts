import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type GeneratedProposalContent, parseSections } from "@/lib/proposalTemplates";

type Params = { params: Promise<{ id: string }> };

function hex(h: string) {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function fmtDate(d: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

function parseContent(value: unknown): GeneratedProposalContent {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    title: typeof record.title === "string" ? record.title : "Proposal",
    sections: parseSections(record.sections),
  };
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  const paragraphs = text.split(/\n+/);

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";

    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }

    if (line) lines.push(line);
    if (paragraph.trim() === "") lines.push("");
  }

  return lines;
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

export async function GET(_req: Request, { params }: Params) {
  const { status, clientId, businessName } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const proposal = await prisma.generatedProposal.findFirst({
    where: { id, clientId },
  });
  if (!proposal) return NextResponse.json({ error: "Proposal tidak ditemukan" }, { status: 404 });

  const content = parseContent(proposal.content);
  const doc = await PDFDocument.create();
  const W = 595;
  const H = 842;
  const ML = 48;
  const CW = W - ML * 2;
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg = await doc.embedFont(StandardFonts.Helvetica);

  const C = {
    primary: hex("#1e40af"),
    accent: hex("#0d9488"),
    white: rgb(1, 1, 1),
    text: hex("#0f172a"),
    muted: hex("#64748b"),
    light: hex("#eff6ff"),
    border: hex("#cbd5e1"),
  };

  let page: PDFPage = doc.addPage([W, H]);
  let y = H - 48;

  const addPage = () => {
    page = doc.addPage([W, H]);
    y = H - 48;
  };

  const ensureSpace = (height: number) => {
    if (y - height < 72) addPage();
  };

  const text = (value: string, x: number, yPos: number, size: number, font = reg, color = C.text) => {
    page.drawText(value, { x, y: yPos, size, font, color });
  };

  page.drawRectangle({ x: 0, y: H - 118, width: W, height: 118, color: C.primary });
  page.drawRectangle({ x: 0, y: H - 122, width: W, height: 4, color: C.accent });
  text(businessName ?? "Proposal Bisnis", ML, H - 44, 18, bold, C.white);
  text("Proposal", ML, H - 68, 10, reg, hex("#bfdbfe"));
  text(fmtDate(proposal.createdAt), ML, H - 84, 8, reg, hex("#bfdbfe"));
  const titleWidth = bold.widthOfTextAtSize("PROPOSAL", 22);
  text("PROPOSAL", W - ML - titleWidth, H - 48, 22, bold, C.white);

  y = H - 162;
  text(content.title, ML, y, 18, bold, C.text);
  y -= 22;
  text(`Template: ${proposal.templateName ?? "Custom"}  |  Status: ${proposal.status}`, ML, y, 8, reg, C.muted);
  y -= 28;

  for (const section of content.sections) {
    const bodyLines = wrapText(section.body, reg, 9.5, CW);
    const sectionHeight = 28 + bodyLines.length * 14;
    ensureSpace(sectionHeight);

    page.drawRectangle({ x: ML, y: y - 18, width: CW, height: 22, color: C.light });
    text(section.title || "Section", ML + 12, y - 10, 10, bold, C.primary);
    y -= 34;

    for (const line of bodyLines) {
      ensureSpace(18);
      text(line, ML + 4, y, 9.5, reg, C.text);
      y -= 14;
    }
    y -= 14;
  }

  const pages = doc.getPages();
  pages.forEach((pdfPage, index) => {
    pdfPage.drawLine({
      start: { x: ML, y: 48 },
      end: { x: ML + CW, y: 48 },
      thickness: 0.5,
      color: C.border,
    });
    pdfPage.drawText(`Dibuat dari Portal Tools | Halaman ${index + 1} dari ${pages.length}`, {
      x: ML,
      y: 30,
      size: 7,
      font: reg,
      color: C.muted,
    });
  });

  const pdfBytes = await doc.save();
  const fileName = content.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "proposal";

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
    },
  });
}

