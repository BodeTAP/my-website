import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import { Globe, AlertTriangle, CheckCircle, Clock, MessageCircle } from "lucide-react";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

function daysLeft(date: Date | null) {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date | null) {
  if (!date) return "-";
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function StatusBar({ days, label }: { days: number | null; label: string }) {
  if (days === null) return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-200/60 last:border-0">
      <span className="text-slate-500 text-xs sm:text-sm">{label}</span>
      <span className="text-slate-400 text-xs font-semibold">Tidak Dikonfigurasi</span>
    </div>
  );

  const isExpired = days < 0;
  const isCritical = days <= 7;
  const isWarning = days <= 14;
  const isAlert = days <= 30;

  const colorClass = isExpired || isCritical
    ? "text-rose-600"
    : isWarning || isAlert
    ? "text-amber-600"
    : "text-emerald-600";

  const barColor = isExpired || isCritical
    ? "bg-rose-500"
    : isWarning || isAlert
    ? "bg-amber-500"
    : "bg-emerald-500";

  const pct = isExpired ? 0 : Math.min(100, Math.round((days / 365) * 100));

  return (
    <div className="py-2.5 border-b border-slate-200/60 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-slate-700 text-xs sm:text-sm font-semibold">{label}</span>
        <span className={`text-xs sm:text-sm font-black ${colorClass}`}>
          {isExpired ? "⚠ EXPIRED" : `${days} hari lagi`}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
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
    <div className="space-y-6">
      <FadeUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Domain & Hosting</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau status masa aktif domain, server hosting, dan SSL Certificate website Anda.
          </p>
        </div>
        <a
          href={`https://wa.me/${WA}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#1E242E] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <MessageCircle className="w-4 h-4 text-slate-200" />
          Perpanjang via WhatsApp
        </a>
      </FadeUp>

      {records.length === 0 ? (
        <FadeUp delay={0.1}>
          <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-xs">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
              <Globe className="w-7 h-7" />
            </div>
            <h2 className="text-slate-900 font-bold text-base mb-1">Belum Ada Data Hosting</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-6">
              Data domain dan hosting Anda belum dikonfigurasi di portal. Hubungi tim MFWEB untuk menghubungkan domain Anda.
            </p>
            <a
              href={`https://wa.me/${WA}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1E242E] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi Tim MFWEB
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

            const badgeClasses = {
              AMAN:      "bg-emerald-50 text-emerald-800 border-emerald-200",
              SEGERA:    "bg-amber-50 text-amber-800 border-amber-200",
              PERHATIAN: "bg-amber-50 text-amber-800 border-amber-200",
              KRITIS:    "bg-rose-50 text-rose-800 border-rose-200",
              EXPIRED:   "bg-rose-50 text-rose-800 border-rose-200",
              SUSPENDED: "bg-slate-100 text-slate-600 border-slate-200",
            }[overallStatus] ?? "bg-slate-100 text-slate-700 border-slate-200";

            return (
              <StaggerItem key={record.id}>
                <div className="rounded-2xl p-6 sm:p-7 border border-slate-200/90 bg-white shadow-xs">
                  {/* Header */}
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-slate-900 font-black text-xl tracking-tight">{record.domainName}</h2>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {[record.hostingProvider, record.hostingPlan].filter(Boolean).join(" • ") || "Server Hosting Aktif"}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${badgeClasses}`}>
                      {overallStatus === "AMAN" && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                      {(overallStatus === "KRITIS" || overallStatus === "EXPIRED") && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                      {overallStatus === "SEGERA" && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {overallStatus}
                    </span>
                  </div>

                  {/* Status bars */}
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70 mb-5">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">Masa Berlaku Layanan</p>
                    <StatusBar days={domainDays}  label="Domain Website" />
                    <StatusBar days={hostingDays} label="Paket Hosting" />
                    <StatusBar days={sslDays}     label="Sertifikat Keamanan (SSL)" />
                  </div>

                  {/* Detail info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {record.domainProvider && (
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Registrar Domain</p>
                        <p className="text-slate-800 font-bold text-sm mt-0.5">{record.domainProvider}</p>
                      </div>
                    )}
                    {record.domainExpiry && (
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Domain Expired</p>
                        <p className="text-slate-800 font-bold text-sm mt-0.5">{formatDate(record.domainExpiry)}</p>
                      </div>
                    )}
                    {record.hostingExpiry && (
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Hosting Expired</p>
                        <p className="text-slate-800 font-bold text-sm mt-0.5">{formatDate(record.hostingExpiry)}</p>
                      </div>
                    )}
                  </div>

                  {record.notes && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                      <p className="text-slate-600 text-xs leading-relaxed font-medium">{record.notes}</p>
                    </div>
                  )}

                  {(overallStatus === "KRITIS" || overallStatus === "PERHATIAN" || overallStatus === "EXPIRED") && (
                    <a
                      href={`https://wa.me/${WA}?text=${encodeURIComponent(`Halo MFWEB, saya ingin memperpanjang layanan untuk domain ${record.domainName}. Mohon informasi biaya dan prosedurnya.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 mt-5 w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl font-bold text-xs shadow-2xs transition-all"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Perpanjang Segera via WhatsApp
                    </a>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      )}
    </div>
  );
}
