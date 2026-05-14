import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/permissions";
import {
  mergeToolSettingRows,
  normalizeToolSettingValue,
  TOOL_SETTING_DEFAULTS,
  TOOL_SETTING_KEYS,
  type ToolSettingKey,
} from "@/lib/toolSettings";

export async function GET() {
  const denied = await requireApiPermission("proposals");
  if (denied) return denied;

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: TOOL_SETTING_KEYS } },
    select: { key: true, value: true },
  });

  return NextResponse.json({ settings: mergeToolSettingRows(rows) });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireApiPermission("proposals");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const updates = body && typeof body === "object" ? body as Record<string, unknown> : {};

  await prisma.$transaction(
    TOOL_SETTING_KEYS.map((key) => {
      const value = normalizeToolSettingValue(
        key,
        Object.prototype.hasOwnProperty.call(updates, key) ? updates[key] : TOOL_SETTING_DEFAULTS[key],
      );

      return prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }),
  );

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: TOOL_SETTING_KEYS } },
    select: { key: true, value: true },
  });

  revalidatePath("/admin/tools");
  revalidatePath("/portal/tools");
  revalidatePath("/portal/tools/lead-finder");
  revalidatePath("/portal/tools/proposal-generator");
  revalidatePath("/portal/tools/invoice-generator");

  return NextResponse.json({ settings: mergeToolSettingRows(rows) as Record<ToolSettingKey, string> });
}
