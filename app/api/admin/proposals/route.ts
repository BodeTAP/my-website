import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const proposals = await prisma.proposal.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: { select: { id: true, name: true, status: true } } },
  });
  return NextResponse.json(proposals);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    leadId, clientName, businessName, whatsapp,
    packageType, packageLabel, addons, customItems,
    basePrice, totalPrice, timeline, validUntil, notes,
  } = body;

  if (!clientName || !businessName || !packageType || !packageLabel || !basePrice || !totalPrice) {
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const count = await prisma.proposal.count();
  const date  = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const proposalNo = `PRO-${date}-${String(count + 1).padStart(3, "0")}`;

  const proposal = await prisma.proposal.create({
    data: {
      proposalNo,
      leadId: leadId || null,
      clientName,
      businessName,
      whatsapp: whatsapp || null,
      packageType,
      packageLabel,
      addons: addons ?? [],
      customItems: customItems ?? [],
      basePrice,
      totalPrice,
      timeline: timeline || "2-3 minggu",
      validUntil: validUntil ? new Date(validUntil) : null,
      notes: notes || null,
    },
  });

  return NextResponse.json(proposal, { status: 201 });
}
