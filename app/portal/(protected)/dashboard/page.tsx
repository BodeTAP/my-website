import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Briefcase, Receipt, MessageSquare, CheckCircle2, ArrowRight, Wrench, Loader2, Check, Sparkles, AlertCircle, LayoutDashboard, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem, CountUp } from "@/components/public/motion";

const PROJECT_STEPS = ["DRAFTING", "DEVELOPMENT", "TESTING", "LIVE"] as const;
const PROJECT_LABELS: Record<string, string> = {
  DRAFTING:    "Perancangan",
  DEVELOPMENT: "Pengembangan",
  TESTING:     "Tahap Testing",
  LIVE:        "Sudah Live 🚀",
};

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
        <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
          <AlertCircle className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Akun Klien Belum Terhubung</h2>
        <p className="text-blue-200/50 text-sm max-w-md text-center">Silakan hubungi tim dukungan kami melalui WhatsApp agar akun Anda dapat segera dihubungkan ke proyek portofolio kami.</p>
      </div>
    );
  }

  const activeProject = client.projects[0];
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Warning: nomor HP belum diisi */}
      {!client.phone && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
              <PhoneCall className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-amber-200/90 text-sm font-medium leading-snug">
              Nomor HP Anda belum diisi. Kami membutuhkannya untuk menghubungi Anda terkait proyek.
            </p>
          </div>
          <Link href="/portal/profile" className="shrink-0">
            <Button size="sm" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold px-4 h-9 whitespace-nowrap transition-all">
              Lengkapi Sekarang
            </Button>
          </Link>
        </div>
      )}

      <FadeUp className="relative">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-blue-500" />
            {greeting}, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{session.user.name ?? client.businessName}!</span>
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
              <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
                
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
                <div className="flex items-start relative z-10 mb-8 bg-black/30 p-5 sm:p-8 rounded-2xl border border-white/5 overflow-x-auto custom-scrollbar">
                  {PROJECT_STEPS.map((step, i) => {
                    const currentIdx = PROJECT_STEPS.indexOf(activeProject.status as typeof PROJECT_STEPS[number]);
                    const isCompleted = currentIdx > i;
                    const isCurrent   = currentIdx === i;
                    const isLast      = i === PROJECT_STEPS.length - 1;

                    return (
                      <div key={step} className="relative flex-1 min-w-[120px] sm:min-w-0">
                        {!isLast && (
                          <div className="absolute top-[20px] sm:top-[24px] left-1/2 w-full h-1.5 -translate-y-1/2 bg-white/5 z-0">
                            <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-gradient-to-r from-green-500 to-blue-500 w-full' : 'w-0'}`} />
                          </div>
                        )}
                        <div className="relative z-10 flex flex-col items-center gap-3 w-full px-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-500 ${
                            isCompleted
                              ? "bg-green-500 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                              : isCurrent
                              ? "bg-blue-600 border-blue-400 ring-4 ring-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.5)] scale-110"
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
                    <Button variant="ghost" className="w-full text-blue-400 hover:text-white hover:bg-blue-600/20 border border-blue-500/20 rounded-xl transition-all h-12 sm:h-11 px-6 text-sm font-bold group shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      Buka Ruang Kerja <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeUp>
          ) : (
            <FadeUp delay={0.1}>
               <div className="glass rounded-3xl p-8 border border-white/5 text-center flex flex-col items-center justify-center min-h-[350px]">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-5 ring-1 ring-white/10 shadow-inner">
                   <Briefcase className="w-8 h-8 text-blue-200/30" />
                 </div>
                 <h2 className="text-white font-bold text-xl mb-2">Belum Ada Proyek Aktif</h2>
                 <p className="text-blue-200/50 text-sm max-w-sm mb-8 leading-relaxed">Anda belum memiliki proyek yang sedang dikerjakan saat ini. Hubungi kami untuk merencanakan proyek impian Anda selanjutnya!</p>
                 <Link href="/portal/tickets">
                    <Button className="bg-white text-black hover:bg-gray-200 font-bold rounded-xl h-12 px-8 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                      Konsultasi Gratis <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                 </Link>
               </div>
            </FadeUp>
          )}

          {/* Unpaid invoices */}
          {client.invoices.length > 0 && (
            <FadeUp delay={0.2}>
              <div className="glass rounded-3xl p-6 sm:p-8 border border-red-500/20 relative overflow-hidden bg-gradient-to-br from-red-500/5 to-transparent shadow-[0_0_30px_rgba(239,68,68,0.05)]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center ring-1 ring-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <Receipt className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg sm:text-xl tracking-tight">Tagihan Pending</h2>
                      <p className="text-red-300/70 text-xs sm:text-sm mt-0.5">Menunggu konfirmasi pembayaran Anda.</p>
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
                          <p className="text-blue-200/50 text-xs truncate max-w-md">{inv.description ?? "Pembayaran Pengembangan Digital"}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-white/5 sm:border-0">
                          <span className="text-red-400 font-black text-lg tracking-tight bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">{amount}</span>
                          <Link href="/portal/invoices">
                            <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] rounded-xl px-5 h-10 font-bold whitespace-nowrap">
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
        </div>

        {/* Right Column (Secondary / Stats) */}
        <div className="flex flex-col gap-6">
          
          {/* Quick stats grid */}
          <StaggerChildren stagger={0.1} className="grid grid-cols-2 gap-4">
            <StaggerItem>
              <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group h-full">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white mb-1"><CountUp from={0} to={client.tickets.length} /></div>
                <div className="text-blue-200/50 text-[11px] uppercase tracking-wider font-bold">Tiket Bantuan Aktif</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group h-full">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-green-500/20 transition-all" />
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center mb-4 ring-1 ring-green-500/20">
                  <Briefcase className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-black text-white mb-1"><CountUp from={0} to={client.projects.length} /></div>
                <div className="text-blue-200/50 text-[11px] uppercase tracking-wider font-bold">Total Proyek</div>
              </div>
            </StaggerItem>
          </StaggerChildren>

          {/* Active maintenance subscription */}
          {client.subscriptions[0] && (() => {
            const sub = client.subscriptions[0];
            return (
              <FadeUp delay={0.2} className="h-full">
                <div className="glass rounded-3xl p-6 sm:p-8 border border-indigo-500/30 relative overflow-hidden h-full flex flex-col group shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center ring-1 ring-indigo-500/30 shrink-0 shadow-lg">
                      <Wrench className="w-7 h-7 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.15)] w-fit">
                      Aktif Berjalan
                    </span>
                  </div>

                  <div className="relative z-10 mb-8">
                    <p className="text-blue-200/50 text-[11px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Layanan Bulanan
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
