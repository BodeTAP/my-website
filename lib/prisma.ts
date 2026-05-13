import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  try {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get("sslmode");

    if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
