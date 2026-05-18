import "server-only";

import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type FreemiumInvoicePdfItem = {
  description: string;
  quantity: number;
  price: number;
};

export type FreemiumInvoicePdfParams = {
  invoiceNo: string;
  fromName: string;
  toName: string;
  items: FreemiumInvoicePdfItem[];
  subtotal: number;
  tax: number;
  total: number;
  includeTax: boolean;
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
  const words = text.split(/\s+/).filter(Boolean);
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
  return lines;
}

function drawWatermark(page: PDFPage, font: PDFFont, pageWidth: number, pageHeight: number) {
  const grey = rgb(0.55, 0.55, 0.55);

  // Center diagonal large watermark
  const centerSize = 56;
  const centerWidth = font.widthOfTextAtSize(WATERMARK_TEXT, centerSize);
  page.drawText(WATERMARK_TEXT, {
    x: pageWidth / 2 - centerWidth / 2,
    y: pageHeight / 2,
    size: centerSize,
    font,
    color: grey,
    opacity: 0.12,
    rotate: degrees(-30),
  });

  // Top-right small "FREE TIER" tag
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

  // Footer attribution
  page.drawText(WATERMARK_FOOTER, {
    x: 48,
    y: 18,
    size: 8,
    font,
    color: grey,
    opacity: 0.55,
  });
}

export async function generateFreemiumInvoicePdf(params: FreemiumInvoicePdfParams): Promise<Uint8Array> {
  const { invoiceNo, fromName, toName, items, subtotal, tax, total, includeTax, createdAt } = params;

  const doc = await PDFDocument.create();
  const W = 595;
  const H = 842;
  const ML = 48;
  const CW = W - ML * 2;

  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const C = {
    primary: rgb(0.051, 0.580, 0.533),   // #0d9488 teal-600
    accent: rgb(0.078, 0.722, 0.651),    // #14b8a6 teal-500
    text: rgb(0.059, 0.090, 0.165),
    muted: rgb(0.392, 0.455, 0.545),
    light: rgb(0.945, 0.984, 0.976),     // teal-50
    border: rgb(0.796, 0.835, 0.882),
    white: rgb(1, 1, 1),
  };

  let page: PDFPage = doc.addPage([W, H]);
  let y = H - 40;

  const ensureSpace = (needed: number) => {
    if (y - needed < 90) {
      drawWatermark(page, bold, W, H);
      page = doc.addPage([W, H]);
      y = H - 40;
    }
  };

  // ── Header ───────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: H - 100, width: W, height: 100, color: C.primary });
  page.drawRectangle({ x: 0, y: H - 104, width: W, height: 4, color: C.accent });

  page.drawText(fromName, { x: ML, y: H - 50, size: 16, font: bold, color: C.white });
  page.drawText("Penagih", { x: ML, y: H - 68, size: 8, font: reg, color: rgb(0.749, 0.949, 0.929) });

  const titleText = "INVOICE";
  const titleWidth = bold.widthOfTextAtSize(titleText, 26);
  page.drawText(titleText, {
    x: W - ML - titleWidth,
    y: H - 50,
    size: 26,
    font: bold,
    color: C.white,
  });
  const noWidth = reg.widthOfTextAtSize(invoiceNo, 9);
  page.drawText(invoiceNo, {
    x: W - ML - noWidth,
    y: H - 68,
    size: 9,
    font: reg,
    color: rgb(0.749, 0.949, 0.929),
  });

  y = H - 132;

  // ── Bill to / Date ───────────────────────────────────────
  page.drawText("DITAGIHKAN KEPADA", { x: ML, y, size: 7, font: bold, color: C.muted });
  page.drawText(toName, { x: ML, y: y - 16, size: 12, font: bold, color: C.text });

  const RX = ML + CW / 2 + 32;
  page.drawText("TANGGAL", { x: RX, y, size: 7, font: bold, color: C.muted });
  page.drawText(fmtDate(createdAt), { x: RX, y: y - 16, size: 10, font: bold, color: C.text });

  y -= 50;

  // ── Items table header ───────────────────────────────────
  page.drawRectangle({ x: ML, y: y - 24, width: CW, height: 24, color: C.light });
  page.drawText("DESKRIPSI", { x: ML + 10, y: y - 16, size: 7, font: bold, color: C.muted });
  const qtyX = ML + CW - 200;
  const priceX = ML + CW - 130;
  const amountX = ML + CW - 10;
  const right = (text: string, x: number, ypos: number, size: number, font: PDFFont, color = C.text) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: x - w, y: ypos, size, font, color });
  };
  right("QTY", qtyX, y - 16, 7, bold, C.muted);
  right("HARGA", priceX, y - 16, 7, bold, C.muted);
  right("JUMLAH", amountX, y - 16, 7, bold, C.muted);
  y -= 32;

  // ── Items rows ───────────────────────────────────────────
  for (const item of items) {
    const amount = Math.round(item.quantity * item.price);
    const descLines = wrap(item.description, reg, 9, CW - 220).slice(0, 3);
    const rowH = Math.max(22, descLines.length * 12 + 8);
    ensureSpace(rowH);
    page.drawText(descLines[0] ?? item.description, { x: ML + 10, y, size: 9, font: bold, color: C.text });
    for (let i = 1; i < descLines.length; i++) {
      page.drawText(descLines[i], { x: ML + 10, y: y - i * 12, size: 8, font: reg, color: C.muted });
    }
    right(String(item.quantity), qtyX, y, 9, reg, C.muted);
    right(fmtRupiah(item.price), priceX, y, 9, reg, C.muted);
    right(fmtRupiah(amount), amountX, y, 9, bold, C.text);
    y -= rowH;
  }

  y -= 4;
  page.drawLine({ start: { x: ML, y }, end: { x: ML + CW, y }, thickness: 0.5, color: C.border });
  y -= 16;

  // ── Totals ───────────────────────────────────────────────
  const totalsLabelX = ML + CW - 200;
  ensureSpace(20);
  page.drawText("Subtotal", { x: totalsLabelX, y, size: 9, font: reg, color: C.muted });
  right(fmtRupiah(subtotal), amountX, y, 9, reg, C.text);
  y -= 16;

  if (includeTax && tax > 0) {
    ensureSpace(20);
    page.drawText("PPN 11%", { x: totalsLabelX, y, size: 9, font: reg, color: C.muted });
    right(fmtRupiah(tax), amountX, y, 9, reg, C.text);
    y -= 16;
  }

  // Total emphasised box
  ensureSpace(46);
  page.drawRectangle({ x: totalsLabelX - 14, y: y - 32, width: 220 + 14, height: 38, color: C.primary });
  page.drawText("TOTAL", { x: totalsLabelX, y: y - 18, size: 9, font: bold, color: rgb(0.749, 0.949, 0.929) });
  right(fmtRupiah(total), amountX, y - 18, 14, bold, C.white);
  y -= 56;

  // ── CTA ──────────────────────────────────────────────────
  ensureSpace(40);
  page.drawRectangle({ x: ML, y: y - 28, width: CW, height: 32, color: rgb(0.996, 0.953, 0.78) });
  const cta = "Versi tanpa watermark dengan logo dan brand kit tersedia di portal MFWEB.";
  page.drawText(cta, { x: ML + 12, y: y - 18, size: 9, font: bold, color: rgb(0.573, 0.251, 0.055) });
  y -= 48;

  // Watermark on the current page
  drawWatermark(page, bold, W, H);

  return new Uint8Array(await doc.save());
}
