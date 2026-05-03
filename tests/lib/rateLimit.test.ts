import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Upstash Redis — test selalu pakai in-memory fallback
vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor() {}
  },
}));

import { rateLimit, getClientIP } from "@/lib/rateLimit";

let keyCounter = 0;
const key = () => `test-${Date.now()}-${keyCounter++}`;

describe("rateLimit() — in-memory fallback (local dev)", () => {
  it("mengizinkan request pertama", async () => {
    const result = await rateLimit(key(), 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.retryAfterMs).toBe(0);
  });

  it("mengurangi remaining pada setiap request", async () => {
    const k = key();
    await rateLimit(k, 3, 60_000);
    const second = await rateLimit(k, 3, 60_000);
    expect(second.remaining).toBe(1);
  });

  it("memblokir saat limit terlampaui", async () => {
    const k = key();
    await rateLimit(k, 2, 60_000);
    await rateLimit(k, 2, 60_000);
    const blocked = await rateLimit(k, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("mereset counter setelah window berakhir", async () => {
    const k = key();
    await rateLimit(k, 1, 50);
    await rateLimit(k, 1, 50);

    await new Promise((r) => setTimeout(r, 60));

    const afterReset = await rateLimit(k, 1, 50);
    expect(afterReset.allowed).toBe(true);
  });
});

describe("getClientIP()", () => {
  it("membaca IP dari x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIP(req)).toBe("1.2.3.4");
  });

  it("fallback ke x-real-ip", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIP(req)).toBe("9.9.9.9");
  });

  it("fallback ke 'unknown' jika tidak ada header", () => {
    const req = new Request("http://localhost");
    expect(getClientIP(req)).toBe("unknown");
  });
});
