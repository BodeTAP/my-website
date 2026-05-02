import { prisma } from "@/lib/prisma";
import MaintenanceClient from "./MaintenanceClient";

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const status = params.status || "";
  const page = Number(params.page || "1");
  const PER_PAGE = 10;

  const validStatuses = ["ACTIVE", "PAUSED", "CANCELLED"];
  const finalStatus = validStatuses.includes(status) ? status : undefined;

  const where = {
    ...(q
      ? {
          OR: [
            { client: { businessName: { contains: q, mode: "insensitive" as const } } },
            { package: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(finalStatus ? { status: finalStatus as any } : {}),
  };

  const [packages, subscriptions, totalSubs, clients] = await Promise.all([
    prisma.maintenancePackage.findMany({ orderBy: { price: "asc" } }),
    prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        client: { select: { businessName: true, user: { select: { name: true } } } },
        package: { select: { name: true, price: true } },
      },
    }),
    prisma.subscription.count({ where }),
    prisma.client.findMany({
      orderBy: { businessName: "asc" },
      select: { id: true, businessName: true },
    }),
  ]);

  const totalPages = Math.ceil(totalSubs / PER_PAGE);
  const startIdx = (page - 1) * PER_PAGE + 1;
  const endIdx = Math.min(page * PER_PAGE, totalSubs);

  // Serialize Date objects to ISO strings for client component
  const serializedSubs = subscriptions.map((s) => ({
    ...s,
    startDate: s.startDate.toISOString(),
    nextBillingDate: s.nextBillingDate.toISOString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <MaintenanceClient 
      packages={packages} 
      subscriptions={serializedSubs} 
      clients={clients} 
      pagination={{ total: totalSubs, totalPages, startIdx, endIdx }} 
    />
  );
}
