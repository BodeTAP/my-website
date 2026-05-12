import { ArrowDownLeft, ArrowUpRight, Coins, History, PlusCircle, RotateCcw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/permissions";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import AdminCreditAdjustForm from "./AdminCreditAdjustForm";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminCreditsPage() {
  await requireModule("clients");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [clients, transactions, usageThisMonth] = await Promise.all([
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        credit: { select: { balance: true, updatedAt: true } },
      },
    }),
    prisma.creditTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        client: {
          select: {
            businessName: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    }),
    prisma.creditTransaction.aggregate({
      where: {
        type: "USE",
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalBalance = clients.reduce((sum, client) => sum + (client.credit?.balance ?? 0), 0);
  const activeCreditClients = clients.filter((client) => (client.credit?.balance ?? 0) > 0).length;
  const usedThisMonth = Math.abs(usageThisMonth._sum.amount ?? 0);

  return (
    <div className="space-y-8">
      <FadeUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative">
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-amber-500/15 rounded-full blur-[70px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
              <Coins className="w-5 h-5 text-amber-300" />
            </div>
            Kredit Klien
          </h1>
          <p className="text-blue-200/60 text-sm mt-2 max-w-2xl">
            Pantau saldo tools klien, riwayat transaksi, dan lakukan topup atau refund manual saat dibutuhkan support.
          </p>
        </div>
      </FadeUp>

      <StaggerChildren stagger={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StaggerItem>
          <div className="glass rounded-2xl p-6 border border-amber-500/15">
            <p className="text-blue-200/45 text-xs uppercase tracking-widest font-black mb-2">Total Saldo</p>
            <p className="text-4xl font-black text-white">{totalBalance}</p>
            <p className="text-amber-300/80 text-sm mt-1">kredit tersedia</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="glass rounded-2xl p-6 border border-blue-500/15">
            <p className="text-blue-200/45 text-xs uppercase tracking-widest font-black mb-2">Klien Ber-saldo</p>
            <p className="text-4xl font-black text-white">{activeCreditClients}</p>
            <p className="text-blue-300/80 text-sm mt-1">dari {clients.length} klien</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="glass rounded-2xl p-6 border border-red-500/15">
            <p className="text-blue-200/45 text-xs uppercase tracking-widest font-black mb-2">Dipakai Bulan Ini</p>
            <p className="text-4xl font-black text-white">{usedThisMonth}</p>
            <p className="text-red-300/80 text-sm mt-1">kredit penggunaan tools</p>
          </div>
        </StaggerItem>
      </StaggerChildren>

      <div className="grid grid-cols-1 2xl:grid-cols-[1.25fr_0.75fr] gap-6">
        <FadeUp delay={0.1}>
          <div className="glass rounded-3xl border border-white/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-amber-300" />
              <h2 className="text-white font-bold text-lg">Saldo per Klien</h2>
            </div>
            <div className="md:hidden divide-y divide-white/5">
              {clients.map((client) => (
                <div key={client.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate">{client.businessName}</p>
                      <p className="text-blue-200/40 text-xs mt-1 truncate">{client.user.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-amber-300">{client.credit?.balance ?? 0}</p>
                      <p className="text-blue-200/35 text-[11px]">kredit</p>
                    </div>
                  </div>
                  <p className="text-blue-200/35 text-xs">
                    {client.credit?.updatedAt ? `Update: ${formatDate(client.credit.updatedAt)}` : "Belum ada record"}
                  </p>
                  <AdminCreditAdjustForm clientId={client.id} clientName={client.businessName} mobile />
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-blue-200/40 border-b border-white/5">
                    <th className="px-6 py-3 font-bold">Klien</th>
                    <th className="px-6 py-3 font-bold">Saldo</th>
                    <th className="px-6 py-3 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-white/5 last:border-0 align-top">
                      <td className="px-6 py-5 min-w-[240px]">
                        <p className="text-white font-bold">{client.businessName}</p>
                        <p className="text-blue-200/40 text-xs mt-1">{client.user.email}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-2xl font-black text-amber-300">{client.credit?.balance ?? 0}</p>
                        <p className="text-blue-200/35 text-xs mt-1">
                          {client.credit?.updatedAt ? `Update: ${formatDate(client.credit.updatedAt)}` : "Belum ada record"}
                        </p>
                      </td>
                      <td className="px-6 py-5 min-w-[520px]">
                        <AdminCreditAdjustForm clientId={client.id} clientName={client.businessName} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="glass rounded-3xl border border-white/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
              <History className="w-5 h-5 text-blue-300" />
              <h2 className="text-white font-bold text-lg">Riwayat Terbaru</h2>
            </div>
            <div className="divide-y divide-white/5 max-h-[720px] overflow-y-auto custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-blue-200/35 text-sm">Belum ada transaksi kredit.</div>
              ) : (
                transactions.map((tx) => {
                  const positive = tx.amount > 0;
                  return (
                    <div key={tx.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-white font-bold truncate">{tx.client.businessName}</p>
                          <p className="text-blue-200/45 text-xs mt-1">{tx.description}</p>
                          <p className="text-blue-200/30 text-xs mt-2">{formatDate(tx.createdAt)}</p>
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-black border ${positive ? "text-green-300 bg-green-500/10 border-green-500/20" : "text-red-300 bg-red-500/10 border-red-500/20"}`}>
                          {positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          {positive ? "+" : ""}{tx.amount}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-blue-200/35">
                        <RotateCcw className="w-3.5 h-3.5" />
                        {tx.type}{tx.tool ? ` / ${tx.tool}` : ""}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
