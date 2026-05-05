import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWABatch } from "@/lib/whatsapp";
import { getFonnteKeys } from "@/lib/getFonnteKey";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

// Minimum hours between broadcasts to the same lead
const COOLDOWN_HOURS = 24;

// Message variation prefixes — randomly prepended to avoid identical messages
const MSG_VARIATIONS = [
  "", // no prefix (original)
  "Selamat pagi! ",
  "Halo! ",
  "Permisi, ",
  "Salam kenal! ",
];

/** Inject a random variation prefix into the message to avoid identical texts */
function varyMessage(message: string, index: number): string {
  const prefix = MSG_VARIATIONS[index % MSG_VARIATIONS.length];
  if (!prefix) return message;
  // Only prepend if message starts with "Halo" — avoid double greeting
  if (message.startsWith("Halo") || message.startsWith("halo")) return message;
  return prefix + message;
}

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { leadIds, message, skipCooldown = false } = await req.json() as {
      leadIds: string[];
      message: string;
      skipCooldown?: boolean;
    };

    if (!leadIds?.length) return NextResponse.json({ error: "Pilih minimal 1 lead" }, { status: 400 });
    if (!message?.trim()) return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    if (leadIds.length > 20) return NextResponse.json({ error: "Maksimal 20 lead per broadcast untuk menghindari blokir WA." }, { status: 400 });

    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
      select: { id: true, name: true, businessName: true, whatsapp: true, lastContactedAt: true },
    });

    // Cooldown check — skip leads contacted within COOLDOWN_HOURS
    const now = new Date();
    const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;

    const cooldownLeads: string[] = [];
    const eligibleLeads = leads.filter((lead) => {
      if (skipCooldown) return true;
      if (!lead.lastContactedAt) return true;
      const elapsed = now.getTime() - new Date(lead.lastContactedAt).getTime();
      if (elapsed < cooldownMs) {
        cooldownLeads.push(lead.name);
        return false;
      }
      return true;
    });

    if (eligibleLeads.length === 0) {
      return NextResponse.json({
        error: `Semua lead masih dalam cooldown ${COOLDOWN_HOURS} jam. Tunggu sebelum broadcast ulang.`,
        cooldownLeads,
      }, { status: 400 });
    }

    const waKeys = await getFonnteKeys();
    if (!waKeys.length) {
      return NextResponse.json({ error: "Fonnte API key belum dikonfigurasi" }, { status: 500 });
    }

    // Build items with personalization + message variation
    const items = eligibleLeads.map((lead, idx) => ({
      phone: lead.whatsapp,
      message: varyMessage(
        message
          .replace(/\{name\}/g, lead.name)
          .replace(/\{businessName\}/g, lead.businessName),
        idx,
      ),
      leadId: lead.id,
      name:   lead.name,
    }));

    // Adaptive delay — longer for bigger batches
    const delayRange = items.length <= 5 ? "15-30" : items.length <= 10 ? "20-40" : "30-60";

    const batchResults = await sendWABatch(
      items.map(({ phone, message }) => ({ phone, message })),
      waKeys,
      delayRange,
    );

    const results = items.map((item, idx) => ({
      id:   item.leadId,
      name: item.name,
      ok:   batchResults[idx]?.ok ?? false,
    }));

    const sent   = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;

    // Update status + lastContactedAt for successfully sent leads
    const sentIds = results.filter((r) => r.ok).map((r) => r.id);
    if (sentIds.length > 0) {
      await prisma.lead.updateMany({
        where: { id: { in: sentIds } },
        data:  { status: "FOLLOWUP", lastContactedAt: now },
      });
    }

    console.log(
      `[Broadcast] ${sent} queued, ${failed} failed, ${cooldownLeads.length} skipped (cooldown)` +
      ` | ${waKeys.length} device(s) | delay: ${delayRange}s`,
    );

    return NextResponse.json({
      sent,
      failed,
      results,
      devices:       waKeys.length,
      skipped:       cooldownLeads.length,
      cooldownLeads: cooldownLeads.length > 0 ? cooldownLeads : undefined,
      delayRange,
    });
  } catch (err) {
    console.error("[Broadcast]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
