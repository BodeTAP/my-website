import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/whatsapp";

/**
 * Returns a single active Fonnte API key.
 * Priority: DB setting `fonnte_api_key` → env FONNTE_API_KEY
 *
 * NOTE: Keys stored in DB are plaintext. For higher security,
 * prefer using env vars (FONNTE_API_KEY / FONNTE_API_KEYS) instead.
 */
export async function getFonnteKey(): Promise<string | undefined> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "fonnte_api_key" } });
    if (row?.value) return row.value;

    const multiRow = await prisma.siteSetting.findUnique({ where: { key: "fonnte_api_keys" } });
    const firstMultiKey = multiRow?.value.split(",").map((key) => key.trim()).find(Boolean);
    if (firstMultiKey) return firstMultiKey;
  } catch { /* fallback to env */ }

  const firstEnvKey = process.env.FONNTE_API_KEYS?.split(",").map((key) => key.trim()).find(Boolean);
  if (firstEnvKey) return firstEnvKey;

  return process.env.FONNTE_API_KEY;
}

/**
 * Returns ALL Fonnte API keys as an array (for multi-device rotator).
 *
 * Priority:
 * 1. DB setting `fonnte_api_keys` — comma-separated, e.g. "TOKEN1,TOKEN2,TOKEN3"
 * 2. Env var FONNTE_API_KEYS    — comma-separated
 * 3. DB setting `fonnte_api_key` — single key (fallback)
 * 4. Env var FONNTE_API_KEY     — single key (fallback)
 *
 * When multiple tokens are returned, callers can pass them as
 * `Authorization: TOKEN1,TOKEN2` — Fonnte automatically rotates
 * the device used per message (built-in load balancer).
 * All tokens MUST belong to the same Fonnte account.
 */
export async function getFonnteKeys(): Promise<string[]> {
  try {
    // 1. Try multi-key DB setting first
    const multiRow = await prisma.siteSetting.findUnique({ where: { key: "fonnte_api_keys" } });
    if (multiRow?.value) {
      const keys = multiRow.value.split(",").map((k) => k.trim()).filter(Boolean);
      if (keys.length > 0) return keys;
    }

    // 2. Try single-key DB setting
    const singleRow = await prisma.siteSetting.findUnique({ where: { key: "fonnte_api_key" } });
    if (singleRow?.value) return [singleRow.value];
  } catch { /* fallback to env */ }

  // 3. Try multi-key env var
  if (process.env.FONNTE_API_KEYS) {
    const keys = process.env.FONNTE_API_KEYS.split(",").map((k) => k.trim()).filter(Boolean);
    if (keys.length > 0) return keys;
  }

  // 4. Single key env var
  if (process.env.FONNTE_API_KEY) return [process.env.FONNTE_API_KEY];

  return [];
}

/**
 * Returns the Fonnte API key for a specific device number.
 * Used by the inbound webhook to reply from the same device that sent the broadcast.
 *
 * Lookup order:
 * 1. DB `fonnte_device_token_map` — JSON {"628xxx": "TOKEN1", "628yyy": "TOKEN2"}
 * 2. Fallback to getFonnteKey() (first available key)
 *
 * @param deviceNumber - The device phone number from Fonnte webhook payload (field `device`)
 */
export async function getFonnteKeyForDevice(deviceNumber: string): Promise<string | undefined> {
  if (!deviceNumber?.trim()) return getFonnteKey();

  const normalized = normalizePhone(deviceNumber.replace(/@.+$/, ""));

  try {
    const mapRow = await prisma.siteSetting.findUnique({ where: { key: "fonnte_device_token_map" } });
    if (mapRow?.value?.trim()) {
      const map = JSON.parse(mapRow.value) as Record<string, string>;
      // Try exact normalized match first, then last-8-digits fuzzy match
      const exactKey = Object.keys(map).find((k) => normalizePhone(k) === normalized);
      if (exactKey && map[exactKey]) return map[exactKey];

      const lastDigits = normalized.slice(-8);
      const fuzzyKey = Object.keys(map).find((k) => normalizePhone(k).endsWith(lastDigits));
      if (fuzzyKey && map[fuzzyKey]) return map[fuzzyKey];
    }
  } catch {
    // JSON parse error or DB error — fall through to default key
  }

  return getFonnteKey();
}
