import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";

const WA_NUMBER = process.env.WHATSAPP_NUMBER ?? "6282221682343";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
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
    where: { clientId: user.client.id },
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
          invoices.map((inv) => {
            const amount = formatRupiah(inv.amount);
            const waMsg = `Halo MFWEB, saya ingin konfirmasi pembayaran invoice ${inv.invoiceNo} sebesar ${amount}.`;

            return (
              <div key={inv.id} className="glass rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-semibold font-mono text-sm">{inv.invoiceNo}</span>
                    <Badge variant="outline" className={inv.status === "PAID"
                      ? "text-green-300 border-green-500/20 bg-green-500/5"
                      : "text-red-300 border-red-500/20 bg-red-500/5"}>
                      {inv.status === "PAID" ? "Lunas" : "Belum Dibayar"}
                    </Badge>
                  </div>
                  {inv.description && (
                    <p className="text-blue-200/50 text-sm line-clamp-1 mb-1">{inv.description}</p>
                  )}
                  {inv.dueDate && (
                    <p className="text-blue-200/40 text-xs">
                      Jatuh tempo:{" "}
                      {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(inv.dueDate))}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-white font-bold text-lg">{amount}</span>
                  <DownloadInvoiceButton invoiceId={inv.id} invoiceNo={inv.invoiceNo} variant="outline" />
                  {inv.status === "UNPAID" && (
                    <a
                      href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-green-600 hover:bg-green-500 text-white h-8 px-3 text-xs whitespace-nowrap">
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                        Konfirmasi Bayar
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
