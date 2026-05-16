import "server-only";

import type { CreditTransaction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const WELCOME_BONUS_DESCRIPTION = "Bonus pendaftaran akun baru";

export async function getClientBalance(clientId: string): Promise<number> {
  const credit = await prisma.clientCredit.findUnique({
    where: { clientId },
    select: { balance: true },
  });

  return credit?.balance ?? 0;
}

export async function deductCredits(
  clientId: string,
  amount: number,
  tool: string,
  description: string,
  meta?: Record<string, unknown>,
): Promise<{ ok: boolean; newBalance: number; error?: string }> {
  if (amount <= 0) return { ok: false, newBalance: await getClientBalance(clientId), error: "Jumlah kredit tidak valid" };

  return prisma.$transaction(async (tx) => {
    const current = await tx.clientCredit.upsert({
      where: { clientId },
      update: {},
      create: { clientId, balance: 0 },
    });

    if (current.balance < amount) {
      return { ok: false, error: "Kredit tidak cukup", newBalance: current.balance };
    }

    const updated = await tx.clientCredit.update({
      where: { clientId },
      data: { balance: { decrement: amount } },
      select: { balance: true },
    });

    await tx.creditTransaction.create({
      data: {
        clientId,
        amount: -amount,
        type: "USE",
        tool,
        description,
        meta: meta as Prisma.InputJsonValue | undefined,
      },
    });

    return { ok: true, newBalance: updated.balance };
  });
}

export async function topupCredits(
  clientId: string,
  amount: number,
  description: string,
  packageId?: string,
  meta?: Record<string, unknown>,
): Promise<number> {
  if (amount <= 0) return getClientBalance(clientId);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.clientCredit.upsert({
      where: { clientId },
      update: { balance: { increment: amount } },
      create: { clientId, balance: amount },
      select: { balance: true },
    });

    await tx.creditTransaction.create({
      data: {
        clientId,
        amount,
        type: "TOPUP",
        description,
        meta: packageId || meta
          ? ({ ...(packageId ? { packageId } : {}), ...(meta ?? {}) } as Prisma.InputJsonValue)
          : undefined,
      },
    });

    return updated.balance;
  });
}

export async function grantWelcomeCredits(
  clientId: string,
  amount: number,
): Promise<{ granted: boolean; newBalance: number }> {
  if (amount <= 0) return { granted: false, newBalance: await getClientBalance(clientId) };

  return prisma.$transaction(async (tx) => {
    const existingBonus = await tx.creditTransaction.findFirst({
      where: {
        clientId,
        type: "TOPUP",
        description: WELCOME_BONUS_DESCRIPTION,
      },
      select: { id: true },
    });

    if (existingBonus) {
      const current = await tx.clientCredit.upsert({
        where: { clientId },
        update: {},
        create: { clientId, balance: 0 },
        select: { balance: true },
      });

      return { granted: false, newBalance: current.balance };
    }

    const updated = await tx.clientCredit.upsert({
      where: { clientId },
      update: { balance: { increment: amount } },
      create: { clientId, balance: amount },
      select: { balance: true },
    });

    await tx.creditTransaction.create({
      data: {
        clientId,
        amount,
        type: "TOPUP",
        description: WELCOME_BONUS_DESCRIPTION,
        meta: { source: "signup_bonus" } as Prisma.InputJsonValue,
      },
    });

    return { granted: true, newBalance: updated.balance };
  });
}

export async function refundCredits(
  clientId: string,
  amount: number,
  description: string,
  meta?: Record<string, unknown>,
): Promise<number> {
  if (amount <= 0) return getClientBalance(clientId);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.clientCredit.upsert({
      where: { clientId },
      update: { balance: { increment: amount } },
      create: { clientId, balance: amount },
      select: { balance: true },
    });

    await tx.creditTransaction.create({
      data: {
        clientId,
        amount,
        type: "REFUND",
        description,
        meta: meta as Prisma.InputJsonValue | undefined,
      },
    });

    return updated.balance;
  });
}

export async function getTransactionHistory(
  clientId: string,
  limit = 20,
): Promise<CreditTransaction[]> {
  return prisma.creditTransaction.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
