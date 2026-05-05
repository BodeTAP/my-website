import "server-only";
import { getFonnteKey } from "./getFonnteKey";

const FONNTE_URL = "https://api.fonnte.com/send";

/** Normalize Indonesian phone to 628xxx format (no +, no spaces) */
export function normalizePhone(raw: string): string {
  let n = raw.replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (n.startsWith("8") && n.length <= 13) n = "62" + n;
  return n;
}

/** Send a WhatsApp message via Fonnte. Returns true on success.
 *  Pass apiKey explicitly for bulk sends (pre-fetched via getFonnteKey from lib/getFonnteKey). */
export async function sendWA(
  to: string,
  message: string,
  apiKey?: string,
): Promise<boolean> {
  // Fallback to DB key if not provided and env var is missing
  const key = apiKey ?? (await getFonnteKey());

  if (!key) {
    console.error("[WA] FONNTE_API_KEY belum dikonfigurasi (cek env var atau database SiteSetting)");
    return false;
  }
  if (!to?.trim()) {
    console.warn("[WA] Nomor tujuan kosong — pesan tidak dikirim");
    return false;
  }

  const phone = normalizePhone(to);
  if (phone.length < 10) {
    console.error("[WA] Nomor tidak valid setelah normalisasi:", phone);
    return false;
  }

  // Fonnte lebih stabil dengan URLSearchParams daripada JSON
  const body = new URLSearchParams({
    target: phone,
    message,
    countryCode: "62",
  });

  try {
    const res = await fetch(FONNTE_URL, {
      method: "POST",
      headers: { Authorization: key },
      body,
    });
    const data = (await res.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!res.ok || data?.status === false) {
      console.error("[WA] Fonnte error:", res.status, JSON.stringify(data));
      return false;
    }

    console.log("[WA] Terkirim ke", phone, "→", data?.status ?? "ok");
    return true;
  } catch (err) {
    console.error("[WA] Fetch error:", err);
    return false;
  }
}

// ── Batch sender (rotator) ─────────────────────────────────────────────────────

type BatchItem = {
  phone: string; // raw phone, will be normalized
  message: string;
};

type BatchResult = {
  phone: string;
  ok: boolean;
};

/**
 * Send multiple WhatsApp messages in a SINGLE Fonnte API call using the
 * `data` parameter. Benefits vs sequential sendWA() calls:
 *
 * 1. No server-side delay loop → zero risk of Vercel function timeout.
 * 2. Fonnte handles the delay internally (4–8 seconds random between messages).
 * 3. When multiple API tokens are passed (comma-separated), Fonnte
 *    automatically rotates the sending device per message — built-in rotator.
 *
 * @param items   Array of { phone, message } objects.
 * @param apiKeys Array of Fonnte tokens (all must belong to same account).
 *                Fonnte will rotate devices when more than one token is given.
 * @param delayRange Random delay range in seconds between messages, default "4-8".
 */
export async function sendWABatch(
  items: BatchItem[],
  apiKeys: string[],
  delayRange = "4-8",
): Promise<BatchResult[]> {
  if (!apiKeys.length) {
    console.error("[WA Batch] No Fonnte API keys configured");
    return items.map((i) => ({ phone: i.phone, ok: false }));
  }
  if (!items.length) return [];

  // Join multiple tokens → Fonnte rotates devices automatically
  const authHeader = apiKeys.join(",");

  // Build the data array — each item is one message with a random delay
  const dataPayload = items.map((item, idx) => ({
    target: normalizePhone(item.phone),
    message: item.message,
    countryCode: "62",
    // First message is sent immediately, rest get the delay
    ...(idx > 0 ? { delay: delayRange } : {}),
  }));

  // `data` must be a JSON string per Fonnte docs
  const body = new URLSearchParams({
    data: JSON.stringify(dataPayload),
  });

  try {
    const res = await fetch(FONNTE_URL, {
      method: "POST",
      headers: { Authorization: authHeader },
      body,
    });

    const json = (await res.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!res.ok || json?.status === false) {
      console.error(
        "[WA Batch] Fonnte error:",
        res.status,
        JSON.stringify(json),
      );
      // Mark all as failed on API-level error
      return items.map((i) => ({ phone: i.phone, ok: false }));
    }

    console.log(
      `[WA Batch] Queued ${items.length} messages via ${apiKeys.length} device(s) →`,
      json?.detail ?? "ok",
    );

    // Fonnte queues all successfully — mark all as ok
    return items.map((i) => ({ phone: i.phone, ok: true }));
  } catch (err) {
    console.error("[WA Batch] Fetch error:", err);
    return items.map((i) => ({ phone: i.phone, ok: false }));
  }
}

// ── Message templates ──────────────────────────────────────────────────────────
// Re-exported from lib/waTemplates.ts (no Node.js deps — safe for Client Components)
export { waMsg } from "./waTemplates";
