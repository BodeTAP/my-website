import { NextResponse, after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTicketReplyToClientEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { sendWA, waMsg } from "@/lib/whatsapp";

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

  // Notify client about admin reply (email + in-app)
  const clientEmail = ticket.client.user.email;
  const clientName  = ticket.client.user.name ?? ticket.client.businessName;
  const preview     = body.trim().slice(0, 80) + (body.trim().length > 80 ? "…" : "");
  if (clientEmail) {
    sendTicketReplyToClientEmail(clientEmail, clientName, ticket.subject, body.trim()).catch(() => {});
  }
  createNotification(
    ticket.clientId,
    "TICKET_REPLY",
    "Balasan Tiket Baru",
    `Tim MFWEB membalas tiket "${ticket.subject}": ${preview}`,
    "/portal/tickets",
  ).catch(() => {});
  after(async () => {
    if (ticket.client.phone) {
      await sendWA(ticket.client.phone, waMsg.ticketReply(clientName, ticket.subject, preview));
    }
  });

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
