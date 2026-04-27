import { prisma } from "@/lib/prisma";
import MaintenanceClient from "./MaintenanceClient";

export default async function MaintenancePage() {
  const [packages, subscriptions, clients] = await Promise.all([
    prisma.maintenancePackage.findMany({ orderBy: { price: "asc" } }),
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { businessName: true, user: { select: { name: true } } } },
        package: { select: { name: true, price: true } },
      },
    }),
    prisma.client.findMany({
      orderBy: { businessName: "asc" },
      select: { id: true, businessName: true },
    }),
  ]);

  // Serialize Date objects to ISO strings for client component
  const serializedSubs = subscriptions.map((s) => ({
    ...s,
    startDate: s.startDate.toISOString(),
    nextBillingDate: s.nextBillingDate.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <MaintenanceClient packages={packages} subscriptions={serializedSubs} clients={clients} />;
}
