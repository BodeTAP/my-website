import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketReplyToClientEmail } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: ticketId } = await params;
  const messages = await prisma.ticketMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: ticketId } = await params;
  const { body, status } = await req.json();

  const user = await prisma.user.findUnique({ where: { email: session.user!.email! } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 400 });

  const [message, ticket] = await Promise.all([
    prisma.ticketMessage.create({
      data: { ticketId, senderId: user.id, senderRole: "ADMIN", body: body.trim() },
    }),
    prisma.ticket.update({
      where: { id: ticketId },
      data: { status: status ?? "IN_PROGRESS", updatedAt: new Date() },
      include: { client: { include: { user: { select: { name: true, email: true } } } } },
    }),
  ]);

  // Notify client about admin reply
  const clientEmail = ticket.client.user.email;
  const clientName  = ticket.client.user.name ?? ticket.client.businessName;
  if (clientEmail) {
    sendTicketReplyToClientEmail(clientEmail, clientName, ticket.subject, body.trim()).catch(() => {});
  }

  return NextResponse.json(message, { status: 201 });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: ticketId } = await params;
  const { status } = await req.json();

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  });

  return NextResponse.json(ticket);
}
