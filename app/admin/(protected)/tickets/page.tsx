import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { TicketStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Headset, Clock, CheckCircle2, type LucideIcon } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import TicketSearch from "./TicketSearch";
import TicketFilter from "./TicketFilter";
import TicketPagination from "./TicketPagination";
import { requireModule } from "@/lib/permissions";

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; icon: LucideIcon }> = {
  OPEN: {
    label: "Terbuka",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    icon: MessageSquare,
  },
  IN_PROGRESS: {
    label: "Diproses",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: Clock,
  },
  CLOSED: {
    label: "Selesai",
    bg: "bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-600",
    icon: CheckCircle2,
  },
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireModule("tickets");
  const params = await searchParams;
  const q = params.q || "";
  const status = params.status || "";
  const page = Number(params.page || "1");
  const PER_PAGE = 10;

  const validStatuses = ["OPEN", "IN_PROGRESS", "CLOSED"] satisfies TicketStatus[];
  const finalStatus = validStatuses.includes(status as TicketStatus) ? (status as TicketStatus) : undefined;

  const where = {
    ...(q
      ? {
          OR: [
            { subject: { contains: q, mode: "insensitive" as const } },
            { client: { businessName: { contains: q, mode: "insensitive" as const } } },
            { client: { user: { email: { contains: q, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
    ...(finalStatus ? { status: finalStatus } : {}),
  };

  const [tickets, total, openTicketsCount] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        client: { include: { user: { select: { name: true, email: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.ticket.count({ where }),
    prisma.ticket.count({ where: { status: "OPEN" } })
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const startIdx = (page - 1) * PER_PAGE + 1;
  const endIdx = Math.min(page * PER_PAGE, total);

  return (
    <div>
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
              <Headset className="w-5 h-5 text-slate-700" />
            </div>
            Tiket Bantuan
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Anda memiliki <strong className="text-slate-900 font-semibold">{openTicketsCount} tiket terbuka</strong> yang membutuhkan respons.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs relative z-10">
          <TicketSearch />
          <TicketFilter />
        </div>
      </FadeUp>

      <StaggerChildren stagger={0.05} className="space-y-4 relative z-10">
        {tickets.length === 0 ? (
          <StaggerItem>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-16 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 shadow-2xs text-slate-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-slate-500 font-medium text-sm">Hore! Belum ada keluhan atau tiket bantuan masuk.</p>
            </div>
          </StaggerItem>
        ) : (
          tickets.map((t) => {
            const config = STATUS_CONFIG[t.status];
            const StatusIcon = config.icon;
            
            return (
              <StaggerItem key={t.id}>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all group relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center relative z-10">
                    
                    {/* Status Indicator */}
                    <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0 border ${config.border}`}>
                      <StatusIcon className={`w-5 h-5 ${config.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <Badge variant="outline" className={`${config.text} ${config.border} ${config.bg} px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold`}>
                          {config.label}
                        </Badge>
                        <span className="text-slate-400 text-xs font-mono">#{t.id.slice(-6)}</span>
                        <span className="text-slate-400 text-xs sm:hidden ml-auto">
                          {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(t.updatedAt))}
                        </span>
                      </div>
                      
                      <h3 className="text-slate-900 font-bold text-lg leading-tight mb-1 group-hover:text-slate-700 transition-colors truncate">
                        {t.subject}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <span className="font-semibold text-slate-700">{t.client.businessName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="truncate">{t.client.user.email}</span>
                      </div>
                      
                      {t.messages[0] && (
                        <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-slate-600 text-xs line-clamp-2 italic leading-relaxed">
                            &quot;{t.messages[0].body}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 shrink-0 mt-2 sm:mt-0">
                      <span className="text-slate-400 text-xs font-medium hidden sm:block">
                        {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(t.updatedAt))}
                      </span>
                      <Link href={`/admin/tickets/${t.id}`}>
                        <Button className="bg-[#1E242E] hover:bg-slate-800 text-white font-semibold rounded-xl h-10 px-5 shadow-xs transition-colors">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {t.status === "OPEN" ? "Beri Balasan" : "Lihat Obrolan"}
                        </Button>
                      </Link>
                    </div>

                  </div>
                </div>
              </StaggerItem>
            );
          })
        )}
      </StaggerChildren>

      {total > 0 && (
        <FadeUp delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:px-6 shadow-xs relative z-10 mt-6">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="text-slate-900 font-semibold">{startIdx}-{endIdx}</span> dari <span className="text-slate-900 font-semibold">{total}</span> tiket
            </p>
            <TicketPagination totalPages={totalPages} />
          </div>
        </FadeUp>
      )}
    </div>
  );
}
