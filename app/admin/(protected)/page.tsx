import { prisma } from "@/lib/prisma";
import {
  Users, FileText, Briefcase, MessageSquare,
  TrendingUp, AlertCircle, Repeat2, ChevronRight,
} from "lucide-react";
import Link from "next/link";

function formatRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000)         return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1)   return "baru saja";
  if (minutes < 60)  return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30)     return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bln lalu`;
}

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    articles, projects, openTickets, recentLeads,
    paidMonthAgg, unpaidAgg,
    leadNew, leadFollowup, leadDeal, leadClosed,
    activeSubs,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.project.count({ where: { status: { not: "LIVE" } } }),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID", updatedAt: { gte: startOfMonth } } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "UNPAID" } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: "FOLLOWUP" } }),
    prisma.lead.count({ where: { status: "DEAL" } }),
    prisma.lead.count({ where: { status: "CLOSED" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }).catch(() => 0),
  ]);

  const paidAmount   = paidMonthAgg._sum.amount ?? 0;
  const unpaidAmount = unpaidAgg._sum.amount ?? 0;
  const totalLeads   = leadNew + leadFollowup + leadDeal + leadClosed;
  const convRate     = totalLeads > 0 ? Math.round((leadDeal / totalLeads) * 100) : 0;

  const monthName = now.toLocaleDateString("id-ID", { month: "long" });

  const pipeline = [
    { label: "Baru",       count: leadNew,      color: "bg-blue-500",    text: "text-blue-400",    href: "/admin/leads" },
    { label: "Follow-up",  count: leadFollowup,  color: "bg-amber-500",   text: "text-amber-400",   href: "/admin/leads" },
    { label: "Deal",       count: leadDeal,      color: "bg-green-500",   text: "text-green-400",   href: "/admin/leads" },
    { label: "Selesai",    count: leadClosed,    color: "bg-white/20",    text: "text-blue-200/50", href: "/admin/leads" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-blue-200/50 text-sm mt-1">Selamat datang kembali, Admin.</p>
      </div>

      {/* Row 1 — Operations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {[
          { label: "Leads Baru",    value: leadNew,      icon: Users,         color: "text-blue-400",   bg: "bg-blue-500/10",   href: "/admin/leads"    },
          { label: "Proyek Aktif",  value: projects,     icon: Briefcase,     color: "text-amber-400",  bg: "bg-amber-500/10",  href: "/admin/projects" },
          { label: "Tiket Terbuka", value: openTickets,  icon: MessageSquare, color: "text-green-400",  bg: "bg-green-500/10",  href: "/admin/tickets"  },
          { label: "Total Artikel", value: articles,     icon: FileText,      color: "text-violet-400", bg: "bg-violet-500/10", href: "/admin/articles" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <div className="glass rounded-2xl p-4 sm:p-5 group-hover:border-white/15 transition-colors">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-blue-200/50 text-xs sm:text-sm">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Row 2 — Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-blue-200/50 text-sm">Revenue {monthName}</span>
          </div>
          <div className="text-2xl font-bold text-teal-400">{formatRp(paidAmount)}</div>
          <div className="text-blue-200/30 text-xs mt-1">Invoice lunas bulan ini</div>
        </div>

        <div className="glass rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-blue-200/50 text-sm">Tagihan Pending</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">{formatRp(unpaidAmount)}</div>
          <Link href="/admin/invoices" className="text-blue-200/30 text-xs mt-1 hover:text-blue-300 transition-colors block">
            Lihat semua invoice →
          </Link>
        </div>

        <div className="glass rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Repeat2 className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-blue-200/50 text-sm">Maintenance Aktif</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{activeSubs}</div>
          <Link href="/admin/maintenance" className="text-blue-200/30 text-xs mt-1 hover:text-blue-300 transition-colors block">
            Kelola langganan →
          </Link>
        </div>
      </div>

      {/* Row 3 — Leads + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent leads */}
        <div className="lg:col-span-3 glass rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Leads Terbaru</h2>
            <Link href="/admin/leads" className="text-blue-400/70 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors">
              Lihat semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-blue-200/40 text-sm">Belum ada leads masuk.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {recentLeads.map((l) => (
                <div key={l.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{l.name}</p>
                    <p className="text-blue-200/50 text-xs truncate">
                      {l.businessName} · {l.whatsapp}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      l.status === "NEW"      ? "bg-blue-500/15 text-blue-300"
                      : l.status === "FOLLOWUP" ? "bg-amber-500/15 text-amber-300"
                      : l.status === "DEAL"   ? "bg-green-500/15 text-green-300"
                      : "bg-white/5 text-blue-200/50"
                    }`}>
                      {l.status === "NEW" ? "Baru" : l.status === "FOLLOWUP" ? "Follow-up" : l.status === "DEAL" ? "Deal" : "Selesai"}
                    </span>
                    <span className="text-blue-200/30 text-[11px]">{timeAgo(l.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lead pipeline */}
        <div className="lg:col-span-2 glass rounded-2xl p-4 sm:p-6">
          <h2 className="text-white font-semibold mb-1">Pipeline Lead</h2>
          <p className="text-blue-200/40 text-xs mb-5">Total {totalLeads} lead masuk</p>
          <div className="space-y-4">
            {pipeline.map((p) => (
              <div key={p.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-blue-200/70 text-xs">{p.label}</span>
                  <span className={`text-sm font-bold ${p.text}`}>{p.count}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${p.color} rounded-full transition-all`}
                    style={{ width: totalLeads > 0 ? `${(p.count / totalLeads) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {totalLeads > 0 && (
            <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-200/40 text-xs mb-0.5">Conversion rate</p>
                <p className="text-white font-bold text-2xl">{convRate}%</p>
                <p className="text-blue-200/30 text-[11px]">lead → deal</p>
              </div>
              <div>
                <p className="text-blue-200/40 text-xs mb-0.5">Aktif</p>
                <p className="text-white font-bold text-2xl">{leadNew + leadFollowup}</p>
                <p className="text-blue-200/30 text-[11px]">perlu tindak lanjut</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
