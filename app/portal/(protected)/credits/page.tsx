import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Coins, ReceiptText, Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientBalance, getTransactionHistory } from "@/lib/credits";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import BuyCreditButton from "./BuyCreditButton";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function PortalCreditsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const [balance, transactions, packages] = await Promise.all([
    getClientBalance(user.client.id),
    getTransactionHistory(user.client.id, 20),
    prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <FadeUp className="glass rounded-3xl p-6 sm:p-8 border border-amber-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.12)]">
                <Wallet className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <p className="text-amber-200/60 text-[11px] uppercase tracking-widest font-black">Saldo Aktif</p>
                <h1 className="text-2xl font-bold text-white">Kredit Saya</h1>
              </div>
            </div>
            <p className="text-blue-200/55 text-sm max-w-xl">
              Gunakan kredit untuk menjalankan tools pemasaran dan otomasi di portal MFWEB.
            </p>
          </div>
          <div className="rounded-2xl bg-black/35 border border-amber-500/20 px-6 py-5 min-w-[220px]">
            <p className="text-amber-200/50 text-xs font-bold uppercase tracking-widest mb-1">Tersedia</p>
            <p className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight">{balance}</p>
            <p className="text-blue-200/45 text-sm mt-1">kredit</p>
          </div>
        </div>
      </FadeUp>

      {balance < 10 && (
        <FadeUp delay={0.05}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
              <p className="text-amber-100 text-sm font-bold">Kredit hampir habis. Tambah saldo agar tools tetap bisa digunakan tanpa jeda.</p>
            </div>
            <Link href="/portal/tools" className="text-amber-300 hover:text-white text-sm font-bold transition-colors">
              Lihat tools
            </Link>
          </div>
        </FadeUp>
      )}

      <StaggerChildren stagger={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {packages.map((pkg) => {
          const totalCredits = pkg.credits + pkg.bonusCredit;
          return (
            <StaggerItem key={pkg.id}>
              <div className="glass rounded-2xl p-6 border border-white/5 h-full flex flex-col hover:border-amber-500/30 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                  <Coins className="w-6 h-6 text-amber-300" />
                </div>
                <h2 className="text-white text-xl font-black">{pkg.name}</h2>
                <p className="text-blue-200/50 text-sm mt-2 min-h-10">
                  {pkg.credits} kredit{pkg.bonusCredit > 0 ? ` + ${pkg.bonusCredit} bonus` : ""}
                </p>
                <div className="my-6">
                  <p className="text-3xl font-black text-white">{totalCredits}</p>
                  <p className="text-blue-200/40 text-xs uppercase tracking-widest font-bold">Total Kredit</p>
                </div>
                <p className="text-amber-300 font-black text-xl mb-5">{formatRupiah(pkg.price)}</p>
                <div className="mt-auto">
                  <BuyCreditButton packageId={pkg.id} />
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      <FadeUp delay={0.15}>
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ReceiptText className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Riwayat Kredit</h2>
              <p className="text-blue-200/45 text-xs">Transaksi kredit terbaru di akun Anda</p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-10 text-center text-blue-200/35 text-sm">Belum ada transaksi kredit.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-blue-200/40 border-b border-white/5">
                    <th className="px-6 py-3 font-bold">Tanggal</th>
                    <th className="px-6 py-3 font-bold">Deskripsi</th>
                    <th className="px-6 py-3 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const positive = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="border-b border-white/5 last:border-0">
                        <td className="px-6 py-4 text-blue-200/55 whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center border ${positive ? "bg-green-500/10 border-green-500/20 text-green-300" : "bg-red-500/10 border-red-500/20 text-red-300"}`}>
                              {positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            </span>
                            <div>
                              <p className="text-white font-medium">{tx.description}</p>
                              {tx.tool && <p className="text-blue-200/35 text-xs mt-0.5">{tx.tool}</p>}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-right font-black ${positive ? "text-green-300" : "text-red-300"}`}>
                          {positive ? "+" : ""}{tx.amount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </FadeUp>
    </div>
  );
}
