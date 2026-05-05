import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketReplyToAdminEmail } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

/** Resolve the authenticated client and verify they own the ticket */
async function getClientAndVerifyTicket(email: string, ticketId: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, client: { select: { id: true } } },
  });
  if (!user?.client) return null;

  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, clientId: user.client.id },
    include: { client: { include: { user: { select: { name: true } } } } },
  });
  return ticket ? { userId: user.id, clientId: user.client.id, ticket } : null;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: ticketId } = await params;

  // Verify ownership before returning messages
  const ownership = await getClientAndVerifyTicket(session.user.email, ticketId);
  if (!ownership) return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });

  const messages = await prisma.ticketMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: ticketId } = await params;

  // Verify ownership before allowing message creation
  const ownership = await getClientAndVerifyTicket(session.user.email, ticketId);
  if (!ownership) return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });

  const { userId, ticket } = ownership;

  const [message] = await Promise.all([
    prisma.ticketMessage.create({
      data: { ticketId, senderId: userId, senderRole: "CLIENT", body: body.trim().slice(0, 5000) },
    }),
    prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "OPEN", updatedAt: new Date() },
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
