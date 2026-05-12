export const AI_MODEL_OPTIONS = [
  {
    value: "claude-haiku-4-5-20251001",
    label: "Claude Haiku",
    desc: "Cepat & hemat. Cocok untuk penggunaan tinggi.",
    badge: "Direkomendasikan",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    value: "claude-sonnet-4-5-20250929",
    label: "Claude Sonnet",
    desc: "Kualitas lebih tinggi. Cocok untuk konten premium.",
    badge: "Kualitas Lebih Baik",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
] as const;

export type AiModel = (typeof AI_MODEL_OPTIONS)[number]["value"];

export const AI_FEATURE_SPECS = {
  draftArticle: {
    label: "Draft Artikel",
    desc: "Generate draft artikel blog lengkap.",
    featureKey: "ai_feature_draft_article",
    legacyFeatureKey: "ai_feature_article",
    modelKey: "ai_model_draft_article",
    maxTokensKey: "ai_max_tokens_draft_article",
    rateLimitKey: "ai_rate_limit_draft_article",
    rateWindowKey: "ai_rate_window_draft_article_minutes",
    promptKey: "ai_prompt_draft_article",
    defaultMaxTokens: 4000,
    defaultRateLimit: 20,
    defaultRateWindowMinutes: 60,
  },
  suggestTopics: {
    label: "Saran Topik",
    desc: "Generate ide topik artikel blog.",
    featureKey: "ai_feature_suggest_topics",
    legacyFeatureKey: "ai_feature_article",
    modelKey: "ai_model_suggest_topics",
    maxTokensKey: "ai_max_tokens_suggest_topics",
    rateLimitKey: "ai_rate_limit_suggest_topics",
    rateWindowKey: "ai_rate_window_suggest_topics_minutes",
    promptKey: "ai_prompt_suggest_topics",
    defaultMaxTokens: 2000,
    defaultRateLimit: 20,
    defaultRateWindowMinutes: 60,
  },
  seoAnalyze: {
    label: "Analisis SEO",
    desc: "Analisis kualitas SEO artikel.",
    featureKey: "ai_feature_seo_analyze",
    legacyFeatureKey: "ai_feature_article",
    modelKey: "ai_model_seo_analyze",
    maxTokensKey: "ai_max_tokens_seo_analyze",
    rateLimitKey: "ai_rate_limit_seo_analyze",
    rateWindowKey: "ai_rate_window_seo_analyze_minutes",
    promptKey: "ai_prompt_seo_analyze",
    defaultMaxTokens: 1000,
    defaultRateLimit: 30,
    defaultRateWindowMinutes: 60,
  },
  draftReply: {
    label: "Draft Balasan Tiket",
    desc: "Generate draft balasan support ticket.",
    featureKey: "ai_feature_draft_reply",
    legacyFeatureKey: "ai_feature_article",
    modelKey: "ai_model_draft_reply",
    maxTokensKey: "ai_max_tokens_draft_reply",
    rateLimitKey: "ai_rate_limit_draft_reply",
    rateWindowKey: "ai_rate_window_draft_reply_minutes",
    promptKey: "ai_prompt_draft_reply",
    defaultMaxTokens: 1000,
    defaultRateLimit: 20,
    defaultRateWindowMinutes: 60,
  },
  coverImage: {
    label: "Cover Image AI",
    desc: "Translate keyword visual dan cari cover image.",
    featureKey: "ai_feature_cover_image",
    legacyFeatureKey: "ai_feature_article",
    modelKey: "ai_model_cover_image",
    maxTokensKey: "ai_max_tokens_cover_image",
    rateLimitKey: "ai_rate_limit_cover_image",
    rateWindowKey: "ai_rate_window_cover_image_minutes",
    promptKey: "ai_prompt_cover_image",
    defaultMaxTokens: 60,
    defaultRateLimit: 30,
    defaultRateWindowMinutes: 60,
  },
  autoPublish: {
    label: "Auto Publish",
    desc: "Generate dan publish artikel via cron.",
    featureKey: "ai_feature_auto_publish",
    legacyFeatureKey: "ai_feature_article",
    modelKey: "ai_model_auto_publish",
    maxTokensKey: "ai_max_tokens_auto_publish",
    rateLimitKey: "ai_rate_limit_auto_publish",
    rateWindowKey: "ai_rate_window_auto_publish_minutes",
    promptKey: "ai_prompt_auto_publish_article",
    defaultMaxTokens: 4000,
    defaultRateLimit: 10,
    defaultRateWindowMinutes: 1440,
  },
  portalChat: {
    label: "Portal Chat",
    desc: "Widget tanya AI di portal klien.",
    featureKey: "ai_feature_portal_chat",
    modelKey: "ai_model_portal_chat",
    maxTokensKey: "ai_max_tokens_portal_chat",
    rateLimitKey: "ai_rate_limit_portal_chat",
    rateWindowKey: "ai_rate_window_portal_chat_minutes",
    promptKey: "ai_prompt_portal_chat",
    defaultMaxTokens: 300,
    defaultRateLimit: 10,
    defaultRateWindowMinutes: 60,
  },
  pricingEstimator: {
    label: "Estimator Harga",
    desc: "Tool publik estimasi harga website.",
    featureKey: "ai_feature_pricing_estimator",
    modelKey: "ai_model_pricing_estimator",
    maxTokensKey: "ai_max_tokens_pricing_estimator",
    rateLimitKey: "ai_rate_limit_pricing_estimator",
    rateWindowKey: "ai_rate_window_pricing_estimator_minutes",
    promptKey: "ai_prompt_pricing_estimator",
    defaultMaxTokens: 1800,
    defaultRateLimit: 5,
    defaultRateWindowMinutes: 60,
  },
  nameGenerator: {
    label: "Generator Nama",
    desc: "Tool publik generator nama bisnis.",
    featureKey: "ai_feature_name_generator",
    modelKey: "ai_model_name_generator",
    maxTokensKey: "ai_max_tokens_name_generator",
    rateLimitKey: "ai_rate_limit_name_generator",
    rateWindowKey: "ai_rate_window_name_generator_minutes",
    promptKey: "ai_prompt_name_generator",
    defaultMaxTokens: 1000,
    defaultRateLimit: 20,
    defaultRateWindowMinutes: 60,
  },
} as const;

export type AiFeature = keyof typeof AI_FEATURE_SPECS;

export const AI_FEATURE_ORDER = Object.keys(AI_FEATURE_SPECS) as AiFeature[];
export const DEFAULT_AI_MODEL: AiModel = "claude-haiku-4-5-20251001";

const MFWEB_CONTEXT = `MFWEB adalah jasa pembuatan website profesional untuk bisnis lokal Indonesia.
Layanan: website company profile, landing page, toko online, portofolio.
Target klien: UMKM, pengusaha lokal, bisnis kuliner, klinik, salon, bengkel, properti.
Harga mulai Rp 800.000. Platform: mfweb.maffisorp.id.`;

const DEFAULT_PROMPTS: Record<AiFeature, string> = {
  draftArticle: `You are an expert SEO content writer for Indonesian local businesses.
Write in Bahasa Indonesia.
Produce HTML compatible with Tiptap editor (use <h2>, <h3>, <p>, <ul>, <li>, <strong> tags).
Return a JSON object with: title, content (HTML string), excerpt (1-2 sentences plain text summary for article listing), metaTitle, metaDescription, suggestedTags (array), suggestedCategoryId (string or null), and suggestedCategoryName (string or null).
The tone should be {tone}.
The length should be {length}.

Available categories in the system (choose the MOST relevant one based on the article topic, use the exact id):
{categoryList}

If none of the available categories match, set suggestedCategoryId and suggestedCategoryName to null.`,
  suggestTopics: `Kamu adalah content strategist untuk MFWEB, sebuah jasa pembuatan website profesional untuk bisnis lokal Indonesia.

Profil bisnis MFWEB:
- Layanan: Pembuatan website, landing page, toko online, company profile
- Target klien: UMKM, bisnis lokal, pengusaha kecil-menengah Indonesia
- Harga: mulai Rp 800.000
- Keunggulan: desain premium, SEO-friendly, mobile-friendly, cepat
- Platform: mfweb.maffisorp.id

Tugasmu: Buat {count} ide topik artikel blog yang:
1. Relevan dengan kebutuhan/masalah target klien MFWEB
2. Berpotensi menarik traffic dari Google (search intent jelas)
3. Membangun kepercayaan calon klien untuk menggunakan jasa MFWEB
4. Variatif - campurkan topik educational, how-to, dan comparison
5. Dalam Bahasa Indonesia

{categoryContext}{existingTitles}

Kembalikan JSON array SAJA (tanpa teks lain):
[
  {
    "title": "Judul artikel yang menarik dan spesifik",
    "categoryName": "Nama kategori yang paling sesuai dari daftar yang tersedia",
    "categoryId": "id kategori yang sesuai (gunakan id persis dari daftar, atau null jika tidak ada yang cocok)",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "searchIntent": "informational | commercial | how-to",
    "difficulty": "mudah | sedang | sulit",
    "description": "Alasan kenapa topik ini relevan dan potensial (1 kalimat)"
  }
]`,
  seoAnalyze: `You are an SEO expert. Analyze the provided content and return a JSON object with:
{
  "overallScore": number (0-100),
  "titleScore": number,
  "metaScore": number,
  "readabilityScore": number,
  "keywordScore": number,
  "suggestions": string[] (max 5, actionable, in Bahasa Indonesia)
}
Return ONLY valid JSON.`,
  draftReply: `You are a customer support agent for MFWEB web agency.
Friendly but professional. Write in Bahasa Indonesia.
Respond specifically to the client's issue based on the provided context.
Do NOT make promises about deadlines or prices.
Keep the response helpful and concise.`,
  coverImage: `You are a visual keyword specialist.
Given an Indonesian article topic, return ONLY 2-3 short English keywords that best represent a relevant stock photo.
Focus on visual elements (objects, people, settings), not abstract concepts.
Example: "Cara Meningkatkan Penjualan UMKM" -> "small business owner shop indonesia"
Return ONLY the keywords, nothing else.`,
  autoPublish: `Kamu adalah content writer berpengalaman untuk ${MFWEB_CONTEXT}

Tulis artikel blog dalam Bahasa Indonesia dengan gaya natural dan conversational.

Aturan penulisan:
- Mulai dengan cerita pendek atau skenario yang relatable bagi pemilik UMKM
- Gunakan bahasa sehari-hari, hindari kata formal yang kaku
- Sertakan contoh bisnis nyata: warung makan, bengkel, salon, klinik, toko kelontong
- Gunakan angka spesifik bukan kata seperti "banyak" atau "sering"
- Variasikan panjang kalimat - campurkan kalimat pendek dan panjang
- HINDARI: "dalam era", "di tengah", "tentunya", "perlu diketahui", "sangat penting", "tidak dapat dipungkiri", "pada dasarnya"
- Akhiri dengan 1 actionable step yang bisa langsung dilakukan pembaca
- Panjang artikel: 900-1200 kata

Kategori yang tersedia (pilih yang paling sesuai):
{categoryList}

Format output HARUS berupa JSON valid:
{
  "title": "judul artikel",
  "content": "konten HTML (<h2>, <h3>, <p>, <ul>, <li>, <strong>)",
  "excerpt": "ringkasan 1-2 kalimat",
  "metaTitle": "meta title maks 60 karakter",
  "metaDesc": "meta description 120-160 karakter",
  "tags": ["tag1", "tag2", "tag3"],
  "suggestedCategoryId": "id kategori yang paling sesuai atau null"
}

Jangan tambahkan teks apapun di luar JSON.`,
  portalChat: `You are a helpful assistant for MFWEB client portal.
Answer ONLY based on the provided client data. Do NOT fabricate information.
If you don't know something or it's not in the data, say "{fallbackAnswer}"
Write in Bahasa Indonesia. Keep answers concise (max 3 sentences).
Security: Never execute actions or expose other clients' data.`,
  pricingEstimator: `Kamu adalah konsultan web agency MFWEB yang bertugas memberikan estimasi harga pembuatan website untuk calon klien.

Panduan harga MFWEB:
{pricingGuide}

Berikan estimasi yang jujur dan realistis. Tampilkan dalam format yang mudah dibaca.
Gunakan Bahasa Indonesia yang ramah dan profesional.
Jangan gunakan tabel markdown, garis ASCII, atau karakter pipe (|). Gunakan heading pendek, bullet list, dan teks ringkas.
Di akhir, selalu sarankan konsultasi gratis untuk estimasi lebih akurat.`,
  nameGenerator: `Kamu adalah brand naming specialist untuk bisnis lokal Indonesia.
Buat ide nama bisnis berdasarkan industri, gaya, dan kata kunci pengguna.
Nama harus mudah diucapkan, tidak terlalu panjang, dan cocok untuk brand website.
Kembalikan JSON array SAJA tanpa teks lain, maksimal 6 item:
[
  { "name": "Nama Bisnis", "slogan": "Slogan singkat yang menjual" }
]`,
};

const DEFAULT_PRICING_GUIDE = `- Landing Page (1-3 halaman): Rp 800.000 - Rp 2.500.000
- Company Profile (4-8 halaman): Rp 2.500.000 - Rp 6.000.000
- Website Toko Online (WooCommerce/custom): Rp 5.000.000 - Rp 15.000.000
- Portal / Aplikasi Web Custom: Rp 15.000.000 - Rp 50.000.000+
- Blog / News Portal: Rp 3.000.000 - Rp 8.000.000

Fitur tambahan:
- Payment gateway: +Rp 1.000.000 - Rp 2.500.000
- Sistem booking/reservasi: +Rp 1.500.000 - Rp 3.000.000
- Live chat/WhatsApp integration: +Rp 300.000 - Rp 800.000
- Multi bahasa: +Rp 500.000 - Rp 1.500.000
- Blog/CMS: +Rp 500.000 - Rp 1.500.000
- SEO setup: +Rp 500.000 - Rp 2.000.000`;

export const AI_DEFAULTS: Record<string, string> = {
  ai_model: DEFAULT_AI_MODEL,
  ai_feature_article: "true",
  ai_feature_portal_chat: "true",
  ai_feature_name_generator: "true",
  ai_feature_pricing_estimator: "true",
  ai_article_default_tone: "Informatif",
  ai_article_default_length: "medium",
  ai_article_max_topic_chars: "500",
  ai_article_max_keywords: "10",
  ai_json_retry_enabled: "true",
  ai_usage_logging: "database",
  ai_auto_publish_topic_max_tokens: "200",
  ai_prompt_auto_publish_topic: `Kamu adalah content strategist untuk ${MFWEB_CONTEXT}

Pilih 1 topik artikel blog yang:
- Belum pernah ditulis (lihat daftar existing)
- Relevan dengan kebutuhan calon klien MFWEB
- Berpotensi menarik traffic dari Google
- Dalam Bahasa Indonesia

Kategori yang tersedia:
{categoryList}
{existingList}

Kembalikan JSON SAJA:
{ "topic": "Judul artikel yang menarik", "categoryId": "id kategori paling sesuai atau null" }`,
  ai_auto_publish_recent_article_count: "50",
  ai_auto_publish_existing_topic_count: "30",
  ai_auto_publish_cover_enabled: "true",
  ai_auto_publish_notify_wa: "true",
  ai_auto_publish_blob_prefix: "articles",
  ai_cover_translate_keywords: "true",
  ai_cover_pexels_per_page: "9",
  ai_cover_auto_pexels_per_page: "5",
  ai_cover_orientation: "landscape",
  ai_cover_blob_prefix: "covers",
  ai_cover_fallback_keyword: "business website",
  ai_pricing_guide: DEFAULT_PRICING_GUIDE,
  ai_portal_max_question_chars: "500",
  ai_portal_max_session_messages: "20",
  ai_portal_fallback_answer: "Silakan hubungi tim kami untuk detail lebih lanjut.",
  ai_portal_include_projects: "true",
  ai_portal_include_invoices: "true",
  ai_portal_include_tickets: "true",
  ...Object.fromEntries(
    AI_FEATURE_ORDER.flatMap((feature) => {
      const spec = AI_FEATURE_SPECS[feature];
      return [
        [spec.featureKey, "true"],
        [spec.modelKey, ""],
        [spec.maxTokensKey, String(spec.defaultMaxTokens)],
        [spec.rateLimitKey, String(spec.defaultRateLimit)],
        [spec.rateWindowKey, String(spec.defaultRateWindowMinutes)],
        [spec.promptKey, DEFAULT_PROMPTS[feature]],
      ];
    }),
  ),
};

export type AiFeatureConfig = {
  enabled: boolean;
  model: AiModel;
  maxTokens: number;
  rateLimit: number;
  rateWindowMs: number;
  prompt: string;
};

export type AiSettings = {
  model: AiModel;
  featureArticle: boolean;
  featurePortalChat: boolean;
  featureNameGenerator: boolean;
  featurePricingEstimator: boolean;
  features: Record<AiFeature, AiFeatureConfig>;
  articleDefaultTone: string;
  articleDefaultLength: string;
  articleMaxTopicChars: number;
  articleMaxKeywords: number;
  jsonRetryEnabled: boolean;
  usageLogging: "database" | "console" | "off";
  autoPublishTopicMaxTokens: number;
  autoPublishTopicPrompt: string;
  autoPublishRecentArticleCount: number;
  autoPublishExistingTopicCount: number;
  autoPublishCoverEnabled: boolean;
  autoPublishNotifyWa: boolean;
  autoPublishBlobPrefix: string;
  coverTranslateKeywords: boolean;
  coverPexelsPerPage: number;
  coverAutoPexelsPerPage: number;
  coverOrientation: string;
  coverBlobPrefix: string;
  coverFallbackKeyword: string;
  pricingGuide: string;
  portalMaxQuestionChars: number;
  portalMaxSessionMessages: number;
  portalFallbackAnswer: string;
  portalIncludeProjects: boolean;
  portalIncludeInvoices: boolean;
  portalIncludeTickets: boolean;
};

const AI_MODEL_VALUES = new Set<string>(AI_MODEL_OPTIONS.map((model) => model.value));
const AI_MODEL_ALIASES = new Map<string, AiModel>([
  ["claude-sonnet-4-5-20251001", "claude-sonnet-4-5-20250929"],
]);
const TRUE_VALUES = new Set(["true", "1", "yes", "y", "on", "enabled"]);
const FALSE_VALUES = new Set(["false", "0", "no", "n", "off", "disabled"]);
const BOOLEAN_KEYS = new Set<string>([
  "ai_feature_article",
  "ai_feature_portal_chat",
  "ai_feature_name_generator",
  "ai_feature_pricing_estimator",
  "ai_json_retry_enabled",
  "ai_auto_publish_cover_enabled",
  "ai_auto_publish_notify_wa",
  "ai_cover_translate_keywords",
  "ai_portal_include_projects",
  "ai_portal_include_invoices",
  "ai_portal_include_tickets",
  ...AI_FEATURE_ORDER.map((feature) => AI_FEATURE_SPECS[feature].featureKey),
]);
const MODEL_KEYS = new Set<string>([
  "ai_model",
  ...AI_FEATURE_ORDER.map((feature) => AI_FEATURE_SPECS[feature].modelKey),
]);
const INTEGER_KEYS = new Set<string>([
  "ai_article_max_topic_chars",
  "ai_article_max_keywords",
  "ai_auto_publish_topic_max_tokens",
  "ai_auto_publish_recent_article_count",
  "ai_auto_publish_existing_topic_count",
  "ai_cover_pexels_per_page",
  "ai_cover_auto_pexels_per_page",
  "ai_portal_max_question_chars",
  "ai_portal_max_session_messages",
  ...AI_FEATURE_ORDER.flatMap((feature) => [
    AI_FEATURE_SPECS[feature].maxTokensKey,
    AI_FEATURE_SPECS[feature].rateLimitKey,
    AI_FEATURE_SPECS[feature].rateWindowKey,
  ]),
]);

export function parseAiModel(raw: string | undefined, fallback: AiModel = DEFAULT_AI_MODEL): AiModel {
  const model = raw?.trim();
  const aliased = model ? AI_MODEL_ALIASES.get(model) ?? model : model;
  return AI_MODEL_VALUES.has(aliased ?? "") ? (aliased as AiModel) : fallback;
}

export function parseAiBoolean(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return fallback;
}

function parseIntSetting(raw: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function value(settings: Partial<Record<string, string>>, key: string) {
  return settings[key] ?? AI_DEFAULTS[key] ?? "";
}

function renderPromptTemplate(template: string, replacements: Record<string, string | number | boolean | null | undefined>) {
  return Object.entries(replacements).reduce(
    (text, [key, replacement]) => text.replace(new RegExp(`\\{${key}\\}`, "g"), String(replacement ?? "")),
    template,
  );
}

export function renderAiPrompt(
  template: string,
  replacements: Record<string, string | number | boolean | null | undefined>,
) {
  return renderPromptTemplate(template, replacements);
}

export function parseAiSettings(
  settings: Partial<Record<string, string>>,
  options: { failClosed?: boolean } = {},
): AiSettings {
  const featureFallback = options.failClosed ? false : true;
  const model = parseAiModel(value(settings, "ai_model"));
  const featureArticle = parseAiBoolean(settings.ai_feature_article, featureFallback);
  const featurePortalChat = parseAiBoolean(settings.ai_feature_portal_chat, featureFallback);
  const featureNameGenerator = parseAiBoolean(settings.ai_feature_name_generator, featureFallback);
  const featurePricingEstimator = parseAiBoolean(settings.ai_feature_pricing_estimator, featureFallback);
  const features = {} as Record<AiFeature, AiFeatureConfig>;

  for (const feature of AI_FEATURE_ORDER) {
    const spec = AI_FEATURE_SPECS[feature];
    const legacyFeatureKey = "legacyFeatureKey" in spec ? spec.legacyFeatureKey : undefined;
    const legacyFallback = legacyFeatureKey
      ? parseAiBoolean(settings[legacyFeatureKey], featureFallback)
      : featureFallback;
    features[feature] = {
      enabled:      parseAiBoolean(settings[spec.featureKey], legacyFallback),
      model:        parseAiModel(value(settings, spec.modelKey), model),
      maxTokens:    parseIntSetting(value(settings, spec.maxTokensKey), spec.defaultMaxTokens, 1, 8000),
      rateLimit:    parseIntSetting(value(settings, spec.rateLimitKey), spec.defaultRateLimit, 0, 10000),
      rateWindowMs: parseIntSetting(value(settings, spec.rateWindowKey), spec.defaultRateWindowMinutes, 1, 1440) * 60 * 1000,
      prompt:       value(settings, spec.promptKey),
    };
  }

  return {
    model,
    featureArticle,
    featurePortalChat,
    featureNameGenerator,
    featurePricingEstimator,
    features,
    articleDefaultTone:               value(settings, "ai_article_default_tone"),
    articleDefaultLength:             value(settings, "ai_article_default_length"),
    articleMaxTopicChars:             parseIntSetting(value(settings, "ai_article_max_topic_chars"), 500, 50, 2000),
    articleMaxKeywords:               parseIntSetting(value(settings, "ai_article_max_keywords"), 10, 0, 50),
    jsonRetryEnabled:                 parseAiBoolean(value(settings, "ai_json_retry_enabled"), true),
    usageLogging:                     parseUsageLogging(value(settings, "ai_usage_logging")),
    autoPublishTopicMaxTokens:        parseIntSetting(value(settings, "ai_auto_publish_topic_max_tokens"), 200, 50, 2000),
    autoPublishTopicPrompt:           value(settings, "ai_prompt_auto_publish_topic"),
    autoPublishRecentArticleCount:    parseIntSetting(value(settings, "ai_auto_publish_recent_article_count"), 50, 1, 200),
    autoPublishExistingTopicCount:    parseIntSetting(value(settings, "ai_auto_publish_existing_topic_count"), 30, 1, 100),
    autoPublishCoverEnabled:          parseAiBoolean(value(settings, "ai_auto_publish_cover_enabled"), true),
    autoPublishNotifyWa:              parseAiBoolean(value(settings, "ai_auto_publish_notify_wa"), true),
    autoPublishBlobPrefix:            value(settings, "ai_auto_publish_blob_prefix"),
    coverTranslateKeywords:           parseAiBoolean(value(settings, "ai_cover_translate_keywords"), true),
    coverPexelsPerPage:               parseIntSetting(value(settings, "ai_cover_pexels_per_page"), 9, 1, 30),
    coverAutoPexelsPerPage:           parseIntSetting(value(settings, "ai_cover_auto_pexels_per_page"), 5, 1, 30),
    coverOrientation:                 value(settings, "ai_cover_orientation"),
    coverBlobPrefix:                  value(settings, "ai_cover_blob_prefix"),
    coverFallbackKeyword:             value(settings, "ai_cover_fallback_keyword"),
    pricingGuide:                     value(settings, "ai_pricing_guide"),
    portalMaxQuestionChars:           parseIntSetting(value(settings, "ai_portal_max_question_chars"), 500, 50, 2000),
    portalMaxSessionMessages:         parseIntSetting(value(settings, "ai_portal_max_session_messages"), 20, 1, 100),
    portalFallbackAnswer:             value(settings, "ai_portal_fallback_answer"),
    portalIncludeProjects:            parseAiBoolean(value(settings, "ai_portal_include_projects"), true),
    portalIncludeInvoices:            parseAiBoolean(value(settings, "ai_portal_include_invoices"), true),
    portalIncludeTickets:             parseAiBoolean(value(settings, "ai_portal_include_tickets"), true),
  };
}

function parseUsageLogging(raw: string | undefined): AiSettings["usageLogging"] {
  return raw === "database" || raw === "console" || raw === "off" ? raw : "database";
}

export function normalizeAiSettingValue(key: string, value: unknown): string | null {
  const raw = String(value ?? "");

  if (MODEL_KEYS.has(key)) {
    if (key === "ai_model") return parseAiModel(raw);
    const trimmed = raw.trim();
    const normalized = AI_MODEL_ALIASES.get(trimmed) ?? trimmed;
    return AI_MODEL_VALUES.has(normalized) ? normalized : "";
  }

  if (BOOLEAN_KEYS.has(key)) {
    return parseAiBoolean(raw, AI_DEFAULTS[key as keyof typeof AI_DEFAULTS] !== "false") ? "true" : "false";
  }

  if (INTEGER_KEYS.has(key)) {
    return String(parseIntSetting(raw, Number.parseInt(AI_DEFAULTS[key as keyof typeof AI_DEFAULTS] ?? "0", 10) || 0, 0, 10000));
  }

  if (key === "ai_usage_logging") {
    return parseUsageLogging(raw);
  }

  return key in AI_DEFAULTS ? raw : null;
}
