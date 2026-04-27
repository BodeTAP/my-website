import { prisma } from "@/lib/prisma";
import OnboardingAdmin from "./OnboardingAdmin";

export default async function OnboardingPage() {
  const [forms, clients] = await Promise.all([
    prisma.onboardingForm.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { businessName: true } } },
    }),
    prisma.client.findMany({ orderBy: { businessName: "asc" }, select: { id: true, businessName: true } }),
  ]);

  const serialized = forms.map((f) => ({
    ...f,
    deadline: f.deadline?.toISOString() ?? null,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }));

  return <OnboardingAdmin forms={serialized} clients={clients} />;
}
