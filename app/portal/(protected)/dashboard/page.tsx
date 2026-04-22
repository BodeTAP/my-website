import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Briefcase, Receipt, MessageSquare, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROJECT_STEPS = ["DRAFTING", "DEVELOPMENT", "TESTING", "LIVE"] as const;
const PROJECT_LABELS: Record<string, string> = {
  DRAFTING: "Desain",
  DEVELOPMENT: "Development",
  TESTING: "Testing",
  LIVE: "Live",
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
        },
      },
    },
  });

  const client = user?.client;

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
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Selamat datang, {session.user.name ?? client.businessName}!
        </h1>
        <p className="text-blue-200/50 text-sm mt-1">{client.businessName}</p>
      </div>

      {/* Active project status */}
      {activeProject && (
        <div className="glass rounded-2xl p-4 sm:p-6 mb-5 glow-blue">
          <h2 className="text-white font-semibold mb-4 text-sm sm:text-base">
            Status Proyek: <span className="text-blue-300">{activeProject.name}</span>
          </h2>

          {/* Progress stepper */}
          <div className="flex items-center">
            {PROJECT_STEPS.map((step, i) => {
              const isCompleted = PROJECT_STEPS.indexOf(activeProject.status as typeof PROJECT_STEPS[number]) > i;
              const isCurrent = activeProject.status === step;

              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500"
                        : isCurrent
                        ? "bg-blue-600 border-blue-500 ring-4 ring-blue-500/20"
                        : "bg-transparent border-white/10"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : (
                        <span className={`text-xs font-bold ${isCurrent ? "text-white" : "text-blue-200/30"}`}>
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-xs text-center leading-tight ${
                      isCurrent ? "text-white font-semibold" : isCompleted ? "text-green-400" : "text-blue-200/30"
                    }`}>
                      {PROJECT_LABELS[step]}
                    </span>
                  </div>
                  {i < PROJECT_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-5 ${isCompleted ? "bg-green-500" : "bg-white/5"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {activeProject.deadline && (
            <p className="text-blue-200/40 text-xs mt-4">
              Deadline:{" "}
              {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(activeProject.deadline))}
            </p>
          )}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        <div className="glass rounded-2xl p-3 sm:p-5">
          <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mb-2" />
          <div className="text-2xl sm:text-3xl font-bold text-white">{client.invoices.length}</div>
          <div className="text-blue-200/50 text-xs sm:text-sm mt-0.5">Invoice Tertunda</div>
        </div>
        <div className="glass rounded-2xl p-3 sm:p-5">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mb-2" />
          <div className="text-2xl sm:text-3xl font-bold text-white">{client.tickets.length}</div>
          <div className="text-blue-200/50 text-xs sm:text-sm mt-0.5">Tiket Aktif</div>
        </div>
        <div className="glass rounded-2xl p-3 sm:p-5">
          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mb-2" />
          <div className="text-2xl sm:text-3xl font-bold text-white">{client.projects.length}</div>
          <div className="text-blue-200/50 text-xs sm:text-sm mt-0.5">Total Proyek</div>
        </div>
      </div>

      {/* Unpaid invoices */}
      {client.invoices.length > 0 && (
        <div className="glass rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm sm:text-base">Invoice Belum Dibayar</h2>
            <Link href="/portal/invoices">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/5 text-xs">
                Lihat semua <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {client.invoices.map((inv) => {
              const WA_NUMBER = process.env.WHATSAPP_NUMBER ?? "6281234567890";
              const amount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(inv.amount);
              const waMsg = `Halo Victoria Tech, saya ingin konfirmasi pembayaran invoice ${inv.invoiceNo} sebesar ${amount}.`;

              return (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-t border-white/5 first:border-0 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium">{inv.invoiceNo}</p>
                    <p className="text-blue-200/50 text-xs truncate">{inv.description ?? "—"}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-white font-semibold text-sm">{amount}</span>
                    <a
                      href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="bg-green-600/80 hover:bg-green-600 text-white h-8 px-3 text-xs whitespace-nowrap">
                        Konfirmasi Bayar
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
