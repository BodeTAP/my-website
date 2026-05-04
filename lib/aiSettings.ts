import { prisma } from "@/lib/prisma";

export const AI_DEFAULTS = {
  ai_model:                     "claude-haiku-4-5-20251001",
  ai_feature_article:           "true",
  ai_feature_portal_chat:       "true",
  ai_feature_name_generator:    "true",
  ai_feature_pricing_estimator: "true",
};

export type AiSettings = {
  model:                    string;
  featureArticle:           boolean;
  featurePortalChat:        boolean;
  featureNameGenerator:     boolean;
  featurePricingEstimator:  boolean;
};

export async function getAiSettings(): Promise<AiSettings> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: Object.keys(AI_DEFAULTS) } },
    });
    const map: Record<string, string> = { ...AI_DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
    return {
      model:                   map.ai_model,
      featureArticle:          map.ai_feature_article          !== "false",
      featurePortalChat:       map.ai_feature_portal_chat      !== "false",
      featureNameGenerator:    map.ai_feature_name_generator   !== "false",
      featurePricingEstimator: map.ai_feature_pricing_estimator !== "false",
    };
  } catch {
    return {
      model:                   AI_DEFAULTS.ai_model,
      featureArticle:          true,
      featurePortalChat:       true,
      featureNameGenerator:    true,
      featurePricingEstimator: true,
    };
  }
}
