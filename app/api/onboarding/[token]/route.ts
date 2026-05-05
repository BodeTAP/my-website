import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { token } = await params;
  const form = await prisma.onboardingForm.findUnique({
    where: { token },
    select: { token: true, status: true, businessName: true, clientId: true },
  });
  if (!form) return NextResponse.json({ error: "Link tidak valid." }, { status: 404 });
  return NextResponse.json(form);
}

/** Trim string or return null */
function s(v: unknown): string | null {
  return typeof v === "string" ? v.trim().slice(0, 1000) || null : null;
}

/** Validate URL — only allow http/https, block private IPs */
const PRIVATE_HOST_RE = [/^localhost$/i, /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./];
function safeUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  try {
    const u = new URL(v.trim());
    if (!["http:", "https:"].includes(u.protocol)) return null;
    if (PRIVATE_HOST_RE.some((r) => r.test(u.hostname))) return null;
    return u.toString().slice(0, 500);
  } catch { return null; }
}

export async function PATCH(req: Request, { params }: Params) {
  const { token } = await params;
  const form = await prisma.onboardingForm.findUnique({ where: { token } });
  if (!form) return NextResponse.json({ error: "Link tidak valid." }, { status: 404 });
  if (form.status === "COMPLETED") {
    return NextResponse.json({ error: "Form sudah pernah disubmit." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Request tidak valid." }, { status: 400 }); }

  // Validate referenceUrls — only allow valid http/https URLs
  const rawRefs = Array.isArray(body.referenceUrls) ? body.referenceUrls : null;
  const referenceUrls = rawRefs
    ? rawRefs.map(safeUrl).filter((u): u is string => u !== null).slice(0, 10)
    : form.referenceUrls;

  // Validate featuresWanted — only allow string array
  const rawFeatures = Array.isArray(body.featuresWanted) ? body.featuresWanted : null;
  const featuresWanted = rawFeatures
    ? rawFeatures.filter((f): f is string => typeof f === "string").map((f) => f.trim().slice(0, 100)).slice(0, 20)
    : form.featuresWanted;

  // Validate deadline
  let deadline = form.deadline;
  if (body.deadline) {
    const d = new Date(body.deadline as string);
    deadline = isNaN(d.getTime()) ? form.deadline : d;
  }

  const updated = await prisma.onboardingForm.update({
    where: { token },
    data: {
      businessName:   s(body.businessName)   ?? form.businessName,
      industryType:   s(body.industryType)   ?? form.industryType,
      businessDesc:   s(body.businessDesc)   ?? form.businessDesc,
      targetAudience: s(body.targetAudience) ?? form.targetAudience,
      websiteType:    s(body.websiteType)    ?? form.websiteType,
      referenceUrls,
      featuresWanted,
      colorStyle:     s(body.colorStyle)     ?? form.colorStyle,
      // logoUrl & driveLink: validate as URL
      logoUrl:        safeUrl(body.logoUrl)  ?? form.logoUrl,
      driveLink:      safeUrl(body.driveLink) ?? form.driveLink,
      instagram:      s(body.instagram)      ?? form.instagram,
      facebook:       s(body.facebook)       ?? form.facebook,
      tiktok:         s(body.tiktok)         ?? form.tiktok,
      hasDomain:      typeof body.hasDomain === "boolean" ? body.hasDomain : form.hasDomain,
      domainName:     s(body.domainName)     ?? form.domainName,
      deadline,
      notes:          s(body.notes)          ?? form.notes,
      status:         body.submit === true ? "COMPLETED" : form.status,
    },
  });
  return NextResponse.json(updated);
}
