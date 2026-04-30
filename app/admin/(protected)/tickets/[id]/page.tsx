import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCircle2 } from "lucide-react";
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

  const initialMessages = ticket.messages.map((m) => ({
    id: m.id,
    body: m.body,
    senderRole: m.senderRole,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] min-h-[650px] flex flex-col">
      <div className="mb-5 shrink-0">
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-2 text-pink-400/80 hover:text-pink-300 text-sm transition-colors font-semibold bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 glass rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl relative">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-pink-600/5 blur-[100px] pointer-events-none" />

        {/* Header Bar (WhatsApp Web style header) */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 ring-1 ring-pink-500/40 flex items-center justify-center shrink-0">
              <UserCircle2 className="w-7 h-7 text-pink-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none mb-1.5">{ticket.subject}</h1>
              <p className="text-blue-200/60 text-sm font-medium">
                {clientName} <span className="opacity-50 mx-1">·</span> {ticket.client.user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono text-blue-200/40">#{ticket.id.slice(-6)}</span>
            <Badge variant="outline" className={`${STATUS_COLOR[ticket.status]} px-3 py-1 text-[10px] uppercase tracking-wider font-bold`}>
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

        {/* Reply Box */}
        <AdminTicketReply ticketId={ticket.id} currentStatus={ticket.status} />
      </div>
    </div>
  );
}
