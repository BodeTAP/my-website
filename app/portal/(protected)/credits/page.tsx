import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Coins, ReceiptText, Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientBalance } from "@/lib/credits";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import BuyCreditButton from "./BuyCreditButton";
import CreditHistoryPagination from "./CreditHistoryPagination";

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

const HISTORY_PER_PAGE = 10;

function clampPage(value: string | undefined, totalPages: number) {
  const page = Number(value ?? "1");
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.trunc(page), Math.max(totalPages, 1));
}

export default async function PortalCreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const transactionTotal = await prisma.creditTransaction.count({
    where: { clientId: user.client.id },
  });
  const totalPages = Math.max(1, Math.ceil(transactionTotal / HISTORY_PER_PAGE));
  const page = clampPage(params.page, totalPages);
  const startIdx = transactionTotal > 0 ? (page - 1) * HISTORY_PER_PAGE + 1 : 0;
  const endIdx = Math.min(page * HISTORY_PER_PAGE, transactionTotal);

  const [balance, transactions, packages] = await Promise.all([
    getClientBalance(user.client.id),
    prisma.creditTransaction.findMany({
      where: { clientId: user.client.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * HISTORY_PER_PAGE,
      take: HISTORY_PER_PAGE,
    }),
    prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Top balance banner */}
      <FadeUp className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo Kredit</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">Aktif</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">Kredit Tools</h1>
              <p className="mt-1 text-xs text-slate-500">
                Digunakan untuk Lead Finder, Proposal Generator, dan Invoice Generator.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-3 sm:min-w-44 sm:block sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900/70">Kredit Tersedia</p>
            <p className="text-3xl font-black leading-none tracking-tight text-amber-950 mt-1">
              {balance}
              <span className="ml-1.5 text-xs font-bold text-amber-800/80">kredit</span>
            </p>
          </div>
        </div>
      </FadeUp>

      {balance < 10 && (
        <FadeUp delay={0.05}>
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center shadow-2xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
              <p className="text-xs sm:text-sm font-semibold text-amber-950">Kredit hampir habis. Tambah saldo agar aktivitas tools bisnis Anda tetap lancar.</p>
            </div>
            <Link href="/portal/tools" className="text-xs sm:text-sm font-bold text-amber-900 hover:text-amber-950 underline underline-offset-2">
              Lihat Tools →
            </Link>
          </div>
        </FadeUp>
      )}

      {/* Credit packages grid */}
      <div>
        <div className="mb-3">
          <h2 className="text-slate-900 font-bold text-base tracking-tight">Pilih Paket Top-up Kredit</h2>
          <p className="text-slate-500 text-xs">Pilih nominal kredit yang sesuai dengan kebutuhan prospek bisnis Anda.</p>
        </div>
        <StaggerChildren stagger={0.08} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {packages.map((pkg) => {
            const totalCredits = pkg.credits + pkg.bonusCredit;
            return (
              <StaggerItem key={pkg.id}>
                <div className="flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-colors hover:border-slate-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
                        <Coins className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-black text-slate-900">{pkg.name}</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {pkg.credits} kredit{pkg.bonusCredit > 0 ? ` + ${pkg.bonusCredit} bonus` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-900">
                      {totalCredits} krd
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between md:flex-col md:items-stretch lg:flex-row lg:items-center">
                    <div>
                      <p className="text-lg font-black text-slate-900">{formatRupiah(pkg.price)}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sekali Bayar</p>
                    </div>
                    <div className="sm:w-36 md:w-full lg:w-36">
                      <BuyCreditButton packageId={pkg.id} />
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>

      {/* Credit History Table */}
      <FadeUp delay={0.15}>
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs">
                <ReceiptText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Riwayat Mutasi Kredit</h2>
                <p className="text-xs text-slate-500">
                  Menampilkan {startIdx}-{endIdx} dari {transactionTotal} transaksi
                </p>
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-10 text-center text-xs sm:text-sm text-slate-400">Belum ada riwayat transaksi kredit.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50 text-left text-slate-500 text-[11px] uppercase tracking-wider">
                    <th className="px-5 py-3 font-bold">Tanggal</th>
                    <th className="px-5 py-3 font-bold">Keterangan</th>
                    <th className="px-5 py-3 text-right font-bold">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const positive = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="whitespace-nowrap px-5 py-3.5 text-slate-500 text-xs font-medium">{formatDate(tx.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-7 w-7 items-center justify-center rounded-lg border shrink-0 ${positive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                              {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                            </span>
                            <div>
                              <p className="text-slate-900 font-semibold text-xs sm:text-sm">{tx.description}</p>
                              {tx.tool && <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">{tx.tool.replace(/_/g, " ")}</p>}
                            </div>
                          </div>
                        </td>
                        <td className={`px-5 py-3.5 text-right font-black text-sm whitespace-nowrap ${positive ? "text-emerald-700" : "text-slate-800"}`}>
                          {positive ? "+" : ""}{tx.amount} krd
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {transactionTotal > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 p-4 sm:flex-row">
              <p className="text-xs text-slate-500 font-medium">
                Halaman <span className="text-slate-900 font-bold">{page}</span> dari <span className="text-slate-900 font-bold">{totalPages}</span>
              </p>
              <CreditHistoryPagination totalPages={totalPages} />
            </div>
          )}
        </div>
      </FadeUp>
    </div>
  );
}
