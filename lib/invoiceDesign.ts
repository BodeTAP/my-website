import "server-only";

import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type InvoiceDesign = {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  fontStyle: "sans" | "serif" | "mono";
  layout: "corporate" | "minimal" | "modern" | "premium";
  logoPosition: "left" | "center" | "right";
  showLogo: boolean;
  showInvoiceNo: boolean;
  showDueDate: boolean;
  showSender: boolean;
  showRecipient: boolean;
  showFooter: boolean;
};

export const DEFAULT_INVOICE_DESIGN: InvoiceDesign = {
  logoUrl: null,
  primaryColor: "#1d4ed8",
  accentColor: "#0d9488",
  fontStyle: "sans",
  layout: "corporate",
  logoPosition: "left",
  showLogo: true,
  showInvoiceNo: true,
  showDueDate: true,
  showSender: true,
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

export function sanitizeInvoiceDesign(value: unknown): InvoiceDesign {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    logoUrl: typeof record.logoUrl === "string" && record.logoUrl.trim() ? record.logoUrl.trim().slice(0, 500) : null,
    primaryColor: typeof record.primaryColor === "string" && HEX_RE.test(record.primaryColor) ? record.primaryColor : DEFAULT_INVOICE_DESIGN.primaryColor,
    accentColor: typeof record.accentColor === "string" && HEX_RE.test(record.accentColor) ? record.accentColor : DEFAULT_INVOICE_DESIGN.accentColor,
    fontStyle: stringOption(record.fontStyle, ["sans", "serif", "mono"], DEFAULT_INVOICE_DESIGN.fontStyle),
    layout: stringOption(record.layout, ["corporate", "minimal", "modern", "premium"], DEFAULT_INVOICE_DESIGN.layout),
    logoPosition: stringOption(record.logoPosition, ["left", "center", "right"], DEFAULT_INVOICE_DESIGN.logoPosition),
    showLogo: boolOption(record.showLogo, DEFAULT_INVOICE_DESIGN.showLogo),
    showInvoiceNo: boolOption(record.showInvoiceNo, DEFAULT_INVOICE_DESIGN.showInvoiceNo),
    showDueDate: boolOption(record.showDueDate, DEFAULT_INVOICE_DESIGN.showDueDate),
    showSender: boolOption(record.showSender, DEFAULT_INVOICE_DESIGN.showSender),
    showRecipient: boolOption(record.showRecipient, DEFAULT_INVOICE_DESIGN.showRecipient),
    showFooter: boolOption(record.showFooter, DEFAULT_INVOICE_DESIGN.showFooter),
  };
}

export function invoiceDesignToJson(design: InvoiceDesign): Prisma.InputJsonValue {
  return design as unknown as Prisma.InputJsonValue;
}

export function parseInvoiceDesign(value: unknown): InvoiceDesign {
  return sanitizeInvoiceDesign(value);
}

type InvoiceBrandKitRow = {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  fontStyle: string;
  layout: string;
  logoPosition: string;
  showLogo: boolean;
  showInvoiceNo: boolean;
  showDueDate: boolean;
  showSender: boolean;
  showRecipient: boolean;
  showFooter: boolean;
};

export async function getClientInvoiceDesign(clientId: string): Promise<InvoiceDesign> {
  const [brandKit] = await prisma.$queryRaw<InvoiceBrandKitRow[]>(Prisma.sql`
    SELECT
      "logoUrl",
      "primaryColor",
      "accentColor",
      "fontStyle",
      "layout",
      "logoPosition",
      "showLogo",
      "showInvoiceNo",
      "showDueDate",
      "showSender",
      "showRecipient",
      "showFooter"
    FROM "invoice_brand_kits"
    WHERE "clientId" = ${clientId}
    LIMIT 1
  `);
  if (!brandKit) return DEFAULT_INVOICE_DESIGN;

  return sanitizeInvoiceDesign(brandKit);
}

export async function upsertClientInvoiceDesign(clientId: string, raw: unknown): Promise<InvoiceDesign> {
  const design = sanitizeInvoiceDesign(raw);
  const id = randomUUID();

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "invoice_brand_kits" (
      "id",
      "clientId",
      "logoUrl",
      "primaryColor",
      "accentColor",
      "fontStyle",
      "layout",
      "logoPosition",
      "showLogo",
      "showInvoiceNo",
      "showDueDate",
      "showSender",
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
      ${design.showInvoiceNo},
      ${design.showDueDate},
      ${design.showSender},
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
      "showInvoiceNo" = EXCLUDED."showInvoiceNo",
      "showDueDate" = EXCLUDED."showDueDate",
      "showSender" = EXCLUDED."showSender",
      "showRecipient" = EXCLUDED."showRecipient",
      "showFooter" = EXCLUDED."showFooter",
      "updatedAt" = NOW()
  `);

  return design;
}
