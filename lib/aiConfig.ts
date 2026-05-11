export const AI_MODEL_OPTIONS = [
  {
    value: "claude-haiku-4-5-20251001",
    label: "Claude Haiku",
    desc: "Cepat & hemat. Cocok untuk penggunaan tinggi.",
    badge: "Direkomendasikan",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    value: "claude-sonnet-4-5-20251001",
    label: "Claude Sonnet",
    desc: "Kualitas lebih tinggi. Cocok untuk konten premium.",
    badge: "Kualitas Lebih Baik",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
] as const;

export type AiModel = (typeof AI_MODEL_OPTIONS)[number]["value"];

export const AI_DEFAULTS = {
  ai_model:                     "claude-haiku-4-5-20251001",
  ai_feature_article:           "true",
  ai_feature_portal_chat:       "true",
  ai_feature_name_generator:    "true",
  ai_feature_pricing_estimator: "true",
} as const satisfies Record<string, string>;

export type AiSettings = {
  model:                   AiModel;
  featureArticle:          boolean;
  featurePortalChat:       boolean;
  featureNameGenerator:    boolean;
  featurePricingEstimator: boolean;
};

export type AiFeature = Exclude<keyof AiSettings, "model">;

const AI_MODEL_VALUES = new Set<string>(AI_MODEL_OPTIONS.map((model) => model.value));
const TRUE_VALUES = new Set(["true", "1", "yes", "y", "on", "enabled"]);
const FALSE_VALUES = new Set(["false", "0", "no", "n", "off", "disabled"]);

export function parseAiModel(raw: string | undefined): AiModel {
  const model = raw?.trim();
  return AI_MODEL_VALUES.has(model ?? "")
    ? (model as AiModel)
    : AI_DEFAULTS.ai_model;
}

export function parseAiBoolean(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return fallback;
}

export function parseAiSettings(
  settings: Partial<Record<keyof typeof AI_DEFAULTS, string>>,
  options: { failClosed?: boolean } = {},
): AiSettings {
  const featureFallback = options.failClosed ? false : true;

  return {
    model:                   parseAiModel(settings.ai_model ?? AI_DEFAULTS.ai_model),
    featureArticle:          parseAiBoolean(settings.ai_feature_article, featureFallback),
    featurePortalChat:       parseAiBoolean(settings.ai_feature_portal_chat, featureFallback),
    featureNameGenerator:    parseAiBoolean(settings.ai_feature_name_generator, featureFallback),
    featurePricingEstimator: parseAiBoolean(settings.ai_feature_pricing_estimator, featureFallback),
  };
}

export function normalizeAiSettingValue(key: string, value: unknown): string | null {
  if (key === "ai_model") {
    return parseAiModel(String(value ?? ""));
  }

  if (
    key === "ai_feature_article" ||
    key === "ai_feature_portal_chat" ||
    key === "ai_feature_name_generator" ||
    key === "ai_feature_pricing_estimator"
  ) {
    return parseAiBoolean(String(value ?? ""), AI_DEFAULTS[key] === "true") ? "true" : "false";
  }

  return null;
}
