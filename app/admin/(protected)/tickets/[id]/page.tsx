import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import AdminTicketThread from "./AdminTicketThread";
import AdminTicketReply from "./AdminTicketReply";

type Props = { params: Promise<{ id: string }> };

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  CLOSED: "bg-white/5 text-blue-200/40 border-white/10",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Terbuka",
  IN_PROGRESS: "Diproses",
  CLOSED: "Selesai",
};

export default async function AdminTicketDetailPage({ params }: Props) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      client: { include: { user: { select: { name: true, email: true } } } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) notFound();

  const clientName = ticket.client.businessName;

  // Serialize dates to strings for client component
  const initialMessages = ticket.messages.map((m) => ({
    id: m.id,
    body: m.body,
    senderRole: m.senderRole,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/tickets"
          className="flex items-center gap-2 text-blue-400/60 hover:text-blue-300 text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar tiket
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
            <p className="text-blue-200/50 text-sm mt-1">
              {clientName} · {ticket.client.user.email}
            </p>
          </div>
          <Badge variant="outline" className={STATUS_COLOR[ticket.status]}>
            {STATUS_LABEL[ticket.status]}
          </Badge>
        </div>
      </div>

      {/* Live message thread */}
      <AdminTicketThread
        ticketId={ticket.id}
        initialMessages={initialMessages}
        clientName={clientName}
      />

      <AdminTicketReply ticketId={ticket.id} currentStatus={ticket.status} />
    </div>
  );
}
