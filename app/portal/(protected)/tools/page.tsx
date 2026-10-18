import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, ClipboardList, Coins, FileText, ReceiptText, Search, Wrench } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientBalance } from "@/lib/credits";
import { getToolSettings } from "@/lib/toolSettings";
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

  const [balance, toolSettings] = await Promise.all([
    getClientBalance(user.client.id),
    getToolSettings(),
  ]);
  const lowCreditThreshold = toolSettings.lowCreditWarningThreshold;
  const leadFinderMinCost = Math.min(toolSettings.leadFinder.standardCost, toolSettings.leadFinder.deepCost);
  const proposalCost = toolSettings.proposalGenerator.creditCost;
  const invoiceCost = toolSettings.invoiceGenerator.creditCost;

  return (
    <div className="space-y-6">
      <FadeUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-800">
              <Wrench className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tools</h1>
          </div>
          <p className="text-slate-500 text-sm">Pilih alat yang ingin dipakai hari ini: cari lead, buat proposal, atau buat invoice PDF.</p>
        </div>
        <Link href="/portal/credits" className="w-fit">
          <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs px-4 py-3 hover:border-slate-300 transition-colors">
            <Coins className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Saldo</p>
              <p className="text-slate-900 font-black">{balance} kredit</p>
            </div>
          </div>
        </Link>
      </FadeUp>

      {balance < lowCreditThreshold && (
        <FadeUp delay={0.05}>
          <Link
            href="/portal/credits"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-amber-900 hover:bg-amber-100/60 transition-colors"
          >
            <span className="flex items-center gap-3 text-sm font-semibold">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              Kredit hampir habis. Top up dulu agar tools tetap bisa dipakai.
            </span>
            <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
          </Link>
        </FadeUp>
      )}

      <StaggerChildren stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StaggerItem>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 h-full flex flex-col shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 text-slate-700">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 font-bold text-lg tracking-tight">Lead Finder</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">Cari prospek bisnis lokal dari Google Maps, simpan list, lalu export data.</p>
            <div className="mt-4">
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                Mulai {leadFinderMinCost} kredit/pencarian
              </span>
            </div>
            <div className="mt-auto pt-6">
              {toolSettings.leadFinder.enabled ? (
                <ToolActionButton
                  href={balance < leadFinderMinCost ? "/portal/credits" : "/portal/tools/lead-finder"}
                  label={balance < leadFinderMinCost ? "Beli Kredit" : "Buka Lead Finder"}
                  loadingLabel={balance < leadFinderMinCost ? "Membuka..." : "Memuat..."}
                  className={`w-full h-11 rounded-xl font-medium text-sm transition-all shadow-xs ${
                    balance < leadFinderMinCost 
                      ? "bg-amber-500 hover:bg-amber-600 text-white" 
                      : "bg-[#1E242E] hover:bg-slate-800 text-white"
                  }`}
                />
              ) : (
                <span className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-400">
                  Nonaktif
                </span>
              )}
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 h-full flex flex-col shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 text-slate-700">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 font-bold text-lg tracking-tight">Proposal Generator</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">Buat proposal PDF dari template, brand kit, dan detail penawaran Anda.</p>
            <div className="mt-4">
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                {proposalCost} kredit/proposal
              </span>
            </div>
            <div className="mt-auto pt-6">
              {toolSettings.proposalGenerator.enabled ? (
                <ToolActionButton
                  href={balance < proposalCost ? "/portal/credits" : "/portal/tools/proposal-generator"}
                  label={balance < proposalCost ? "Beli Kredit" : "Buat Proposal"}
                  loadingLabel={balance < proposalCost ? "Membuka..." : "Memuat..."}
                  className={`w-full h-11 rounded-xl font-medium text-sm transition-all shadow-xs ${
                    balance < proposalCost 
                      ? "bg-amber-500 hover:bg-amber-600 text-white" 
                      : "bg-[#1E242E] hover:bg-slate-800 text-white"
                  }`}
                />
              ) : (
                <span className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-400">
                  Nonaktif
                </span>
              )}
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-6 h-full flex flex-col opacity-75">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center mb-5 text-slate-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h2 className="text-slate-800 font-bold text-lg tracking-tight">Brief Generator</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">Susun brief proyek dari kebutuhan bisnis.</p>
            <span className="mt-auto w-fit rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">Segera Hadir</span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 h-full flex flex-col shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 text-slate-700">
              <ReceiptText className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 font-bold text-lg tracking-tight">Invoice Generator</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">Buat invoice PDF mandiri untuk dikirim ke klien, tanpa payment link.</p>
            <div className="mt-4">
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                {invoiceCost} kredit/invoice
              </span>
            </div>
            <div className="mt-auto pt-6">
              {toolSettings.invoiceGenerator.enabled ? (
                <ToolActionButton
                  href={balance < invoiceCost ? "/portal/credits" : "/portal/tools/invoice-generator"}
                  label={balance < invoiceCost ? "Beli Kredit" : "Buat Invoice"}
                  loadingLabel={balance < invoiceCost ? "Membuka..." : "Memuat..."}
                  className={`w-full h-11 rounded-xl font-medium text-sm transition-all shadow-xs ${
                    balance < invoiceCost 
                      ? "bg-amber-500 hover:bg-amber-600 text-white" 
                      : "bg-[#1E242E] hover:bg-slate-800 text-white"
                  }`}
                />
              ) : (
                <span className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-400">
                  Nonaktif
                </span>
              )}
            </div>
          </div>
        </StaggerItem>
      </StaggerChildren>
    </div>
  );
}
