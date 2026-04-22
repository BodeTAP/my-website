import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId, subject, body, userId } = await req.json();

  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Subject dan pesan wajib diisi" }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      clientId,
      subject: subject.trim(),
      messages: {
        create: { senderId: userId, senderRole: "CLIENT", body: body.trim() },
      },
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
