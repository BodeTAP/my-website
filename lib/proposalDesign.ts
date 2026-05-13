import "server-only";

import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProposalDesign = {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  fontStyle: "sans" | "serif" | "mono";
  layout: "corporate" | "minimal" | "modern" | "bold";
  logoPosition: "left" | "center" | "right";
  showLogo: boolean;
  showProposalNo: boolean;
  showDate: boolean;
  showRecipient: boolean;
  showFooter: boolean;
};

export const DEFAULT_PROPOSAL_DESIGN: ProposalDesign = {
  logoUrl: null,
  primaryColor: "#1e40af",
  accentColor: "#0d9488",
  fontStyle: "sans",
  layout: "corporate",
  logoPosition: "left",
  showLogo: true,
  showProposalNo: true,
  showDate: true,
  showRecipient: true,
  showFooter: true,
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function stringOption<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? value as T : fallback;
}

function boolOption(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function sanitizeProposalDesign(value: unknown): ProposalDesign {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    logoUrl: typeof record.logoUrl === "string" && record.logoUrl.trim() ? record.logoUrl.trim() : null,
    primaryColor: typeof record.primaryColor === "string" && HEX_RE.test(record.primaryColor) ? record.primaryColor : DEFAULT_PROPOSAL_DESIGN.primaryColor,
    accentColor: typeof record.accentColor === "string" && HEX_RE.test(record.accentColor) ? record.accentColor : DEFAULT_PROPOSAL_DESIGN.accentColor,
    fontStyle: stringOption(record.fontStyle, ["sans", "serif", "mono"], DEFAULT_PROPOSAL_DESIGN.fontStyle),
    layout: stringOption(record.layout, ["corporate", "minimal", "modern", "bold"], DEFAULT_PROPOSAL_DESIGN.layout),
    logoPosition: stringOption(record.logoPosition, ["left", "center", "right"], DEFAULT_PROPOSAL_DESIGN.logoPosition),
    showLogo: boolOption(record.showLogo, DEFAULT_PROPOSAL_DESIGN.showLogo),
    showProposalNo: boolOption(record.showProposalNo, DEFAULT_PROPOSAL_DESIGN.showProposalNo),
    showDate: boolOption(record.showDate, DEFAULT_PROPOSAL_DESIGN.showDate),
    showRecipient: boolOption(record.showRecipient, DEFAULT_PROPOSAL_DESIGN.showRecipient),
    showFooter: boolOption(record.showFooter, DEFAULT_PROPOSAL_DESIGN.showFooter),
  };
}

export function proposalDesignToJson(design: ProposalDesign): Prisma.InputJsonValue {
  return design as unknown as Prisma.InputJsonValue;
}

export function parseProposalDesign(value: unknown): ProposalDesign {
  return sanitizeProposalDesign(value);
}

type ProposalBrandKitRow = {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  fontStyle: string;
  layout: string;
  logoPosition: string;
  showLogo: boolean;
  showProposalNo: boolean;
  showDate: boolean;
  showRecipient: boolean;
  showFooter: boolean;
};

export async function getClientProposalDesign(clientId: string): Promise<ProposalDesign> {
  const [brandKit] = await prisma.$queryRaw<ProposalBrandKitRow[]>(Prisma.sql`
    SELECT
      "logoUrl",
      "primaryColor",
      "accentColor",
      "fontStyle",
      "layout",
      "logoPosition",
      "showLogo",
      "showProposalNo",
      "showDate",
      "showRecipient",
      "showFooter"
    FROM "proposal_brand_kits"
    WHERE "clientId" = ${clientId}
    LIMIT 1
  `);
  if (!brandKit) return DEFAULT_PROPOSAL_DESIGN;

  return sanitizeProposalDesign({
    logoUrl: brandKit.logoUrl,
    primaryColor: brandKit.primaryColor,
    accentColor: brandKit.accentColor,
    fontStyle: brandKit.fontStyle,
    layout: brandKit.layout,
    logoPosition: brandKit.logoPosition,
    showLogo: brandKit.showLogo,
    showProposalNo: brandKit.showProposalNo,
    showDate: brandKit.showDate,
    showRecipient: brandKit.showRecipient,
    showFooter: brandKit.showFooter,
  });
}

export async function upsertClientProposalDesign(clientId: string, raw: unknown): Promise<ProposalDesign> {
  const design = sanitizeProposalDesign(raw);
  const id = randomUUID();

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "proposal_brand_kits" (
      "id",
      "clientId",
      "logoUrl",
      "primaryColor",
      "accentColor",
      "fontStyle",
      "layout",
      "logoPosition",
      "showLogo",
      "showProposalNo",
      "showDate",
      "showRecipient",
      "showFooter",
      "updatedAt"
    ) VALUES (
      ${id},
      ${clientId},
      ${design.logoUrl},
      ${design.primaryColor},
      ${design.accentColor},
      ${design.fontStyle},
      ${design.layout},
      ${design.logoPosition},
      ${design.showLogo},
      ${design.showProposalNo},
      ${design.showDate},
      ${design.showRecipient},
      ${design.showFooter},
      NOW()
    )
    ON CONFLICT ("clientId") DO UPDATE SET
      "logoUrl" = EXCLUDED."logoUrl",
      "primaryColor" = EXCLUDED."primaryColor",
      "accentColor" = EXCLUDED."accentColor",
      "fontStyle" = EXCLUDED."fontStyle",
      "layout" = EXCLUDED."layout",
      "logoPosition" = EXCLUDED."logoPosition",
      "showLogo" = EXCLUDED."showLogo",
      "showProposalNo" = EXCLUDED."showProposalNo",
      "showDate" = EXCLUDED."showDate",
      "showRecipient" = EXCLUDED."showRecipient",
      "showFooter" = EXCLUDED."showFooter",
      "updatedAt" = NOW()
  `);

  return design;
}
