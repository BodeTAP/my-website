import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  AI_DEFAULTS,
  parseAiSettings,
  type AiFeature,
  type AiSettings,
} from "@/lib/aiConfig";

export {
  AI_DEFAULTS,
  AI_MODEL_OPTIONS,
  normalizeAiSettingValue,
  parseAiBoolean,
  parseAiModel,
  parseAiSettings,
  type AiFeature,
  type AiModel,
  type AiSettings,
} from "@/lib/aiConfig";

const AI_FEATURE_DISABLED_MESSAGES: Record<AiFeature, string> = {
  featureArticle:          "Fitur AI artikel sedang nonaktif.",
  featurePortalChat:       "Fitur AI portal sedang nonaktif.",
  featureNameGenerator:    "Fitur generator nama sedang nonaktif.",
  featurePricingEstimator: "Fitur estimasi harga sedang nonaktif.",
};

export async function getAiSettings(): Promise<AiSettings> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: Object.keys(AI_DEFAULTS) } },
    });
    const map: Record<string, string> = { ...AI_DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
    return parseAiSettings(map);
  } catch (err) {
    console.error("[AI-Settings] Failed to load settings:", err);
    return parseAiSettings({}, { failClosed: true });
  }
}

export async function getEnabledAiSettings(feature: AiFeature): Promise<
  | { enabled: true; settings: AiSettings }
  | { enabled: false; settings: AiSettings; response: NextResponse }
> {
  const settings = await getAiSettings();

  if (!settings[feature]) {
    return {
      enabled:  false,
      settings,
      response: NextResponse.json(
        { error: AI_FEATURE_DISABLED_MESSAGES[feature] },
        { status: 503 },
      ),
    };
  }

  return { enabled: true, settings };
}
