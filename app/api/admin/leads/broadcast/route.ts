import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendWABatchRotated } from "@/lib/whatsapp";
import { getFonnteKeys, getFonnteKey } from "@/lib/getFonnteKey";
import { fonnteValidateNumbers } from "@/lib/fonnte";
import { loadBroadcastSettings } from "@/lib/broadcastSettings.server";
import { renderBroadcastTemplate, type BroadcastRuntimeSettings, type DelayRange } from "@/lib/broadcastSettings";

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

function isWithinAllowedHours(settings: BroadcastRuntimeSettings): boolean {
  const h = getWIBHour();
  if (settings.allowedStartHour === settings.allowedEndHour) return true;
  if (settings.allowedStartHour < settings.allowedEndHour) {
    return h >= settings.allowedStartHour && h < settings.allowedEndHour;
  }
  return h >= settings.allowedStartHour || h < settings.allowedEndHour;
}

// ── Non-linear delay ──────────────────────────────────────────────────────────

/**
 * Generate a human-like delay using a bell-curve approximation.
 * Most delays cluster around the midpoint; extremes are rare.
 * Returns a delay string like "25-35" for Fonnte's `delay` param.
 */
function pickDelayRange(settings: BroadcastRuntimeSettings, totalCount: number): DelayRange {
  if (totalCount <= 5) return settings.delaySmall;
  if (totalCount <= 10) return settings.delayMedium;
  return settings.delayLarge;
}

function humanDelay(index: number, totalCount: number, settings: BroadcastRuntimeSettings): string {
  // Base range scales with batch size
  const base = pickDelayRange(settings, totalCount);

  // Bell-curve: average of two random numbers clusters toward center
  const rand = () => Math.random() * 0.5 + Math.random() * 0.5; // 0–1, bell-shaped
  const spread = base.max - base.min;
  const lo = Math.round(base.min + rand() * spread * 0.6);
  const hi = Math.round(lo + 8 + rand() * 15); // 8–23s window above lo

  // Every BURST_PAUSE_EVERY messages: inject a longer pause
  if (settings.burstPauseEvery > 0 && index > 0 && index % settings.burstPauseEvery === 0) {
    const spread = settings.burstPauseMaxSeconds - settings.burstPauseMinSeconds;
    const pauseLo = settings.burstPauseMinSeconds + Math.round(Math.random() * Math.max(0, Math.min(30, spread)));
    const pauseHi = Math.min(
      settings.burstPauseMaxSeconds,
      pauseLo + Math.round(Math.random() * Math.max(0, Math.min(60, spread))),
    );
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
  "jasa":          ["jasa", "layanan", "servis", "solusi"],
  "Jasa":          ["Jasa", "Layanan", "Servis", "Solusi"],
  "harga":         ["harga", "biaya", "tarif", "investasi"],
  "Harga":         ["Harga", "Biaya", "Tarif", "Investasi"],
};

/**
 * FIX #2: Replace ALL occurrences of each synonym consistently within a message,
 * using a per-word offset so different words get different variants even with the same seed.
 */
function applySynonyms(text: string, seed: number): string {
  let result = text;
  let wordOffset = 0;
  for (const [word, variants] of Object.entries(SYNONYMS)) {
    if (result.includes(word)) {
      const variant = variants[(seed + wordOffset) % variants.length];
      // Replace ALL occurrences, not just the first
      result = result.replaceAll(word, variant);
      wordOffset++;
    }
  }
  return result;
}

// ── Business category detection ───────────────────────────────────────────────

type BizCategory = "food" | "retail" | "health" | "beauty" | "service" | "property" | "edu" | "general";

const CATEGORY_KEYWORDS: Record<BizCategory, string[]> = {
  food:     ["resto", "restoran", "warung", "cafe", "kafe", "makan", "kuliner", "bakery", "catering", "kedai", "rumah makan", "food"],
  retail:   ["toko", "shop", "store", "jualan", "dagang", "olshop", "online shop", "butik", "fashion", "pakaian", "baju", "sepatu"],
  health:   ["klinik", "dokter", "apotek", "farmasi", "kesehatan", "medis", "rumah sakit", "puskesmas", "fisioterapi"],
  beauty:   ["salon", "spa", "kecantikan", "barbershop", "barber", "nail", "skincare", "kosmetik", "perawatan"],
  service:  ["jasa", "servis", "bengkel", "laundry", "cuci", "ekspedisi", "logistik", "travel", "tour", "rental", "sewa"],
  property: ["properti", "rumah", "kos", "kontrakan", "apartemen", "ruko", "tanah", "agen", "developer"],
  edu:      ["kursus", "les", "bimbel", "sekolah", "pendidikan", "training", "pelatihan", "akademi"],
  general:  [],
};

function detectCategory(businessName: string, notes?: string | null): BizCategory {
  const text = (businessName + " " + (notes ?? "")).toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [BizCategory, string[]][]) {
    if (cat === "general") continue;
    if (keywords.some((k) => text.includes(k))) return cat;
  }
  return "general";
}

// ── Category-specific hooks ───────────────────────────────────────────────────

const CATEGORY_HOOKS: Record<BizCategory, string[]> = {
  food: [
    "Banyak orang cari tempat makan enak lewat Google Maps sebelum pergi — kalau {businessName} belum muncul di sana, sayang banget.",
    "Pelanggan sekarang sering cek menu online dulu sebelum datang. Website bisa bantu {businessName} tampil lebih menarik.",
    "Foto makanan yang bagus di website bisa bikin orang langsung pengen datang ke {businessName}.",
  ],
  retail: [
    "Toko online yang punya website sendiri jauh lebih dipercaya dibanding yang cuma jualan di marketplace.",
    "Dengan website, {businessName} bisa terima order 24 jam tanpa harus standby di HP terus.",
    "Pelanggan lebih percaya beli dari website resmi — bisa bantu {businessName} keliatan lebih profesional.",
  ],
  health: [
    "Pasien sekarang sering cari klinik atau dokter lewat Google dulu sebelum datang. Website bisa bantu {businessName} lebih mudah ditemukan.",
    "Website yang informatif bisa bantu calon pasien {businessName} tahu layanan apa saja yang tersedia sebelum mereka datang.",
    "Kepercayaan pasien meningkat kalau {businessName} punya website yang rapi dan informatif.",
  ],
  beauty: [
    "Banyak orang cari salon atau spa lewat Instagram dan Google — website bisa bantu {businessName} tampil lebih profesional.",
    "Portofolio hasil kerja di website bisa jadi daya tarik tersendiri buat calon pelanggan {businessName}.",
    "Booking online lewat website bisa bikin pelanggan {businessName} lebih mudah buat janji tanpa harus WA dulu.",
  ],
  service: [
    "Calon pelanggan lebih percaya pakai jasa yang punya website resmi dibanding yang cuma ada di WA.",
    "Website bisa jadi 'kartu nama digital' {businessName} yang bisa dilihat kapan saja dan dari mana saja.",
    "Dengan website, {businessName} bisa tampilkan portofolio dan testimoni pelanggan — bikin orang makin yakin.",
  ],
  property: [
    "Calon pembeli atau penyewa properti hampir selalu cari info online dulu. Website bisa bantu {businessName} lebih mudah ditemukan.",
    "Listing properti yang ada di website sendiri terlihat lebih profesional dan terpercaya.",
    "Website bisa bantu {businessName} tampilkan foto dan detail properti dengan lebih menarik.",
  ],
  edu: [
    "Orang tua dan calon siswa biasanya cari info kursus atau bimbel lewat Google. Website bisa bantu {businessName} lebih mudah ditemukan.",
    "Website yang informatif bisa bantu calon siswa {businessName} tahu program apa saja yang tersedia.",
    "Testimoni alumni yang ditampilkan di website bisa jadi daya tarik kuat buat {businessName}.",
  ],
  general: [
    "Bisnis yang punya website terlihat lebih serius dan terpercaya di mata calon pelanggan.",
    "Dengan website, {businessName} bisa ditemukan oleh orang yang belum pernah dengar nama bisnisnya sebelumnya.",
    "Website adalah investasi jangka panjang — sekali buat, bisa terus kerja 24 jam untuk {businessName}.",
  ],
};

function getCategoryHook(lead: LeadContext, index: number): string {
  const cat = detectCategory(lead.businessName, lead.notes);
  const hooks = CATEGORY_HOOKS[cat];
  return hooks[index % hooks.length]
    .replace(/\{businessName\}/g, lead.businessName)
    .replace(/\{name\}/g, lead.name);
}

// ── Statistics variants ───────────────────────────────────────────────────────

// Same fact, many different phrasings
const STAT_VARIANTS = [
  "78% konsumen",
  "8 dari 10 orang",
  "hampir 80% pembeli",
  "mayoritas pelanggan",
  "sebagian besar orang",
  "lebih dari 3/4 konsumen",
  "78 dari 100 calon pembeli",
  "hampir 4 dari 5 orang",
  "lebih dari separuh konsumen",
  "rata-rata 8 dari 10 pembeli",
];

// ── Business name shortener ───────────────────────────────────────────────────

/**
 * FIX #3: Context-aware business name variation.
 * Only shortens if the name has 3+ words (avoids "Budi" from "Warung Pak Budi").
 * Short names (1-2 words) always use full name.
 * seed % 3 === 0 → full name
 * seed % 3 === 1 → last 2 words (safer than last 1 word)
 * seed % 3 === 2 → "bisnis Anda"
 */
function varyBusinessName(businessName: string, seed: number): string {
  const words = businessName.trim().split(/\s+/);
  if (seed % 3 === 0 || words.length <= 2) return businessName;
  if (seed % 3 === 1 && words.length >= 3) {
    // Take last 2 words — more natural than last 1
    return words.slice(-2).join(" ");
  }
  return "bisnis Anda";
}

// ── Paragraph shuffler ────────────────────────────────────────────────────────

/**
 * Shuffle the order of bullet-point lines within a paragraph block.
 * Only shuffles lines that start with a bullet emoji or "✅/☑️/etc."
 * Leaves non-bullet lines (greeting, footer, etc.) in place.
 */
function shuffleBulletLines(text: string, seed: number): string {
  // Only shuffle if there are 3+ bullet lines
  const lines = text.split("\n");
  const bulletPattern = /^[✅☑️✔️💡⭐🔹▶️🎯💎🔑•\-*]/u;
  const bulletIndices: number[] = [];
  lines.forEach((line, i) => {
    if (bulletPattern.test(line.trim())) bulletIndices.push(i);
  });

  if (bulletIndices.length < 3) return text; // not enough bullets to shuffle

  // Fisher-Yates with deterministic seed
  const bullets = bulletIndices.map((i) => lines[i]);
  for (let i = bullets.length - 1; i > 0; i--) {
    const j = (seed * (i + 3) + 7) % (i + 1);
    [bullets[i], bullets[j]] = [bullets[j], bullets[i]];
  }
  bulletIndices.forEach((lineIdx, i) => { lines[lineIdx] = bullets[i]; });
  return lines.join("\n");
}

// ── Emoji position variation ──────────────────────────────────────────────────

/**
 * For some messages, move trailing emoji to the start of the line.
 * "Muncul di Google ✅" → "✅ Muncul di Google"
 */
function varyEmojiPosition(text: string, seed: number): string {
  if (seed % 3 !== 1) return text; // only 1/3 of messages
  return text.replace(
    /^(.+?)\s([\u{1F300}-\u{1FFFF}✅☑️✔️💡⭐🔹▶️🎯💎🔑])$/gmu,
    (_, content, emoji) => `${emoji} ${content}`,
  );
}

// ── Paragraph spacing variation ───────────────────────────────────────────────

/**
 * Vary the number of blank lines between paragraphs.
 * Some messages use single blank line, others double.
 */
function varyParagraphSpacing(text: string, seed: number): string {
  if (seed % 4 === 0) {
    // Compress double newlines to single in some paragraphs
    return text.replace(/\n\n\n/g, "\n\n");
  }
  if (seed % 4 === 2) {
    // Add extra spacing before the last paragraph
    const lastPara = text.lastIndexOf("\n\n");
    if (lastPara > 0) {
      return text.slice(0, lastPara) + "\n\n\n" + text.slice(lastPara + 2);
    }
  }
  return text;
}

// ── Intentional light typos ───────────────────────────────────────────────────

// Pairs: [original, replacement] — only informal substitutions that fit any tone
// FIX #4: Removed "tidak " → "ga " (too casual for formal context).
// Only use substitutions that work in both formal and informal sentences.
const TYPO_PAIRS: [string, string][] = [
  ["yang ", "yg "],
  ["dengan ", "dgn "],
  ["untuk ", "utk "],
  ["karena ", "krn "],
  ["sudah ", "udah "],
  ["sangat ", "banget "],
  ["kami ", "kita "],
  ["sekarang ", "skrg "],
  ["banyak ", "banyak "],   // no-op for weight balance
  ["mudah ", "gampang "],
];

/**
 * Apply 1 subtle informal substitution to make the message feel hand-typed.
 * Only applied to ~40% of messages (seed % 5 < 2).
 * Skips substitution if the word appears in a formal sentence opener.
 */
function applyLightTypo(text: string, seed: number): string {
  if (seed % 5 >= 2) return text; // 60% no substitution
  const pair = TYPO_PAIRS[seed % TYPO_PAIRS.length];
  const [original, replacement] = pair;
  if (original === replacement) return text; // no-op pair
  // Only replace if not at the very start of a line (avoids mangling sentence openers)
  return text.replace(new RegExp(`(?<!^)${original}`, "m"), replacement);
}

// ── CTA variants ──────────────────────────────────────────────────────────────

const WA_GROUP_LINK = "https://chat.whatsapp.com/FVyttpr28LQ4lOUJyuGTMU";

const CTA_VARIANTS = [
  "Balas pesan ini kalau tertarik, ya!",
  "Ketik *INFO* untuk tahu lebih lanjut.",
  "Hubungi kami kapan saja — kami siap bantu.",
  "Mau konsultasi gratis? Balas aja dulu.",
  "Kalau ada pertanyaan, langsung tanya aja ya!",
  "Yuk ngobrol dulu, tanpa komitmen apa pun.",
  "Balas *YA* kalau mau kami kirimkan contoh desainnya.",
  `Gabung grup WA kami untuk info & promo eksklusif:\n${WA_GROUP_LINK}`,
  `Mau lihat contoh website yang sudah kami buat? Gabung di sini:\n${WA_GROUP_LINK}`,
  `Join grup WA kami — ada tips bisnis online gratis setiap minggu:\n${WA_GROUP_LINK}`,
  "", // no CTA — feels most natural
  "", // weighted toward no CTA
];

// ── Footer name variants ──────────────────────────────────────────────────────

// Full footer variants — must match the actual format from waTemplates.ts
// Original: "\n\n_MFWEB · mfweb.maffisorp.id_"
const FOOTER_VARIANTS = [
  "\n\n_MFWEB · mfweb.maffisorp.id_",
  "\n\n_Tim MFWEB · mfweb.maffisorp.id_",
  "\n\n_MFWEB Team · mfweb.maffisorp.id_",
  "\n\n_Tim kami di MFWEB · mfweb.maffisorp.id_",
  "\n\n_Salam, MFWEB · mfweb.maffisorp.id_",
  "\n\n_Hormat kami, Tim MFWEB_",
  "\n\n_MFWEB — Jasa Website Profesional_",
  "", // no footer — ~12% of messages feel more personal without it
  "", // weighted twice for higher probability
];

// ── Punctuation humanizer ─────────────────────────────────────────────────────

function getCtaVariants(settings: BroadcastRuntimeSettings): string[] {
  return CTA_VARIANTS.map((cta) => {
    if (cta.includes(WA_GROUP_LINK) && !settings.groupLink) return "";
    return cta.replaceAll(WA_GROUP_LINK, settings.groupLink);
  });
}

function getFooterVariants(settings: BroadcastRuntimeSettings): string[] {
  const configuredFooter = renderBroadcastTemplate(settings.footerText, { name: "", businessName: "" }, settings);
  const generated = FOOTER_VARIANTS.map((footer) =>
    footer
      .replaceAll("MFWEB", settings.brandName)
      .replaceAll("mfweb.maffisorp.id", settings.websiteUrl)
      .replaceAll("Jasa Website Profesional", settings.brandName)
  );

  return configuredFooter ? [`\n\n_${configuredFooter}_`, ...generated] : generated;
}

function humanizePunctuation(text: string, seed: number): string {
  let result = text;
  // Occasionally drop trailing period on last sentence (feels more casual)
  if (seed % 3 === 0) result = result.replace(/\.\s*$/, "");
  // Vary emoji spacing: "sukses 🚀" vs "sukses🚀"
  if (seed % 4 === 1) result = result.replace(/\s([\u{1F300}-\u{1FFFF}])/gu, "$1");
  // Occasionally use lowercase for first word after newline (casual tone)
  if (seed % 7 === 0) {
    result = result.replace(/\n([A-Z])/g, (_, c) => "\n" + c.toLowerCase());
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

type BroadcastLead = LeadContext & {
  id: string;
  whatsapp: string;
  lastContactedAt: Date | null;
  waOptInStatus: "UNKNOWN" | "OPTED_IN" | "OPTED_OUT";
  doNotContact: boolean;
};

function buildPersonalizedOpener(lead: LeadContext, index: number): string {
  const bizName = varyBusinessName(lead.businessName, index + 2);
  // 30% of messages: start with a question hook (conversational)
  if (index % 3 === 0) {
    const questions = [
      `Apakah ${bizName} sudah punya website?`,
      `Sudah punya website untuk ${bizName} belum?`,
      `${bizName} sudah hadir secara online belum?`,
    ];
    return questions[index % questions.length];
  }
  // 70%: stat-based hook with varied number format
  const stat = STAT_VARIANTS[index % STAT_VARIANTS.length];
  const statHooks = [
    `${stat} cari produk atau jasa lewat Google sebelum memutuskan beli.`,
    `${stat} lebih percaya bisnis yang punya website resmi.`,
    `${stat} cek website dulu sebelum menghubungi sebuah bisnis.`,
  ];
  return statHooks[index % statHooks.length];
}

function buildWebsiteContext(lead: LeadContext, index: number): string {
  if (lead.currentWebsite) {
    const lines = [
      `Kami sempat lihat website ${lead.businessName} — ada beberapa hal yang bisa kami bantu tingkatkan biar makin optimal.`,
      `Website ${lead.businessName} sudah ada, bagus! Kami bisa bantu buat tampilannya lebih modern dan lebih mudah ditemukan di Google.`,
      `Kami perhatikan ${lead.businessName} sudah online — kami bisa bantu upgrade supaya lebih banyak orang yang menemukannya.`,
    ];
    return lines[index % lines.length];
  }
  return getCategoryHook(lead, index);
}

// ── Message variation ─────────────────────────────────────────────────────────

const BULLET_EMOJIS = ["✅", "☑️", "✔️", "💡", "⭐", "🔹", "▶️", "🎯", "💎", "🔑"];

const OPENING_VARIANTS = [
  "Halo",
  "Hai",
  "Hei",
  "Permisi",
  "Salam kenal",
];

function getTimeGreeting(): string {
  const h = getWIBHour();
  if (h >= 4  && h < 11) return "Selamat pagi";
  if (h >= 11 && h < 15) return "Selamat siang";
  if (h >= 15 && h < 19) return "Selamat sore";
  return "Selamat malam";
}

/**
 * Core message variation engine.
 * FIX #1: Uses sessionSalt (random per broadcast session) mixed with index
 * so two different broadcast sessions never produce the same message for index 0.
 * Applies message variation to the admin-written template.
 */
function varyMessage(
  message: string,
  index: number,
  lead: LeadContext,
  sessionSalt: number,
  settings: BroadcastRuntimeSettings,
): string {
  // Mix index with session salt — different every broadcast run
  const s = (index * 31 + sessionSalt) >>> 0; // unsigned 32-bit for stability
  let result = message;

  // ── Layer 1: Synonym substitution (consistent within message, varied across sessions) ──
  result = applySynonyms(result, s + 7);

  // ── Layer 2: Bullet emoji rotation ──
  if (result.includes("✅")) {
    result = result.replaceAll("✅", BULLET_EMOJIS[s % BULLET_EMOJIS.length]);
  }

  // ── Layer 3: Emoji position variation (start vs end of line) ──
  result = varyEmojiPosition(result, s + 5);

  // ── Layer 4: Opening greeting variation ──
  const opening = s % 5 === 0
    ? getTimeGreeting()
    : OPENING_VARIANTS[s % OPENING_VARIANTS.length];
  if (/^(Halo|Hai|Hei|Permisi|Salam kenal)/.test(result)) {
    result = result.replace(/^(Halo|Hai|Hei|Permisi|Salam kenal)/, opening);
  }

  // ── Layer 5: Personalized opener (question or stat hook with varied number format) ──
  const firstNewline = result.indexOf("\n");
  const personalOpener = buildPersonalizedOpener(lead, s);
  if (firstNewline !== -1) {
    result = result.slice(0, firstNewline) + "\n\n" + personalOpener + result.slice(firstNewline);
  }

  // ── Layer 6: Bullet line order shuffle ──
  result = shuffleBulletLines(result, s * 13 + 3);

  // ── Layer 7: Category-specific context + website acknowledgment ──
  const contextLine = buildWebsiteContext(lead, s)
    .replace(lead.businessName, varyBusinessName(lead.businessName, s + 9));
  const footerIdx = result.lastIndexOf(`\n\n_${settings.brandName}`);
  if (footerIdx !== -1) {
    result = result.slice(0, footerIdx) + "\n\n" + contextLine + result.slice(footerIdx);
  } else {
    result += "\n\n" + contextLine;
  }

  // ── Layer 8: CTA variation ──
  const ctaVariants = getCtaVariants(settings);
  const cta = ctaVariants[s % ctaVariants.length];
  if (cta) {
    const fi = result.lastIndexOf(`\n\n_${settings.brandName}`);
    const ctaLine = "\n\n" + cta;
    result = fi !== -1
      ? result.slice(0, fi) + ctaLine + result.slice(fi)
      : result + ctaLine;
  }

  // ── Layer 9: Footer variation ──
  const footerVariants = getFooterVariants(settings);
  const footerVariant = footerVariants[s % footerVariants.length];
  const escapedBrand = settings.brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  result = result.replace(new RegExp(`\\n\\n_${escapedBrand}[^_]*_`, "g"), footerVariant);

  // ── Layer 10: Paragraph spacing variation ──
  result = varyParagraphSpacing(result, s + 17);

  // ── Layer 11: Light informal substitution ──
  result = applyLightTypo(result, s + 23);

  // ── Layer 12: Punctuation humanization ──
  result = humanizePunctuation(result, s * 3 + 11);

  return result;
}

function appendOptOutInstruction(message: string, settings: BroadcastRuntimeSettings): string {
  const optOutWord = settings.optOutKeywords[0]?.toUpperCase() ?? "STOP";
  if (settings.optOutKeywords.some((keyword) => message.toLowerCase().includes(keyword.toLowerCase()))) {
    return message;
  }
  return `${message}\n\nBalas ${optOutWord} jika tidak ingin menerima pesan lagi.`;
}

function snippet(message: string): string {
  return message.slice(0, 250);
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("broadcast");
  if (denied) return denied;
  const settings = await loadBroadcastSettings();

  // 1. Time restriction — only allow 08:00–20:00 WIB
  if (!isWithinAllowedHours(settings)) {
    const h = getWIBHour();
    return NextResponse.json({
      error: `Broadcast hanya diizinkan pukul ${settings.allowedStartHour.toString().padStart(2, "0")}.00-${settings.allowedEndHour.toString().padStart(2, "0")}.00 WIB. Sekarang pukul ${h.toString().padStart(2, "0")}:xx WIB.`,
      code:  "OUTSIDE_HOURS",
    }, { status: 400 });
  }

  try {
    const { leadIds, message, skipCooldown = false, sessionLimit } = await req.json() as {
      leadIds:       string[];
      message:       string;
      skipCooldown?: boolean;
      sessionLimit?: number;
    };

    if (!leadIds?.length) return NextResponse.json({ error: "Pilih minimal 1 lead" }, { status: 400 });
    if (!message?.trim()) return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });

    const waKeys = await getFonnteKeys();
    if (!waKeys.length) return NextResponse.json({ error: "Fonnte API key belum dikonfigurasi" }, { status: 500 });

    const leads = await prisma.lead.findMany({
      where:  { id: { in: leadIds } },
      select: {
        id: true, name: true, businessName: true, whatsapp: true,
        lastContactedAt: true, currentWebsite: true, message: true, notes: true,
        waOptInStatus: true, doNotContact: true,
      },
    }) as BroadcastLead[];

    const consentSkippedLeads = leads.filter((lead) =>
      lead.doNotContact || lead.waOptInStatus === "OPTED_OUT"
    );
    const consentEligibleLeads = leads.filter((lead) =>
      !lead.doNotContact && lead.waOptInStatus !== "OPTED_OUT"
    );

    // 3. Filter invalid phone format
    const invalidLeads: Array<BroadcastLead & { skipReason: string }> = [];
    const validLeads = consentEligibleLeads.filter((lead) => {
      if (!isValidIndonesianPhone(lead.whatsapp)) {
        invalidLeads.push({ ...lead, skipReason: "INVALID_PHONE" });
        return false;
      }
      return true;
    });

    // 3b. Validate numbers are actually registered on WhatsApp (best-effort)
    // Skip if no device token available — don't block broadcast
    let notOnWA: Set<string> = new Set();
    try {
      const deviceToken = await getFonnteKey();
      if (deviceToken && validLeads.length > 0) {
        const phones = validLeads.map((l) => l.whatsapp);
        const validation = await fonnteValidateNumbers(deviceToken, phones);
        if (validation.status && validation.not_registered.length > 0) {
          notOnWA = new Set(validation.not_registered);
          // Add unregistered numbers to invalid list for reporting
          validLeads.forEach((l) => {
            if (notOnWA.has(l.whatsapp)) {
              invalidLeads.push({ ...l, skipReason: "NOT_REGISTERED_ON_WHATSAPP" });
            }
          });
        }
      }
    } catch {
      // Validation failed — proceed without it, don't block broadcast
    }

    // Filter out numbers not on WhatsApp
    const waValidLeads = notOnWA.size > 0
      ? validLeads.filter((l) => !notOnWA.has(l.whatsapp))
      : validLeads;

    // 4. Cooldown check
    const now         = new Date();
    const cooldownMs  = settings.cooldownHours * 60 * 60 * 1000;
    const cooldownLeads: BroadcastLead[] = [];

    const eligibleLeads = waValidLeads.filter((lead) => {
      if (skipCooldown) return true;
      if (!lead.lastContactedAt) return true;
      const elapsed = now.getTime() - new Date(lead.lastContactedAt).getTime();
      if (elapsed < cooldownMs) {
        cooldownLeads.push(lead);
        return false;
      }
      return true;
    });

    if (eligibleLeads.length === 0) {
      return NextResponse.json({
        error: `Tidak ada lead yang bisa dikirim. ${consentSkippedLeads.length} opt-out/do-not-contact, ${cooldownLeads.length} dalam cooldown, ${invalidLeads.length} nomor tidak valid.`,
        consentSkippedLeads: consentSkippedLeads.map((l) => l.name),
        cooldownLeads:      cooldownLeads.map((l) => l.name),
        invalidPhones:      invalidLeads.map((l) => l.name),
        code: "NO_ELIGIBLE",
      }, { status: 400 });
    }

    // 5. Apply session limit — cap how many leads are sent in this run
    const sentToday = await prisma.broadcastLog.aggregate({
      where: { sentAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
      _sum:  { sent: true },
    });
    const dailyCapacity = settings.dailyLimitPerDevice > 0
      ? settings.dailyLimitPerDevice * waKeys.length
      : Number.MAX_SAFE_INTEGER;
    const remainingDailySlots = Math.max(0, dailyCapacity - (sentToday._sum.sent ?? 0));

    if (remainingDailySlots <= 0) {
      return NextResponse.json({
        error: `Limit broadcast 24 jam sudah tercapai (${settings.dailyLimitPerDevice} lead per device). Coba lagi nanti.`,
        code:  "DAILY_LIMIT_REACHED",
      }, { status: 400 });
    }

    const requestedSessionLimit = Number.isFinite(sessionLimit)
      ? Math.floor(Number(sessionLimit))
      : settings.defaultSessionLimit;
    const effectiveSessionLimit = Math.min(
      Math.max(requestedSessionLimit, 1),
      settings.maxSessionLimit,
    );
    const sessionLimitedLeads = eligibleLeads.slice(0, effectiveSessionLimit);
    const sessionSkippedLeads = eligibleLeads.slice(effectiveSessionLimit);
    const limitedLeads = sessionLimitedLeads.slice(0, remainingDailySlots);
    const dailyLimitSkippedLeads = sessionLimitedLeads.slice(remainingDailySlots);

    if (limitedLeads.length === 0) {
      return NextResponse.json({
        error: "Tidak ada slot broadcast harian tersisa untuk device yang aktif.",
        code:  "DAILY_LIMIT_REACHED",
      }, { status: 400 });
    }

    // 6. Build items with personalization + variation
    // Generate a random session salt so each broadcast run produces unique messages
    const sessionSalt = Math.floor(Math.random() * 0xFFFF);

    const items = limitedLeads.map((lead, idx) => ({
      phone:  lead.whatsapp,
      message: appendOptOutInstruction(
        varyMessage(
          renderBroadcastTemplate(message, lead, settings),
          idx,
          {
            name:           lead.name,
            businessName:   lead.businessName,
            currentWebsite: lead.currentWebsite,
            message:        lead.message,
            notes:          lead.notes,
          },
          sessionSalt,
          settings,
        ),
        settings,
      ),
      leadId: lead.id,
      name:   lead.name,
    }));

    // 6. Build per-message delay schedule (non-linear + burst pause)
    const delaySchedule = items.map((_, idx) => humanDelay(idx, items.length, settings));

    // Representative delay range for logging/UI (median of schedule)
    const delayRange = delaySchedule[Math.floor(delaySchedule.length / 2)] ?? `${settings.delayMedium.min}-${settings.delayMedium.max}`;

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
    const skippedRecipients = [
      ...consentSkippedLeads.map((lead) => ({
        lead,
        status: "OPTED_OUT" as const,
        reason: lead.doNotContact ? "DO_NOT_CONTACT" : "OPTED_OUT",
      })),
      ...invalidLeads.map((lead) => ({ lead, status: "SKIPPED" as const, reason: lead.skipReason })),
      ...cooldownLeads.map((lead) => ({ lead, status: "SKIPPED" as const, reason: "COOLDOWN" })),
      ...sessionSkippedLeads.map((lead) => ({ lead, status: "SKIPPED" as const, reason: "SESSION_LIMIT" })),
      ...dailyLimitSkippedLeads.map((lead) => ({ lead, status: "SKIPPED" as const, reason: "DAILY_LIMIT" })),
    ];
    const skipped = skippedRecipients.length;

    await prisma.$transaction(async (tx) => {
      if (sentIds.length > 0) {
        await tx.lead.updateMany({
          where: { id: { in: sentIds } },
          data:  { status: "FOLLOWUP", lastContactedAt: now },
        });
      }

      const log = await tx.broadcastLog.create({
        data: {
          totalLeads:     leads.length,
          sent,
          failed,
          skipped,
          devices:        waKeys.length,
          delayRange,
          messageSnippet: message.slice(0, 100),
        },
      });

      await tx.broadcastRecipient.createMany({
        data: [
          ...items.map((item, idx) => ({
            id:               randomUUID(),
            broadcastId:      log.id,
            leadId:           item.leadId,
            phone:            item.phone,
            status:           (batchResults[idx]?.ok ? "QUEUED" : "FAILED") as "QUEUED" | "FAILED",
            providerResponse: null,
            messageSnippet:   snippet(item.message),
            sentAt:           batchResults[idx]?.ok ? now : null,
          })),
          ...skippedRecipients.map(({ lead, status, reason }) => ({
            id:               randomUUID(),
            broadcastId:      log.id,
            leadId:           lead.id,
            phone:            lead.whatsapp,
            status,
            skipReason:       reason,
            providerResponse: null,
            messageSnippet:   snippet(message),
            sentAt:           null,
          })),
        ],
      });
    });

    console.log(
      `[Broadcast] ${sent} queued, ${failed} failed` +
      ` | no consent: ${consentSkippedLeads.length}, cooldown: ${cooldownLeads.length}, invalid: ${invalidLeads.length}, session skipped: ${sessionSkippedLeads.length}, daily skipped: ${dailyLimitSkippedLeads.length}` +
      ` | ${waKeys.length} device(s) | delay: ${delayRange}s`,
    );

    return NextResponse.json({
      sent,
      failed,
      results,
      devices:          waKeys.length,
      skipped,
      consentSkipped:   consentSkippedLeads.length,
      consentSkippedLeads: consentSkippedLeads.length > 0 ? consentSkippedLeads.map((l) => l.name) : undefined,
      invalidPhones:    invalidLeads.length > 0 ? invalidLeads.map((l) => l.name) : undefined,
      cooldownLeads:    cooldownLeads.length > 0 ? cooldownLeads.map((l) => l.name) : undefined,
      sessionSkipped:   sessionSkippedLeads.length,
      dailyLimitSkipped: dailyLimitSkippedLeads.length,
      delayRange,
      estimatedSeconds,
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

  const { searchParams } = req.nextUrl;
  const page    = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(10, Number(searchParams.get("perPage") ?? "20")));
  const format  = searchParams.get("format") ?? "json";

  const [total, logs] = await Promise.all([
    prisma.broadcastLog.count(),
    prisma.broadcastLog.findMany({
      orderBy: { sentAt: "desc" },
      skip:  (page - 1) * perPage,
      take:  perPage,
    }),
  ]);

  // CSV export
  if (format === "csv") {
    const headers = ["ID", "Tanggal", "Total Lead", "Terkirim", "Gagal", "Dilewati", "Device", "Delay Range", "Pesan (100 char)"];
    const rows = logs.map((log) => [
      log.id,
      new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(log.sentAt)),
      log.totalLeads,
      log.sent,
      log.failed,
      log.skipped,
      log.devices,
      log.delayRange,
      `"${log.messageSnippet.replace(/"/g, '""')}"`,
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    return new Response("\uFEFF" + csv, {
      headers: {
        "Content-Type": "text/csv;charset=utf-8",
        "Content-Disposition": `attachment; filename="broadcast-history-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ logs, total, page, perPage, totalPages: Math.ceil(total / perPage) });
}
