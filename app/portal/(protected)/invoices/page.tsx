import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";
import PayInvoiceButton from "./PayInvoiceButton";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export default async function PortalInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: true },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const statusFilter = status === "paid" ? "PAID" : status === "unpaid" ? "UNPAID" : undefined;

  const [invoices, settings] = await Promise.all([
    prisma.invoice.findMany({
      where:   {
        clientId: user.client.id,
        ...(statusFilter ? { status: statusFilter } : {})
      },
      orderBy: { createdAt: "desc" },
    }),
    getSiteSettings(),
  ]);

  return (
    <div className="space-y-6">
      <FadeUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Invoice</h1>
          <p className="text-slate-500 text-sm mt-1">Cek tagihan, status pembayaran, dan unduh PDF invoice resmi.</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit overflow-x-auto shadow-2xs">
          <Link href="/portal/invoices" className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${!status ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}>
            Semua
          </Link>
          <Link href="/portal/invoices?status=unpaid" className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${status === 'unpaid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}>
            Belum Dibayar
          </Link>
          <Link href="/portal/invoices?status=paid" className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${status === 'paid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}>
            Lunas
          </Link>
        </div>
      </FadeUp>

      <div className="space-y-3.5">
        {invoices.length === 0 ? (
          <FadeUp delay={0.1} className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
            {status ? `Tidak ada invoice dengan status ${status === 'paid' ? 'Lunas' : 'Belum Dibayar'}` : 'Belum ada invoice yang terdaftar.'}
          </FadeUp>
        ) : (
          <StaggerChildren stagger={0.05} className="space-y-3.5">
            {invoices.map((inv) => (
              <StaggerItem key={inv.id}>
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-900 font-bold font-mono text-sm bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">{inv.invoiceNo}</span>
                        {inv.status === "PAID" && (
                          <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md text-emerald-800 bg-emerald-50 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Lunas
                          </span>
                        )}
                        {inv.status === "UNPAID" && (
                          <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md text-amber-800 bg-amber-50 border border-amber-200">
                            Belum Dibayar
                          </span>
                        )}
                        {inv.status === "EXPIRED" && (
                          <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
                            <Clock className="w-3 h-3 mr-1" /> Kadaluarsa
                          </span>
                        )}
                        {inv.status === "FAILED" && (
                          <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md text-rose-800 bg-rose-50 border border-rose-200">
                            <XCircle className="w-3 h-3 mr-1" /> Gagal
                          </span>
                        )}
                      </div>
                      {inv.description && (
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">{inv.description}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-slate-500">
                        {inv.dueDate && (
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Jatuh tempo: <span className="text-slate-800 font-semibold">{fmtDate(inv.dueDate)}</span></span>
                        )}
                        {inv.paidAt && (
                          <span className="text-emerald-700 font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dibayar: {fmtDate(inv.paidAt)}</span>
                        )}
                      </div>
                    </div>

                    {/* Amount + Actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3.5 shrink-0 pt-4 sm:pt-0 border-t border-slate-100 sm:border-0 mt-2 sm:mt-0 flex-wrap">
                      <span className="text-slate-900 font-black text-xl tracking-tight">{formatRupiah(inv.amount)}</span>
                      <div className="flex items-center gap-2">
                        <DownloadInvoiceButton invoiceId={inv.id} invoiceNo={inv.invoiceNo} variant="outline" />
                        {(inv.status === "UNPAID") && (
                          <PayInvoiceButton invoiceId={inv.id} existingPaymentUrl={inv.paymentUrl} invoiceNo={inv.invoiceNo} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tripay reference */}
                  {inv.tripayRef && (inv.status === "UNPAID" || inv.status === "EXPIRED" || inv.status === "FAILED") && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <p className="text-slate-500">Ref. Pembayaran: <span className="font-mono text-slate-800 font-bold">{inv.tripayRef}</span></p>
                      <p className="text-slate-400 text-[11px]">Pembayaran diproses otomatis oleh Tripay</p>
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </div>

      <p className="text-slate-400 text-xs text-center mt-8">
        {settings.payment_default_instructions} Hubungi kami jika ada kendala pembayaran.
      </p>
    </div>
  );
}
