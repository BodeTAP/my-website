import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Clock, FileText, XCircle, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fetchPaymentChannels } from "@/lib/tripay";
import PaymentSelector from "./PaymentSelector";

type Params = { params: Promise<{ invoiceNo: string }> };
type LineItem = { label: string; amount: number };

export const metadata: Metadata = {
  title: "Pembayaran Invoice — MFWEB",
  robots: { index: false, follow: false },
};

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(d);
}

export default async function PublicPayPage({ params }: Params) {
  const { invoiceNo } = await params;
  const decoded = decodeURIComponent(invoiceNo);

  const [invoice, channels] = await Promise.all([
    prisma.invoice.findUnique({
      where:   { invoiceNo: decoded },
      include: { client: { include: { user: { select: { name: true } } } } },
    }),
    fetchPaymentChannels(),
  ]);

  if (!invoice) notFound();

  const isPaid    = invoice.status === "PAID";
  const isExpired = invoice.status === "EXPIRED";
  const isFailed  = invoice.status === "FAILED";
  const items    = (invoice.lineItems as LineItem[]) ?? [];
  const hasItems = items.length > 0 && items.some(i => i.label);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo.png" alt="MFWEB" width={36} height={36} />
          <span className="font-bold text-white text-xl tracking-wide">
            MF<span className="text-blue-400">WEB</span>
          </span>
        </div>

        {/* Invoice card */}
        <div className="glass rounded-2xl overflow-hidden border border-white/10">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200/70 text-xs mb-1">No. Invoice</p>
                <p className="text-white font-bold text-lg font-mono">{invoice.invoiceNo}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200/40" />
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Client */}
            <div>
              <p className="text-blue-200/50 text-xs mb-1">Tagihan untuk</p>
              <p className="text-white font-semibold">{invoice.client.businessName}</p>
              {invoice.client.user.name && (
                <p className="text-blue-200/50 text-sm">{invoice.client.user.name}</p>
              )}
            </div>

            {/* Line items */}
            {hasItems ? (
              <div className="space-y-2">
                <p className="text-blue-200/50 text-xs">Rincian</p>
                {items.filter(i => i.label).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-blue-200/70">{item.label}</span>
                    <span className="text-white font-medium">{formatRp(item.amount)}</span>
                  </div>
                ))}
              </div>
            ) : invoice.description ? (
              <div>
                <p className="text-blue-200/50 text-xs mb-1">Keterangan</p>
                <p className="text-blue-200/70 text-sm">{invoice.description}</p>
              </div>
            ) : null}

            {/* Due date */}
            {invoice.dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-blue-200/60">Jatuh tempo: </span>
                <span className="text-amber-300 font-medium">{fmtDate(invoice.dueDate)}</span>
              </div>
            )}

            {/* Divider + total */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-blue-200/60 text-sm">Total Tagihan</span>
                <span className="text-white font-black text-3xl">{formatRp(invoice.amount)}</span>
              </div>
            </div>

            {/* CTA or paid state */}
            {isPaid ? (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-green-300 font-semibold text-sm">Invoice Sudah Lunas</p>
                  {invoice.paidAt && (
                    <p className="text-green-400/60 text-xs">Dibayar pada {fmtDate(invoice.paidAt)}</p>
                  )}
                </div>
              </div>
            ) : isExpired ? (
              <div className="flex items-center gap-3 bg-gray-500/10 border border-gray-500/20 rounded-xl px-4 py-3">
                <XCircle className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-gray-300 font-semibold text-sm">Sesi Pembayaran Kadaluarsa</p>
                  <p className="text-gray-400/70 text-xs">Hubungi admin untuk memperbarui invoice ini.</p>
                </div>
              </div>
            ) : isFailed ? (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <p className="text-red-300 font-semibold text-sm">Pembayaran Gagal</p>
                  <p className="text-red-400/70 text-xs">Hubungi admin untuk bantuan lebih lanjut.</p>
                </div>
              </div>
            ) : (
              <PaymentSelector invoiceNo={invoice.invoiceNo} channels={channels} />
            )}
          </div>
        </div>

        <p className="text-center text-blue-200/30 text-xs mt-6">
          Ada pertanyaan?{" "}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400/60 hover:text-blue-300 transition-colors"
          >
            Hubungi MFWEB
          </a>
        </p>
      </div>
    </div>
  );
}
