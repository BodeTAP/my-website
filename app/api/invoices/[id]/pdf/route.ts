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

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const isAdmin = (session.user as { role?: string })?.role === "ADMIN";

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: { include: { user: { select: { name: true, email: true } } } } },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });

  if (!isAdmin) {
    const user = await prisma.user.findUnique({
      where: { email: session.user!.email! },
      include: { client: true },
    });
    if (!user?.client || user.client.id !== invoice.clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // ── Document setup ─────────────────────────────────────────────────────────
  const pdfDoc  = await PDFDocument.create();
  const W_PAGE  = 595;
  const H_PAGE  = 842;
  const page    = pdfDoc.addPage([W_PAGE, H_PAGE]);
  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const ML = 48;               // margin left
  const MR = 48;               // margin right
  const CW = W_PAGE - ML - MR; // content width = 499
  const isPaid = invoice.status === "PAID";

  // Colours
  const C = {
    primary:  hexToRgb("#1e40af"),
    primaryDk:hexToRgb("#1e3a8a"),
    white:    rgb(1, 1, 1),
    text:     hexToRgb("#0f172a"),
    muted:    hexToRgb("#64748b"),
    light:    hexToRgb("#f1f5f9"),
    border:   hexToRgb("#cbd5e1"),
    green:    hexToRgb("#166534"),
    greenBg:  hexToRgb("#dcfce7"),
    red:      hexToRgb("#991b1b"),
    redBg:    hexToRgb("#fee2e2"),
    amber:    hexToRgb("#92400e"),
    amberBg:  hexToRgb("#fef3c7"),
  };

  // Helper: draw text (Y measured from top)
  const txt = (
    text: string,
    x: number,
    topY: number,
    size: number,
    font = regular,
    color = C.text,
  ) => page.drawText(text, { x, y: H_PAGE - topY, size, font, color });

  // Helper: right-aligned text
  const txtR = (
    text: string,
    rightX: number,
    topY: number,
    size: number,
    font = regular,
    color = C.text,
  ) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: rightX - w, y: H_PAGE - topY, size, font, color });
  };

  // Helper: filled rectangle (Y from top)
  const rect = (x: number, topY: number, w: number, h: number, color: ReturnType<typeof rgb>) =>
    page.drawRectangle({ x, y: H_PAGE - topY - h, width: w, height: h, color });

  // Helper: horizontal line (Y from top)
  const hline = (topY: number, x1 = ML, x2 = ML + CW, thickness = 0.5, color = C.border) =>
    page.drawLine({ start: { x: x1, y: H_PAGE - topY }, end: { x: x2, y: H_PAGE - topY }, thickness, color });

  // ── 1. HEADER BAR ──────────────────────────────────────────────────────────
  const HEADER_H = 108;
  rect(0, 0, W_PAGE, HEADER_H, C.primary);

  // Company — left
  txt("MFWEB",                     ML, 36, 18, bold, C.white);
  txt("Solusi Website Profesional", ML, 58, 8,  regular, hexToRgb("#bfdbfe"));
  txt("mfweb.com  ·  info@mfweb.com", ML, 70, 7.5, regular, hexToRgb("#93c5fd"));

  // INVOICE label — right
  txtR("INVOICE", ML + CW, 40, 26, bold, C.white);
  txtR(`#${invoice.invoiceNo}`, ML + CW, 68, 9, regular, hexToRgb("#bfdbfe"));

  // ── 2. STATUS BADGE ────────────────────────────────────────────────────────
  const BADGE_TOP = HEADER_H + 16;
  const BADGE_H   = 22;
  const BADGE_W   = isPaid ? 72 : 110;
  const BADGE_X   = ML + CW - BADGE_W;
  const badgeLabel = isPaid ? "LUNAS" : "BELUM DIBAYAR";

  rect(BADGE_X, BADGE_TOP, BADGE_W, BADGE_H, isPaid ? C.greenBg : C.redBg);

  // left accent bar on badge
  rect(BADGE_X, BADGE_TOP, 3, BADGE_H, isPaid ? C.green : C.red);

  const labelW = bold.widthOfTextAtSize(badgeLabel, 8);
  txt(badgeLabel, BADGE_X + (BADGE_W - labelW) / 2 + 1.5, BADGE_TOP + 8, 8, bold,
      isPaid ? C.green : C.red);

  // ── 3. INFO COLUMNS ────────────────────────────────────────────────────────
  const INFO_TOP = HEADER_H + 20;   // align with badge top
  const COL_W    = CW / 2;          // two columns, left half

  // Col A — Tagihan Kepada
  txt("TAGIHAN KEPADA", ML, INFO_TOP, 7, bold, C.muted);
  txt(invoice.client.businessName, ML, INFO_TOP + 14, 11, bold);
  let ay = INFO_TOP + 28;
  if (invoice.client.user.name) {
    txt(invoice.client.user.name, ML, ay, 9, regular, C.muted);
    ay += 13;
  }
  txt(invoice.client.user.email, ML, ay, 9, regular, C.muted);

  // Col B — Tanggal (sits left of the badge)
  const BX = ML + COL_W;
  txt("TANGGAL INVOICE", BX, INFO_TOP, 7, bold, C.muted);
  txt(formatDate(invoice.createdAt), BX, INFO_TOP + 14, 10, bold);
  if (invoice.dueDate) {
    txt("JATUH TEMPO", BX, INFO_TOP + 30, 7, bold, C.muted);
    txt(formatDate(invoice.dueDate), BX, INFO_TOP + 44, 10, bold,
        isPaid ? C.green : C.red);
  }

  // ── 4. DIVIDER ─────────────────────────────────────────────────────────────
  const DIV1 = Math.max(
    BADGE_TOP + BADGE_H,
    INFO_TOP + (invoice.dueDate ? 58 : 42),
  ) + 18;
  hline(DIV1);

  // ── 5. TABLE ───────────────────────────────────────────────────────────────
  const TBL_TOP    = DIV1 + 12;
  const TBL_HEAD_H = 26;
  const COL_AMT_W  = 140;   // amount column width (right side)

  // Header row background
  rect(ML, TBL_TOP, CW, TBL_HEAD_H, C.light);

  // Vertical separator inside header
  page.drawLine({
    start: { x: ML + CW - COL_AMT_W, y: H_PAGE - TBL_TOP },
    end:   { x: ML + CW - COL_AMT_W, y: H_PAGE - TBL_TOP - TBL_HEAD_H },
    thickness: 0.5,
    color: C.border,
  });

  txt("DESKRIPSI LAYANAN", ML + 10, TBL_TOP + 10, 7, bold, C.muted);
  txtR("JUMLAH",           ML + CW - 10, TBL_TOP + 10, 7, bold, C.muted);

  // Row
  const ROW_TOP = TBL_TOP + TBL_HEAD_H + 14;
  const desc    = invoice.description ?? "Jasa Pembuatan Website";
  txt(desc, ML + 10, ROW_TOP, 10, bold);
  txt(`MFWEB — ${invoice.invoiceNo}`, ML + 10, ROW_TOP + 15, 8, regular, C.muted);

  const amtStr = formatRupiah(invoice.amount);
  txtR(amtStr, ML + CW - 10, ROW_TOP, 10, bold);

  // Row bottom separator
  const ROW_BOTTOM = ROW_TOP + 30;
  hline(ROW_BOTTOM);

  // ── 6. TOTAL BOX ───────────────────────────────────────────────────────────
  const TOT_TOP = ROW_BOTTOM + 16;
  const TOT_W   = 200;
  const TOT_H   = 44;
  const TOT_X   = ML + CW - TOT_W;

  rect(TOT_X, TOT_TOP, TOT_W, TOT_H, C.primary);

  txt("TOTAL TAGIHAN", TOT_X + 12, TOT_TOP + 10, 7, bold, hexToRgb("#bfdbfe"));
  txtR(formatRupiah(invoice.amount), ML + CW - 10, TOT_TOP + 28, 14, bold, C.white);

  // ── 7. NOTICE BOX (if unpaid) ──────────────────────────────────────────────
  if (invoice.dueDate && !isPaid) {
    const NOT_TOP = TOT_TOP + TOT_H + 20;
    const NOT_H   = 40;
    rect(ML, NOT_TOP, CW, NOT_H, C.amberBg);
    rect(ML, NOT_TOP, 3,  NOT_H, C.amber);
    txt("Harap lakukan pembayaran sebelum:", ML + 12, NOT_TOP + 11, 8, bold, C.amber);
    txt(
      `${formatDate(invoice.dueDate)}  ·  Konfirmasi via WhatsApp setelah transfer.`,
      ML + 12, NOT_TOP + 25, 8, regular, C.amber,
    );
  }

  // ── 8. FOOTER ──────────────────────────────────────────────────────────────
  const FOOT_TOP = H_PAGE - 48;
  hline(FOOT_TOP, ML, ML + CW, 0.5, C.border);

  txt(
    "MFWEB  ·  mfweb.com  ·  info@mfweb.com",
    ML, FOOT_TOP + 16, 7.5, regular, C.muted,
  );
  txtR(
    "Dokumen dibuat secara otomatis",
    ML + CW, FOOT_TOP + 16, 7.5, regular, C.muted,
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  const pdfBytes = await pdfDoc.save();
  const buffer   = Buffer.from(pdfBytes);

  return new Response(buffer, {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNo}.pdf"`,
      "Content-Length":      String(buffer.length),
    },
  });
}
