import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auth } from "@/lib/auth";
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

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const W = 595;
  const H = 842;
  const ML = 48;
  const CW = W - ML * 2;
  const C = {
    primary: hex("#1d4ed8"),
    accent: hex("#0d9488"),
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

  rect(0, 0, W, 116, C.primary);
  text(invoice.fromName, ML, 38, 18, bold, C.white);
  if (invoice.fromEmail) text(invoice.fromEmail, ML, 60, 8, regular, hex("#bfdbfe"));
  if (invoice.fromPhone) text(invoice.fromPhone, ML, 74, 8, regular, hex("#bfdbfe"));
  textRight("INVOICE", ML + CW, 42, 28, bold, C.white);
  textRight(invoice.invoiceNo, ML + CW, 72, 9, regular, hex("#bfdbfe"));

  let y = 150;
  text("DITAGIHKAN KEPADA", ML, y, 7, bold, C.muted);
  text(invoice.billToName, ML, y + 16, 12, bold, C.text);
  let leftY = y + 32;
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

  const RX = ML + CW / 2 + 32;
  text("TANGGAL INVOICE", RX, y, 7, bold, C.muted);
  text(formatDate(invoice.issueDate), RX, y + 16, 10, bold, C.text);
  text("JATUH TEMPO", RX, y + 42, 7, bold, C.muted);
  text(formatDate(invoice.dueDate), RX, y + 58, 10, bold, C.text);

  y = Math.max(leftY, y + 80) + 20;
  line(y);
  y += 14;

  rect(ML, y, CW, 28, C.light);
  text("DESKRIPSI", ML + 10, y + 11, 7, bold, C.muted);
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

  rect(totalsX - 12, y - 8, 232, 42, C.primary);
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

  const footY = H - 52;
  line(footY);
  text(invoice.footer ?? "Dokumen dibuat otomatis.", ML, footY + 18, 8, regular, C.muted);
  textRight("Generated by MFWEB Portal", ML + CW, footY + 18, 8, regular, C.muted);

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
