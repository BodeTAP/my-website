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
  tool_invoice_generator_enabled: "true",
  tool_invoice_generator_cost: "3",
  tool_invoice_generator_default_due_days: "7",
  tool_invoice_generator_default_footer: "Terima kasih atas kepercayaan Anda.",
  tool_invoice_generator_default_include_tax: "false",
  tool_signup_bonus_enabled: "true",
  tool_signup_bonus_amount: "15",
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
  invoiceGenerator: {
    enabled: boolean;
    creditCost: number;
    defaultDueDays: number;
    defaultFooter: string;
    defaultIncludeTax: boolean;
  };
  signupBonus: {
    enabled: boolean;
    amount: number;
  };
  lowCreditWarningThreshold: number;
};

export const TOOL_SETTING_KEYS = Object.keys(TOOL_SETTING_DEFAULTS) as ToolSettingKey[];

function parseBoolean(value: string | undefined) {
  return value === "true";
}

function parsePositiveInt(value: string | undefined, fallback: number, min = 0) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < min) return fallback;
  return Math.min(parsed, 9999);
}

function parseString(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 500) : fallback;
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
    invoiceGenerator: {
      enabled: parseBoolean(values.tool_invoice_generator_enabled),
      creditCost: parsePositiveInt(
        values.tool_invoice_generator_cost,
        Number(TOOL_SETTING_DEFAULTS.tool_invoice_generator_cost),
      ),
      defaultDueDays: parsePositiveInt(
        values.tool_invoice_generator_default_due_days,
        Number(TOOL_SETTING_DEFAULTS.tool_invoice_generator_default_due_days),
        1,
      ),
      defaultFooter: parseString(
        values.tool_invoice_generator_default_footer,
        TOOL_SETTING_DEFAULTS.tool_invoice_generator_default_footer,
      ),
      defaultIncludeTax: parseBoolean(values.tool_invoice_generator_default_include_tax),
    },
    signupBonus: {
      enabled: parseBoolean(values.tool_signup_bonus_enabled),
      amount: parsePositiveInt(
        values.tool_signup_bonus_amount,
        Number(TOOL_SETTING_DEFAULTS.tool_signup_bonus_amount),
      ),
    },
    lowCreditWarningThreshold: parsePositiveInt(
      values.tool_low_credit_warning_threshold,
      Number(TOOL_SETTING_DEFAULTS.tool_low_credit_warning_threshold),
    ),
  };
}

export function normalizeToolSettingValue(key: ToolSettingKey, value: unknown) {
  if (key.endsWith("_enabled") || key === "tool_invoice_generator_default_include_tax") {
    return value === true || value === "true" ? "true" : "false";
  }

  if (key === "tool_invoice_generator_default_footer") {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed ? trimmed.slice(0, 500) : TOOL_SETTING_DEFAULTS[key];
  }

  const parsed = Number.parseInt(String(value ?? ""), 10);
  const min = key === "tool_invoice_generator_default_due_days" ? 1 : 0;
  if (!Number.isFinite(parsed) || parsed < min) return TOOL_SETTING_DEFAULTS[key];
  return String(Math.min(parsed, 9999));
}

export async function getToolSettings(): Promise<ToolSettings> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: TOOL_SETTING_KEYS } },
    select: { key: true, value: true },
  });

  return parseToolSettings(mergeToolSettingRows(rows));
}
