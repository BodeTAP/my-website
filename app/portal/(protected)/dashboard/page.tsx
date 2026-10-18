import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Activity, Briefcase, Receipt, MessageSquare, CheckCircle2, ArrowRight, Wrench, Loader2, Check, Sparkles, AlertCircle, LayoutDashboard, PhoneCall, Coins, FileText, Search, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem, CountUp } from "@/components/public/motion";

const PROJECT_STEPS = ["DRAFTING", "DEVELOPMENT", "TESTING", "LIVE"] as const;
const PROJECT_LABELS: Record<string, string> = {
  DRAFTING:    "Perancangan",
  DEVELOPMENT: "Pengembangan",
  TESTING:     "Tahap Testing",
  LIVE:        "Sudah Live",
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function PortalDashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      client: {
        include: {
          projects: { orderBy: { createdAt: "desc" }, take: 1 },
          invoices: { where: { status: "UNPAID" }, orderBy: { dueDate: "asc" }, take: 3 },
          tickets: { where: { status: { not: "CLOSED" } }, orderBy: { updatedAt: "desc" }, take: 3 },
          subscriptions: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { package: { select: { name: true, price: true, features: true } } },
          },
        },
      },
    },
  });

  let client = user?.client;

  // Auto-create Client record if missing (e.g. first Google OAuth sign-in)
  if (!client && user) {
    const created = await prisma.client.upsert({
      where:  { userId: user.id },
      create: { userId: user.id, businessName: user.name ?? "Klien Baru" },
      update: {},
    }).catch(() => null);

    if (created) {
      client = { ...created, projects: [], invoices: [], tickets: [], subscriptions: [] };
    }
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[60vh]">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-md shadow-xs">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5 mx-auto text-slate-500 border border-slate-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Akun Klien Belum Terhubung</h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
            Silakan hubungi tim dukungan kami melalui WhatsApp agar akun Anda dapat segera dihubungkan ke proyek dan fitur portal.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}?text=${encodeURIComponent("Halo MFWEB, saya baru saja mendaftar akun klien dan ingin menghubungkan akun saya.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#1E242E] hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Hubungi via WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const activeProject = client.projects[0];
  const [
    creditBalance,
    toolUsage,
    recentGeneratedInvoices,
    recentGeneratedProposals,
    recentCreditTransactions,
    brandKitStatus,
  ] = await Promise.all([
    prisma.clientCredit.findUnique({
      where: { clientId: client.id },
      select: { balance: true },
    }),
    Promise.all([
      prisma.generatedProposal.count({ where: { clientId: client.id } }),
      prisma.generatedInvoice.count({ where: { clientId: client.id } }),
      prisma.creditTransaction.aggregate({
        where: { clientId: client.id, tool: { in: ["lead_finder", "proposal_generator", "invoice_generator"] } },
        _sum: { amount: true },
      }),
    ]),
    prisma.generatedInvoice.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, invoiceNo: true, billToName: true, total: true, createdAt: true },
    }),
    prisma.generatedProposal.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, proposalNo: true, title: true, prospectName: true, createdAt: true },
    }),
    prisma.creditTransaction.findMany({
      where: { clientId: client.id, tool: { in: ["lead_finder", "proposal_generator", "invoice_generator"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, tool: true, description: true, amount: true, createdAt: true },
    }),
    Promise.all([
      prisma.proposalBrandKit.findUnique({ where: { clientId: client.id }, select: { id: true } }),
      prisma.invoiceBrandKit.findUnique({ where: { clientId: client.id }, select: { id: true } }),
    ]),
  ]);
  const [generatedProposalCount, generatedInvoiceCount, spentCredits] = toolUsage;
  const [proposalBrandKit, invoiceBrandKit] = brandKitStatus;
  const recentActivity = [
    ...recentGeneratedInvoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      icon: Receipt,
      title: `Invoice ${invoice.invoiceNo}`,
      detail: `${invoice.billToName} - Rp ${invoice.total.toLocaleString("id-ID")}`,
      href: `/portal/tools/invoice-generator/${invoice.id}`,
      date: invoice.createdAt,
    })),
    ...recentGeneratedProposals.map((proposal) => ({
      id: `proposal-${proposal.id}`,
      icon: FileText,
      title: proposal.proposalNo ? `Proposal ${proposal.proposalNo}` : proposal.title,
      detail: proposal.prospectName ?? proposal.title,
      href: `/portal/tools/proposal-generator/${proposal.id}`,
      date: proposal.createdAt,
    })),
    ...recentCreditTransactions.map((transaction) => ({
      id: `credit-${transaction.id}`,
      icon: transaction.tool === "lead_finder" ? Search : transaction.tool === "invoice_generator" ? Receipt : FileText,
      title: transaction.description,
      detail: `${Math.abs(transaction.amount)} kredit`,
      href: transaction.tool === "lead_finder"
        ? "/portal/tools/lead-finder"
        : transaction.tool === "invoice_generator"
          ? "/portal/tools/invoice-generator"
          : "/portal/tools/proposal-generator",
      date: transaction.createdAt,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);
  const onboardingItems = [
    { label: "Lengkapi profil bisnis", done: Boolean(client.phone && client.address), href: "/portal/profile" },
    { label: "Siapkan brand kit dokumen", done: Boolean(proposalBrandKit || invoiceBrandKit), href: "/portal/profile" },
    { label: "Top up kredit tools", done: (creditBalance?.balance ?? 0) > 0, href: "/portal/credits" },
    { label: "Buat proposal pertama", done: generatedProposalCount > 0, href: "/portal/tools/proposal-generator" },
    { label: "Buat invoice pertama", done: generatedInvoiceCount > 0, href: "/portal/tools/invoice-generator" },
  ];
  const onboardingDone = onboardingItems.filter((item) => item.done).length;
  const hour = (new Date().getUTCHours() + 7) % 24; // WIB = UTC+7
  const greeting = hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Warning: nomor HP belum diisi */}
      {!client.phone && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-amber-50 border border-amber-200/90 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200 text-amber-800">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <p className="text-amber-950 text-sm font-semibold">Nomor WhatsApp belum diisi</p>
              <p className="text-amber-800/80 text-xs mt-0.5">Kami membutuhkan nomor kontak aktif untuk konfirmasi progress proyek dan invoice.</p>
            </div>
          </div>
          <Link href="/portal/profile" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold px-4 h-9 shadow-xs transition-all">
              Lengkapi Sekarang
            </Button>
          </Link>
        </div>
      )}

      {/* Header Greeting */}
      <FadeUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold mb-2 shadow-2xs">
            <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Portal Klien MFWEB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {greeting}, <span className="text-slate-800">{session.user.name ?? client.businessName}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-xl leading-relaxed">
            Ringkasan status proyek, tagihan berjalan, dan tools produktivitas untuk <strong className="text-slate-800 font-semibold">{client.businessName}</strong>.
          </p>
        </div>
        <Link href="/portal/credits" className="shrink-0">
          <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo Tools</p>
              <p className="text-sm font-black text-slate-900">{creditBalance?.balance ?? 0} kredit</p>
            </div>
          </div>
        </Link>
      </FadeUp>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Main Focus) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Active project status: Deep Slate Hero Block */}
          {activeProject ? (
            <FadeUp delay={0.1}>
              <div className="rounded-2xl border border-slate-800 bg-[#1E242E] text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10 mb-7">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-2.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                      Proyek Berjalan
                    </span>
                    <h2 className="text-white font-black text-xl sm:text-2xl tracking-tight">
                      {activeProject.name}
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">Status ruang kerja dan milestone website Anda.</p>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl w-fit sm:w-auto">
                    <span className="text-slate-300 font-bold text-xs uppercase tracking-wider">
                      {PROJECT_LABELS[activeProject.status] ?? activeProject.status}
                    </span>
                  </div>
                </div>

                {/* Progress stepper */}
                <div className="flex items-start relative z-10 mb-7 bg-[#171C24]/80 p-5 sm:p-6 rounded-2xl border border-slate-800/90 overflow-x-auto custom-scrollbar">
                  {PROJECT_STEPS.map((step, i) => {
                    const currentIdx = PROJECT_STEPS.indexOf(activeProject.status as typeof PROJECT_STEPS[number]);
                    const isCompleted = currentIdx > i;
                    const isCurrent   = currentIdx === i;
                    const isLast      = i === PROJECT_STEPS.length - 1;

                    return (
                      <div key={step} className="relative flex-1 min-w-[110px] sm:min-w-0">
                        {!isLast && (
                          <div className="absolute top-[18px] sm:top-[20px] left-1/2 w-full h-1 -translate-y-1/2 bg-slate-800 z-0">
                            <div className={`h-full transition-all duration-700 ${isCompleted ? 'bg-emerald-500 w-full' : 'w-0'}`} />
                          </div>
                        )}
                        <div className="relative z-10 flex flex-col items-center gap-2.5 w-full px-1">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300 ${
                            isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : isCurrent
                              ? "bg-white border-white text-slate-900 ring-4 ring-white/20 scale-105"
                              : "bg-slate-850 border-slate-700 text-slate-500"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : isCurrent ? (
                              <Loader2 className="w-4 h-4 text-slate-900 animate-spin" />
                            ) : (
                              <span className="text-xs font-bold">{i + 1}</span>
                            )}
                          </div>
                          <span className={`text-[10px] sm:text-xs text-center leading-tight uppercase tracking-wider font-bold ${
                            isCurrent ? "text-white" : isCompleted ? "text-emerald-400" : "text-slate-500"
                          }`}>
                            {PROJECT_LABELS[step]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-800 relative z-10">
                  {activeProject.deadline ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Target Rilis</p>
                        <p className="text-white font-bold text-xs sm:text-sm">
                          {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(activeProject.deadline))}
                        </p>
                      </div>
                    </div>
                  ) : <span />}
                  <Link href="/portal/projects" className="w-full sm:w-auto">
                    <Button className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl h-10 px-5 text-xs shadow-xs transition-colors group">
                      Buka Ruang Kerja <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeUp>
          ) : (
            <FadeUp delay={0.1}>
               <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center flex flex-col items-center justify-center min-h-[300px] shadow-xs">
                 <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
                   <Briefcase className="w-7 h-7 text-slate-400" />
                 </div>
                 <h2 className="text-slate-900 font-bold text-lg mb-1">Belum Ada Proyek Aktif</h2>
                 <p className="text-slate-500 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
                   Anda belum memiliki proyek website aktif yang terhubung saat ini. Butuh pembuatan website baru atau konsultasi?
                 </p>
                 <Link href="/portal/tickets">
                    <Button className="bg-[#1E242E] text-white hover:bg-slate-800 font-bold rounded-xl h-10 px-6 text-xs shadow-xs">
                      Buat Tiket Konsultasi <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                 </Link>
               </div>
            </FadeUp>
          )}

          {/* Unpaid invoices */}
          {client.invoices.length > 0 && (
            <FadeUp delay={0.2}>
              <div className="rounded-2xl border border-rose-200 bg-white p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-slate-900 font-bold text-base sm:text-lg tracking-tight">Tagihan Belum Dibayar</h2>
                      <p className="text-slate-500 text-xs mt-0.5">Silakan selesaikan tagihan berjalan untuk menjaga kelancaran layanan.</p>
                    </div>
                  </div>
                  <Link href="/portal/invoices" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold px-3 h-8">
                      Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {client.invoices.map((inv) => {
                    const amount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(inv.amount);
                    return (
                      <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/40 border border-rose-100 hover:border-rose-200 transition-all group">
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-900 font-bold text-sm mb-0.5 font-mono group-hover:text-rose-900 transition-colors">{inv.invoiceNo}</p>
                          <p className="text-slate-500 text-xs truncate max-w-md">{inv.description ?? "Pembayaran layanan MFWEB"}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t border-rose-100 sm:border-0">
                          <span className="text-rose-700 font-black text-base tracking-tight bg-white px-3 py-1 rounded-lg border border-rose-200">{amount}</span>
                          <Link href="/portal/invoices">
                            <Button size="sm" className="bg-[#1E242E] hover:bg-slate-800 text-white rounded-xl px-4 h-9 font-bold text-xs shadow-xs">
                              Bayar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeUp>
          )}

          {/* Recent Activity */}
          <FadeUp delay={0.25}>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-slate-900 font-bold text-base sm:text-lg tracking-tight">Aktivitas Terakhir</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Riwayat penggunaan tools dan dokumen terbaru.</p>
                  </div>
                </div>
                <Link href="/portal/tools" className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1">
                  Buka Tools <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentActivity.length === 0 ? (
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-6 text-center text-xs text-slate-500">
                    Belum ada aktivitas tool. Mulai gunakan Proposal Generator, Invoice Generator, atau Lead Finder.
                  </div>
                ) : recentActivity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.id} href={item.href} className="flex items-center gap-3.5 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5 transition-colors hover:bg-slate-100/70 hover:border-slate-300">
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900">{item.title}</p>
                        <p className="truncate text-[11px] text-slate-500">{item.detail}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold text-slate-400">{formatDateTime(item.date)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Right Column (Secondary / Stats) */}
        <div className="flex flex-col gap-6">
          
          {/* Quick stats grid */}
          <StaggerChildren stagger={0.06} className="grid grid-cols-2 gap-3.5">
            <StaggerItem>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs h-full">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-slate-700">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900 mb-0.5"><CountUp from={0} to={client.tickets.length} /></div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Tiket Aktif</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs h-full">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900 mb-0.5"><CountUp from={0} to={client.projects.length} /></div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Total Proyek</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <Link href="/portal/credits" className="block h-full">
                <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs h-full hover:border-amber-300 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3 text-amber-600">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-0.5"><CountUp from={0} to={creditBalance?.balance ?? 0} /></div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Kredit Tools</div>
                </div>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Link href="/portal/tools/proposal-generator" className="block h-full">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs h-full hover:border-slate-300 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-slate-700">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-0.5"><CountUp from={0} to={generatedProposalCount} /></div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Proposal Dibuat</div>
                </div>
              </Link>
            </StaggerItem>
            <StaggerItem className="col-span-2">
              <Link href="/portal/tools/invoice-generator" className="block h-full">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs h-full hover:border-slate-300 transition-colors flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">Invoice Generator</div>
                    <div className="text-xl font-black text-slate-900"><CountUp from={0} to={generatedInvoiceCount} /> Invoice Dibuat</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          </StaggerChildren>

          {/* Onboarding Checklist */}
          <FadeUp delay={0.15}>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-slate-900 font-bold text-base">Checklist Klien</h2>
                  <p className="text-slate-500 text-xs mt-0.5">{onboardingDone} dari {onboardingItems.length} langkah selesai</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-black">
                  {Math.round((onboardingDone / onboardingItems.length) * 100)}%
                </div>
              </div>
              <div className="space-y-2">
                {onboardingItems.map((item) => (
                  <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50/70 px-3.5 py-2.5 hover:bg-slate-100/70 hover:border-slate-300 transition-colors">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${item.done ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"}`}>
                      {item.done && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <span className={`text-xs font-semibold ${item.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* Brand Kit Dokumen */}
          <FadeUp delay={0.18}>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-slate-900 font-bold text-sm">Brand Kit Dokumen</h2>
                  <p className="text-slate-500 text-xs">Proposal & invoice siap konsisten.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <Link href="/portal/tools/proposal-generator" className={`rounded-xl border px-3 py-2 text-center transition-colors ${proposalBrandKit ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                  Proposal: {proposalBrandKit ? "Siap ✓" : "Atur"}
                </Link>
                <Link href="/portal/tools/invoice-generator" className={`rounded-xl border px-3 py-2 text-center transition-colors ${invoiceBrandKit ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                  Invoice: {invoiceBrandKit ? "Siap ✓" : "Atur"}
                </Link>
              </div>
              <p className="mt-3 text-[11px] text-slate-400 font-medium">Total kredit tools terpakai: {Math.abs(spentCredits._sum.amount ?? 0)} kredit.</p>
            </div>
          </FadeUp>

          {/* Active maintenance subscription */}
          {client.subscriptions[0] && (() => {
            const sub = client.subscriptions[0];
            return (
              <FadeUp delay={0.2} className="h-full">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs h-full flex flex-col">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      Aktif
                    </span>
                  </div>

                  <div className="mb-5">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Maintenance Bulanan
                    </p>
                    <p className="text-slate-900 font-black text-xl tracking-tight">{sub.package.name}</p>
                    <p className="text-slate-700 font-bold text-sm mt-1">
                      Rp {sub.package.price.toLocaleString("id-ID")}<span className="text-slate-400 text-xs font-normal">/bulan</span>
                    </p>
                  </div>

                  {sub.package.features.length > 0 && (
                    <div className="mt-auto bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                      <p className="text-slate-700 text-xs mb-3 font-bold uppercase tracking-wider">Fasilitas Termasuk:</p>
                      <div className="flex flex-col gap-2">
                        {sub.package.features.slice(0, 4).map((f) => (
                          <div key={f} className="flex items-start gap-2.5 text-slate-600 text-xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FadeUp>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
