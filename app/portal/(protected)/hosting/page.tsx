import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import { Globe, Server, Shield, AlertTriangle, CheckCircle, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

function daysLeft(date: Date | null) {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function StatusBar({ days, label }: { days: number | null; label: string }) {
  if (days === null) return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-sm">{label}</span>
      <span className="text-white/20 text-sm font-semibold">Tidak Dikonfigurasi</span>
    </div>
  );

  const isExpired = days < 0;
  const isCritical = days <= 7;
  const isWarning = days <= 14;
  const isAlert = days <= 30;

  const color = isExpired ? "red" : isCritical ? "red" : isWarning ? "orange" : isAlert ? "yellow" : "green";
  const pct = isExpired ? 0 : Math.min(100, Math.round((days / 365) * 100));

  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-sm font-medium">{label}</span>
        <span className={`text-sm font-black text-${color}-400`}>
          {isExpired ? "⚠ EXPIRED" : `${days} hari lagi`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-${color}-500 transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function PortalHostingPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: { include: { hostingRecords: true } } },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const records = user.client.hostingRecords;

  const waText = encodeURIComponent("Halo MFWEB, saya ingin bertanya mengenai perpanjangan domain/hosting website saya.");

  return (
    <div>
      <FadeUp className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Domain & Hosting</h1>
            <p className="text-blue-200/50 text-sm mt-1">
              Pantau status domain, hosting, dan SSL website Anda.
            </p>
          </div>
          <a
            href={`https://wa.me/${WA}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 hover:text-green-300 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Perpanjang via WhatsApp
          </a>
        </div>
      </FadeUp>

      {records.length === 0 ? (
        <FadeUp delay={0.1}>
          <div className="glass rounded-3xl p-16 text-center border border-white/5">
            <Globe className="w-12 h-12 text-blue-400/30 mx-auto mb-4" />
            <h2 className="text-white/60 font-bold text-lg mb-2">Belum Ada Data Hosting</h2>
            <p className="text-white/30 text-sm max-w-sm mx-auto">
              Data domain dan hosting Anda belum dikonfigurasi. Hubungi tim MFWEB untuk informasi lebih lanjut.
            </p>
            <a
              href={`https://wa.me/${WA}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 bg-blue-600/20 border border-blue-500/30 text-blue-300 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-blue-600/30"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi Kami
            </a>
          </div>
        </FadeUp>
      ) : (
        <StaggerChildren className="space-y-6">
          {records.map(record => {
            const domainDays  = daysLeft(record.domainExpiry);
            const hostingDays = daysLeft(record.hostingExpiry);
            const sslDays     = daysLeft(record.sslExpiry);
            const minDays     = Math.min(domainDays ?? 999, hostingDays ?? 999, sslDays ?? 999);

            const overallStatus = record.status !== "ACTIVE" ? record.status
              : minDays < 0   ? "EXPIRED"
              : minDays <= 7  ? "KRITIS"
              : minDays <= 14 ? "PERHATIAN"
              : minDays <= 30 ? "SEGERA"
              : "AMAN";

            const statusColor = {
              AMAN:      { badge: "green",  bg: "green-500/5",   border: "green-500/20" },
              SEGERA:    { badge: "yellow", bg: "yellow-500/5",  border: "yellow-500/20" },
              PERHATIAN: { badge: "orange", bg: "orange-500/5",  border: "orange-500/20" },
              KRITIS:    { badge: "red",    bg: "red-500/10",    border: "red-500/30" },
              EXPIRED:   { badge: "red",    bg: "red-500/10",    border: "red-500/30" },
              SUSPENDED: { badge: "gray",   bg: "white/5",       border: "white/10" },
            }[overallStatus] ?? { badge: "blue", bg: "blue-500/5", border: "blue-500/20" };

            return (
              <StaggerItem key={record.id}>
                <div className={`glass rounded-3xl p-6 sm:p-8 border bg-${statusColor.bg} border-${statusColor.border} relative overflow-hidden`}>
                  {/* Glow for critical */}
                  {(overallStatus === "KRITIS" || overallStatus === "EXPIRED") && (
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
                  )}

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Globe className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h2 className="text-white font-black text-xl">{record.domainName}</h2>
                          <p className="text-white/40 text-xs mt-0.5">
                            {[record.hostingProvider, record.hostingPlan].filter(Boolean).join(" · ") || "Tidak ada info hosting"}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border bg-${statusColor.badge}-500/10 border-${statusColor.badge}-500/30 text-${statusColor.badge}-400`}>
                        {overallStatus === "AMAN"      && <CheckCircle className="w-3.5 h-3.5" />}
                        {(overallStatus === "KRITIS" || overallStatus === "EXPIRED") && <AlertTriangle className="w-3.5 h-3.5" />}
                        {overallStatus === "SEGERA"    && <Clock className="w-3.5 h-3.5" />}
                        {overallStatus}
                      </span>
                    </div>

                    {/* Status bars */}
                    <div className="bg-black/30 rounded-2xl p-5 border border-white/5 mb-4">
                      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">Status Layanan</p>
                      <StatusBar days={domainDays}  label="🌐 Domain" />
                      <StatusBar days={hostingDays} label="🖥 Hosting" />
                      <StatusBar days={sslDays}     label="🔒 SSL Certificate" />
                    </div>

                    {/* Detail info */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {record.domainProvider && (
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <p className="text-white/30 text-[10px] uppercase tracking-widest">Provider Domain</p>
                          <p className="text-white font-semibold text-sm mt-1">{record.domainProvider}</p>
                        </div>
                      )}
                      {record.domainExpiry && (
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <p className="text-white/30 text-[10px] uppercase tracking-widest">Domain Expired</p>
                          <p className="text-white font-semibold text-sm mt-1">{formatDate(record.domainExpiry)}</p>
                        </div>
                      )}
                      {record.hostingExpiry && (
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <p className="text-white/30 text-[10px] uppercase tracking-widest">Hosting Expired</p>
                          <p className="text-white font-semibold text-sm mt-1">{formatDate(record.hostingExpiry)}</p>
                        </div>
                      )}
                    </div>

                    {record.notes && (
                      <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <p className="text-blue-200/60 text-sm leading-relaxed">{record.notes}</p>
                      </div>
                    )}

                    {(overallStatus === "KRITIS" || overallStatus === "PERHATIAN" || overallStatus === "EXPIRED") && (
                      <a
                        href={`https://wa.me/${WA}?text=${encodeURIComponent(`Halo MFWEB, saya ingin memperpanjang layanan untuk domain ${record.domainName}. Mohon informasi biaya dan prosedurnya.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 mt-5 w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl font-bold text-sm transition-all"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Perpanjang Sekarang — Hubungi MFWEB
                      </a>
                    )}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      )}
    </div>
  );
}
