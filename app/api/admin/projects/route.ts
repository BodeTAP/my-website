import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId, name, description, status, deadline, liveUrl, notes } = await req.json();

  if (!clientId || !name?.trim()) {
    return NextResponse.json({ error: "Klien dan nama proyek wajib diisi." }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      clientId,
      name: name.trim(),
      description: description?.trim() || null,
      status: status ?? "DRAFTING",
      deadline: deadline ? new Date(deadline) : null,
      liveUrl: liveUrl?.trim() || null,
      notes: notes?.trim() || null,
    },
    include: { client: { include: { user: { select: { name: true, email: true } } } } },
  });

  return NextResponse.json(project, { status: 201 });
}
