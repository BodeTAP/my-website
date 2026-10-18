import { prisma } from "@/lib/prisma";
import {
  Users, FileText, Briefcase, MessageSquare,
  AlertCircle, Repeat2, ChevronRight,
  LayoutDashboard, Rocket, BarChart3
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

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const params = await searchParams;
  const isDenied = params.denied === "1";
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
    { label: "Baru",       count: leadNew,      color: "bg-slate-800",    text: "text-slate-900",   href: "/admin/leads" },
    { label: "Follow-up",  count: leadFollowup, color: "bg-amber-500",   text: "text-amber-700",   href: "/admin/leads" },
    { label: "Deal",       count: leadDeal,      color: "bg-emerald-600", text: "text-emerald-700", href: "/admin/leads" },
    { label: "Selesai",    count: leadClosed,    color: "bg-slate-400",    text: "text-slate-600",   href: "/admin/leads" },
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
    <div className="space-y-6">
      {isDenied && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <p className="text-sm font-semibold">Akses ditolak: Anda tidak memiliki izin untuk modul ini.</p>
        </div>
      )}

      {/* Header */}
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 sm:w-8 sm:h-8 text-slate-800" />
            Dashboard Utama
          </h1>
          <p className="text-slate-500 text-sm mt-1">{greeting}, Admin MFWEB.</p>
        </div>
        
        {/* Health Widget */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-2xs self-start sm:self-center">
            <div className={`w-2 h-2 rounded-full ${tripayStatus?.value === "ok" ? "bg-emerald-500 ring-4 ring-emerald-100" : "bg-rose-500 ring-4 ring-rose-100"}`} />
            <span className="text-xs font-semibold text-slate-700">
              Tripay: {tripayStatus?.value === "ok" ? "Aman" : "Gangguan"}
            </span>
            {tripayLastAlert && (
              <span className="text-[11px] text-slate-400 border-l border-slate-200 pl-2.5 font-medium">
                Cek: {timeAgo(new Date(tripayLastAlert.value))}
              </span>
            )}
          </div>
        </div>
      </FadeUp>

      <StaggerChildren stagger={0.05}>
        {/* Row 1 — Operations */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Leads Baru",    value: leadNew,      icon: Users,         color: "text-slate-800",   bg: "bg-slate-100",  href: "/admin/leads"    },
            { label: "Proyek Aktif",  value: projects,     icon: Briefcase,     color: "text-amber-700",  bg: "bg-amber-50",   href: "/admin/projects" },
            { label: "Tiket Terbuka", value: openTickets,  icon: MessageSquare, color: "text-emerald-700",bg: "bg-emerald-50", href: "/admin/tickets"  },
            { label: "Total Artikel", value: articles,     icon: FileText,      color: "text-indigo-700", bg: "bg-indigo-50",  href: "/admin/articles" },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <Link href={s.href} className="group block h-full">
                <div className="h-full rounded-2xl p-5 bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all duration-200">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
                    <CountUp from={0} to={s.value} />
                  </div>
                  <div className="text-slate-500 text-xs sm:text-sm font-medium">{s.label}</div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </div>

        {/* Row 2 — Chart & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Revenue Chart */}
          <StaggerItem className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs h-full flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-5 h-5 text-slate-800" />
                    <h2 className="text-slate-900 font-bold text-lg tracking-tight">Tren Pendapatan</h2>
                  </div>
                  <p className="text-slate-500 text-sm">Grafik penerimaan 6 bulan terakhir</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{formatRp(paidAmount)}</p>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">Bulan {monthName}</p>
                </div>
              </div>

              {/* Pure CSS Bar Chart */}
              <div className="flex-1 min-h-[170px] flex items-end gap-2 sm:gap-4 mt-auto relative pt-6 pb-1">
                {/* Horizontal guide lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                  <div className="w-full h-px border-t border-dashed border-slate-200" />
                  <div className="w-full h-px border-t border-dashed border-slate-200" />
                  <div className="w-full h-px border-t border-dashed border-slate-200" />
                </div>
                
                {chartData.map((d, i) => {
                  const isCurrentMonth = i === chartData.length - 1;
                  const heightPercent = maxAmount === 1 ? 0 : Math.max((d.amount / maxAmount) * 100, 3);
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-3 relative group/bar cursor-default z-10">
                      {/* Tooltip */}
                      <div className="absolute -top-9 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white text-xs font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap z-20 pointer-events-none shadow-md">
                        {formatRp(d.amount)}
                      </div>
                      
                      <div className="w-full relative h-32 sm:h-40 flex items-end">
                        <div 
                          className={`w-full rounded-t-md transition-all duration-700 ease-out
                            ${isCurrentMonth ? 'bg-[#1E242E] shadow-xs' : 'bg-slate-200 group-hover/bar:bg-slate-300'}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${isCurrentMonth ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
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
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <span className="text-slate-600 font-medium text-sm">Tagihan Pending</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{formatRp(unpaidAmount)}</div>
                <Link href="/admin/invoices" className="text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors inline-flex items-center gap-1 mt-auto pt-2">
                  Lihat semua tagihan <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem className="flex-1">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Repeat2 className="w-5 h-5" />
                  </div>
                  <span className="text-slate-600 font-medium text-sm">Maintenance Aktif (WaaS)</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                  <CountUp from={0} to={activeSubs} /> <span className="text-slate-400 text-base font-normal">Klien</span>
                </div>
                <Link href="/admin/maintenance" className="text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors inline-flex items-center gap-1 mt-auto pt-2">
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
            <div className="bg-white rounded-2xl p-6 sm:p-7 h-full border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-slate-700" />
                  </div>
                  <h2 className="text-slate-900 font-bold text-lg">Leads Terbaru</h2>
                </div>
                <Link href="/admin/leads" className="text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl">
                  Semua Leads <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              
              {recentLeads.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-sm">Belum ada leads masuk bulan ini.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentLeads.map((l) => (
                    <div key={l.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors flex items-center justify-between gap-4 group">
                      <div className="min-w-0">
                        <p className="text-slate-900 text-sm font-semibold truncate group-hover:text-slate-700 transition-colors">{l.name}</p>
                        <p className="text-slate-500 text-xs truncate mt-0.5 flex items-center gap-1.5">
                          <span>{l.businessName}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{l.whatsapp}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          l.status === "NEW"        ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : l.status === "FOLLOWUP" ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : l.status === "DEAL"     ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {l.status === "NEW" ? "Baru" : l.status === "FOLLOWUP" ? "Follow-up" : l.status === "DEAL" ? "Deal" : "Selesai"}
                        </span>
                        <span className="text-slate-400 text-[10px] font-medium">{timeAgo(l.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </StaggerItem>

          {/* Lead pipeline */}
          <StaggerItem className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 sm:p-7 h-full border border-slate-200/90 shadow-xs">
              <h2 className="text-slate-900 font-bold text-lg mb-1">Pipeline Leads</h2>
              <p className="text-slate-500 text-sm mb-6">Total <strong className="text-slate-900">{totalLeads}</strong> leads tercatat di sistem.</p>
              
              <div className="space-y-4">
                {pipeline.map((p) => (
                  <div key={p.label}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-slate-600 text-xs font-medium">{p.label}</span>
                      <span className={`text-sm font-bold ${p.text}`}>{p.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className={`h-full ${p.color} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: totalLeads > 0 ? `${(p.count / totalLeads) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {totalLeads > 0 && (
                <div className="mt-7 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                    <p className="text-slate-500 text-[11px] font-semibold mb-0.5 uppercase tracking-wider">Conversion Rate</p>
                    <p className="text-slate-900 font-bold text-2xl"><CountUp from={0} to={convRate} />%</p>
                    <p className="text-emerald-700 text-[10px] mt-1 font-semibold">LEAD → DEAL</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                    <p className="text-slate-500 text-[11px] font-semibold mb-0.5 uppercase tracking-wider">Leads Aktif</p>
                    <p className="text-slate-900 font-bold text-2xl"><CountUp from={0} to={leadNew + leadFollowup} /></p>
                    <p className="text-amber-700 text-[10px] mt-1 font-semibold">BUTUH TINDAK LANJUT</p>
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
