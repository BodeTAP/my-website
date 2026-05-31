import "server-only";

import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import { sanitizeWinAnsi } from "./pdfText";

export type FreemiumProposalPdfParams = {
  prospectName: string;
  businessName: string;
  serviceDescription: string;
  price: number;
  validDays: number;
  createdAt: Date;
};

const WATERMARK_TEXT = "MFWEB - Free Tier";
const WATERMARK_FOOTER = "Dibuat dengan MFWEB Free Tier - mfweb.maffisorp.id";

function fmtRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
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

/**
 * Draws a strong but not destructive watermark across each page.
 * Uses three positions (top-right, center diagonal, bottom-left) with
 * opacity 0.12 so it is clearly visible in screenshots and printed copies
 * yet still readable.
 */
function drawWatermark(page: PDFPage, font: PDFFont, pageWidth: number, pageHeight: number) {
  const grey = rgb(0.55, 0.55, 0.55);
  const opacity = 0.12;

  // Center diagonal large watermark
  const centerSize = 56;
  const centerWidth = font.widthOfTextAtSize(WATERMARK_TEXT, centerSize);
  page.drawText(WATERMARK_TEXT, {
    x: pageWidth / 2 - centerWidth / 2,
    y: pageHeight / 2,
    size: centerSize,
    font,
    color: grey,
    opacity,
    rotate: degrees(-30),
  });

  // Top-right small watermark
  const topSize = 10;
  const topText = "FREE TIER";
  const topWidth = font.widthOfTextAtSize(topText, topSize);
  page.drawText(topText, {
    x: pageWidth - 56 - topWidth,
    y: pageHeight - 24,
    size: topSize,
    font,
    color: grey,
    opacity: 0.45,
  });

  // Bottom-left small watermark
  page.drawText(WATERMARK_FOOTER, {
    x: 48,
    y: 18,
    size: 8,
    font,
    color: grey,
    opacity: 0.55,
  });
}

export async function generateFreemiumProposalPdf(params: FreemiumProposalPdfParams): Promise<Uint8Array> {
  const prospectName = sanitizeWinAnsi(params.prospectName);
  const businessName = sanitizeWinAnsi(params.businessName);
  const serviceDescription = sanitizeWinAnsi(params.serviceDescription);
  const { price, validDays, createdAt } = params;

  const doc = await PDFDocument.create();
  const W = 595;
  const H = 842;
  const ML = 48;
  const CW = W - ML * 2;

  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const C = {
    primary: rgb(0.117, 0.251, 0.686),   // #1e40af blue-800
    accent: rgb(0.231, 0.510, 0.965),    // #3b82f6 blue-500
    text: rgb(0.059, 0.090, 0.165),      // #0f172a slate-900
    muted: rgb(0.392, 0.455, 0.545),     // #64748b slate-500
    light: rgb(0.937, 0.965, 1.0),       // #eff6ff blue-50
    border: rgb(0.796, 0.835, 0.882),    // #cbd5e1 slate-300
  };

  let page: PDFPage = doc.addPage([W, H]);
  let y = H - 40;

  const ensureSpace = (needed: number) => {
    if (y - needed < 80) {
      drawWatermark(page, bold, W, H);
      page = doc.addPage([W, H]);
      y = H - 40;
    }
  };

  // ── Header band ───────────────────────────────────────────
  page.drawRectangle({ x: 0, y: H - 110, width: W, height: 110, color: C.primary });
  page.drawRectangle({ x: 0, y: H - 114, width: W, height: 4, color: C.accent });

  page.drawText(businessName, { x: ML, y: H - 50, size: 18, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Proposal Bisnis", { x: ML, y: H - 70, size: 9, font: reg, color: rgb(0.749, 0.859, 0.969) });
  page.drawText(fmtDate(createdAt), { x: ML, y: H - 86, size: 8, font: reg, color: rgb(0.749, 0.859, 0.969) });

  const titleText = "PROPOSAL";
  const titleWidth = bold.widthOfTextAtSize(titleText, 24);
  page.drawText(titleText, {
    x: W - ML - titleWidth,
    y: H - 56,
    size: 24,
    font: bold,
    color: rgb(1, 1, 1),
  });

  y = H - 144;

  // ── Recipient block ──────────────────────────────────────
  page.drawRectangle({ x: ML, y: y - 56, width: CW, height: 64, color: C.light });
  page.drawText("DITUJUKAN KEPADA", { x: ML + 14, y: y - 8, size: 7, font: bold, color: C.muted });
  page.drawText(prospectName, { x: ML + 14, y: y - 24, size: 12, font: bold, color: C.text });
  page.drawText(`Berlaku ${validDays} hari sejak tanggal proposal`, {
    x: ML + 14, y: y - 42, size: 8, font: reg, color: C.muted,
  });
  y -= 80;

  // ── Service description ──────────────────────────────────
  page.drawRectangle({ x: ML, y: y - 18, width: CW, height: 22, color: C.light });
  page.drawText("Deskripsi Layanan", { x: ML + 12, y: y - 10, size: 10, font: bold, color: C.primary });
  y -= 34;

  const bodyLines = wrap(serviceDescription, reg, 10, CW - 8);
  for (const line of bodyLines) {
    ensureSpace(16);
    page.drawText(line, { x: ML + 4, y, size: 10, font: reg, color: C.text });
    y -= 14;
  }
  y -= 12;

  // ── Price box ────────────────────────────────────────────
  ensureSpace(80);
  const boxH = 60;
  page.drawRectangle({ x: ML, y: y - boxH, width: CW, height: boxH, color: C.primary });
  page.drawText("Total Investasi", { x: ML + 16, y: y - 22, size: 10, font: reg, color: rgb(0.749, 0.859, 0.969) });
  const priceText = fmtRupiah(price);
  const priceWidth = bold.widthOfTextAtSize(priceText, 22);
  page.drawText(priceText, {
    x: W - ML - 16 - priceWidth,
    y: y - 36,
    size: 22,
    font: bold,
    color: rgb(1, 1, 1),
  });
  y -= boxH + 16;

  // ── CTA / upgrade hint ───────────────────────────────────
  ensureSpace(40);
  page.drawRectangle({ x: ML, y: y - 28, width: CW, height: 32, color: rgb(0.996, 0.953, 0.78) }); // amber-100
  const cta = "Versi tanpa watermark dan dengan brand kit tersedia di portal MFWEB.";
  page.drawText(cta, { x: ML + 12, y: y - 18, size: 9, font: bold, color: rgb(0.573, 0.251, 0.055) });
  y -= 48;

  // Watermark on every page (current page)
  drawWatermark(page, bold, W, H);

  return new Uint8Array(await doc.save());
}
