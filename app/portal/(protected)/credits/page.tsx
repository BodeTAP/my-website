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
    <div className="space-y-5">
      <FadeUp className="rounded-2xl border border-white/10 bg-[#071225] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
              <Wallet className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-200/55">Saldo Aktif</p>
              <h1 className="text-xl font-bold text-white">Kredit</h1>
              <p className="mt-1 text-xs text-blue-200/50">
                Untuk Lead Finder, Proposal Generator, dan Invoice Generator.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 sm:min-w-40 sm:block sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/55">Tersedia</p>
            <p className="text-2xl font-black leading-none tracking-tight text-amber-200">
              {balance}
              <span className="ml-1 text-xs font-bold text-amber-100/55">kredit</span>
            </p>
          </div>
        </div>
      </FadeUp>

      {balance < 10 && (
        <FadeUp delay={0.05}>
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
              <p className="text-sm font-semibold text-amber-100">Kredit hampir habis. Tambah saldo agar tools tetap lancar dipakai.</p>
            </div>
            <Link href="/portal/tools" className="text-sm font-bold text-amber-300 transition-colors hover:text-white">
              Lihat tools
            </Link>
          </div>
        </FadeUp>
      )}

      <StaggerChildren stagger={0.08} className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {packages.map((pkg) => {
          const totalCredits = pkg.credits + pkg.bonusCredit;
          return (
            <StaggerItem key={pkg.id}>
              <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#071225] p-4 transition-colors hover:border-amber-500/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                      <Coins className="h-4 w-4 text-amber-300" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black text-white">{pkg.name}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-blue-200/50">
                        {pkg.credits} kredit{pkg.bonusCredit > 0 ? ` + ${pkg.bonusCredit} bonus` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-200">
                    {totalCredits}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between md:flex-col md:items-stretch lg:flex-row lg:items-center">
                  <div>
                    <p className="text-lg font-black text-white">{formatRupiah(pkg.price)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200/35">Sekali bayar</p>
                  </div>
                  <div className="sm:w-32 md:w-full lg:w-32">
                    <BuyCreditButton packageId={pkg.id} />
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      <FadeUp delay={0.15}>
        <div className="rounded-2xl border border-white/10 bg-[#071225] overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <ReceiptText className="h-4 w-4 text-blue-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Riwayat Kredit</h2>
                <p className="text-xs text-blue-200/45">
                  Menampilkan {startIdx}-{endIdx} dari {transactionTotal} transaksi
                </p>
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-blue-200/35">Belum ada transaksi kredit.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-blue-200/40">
                    <th className="px-4 py-2.5 font-bold sm:px-5">Tanggal</th>
                    <th className="px-4 py-2.5 font-bold sm:px-5">Deskripsi</th>
                    <th className="px-4 py-2.5 text-right font-bold sm:px-5">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const positive = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="border-b border-white/5 last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 text-blue-200/55 sm:px-5">{formatDate(tx.createdAt)}</td>
                        <td className="px-4 py-3 sm:px-5">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${positive ? "border-green-500/20 bg-green-500/10 text-green-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
                              {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                            </span>
                            <div>
                              <p className="text-white font-medium">{tx.description}</p>
                              {tx.tool && <p className="text-blue-200/35 text-xs mt-0.5">{tx.tool}</p>}
                            </div>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-right font-black sm:px-5 ${positive ? "text-green-300" : "text-red-300"}`}>
                          {positive ? "+" : ""}{tx.amount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {transactionTotal > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 bg-black/20 p-4 sm:flex-row">
              <p className="text-xs text-blue-200/40 font-medium">
                Halaman <span className="text-blue-200">{page}</span> dari <span className="text-blue-200">{totalPages}</span>
              </p>
              <CreditHistoryPagination totalPages={totalPages} />
            </div>
          )}
        </div>
      </FadeUp>
    </div>
  );
}
