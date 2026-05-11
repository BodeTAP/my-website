import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("clients");
  if (denied) return denied;

  const forms = await prisma.onboardingForm.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { businessName: true } } },
  });
  return NextResponse.json(forms);
}

/** Generate a new onboarding link — optionally linked to a client */
export async function POST(req: Request) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("clients");
  if (denied) return denied;

  const { clientId } = await req.json();

  const client = clientId
    ? await prisma.client.findUnique({ where: { id: clientId }, select: { businessName: true } })
    : null;

  const form = await prisma.onboardingForm.create({
    data: {
      clientId: clientId || null,
      businessName: client?.businessName || null,
    },
  });
  return NextResponse.json(form, { status: 201 });
}
