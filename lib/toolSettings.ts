import "server-only";

import { prisma } from "@/lib/prisma";

export const TOOL_SETTING_DEFAULTS = {
  tool_lead_finder_enabled: "true",
  tool_lead_finder_standard_cost: "5",
  tool_lead_finder_deep_cost: "20",
  tool_lead_finder_social_scan_enabled: "true",
  tool_lead_finder_social_scan_cost: "10",
  tool_proposal_generator_enabled: "true",
  tool_proposal_generator_cost: "5",
  tool_low_credit_warning_threshold: "10",
} as const;

export type ToolSettingKey = keyof typeof TOOL_SETTING_DEFAULTS;

export type ToolSettings = {
  leadFinder: {
    enabled: boolean;
    standardCost: number;
    deepCost: number;
    socialScanEnabled: boolean;
    socialScanCost: number;
  };
  proposalGenerator: {
    enabled: boolean;
    creditCost: number;
  };
  lowCreditWarningThreshold: number;
};

export const TOOL_SETTING_KEYS = Object.keys(TOOL_SETTING_DEFAULTS) as ToolSettingKey[];

function parseBoolean(value: string | undefined) {
  return value === "true";
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, 9999);
}

export function mergeToolSettingRows(rows: Array<{ key: string; value: string }>) {
  const merged: Record<ToolSettingKey, string> = { ...TOOL_SETTING_DEFAULTS };

  for (const row of rows) {
    if (TOOL_SETTING_KEYS.includes(row.key as ToolSettingKey)) {
      merged[row.key as ToolSettingKey] = row.value;
    }
  }

  return merged;
}

export function parseToolSettings(values: Record<ToolSettingKey, string>): ToolSettings {
  return {
    leadFinder: {
      enabled: parseBoolean(values.tool_lead_finder_enabled),
      standardCost: parsePositiveInt(
        values.tool_lead_finder_standard_cost,
        Number(TOOL_SETTING_DEFAULTS.tool_lead_finder_standard_cost),
      ),
      deepCost: parsePositiveInt(
        values.tool_lead_finder_deep_cost,
        Number(TOOL_SETTING_DEFAULTS.tool_lead_finder_deep_cost),
      ),
      socialScanEnabled: parseBoolean(values.tool_lead_finder_social_scan_enabled),
      socialScanCost: parsePositiveInt(
        values.tool_lead_finder_social_scan_cost,
        Number(TOOL_SETTING_DEFAULTS.tool_lead_finder_social_scan_cost),
      ),
    },
    proposalGenerator: {
      enabled: parseBoolean(values.tool_proposal_generator_enabled),
      creditCost: parsePositiveInt(
        values.tool_proposal_generator_cost,
        Number(TOOL_SETTING_DEFAULTS.tool_proposal_generator_cost),
      ),
    },
    lowCreditWarningThreshold: parsePositiveInt(
      values.tool_low_credit_warning_threshold,
      Number(TOOL_SETTING_DEFAULTS.tool_low_credit_warning_threshold),
    ),
  };
}

export function normalizeToolSettingValue(key: ToolSettingKey, value: unknown) {
  if (key.endsWith("_enabled")) {
    return value === true || value === "true" ? "true" : "false";
  }

  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return TOOL_SETTING_DEFAULTS[key];
  return String(Math.min(parsed, 9999));
}

export async function getToolSettings(): Promise<ToolSettings> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: TOOL_SETTING_KEYS } },
    select: { key: true, value: true },
  });

  return parseToolSettings(mergeToolSettingRows(rows));
}
