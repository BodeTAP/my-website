import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AI_DEFAULTS } from "@/lib/aiSettings";

const DEFAULTS: Record<string, string> = {
  hero_stat_1_num:   "50+",
  hero_stat_1_label: "Proyek selesai",
  hero_stat_2_num:   "95%",
  hero_stat_2_label: "Klien puas",
  hero_stat_3_num:   "3 hari",
  hero_stat_3_label: "Rata-rata delivery",
  facebook_pixel_id:   "",
  google_analytics_id: "",
  fonnte_api_key:      "",
  fonnte_api_keys:     "",
  ...AI_DEFAULTS,
};

export async function GET() {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;

  const rows = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) settings[row.key] = row.value;
  return NextResponse.json(settings);
}

const ALLOWED_KEYS = new Set(Object.keys(DEFAULTS));

export async function PATCH(req: Request) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;

  const updates: Record<string, string> = await req.json();
  const filtered = Object.entries(updates).filter(([key]) => ALLOWED_KEYS.has(key));

  if (filtered.length === 0) {
    return NextResponse.json({ error: "Tidak ada key yang valid" }, { status: 400 });
  }

  await Promise.all(
    filtered.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
