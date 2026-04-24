import { prisma } from "@/lib/prisma";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewInvoiceModal from "@/components/admin/NewInvoiceModal";
import InvoiceStatusToggle from "./InvoiceStatusToggle";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";
import DeleteInvoiceButton from "@/components/admin/DeleteInvoiceButton";

const WA_NUMBER = process.env.WHATSAPP_NUMBER ?? "6282221682343";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function InvoicesPage() {
  const [invoices, clients] = await Promise.all([
    prisma.invoice.findMany({
      include: { client: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { businessName: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Manajemen Invoice</h1>
          <p className="text-blue-200/50 text-sm mt-1">{invoices.length} invoice</p>
        </div>
        <NewInvoiceModal clients={clients} />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs">No. Invoice</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs">Klien</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs hidden sm:table-cell">Deskripsi</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs">Jumlah</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs hidden md:table-cell">Jatuh Tempo</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs">Status</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs">Aksi</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs">PDF</th>
                <th className="px-4 sm:px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-blue-200/30">
                    Belum ada invoice. Klik "Invoice Baru" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const waMsg =
                    inv.whatsappMsg ??
                    `Halo ${inv.client.user.name ?? inv.client.businessName}, berikut tagihan ${inv.invoiceNo} sebesar ${formatRupiah(inv.amount)}. Mohon segera dikonfirmasi pembayarannya.`;
                  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;

                  return (
                    <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 sm:px-5 py-4 text-blue-200/70 font-mono text-xs">
                        {inv.invoiceNo}
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <p className="text-white font-medium text-sm">{inv.client.businessName}</p>
                        <p className="text-blue-200/40 text-xs">{inv.client.user.name}</p>
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-blue-200/60 text-xs hidden sm:table-cell max-w-40">
                        <p className="line-clamp-2">{inv.description ?? "—"}</p>
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-white font-semibold text-sm whitespace-nowrap">
                        {formatRupiah(inv.amount)}
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-blue-200/50 text-xs hidden md:table-cell whitespace-nowrap">
                        {inv.dueDate
                          ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(inv.dueDate))
                          : "—"}
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <InvoiceStatusToggle invoiceId={inv.id} currentStatus={inv.status} />
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        {inv.status === "UNPAID" && (
                          <a href={waUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-green-600/80 hover:bg-green-600 text-white h-8 px-3 text-xs whitespace-nowrap">
                              <MessageCircle className="w-3.5 h-3.5 mr-1" />
                              Tagih WA
                            </Button>
                          </a>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <DownloadInvoiceButton invoiceId={inv.id} invoiceNo={inv.invoiceNo} variant="outline" />
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <DeleteInvoiceButton invoiceId={inv.id} invoiceNo={inv.invoiceNo} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
