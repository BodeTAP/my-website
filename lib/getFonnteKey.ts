import { prisma } from "@/lib/prisma";

/** Returns active Fonnte API key: DB setting → FONNTE_API_KEY env var */
export async function getFonnteKey(): Promise<string | undefined> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "fonnte_api_key" } });
    if (row?.value) return row.value;
  } catch { /* fallback to env */ }
  return process.env.FONNTE_API_KEY;
}
