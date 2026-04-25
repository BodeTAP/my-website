import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketReplyToAdminEmail } from "@/lib/email";

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

  const [message, ticket] = await Promise.all([
    prisma.ticketMessage.create({
      data: { ticketId, senderId: userId, senderRole: "CLIENT", body: body.trim() },
    }),
    prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "OPEN", updatedAt: new Date() },
      include: { client: { include: { user: { select: { name: true } } } } },
    }),
  ]);

  // Notify admin about client reply
  const adminEmail = process.env.EMAIL_FROM;
  const clientName = ticket.client.user.name ?? ticket.client.businessName;
  if (adminEmail) {
    sendTicketReplyToAdminEmail(adminEmail, clientName, ticket.subject, body.trim(), ticketId)
      .catch(() => {});
  }

  return NextResponse.json(message, { status: 201 });
}
