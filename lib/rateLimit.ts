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
    const windowSec = Math.ceil(windowMs / 1000);
    const current = await redis.incr(key);
    // Set TTL only on first request so the window doesn't reset on every hit
    if (current === 1) await redis.expire(key, windowSec);

    if (current > limit) {
      const ttl = await redis.ttl(key);
      return { allowed: false, remaining: 0, retryAfterMs: Math.max(ttl, 0) * 1000 };
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
