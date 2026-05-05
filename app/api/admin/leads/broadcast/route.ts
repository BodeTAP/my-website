import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWABatch } from "@/lib/whatsapp";
import { getFonnteKeys } from "@/lib/getFonnteKey";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { leadIds, message } = await req.json() as { leadIds: string[]; message: string };
    if (!leadIds?.length) return NextResponse.json({ error: "Pilih minimal 1 lead" }, { status: 400 });
    if (!message?.trim()) return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    if (leadIds.length > 20) return NextResponse.json({ error: "Maksimal 20 lead per broadcast untuk menghindari blokir WA." }, { status: 400 });

    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
      select: { id: true, name: true, businessName: true, whatsapp: true },
    });

    // Fetch semua token yang tersedia — jika lebih dari 1, Fonnte otomatis rotasi device
    const waKeys = await getFonnteKeys();

    if (!waKeys.length) {
      return NextResponse.json({ error: "Fonnte API key belum dikonfigurasi" }, { status: 500 });
    }

    // Personalisasi pesan untuk setiap lead
    const items = leads.map((lead) => ({
      phone: lead.whatsapp,
      message: message
        .replace(/\{name\}/g, lead.name)
        .replace(/\{businessName\}/g, lead.businessName),
      leadId: lead.id,
      name: lead.name,
    }));

    // Kirim semua pesan dalam 1 API call — delay & rotasi device dihandle Fonnte
    // Tidak ada loop blocking → aman dari timeout Vercel
    const batchResults = await sendWABatch(
      items.map(({ phone, message }) => ({ phone, message })),
      waKeys,
      "8-16", // delay 8-16 detik random antar pesan, dihandle server Fonnte
    );

    // Map hasil kembali ke lead ID
    const results = items.map((item, idx) => ({
      id: item.leadId,
      name: item.name,
      ok: batchResults[idx]?.ok ?? false,
    }));

    const sent   = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;

    // Update status semua lead yang berhasil dikirim ke FOLLOWUP
    const sentIds = results.filter((r) => r.ok).map((r) => r.id);
    if (sentIds.length > 0) {
      await prisma.lead.updateMany({
        where: { id: { in: sentIds } },
        data:  { status: "FOLLOWUP" },
      });
    }

    console.log(
      `[Broadcast] ${sent} queued, ${failed} failed` +
      ` | ${waKeys.length} device(s) rotated` +
      ` | leads: ${leadIds.length}`,
    );

    return NextResponse.json({ sent, failed, results, devices: waKeys.length });
  } catch (err) {
    console.error("[Broadcast]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
