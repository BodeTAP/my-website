import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { phone, businessName, address } = await req.json();

  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(phone        !== undefined && { phone: phone?.trim() || null }),
      ...(businessName !== undefined && { businessName: businessName.trim() }),
      ...(address      !== undefined && { address: address?.trim() || null }),
    },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json(client);
}
