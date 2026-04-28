import { prisma } from "@/lib/prisma";
import ClientsClient from "./ClientsClient";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Klien</h1>
        <p className="text-blue-200/50 text-sm mt-1">
          Kelola data klien — terutama nomor WA untuk notifikasi otomatis.
        </p>
      </div>
      <ClientsClient clients={clients} />
    </div>
  );
}
