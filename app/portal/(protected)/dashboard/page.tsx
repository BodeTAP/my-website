import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Briefcase, Receipt, MessageSquare, CheckCircle2, ArrowRight, Wrench, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem, ScaleIn, CountUp } from "@/components/public/motion";

const PROJECT_STEPS = ["DRAFTING", "DEVELOPMENT", "TESTING", "LIVE"] as const;
const PROJECT_LABELS: Record<string, string> = {
  DRAFTING:    "Perancangan",
  DEVELOPMENT: "Pengembangan",
  TESTING:     "Testing",
  LIVE:        "Live 🚀",
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
  // Construct empty relations directly — no second DB round-trip needed.
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
      <div className="text-center py-20">
        <p className="text-blue-200/40 text-lg mb-4">Akun klien Anda belum diatur.</p>
        <p className="text-blue-200/30 text-sm">Silakan hubungi tim kami untuk bantuan.</p>
      </div>
    );
  }

  const activeProject = client.projects[0];

  return (
    <div>
      <FadeUp className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Selamat datang, {session.user.name ?? client.businessName}!
        </h1>
        <p className="text-blue-200/50 text-sm mt-1">{client.businessName}</p>
      </FadeUp>

      {/* Active project status */}
      {activeProject && (
        <FadeUp delay={0.1}>
          <div className="glass rounded-2xl p-4 sm:p-6 mb-5 glow-blue">
            <h2 className="text-white font-semibold mb-4 text-sm sm:text-base">
              Status Proyek: <span className="text-blue-300">{activeProject.name}</span>
            </h2>

          {/* Progress stepper — compact horizontal */}
          <div className="flex items-center gap-0">
            {PROJECT_STEPS.map((step, i) => {
              const currentIdx = PROJECT_STEPS.indexOf(activeProject.status as typeof PROJECT_STEPS[number]);
              const isCompleted = currentIdx > i;
              const isCurrent   = currentIdx === i;
              const isLast      = i === PROJECT_STEPS.length - 1;

              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500"
                        : isCurrent
                        ? "bg-blue-600 border-blue-400 ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/20"
                        : "bg-[#0a1628] border-white/10"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : (
                        <span className="text-[10px] font-bold text-blue-200/20">{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-xs text-center leading-tight px-0.5 ${
                      isCurrent ? "text-white font-semibold" : isCompleted ? "text-green-400" : "text-blue-200/25"
                    }`}>
                      {PROJECT_LABELS[step]}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`flex-1 h-0.5 mx-1.5 mb-5 rounded-full ${
                      isCompleted ? "bg-green-500/60" : "bg-white/5"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Deadline + link */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
            {activeProject.deadline ? (
              <p className="text-blue-200/40 text-xs">
                Target selesai:{" "}
                <span className="text-blue-200/70 font-medium">
                  {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(activeProject.deadline))}
                </span>
              </p>
            ) : <span />}
            <Link href="/portal/projects">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/5 text-xs h-7 px-2">
                Detail <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        </FadeUp>
      )}

      {/* Active maintenance subscription */}
      {client.subscriptions[0] && (() => {
        const sub = client.subscriptions[0];
        return (
          <div className="glass rounded-2xl p-4 sm:p-5 mb-5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-semibold">Paket Maintenance Aktif</span>
              <span className="ml-auto text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">Aktif</span>
            </div>
            <p className="text-blue-300 font-bold text-lg mb-1">
              {sub.package.name}
              <span className="text-blue-200/40 text-sm font-normal ml-2">
                Rp {sub.package.price.toLocaleString("id-ID")}/bln
              </span>
            </p>
            {sub.package.features.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {sub.package.features.slice(0, 4).map((f) => (
                  <span key={f} className="flex items-center gap-1.5 text-blue-200/50 text-xs">
                    <Check className="w-3 h-3 text-green-400 shrink-0" />{f}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Quick stats */}
      <StaggerChildren stagger={0.08} className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        <StaggerItem>
          <ScaleIn className="glass rounded-2xl p-3 sm:p-5">
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-white">
              <CountUp from={0} to={client.invoices.length} />
            </div>
            <div className="text-blue-200/50 text-xs sm:text-sm mt-0.5">Invoice Tertunda</div>
          </ScaleIn>
        </StaggerItem>
        <StaggerItem>
          <ScaleIn className="glass rounded-2xl p-3 sm:p-5">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-white">
              <CountUp from={0} to={client.tickets.length} />
            </div>
            <div className="text-blue-200/50 text-xs sm:text-sm mt-0.5">Tiket Aktif</div>
          </ScaleIn>
        </StaggerItem>
        <StaggerItem>
          <ScaleIn className="glass rounded-2xl p-3 sm:p-5">
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-white">
              <CountUp from={0} to={client.projects.length} />
            </div>
            <div className="text-blue-200/50 text-xs sm:text-sm mt-0.5">Total Proyek</div>
          </ScaleIn>
        </StaggerItem>
      </StaggerChildren>

      {/* Unpaid invoices */}
      {client.invoices.length > 0 && (
        <FadeUp className="glass rounded-2xl p-4 sm:p-6" delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm sm:text-base">Invoice Belum Dibayar</h2>
            <Link href="/portal/invoices">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/5 text-xs">
                Lihat semua <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <StaggerChildren className="space-y-3">
            {client.invoices.map((inv) => {
              const amount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(inv.amount);
              return (
                <StaggerItem key={inv.id}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-t border-white/5 first:border-0 first:pt-0">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium">{inv.invoiceNo}</p>
                      <p className="text-blue-200/50 text-xs truncate">{inv.description ?? "—"}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-white font-semibold text-sm">{amount}</span>
                      <Link href="/portal/invoices">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white h-8 px-3 text-xs whitespace-nowrap">
                          Bayar Sekarang
                        </Button>
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </FadeUp>
      )}
    </div>
  );
}
