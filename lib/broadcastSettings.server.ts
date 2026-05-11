import "server-only";
import { prisma } from "./prisma";
import { BROADCAST_SETTING_DEFAULTS, parseBroadcastSettings } from "./broadcastSettings";

export async function loadBroadcastSettings() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.keys(BROADCAST_SETTING_DEFAULTS) } },
  });

  return parseBroadcastSettings({
    ...BROADCAST_SETTING_DEFAULTS,
    ...Object.fromEntries(rows.map((row) => [row.key, row.value])),
  });
}
