import { prisma } from "@/lib/prisma";
import type { InvoiceStatus } from "@prisma/client";
import { MessageCircle, FileWarning, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewInvoiceModal from "@/components/admin/NewInvoiceModal";
import InvoiceStatusToggle from "./InvoiceStatusToggle";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";
import DeleteInvoiceButton from "@/components/admin/DeleteInvoiceButton";
import CopyPayLinkButton from "./CopyPayLinkButton";
import { FadeUp } from "@/components/public/motion";
import InvoiceSearch from "./InvoiceSearch";
import InvoiceFilter from "./InvoiceFilter";
import InvoicePagination from "./InvoicePagination";
import { requireModule } from "@/lib/permissions";

const WA_NUMBER = process.env.WHATSAPP_NUMBER ?? "6282221682343";
const SITE      = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.id";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireModule("invoices");
  const params = await searchParams;
  const q = params.q || "";
  const status = params.status || "";
  const page = Number(params.page || "1");
  const PER_PAGE = 10;

  const validStatuses = ["UNPAID", "PAID", "EXPIRED", "FAILED"] satisfies InvoiceStatus[];
  const finalStatus = validStatuses.includes(status as InvoiceStatus) ? (status as InvoiceStatus) : undefined;

  const where = {
    ...(q
      ? {
          OR: [
            { invoiceNo: { contains: q, mode: "insensitive" as const } },
            { client: { businessName: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(finalStatus ? { status: finalStatus } : {}),
  };

  const [invoices, total, clients] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { client: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.invoice.count({ where }),
    prisma.client.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { businessName: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const startIdx = (page - 1) * PER_PAGE + 1;
  const endIdx = Math.min(page * PER_PAGE, total);

  return (
    <div>
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
              <Receipt className="w-5 h-5 text-slate-700" />
            </div>
            Manajemen Invoice
          </h1>
          <p className="text-slate-500 text-sm mt-2">{total} invoice tercatat di sistem.</p>
        </div>
        <div className="relative z-10">
          <NewInvoiceModal clients={clients} />
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs relative z-10">
          <InvoiceSearch />
          <InvoiceFilter />
        </div>
      </FadeUp>

      <FadeUp delay={0.2} className="relative z-10">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase">No. Invoice</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase">Klien</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase hidden sm:table-cell">Deskripsi</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase">Jumlah</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase hidden md:table-cell">Jatuh Tempo</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase">Status</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase">Tagih</th>
                  <th className="text-right px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 relative">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 shadow-2xs text-slate-400">
                          <FileWarning className="w-7 h-7" />
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Belum ada invoice. Klik &quot;Invoice Baru&quot; untuk membuat tagihan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const payLink = `${SITE}/bayar/${encodeURIComponent(inv.invoiceNo)}`;
                    const waMsg =
                      inv.whatsappMsg ??
                      `Halo ${inv.client.user.name ?? inv.client.businessName}, berikut tagihan ${inv.invoiceNo} sebesar ${formatRupiah(inv.amount)}. Silakan bayar melalui link berikut: ${payLink}`;
                    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-slate-700 font-mono text-xs font-semibold">{inv.invoiceNo}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-900 font-semibold text-sm">{inv.client.businessName}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{inv.client.user.name}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs hidden sm:table-cell max-w-48">
                          <p className="line-clamp-2">{inv.description ?? "—"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-900 font-bold text-sm whitespace-nowrap">{formatRupiah(inv.amount)}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-medium hidden md:table-cell whitespace-nowrap">
                          {inv.dueDate
                            ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(inv.dueDate))
                            : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <InvoiceStatusToggle invoiceId={inv.id} currentStatus={inv.status} />
                        </td>
                        <td className="px-6 py-4">
                          {(inv.status === "UNPAID" || inv.status === "EXPIRED" || inv.status === "FAILED") && (
                            <div className="flex items-center gap-2">
                              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 h-8 px-2.5 text-xs rounded-xl font-medium shadow-2xs whitespace-nowrap transition-colors">
                                  <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                  WA
                                </Button>
                              </a>
                              <CopyPayLinkButton link={payLink} />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            <DownloadInvoiceButton invoiceId={inv.id} invoiceNo={inv.invoiceNo} variant="outline" />
                            <DeleteInvoiceButton invoiceId={inv.id} invoiceNo={inv.invoiceNo} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeUp>

      {total > 0 && (
        <FadeUp delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:px-6 shadow-xs relative z-10">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="text-slate-900 font-semibold">{startIdx}-{endIdx}</span> dari <span className="text-slate-900 font-semibold">{total}</span> invoice
            </p>
            <InvoicePagination totalPages={totalPages} />
          </div>
        </FadeUp>
      )}
    </div>
  );
}
