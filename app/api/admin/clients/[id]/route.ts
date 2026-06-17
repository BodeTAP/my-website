import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
const CLIENT_STATUSES = ["ACTIVE", "FOLLOW_UP", "INACTIVE", "CHURNED"] as const;
const CONTACT_PREFERENCES = ["WHATSAPP", "EMAIL", "PHONE"] as const;
type ClientStatusValue = (typeof CLIENT_STATUSES)[number];
type ContactPreferenceValue = (typeof CONTACT_PREFERENCES)[number];

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") return null;
  return session;
}

function cleanText(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  return value.trim() || null;
}

function cleanRequiredText(value: unknown) {
  if (typeof value !== "string") return undefined;
  return value.trim();
}

function cleanTags(value: unknown) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 12),
    ),
  );
}

function cleanDate(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function isClientStatus(value: unknown): value is ClientStatusValue {
  return typeof value === "string" && CLIENT_STATUSES.includes(value as ClientStatusValue);
}

function isContactPreference(value: unknown): value is ContactPreferenceValue {
  return typeof value === "string" && CONTACT_PREFERENCES.includes(value as ContactPreferenceValue);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("clients");
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json();
  const tags = cleanTags(body.tags);
  const status = isClientStatus(body.status) ? body.status : undefined;
  const preferredContact = isContactPreference(body.preferredContact) ? body.preferredContact : undefined;
  const lastContactedAt = cleanDate(body.lastContactedAt);
  const accountManagerId = cleanText(body.accountManagerId);
  const businessName = cleanRequiredText(body.businessName);

  if (body.businessName !== undefined && !businessName) {
    return NextResponse.json({ error: "Nama bisnis wajib diisi" }, { status: 400 });
  }

  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(businessName !== undefined && { businessName }),
      ...(status !== undefined && { status }),
      ...(cleanText(body.phone) !== undefined && { phone: cleanText(body.phone) }),
      ...(cleanText(body.alternatePhone) !== undefined && { alternatePhone: cleanText(body.alternatePhone) }),
      ...(cleanText(body.picName) !== undefined && { picName: cleanText(body.picName) }),
      ...(cleanText(body.picRole) !== undefined && { picRole: cleanText(body.picRole) }),
      ...(cleanText(body.billingEmail) !== undefined && { billingEmail: cleanText(body.billingEmail) }),
      ...(cleanText(body.address) !== undefined && { address: cleanText(body.address) }),
      ...(cleanText(body.city) !== undefined && { city: cleanText(body.city) }),
      ...(cleanText(body.province) !== undefined && { province: cleanText(body.province) }),
      ...(preferredContact !== undefined && { preferredContact }),
      ...(cleanText(body.contactHours) !== undefined && { contactHours: cleanText(body.contactHours) }),
      ...(cleanText(body.source) !== undefined && { source: cleanText(body.source) }),
      ...(tags !== undefined && { tags }),
      ...(cleanText(body.internalNotes) !== undefined && { internalNotes: cleanText(body.internalNotes) }),
      ...(accountManagerId !== undefined && { accountManagerId }),
      ...(lastContactedAt !== undefined && { lastContactedAt }),
    },
    include: {
      user: { select: { name: true, email: true } },
      accountManager: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(client);
}
