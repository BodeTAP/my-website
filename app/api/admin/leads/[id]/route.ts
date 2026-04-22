import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: { status: body.status, notes: body.notes },
    });
    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
