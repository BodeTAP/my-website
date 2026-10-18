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
      <FadeUp className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bantuan & Panduan</h1>
        <p className="text-slate-500 text-sm mt-1">Panduan lengkap fitur tools dan pusat komunikasi langsung dengan tim teknis MFWEB.</p>
      </FadeUp>
      <HelpGuide />
      <FadeUp className="pt-2">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Tiket Bantuan & Permintaan Revisi</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Kirim permintaan revisi, pertanyaan teknis, atau kendala langsung ke tim MFWEB.</p>
      </FadeUp>
      <TicketList tickets={serialized} clientId={user.client.id} userId={user.id} />
    </div>
  );
}
