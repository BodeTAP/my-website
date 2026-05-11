import { describe, expect, it } from "vitest";
import {
  AI_DEFAULTS,
  normalizeAiSettingValue,
  parseAiBoolean,
  parseAiModel,
  parseAiSettings,
} from "@/lib/aiConfig";

describe("aiConfig", () => {
  it("falls back to the default model for unknown values", () => {
    expect(parseAiModel("unknown-model")).toBe(AI_DEFAULTS.ai_model);
    expect(parseAiModel("claude-sonnet-4-5-20251001")).toBe("claude-sonnet-4-5-20251001");
  });

  it("parses common boolean forms", () => {
    expect(parseAiBoolean("false", true)).toBe(false);
    expect(parseAiBoolean("0", true)).toBe(false);
    expect(parseAiBoolean("OFF", true)).toBe(false);
    expect(parseAiBoolean("yes", false)).toBe(true);
    expect(parseAiBoolean("enabled", false)).toBe(true);
  });

  it("uses the provided fallback for invalid booleans", () => {
    expect(parseAiBoolean("not-a-boolean", false)).toBe(false);
    expect(parseAiBoolean("not-a-boolean", true)).toBe(true);
  });

  it("can fail closed when settings cannot be loaded", () => {
    const settings = parseAiSettings({}, { failClosed: true });
    expect(settings.model).toBe(AI_DEFAULTS.ai_model);
    expect(settings.featureArticle).toBe(false);
    expect(settings.featurePortalChat).toBe(false);
    expect(settings.featureNameGenerator).toBe(false);
    expect(settings.featurePricingEstimator).toBe(false);
    expect(settings.features.draftArticle.enabled).toBe(false);
    expect(settings.features.portalChat.enabled).toBe(false);
  });

  it("keeps legacy article toggle as fallback for granular article features", () => {
    const settings = parseAiSettings({ ai_feature_article: "false" });
    expect(settings.features.draftArticle.enabled).toBe(false);
    expect(settings.features.suggestTopics.enabled).toBe(false);
    expect(settings.features.seoAnalyze.enabled).toBe(false);
    expect(settings.features.autoPublish.enabled).toBe(false);
  });

  it("lets granular feature toggles override the legacy article toggle", () => {
    const settings = parseAiSettings({
      ai_feature_article: "false",
      ai_feature_draft_article: "true",
    });
    expect(settings.features.draftArticle.enabled).toBe(true);
    expect(settings.features.suggestTopics.enabled).toBe(false);
  });

  it("normalizes AI setting values before persisting", () => {
    expect(normalizeAiSettingValue("ai_model", "bad-model")).toBe(AI_DEFAULTS.ai_model);
    expect(normalizeAiSettingValue("ai_feature_article", "0")).toBe("false");
    expect(normalizeAiSettingValue("ai_feature_portal_chat", true)).toBe("true");
    expect(normalizeAiSettingValue("not_ai", "value")).toBeNull();
  });
});
