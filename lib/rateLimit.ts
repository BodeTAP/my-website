import { Redis } from "@upstash/redis";

// Production: shared Redis via Upstash (limits enforced across all serverless instances)
// Development: in-memory Map fallback when UPSTASH_REDIS_REST_URL is not set
const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

// In-memory fallback for local development
const store = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
  if (redis) {
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
    const current = await redis.incr(key);
    // Set TTL only on first request so the window doesn't reset on every hit.
    if (current === 1) {
      await redis.expire(key, windowSec);
    } else {
      // Self-heal: if a previous expire call was lost (network blip between
      // incr/expire), the key would have no TTL and lock the user out forever.
      // Re-apply the window whenever we find a key without an expiry.
      const ttl = await redis.ttl(key);
      if (ttl < 0) await redis.expire(key, windowSec);
    }

    if (current > limit) {
      const ttl = await redis.ttl(key);
      // ttl === -1 → key has no expiry (should have been healed above); use the
      // full window as a safe fallback rather than 0 (which implies "retry now").
      const retrySec = ttl >= 0 ? ttl : windowSec;
      return { allowed: false, remaining: 0, retryAfterMs: retrySec * 1000 };
    }
    return { allowed: true, remaining: limit - current, retryAfterMs: 0 };
  }

  // Fallback: in-memory (local dev only)
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }
  entry.count++;
  return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 };
}

export function getClientIP(req: Request): string {
  // On Vercel, the LAST entry in X-Forwarded-For is appended by the edge proxy
  // and cannot be spoofed — the first entries can be forged by the client.
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    return parts[parts.length - 1].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Refunds one unit of a previously consumed rate-limit slot. Use this when an
 * operation was counted (via rateLimit) but then failed before delivering
 * value, so the user isn't penalized for our error. Never drops below zero.
 */
export async function refundRateLimit(key: string): Promise<void> {
  try {
    if (redis) {
      const current = await redis.get<number>(key);
      if (typeof current === "number" && current > 0) {
        await redis.decr(key);
      }
      return;
    }
    const entry = store.get(key);
    if (entry && entry.count > 0) entry.count--;
  } catch {
    // Best-effort refund — never throw from cleanup.
  }
}
