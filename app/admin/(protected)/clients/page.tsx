import { prisma } from "@/lib/prisma";
import ClientsClient from "./ClientsClient";
import { FadeUp } from "@/components/public/motion";
import { UsersRound } from "lucide-react";
import { requireModule } from "@/lib/permissions";

export default async function AdminClientsPage() {
  await requireModule("clients");
  const rawClients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      accountManager: { select: { id: true, name: true, email: true } },
      credit: { select: { balance: true, updatedAt: true } },
      invoices: {
        where: { status: "UNPAID" },
        select: { id: true, amount: true, dueDate: true, status: true },
      },
      tickets: {
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
        select: { id: true, status: true },
      },
      hostingRecords: {
        select: {
          id: true,
          domainName: true,
          domainExpiry: true,
          hostingExpiry: true,
          sslExpiry: true,
          status: true,
        },
      },
      _count: {
        select: {
          projects: true,
          invoices: true,
          tickets: true,
          hostingRecords: true,
          generatedProposals: true,
          generatedInvoices: true,
          leadFinderLists: true,
        },
      },
    },
  });
  const clients = rawClients.map((client) => ({
    ...client,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
    lastContactedAt: client.lastContactedAt?.toISOString() ?? null,
    credit: client.credit
      ? { balance: client.credit.balance, updatedAt: client.credit.updatedAt.toISOString() }
      : null,
    invoices: client.invoices.map((invoice) => ({
      ...invoice,
      dueDate: invoice.dueDate?.toISOString() ?? null,
    })),
    hostingRecords: client.hostingRecords.map((record) => ({
      ...record,
      domainExpiry: record.domainExpiry?.toISOString() ?? null,
      hostingExpiry: record.hostingExpiry?.toISOString() ?? null,
      sslExpiry: record.sslExpiry?.toISOString() ?? null,
    })),
  }));

  return (
    <div className="space-y-6">
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-px w-6 bg-slate-400" />
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
              Direktori Klien
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <UsersRound className="w-5 h-5 text-slate-700" />
            </div>
            Daftar Klien
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-normal">
            Kelola direktori kontak klien. Pastikan <strong className="text-slate-900 font-semibold">nomor WhatsApp terisi</strong> agar notifikasi tagihan dapat terkirim otomatis.
          </p>
        </div>
      </FadeUp>
      
      <div>
        <ClientsClient clients={clients} />
      </div>
    </div>
  );
}
