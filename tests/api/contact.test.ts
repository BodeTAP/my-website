import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { lead: { create: vi.fn() } },
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: vi.fn(async () => ({ allowed: true, remaining: 4, retryAfterMs: 0 })),
  getClientIP: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/whatsapp", () => ({
  sendWA: vi.fn(),
  waMsg: { newLead: vi.fn(() => "pesan wa mock") },
}));

vi.mock("next/server", async (importOriginal) => {
  const mod = await importOriginal<typeof import("next/server")>();
  return { ...mod, after: vi.fn() };
});

import { POST } from "@/app/api/contact/route";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

const mockLead = {
  id: "lead-1",
  name: "Budi",
  businessName: "Toko Budi",
  whatsapp: "08123456789",
  domain: null,
  currentWebsite: null,
  message: null,
  status: "NEW",
  source: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 4, retryAfterMs: 0 });
  });

  it("mengembalikan 400 jika field wajib tidak lengkap", async () => {
    const res = await POST(makeRequest({ name: "Budi" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("membuat lead dan mengembalikan 201", async () => {
    vi.mocked(prisma.lead.create).mockResolvedValue(mockLead as never);

    const res = await POST(
      makeRequest({ name: "Budi", businessName: "Toko Budi", whatsapp: "08123456789" })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.id).toBe("lead-1");
    expect(prisma.lead.create).toHaveBeenCalledOnce();
  });

  it("trim whitespace pada input sebelum disimpan", async () => {
    vi.mocked(prisma.lead.create).mockResolvedValue(mockLead as never);

    await POST(
      makeRequest({ name: "  Budi  ", businessName: "  Toko  ", whatsapp: "  0812  " })
    );

    expect(prisma.lead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Budi", businessName: "Toko", whatsapp: "0812" }),
      })
    );
  });

  it("mengembalikan 429 saat rate limit tercapai", async () => {
    vi.mocked(rateLimit).mockResolvedValue({ allowed: false, remaining: 0, retryAfterMs: 3_600_000 });

    const res = await POST(
      makeRequest({ name: "Budi", businessName: "Toko", whatsapp: "0812" })
    );
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeDefined();
  });

  it("mengembalikan 500 jika database error", async () => {
    vi.mocked(prisma.lead.create).mockRejectedValue(new Error("DB down"));

    const res = await POST(
      makeRequest({ name: "Budi", businessName: "Toko", whatsapp: "0812" })
    );
    expect(res.status).toBe(500);
  });
});
