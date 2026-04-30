import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Headset, Clock, CheckCircle2 } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; icon: any }> = {
  OPEN: {
    label: "Terbuka",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    icon: MessageSquare,
  },
  IN_PROGRESS: {
    label: "Diproses",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    icon: Clock,
  },
  CLOSED: {
    label: "Selesai",
    bg: "bg-white/5",
    border: "border-white/10",
    text: "text-blue-200/40",
    icon: CheckCircle2,
  },
};

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: {
      client: { include: { user: { select: { name: true, email: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const openTickets = tickets.filter((t) => t.status === "OPEN").length;

  return (
    <div>
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-600/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-pink-500/10 flex items-center justify-center ring-1 ring-pink-500/20">
              <Headset className="w-5 h-5 text-pink-400" />
            </div>
            Tiket Bantuan
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">
            Anda memiliki <strong className="text-pink-400">{openTickets} tiket terbuka</strong> yang membutuhkan respons.
          </p>
        </div>
      </FadeUp>

      <StaggerChildren stagger={0.05} className="space-y-4 relative z-10">
        {tickets.length === 0 ? (
          <StaggerItem>
            <div className="glass rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-200/20" />
              </div>
              <p className="text-blue-200/50 font-medium">Hore! Belum ada keluhan atau tiket bantuan masuk.</p>
            </div>
          </StaggerItem>
        ) : (
          tickets.map((t) => {
            const config = STATUS_CONFIG[t.status];
            const StatusIcon = config.icon;
            
            return (
              <StaggerItem key={t.id}>
                <div className={`glass rounded-2xl p-5 sm:p-6 border border-white/5 hover:border-pink-500/30 hover:bg-white/5 transition-all group relative overflow-hidden`}>
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/0 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center relative z-10">
                    
                    {/* Status Indicator */}
                    <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0 ring-1 ${config.border}`}>
                      <StatusIcon className={`w-5 h-5 ${config.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <Badge variant="outline" className={`${config.text} ${config.border} ${config.bg} px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold`}>
                          {config.label}
                        </Badge>
                        <span className="text-blue-200/30 text-xs font-mono">#{t.id.slice(-6)}</span>
                        <span className="text-blue-200/30 text-xs sm:hidden ml-auto">
                          {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(t.updatedAt))}
                        </span>
                      </div>
                      
                      <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-pink-300 transition-colors truncate">
                        {t.subject}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-blue-200/50 text-xs">
                        <span className="font-semibold text-blue-200/70">{t.client.businessName}</span>
                        <span className="w-1 h-1 rounded-full bg-blue-200/20" />
                        <span className="truncate">{t.client.user.email}</span>
                      </div>
                      
                      {t.messages[0] && (
                        <div className="mt-3 bg-black/20 p-3 rounded-xl border border-white/5">
                          <p className="text-blue-200/60 text-xs line-clamp-2 italic leading-relaxed">
                            "{t.messages[0].body}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 shrink-0 mt-2 sm:mt-0">
                      <span className="text-blue-200/40 text-xs font-medium hidden sm:block">
                        {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(t.updatedAt))}
                      </span>
                      <Link href={`/admin/tickets/${t.id}`}>
                        <Button className="bg-pink-600/10 hover:bg-pink-500 text-pink-400 hover:text-white border border-pink-500/20 shadow-none hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all px-6 h-10">
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
    </div>
  );
}
