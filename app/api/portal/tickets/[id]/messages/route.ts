import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: ticketId } = await params;
  const messages = await prisma.ticketMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: ticketId } = await params;
  const { body, userId } = await req.json();

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId,
      senderId: userId,
      senderRole: "CLIENT",
      body: body.trim(),
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "OPEN", updatedAt: new Date() },
  });

  return NextResponse.json(message, { status: 201 });
}
