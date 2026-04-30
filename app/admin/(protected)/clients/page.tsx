import { prisma } from "@/lib/prisma";
import ClientsClient from "./ClientsClient";
import { FadeUp } from "@/components/public/motion";
import { UsersRound } from "lucide-react";

export default async function AdminClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { projects: true, invoices: true } },
    },
  });

  return (
    <div>
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-sky-600/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center ring-1 ring-sky-500/20">
              <UsersRound className="w-5 h-5 text-sky-400" />
            </div>
            Daftar Klien
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">
            Kelola direktori kontak klien. Pastikan <strong className="text-sky-400">nomor WhatsApp terisi</strong> agar notifikasi tagihan dapat terkirim otomatis.
          </p>
        </div>
      </FadeUp>
      
      <div className="relative z-10">
        <ClientsClient clients={clients} />
      </div>
    </div>
  );
}
