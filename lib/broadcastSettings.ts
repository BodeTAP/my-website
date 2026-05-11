export type DelayRange = {
  min: number;
  max: number;
};

export type BroadcastTemplateLead = {
  name: string;
  businessName: string;
};

export type BroadcastRuntimeSettings = {
  brandName: string;
  websiteUrl: string;
  groupLink: string;
  footerText: string;
  consentTemplate: string;
  optInPromoTemplate: string;
  optOutReplyTemplate: string;
  optInKeywords: string[];
  optOutKeywords: string[];
  allowedStartHour: number;
  allowedEndHour: number;
  cooldownHours: number;
  defaultSessionLimit: number;
  maxSessionLimit: number;
  dailyLimitPerDevice: number;
  delaySmall: DelayRange;
  delayMedium: DelayRange;
  delayLarge: DelayRange;
  burstPauseEvery: number;
  burstPauseMinSeconds: number;
  burstPauseMaxSeconds: number;
  autoReplyOptIn: boolean;
  autoReplyOptOut: boolean;
};

export const BROADCAST_SETTING_DEFAULTS: Record<string, string> = {
  broadcast_brand_name: "MFWEB",
  broadcast_website_url: "mfweb.maffisorp.id",
  broadcast_group_link: "https://chat.whatsapp.com/FVyttpr28LQ4lOUJyuGTMU",
  broadcast_footer_text: "{brandName} - {websiteUrl}",
  broadcast_consent_template: "Halo, apakah ini *{businessName}*?\n\nSaya dari *{brandName}*. Boleh kami kirim info singkat tentang opsi website untuk bisnis Anda?\n\nBalas *YA* jika berkenan, atau *STOP* jika tidak ingin dihubungi.",
  broadcast_opt_in_promo_template: "Terima kasih, {name}. Ini info singkat dari {brandName} untuk {businessName}:\n\nKami bantu bisnis punya website profesional yang rapi, cepat, mobile-friendly, dan siap dipakai untuk profil usaha, katalog, landing page, atau sistem sederhana.\n\nJika berkenan, admin kami bisa kirim contoh desain dan estimasi paket yang paling cocok.\n\nBalas STOP kapan saja jika tidak ingin menerima pesan lagi.",
  broadcast_opt_out_reply_template: "Baik, terima kasih. Nomor Anda sudah kami tandai agar tidak menerima broadcast WhatsApp dari {brandName} lagi.",
  broadcast_opt_in_keywords: "ya,iya,y,yes,setuju,boleh,ok,oke,lanjut,info",
  broadcast_opt_out_keywords: "stop,batal,berhenti,unsubscribe,jangan kirim,jangan dihubungi,hapus nomor,keluar",
  broadcast_allowed_start_hour: "8",
  broadcast_allowed_end_hour: "20",
  broadcast_cooldown_hours: "24",
  broadcast_default_session_limit: "30",
  broadcast_max_session_limit: "100",
  broadcast_daily_limit_per_device: "50",
  broadcast_delay_small: "15-35",
  broadcast_delay_medium: "20-50",
  broadcast_delay_large: "30-70",
  broadcast_burst_pause_every: "5",
  broadcast_burst_pause_min_seconds: "90",
  broadcast_burst_pause_max_seconds: "180",
  broadcast_auto_reply_opt_in: "true",
  broadcast_auto_reply_opt_out: "true",
};

function clampInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseBoolean(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  return raw !== "false" && raw !== "0";
}

function parseRange(raw: string | undefined, fallback: DelayRange, minLimit: number, maxLimit: number): DelayRange {
  const match = raw?.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  if (!match) return fallback;
  const min = clampInt(match[1], fallback.min, minLimit, maxLimit);
  const max = clampInt(match[2], fallback.max, minLimit, maxLimit);
  return min <= max ? { min, max } : fallback;
}

function parseKeywords(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);
}

function value(settings: Record<string, string>, key: keyof typeof BROADCAST_SETTING_DEFAULTS): string {
  return settings[key] ?? BROADCAST_SETTING_DEFAULTS[key];
}

export function parseBroadcastSettings(settings: Record<string, string>): BroadcastRuntimeSettings {
  const defaultSessionLimit = clampInt(value(settings, "broadcast_default_session_limit"), 30, 1, 500);
  const maxSessionLimit = clampInt(value(settings, "broadcast_max_session_limit"), 100, 1, 500);
  const burstMin = clampInt(value(settings, "broadcast_burst_pause_min_seconds"), 90, 30, 600);
  const burstMax = clampInt(value(settings, "broadcast_burst_pause_max_seconds"), 180, 30, 900);

  return {
    brandName: value(settings, "broadcast_brand_name"),
    websiteUrl: value(settings, "broadcast_website_url"),
    groupLink: value(settings, "broadcast_group_link"),
    footerText: value(settings, "broadcast_footer_text"),
    consentTemplate: value(settings, "broadcast_consent_template"),
    optInPromoTemplate: value(settings, "broadcast_opt_in_promo_template"),
    optOutReplyTemplate: value(settings, "broadcast_opt_out_reply_template"),
    optInKeywords: parseKeywords(value(settings, "broadcast_opt_in_keywords")),
    optOutKeywords: parseKeywords(value(settings, "broadcast_opt_out_keywords")),
    allowedStartHour: clampInt(value(settings, "broadcast_allowed_start_hour"), 8, 0, 23),
    allowedEndHour: clampInt(value(settings, "broadcast_allowed_end_hour"), 20, 0, 23),
    cooldownHours: clampInt(value(settings, "broadcast_cooldown_hours"), 24, 1, 720),
    defaultSessionLimit: Math.min(defaultSessionLimit, maxSessionLimit),
    maxSessionLimit,
    dailyLimitPerDevice: clampInt(value(settings, "broadcast_daily_limit_per_device"), 50, 0, 10000),
    delaySmall: parseRange(value(settings, "broadcast_delay_small"), { min: 15, max: 35 }, 5, 600),
    delayMedium: parseRange(value(settings, "broadcast_delay_medium"), { min: 20, max: 50 }, 5, 600),
    delayLarge: parseRange(value(settings, "broadcast_delay_large"), { min: 30, max: 70 }, 5, 600),
    burstPauseEvery: clampInt(value(settings, "broadcast_burst_pause_every"), 5, 0, 100),
    burstPauseMinSeconds: Math.min(burstMin, burstMax),
    burstPauseMaxSeconds: Math.max(burstMin, burstMax),
    autoReplyOptIn: parseBoolean(value(settings, "broadcast_auto_reply_opt_in"), true),
    autoReplyOptOut: parseBoolean(value(settings, "broadcast_auto_reply_opt_out"), true),
  };
}

export function renderBroadcastTemplate(
  template: string,
  lead: BroadcastTemplateLead,
  settings: BroadcastRuntimeSettings,
): string {
  const footer = settings.footerText
    .replace(/\{brandName\}/g, settings.brandName)
    .replace(/\{websiteUrl\}/g, settings.websiteUrl);

  return template
    .replace(/\{name\}/g, lead.name)
    .replace(/\{businessName\}/g, lead.businessName)
    .replace(/\{brandName\}/g, settings.brandName)
    .replace(/\{websiteUrl\}/g, settings.websiteUrl)
    .replace(/\{groupLink\}/g, settings.groupLink)
    .replace(/\{footer\}/g, footer);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildKeywordRegex(keywords: string[]): RegExp {
  const pattern = keywords
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((keyword) => keyword.trim().split(/\s+/).map(escapeRegex).join("\\s+"))
    .join("|");

  return pattern ? new RegExp(`^(${pattern})\\b`, "i") : /a^/;
}
