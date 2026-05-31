import { NextResponse, after } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendTicketReplyToClientEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { sendWA } from "@/lib/whatsapp";
import { getSiteSettings, renderSettingTemplate, isWaNotifyEnabled } from "@/lib/siteSettings";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("tickets");
  if (denied) return denied;
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
  const denied = await requireApiPermission("tickets");
  if (denied) return denied;

  const { id: ticketId } = await params;
  const { body, status } = await req.json();

  if (typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "Isi balasan tidak boleh kosong" }, { status: 400 });
  }

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
  const settings = await getSiteSettings();
  createNotification(
    ticket.clientId,
    "TICKET_REPLY",
    "Balasan Tiket Baru",
    `Tim MFWEB membalas tiket "${ticket.subject}": ${preview}`,
    "/portal/tickets",
  ).catch((e) => console.error("[Notif] ticket reply:", e));

  after(async () => {
    if (clientEmail) {
      await sendTicketReplyToClientEmail(clientEmail, clientName, ticket.subject, body.trim())
        .catch((e) => console.error("[Email] ticket reply:", e));
    }
    if (ticket.client.phone) {
        if (isWaNotifyEnabled(settings, "wa_notify_ticket_reply")) {
          const message = settings.template_wa_ticket_reply
            ? renderSettingTemplate(settings.template_wa_ticket_reply, {
                brandName: settings.brand_name,
                clientName,
                ticketSubject: ticket.subject,
                messagePreview: preview,
                portalUrl: `${settings.brand_site_url}/portal/tickets`,
              })
            : `Halo ${clientName}! Tim ${settings.brand_name} telah membalas tiket Anda: ${ticket.subject}\n\n${preview}\n\nCek portal klien untuk balasan lengkap.`;
          await sendWA(ticket.client.phone, message);
        }
      }
  });

  return NextResponse.json(message, { status: 201 });
}

export async function PATCH(req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("tickets");
  if (denied) return denied;

  const { id: ticketId } = await params;
  const { status } = await req.json();

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  });

  return NextResponse.json(ticket);
}
