import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

const DEFAULTS = {
  hero_stat_1_num: "50+", hero_stat_1_label: "Proyek selesai",
  hero_stat_2_num: "95%", hero_stat_2_label: "Klien puas",
  hero_stat_3_num: "3 hari", hero_stat_3_label: "Rata-rata delivery",
};

export default async function SettingsPage() {
  const rows = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) settings[row.key] = row.value;
  return <SettingsClient initial={settings} />;
}
