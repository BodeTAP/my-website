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
      <div className="flex flex-col items-center justify-center py-32 h-full">
        <div className="w-24 h-24 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-blue-500/20">
          <AlertCircle className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Akun Klien Belum Terhubung</h2>
        <p className="text-blue-200/50 text-sm max-w-md text-center">Silakan hubungi tim dukungan kami melalui WhatsApp agar akun Anda dapat segera dihubungkan ke proyek portofolio kami.</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
              <PhoneCall className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-amber-200/90 text-sm font-medium leading-snug">
              Nomor HP Anda belum diisi. Kami membutuhkannya untuk menghubungi Anda terkait proyek.
            </p>
          </div>
          <Link href="/portal/profile" className="w-full sm:w-auto shrink-0">
            <Button size="sm" className="w-full sm:w-auto bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold px-4 h-9 whitespace-nowrap transition-all">
              Lengkapi Sekarang
            </Button>
          </Link>
        </div>
      )}

      <FadeUp className="relative">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-blue-500" />
            {greeting}, <span className="text-blue-200">{session.user.name ?? client.businessName}</span>
          </h1>
          <p className="text-blue-200/60 text-sm mt-2 max-w-xl leading-relaxed">
            Ini adalah ringkasan aktivitas proyek, tagihan berjalan, dan tiket dukungan untuk <strong className="text-white bg-white/5 px-2 py-0.5 rounded-md">{client.businessName}</strong>.
          </p>
        </div>
      </FadeUp>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Main Focus) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Active project status */}
          {activeProject ? (
            <FadeUp delay={0.1}>
              <div className="rounded-2xl border border-white/10 bg-[#071225] p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10 mb-8">
                  <div>
                    <h2 className="text-white font-bold text-xl tracking-tight mb-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                      </div>
                      Proyek Berjalan
                    </h2>
                    <p className="text-blue-200/60 text-sm">Status penyelesaian ruang kerja proyek utama Anda.</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-xl w-fit sm:w-auto">
                    <p className="text-blue-400 font-bold tracking-wide text-sm">{activeProject.name}</p>
                  </div>
                </div>

                {/* Progress stepper */}
                <div className="flex items-start relative z-10 mb-8 bg-black/20 p-5 sm:p-8 rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar">
                  {PROJECT_STEPS.map((step, i) => {
                    const currentIdx = PROJECT_STEPS.indexOf(activeProject.status as typeof PROJECT_STEPS[number]);
                    const isCompleted = currentIdx > i;
                    const isCurrent   = currentIdx === i;
                    const isLast      = i === PROJECT_STEPS.length - 1;

                    return (
                      <div key={step} className="relative flex-1 min-w-[120px] sm:min-w-0">
                        {!isLast && (
                          <div className="absolute top-[20px] sm:top-[24px] left-1/2 w-full h-1.5 -translate-y-1/2 bg-white/5 z-0">
                            <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500 w-full' : 'w-0'}`} />
                          </div>
                        )}
                        <div className="relative z-10 flex flex-col items-center gap-3 w-full px-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-500 ${
                            isCompleted
                              ? "bg-green-500 border-green-500"
                              : isCurrent
                              ? "bg-blue-600 border-blue-400 ring-4 ring-blue-500/20 scale-105"
                              : "bg-[#0a1628] border-white/10"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : isCurrent ? (
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                              <span className="text-xs font-bold text-blue-200/30">{i + 1}</span>
                            )}
                          </div>
                          <span className={`text-[10px] sm:text-xs text-center leading-tight uppercase tracking-wider font-bold ${
                            isCurrent ? "text-white" : isCompleted ? "text-green-400" : "text-blue-200/30"
                          }`}>
                            {PROJECT_LABELS[step]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/5 relative z-10">
                  {activeProject.deadline ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-blue-200/40 text-[10px] uppercase tracking-widest font-black mb-0.5">Target Rilis</p>
                        <p className="text-white font-bold text-sm">
                          {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(activeProject.deadline))}
                        </p>
                      </div>
                    </div>
                  ) : <span />}
                  <Link href="/portal/projects" className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full text-blue-300 hover:text-white hover:bg-blue-600/20 border border-blue-500/20 rounded-xl transition-colors h-12 sm:h-11 px-6 text-sm font-bold group">
                      Buka Ruang Kerja <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeUp>
          ) : (
            <FadeUp delay={0.1}>
               <div className="rounded-2xl border border-white/10 bg-[#071225] p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-5 ring-1 ring-white/10 shadow-inner">
                   <Briefcase className="w-8 h-8 text-blue-200/30" />
                 </div>
                 <h2 className="text-white font-bold text-xl mb-2">Belum Ada Proyek Aktif</h2>
                 <p className="text-blue-200/50 text-sm max-w-sm mb-8 leading-relaxed">Anda belum memiliki proyek yang sedang dikerjakan saat ini. Hubungi kami jika ingin mulai proyek baru.</p>
                 <Link href="/portal/tickets">
                    <Button className="bg-white text-black hover:bg-gray-200 font-bold rounded-xl h-12 px-8">
                      Buat tiket konsultasi <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                 </Link>
               </div>
            </FadeUp>
          )}

          {/* Unpaid invoices */}
          {client.invoices.length > 0 && (
            <FadeUp delay={0.2}>
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center ring-1 ring-red-500/30">
                      <Receipt className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg sm:text-xl tracking-tight">Tagihan belum dibayar</h2>
                      <p className="text-red-300/70 text-xs sm:text-sm mt-0.5">Silakan cek tagihan yang masih berjalan.</p>
                    </div>
                  </div>
                  <Link href="/portal/invoices" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold px-4 py-2 h-auto">
                      Lihat Semua <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {client.invoices.map((inv) => {
                    const amount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(inv.amount);
                    return (
                      <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-black/40 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-bold text-base mb-1 group-hover:text-red-300 transition-colors">{inv.invoiceNo}</p>
                          <p className="text-blue-200/50 text-xs truncate max-w-md">{inv.description ?? "Pembayaran layanan MFWEB"}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-white/5 sm:border-0">
                          <span className="text-red-400 font-black text-lg tracking-tight bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">{amount}</span>
                          <Link href="/portal/invoices">
                            <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white rounded-xl px-5 h-10 font-bold whitespace-nowrap">
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

          <FadeUp delay={0.25}>
            <div className="rounded-2xl border border-white/10 bg-[#071225] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center ring-1 ring-cyan-500/20">
                    <Activity className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg sm:text-xl tracking-tight">Aktivitas Terakhir</h2>
                    <p className="text-blue-200/50 text-xs sm:text-sm mt-0.5">Riwayat penggunaan tools dan dokumen terbaru.</p>
                  </div>
                </div>
                <Link href="/portal/tools" className="text-xs font-bold text-blue-300 hover:text-white inline-flex items-center gap-1">
                  Buka Tools <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-blue-200/45">
                    Belum ada aktivitas tool. Mulai dari Proposal Generator, Invoice Generator, atau Lead Finder.
                  </div>
                ) : recentActivity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.id} href={item.href} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{item.title}</p>
                        <p className="truncate text-xs text-blue-200/45">{item.detail}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-blue-200/35">{formatDateTime(item.date)}</span>
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
          <StaggerChildren stagger={0.1} className="grid grid-cols-2 gap-4">
            <StaggerItem>
              <div className="rounded-2xl border border-white/10 bg-[#071225] p-6 h-full">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white mb-1"><CountUp from={0} to={client.tickets.length} /></div>
                <div className="text-blue-200/50 text-[11px] uppercase tracking-wider font-bold">Tiket Bantuan Aktif</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-2xl border border-white/10 bg-[#071225] p-6 h-full">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 ring-1 ring-green-500/20">
                  <Briefcase className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-black text-white mb-1"><CountUp from={0} to={client.projects.length} /></div>
                <div className="text-blue-200/50 text-[11px] uppercase tracking-wider font-bold">Total Proyek</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <Link href="/portal/credits" className="block h-full">
                <div className="rounded-2xl border border-amber-500/15 bg-[#071225] p-6 h-full hover:border-amber-500/35 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 ring-1 ring-amber-500/20">
                    <Coins className="w-6 h-6 text-amber-300" />
                  </div>
                  <div className="text-3xl font-black text-white mb-1"><CountUp from={0} to={creditBalance?.balance ?? 0} /></div>
                  <div className="text-blue-200/50 text-[11px] uppercase tracking-wider font-bold">Kredit Tools</div>
                </div>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Link href="/portal/tools/proposal-generator" className="block h-full">
                <div className="rounded-2xl border border-violet-500/15 bg-[#071225] p-6 h-full hover:border-violet-500/35 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 ring-1 ring-violet-500/20">
                    <FileText className="w-6 h-6 text-violet-300" />
                  </div>
                  <div className="text-3xl font-black text-white mb-1"><CountUp from={0} to={generatedProposalCount} /></div>
                  <div className="text-blue-200/50 text-[11px] uppercase tracking-wider font-bold">Proposal Dibuat</div>
                </div>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Link href="/portal/tools/invoice-generator" className="block h-full">
                <div className="rounded-2xl border border-cyan-500/15 bg-[#071225] p-6 h-full hover:border-cyan-500/35 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 ring-1 ring-cyan-500/20">
                    <Receipt className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div className="text-3xl font-black text-white mb-1"><CountUp from={0} to={generatedInvoiceCount} /></div>
                  <div className="text-blue-200/50 text-[11px] uppercase tracking-wider font-bold">Invoice Dibuat</div>
                </div>
              </Link>
            </StaggerItem>
          </StaggerChildren>

          <FadeUp delay={0.15}>
            <div className="rounded-2xl border border-white/10 bg-[#071225] p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-white font-bold text-lg">Checklist Portal</h2>
                  <p className="text-blue-200/45 text-xs mt-1">{onboardingDone} dari {onboardingItems.length} langkah selesai</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300 font-black">
                  {Math.round((onboardingDone / onboardingItems.length) * 100)}%
                </div>
              </div>
              <div className="space-y-2.5">
                {onboardingItems.map((item) => (
                  <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 hover:bg-white/[0.06] transition-colors">
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${item.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/15 text-blue-200/30"}`}>
                      {item.done && <Check className="w-3 h-3" />}
                    </span>
                    <span className={`text-sm font-bold ${item.done ? "text-blue-100/70 line-through decoration-blue-100/25" : "text-white"}`}>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.18}>
            <div className="rounded-2xl border border-white/10 bg-[#071225] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-pink-300" />
                </div>
                <div>
                  <h2 className="text-white font-bold">Brand Kit Dokumen</h2>
                  <p className="text-blue-200/45 text-xs">Proposal dan invoice siap konsisten.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <Link href="/portal/tools/proposal-generator" className={`rounded-xl border px-3 py-2.5 ${proposalBrandKit ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/5 text-blue-200/55"}`}>
                  Proposal {proposalBrandKit ? "siap" : "belum"}
                </Link>
                <Link href="/portal/tools/invoice-generator" className={`rounded-xl border px-3 py-2.5 ${invoiceBrandKit ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/5 text-blue-200/55"}`}>
                  Invoice {invoiceBrandKit ? "siap" : "belum"}
                </Link>
              </div>
              <p className="mt-4 text-xs text-blue-200/35">Total kredit tools terpakai: {Math.abs(spentCredits._sum.amount ?? 0)} kredit.</p>
            </div>
          </FadeUp>

          {/* Active maintenance subscription */}
          {client.subscriptions[0] && (() => {
            const sub = client.subscriptions[0];
            return (
              <FadeUp delay={0.2} className="h-full">
                <div className="rounded-2xl border border-indigo-500/30 bg-[#071225] p-6 sm:p-8 h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center ring-1 ring-indigo-500/30 shrink-0">
                      <Wrench className="w-7 h-7 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-300 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg w-fit">
                      Aktif
                    </span>
                  </div>

                  <div className="relative z-10 mb-8">
                    <p className="text-blue-200/50 text-[11px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Maintenance bulanan
                    </p>
                    <p className="text-white font-black text-2xl sm:text-3xl mb-3 tracking-tight">{sub.package.name}</p>
                    <p className="text-indigo-300 font-bold bg-indigo-500/10 w-fit px-3.5 py-1.5 rounded-xl text-sm border border-indigo-500/20">
                      Rp {sub.package.price.toLocaleString("id-ID")}<span className="opacity-60 text-xs">/Bulan</span>
                    </p>
                  </div>

                  {sub.package.features.length > 0 && (
                    <div className="relative z-10 mt-auto bg-black/30 p-5 rounded-2xl border border-white/5">
                      <p className="text-white/80 text-xs mb-4 font-bold uppercase tracking-wider">Fasilitas Termasuk:</p>
                      <div className="flex flex-col gap-3">
                        {sub.package.features.slice(0, 4).map((f) => (
                          <div key={f} className="flex items-start gap-3 text-blue-200/70 text-xs">
                            <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-[-2px] border border-green-500/20">
                              <Check className="w-3 h-3 text-green-400" />
                            </div>
                            <span className="leading-relaxed font-medium">{f}</span>
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
