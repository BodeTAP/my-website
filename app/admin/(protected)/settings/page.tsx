import { prisma } from "@/lib/prisma";
import { AI_DEFAULTS } from "@/lib/aiSettings";
import { BROADCAST_SETTING_DEFAULTS } from "@/lib/broadcastSettings";
import { SITE_SETTING_DEFAULTS } from "@/lib/siteSettings";
import { requireModule } from "@/lib/permissions";
import SettingsClient from "./SettingsClient";

const DEFAULTS = {
  ...SITE_SETTING_DEFAULTS,
  ...AI_DEFAULTS,
  ...BROADCAST_SETTING_DEFAULTS,
};

const VALID_TABS = new Set(["umum", "seo", "komunikasi", "payment", "ai", "broadcast"]);

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; section?: string }>;
}) {
  await requireModule("ai_settings");
  const params = await searchParams;
  const requestedTab = params?.tab;
  const initialTab = requestedTab && VALID_TABS.has(requestedTab) ? requestedTab : "umum";

  const rows = await prisma.siteSetting.findMany();

  const settings: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) settings[row.key] = row.value;

  return (
    <SettingsClient
      initial={settings}
      hasFonnteAccountToken={!!process.env.FONNTE_ACCOUNT_TOKEN}
      initialTab={initialTab as "umum" | "seo" | "komunikasi" | "payment" | "ai" | "broadcast"}
      initialSection={params?.section}
    />
  );
}
