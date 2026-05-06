import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWABatch } from "@/lib/whatsapp";
import { getFonnteKeys } from "@/lib/getFonnteKey";
import { rateLimit } from "@/lib/rateLimit";

// ── Constants ─────────────────────────────────────────────────────────────────

const COOLDOWN_HOURS    = 24;
const DAILY_LIMIT       = 50;   // max messages per Fonnte token per day
const ALLOWED_HOURS_WIB = { start: 8, end: 20 }; // 08:00–20:00 WIB (UTC+7)

// ── Phone validation ──────────────────────────────────────────────────────────

/** Returns true if the phone number looks like a valid Indonesian mobile number */
function isValidIndonesianPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  // After normalization should be 628xxx (10–15 digits total)
  if (digits.length < 10 || digits.length > 15) return false;
  // Must start with 62, 08, or 8
  if (!digits.startsWith("62") && !digits.startsWith("08") && !digits.startsWith("8")) return false;
  return true;
}

// ── Time check ────────────────────────────────────────────────────────────────

/** Returns current hour in WIB (UTC+7) */
function getWIBHour(): number {
  return (new Date().getUTCHours() + 7) % 24;
}

function isWithinAllowedHours(): boolean {
  const h = getWIBHour();
  return h >= ALLOWED_HOURS_WIB.start && h < ALLOWED_HOURS_WIB.end;
}

// ── Message variation ─────────────────────────────────────────────────────────

const MSG_SUFFIXES = [
  "",
  "\n\n_Semoga harinya menyenangkan!_ 😊",
  "\n\n_Kami siap membantu kapan saja._ 🙏",
  "\n\n_Jangan ragu untuk bertanya!_ 💬",
  "\n\n_Terima kasih atas waktunya._ 🌟",
  "\n\n_Salam sukses untuk bisnisnya!_ 🚀",
];

const BULLET_EMOJIS = ["✅", "☑️", "✔️", "💡", "⭐"];

/** Greeting variants based on current WIB hour */
function getTimeGreeting(): string {
  const h = getWIBHour();
  if (h >= 4  && h < 11) return "Selamat pagi";
  if (h >= 11 && h < 15) return "Selamat siang";
  if (h >= 15 && h < 19) return "Selamat sore";
  return "Selamat malam";
}

function varyMessage(message: string, index: number): string {
  let result = message;

  // 1. Replace bullet emojis
  if (result.includes("✅")) {
    result = result.replaceAll("✅", BULLET_EMOJIS[index % BULLET_EMOJIS.length]);
  }

  // 2. Replace generic "Halo" opener with time-based greeting (every 3rd message)
  if (index % 3 !== 0 && result.startsWith("Halo")) {
    const greeting = getTimeGreeting();
    result = result.replace(/^Halo/, greeting);
  }

  // 3. Append rotating suffix
  const suffix = MSG_SUFFIXES[index % MSG_SUFFIXES.length];
  if (suffix) {
    const footerIdx = result.lastIndexOf("\n\n_MFWEB");
    result = footerIdx !== -1
      ? result.slice(0, footerIdx) + suffix + result.slice(footerIdx)
      : result + suffix;
  }

  return result;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Time restriction — only allow 08:00–20:00 WIB
  if (!isWithinAllowedHours()) {
    const h = getWIBHour();
    return NextResponse.json({
      error: `Broadcast hanya diizinkan pukul 08.00–20.00 WIB. Sekarang pukul ${h.toString().padStart(2, "0")}:xx WIB.`,
      code:  "OUTSIDE_HOURS",
    }, { status: 400 });
  }

  try {
    const { leadIds, message, skipCooldown = false, forceOutsideHours = false } = await req.json() as {
      leadIds:            string[];
      message:            string;
      skipCooldown?:      boolean;
      forceOutsideHours?: boolean;
    };

    if (!leadIds?.length) return NextResponse.json({ error: "Pilih minimal 1 lead" }, { status: 400 });
    if (!message?.trim()) return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    if (leadIds.length > 20) return NextResponse.json({ error: "Maksimal 20 lead per broadcast." }, { status: 400 });

    const waKeys = await getFonnteKeys();
    if (!waKeys.length) return NextResponse.json({ error: "Fonnte API key belum dikonfigurasi" }, { status: 500 });

    // 2. Daily counter per Fonnte token via Redis
    const session = await auth();
    const adminEmail = session?.user?.email ?? "unknown";
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { allowed, remaining } = await rateLimit(
      `broadcast-daily:${adminEmail}:${today}`,
      DAILY_LIMIT,
      24 * 60 * 60 * 1000,
    );
    if (!allowed) {
      return NextResponse.json({
        error: `Batas harian ${DAILY_LIMIT} pesan tercapai. Coba lagi besok.`,
        code:  "DAILY_LIMIT",
      }, { status: 429 });
    }

    const leads = await prisma.lead.findMany({
      where:  { id: { in: leadIds } },
      select: { id: true, name: true, businessName: true, whatsapp: true, lastContactedAt: true },
    });

    // 3. Filter invalid phone numbers
    const invalidPhones: string[] = [];
    const validLeads = leads.filter((lead) => {
      if (!isValidIndonesianPhone(lead.whatsapp)) {
        invalidPhones.push(lead.name);
        return false;
      }
      return true;
    });

    // 4. Cooldown check
    const now         = new Date();
    const cooldownMs  = COOLDOWN_HOURS * 60 * 60 * 1000;
    const cooldownLeads: string[] = [];

    const eligibleLeads = validLeads.filter((lead) => {
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
        error: `Tidak ada lead yang bisa dikirim. ${cooldownLeads.length} dalam cooldown, ${invalidPhones.length} nomor tidak valid.`,
        cooldownLeads,
        invalidPhones,
        code: "NO_ELIGIBLE",
      }, { status: 400 });
    }

    // 5. Build items with personalization + variation
    const items = eligibleLeads.map((lead, idx) => ({
      phone:  lead.whatsapp,
      message: varyMessage(
        message.replace(/\{name\}/g, lead.name).replace(/\{businessName\}/g, lead.businessName),
        idx,
      ),
      leadId: lead.id,
      name:   lead.name,
    }));

    // 6. Adaptive delay
    const delayRange = items.length <= 5 ? "15-30" : items.length <= 10 ? "20-40" : "30-60";

    // 7. Estimate completion time for UI
    const [minDelay, maxDelay] = delayRange.split("-").map(Number);
    const avgDelay = (minDelay + maxDelay) / 2;
    const estimatedSeconds = Math.round(items.length * avgDelay);

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

    // 8. Update leads + save broadcast log
    const sentIds = results.filter((r) => r.ok).map((r) => r.id);
    await Promise.all([
      sentIds.length > 0
        ? prisma.lead.updateMany({
            where: { id: { in: sentIds } },
            data:  { status: "FOLLOWUP", lastContactedAt: now },
          })
        : Promise.resolve(),
      prisma.broadcastLog.create({
        data: {
          totalLeads:     eligibleLeads.length,
          sent,
          failed,
          skipped:        cooldownLeads.length + invalidPhones.length,
          devices:        waKeys.length,
          delayRange,
          messageSnippet: message.slice(0, 100),
        },
      }),
    ]);

    console.log(
      `[Broadcast] ${sent} queued, ${failed} failed` +
      ` | cooldown: ${cooldownLeads.length}, invalid: ${invalidPhones.length}` +
      ` | ${waKeys.length} device(s) | delay: ${delayRange}s | remaining today: ${remaining}`,
    );

    return NextResponse.json({
      sent,
      failed,
      results,
      devices:          waKeys.length,
      skipped:          cooldownLeads.length,
      invalidPhones:    invalidPhones.length > 0 ? invalidPhones : undefined,
      cooldownLeads:    cooldownLeads.length > 0 ? cooldownLeads : undefined,
      delayRange,
      estimatedSeconds,
      remainingToday:   remaining,
    });
  } catch (err) {
    console.error("[Broadcast]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ── Broadcast history ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.broadcastLog.findMany({
    orderBy: { sentAt: "desc" },
    take:    20,
  });

  return NextResponse.json(logs);
}
