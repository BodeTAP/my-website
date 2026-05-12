import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientBalance } from "@/lib/credits";
import PortalLeadFinder from "./PortalLeadFinder";

export default async function PortalLeadFinderPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const balance = await getClientBalance(user.client.id);

  return <PortalLeadFinder initialBalance={balance} />;
}
