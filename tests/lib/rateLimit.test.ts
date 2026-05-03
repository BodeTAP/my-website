import { describe, it, expect } from "vitest";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

// Setiap test pakai key unik agar tidak saling mempengaruhi
// (rate limiter menyimpan state di module-level Map)
let keyCounter = 0;
const key = () => `test-${Date.now()}-${keyCounter++}`;

describe("rateLimit()", () => {
  it("mengizinkan request pertama", () => {
    const result = rateLimit(key(), 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.retryAfterMs).toBe(0);
  });

  it("mengurangi remaining pada setiap request", () => {
    const k = key();
    rateLimit(k, 3, 60_000);
    const second = rateLimit(k, 3, 60_000);
    expect(second.remaining).toBe(1);
  });

  it("memblokir saat limit terlampaui", () => {
    const k = key();
    rateLimit(k, 2, 60_000);
    rateLimit(k, 2, 60_000);
    const blocked = rateLimit(k, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("mereset counter setelah window berakhir", async () => {
    const k = key();
    rateLimit(k, 1, 50); // window 50ms
    rateLimit(k, 1, 50); // blocked

    await new Promise((r) => setTimeout(r, 60)); // tunggu window reset

    const afterReset = rateLimit(k, 1, 50);
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
