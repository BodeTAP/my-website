import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, auth } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendWABatchRotated } from "@/lib/whatsapp";
import { getFonnteKeys } from "@/lib/getFonnteKey";
import { rateLimit } from "@/lib/rateLimit";

// ── Constants ─────────────────────────────────────────────────────────────────

const COOLDOWN_HOURS    = 24;
const DAILY_LIMIT       = 50;   // max messages per Fonnte token per day
const ALLOWED_HOURS_WIB = { start: 8, end: 20 }; // 08:00–20:00 WIB (UTC+7)
const BURST_PAUSE_EVERY = 5;    // pause after every N messages
const BURST_PAUSE_RANGE = { min: 90, max: 180 }; // seconds (1.5–3 min burst pause)

// ── Phone validation ──────────────────────────────────────────────────────────

/** Returns true if the phone number looks like a valid Indonesian mobile number */
function isValidIndonesianPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return false;
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

// ── Non-linear delay ──────────────────────────────────────────────────────────

/**
 * Generate a human-like delay using a bell-curve approximation.
 * Most delays cluster around the midpoint; extremes are rare.
 * Returns a delay string like "25-35" for Fonnte's `delay` param.
 */
function humanDelay(index: number, totalCount: number): string {
  // Base range scales with batch size
  const base = totalCount <= 5 ? { min: 15, max: 35 }
             : totalCount <= 10 ? { min: 20, max: 50 }
             : { min: 30, max: 70 };

  // Bell-curve: average of two random numbers clusters toward center
  const rand = () => Math.random() * 0.5 + Math.random() * 0.5; // 0–1, bell-shaped
  const spread = base.max - base.min;
  const lo = Math.round(base.min + rand() * spread * 0.6);
  const hi = Math.round(lo + 8 + rand() * 15); // 8–23s window above lo

  // Every BURST_PAUSE_EVERY messages: inject a longer pause
  if (index > 0 && index % BURST_PAUSE_EVERY === 0) {
    const pauseLo = BURST_PAUSE_RANGE.min + Math.round(Math.random() * 30);
    const pauseHi = pauseLo + Math.round(Math.random() * 60);
    return `${pauseLo}-${pauseHi}`;
  }

  return `${lo}-${hi}`;
}

// ── Synonym replacement ───────────────────────────────────────────────────────

const SYNONYMS: Record<string, string[]> = {
  "website":       ["situs web", "web bisnis", "halaman web", "website", "laman web"],
  "Website":       ["Situs web", "Web bisnis", "Halaman web", "Website", "Laman web"],
  "profesional":   ["profesional", "berkualitas", "terpercaya", "handal"],
  "Profesional":   ["Profesional", "Berkualitas", "Terpercaya", "Handal"],
  "desain":        ["desain", "tampilan", "visual", "rancangan"],
  "Desain":        ["Desain", "Tampilan", "Visual", "Rancangan"],
  "murah":         ["terjangkau", "hemat", "ekonomis", "murah"],
  "Murah":         ["Terjangkau", "Hemat", "Ekonomis", "Murah"],
  "cepat":         ["cepat", "kilat", "sigap", "responsif"],
  "Cepat":         ["Cepat", "Kilat", "Sigap", "Responsif"],
  "pelanggan":     ["pelanggan", "konsumen", "pembeli", "klien"],
  "Pelanggan":     ["Pelanggan", "Konsumen", "Pembeli", "Klien"],
  "bisnis":        ["bisnis", "usaha", "toko", "brand"],
  "Bisnis":        ["Bisnis", "Usaha", "Toko", "Brand"],
  "meningkatkan":  ["meningkatkan", "mengembangkan", "memaksimalkan", "mendongkrak"],
  "Meningkatkan":  ["Meningkatkan", "Mengembangkan", "Memaksimalkan", "Mendongkrak"],
  "online":        ["online", "digital", "di internet", "secara daring"],
  "Online":        ["Online", "Digital", "Di internet", "Secara daring"],
  "gratis":        ["gratis", "tanpa biaya", "free", "cuma-cuma"],
  "Gratis":        ["Gratis", "Tanpa biaya", "Free", "Cuma-cuma"],
};

function applySynonyms(text: string, seed: number): string {
  let result = text;
  for (const [word, variants] of Object.entries(SYNONYMS)) {
    if (result.includes(word)) {
      const replacement = variants[seed % variants.length];
      // Replace only first occurrence to avoid over-substitution
      result = result.replace(word, replacement);
    }
  }
  return result;
}

// ── Personalization context ───────────────────────────────────────────────────

type LeadContext = {
  name: string;
  businessName: string;
  currentWebsite?: string | null;
  message?: string | null;
  notes?: string | null;
};

/**
 * Build a personalized context line based on available lead data.
 * Injected just before the footer to make each message feel tailored.
 */
function buildPersonalizedLine(lead: LeadContext, index: number): string {
  const lines: string[] = [];

  // If they have an existing website, acknowledge it
  if (lead.currentWebsite) {
    const websiteLines = [
      `Kami sudah melihat website ${lead.businessName} dan ada beberapa hal yang bisa kami tingkatkan.`,
      `Website ${lead.businessName} saat ini sudah bagus, tapi kami bisa bantu buat lebih optimal lagi.`,
      `Kami perhatikan ${lead.businessName} sudah punya website — kami bisa bantu upgrade tampilannya.`,
    ];
    lines.push(websiteLines[index % websiteLines.length]);
  } else {
    // No website yet — opportunity framing
    const noWebLines = [
      `Bisnis seperti ${lead.businessName} sangat potensial untuk hadir secara online.`,
      `Banyak pelanggan mencari ${lead.businessName} lewat Google — website bisa bantu mereka menemukannya.`,
      `Dengan website, ${lead.businessName} bisa menjangkau lebih banyak pelanggan setiap harinya.`,
    ];
    lines.push(noWebLines[index % noWebLines.length]);
  }

  return lines[0];
}

// ── Message variation ─────────────────────────────────────────────────────────

const MSG_SUFFIXES = [
  "",
  "\n\n_Semoga harinya menyenangkan!_ 😊",
  "\n\n_Kami siap membantu kapan saja._ 🙏",
  "\n\n_Jangan ragu untuk bertanya!_ 💬",
  "\n\n_Terima kasih atas waktunya._ 🌟",
  "\n\n_Salam sukses untuk bisnisnya!_ 🚀",
  "\n\n_Semoga bisnis {name} makin berkembang!_ 🌱",
  "\n\n_Kami tunggu kabar baiknya ya!_ 😄",
  "\n\n_Senang bisa terhubung dengan Anda._ 🤝",
  "\n\n_Semoga hari ini penuh produktivitas!_ ⚡",
  "\n\n_Sukses selalu untuk {businessName}!_ 🎯",
  "\n\n_Terima kasih sudah meluangkan waktu._ 🙌",
  "\n\n_Kami siap jadi mitra terpercaya Anda._ 💼",
  "\n\n_Semoga kerja sama kita bisa segera dimulai!_ ✨",
  "\n\n_Salam hangat dari tim MFWEB._ 👋",
];

const BULLET_EMOJIS = ["✅", "☑️", "✔️", "💡", "⭐", "🔹", "▶️", "🎯", "💎", "🔑"];

const OPENING_VARIANTS = [
  "Halo",
  "Hai",
  "Hei",
  "Permisi",
  "Salam kenal",
];

const CLOSING_PHRASES = [
  "Boleh kami bantu?",
  "Apakah ada yang bisa kami bantu?",
  "Kami siap melayani Anda.",
  "Hubungi kami kapan saja ya!",
  "Kami tunggu respons Anda. 😊",
  "Silakan balas pesan ini jika tertarik!",
  "Yuk, kita diskusi lebih lanjut!",
  "Kami terbuka untuk konsultasi gratis.",
];

// Subtle unicode variations — invisible to reader, unique to spam filter hash
const ZERO_WIDTH_CHARS = ["\u200B", "\u200C", "\u200D", "\uFEFF"];

function injectZeroWidth(text: string, index: number): string {
  const zwc = ZERO_WIDTH_CHARS[index % ZERO_WIDTH_CHARS.length];
  const spaceIdx = text.indexOf(" ");
  if (spaceIdx === -1) return text;
  return text.slice(0, spaceIdx) + zwc + text.slice(spaceIdx);
}

/** Greeting variants based on current WIB hour */
function getTimeGreeting(): string {
  const h = getWIBHour();
  if (h >= 4  && h < 11) return "Selamat pagi";
  if (h >= 11 && h < 15) return "Selamat siang";
  if (h >= 15 && h < 19) return "Selamat sore";
  return "Selamat malam";
}

function varyMessage(
  message: string,
  index: number,
  lead: LeadContext,
): string {
  let result = message;

  // 1. Synonym substitution — seed based on index for deterministic variety
  result = applySynonyms(result, index + 7);

  // 2. Replace bullet emojis with rotating variants
  if (result.includes("✅")) {
    result = result.replaceAll("✅", BULLET_EMOJIS[index % BULLET_EMOJIS.length]);
  }

  // 3. Vary the opening greeting
  const opening = index % 4 === 0
    ? getTimeGreeting()
    : OPENING_VARIANTS[index % OPENING_VARIANTS.length];

  if (/^(Halo|Hai|Hei|Permisi)/.test(result)) {
    result = result.replace(/^(Halo|Hai|Hei|Permisi)/, opening);
  }

  // 4. Inject personalized context line before footer
  const personalLine = buildPersonalizedLine(lead, index);
  const footerIdx = result.lastIndexOf("\n\n_MFWEB");
  if (footerIdx !== -1) {
    result = result.slice(0, footerIdx) + "\n\n" + personalLine + result.slice(footerIdx);
  } else {
    result = result + "\n\n" + personalLine;
  }

  // 5. Append rotating suffix (with personalization placeholders resolved)
  const rawSuffix = MSG_SUFFIXES[index % MSG_SUFFIXES.length];
  const suffix = rawSuffix
    .replace(/\{name\}/g, lead.name)
    .replace(/\{businessName\}/g, lead.businessName);

  if (suffix) {
    const fi = result.lastIndexOf("\n\n_MFWEB");
    result = fi !== -1
      ? result.slice(0, fi) + suffix + result.slice(fi)
      : result + suffix;
  }

  // 6. Every 5th message: append a varied closing phrase
  if (index % 5 === 4) {
    const closing = "\n\n" + CLOSING_PHRASES[index % CLOSING_PHRASES.length];
    const fi = result.lastIndexOf("\n\n_MFWEB");
    result = fi !== -1
      ? result.slice(0, fi) + closing + result.slice(fi)
      : result + closing;
  }

  // 7. Inject invisible zero-width char for unique fingerprint
  result = injectZeroWidth(result, index);

  return result;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("broadcast");
  if (denied) return denied;

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
      select: { id: true, name: true, businessName: true, whatsapp: true, lastContactedAt: true, currentWebsite: true, message: true, notes: true },
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
        {
          name:           lead.name,
          businessName:   lead.businessName,
          currentWebsite: lead.currentWebsite,
          message:        lead.message,
          notes:          lead.notes,
        },
      ),
      leadId: lead.id,
      name:   lead.name,
    }));

    // 6. Build per-message delay schedule (non-linear + burst pause)
    const delaySchedule = items.map((_, idx) => humanDelay(idx, items.length));

    // Representative delay range for logging/UI (median of schedule)
    const delayRange = delaySchedule[Math.floor(delaySchedule.length / 2)] ?? "20-40";

    // 7. Estimate completion time (sum of midpoints)
    const estimatedSeconds = delaySchedule.reduce((sum, range) => {
      const [lo, hi] = range.split("-").map(Number);
      return sum + Math.round((lo + hi) / 2);
    }, 0);

    // 8. Send with per-device rotation: split items into sub-batches per device
    //    Each sub-batch uses a different API key so Fonnte sends from different devices
    const batchResults = await sendWABatchRotated(
      items.map(({ phone, message }, idx) => ({ phone, message, delayRange: delaySchedule[idx] })),
      waKeys,
    );

    const results = items.map((item, idx) => ({
      id:   item.leadId,
      name: item.name,
      ok:   batchResults[idx]?.ok ?? false,
    }));

    const sent   = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;

    // 9. Update leads + save broadcast log
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
  const denied = await requireApiPermission("broadcast");
  if (denied) return denied;

  const logs = await prisma.broadcastLog.findMany({
    orderBy: { sentAt: "desc" },
    take:    20,
  });

  return NextResponse.json(logs);
}
