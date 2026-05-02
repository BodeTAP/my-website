import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";
import PayInvoiceButton from "./PayInvoiceButton";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import Link from "next/link";

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

  const invoices = await prisma.invoice.findMany({
    where:   { 
      clientId: user.client.id,
      ...(statusFilter ? { status: statusFilter } : {})
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <FadeUp className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Riwayat Invoice</h1>
          <p className="text-blue-200/50 text-sm mt-1">Kelola tagihan pembayaran Anda</p>
        </div>
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 w-fit overflow-x-auto">
          <Link href="/portal/invoices" className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${!status ? 'bg-blue-600 text-white shadow-md' : 'text-blue-200/60 hover:text-white hover:bg-white/5'}`}>
            Semua
          </Link>
          <Link href="/portal/invoices?status=unpaid" className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${status === 'unpaid' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-200/60 hover:text-white hover:bg-white/5'}`}>
            Belum Dibayar
          </Link>
          <Link href="/portal/invoices?status=paid" className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${status === 'paid' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-200/60 hover:text-white hover:bg-white/5'}`}>
            Lunas
          </Link>
        </div>
      </FadeUp>

      <div className="space-y-3">
        {invoices.length === 0 ? (
          <FadeUp delay={0.1} className="glass rounded-2xl p-10 text-center text-blue-200/30 border border-white/5">
            {status ? `Tidak ada invoice dengan status ${status === 'paid' ? 'Lunas' : 'Belum Dibayar'}` : 'Belum ada invoice'}
          </FadeUp>
        ) : (
          <StaggerChildren stagger={0.05} className="space-y-3">
            {invoices.map((inv) => (
              <StaggerItem key={inv.id}>
                <div className="glass rounded-2xl p-5 hover:border-blue-500/30 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold font-mono text-sm bg-white/5 px-2 py-0.5 rounded-md border border-white/10">{inv.invoiceNo}</span>
                    {inv.status === "PAID" && (
                      <Badge variant="outline" className="text-green-300 border-green-500/20 bg-green-500/10">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Lunas
                      </Badge>
                    )}
                    {inv.status === "UNPAID" && (
                      <Badge variant="outline" className="text-amber-300 border-amber-500/20 bg-amber-500/10">
                        Belum Dibayar
                      </Badge>
                    )}
                    {inv.status === "EXPIRED" && (
                      <Badge variant="outline" className="text-gray-400 border-gray-500/20 bg-gray-500/10">
                        <Clock className="w-3 h-3 mr-1" /> Kadaluarsa
                      </Badge>
                    )}
                    {inv.status === "FAILED" && (
                      <Badge variant="outline" className="text-red-400 border-red-500/20 bg-red-500/10">
                        <XCircle className="w-3 h-3 mr-1" /> Gagal
                      </Badge>
                    )}
                  </div>
                  {inv.description && (
                    <p className="text-blue-100 text-sm leading-relaxed">{inv.description}</p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-blue-200/50">
                    {inv.dueDate && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Jatuh tempo: <span className="text-white">{fmtDate(inv.dueDate)}</span></span>
                    )}
                    {inv.paidAt && (
                      <span className="text-green-400/80 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Dibayar: {fmtDate(inv.paidAt)}</span>
                    )}
                  </div>
                </div>

                {/* Amount + Actions */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 shrink-0 pt-4 sm:pt-0 border-t border-white/10 sm:border-0 mt-3 sm:mt-0 flex-wrap">
                  <span className="text-white font-black text-xl tracking-tight bg-blue-500/10 sm:bg-transparent px-3 py-1 sm:px-0 sm:py-0 rounded-lg sm:rounded-none border border-blue-500/20 sm:border-0 text-blue-100">{formatRupiah(inv.amount)}</span>
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
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-blue-200/40 text-xs">Ref. Pembayaran: <span className="font-mono">{inv.tripayRef}</span></p>
                  <p className="text-blue-200/30 text-xs">Pembayaran diproses oleh Tripay</p>
                </div>
              )}
            </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </div>

      <p className="text-blue-200/25 text-xs text-center mt-8">
        Pembayaran diproses secara aman melalui Tripay Payment Gateway.
        Hubungi kami jika ada pertanyaan.
      </p>
    </div>
  );
}
