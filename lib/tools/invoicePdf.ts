import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { readFile } from "fs/promises";
import path from "path";
import type { InvoiceDesign } from "@/lib/invoiceDesign";
import { sanitizeWinAnsi } from "./pdfText";

export type GenerateInvoicePdfParams = {
  invoiceNo: string;
  title: string;
  fromName: string;
  fromEmail: string | null;
  fromPhone: string | null;
  fromAddress: string | null;
  billToName: string;
  billToEmail: string | null;
  billToPhone: string | null;
  billToAddress: string | null;
  issueDate: Date;
  dueDate: Date | null;
  lineItems: Array<{ description: string; quantity: number; price: number }>;
  subtotal: number;
  discount: number;
  taxLabel: string | null;
  taxAmount: number;
  total: number;
  notes: string | null;
  footer: string | null;
  design: InvoiceDesign;
};

function hex(hexValue: string) {
  const n = Number.parseInt(hexValue.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function formatRupiah(amount: number) {
  return "Rp " + (Number.isFinite(amount) ? Math.round(amount) : 0).toLocaleString("id-ID");
}

function formatDate(date: Date | string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function wrap(text: string, maxChars: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (`${current} ${word}`.trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function loadLogo(pdfDoc: PDFDocument, logoUrl: string | null): Promise<PDFImage | null> {
  if (!logoUrl) return null;
  try {
    if (logoUrl.startsWith("/uploads/")) {
      const safeRelativePath = logoUrl
        .replace(/^\/+/, "")
        .split("/")
        .filter((part) => part && part !== "." && part !== "..")
        .join(path.sep);
      const filePath = path.join(process.cwd(), "public", safeRelativePath);
      const bytes = await readFile(filePath);
      return logoUrl.toLowerCase().endsWith(".png")
        ? await pdfDoc.embedPng(bytes)
        : await pdfDoc.embedJpg(bytes);
    }

    const res = await fetch(logoUrl);
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "";
    return contentType.includes("png") || logoUrl.toLowerCase().endsWith(".png")
      ? await pdfDoc.embedPng(bytes)
      : await pdfDoc.embedJpg(bytes);
  } catch (err) {
    console.warn("[InvoicePDF] Logo tidak bisa dimuat:", err);
    return null;
  }
}

export async function generateInvoicePdf(params: GenerateInvoicePdfParams): Promise<Uint8Array> {
  const {
    invoiceNo,
    title: _title,
    fromName,
    fromEmail,
    fromPhone,
    fromAddress: _fromAddress,
    billToName,
    billToEmail,
    billToPhone,
    billToAddress,
    issueDate,
    dueDate,
    lineItems,
    subtotal,
    discount,
    taxLabel,
    taxAmount,
    total,
    notes,
    footer,
    design,
  } = params;

  const doc = await PDFDocument.create();
  const W = 595;
  const H = 842;
  const ML = 48;
  const CW = W - ML * 2;
  const BOTTOM_MARGIN = 72;

  const fontSet = design.fontStyle === "serif"
    ? { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold }
    : design.fontStyle === "mono"
      ? { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold }
      : { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold };

  const regular = await doc.embedFont(fontSet.regular);
  const bold = await doc.embedFont(fontSet.bold);
  const logo = design.showLogo ? await loadLogo(doc, design.logoUrl) : null;

  const C = {
    primary: hex(design.primaryColor),
    accent: hex(design.accentColor),
    text: hex("#0f172a"),
    muted: hex("#64748b"),
    light: hex("#f1f5f9"),
    border: hex("#cbd5e1"),
    white: rgb(1, 1, 1),
  };

  let page: PDFPage = doc.addPage([W, H]);
  let y = H - 48;

  const addPage = () => {
    page = doc.addPage([W, H]);
    y = H - 48;
  };

  const ensureSpace = (height: number) => {
    if (y - height < BOTTOM_MARGIN) addPage();
  };

  const text = (value: unknown, x: number, yPos: number, size: number, font = regular, color = C.text) => {
    page.drawText(sanitizeWinAnsi(value), { x, y: yPos, size, font, color });
  };

  const textRight = (value: unknown, rightX: number, yPos: number, size: number, font = regular, color = C.text) => {
    const safe = sanitizeWinAnsi(value);
    page.drawText(safe, { x: rightX - font.widthOfTextAtSize(safe, size), y: yPos, size, font, color });
  };

  const rect = (x: number, yPos: number, width: number, height: number, color: ReturnType<typeof rgb>) => {
    page.drawRectangle({ x, y: yPos, width, height, color });
  };

  const drawLine = (yPos: number) => {
    page.drawLine({ start: { x: ML, y: yPos }, end: { x: ML + CW, y: yPos }, thickness: 0.5, color: C.border });
  };

  // --- HEADER (page 1 only) ---
  const headerHeight = design.layout === "minimal" ? 92 : design.layout === "premium" ? 132 : 116;
  const headerText = design.layout === "minimal" ? C.text : C.white;
  const headerMuted = design.layout === "minimal" ? C.muted : hex("#bfdbfe");

  if (design.layout === "minimal") {
    rect(0, H - headerHeight, W, headerHeight, C.white);
    page.drawLine({ start: { x: ML, y: H - headerHeight }, end: { x: ML + CW, y: H - headerHeight }, thickness: 2, color: C.primary });
  } else {
    rect(0, H - headerHeight, W, headerHeight, C.primary);
    if (design.layout === "modern") rect(0, 0, 16, H, C.accent);
    if (design.layout === "premium") rect(0, H - headerHeight, W, 12, C.accent);
  }

  if (logo) {
    const maxW = 72;
    const maxH = 40;
    const scale = Math.min(maxW / logo.width, maxH / logo.height, 1);
    const width = logo.width * scale;
    const height = logo.height * scale;
    const logoX = design.logoPosition === "center"
      ? W / 2 - width / 2
      : design.logoPosition === "right"
        ? ML + CW - width
        : ML;
    page.drawImage(logo, { x: logoX, y: H - 36 - height, width, height });
  }

  const senderX = logo && design.logoPosition === "left" ? ML + 92 : ML;
  if (design.showSender) {
    text(fromName, senderX, H - headerHeight + headerHeight - 38, 18, bold, headerText);
    if (fromEmail) text(fromEmail, senderX, H - headerHeight + headerHeight - 60, 8, regular, headerMuted);
    if (fromPhone) text(fromPhone, senderX, H - headerHeight + headerHeight - 74, 8, regular, headerMuted);
  }

  const invoiceLabelSize = design.layout === "premium" ? 30 : 28;
  textRight("INVOICE", ML + CW, H - 42, invoiceLabelSize, bold, headerText);
  if (design.showInvoiceNo) textRight(invoiceNo, ML + CW, H - 72, 9, regular, headerMuted);

  y = H - headerHeight - 34;

  // --- BILL TO + DATES ---
  let leftY = y;
  if (design.showRecipient) {
    ensureSpace(80);
    text("DITAGIHKAN KEPADA", ML, y, 7, bold, C.muted);
    text(billToName, ML, y - 16, 12, bold, C.text);
    leftY = y - 32;
    if (billToEmail) {
      text(billToEmail, ML, leftY, 8, regular, C.muted);
      leftY -= 12;
    }
    if (billToPhone) {
      text(billToPhone, ML, leftY, 8, regular, C.muted);
      leftY -= 12;
    }
    if (billToAddress) {
      for (const lineText of wrap(billToAddress, 42).slice(0, 3)) {
        text(lineText, ML, leftY, 8, regular, C.muted);
        leftY -= 12;
      }
    }
  }

  const RX = ML + CW / 2 + 32;
  text("TANGGAL INVOICE", RX, y, 7, bold, C.muted);
  text(formatDate(issueDate), RX, y - 16, 10, bold, C.text);
  if (design.showDueDate) {
    text("JATUH TEMPO", RX, y - 42, 7, bold, C.muted);
    text(formatDate(dueDate), RX, y - 58, 10, bold, C.text);
  }

  y = Math.min(leftY, y - 80) - 20;
  drawLine(y);
  y -= 14;

  // --- TABLE HEADER ---
  ensureSpace(36);
  rect(ML, y - 28, CW, 28, design.layout === "minimal" ? hex("#f8fafc") : C.light);
  text("DESKRIPSI", ML + 10, y - 17, 7, bold, design.layout === "minimal" ? C.text : C.muted);
  textRight("QTY", ML + CW - 155, y - 17, 7, bold, C.muted);
  textRight("HARGA", ML + CW - 70, y - 17, 7, bold, C.muted);
  textRight("JUMLAH", ML + CW - 10, y - 17, 7, bold, C.muted);
  y -= 36;

  // --- LINE ITEMS ---
  for (const item of lineItems) {
    const amount = Math.round(item.quantity * item.price);
    const lines = wrap(item.description, 48);
    const itemHeight = Math.max(26, Math.min(lines.length, 3) * 11 + 12);
    ensureSpace(itemHeight);

    text(lines[0] ?? item.description, ML + 10, y, 9, bold, C.text);
    for (let i = 1; i < Math.min(lines.length, 3); i++) {
      text(lines[i], ML + 10, y - i * 11, 8, regular, C.muted);
    }
    textRight(String(item.quantity), ML + CW - 155, y, 8, regular, C.muted);
    textRight(formatRupiah(item.price), ML + CW - 70, y, 8, regular, C.muted);
    textRight(formatRupiah(amount), ML + CW - 10, y, 8, bold, C.text);
    y -= itemHeight;
  }

  // --- TOTALS ---
  y -= 4;
  ensureSpace(20);
  drawLine(y);
  y -= 18;

  const totalsX = ML + CW - 220;
  ensureSpace(20);
  text("Subtotal", totalsX, y, 9, regular, C.muted);
  textRight(formatRupiah(subtotal), ML + CW - 10, y, 9, regular, C.text);
  y -= 17;

  if (discount > 0) {
    ensureSpace(20);
    text("Diskon", totalsX, y, 9, regular, C.muted);
    textRight(`-${formatRupiah(discount)}`, ML + CW - 10, y, 9, regular, C.text);
    y -= 17;
  }

  if (taxAmount > 0) {
    ensureSpace(20);
    text(taxLabel ?? "Pajak", totalsX, y, 9, regular, C.muted);
    textRight(formatRupiah(taxAmount), ML + CW - 10, y, 9, regular, C.text);
    y -= 17;
  }

  // Total box
  ensureSpace(50);
  rect(totalsX - 12, y - 34, 232, 42, design.layout === "premium" ? C.accent : C.primary);
  text("TOTAL", totalsX, y - 18, 8, bold, hex("#bfdbfe"));
  textRight(formatRupiah(total), ML + CW - 10, y - 18, 14, bold, C.white);
  y -= 62;

  // --- NOTES ---
  if (notes) {
    const noteLines = wrap(notes, 96).slice(0, 6);
    ensureSpace(20 + noteLines.length * 12);
    text("CATATAN", ML, y, 7, bold, C.muted);
    y -= 14;
    for (const noteLine of noteLines) {
      ensureSpace(16);
      text(noteLine, ML, y, 8, regular, C.text);
      y -= 12;
    }
  }

  // --- FOOTER with page numbers on all pages ---
  if (design.showFooter) {
    const pages = doc.getPages();
    for (let i = 0; i < pages.length; i++) {
      const pdfPage = pages[i];
      pdfPage.drawLine({
        start: { x: ML, y: 48 },
        end: { x: ML + CW, y: 48 },
        thickness: 0.5,
        color: C.border,
      });
      pdfPage.drawText(sanitizeWinAnsi(footer ?? "Dokumen dibuat otomatis."), {
        x: ML,
        y: 30,
        size: 7,
        font: regular,
        color: C.muted,
      });
      pdfPage.drawText(`Halaman ${i + 1} dari ${pages.length}`, {
        x: ML + CW - regular.widthOfTextAtSize(`Halaman ${i + 1} dari ${pages.length}`, 7),
        y: 30,
        size: 7,
        font: regular,
        color: C.muted,
      });
    }
  }

  const pdfBytes = await doc.save();
  return new Uint8Array(pdfBytes);
}
