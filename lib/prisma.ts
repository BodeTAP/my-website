import { PrismaClient } from "@prisma/client";

// ─── Production: Prisma Accelerate ────────────────────────────────────────────
// Uses ACCELERATE_DATABASE_URL (format: prisma://accelerate.prisma-data.net/...)
// Accelerate handles connection pooling so serverless functions don't exhaust
// the PostgreSQL max_connections limit on cold starts.
import { withAccelerate } from "@prisma/extension-accelerate";

// ─── Development: Direct PostgreSQL via PrismaPg ──────────────────────────────
// Uses DATABASE_URL (format: postgresql://user:pass@host/db)
// PrismaPg is kept for local dev so Accelerate is not required locally.
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    // Production: connect through Prisma Accelerate connection pool.
    // Requires ACCELERATE_DATABASE_URL to be set in Vercel environment variables.
    return new PrismaClient({
      datasourceUrl: process.env.ACCELERATE_DATABASE_URL!,
      log: [],
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  // Development: direct connection to local / remote PostgreSQL.
  // Requires DATABASE_URL to be set in .env or .env.local.
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({
    adapter,
    log: ["error"],
  });
}

// Reuse the client across hot-reloads in development to avoid
// exhausting connections during `next dev`.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
