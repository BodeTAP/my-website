import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => {
  const tx = {
    clientCredit: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
    creditTransaction: {
      create: vi.fn(),
    },
  };

  return {
    tx,
    prisma: {
      clientCredit: {
        findUnique: vi.fn(),
      },
      creditTransaction: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (txArg: typeof tx) => unknown) => callback(tx)),
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import {
  deductCredits,
  getClientBalance,
  getTransactionHistory,
  refundCredits,
  topupCredits,
} from "@/lib/credits";

describe("credits service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.tx));
  });

  it("mengembalikan 0 jika client belum punya record kredit", async () => {
    mocks.prisma.clientCredit.findUnique.mockResolvedValue(null);

    await expect(getClientBalance("client-1")).resolves.toBe(0);
  });

  it("menolak deduct jika saldo tidak cukup", async () => {
    mocks.tx.clientCredit.upsert.mockResolvedValue({ balance: 3 });

    const result = await deductCredits("client-1", 5, "lead_finder", "Search: restoran");

    expect(result).toEqual({ ok: false, error: "Kredit tidak cukup", newBalance: 3 });
    expect(mocks.tx.clientCredit.update).not.toHaveBeenCalled();
    expect(mocks.tx.creditTransaction.create).not.toHaveBeenCalled();
  });

  it("mengurangi saldo dan mencatat transaksi USE", async () => {
    mocks.tx.clientCredit.upsert.mockResolvedValue({ balance: 12 });
    mocks.tx.clientCredit.update.mockResolvedValue({ balance: 7 });

    const result = await deductCredits("client-1", 5, "lead_finder", "Search: restoran", {
      results: 20,
    });

    expect(result).toEqual({ ok: true, newBalance: 7 });
    expect(mocks.tx.clientCredit.update).toHaveBeenCalledWith({
      where: { clientId: "client-1" },
      data: { balance: { decrement: 5 } },
      select: { balance: true },
    });
    expect(mocks.tx.creditTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clientId: "client-1",
        amount: -5,
        type: "USE",
        tool: "lead_finder",
        description: "Search: restoran",
        meta: { results: 20 },
      }),
    });
  });

  it("menambah saldo TOPUP dengan packageId dan meta invoice", async () => {
    mocks.tx.clientCredit.upsert.mockResolvedValue({ balance: 160 });

    await expect(
      topupCredits("client-1", 110, "Pembelian Paket Growth", "pkg-1", {
        invoiceId: "inv-1",
        invoiceNo: "PKG-123",
      }),
    ).resolves.toBe(160);

    expect(mocks.tx.creditTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clientId: "client-1",
        amount: 110,
        type: "TOPUP",
        description: "Pembelian Paket Growth",
        meta: { packageId: "pkg-1", invoiceId: "inv-1", invoiceNo: "PKG-123" },
      }),
    });
  });

  it("mencatat refund manual sebagai REFUND", async () => {
    mocks.tx.clientCredit.upsert.mockResolvedValue({ balance: 25 });

    await expect(refundCredits("client-1", 10, "Refund manual", { source: "admin" })).resolves.toBe(25);

    expect(mocks.tx.creditTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clientId: "client-1",
        amount: 10,
        type: "REFUND",
        description: "Refund manual",
        meta: { source: "admin" },
      }),
    });
  });

  it("mengambil riwayat transaksi terbaru", async () => {
    mocks.prisma.creditTransaction.findMany.mockResolvedValue([]);

    await getTransactionHistory("client-1", 5);

    expect(mocks.prisma.creditTransaction.findMany).toHaveBeenCalledWith({
      where: { clientId: "client-1" },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  });
});
