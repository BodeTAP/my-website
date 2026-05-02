import { prisma } from "@/lib/prisma";
import { MessageCircle, Link2, FileWarning, Receipt } from "lucide-react";
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
  const params = await searchParams;
  const q = params.q || "";
  const status = params.status || "";
  const page = Number(params.page || "1");
  const PER_PAGE = 10;

  const validStatuses = ["UNPAID", "PAID", "EXPIRED", "FAILED"];
  const finalStatus = validStatuses.includes(status) ? status : undefined;

  const where = {
    ...(q
      ? {
          OR: [
            { invoiceNo: { contains: q, mode: "insensitive" as const } },
            { client: { businessName: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(finalStatus ? { status: finalStatus as any } : {}),
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
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-600/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-500/10 flex items-center justify-center ring-1 ring-teal-500/20">
              <Receipt className="w-5 h-5 text-teal-400" />
            </div>
            Manajemen Invoice
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">{total} invoice tercatat di sistem.</p>
        </div>
        <div className="relative z-10">
          <NewInvoiceModal clients={clients} />
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-white/5 relative z-10">
          <InvoiceSearch />
          <InvoiceFilter />
        </div>
      </FadeUp>

      <FadeUp delay={0.2} className="relative z-10">
        <div className="glass rounded-3xl overflow-hidden mb-6 border border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">No. Invoice</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Klien</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase hidden sm:table-cell">Deskripsi</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Jumlah</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase hidden md:table-cell">Jatuh Tempo</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Tagih</th>
                  <th className="text-right px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 relative">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                          <FileWarning className="w-8 h-8 text-blue-200/20" />
                        </div>
                        <p className="text-blue-200/50 font-medium">Belum ada invoice. Klik "Invoice Baru" untuk membuat tagihan.</p>
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
                      <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="text-blue-200/70 font-mono text-xs group-hover:text-teal-300 transition-colors">{inv.invoiceNo}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-white font-bold text-sm">{inv.client.businessName}</p>
                          <p className="text-blue-200/40 text-xs mt-0.5">{inv.client.user.name}</p>
                        </td>
                        <td className="px-6 py-5 text-blue-200/60 text-xs hidden sm:table-cell max-w-48">
                          <p className="line-clamp-2">{inv.description ?? "—"}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-white font-semibold text-sm whitespace-nowrap tracking-wide">{formatRupiah(inv.amount)}</p>
                        </td>
                        <td className="px-6 py-5 text-blue-200/50 text-xs font-medium hidden md:table-cell whitespace-nowrap">
                          {inv.dueDate
                            ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(inv.dueDate))
                            : "—"}
                        </td>
                        <td className="px-6 py-5">
                          <InvoiceStatusToggle invoiceId={inv.id} currentStatus={inv.status} />
                        </td>
                        <td className="px-6 py-5">
                          {(inv.status === "UNPAID" || inv.status === "EXPIRED" || inv.status === "FAILED") && (
                            <div className="flex items-center gap-2">
                              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="bg-green-600/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/30 h-8 px-3 text-xs whitespace-nowrap transition-all shadow-none hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                                  WA
                                </Button>
                              </a>
                              <CopyPayLinkButton link={payLink} />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass p-4 sm:px-6 rounded-2xl border border-white/5 relative z-10">
            <p className="text-xs text-blue-200/40 font-medium">
              Menampilkan <span className="text-blue-200">{startIdx}-{endIdx}</span> dari <span className="text-blue-200">{total}</span> invoice
            </p>
            <InvoicePagination totalPages={totalPages} />
          </div>
        </FadeUp>
      )}
    </div>
  );
}
