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
  const { body } = await req.json();

  // Resolve userId from session — never trust body for ownership
  const user = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [message, ticket] = await Promise.all([
    prisma.ticketMessage.create({
      data: { ticketId, senderId: user.id, senderRole: "CLIENT", body: body.trim() },
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
