import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

// DELETE — bulk delete leads
export async function DELETE(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ids } = await req.json() as { ids: string[] };
    if (!ids?.length) return NextResponse.json({ error: "Pilih minimal 1 lead" }, { status: 400 });
    if (ids.length > 100) return NextResponse.json({ error: "Maksimal 100 lead sekaligus" }, { status: 400 });

    const { count } = await prisma.lead.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ deleted: count });
  } catch (err) {
    console.error("[Leads-DELETE]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST — bulk create leads (dari LeadFinder)
export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const rows = Array.isArray(body) ? body : [body];

    if (rows.length === 0) return NextResponse.json({ error: "Data kosong" }, { status: 400 });
    if (rows.length > 20)  return NextResponse.json({ error: "Maksimal 20 lead sekaligus" }, { status: 400 });

    // Skip duplikat berdasarkan nomor WhatsApp
    const phones = rows.map((r: { whatsapp: string }) => r.whatsapp).filter(Boolean);
    const existing = await prisma.lead.findMany({
      where: { whatsapp: { in: phones } },
      select: { whatsapp: true },
    });
    const existingPhones = new Set(existing.map((e) => e.whatsapp));

    const toInsert = rows.filter((r: { whatsapp: string }) => !existingPhones.has(r.whatsapp));

    if (toInsert.length === 0) {
      return NextResponse.json({ created: 0, skipped: rows.length, message: "Semua lead sudah ada di database." });
    }

    await prisma.lead.createMany({
      data: toInsert.map((r: {
        name: string; businessName: string; whatsapp: string;
        currentWebsite?: string; message?: string; notes?: string;
      }) => ({
        name:           r.name,
        businessName:   r.businessName,
        whatsapp:       r.whatsapp,
        currentWebsite: r.currentWebsite ?? null,
        message:        r.message ?? null,
        notes:          r.notes ?? null,
        status:         "NEW",
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ created: toInsert.length, skipped: rows.length - toInsert.length });
  } catch (err) {
    console.error("[Leads-POST]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
