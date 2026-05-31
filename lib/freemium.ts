import "server-only";

import { createHash } from "crypto";

import { Prisma } from "@prisma/client";

import { rateLimit, getClientIP, refundRateLimit } from "@/lib/rateLimit";
import { getToolSettings } from "@/lib/toolSettings";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FreemiumTool = "lead_finder" | "proposal_generator" | "invoice_generator";

export type FreemiumSettings = {
  enabled: boolean;
  limit: number;
  windowMs: number;
  resultCap?: number;
};

export type FreemiumQuotaResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  ipHash: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Lead Finder window: 24 hours */
const LEAD_FINDER_WINDOW_MS = 86_400_000;

/** Proposal & Invoice Generator window: 30 days */
const MONTHLY_WINDOW_MS = 2_592_000_000;

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * One-way hash of an IP address using SHA-256 with AUTH_SECRET as salt.
 * Returns the first 16 hex characters.
 */
export function hashIP(ip: string): string {
  return createHash("sha256")
    .update(ip + (process.env.AUTH_SECRET ?? ""))
    .digest("hex")
    .slice(0, 16);
}

/**
 * Reads freemium configuration for a given tool from the site_settings table.
 */
export async function getFreemiumSettings(tool: FreemiumTool): Promise<FreemiumSettings> {
  const settings = await getToolSettings();

  switch (tool) {
    case "lead_finder":
      return {
        enabled: settings.freemium.leadFinder.enabled,
        limit: settings.freemium.leadFinder.dailyLimit,
        windowMs: LEAD_FINDER_WINDOW_MS,
        resultCap: settings.freemium.leadFinder.resultCap,
      };
    case "proposal_generator":
      return {
        enabled: settings.freemium.proposalGenerator.enabled,
        limit: settings.freemium.proposalGenerator.monthlyLimit,
        windowMs: MONTHLY_WINDOW_MS,
      };
    case "invoice_generator":
      return {
        enabled: settings.freemium.invoiceGenerator.enabled,
        limit: settings.freemium.invoiceGenerator.monthlyLimit,
        windowMs: MONTHLY_WINDOW_MS,
      };
  }
}

/**
 * Checks whether the requesting IP still has freemium quota for the given tool.
 * Uses the existing `rateLimit()` function with a Redis key pattern of
 * `freemium:{tool}:{ipHash}`.
 */
export async function checkFreemiumQuota(
  req: Request,
  tool: FreemiumTool,
): Promise<FreemiumQuotaResult> {
  const ip = getClientIP(req);
  const ipHash = hashIP(ip);
  const settings = await getFreemiumSettings(tool);
  const key = `freemium:${tool}:${ipHash}`;

  const { allowed, remaining, retryAfterMs } = await rateLimit(
    key,
    settings.limit,
    settings.windowMs,
  );

  return { allowed, remaining, retryAfterMs, ipHash };
}

/**
 * Refunds a previously consumed freemium quota slot for the given tool + IP hash.
 * Call this when the request was counted by `checkFreemiumQuota` but the
 * operation failed (e.g. upstream search error) so the user is not charged for
 * an outcome they never received.
 */
export async function refundFreemiumQuota(
  tool: FreemiumTool,
  ipHash: string,
): Promise<void> {
  await refundRateLimit(`freemium:${tool}:${ipHash}`);
}

/**
 * Records an anonymous tool usage event in the database for analytics.
 * Fails silently if the table is not yet available (e.g. dev server not restarted).
 */
export async function trackAnonymousUsage(
  ipHash: string,
  tool: FreemiumTool,
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.anonymousToolUsage.create({
      data: {
        ipHash,
        tool,
        metadata: (meta ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.warn("[Freemium] trackAnonymousUsage failed:", (err as Error).message);
  }
}
