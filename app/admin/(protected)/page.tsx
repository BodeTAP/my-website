import { prisma } from "@/lib/prisma";
import {
  Users, FileText, Briefcase, MessageSquare,
  TrendingUp, AlertCircle, Repeat2, ChevronRight,
  PlusCircle, LayoutDashboard, Rocket, BarChart3
} from "lucide-react";
import Link from "next/link";
import { FadeUp, StaggerChildren, StaggerItem, CountUp } from "@/components/public/motion";

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
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const hour = (now.getUTCHours() + 7) % 24; // WIB = UTC+7
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  const [
    articles, projects, openTickets, recentLeads,
    paidMonthAgg, unpaidAgg, recentPaidInvoices,
    leadNew, leadFollowup, leadDeal, leadClosed,
    activeSubs,
    tripayStatus, tripayLastAlert,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.project.count({ where: { status: { not: "LIVE" } } }),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID", updatedAt: { gte: startOfMonth } } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "UNPAID" } }),
    prisma.invoice.findMany({ where: { status: "PAID", updatedAt: { gte: sixMonthsAgo } }, select: { amount: true, updatedAt: true } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: "FOLLOWUP" } }),
    prisma.lead.count({ where: { status: "DEAL" } }),
    prisma.lead.count({ where: { status: "CLOSED" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.siteSetting.findUnique({ where: { key: "tripay_health_status" } }),
    prisma.siteSetting.findUnique({ where: { key: "tripay_last_alert_at" } }),
  ]);

  const paidAmount   = paidMonthAgg._sum.amount ?? 0;
  const unpaidAmount = unpaidAgg._sum.amount ?? 0;
  const totalLeads   = leadNew + leadFollowup + leadDeal + leadClosed;
  const convRate     = totalLeads > 0 ? Math.round((leadDeal / totalLeads) * 100) : 0;

  const monthName = now.toLocaleDateString("id-ID", { month: "long" });

  const pipeline = [
    { label: "Baru",       count: leadNew,      color: "bg-blue-500",    text: "text-blue-400",    href: "/admin/leads" },
    { label: "Follow-up",  count: leadFollowup, color: "bg-amber-500",   text: "text-amber-400",   href: "/admin/leads" },
    { label: "Deal",       count: leadDeal,      color: "bg-green-500",   text: "text-green-400",   href: "/admin/leads" },
    { label: "Selesai",    count: leadClosed,    color: "bg-white/20",    text: "text-blue-200/50", href: "/admin/leads" },
  ];

  // Prepare Chart Data
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthStr = d.toLocaleDateString("id-ID", { month: "short" });
    const amount = recentPaidInvoices
      .filter(inv => inv.updatedAt.getMonth() === d.getMonth() && inv.updatedAt.getFullYear() === d.getFullYear())
      .reduce((sum, inv) => sum + inv.amount, 0);
    return { month: monthStr, amount, rawDate: d };
  });
  
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  return (
    <div>
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            Dashboard Utama
          </h1>
          <p className="text-blue-200/60 text-sm mt-1">{greeting}, Admin MFWEB.</p>
        </div>
        
        {/* Health Widget */}
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-3 px-4 py-2 glass rounded-xl border border-white/10 self-start sm:self-center shadow-lg">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${tripayStatus?.value === "ok" ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`} />
            <span className="text-[11px] font-bold tracking-wide uppercase text-white/80">
              Tripay: {tripayStatus?.value === "ok" ? "Aman" : "Gangguan"}
            </span>
            {tripayLastAlert && (
              <span className="text-[10px] text-blue-200/40 border-l border-white/10 pl-3">
                Cek: {timeAgo(new Date(tripayLastAlert.value))}
              </span>
            )}
          </div>
        </div>
      </FadeUp>

      <StaggerChildren stagger={0.05}>
        {/* Row 1 — Operations */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Leads Baru",    value: leadNew,      icon: Users,         color: "text-blue-400",   bg: "bg-blue-500/10", border: "hover:border-blue-500/50",   glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]", href: "/admin/leads"    },
            { label: "Proyek Aktif",  value: projects,     icon: Briefcase,     color: "text-amber-400",  bg: "bg-amber-500/10", border: "hover:border-amber-500/50", glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]", href: "/admin/projects" },
            { label: "Tiket Terbuka", value: openTickets,  icon: MessageSquare, color: "text-green-400",  bg: "bg-green-500/10", border: "hover:border-green-500/50", glow: "group-hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]", href: "/admin/tickets"  },
            { label: "Total Artikel", value: articles,     icon: FileText,      color: "text-violet-400", bg: "bg-violet-500/10", border: "hover:border-violet-500/50", glow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]", href: "/admin/articles" },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <Link href={s.href} className="group block h-full">
                <div className={`glass h-full rounded-3xl p-5 border border-white/5 transition-all duration-300 ${s.border} ${s.glow} relative overflow-hidden`}>
                  <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-[30px] opacity-20 ${s.bg} transition-opacity group-hover:opacity-100`} />
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4 relative z-10 ring-1 ring-white/5`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 tracking-tight relative z-10">
                    <CountUp from={0} to={s.value} />
                  </div>
                  <div className="text-blue-200/50 text-xs sm:text-sm font-medium relative z-10">{s.label}</div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </div>

        {/* Row 2 — Chart & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          
          {/* Revenue Chart */}
          <StaggerItem className="lg:col-span-2">
            <div className="glass rounded-3xl p-5 sm:p-7 border border-white/5 relative overflow-hidden h-full flex flex-col group">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-teal-500/20 transition-colors duration-700" />
              
              <div className="flex items-start justify-between relative z-10 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-teal-400" />
                    <h2 className="text-white font-bold text-lg tracking-tight">Tren Pendapatan</h2>
                  </div>
                  <p className="text-blue-200/50 text-sm">Grafik penerimaan 6 bulan terakhir</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-teal-400 tracking-tight">{formatRp(paidAmount)}</p>
                  <p className="text-teal-400/60 text-xs font-medium uppercase tracking-wider mt-1">Bulan {monthName}</p>
                </div>
              </div>

              {/* Pure CSS Bar Chart */}
              <div className="flex-1 min-h-[160px] flex items-end gap-2 sm:gap-4 mt-auto relative z-10 pt-4">
                {/* Horizontal guide lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="w-full h-px bg-white/20 border-dashed border-t" />
                  <div className="w-full h-px bg-white/20 border-dashed border-t" />
                  <div className="w-full h-px bg-white/20 border-dashed border-t" />
                </div>
                
                {chartData.map((d, i) => {
                  const isCurrentMonth = i === chartData.length - 1;
                  const heightPercent = maxAmount === 1 ? 0 : Math.max((d.amount / maxAmount) * 100, 2);
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-3 relative group/bar cursor-default">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-[#020611] border border-white/10 text-white text-xs py-1 px-2.5 rounded-lg whitespace-nowrap z-20 pointer-events-none shadow-xl">
                        {formatRp(d.amount)}
                      </div>
                      
                      <div className="w-full relative h-32 sm:h-40 flex items-end">
                        <div 
                          className={`w-full rounded-t-md transition-all duration-1000 ease-out relative overflow-hidden group-hover/bar:brightness-125
                            ${isCurrentMonth ? 'bg-gradient-to-t from-teal-500/20 to-teal-400/80 shadow-[0_0_15px_rgba(45,212,191,0.2)]' : 'bg-gradient-to-t from-white/5 to-white/20'}`}
                          style={{ height: `${heightPercent}%` }}
                        >
                          <div className={`absolute top-0 inset-x-0 h-1 sm:h-1.5 opacity-50 ${isCurrentMonth ? 'bg-white' : 'bg-white/40'}`} />
                        </div>
                      </div>
                      <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${isCurrentMonth ? 'text-teal-400' : 'text-blue-200/40'}`}>
                        {d.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </StaggerItem>

          {/* Right Column Metrics */}
          <div className="flex flex-col gap-4 h-full">
            <StaggerItem className="flex-1">
              <div className="glass rounded-3xl p-5 border border-white/5 relative overflow-hidden group h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-orange-500/20 transition-colors duration-700" />
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-blue-200/60 font-medium text-sm">Tagihan Pending</span>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight relative z-10 mb-1">{formatRp(unpaidAmount)}</div>
                <Link href="/admin/invoices" className="text-blue-400 text-xs hover:text-blue-300 transition-colors inline-flex items-center gap-1 relative z-10 mt-auto pt-2">
                  Lihat semua tagihan <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem className="flex-1">
              <div className="glass rounded-3xl p-5 border border-white/5 relative overflow-hidden group h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-700" />
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20 flex items-center justify-center shrink-0">
                    <Repeat2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-blue-200/60 font-medium text-sm">Maintenance Aktif (WaaS)</span>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight relative z-10 mb-1">
                  <CountUp from={0} to={activeSubs} /> <span className="text-blue-200/30 text-lg font-normal">Klien</span>
                </div>
                <Link href="/admin/maintenance" className="text-purple-400 text-xs hover:text-purple-300 transition-colors inline-flex items-center gap-1 relative z-10 mt-auto pt-2">
                  Kelola langganan <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </StaggerItem>
          </div>
        </div>

        {/* Row 3 — Leads + Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          
          {/* Recent leads */}
          <StaggerItem className="lg:col-span-3">
            <div className="glass rounded-3xl p-6 sm:p-8 h-full border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-blue-400" />
                  </div>
                  <h2 className="text-white font-bold text-lg">Leads Terbaru</h2>
                </div>
                <Link href="/admin/leads" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full">
                  Semua Leads <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              {recentLeads.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-2xl">
                  <p className="text-blue-200/40 text-sm">Belum ada leads masuk bulan ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((l) => (
                    <div key={l.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-between gap-4 group">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold truncate group-hover:text-blue-300 transition-colors">{l.name}</p>
                        <p className="text-blue-200/50 text-xs truncate mt-0.5 flex items-center gap-1.5">
                          <span>{l.businessName}</span>
                          <span className="w-1 h-1 rounded-full bg-blue-200/20" />
                          <span>{l.whatsapp}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          l.status === "NEW"      ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                          : l.status === "FOLLOWUP" ? "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                          : l.status === "DEAL"   ? "bg-green-500/20 text-green-400 border border-green-500/20"
                          : "bg-white/5 text-blue-200/40 border border-white/10"
                        }`}>
                          {l.status === "NEW" ? "Baru" : l.status === "FOLLOWUP" ? "Follow-up" : l.status === "DEAL" ? "Deal" : "Selesai"}
                        </span>
                        <span className="text-blue-200/30 text-[10px] font-medium">{timeAgo(l.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </StaggerItem>

          {/* Lead pipeline */}
          <StaggerItem className="lg:col-span-2">
            <div className="glass rounded-3xl p-6 sm:p-8 h-full border border-white/5 relative overflow-hidden">
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
              
              <h2 className="text-white font-bold text-lg mb-1 relative z-10">Pipeline Leads</h2>
              <p className="text-blue-200/50 text-sm mb-6 relative z-10">Total <strong className="text-blue-300">{totalLeads}</strong> leads tercatat di sistem.</p>
              
              <div className="space-y-5 relative z-10">
                {pipeline.map((p) => (
                  <div key={p.label}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-blue-200/70 text-sm font-medium">{p.label}</span>
                      <span className={`text-base font-bold ${p.text}`}>{p.count}</span>
                    </div>
                    <div className="h-2.5 bg-[#050b14] ring-1 ring-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${p.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: totalLeads > 0 ? `${(p.count / totalLeads) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {totalLeads > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-blue-200/50 text-xs font-medium mb-1 uppercase tracking-wider">Conversion Rate</p>
                    <p className="text-white font-bold text-3xl"><CountUp from={0} to={convRate} />%</p>
                    <p className="text-green-400 text-[10px] mt-1 font-semibold">LEAD → DEAL</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-blue-200/50 text-xs font-medium mb-1 uppercase tracking-wider">Leads Aktif</p>
                    <p className="text-white font-bold text-3xl"><CountUp from={0} to={leadNew + leadFollowup} /></p>
                    <p className="text-amber-400 text-[10px] mt-1 font-semibold">BUTUH TINDAK LANJUT</p>
                  </div>
                </div>
              )}
            </div>
          </StaggerItem>

        </div>
      </StaggerChildren>
    </div>
  );
}
