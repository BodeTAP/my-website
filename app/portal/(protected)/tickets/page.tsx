import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TicketList from "./TicketList";
import HelpGuide from "./HelpGuide";
import { FadeUp } from "@/components/public/motion";

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
    <div className="space-y-6">
      <FadeUp>
        <h1 className="text-2xl font-bold text-white">Bantuan & Panduan</h1>
        <p className="text-blue-200/50 text-sm mt-1">Panduan penggunaan tools dan tiket bantuan teknis</p>
      </FadeUp>
      <HelpGuide />
      <FadeUp>
        <h2 className="text-xl font-bold text-white mt-8">Tiket Bantuan</h2>
        <p className="text-blue-200/50 text-sm mt-1">Kirim permintaan revisi atau pertanyaan teknis ke tim kami</p>
      </FadeUp>
      <TicketList tickets={serialized} clientId={user.client.id} userId={user.id} />
    </div>
  );
}
