import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, PDFImage, StandardFonts, rgb } from "pdf-lib";
import { auth } from "@/lib/auth";
import { parseInvoiceDesign } from "@/lib/invoiceDesign";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
type InvoiceItem = {
  description?: unknown;
  quantity?: unknown;
  price?: unknown;
};

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

function hex(hexValue: string) {
  const n = Number.parseInt(hexValue.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function itemText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function itemNumber(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });
  if (!user?.client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { id } = await params;
  const invoice = await prisma.generatedInvoice.findFirst({
    where: { id, clientId: user.client.id },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });

  const design = parseInvoiceDesign(invoice.design);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const regular = await pdfDoc.embedFont(
    design.fontStyle === "serif"
      ? StandardFonts.TimesRoman
      : design.fontStyle === "mono"
        ? StandardFonts.Courier
        : StandardFonts.Helvetica,
  );
  const bold = await pdfDoc.embedFont(
    design.fontStyle === "serif"
      ? StandardFonts.TimesRomanBold
      : design.fontStyle === "mono"
        ? StandardFonts.CourierBold
        : StandardFonts.HelveticaBold,
  );
  const logo = design.showLogo ? await loadLogo(pdfDoc, design.logoUrl) : null;

  const W = 595;
  const H = 842;
  const ML = 48;
  const CW = W - ML * 2;
  const C = {
    primary: hex(design.primaryColor),
    accent: hex(design.accentColor),
    text: hex("#0f172a"),
    muted: hex("#64748b"),
    light: hex("#f1f5f9"),
    border: hex("#cbd5e1"),
    white: rgb(1, 1, 1),
  };

  const text = (value: unknown, x: number, yTop: number, size: number, font = regular, color = C.text) => {
    page.drawText(String(value ?? ""), { x, y: H - yTop, size, font, color });
  };
  const textRight = (value: unknown, rightX: number, yTop: number, size: number, font = regular, color = C.text) => {
    const safe = String(value ?? "");
    page.drawText(safe, { x: rightX - font.widthOfTextAtSize(safe, size), y: H - yTop, size, font, color });
  };
  const rect = (x: number, yTop: number, width: number, height: number, color: ReturnType<typeof rgb>) => {
    page.drawRectangle({ x, y: H - yTop - height, width, height, color });
  };
  const line = (yTop: number) => {
    page.drawLine({ start: { x: ML, y: H - yTop }, end: { x: ML + CW, y: H - yTop }, thickness: 0.5, color: C.border });
  };

  const headerHeight = design.layout === "minimal" ? 92 : design.layout === "premium" ? 132 : 116;
  const headerText = design.layout === "minimal" ? C.text : C.white;
  const headerMuted = design.layout === "minimal" ? C.muted : hex("#bfdbfe");
  if (design.layout === "minimal") {
    rect(0, 0, W, headerHeight, C.white);
    page.drawLine({ start: { x: ML, y: H - headerHeight }, end: { x: ML + CW, y: H - headerHeight }, thickness: 2, color: C.primary });
  } else {
    rect(0, 0, W, headerHeight, C.primary);
    if (design.layout === "modern") rect(0, 0, 16, H, C.accent);
    if (design.layout === "premium") rect(0, headerHeight - 12, W, 12, C.accent);
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
    text(invoice.fromName, senderX, 38, 18, bold, headerText);
    if (invoice.fromEmail) text(invoice.fromEmail, senderX, 60, 8, regular, headerMuted);
    if (invoice.fromPhone) text(invoice.fromPhone, senderX, 74, 8, regular, headerMuted);
  }
  textRight("INVOICE", ML + CW, 42, design.layout === "premium" ? 30 : 28, bold, headerText);
  if (design.showInvoiceNo) textRight(invoice.invoiceNo, ML + CW, 72, 9, regular, headerMuted);

  let y = headerHeight + 34;
  let leftY = y;
  if (design.showRecipient) {
    text("DITAGIHKAN KEPADA", ML, y, 7, bold, C.muted);
    text(invoice.billToName, ML, y + 16, 12, bold, C.text);
    leftY = y + 32;
    if (invoice.billToEmail) {
      text(invoice.billToEmail, ML, leftY, 8, regular, C.muted);
      leftY += 12;
    }
    if (invoice.billToPhone) {
      text(invoice.billToPhone, ML, leftY, 8, regular, C.muted);
      leftY += 12;
    }
    if (invoice.billToAddress) {
      for (const lineText of wrap(invoice.billToAddress, 42).slice(0, 3)) {
        text(lineText, ML, leftY, 8, regular, C.muted);
        leftY += 12;
      }
    }
  }

  const RX = ML + CW / 2 + 32;
  text("TANGGAL INVOICE", RX, y, 7, bold, C.muted);
  text(formatDate(invoice.issueDate), RX, y + 16, 10, bold, C.text);
  if (design.showDueDate) {
    text("JATUH TEMPO", RX, y + 42, 7, bold, C.muted);
    text(formatDate(invoice.dueDate), RX, y + 58, 10, bold, C.text);
  }

  y = Math.max(leftY, y + 80) + 20;
  line(y);
  y += 14;

  rect(ML, y, CW, 28, design.layout === "minimal" ? hex("#f8fafc") : C.light);
  text("DESKRIPSI", ML + 10, y + 11, 7, bold, design.layout === "minimal" ? C.text : C.muted);
  textRight("QTY", ML + CW - 155, y + 11, 7, bold, C.muted);
  textRight("HARGA", ML + CW - 70, y + 11, 7, bold, C.muted);
  textRight("JUMLAH", ML + CW - 10, y + 11, 7, bold, C.muted);
  y += 36;

  const rawItems = Array.isArray(invoice.lineItems) ? invoice.lineItems as InvoiceItem[] : [];
  const items = rawItems.map((item, index) => ({
    description: itemText(item.description, `Item ${index + 1}`),
    quantity: itemNumber(item.quantity, 1),
    price: itemNumber(item.price, 0),
  }));

  for (const item of items) {
    const amount = Math.round(item.quantity * item.price);
    const lines = wrap(item.description, 48);
    text(lines[0] ?? item.description, ML + 10, y, 9, bold, C.text);
    for (let i = 1; i < Math.min(lines.length, 3); i++) {
      text(lines[i], ML + 10, y + i * 11, 8, regular, C.muted);
    }
    textRight(String(item.quantity), ML + CW - 155, y, 8, regular, C.muted);
    textRight(formatRupiah(item.price), ML + CW - 70, y, 8, regular, C.muted);
    textRight(formatRupiah(amount), ML + CW - 10, y, 8, bold, C.text);
    y += Math.max(26, Math.min(lines.length, 3) * 11 + 12);
  }

  y += 4;
  line(y);
  y += 18;

  const totalsX = ML + CW - 220;
  text("Subtotal", totalsX, y, 9, regular, C.muted);
  textRight(formatRupiah(invoice.subtotal), ML + CW - 10, y, 9, regular, C.text);
  y += 17;
  if (invoice.discount > 0) {
    text("Diskon", totalsX, y, 9, regular, C.muted);
    textRight(`-${formatRupiah(invoice.discount)}`, ML + CW - 10, y, 9, regular, C.text);
    y += 17;
  }
  if (invoice.taxAmount > 0) {
    text(invoice.taxLabel ?? "Pajak", totalsX, y, 9, regular, C.muted);
    textRight(formatRupiah(invoice.taxAmount), ML + CW - 10, y, 9, regular, C.text);
    y += 17;
  }

  rect(totalsX - 12, y - 8, 232, 42, design.layout === "premium" ? C.accent : C.primary);
  text("TOTAL", totalsX, y + 8, 8, bold, hex("#bfdbfe"));
  textRight(formatRupiah(invoice.total), ML + CW - 10, y + 8, 14, bold, C.white);
  y += 62;

  if (invoice.notes) {
    text("CATATAN", ML, y, 7, bold, C.muted);
    y += 14;
    for (const noteLine of wrap(invoice.notes, 96).slice(0, 6)) {
      text(noteLine, ML, y, 8, regular, C.text);
      y += 12;
    }
  }

  if (design.showFooter) {
    const footY = H - 52;
    line(footY);
    text(invoice.footer ?? "Dokumen dibuat otomatis.", ML, footY + 18, 8, regular, C.muted);
    textRight("Generated by MFWEB Portal", ML + CW, footY + 18, 8, regular, C.muted);
  }

  const bytes = await pdfDoc.save();
  const buffer = Buffer.from(bytes);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNo}.pdf"`,
      "Content-Length": String(buffer.length),
    },
  });
}
