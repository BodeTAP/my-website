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
  const { status, liveUrl, deadline, notes } = await req.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(liveUrl !== undefined && { liveUrl: liveUrl || null }),
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(notes !== undefined && { notes: notes || null }),
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
