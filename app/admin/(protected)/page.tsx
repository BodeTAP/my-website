import { prisma } from "@/lib/prisma";
import { Users, FileText, Briefcase, MessageSquare } from "lucide-react";

export default async function AdminDashboard() {
  const [leads, articles, projects, tickets] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.article.count(),
    prisma.project.count({ where: { status: { not: "LIVE" } } }),
    prisma.ticket.count({ where: { status: "OPEN" } }),
  ]);

  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Leads Baru", value: leads, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Artikel", value: articles, icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Proyek Aktif", value: projects, icon: Briefcase, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Tiket Terbuka", value: tickets, icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-blue-200/50 text-sm mt-1">Selamat datang kembali, Admin.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 sm:p-5">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3 sm:mb-4`}>
              <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-blue-200/50 text-xs sm:text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent leads */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <h2 className="text-white font-semibold mb-4">Leads Terbaru</h2>
        {recentLeads.length === 0 ? (
          <p className="text-blue-200/40 text-sm">Belum ada leads masuk.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {recentLeads.map((l) => (
              <div key={l.id} className="py-3 flex items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{l.name}</p>
                  <p className="text-blue-200/50 text-xs truncate">{l.businessName} · {l.whatsapp}</p>
                </div>
                <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                  l.status === "NEW"
                    ? "bg-blue-500/15 text-blue-300"
                    : l.status === "FOLLOWUP"
                    ? "bg-amber-500/15 text-amber-300"
                    : l.status === "DEAL"
                    ? "bg-green-500/15 text-green-300"
                    : "bg-white/5 text-blue-200/50"
                }`}>
                  {l.status === "NEW" ? "Baru" : l.status === "FOLLOWUP" ? "Follow-up" : l.status === "DEAL" ? "Deal" : "Selesai"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
