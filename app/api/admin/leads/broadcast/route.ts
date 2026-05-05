import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWA, getFonnteKey } from "@/lib/whatsapp";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

/** Delay random antara min-max ms agar tidak terdeteksi sebagai bot */
function randomDelay(minMs: number, maxMs: number) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((r) => setTimeout(r, ms));
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

    const results: { id: string; name: string; ok: boolean }[] = [];

    // Fetch key once — bisa dari DB (admin settings) atau env var
    const waKey = await getFonnteKey();

    for (const lead of leads) {
      const personalizedMsg = message
        .replace(/\{name\}/g, lead.name)
        .replace(/\{businessName\}/g, lead.businessName);

      const ok = await sendWA(lead.whatsapp, personalizedMsg, waKey);
      results.push({ id: lead.id, name: lead.name, ok });

      // Jeda random 4-8 detik antar pesan agar tidak terdeteksi sebagai bot oleh WhatsApp
      if (leads.indexOf(lead) < leads.length - 1) await randomDelay(4000, 8000);
    }

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

    return NextResponse.json({ sent, failed, results });
  } catch (err) {
    console.error("[Broadcast]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
