import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import AdminTicketThread from "./AdminTicketThread";
import AdminTicketReply from "./AdminTicketReply";

type Props = { params: Promise<{ id: string }> };

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-sky-50 text-sky-700 border-sky-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
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
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm transition-colors font-semibold bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Kembali
        </Link>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col shadow-xs relative">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs text-slate-600">
              <UserCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none mb-1.5">{ticket.subject}</h1>
              <p className="text-slate-500 text-sm font-medium">
                {clientName} <span className="opacity-50 mx-1">·</span> {ticket.client.user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono text-slate-400">#{ticket.id.slice(-6)}</span>
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
