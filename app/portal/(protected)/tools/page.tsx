import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, ClipboardList, Coins, FileText, ReceiptText, Search, Wrench } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientBalance } from "@/lib/credits";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import ToolActionButton from "./ToolActionButton";

export default async function PortalToolsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const balance = await getClientBalance(user.client.id);

  return (
    <div className="space-y-6">
      <FadeUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-300" />
            </div>
            <h1 className="text-2xl font-bold text-white">Tools</h1>
          </div>
          <p className="text-blue-200/50 text-sm">Pilih tools pemasaran dan produktivitas untuk bisnis Anda.</p>
        </div>
        <Link href="/portal/credits" className="w-fit">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 hover:bg-amber-500/15 transition-colors">
            <Coins className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-amber-200/55 text-[10px] uppercase tracking-widest font-black">Saldo</p>
              <p className="text-white font-black">{balance} kredit</p>
            </div>
          </div>
        </Link>
      </FadeUp>

      {balance < 10 && (
        <FadeUp delay={0.05}>
          <Link
            href="/portal/credits"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-5 py-4 text-amber-100 hover:bg-amber-500/15 transition-colors"
          >
            <span className="flex items-center gap-3 text-sm font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              Kredit hampir habis! Beli sekarang
            </span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </Link>
        </FadeUp>
      )}

      <StaggerChildren stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StaggerItem>
          <div className="glass rounded-2xl p-6 border border-blue-500/20 h-full flex flex-col hover:border-blue-400/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
              <Search className="w-6 h-6 text-blue-300" />
            </div>
            <h2 className="text-white font-black text-xl">Lead Finder</h2>
            <p className="text-blue-200/50 text-sm mt-2 leading-relaxed">Temukan bisnis lokal dari Google Maps</p>
            <p className="text-amber-300 text-sm font-bold mt-5">5 kredit/pencarian</p>
            <div className="mt-auto pt-6">
              <ToolActionButton
                href={balance < 5 ? "/portal/credits" : "/portal/tools/lead-finder"}
                label={balance < 5 ? "Beli Kredit" : "Gunakan"}
                loadingLabel={balance < 5 ? "Membuka..." : "Memuat..."}
                className={`w-full h-11 rounded-xl font-bold ${balance < 5 ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
              />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="glass rounded-2xl p-6 border border-white/5 h-full flex flex-col opacity-70">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <FileText className="w-6 h-6 text-blue-200/45" />
            </div>
            <h2 className="text-white font-black text-xl">Proposal Generator</h2>
            <p className="text-blue-200/40 text-sm mt-2 leading-relaxed">Buat draft proposal berbasis brief klien.</p>
            <span className="mt-auto w-fit rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-blue-200/45">Segera Hadir</span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="glass rounded-2xl p-6 border border-white/5 h-full flex flex-col opacity-70">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <ClipboardList className="w-6 h-6 text-blue-200/45" />
            </div>
            <h2 className="text-white font-black text-xl">Brief Generator</h2>
            <p className="text-blue-200/40 text-sm mt-2 leading-relaxed">Susun brief proyek dari kebutuhan bisnis.</p>
            <span className="mt-auto w-fit rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-blue-200/45">Segera Hadir</span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="glass rounded-2xl p-6 border border-white/5 h-full flex flex-col opacity-70">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <ReceiptText className="w-6 h-6 text-blue-200/45" />
            </div>
            <h2 className="text-white font-black text-xl">Invoice Generator</h2>
            <p className="text-blue-200/40 text-sm mt-2 leading-relaxed">Buat invoice cepat dari detail layanan dan tagihan.</p>
            <span className="mt-auto w-fit rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-blue-200/45">Segera Hadir</span>
          </div>
        </StaggerItem>
      </StaggerChildren>
    </div>
  );
}
