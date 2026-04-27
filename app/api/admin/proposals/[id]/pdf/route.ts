import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
type LineItem = { label: string; price: number };

function hex(h: string) {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
function rp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}
function fmtDate(d: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  // ── Setup ───────────────────────────────────────────────────────────────────
  const doc  = await PDFDocument.create();
  const W    = 595;
  const H    = 842;
  const page = doc.addPage([W, H]);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg  = await doc.embedFont(StandardFonts.Helvetica);

  const ML = 48;
  const CW = W - ML * 2;

  const C = {
    primary:  hex("#1e40af"),
    primaryDk:hex("#1e3a8a"),
    accent:   hex("#0d9488"),
    white:    rgb(1, 1, 1),
    text:     hex("#0f172a"),
    muted:    hex("#64748b"),
    light:    hex("#f1f5f9"),
    border:   hex("#cbd5e1"),
    green:    hex("#166534"),
    greenBg:  hex("#dcfce7"),
    amber:    hex("#92400e"),
    amberBg:  hex("#fef9c3"),
  };

  // Y measured from top; all draw calls convert internally
  const txt = (t: string, x: number, topY: number, sz: number, font = reg, color = C.text) =>
    page.drawText(t, { x, y: H - topY, size: sz, font, color });

  const txtR = (t: string, rightX: number, topY: number, sz: number, font = reg, color = C.text) => {
    const w = font.widthOfTextAtSize(t, sz);
    page.drawText(t, { x: rightX - w, y: H - topY, size: sz, font, color });
  };

  const rect = (x: number, topY: number, w: number, h: number, color: ReturnType<typeof rgb>) =>
    page.drawRectangle({ x, y: H - topY - h, width: w, height: h, color });

  const hline = (topY: number, x1 = ML, x2 = ML + CW, thickness = 0.5, color = C.border) =>
    page.drawLine({ start: { x: x1, y: H - topY }, end: { x: x2, y: H - topY }, thickness, color });

  // ── 1. HEADER ───────────────────────────────────────────────────────────────
  const HDR_H = 112;
  rect(0, 0, W, HDR_H, C.primary);
  // Accent stripe bottom of header
  rect(0, HDR_H - 4, W, 4, C.accent);

  txt("MFWEB",                        ML, 34,  20, bold, C.white);
  txt("Solusi Website Profesional",    ML, 57,   8, reg,  hex("#bfdbfe"));
  txt("mfweb.id  ·  info@mfweb.id",   ML, 70,   7.5, reg, hex("#93c5fd"));

  txtR("PROPOSAL",                    ML + CW, 38,  22, bold, C.white);
  txtR("LAYANAN WEBSITE",             ML + CW, 62,   8, reg,  hex("#bfdbfe"));
  txtR(`#${proposal.proposalNo}`,     ML + CW, 75,   8, reg,  hex("#7dd3fc"));

  // ── 2. RECIPIENT + DATES ────────────────────────────────────────────────────
  const INFO_Y = HDR_H + 22;
  const COL2_X = ML + CW / 2;

  txt("DITUJUKAN KEPADA",  ML,      INFO_Y,      7,  bold, C.muted);
  txt(proposal.businessName, ML,    INFO_Y + 14, 12, bold);
  txt(proposal.clientName,  ML,     INFO_Y + 29, 9,  reg,  C.muted);
  if (proposal.whatsapp) txt(`WA: ${proposal.whatsapp}`, ML, INFO_Y + 42, 8, reg, C.muted);

  txt("TANGGAL PROPOSAL",  COL2_X,  INFO_Y,      7,  bold, C.muted);
  txt(fmtDate(proposal.createdAt), COL2_X, INFO_Y + 14, 10, bold);
  if (proposal.validUntil) {
    txt("BERLAKU HINGGA",  COL2_X,  INFO_Y + 30, 7,  bold, C.muted);
    txt(fmtDate(proposal.validUntil), COL2_X, INFO_Y + 44, 10, bold, C.amber);
  }

  // ── 3. PACKAGE HIGHLIGHT BOX ────────────────────────────────────────────────
  const PKG_Y = INFO_Y + 68;
  const PKG_H = 40;
  rect(ML, PKG_Y, CW, PKG_H, hex("#eff6ff"));
  rect(ML, PKG_Y, 4,  PKG_H, C.primary);

  txt("PAKET YANG DIREKOMENDASIKAN", ML + 14, PKG_Y + 11, 7, bold, C.muted);
  txt(proposal.packageLabel,         ML + 14, PKG_Y + 26, 12, bold, C.primary);
  txtR(rp(proposal.basePrice),       ML + CW - 12, PKG_Y + 26, 11, bold, C.primary);

  // ── 4. PRICING TABLE ────────────────────────────────────────────────────────
  const TBL_Y = PKG_Y + PKG_H + 18;
  hline(TBL_Y);
  txt("RINCIAN HARGA", ML, TBL_Y + 13, 8, bold, C.muted);

  const addons      = (proposal.addons      as LineItem[]) ?? [];
  const customItems = (proposal.customItems as LineItem[]) ?? [];
  const allItems: LineItem[] = [
    { label: proposal.packageLabel + " (Paket Dasar)", price: proposal.basePrice },
    ...addons.map(a => ({ label: "+ " + a.label, price: a.price })),
    ...customItems.map(c => ({ label: "+ " + c.label, price: c.price })),
  ];

  let rowY = TBL_Y + 26;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const isBase = i === 0;
    const rowH = isBase ? 22 : 17;          // base row slightly taller
    txt(item.label, ML + 8, rowY + (isBase ? 14 : 11), isBase ? 9 : 8, isBase ? bold : reg, isBase ? C.text : C.muted);
    txtR(rp(item.price), ML + CW - 8, rowY + (isBase ? 14 : 11), isBase ? 9 : 8, isBase ? bold : reg, isBase ? C.text : C.muted);
    rowY += rowH;
  }

  // Total box
  const TOT_Y = rowY + 8;
  hline(TOT_Y);
  const TOT_BOX_H = 42;
  const TOT_BOX_W = 220;
  const TOT_BOX_X = ML + CW - TOT_BOX_W;
  rect(TOT_BOX_X, TOT_Y + 8, TOT_BOX_W, TOT_BOX_H, C.primary);
  txt("TOTAL INVESTASI", TOT_BOX_X + 12, TOT_Y + 18, 7, bold, hex("#bfdbfe"));
  txtR(rp(proposal.totalPrice), ML + CW - 12, TOT_Y + 38, 14, bold, C.white);

  // ── 5. TIMELINE + NOTES ─────────────────────────────────────────────────────
  const META_Y = TOT_Y + TOT_BOX_H + 24;
  hline(META_Y);

  txt("ESTIMASI TIMELINE", ML, META_Y + 14, 7, bold, C.muted);
  txt(proposal.timeline,   ML, META_Y + 27, 10, bold);

  if (proposal.validUntil) {
    const valX = ML + CW / 2;
    txt("PROPOSAL BERLAKU HINGGA", valX, META_Y + 14, 7, bold, C.muted);
    txt(fmtDate(proposal.validUntil), valX, META_Y + 27, 10, bold);
  }

  let afterMeta = META_Y + 46;

  if (proposal.notes) {
    hline(afterMeta);
    txt("CATATAN", ML, afterMeta + 14, 7, bold, C.muted);
    // Simple word-wrap (max ~85 chars per line)
    const words = proposal.notes.split(" ");
    let line = "";
    let noteY = afterMeta + 27;
    for (const word of words) {
      if ((line + word).length > 85) {
        txt(line.trim(), ML, noteY, 8.5, reg, C.muted);
        noteY += 13;
        line = word + " ";
      } else {
        line += word + " ";
      }
    }
    if (line.trim()) { txt(line.trim(), ML, noteY, 8.5, reg, C.muted); noteY += 13; }
    afterMeta = noteY + 12;
  }

  // ── 6. NEXT STEPS ───────────────────────────────────────────────────────────
  const NS_H   = 116;
  const NS_Y   = afterMeta + 4;
  rect(ML, NS_Y, CW, NS_H, hex("#f8fafc"));
  rect(ML, NS_Y, 4,  NS_H, C.accent);

  txt("LANGKAH SELANJUTNYA", ML + 14, NS_Y + 14, 8, bold, C.accent);

  const steps = [
    "Konfirmasi pilihan paket via WhatsApp",
    "Lakukan pembayaran DP 50% untuk memulai pengerjaan",
    "Isi formulir onboarding untuk detail konten & aset bisnis",
    "Tim kami memulai pengerjaan sesuai timeline yang disepakati",
  ];
  // step spacing 16px — clear of 8pt text which takes ~10px
  steps.forEach((s, i) => {
    txt(`${i + 1}.  ${s}`, ML + 14, NS_Y + 30 + i * 16, 8, reg, C.muted);
  });

  const WA_NUM = process.env.WHATSAPP_NUMBER ?? "6282221682343";
  const WA_MSG = `Halo MFWEB, saya ingin konfirmasi proposal ${proposal.proposalNo} untuk ${proposal.businessName}.`;
  txt(`Hubungi kami: wa.me/${WA_NUM}`,  ML + 14, NS_Y + NS_H - 22, 7.5, bold,  C.accent);
  txt(`Ketik: "${WA_MSG.slice(0, 72)}${WA_MSG.length > 72 ? "…" : ""}"`,
      ML + 14, NS_Y + NS_H - 9,  6.5, reg,  C.muted);

  // ── 7. FOOTER ───────────────────────────────────────────────────────────────
  hline(H - 44);
  txt(`MFWEB  ·  mfweb.id  ·  info@mfweb.id`, ML, H - 30, 7.5, reg, C.muted);
  txtR(`Proposal ini bersifat estimasi dan dapat disesuaikan`, ML + CW, H - 30, 7, reg, C.muted);

  // ── Render ──────────────────────────────────────────────────────────────────
  const pdfBytes = await doc.save();

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="Proposal-${proposal.proposalNo}.pdf"`,
    },
  });
}
