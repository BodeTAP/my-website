import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TicketList from "./TicketList";

export default async function PortalTicketsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: true },
  });

  if (!user?.client) redirect("/portal/dashboard");

  const tickets = await prisma.ticket.findMany({
    where: { clientId: user.client.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  // Serialize dates so client component receives strings, not Date objects
  const serialized = tickets.map((t) => ({
    ...t,
    updatedAt: t.updatedAt,
    messages: t.messages.map((m) => ({
      id: m.id,
      body: m.body,
      senderRole: m.senderRole,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Bantuan & Revisi</h1>
        <p className="text-blue-200/50 text-sm mt-1">Kirim permintaan revisi atau pertanyaan teknis</p>
      </div>
      <TicketList tickets={serialized} clientId={user.client.id} userId={user.id} />
    </div>
  );
}
