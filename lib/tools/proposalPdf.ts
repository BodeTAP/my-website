import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { ProposalDesign } from "@/lib/proposalDesign";
import type { GeneratedProposalContent } from "@/lib/proposalTemplates";
import { sanitizeWinAnsi } from "./pdfText";

export type GenerateProposalPdfParams = {
  title: string;
  proposalNo: string;
  prospectName: string | null;
  businessName: string | null;
  whatsapp: string | null;
  validUntil: Date | null;
  notes: string | null;
  templateName: string | null;
  status: string;
  design: ProposalDesign;
  content: GeneratedProposalContent;
  createdAt: Date;
  senderBusinessName: string;
};

function hex(h: string) {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function fmtDate(d: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

function fmtRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

function formatCurrencyText(value: string) {
  return value.replace(
    /(?:Rp\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{4,})(?!\s*(?:hari|minggu|bulan|tahun|%))/gi,
    (match, raw: string) => {
      const normalized = raw.replace(/[.,]/g, "");
      const amount = Number(normalized);
      if (!Number.isFinite(amount) || amount < 1000) return match;
      return fmtRupiah(amount);
    },
  );
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  const paragraphs = sanitizeWinAnsi(text).split(/\n+/);

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

async function loadLogo(doc: PDFDocument, url: string | null): Promise<PDFImage | null> {
  if (!url) return null;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
    const lowerUrl = url.toLowerCase();

    if (contentType.includes("png") || lowerUrl.endsWith(".png")) return await doc.embedPng(bytes);
    if (contentType.includes("jpeg") || contentType.includes("jpg") || lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) {
      return await doc.embedJpg(bytes);
    }
  } catch (err) {
    console.warn("[ProposalPDF] Logo tidak bisa dimuat:", err);
  }

  return null;
}

export async function generateProposalPdf(params: GenerateProposalPdfParams): Promise<Uint8Array> {
  const {
    title: _title,
    proposalNo,
    prospectName,
    businessName,
    whatsapp,
    validUntil,
    notes,
    templateName,
    status,
    design,
    content,
    createdAt,
    senderBusinessName,
  } = params;

  const doc = await PDFDocument.create();
  const W = 595;
  const H = 842;
  const ML = 48;
  const CW = W - ML * 2;
  const fontSet = design.fontStyle === "serif"
    ? { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold }
    : design.fontStyle === "mono"
      ? { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold }
      : { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold };
  const bold = await doc.embedFont(fontSet.bold);
  const reg = await doc.embedFont(fontSet.regular);
  const logo = design.showLogo ? await loadLogo(doc, design.logoUrl) : null;

  const C = {
    primary: hex(design.primaryColor),
    accent: hex(design.accentColor),
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
    page.drawText(sanitizeWinAnsi(value), { x, y: yPos, size, font, color });
  };

  const headerHeight = design.layout === "bold" ? 142 : design.layout === "minimal" ? 96 : 118;
  const headerTop = H - headerHeight;
  const headerText = design.layout === "minimal" ? C.text : C.white;
  const headerMuted = design.layout === "minimal" ? C.muted : hex("#bfdbfe");
  const logoDims = logo ? logo.scale(Math.min(78 / logo.width, 42 / logo.height, 1)) : null;

  if (design.layout === "minimal") {
    page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: C.accent });
    page.drawLine({ start: { x: ML, y: headerTop }, end: { x: ML + CW, y: headerTop }, thickness: 0.8, color: C.border });
  } else {
    page.drawRectangle({ x: 0, y: headerTop, width: W, height: headerHeight, color: C.primary });
    page.drawRectangle({ x: 0, y: headerTop - 4, width: W, height: 4, color: C.accent });
    if (design.layout === "modern") {
      page.drawRectangle({ x: W - 170, y: headerTop, width: 170, height: headerHeight, color: C.accent, opacity: 0.28 });
    }
  }

  if (logo && logoDims) {
    const logoX = design.logoPosition === "center"
      ? (W - logoDims.width) / 2
      : design.logoPosition === "right"
        ? W - ML - logoDims.width
        : ML;
    page.drawImage(logo, { x: logoX, y: H - 54, width: logoDims.width, height: logoDims.height });
  }

  const brandX = logo && logoDims && design.logoPosition === "left" ? ML + logoDims.width + 14 : ML;
  const titleSize = design.layout === "bold" ? 28 : 22;
  const brandY = design.layout === "bold" ? H - 54 : H - 44;
  text(senderBusinessName || "Proposal Bisnis", brandX, brandY, 18, bold, headerText);
  text("Proposal", brandX, brandY - 24, 10, reg, headerMuted);
  if (design.showDate) text(fmtDate(createdAt), brandX, brandY - 40, 8, reg, headerMuted);
  const titleWidth = bold.widthOfTextAtSize("PROPOSAL", titleSize);
  const titleY = logo && logoDims && design.logoPosition === "right" ? brandY - 48 : brandY - 4;
  text("PROPOSAL", W - ML - titleWidth, titleY, titleSize, bold, headerText);
  const noText = sanitizeWinAnsi(proposalNo || "PREVIEW");
  if (design.showProposalNo) {
    const noWidth = reg.widthOfTextAtSize(noText, 8);
    text(noText, W - ML - noWidth, titleY - 20, 8, reg, headerMuted);
  }

  y = H - headerHeight - 44;
  text(content.title, ML, y, 18, bold, C.text);
  y -= 22;
  text(`Template: ${templateName ?? "Custom"}  |  Status: ${status}`, ML, y, 8, reg, C.muted);
  y -= 24;

  if (design.showRecipient) {
    page.drawRectangle({ x: ML, y: y - 54, width: CW, height: 64, color: design.layout === "bold" ? hex("#f1f5f9") : hex("#f8fafc") });
    text("DITUJUKAN KEPADA", ML + 14, y - 8, 7, bold, C.muted);
    text(businessName ?? "-", ML + 14, y - 24, 11, bold, C.text);
    text(prospectName ?? "-", ML + 14, y - 39, 8, reg, C.muted);
    if (whatsapp) text(`WA: ${whatsapp}`, ML + 14, y - 52, 7.5, reg, C.muted);
    text("BERLAKU HINGGA", ML + CW / 2, y - 8, 7, bold, C.muted);
    text(validUntil ? fmtDate(validUntil) : "-", ML + CW / 2, y - 24, 9, bold, C.text);
    y -= 86;
  }

  for (const section of content.sections) {
    const bodyLines = wrapText(formatCurrencyText(section.body), reg, 9.5, CW);
    const sectionHeight = 28 + bodyLines.length * 14;
    ensureSpace(sectionHeight);

    page.drawRectangle({ x: ML, y: y - 18, width: CW, height: 22, color: design.layout === "minimal" ? hex("#f8fafc") : C.light });
    text(section.title || "Section", ML + 12, y - 10, 10, bold, design.layout === "minimal" ? C.text : C.primary);
    y -= 34;

    for (const line of bodyLines) {
      ensureSpace(18);
      text(line, ML + 4, y, 9.5, reg, C.text);
      y -= 14;
    }
    y -= 14;
  }

  if (notes) {
    const noteLines = wrapText(formatCurrencyText(notes), reg, 8.5, CW - 28);
    ensureSpace(34 + noteLines.length * 13);
    page.drawRectangle({ x: ML, y: y - 18, width: CW, height: 22, color: hex("#fef9c3") });
    text("Catatan / Terms", ML + 12, y - 10, 10, bold, hex("#92400e"));
    y -= 34;
    for (const line of noteLines) {
      ensureSpace(16);
      text(line, ML + 4, y, 8.5, reg, C.muted);
      y -= 13;
    }
    y -= 12;
  }

  if (design.showFooter) {
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
  }

  const pdfBytes = await doc.save();
  return new Uint8Array(pdfBytes);
}
