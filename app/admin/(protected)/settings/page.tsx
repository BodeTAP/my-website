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

export default async function SettingsPage() {
  await requireModule("ai_settings");

  const rows = await prisma.siteSetting.findMany();

  const settings: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) settings[row.key] = row.value;

  return <SettingsClient initial={settings} />;
}
