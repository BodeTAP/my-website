import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Clock, FileText, XCircle, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fetchPaymentChannels } from "@/lib/tripay";
import { getSiteSettings } from "@/lib/siteSettings";
import PaymentSelector from "./PaymentSelector";
import { ScaleIn, FadeUp, StaggerChildren, SlideIn } from "@/components/public/motion";

type Params = { params: Promise<{ invoiceNo: string }> };
type LineItem = { label: string; amount: number };

export const metadata: Metadata = {
  title: "Pembayaran Invoice",
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

  const [invoice, channels, settings] = await Promise.all([
    prisma.invoice.findUnique({
      where:   { invoiceNo: decoded },
      include: { client: { include: { user: { select: { name: true } } } } },
    }),
    fetchPaymentChannels(),
    getSiteSettings(),
  ]);

  if (!invoice) notFound();

  const isPaid    = invoice.status === "PAID";
  const isExpired = invoice.status === "EXPIRED";
  const isFailed  = invoice.status === "FAILED";
  const items    = (invoice.lineItems as LineItem[]) ?? [];
  const hasItems = items.length > 0 && items.some(i => i.label);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Image src={settings.brand_logo_url || "/logo.png"} alt={settings.brand_name} width={36} height={36} className="rounded-lg" />
          <span className="font-bold text-slate-900 text-xl tracking-wide">
            {settings.brand_name}
          </span>
        </div>

        {/* Invoice card */}
        <ScaleIn>
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            {/* Header: Deep Slate */}
            <div className="bg-[#1E242E] px-6 py-5 text-white border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-0.5">Dokumen Tagihan</p>
                  <p className="text-white font-bold text-lg font-mono">{invoice.invoiceNo}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* Client */}
              <div>
                <p className="text-slate-500 text-xs font-mono uppercase tracking-wider mb-1">Ditagihkan Kepada</p>
                <p className="text-slate-900 font-bold text-base">{invoice.client.businessName}</p>
                {invoice.client.user.name && (
                  <p className="text-slate-600 text-sm mt-0.5">{invoice.client.user.name}</p>
                )}
              </div>

              {/* Line items */}
              {hasItems ? (
                <StaggerChildren className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-slate-500 font-mono text-[11px] uppercase tracking-wider mb-2">Rincian Layanan</p>
                  {items.filter(i => i.label).map((item, i) => (
                    <FadeUp key={i} delay={i * 0.05} className="flex justify-between text-sm py-1 border-b border-slate-200/60 last:border-0">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-slate-900 font-mono font-medium">{formatRp(item.amount)}</span>
                    </FadeUp>
                  ))}
                </StaggerChildren>
              ) : invoice.description ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-slate-500 font-mono text-[11px] uppercase tracking-wider mb-1">Keterangan</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{invoice.description}</p>
                </div>
              ) : null}

              {/* Due date */}
              {invoice.dueDate && (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100 rounded-lg px-3 py-2 border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Jatuh tempo: </span>
                  <span className="text-slate-900 font-semibold">{fmtDate(invoice.dueDate)}</span>
                </div>
              )}

              {/* Divider + static total for non-active states */}
              {(isPaid || isExpired || isFailed) && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 font-mono text-xs uppercase tracking-wider">Total Tagihan</span>
                    <span className="text-slate-900 font-mono font-bold text-2xl">{formatRp(invoice.amount)}</span>
                  </div>
                </div>
              )}

              {/* CTA or paid state */}
              {isPaid ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mt-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-emerald-900 font-bold text-sm">Invoice Sudah Lunas</p>
                    {invoice.paidAt && (
                      <p className="text-emerald-700 text-xs font-mono mt-0.5">Dibayar pada {fmtDate(invoice.paidAt)}</p>
                    )}
                  </div>
                </div>
              ) : isExpired ? (
                <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 mt-4">
                  <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-slate-900 font-bold text-sm">Sesi Pembayaran Kadaluarsa</p>
                    <p className="text-slate-600 text-xs mt-0.5">Hubungi admin untuk memperbarui link pembayaran invoice ini.</p>
                  </div>
                </div>
              ) : isFailed ? (
                <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 mt-4">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-rose-900 font-bold text-sm">Pembayaran Gagal</p>
                    <p className="text-rose-700 text-xs mt-0.5">Silakan hubungi admin untuk bantuan konfirmasi pembayaran.</p>
                  </div>
                </div>
              ) : (
                <SlideIn delay={0.2}>
                  <PaymentSelector
                    invoiceNo={invoice.invoiceNo}
                    baseAmount={invoice.amount}
                    channels={channels}
                    feeHandling={
                      settings.payment_fee_handling === "merchant" || settings.payment_fee_handling === "split"
                        ? settings.payment_fee_handling
                        : "customer"
                    }
                  />
                </SlideIn>
              )}
            </div>
          </div>
        </ScaleIn>

        {settings.payment_default_instructions && (
          <p className="text-center text-slate-500 text-xs leading-relaxed mt-5 font-mono">
            {settings.payment_default_instructions}
          </p>
        )}

        <p className="text-center text-slate-500 text-xs mt-6">
          Ada kendala transaksi?{" "}
          <a
            href={`https://wa.me/${settings.brand_public_whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-900 underline font-semibold hover:text-black transition-colors"
          >
            Hubungi Customer Service
          </a>
        </p>
      </div>
    </div>
  );
}
