import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

const DEFAULTS = {
  hero_stat_1_num: "50+", hero_stat_1_label: "Proyek selesai",
  hero_stat_2_num: "95%", hero_stat_2_label: "Klien puas",
  hero_stat_3_num: "3 hari", hero_stat_3_label: "Rata-rata delivery",
  facebook_pixel_id: "",
  google_analytics_id: "",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/admin/login");

  const [rows, admins] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    })
  ]);

  const settings: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) settings[row.key] = row.value;

  const serializedAdmins = admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }));
  const currentUserId = (session.user as { id?: string })?.id ?? "";

  return <SettingsClient initial={settings} initialAdmins={serializedAdmins} currentUserId={currentUserId} />;
}
