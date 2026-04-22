import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  CLOSED: "bg-white/5 text-blue-200/40 border-white/10",
};

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: {
      client: { include: { user: { select: { name: true, email: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Tiket Dukungan</h1>
        <p className="text-blue-200/50 text-sm mt-1">
          {tickets.filter((t) => t.status === "OPEN").length} tiket terbuka
        </p>
      </div>

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-blue-200/30">
            Belum ada tiket dukungan
          </div>
        ) : (
          tickets.map((t) => (
            <div key={t.id} className="glass rounded-2xl p-5 hover:border-blue-500/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant="outline" className={STATUS_COLOR[t.status]}>
                      {t.status === "OPEN" ? "Terbuka" : t.status === "IN_PROGRESS" ? "Diproses" : "Selesai"}
                    </Badge>
                    <span className="text-blue-200/30 text-xs">#{t.id.slice(-6)}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{t.subject}</h3>
                  <p className="text-blue-200/50 text-xs">
                    {t.client.businessName} · {t.client.user.email}
                  </p>
                  {t.messages[0] && (
                    <p className="text-blue-200/40 text-xs mt-2 line-clamp-1">
                      {t.messages[0].body}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-blue-200/30 text-xs">
                    {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(t.updatedAt))}
                  </span>
                  <Link href={`/admin/tickets/${t.id}`}>
                    <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-8 px-3">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      Balas
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
