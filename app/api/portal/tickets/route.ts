import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, body } = await req.json();

  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Subject dan pesan wajib diisi" }, { status: 400 });
  }

  // Resolve clientId and userId from session — never trust body for ownership
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, client: { select: { id: true } } },
  });

  if (!user?.client) {
    return NextResponse.json({ error: "Akun klien tidak ditemukan" }, { status: 403 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      clientId: user.client.id,
      subject: subject.trim(),
      messages: {
        create: { senderId: user.id, senderRole: "CLIENT", body: body.trim() },
      },
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
