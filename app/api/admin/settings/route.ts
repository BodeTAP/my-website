import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AI_DEFAULTS, normalizeAiSettingValue } from "@/lib/aiSettings";
import { BROADCAST_SETTING_DEFAULTS } from "@/lib/broadcastSettings";
import { SITE_SETTING_DEFAULTS, normalizeSiteSettingValue } from "@/lib/siteSettings";

const DEFAULTS: Record<string, string> = {
  fonnte_api_key:      "",
  fonnte_api_keys:     "",
  ...SITE_SETTING_DEFAULTS,
  ...AI_DEFAULTS,
  ...BROADCAST_SETTING_DEFAULTS,
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

function normalizeSettingValue(key: string, value: unknown): string {
  const aiValue = normalizeAiSettingValue(key, value);
  if (aiValue !== null) return aiValue;
  const siteValue = normalizeSiteSettingValue(key, value);
  if (siteValue !== null) return siteValue;
  return String(value ?? "");
}

export async function PATCH(req: Request) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;

  const updates: Record<string, string> = await req.json();
  const filtered = Object.entries(updates)
    .filter(([key]) => ALLOWED_KEYS.has(key))
    .map(([key, value]) => [key, normalizeSettingValue(key, value)] as const);

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
