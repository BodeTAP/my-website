import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientBalance } from "@/lib/credits";
import { getToolSettings } from "@/lib/toolSettings";
import PortalLeadFinder from "./PortalLeadFinder";

export default async function PortalLeadFinderPage() {
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

  return (
    <PortalLeadFinder
      initialBalance={balance}
      enabled={toolSettings.leadFinder.enabled}
      creditCosts={{
        standard: toolSettings.leadFinder.standardCost,
        deep: toolSettings.leadFinder.deepCost,
        socialScan: toolSettings.leadFinder.socialScanCost,
      }}
      socialScanAvailable={toolSettings.leadFinder.socialScanEnabled}
    />
  );
}
