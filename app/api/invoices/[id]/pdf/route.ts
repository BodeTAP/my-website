import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function formatRupiah(amount: number) {
  return "Rp " + amount.toLocaleString("id-ID");
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// pdf-lib Y coordinates start from bottom; helper converts top-down to bottom-up
function y(pageHeight: number, topY: number) {
  return pageHeight - topY;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const isAdmin = (session.user as { role?: string })?.role === "ADMIN";

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });
  }

  if (!isAdmin) {
    const user = await prisma.user.findUnique({
      where: { email: session.user!.email! },
      include: { client: true },
    });
    if (!user?.client || user.client.id !== invoice.clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ── Build PDF ──────────────────────────────────────────────────────────────
  const pdfDoc = await PDFDocument.create();
  const pageWidth = 595;   // A4 points
  const pageHeight = 842;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const margin = 52;
  const W = pageWidth - margin * 2;
  const isPaid = invoice.status === "PAID";

  const C = {
    primary:  hexToRgb("#1d4ed8"),
    text:     hexToRgb("#1a1a2e"),
    muted:    hexToRgb("#64748b"),
    light:    hexToRgb("#f1f5f9"),
    border:   hexToRgb("#e2e8f0"),
    green:    hexToRgb("#15803d"),
    greenBg:  hexToRgb("#dcfce7"),
    red:      hexToRgb("#b91c1c"),
    redBg:    hexToRgb("#fee2e2"),
    yellow:   hexToRgb("#92400e"),
    yellowBg: hexToRgb("#fffbeb"),
    white:    rgb(1, 1, 1),
  };

  const drawText = (
    text: string,
    opts: {
      x: number;
      topY: number;
      size: number;
      font?: typeof bold;
      color?: ReturnType<typeof rgb>;
    }
  ) => {
    page.drawText(text, {
      x: opts.x,
      y: y(pageHeight, opts.topY),
      size: opts.size,
      font: opts.font ?? regular,
      color: opts.color ?? C.text,
    });
  };

  // ── Header ─────────────────────────────────────────────────────────────────
  drawText("VICTORIA TECH", { x: margin, topY: 62, size: 20, font: bold, color: C.primary });
  drawText("Solusi Website Profesional", { x: margin, topY: 86, size: 9, color: C.muted });
  drawText("info@victoriatch.com  ·  victoriatch.com", { x: margin, topY: 98, size: 8, color: C.muted });

  const invoiceTextWidth = bold.widthOfTextAtSize("INVOICE", 32);
  drawText("INVOICE", {
    x: margin + W - invoiceTextWidth,
    topY: 68,
    size: 32,
    font: bold,
    color: C.primary,
  });

  const noText = `#${invoice.invoiceNo}`;
  const noTextWidth = regular.widthOfTextAtSize(noText, 10);
  drawText(noText, {
    x: margin + W - noTextWidth,
    topY: 104,
    size: 10,
    color: C.muted,
  });

  // ── Status badge ───────────────────────────────────────────────────────────
  const badgeTopY = 116;
  const badgeH = 20;
  const badgeW = 110;
  const badgeX = margin + W - badgeW;
  const badgeBg = isPaid ? C.greenBg : C.redBg;
  const badgeColor = isPaid ? C.green : C.red;
  const badgeLabel = isPaid ? "LUNAS" : "BELUM DIBAYAR";

  page.drawRectangle({
    x: badgeX,
    y: y(pageHeight, badgeTopY + badgeH),
    width: badgeW,
    height: badgeH,
    color: badgeBg,
  });
  const labelWidth = bold.widthOfTextAtSize(badgeLabel, 8);
  drawText(badgeLabel, {
    x: badgeX + (badgeW - labelWidth) / 2,
    topY: badgeTopY + 6,
    size: 8,
    font: bold,
    color: badgeColor,
  });

  // ── Divider ────────────────────────────────────────────────────────────────
  const divTopY = badgeTopY + badgeH + 12;
  page.drawLine({
    start: { x: margin, y: y(pageHeight, divTopY) },
    end:   { x: margin + W, y: y(pageHeight, divTopY) },
    thickness: 1,
    color: C.border,
  });

  // ── Info grid ──────────────────────────────────────────────────────────────
  const infoTopY = divTopY + 20;
  const col = W / 3;

  // Col 1 — Billed to
  drawText("TAGIHAN KEPADA", { x: margin, topY: infoTopY, size: 7, font: bold, color: C.muted });
  drawText(invoice.client.businessName, { x: margin, topY: infoTopY + 12, size: 10, font: bold });
  let col1Y = infoTopY + 26;
  if (invoice.client.user.name) {
    drawText(invoice.client.user.name, { x: margin, topY: col1Y, size: 8, color: C.muted });
    col1Y += 13;
  }
  drawText(invoice.client.user.email, { x: margin, topY: col1Y, size: 8, color: C.muted });

  // Col 2 — Dates
  drawText("TANGGAL INVOICE", { x: margin + col, topY: infoTopY, size: 7, font: bold, color: C.muted });
  drawText(formatDate(invoice.createdAt), { x: margin + col, topY: infoTopY + 12, size: 10, font: bold });
  if (invoice.dueDate) {
    drawText("JATUH TEMPO", { x: margin + col, topY: infoTopY + 28, size: 7, font: bold, color: C.muted });
    drawText(formatDate(invoice.dueDate), {
      x: margin + col,
      topY: infoTopY + 40,
      size: 10,
      font: bold,
      color: isPaid ? C.green : C.red,
    });
  }

  // Col 3 — From
  drawText("DARI", { x: margin + col * 2, topY: infoTopY, size: 7, font: bold, color: C.muted });
  drawText("Victoria Tech", { x: margin + col * 2, topY: infoTopY + 12, size: 10, font: bold });
  drawText("info@victoriatch.com", { x: margin + col * 2, topY: infoTopY + 26, size: 8, color: C.muted });

  // ── Table ──────────────────────────────────────────────────────────────────
  const tableTopY = infoTopY + 90 + 24;

  // Table header
  page.drawRectangle({
    x: margin,
    y: y(pageHeight, tableTopY + 28),
    width: W,
    height: 28,
    color: C.light,
  });
  drawText("DESKRIPSI LAYANAN", { x: margin + 12, topY: tableTopY + 10, size: 7, font: bold, color: C.muted });
  const jumlahW = bold.widthOfTextAtSize("JUMLAH", 7);
  drawText("JUMLAH", {
    x: margin + W - jumlahW - 4,
    topY: tableTopY + 10,
    size: 7,
    font: bold,
    color: C.muted,
  });

  // Table row
  const rowTopY = tableTopY + 44;
  const desc = invoice.description ?? "Jasa Pembuatan Website";
  drawText(desc, { x: margin + 12, topY: rowTopY, size: 10, font: bold });
  drawText(`Victoria Tech — ${invoice.invoiceNo}`, { x: margin + 12, topY: rowTopY + 14, size: 9, color: C.muted });

  const amountStr = formatRupiah(invoice.amount);
  const amountW = bold.widthOfTextAtSize(amountStr, 10);
  drawText(amountStr, {
    x: margin + W - amountW - 4,
    topY: rowTopY,
    size: 10,
    font: bold,
  });

  // ── Total line ─────────────────────────────────────────────────────────────
  const totalTopY = rowTopY + 48;
  page.drawLine({
    start: { x: margin + W - 200, y: y(pageHeight, totalTopY) },
    end:   { x: margin + W, y: y(pageHeight, totalTopY) },
    thickness: 2,
    color: C.primary,
  });

  drawText("Total", { x: margin + W - 200, topY: totalTopY + 12, size: 10, color: C.muted });
  const totalAmountStr = formatRupiah(invoice.amount);
  const totalAmountW = bold.widthOfTextAtSize(totalAmountStr, 16);
  drawText(totalAmountStr, {
    x: margin + W - totalAmountW,
    topY: totalTopY + 8,
    size: 16,
    font: bold,
    color: C.primary,
  });

  // ── Due date notice ────────────────────────────────────────────────────────
  if (invoice.dueDate && !isPaid) {
    const noticeTopY = totalTopY + 52;
    const noticeH = 36;
    page.drawRectangle({
      x: margin,
      y: y(pageHeight, noticeTopY + noticeH),
      width: W,
      height: noticeH,
      color: C.yellowBg,
    });
    page.drawRectangle({
      x: margin,
      y: y(pageHeight, noticeTopY + noticeH),
      width: 3,
      height: noticeH,
      color: C.yellow,
    });
    const noticeLine1 = `Jatuh Tempo: Harap lakukan pembayaran sebelum ${formatDate(invoice.dueDate)}.`;
    const noticeLine2 = "Konfirmasi via WhatsApp setelah transfer.";
    drawText(noticeLine1, { x: margin + 10, topY: noticeTopY + 10, size: 8, font: bold, color: C.yellow });
    drawText(noticeLine2, { x: margin + 10, topY: noticeTopY + 22, size: 8, color: C.yellow });
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footerTopY = pageHeight - 60;
  page.drawLine({
    start: { x: margin, y: y(pageHeight, footerTopY) },
    end:   { x: margin + W, y: y(pageHeight, footerTopY) },
    thickness: 0.5,
    color: C.border,
  });

  drawText("Victoria Tech  ·  victoriatch.com  ·  info@victoriatch.com", {
    x: margin,
    topY: footerTopY + 14,
    size: 8,
    color: C.muted,
  });
  const autoText = "Dokumen ini dibuat secara otomatis";
  const autoTextW = regular.widthOfTextAtSize(autoText, 8);
  drawText(autoText, {
    x: margin + W - autoTextW,
    topY: footerTopY + 14,
    size: 8,
    color: C.muted,
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNo}.pdf"`,
      "Content-Length": String(buffer.length),
    },
  });
}
