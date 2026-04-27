import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function GET() {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const forms = await prisma.onboardingForm.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { businessName: true } } },
  });
  return NextResponse.json(forms);
}

/** Generate a new onboarding link — optionally linked to a client */
export async function POST(req: Request) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
