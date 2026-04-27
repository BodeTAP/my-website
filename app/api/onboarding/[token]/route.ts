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

export async function PATCH(req: Request, { params }: Params) {
  const { token } = await params;
  const form = await prisma.onboardingForm.findUnique({ where: { token } });
  if (!form) return NextResponse.json({ error: "Link tidak valid." }, { status: 404 });
  if (form.status === "COMPLETED") {
    return NextResponse.json({ error: "Form sudah pernah disubmit." }, { status: 400 });
  }

  const body = await req.json();
  const updated = await prisma.onboardingForm.update({
    where: { token },
    data: {
      businessName:   body.businessName   ?? form.businessName,
      industryType:   body.industryType   ?? form.industryType,
      businessDesc:   body.businessDesc   ?? form.businessDesc,
      targetAudience: body.targetAudience ?? form.targetAudience,
      websiteType:    body.websiteType    ?? form.websiteType,
      referenceUrls:  body.referenceUrls  ?? form.referenceUrls,
      featuresWanted: body.featuresWanted ?? form.featuresWanted,
      colorStyle:     body.colorStyle     ?? form.colorStyle,
      logoUrl:        body.logoUrl        ?? form.logoUrl,
      driveLink:      body.driveLink      ?? form.driveLink,
      instagram:      body.instagram      ?? form.instagram,
      facebook:       body.facebook       ?? form.facebook,
      tiktok:         body.tiktok         ?? form.tiktok,
      hasDomain:      body.hasDomain      ?? form.hasDomain,
      domainName:     body.domainName     ?? form.domainName,
      deadline:       body.deadline ? new Date(body.deadline) : form.deadline,
      notes:          body.notes          ?? form.notes,
      status:         body.submit ? "COMPLETED" : form.status,
    },
  });
  return NextResponse.json(updated);
}
