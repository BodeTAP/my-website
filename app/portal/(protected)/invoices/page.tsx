import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";
import PayInvoiceButton from "./PayInvoiceButton";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export default async function PortalInvoicesPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: true },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const invoices = await prisma.invoice.findMany({
    where:   { clientId: user.client.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Riwayat Invoice</h1>
        <p className="text-blue-200/50 text-sm mt-1">{invoices.length} invoice</p>
      </div>

      <div className="space-y-3">
        {invoices.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-blue-200/30">
            Belum ada invoice
          </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-white font-semibold font-mono text-sm">{inv.invoiceNo}</span>
                    {inv.status === "PAID" && (
                      <Badge variant="outline" className="text-green-300 border-green-500/20 bg-green-500/5">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Lunas
                      </Badge>
                    )}
                    {inv.status === "UNPAID" && (
                      <Badge variant="outline" className="text-amber-300 border-amber-500/20 bg-amber-500/5">
                        Belum Dibayar
                      </Badge>
                    )}
                    {inv.status === "EXPIRED" && (
                      <Badge variant="outline" className="text-gray-400 border-gray-500/20 bg-gray-500/5">
                        <Clock className="w-3 h-3 mr-1" /> Kadaluarsa
                      </Badge>
                    )}
                    {inv.status === "FAILED" && (
                      <Badge variant="outline" className="text-red-400 border-red-500/20 bg-red-500/5">
                        <XCircle className="w-3 h-3 mr-1" /> Gagal
                      </Badge>
                    )}
                  </div>
                  {inv.description && (
                    <p className="text-blue-200/50 text-sm line-clamp-1 mb-1">{inv.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-blue-200/40">
                    {inv.dueDate && (
                      <span>Jatuh tempo: {fmtDate(inv.dueDate)}</span>
                    )}
                    {inv.paidAt && (
                      <span className="text-green-400/70">Dibayar: {fmtDate(inv.paidAt)}</span>
                    )}
                  </div>
                </div>

                {/* Amount + Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-white font-bold text-xl">{formatRupiah(inv.amount)}</span>
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
          ))
        )}
      </div>

      <p className="text-blue-200/25 text-xs text-center mt-8">
        Pembayaran diproses secara aman melalui Tripay Payment Gateway.
        Hubungi kami jika ada pertanyaan.
      </p>
    </div>
  );
}
