import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/permissions";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  await requireModule("team");

  const session = await auth();

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const serialized = admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }));
  const currentUserId = session?.user?.id ?? "";

  return <TeamClient initialAdmins={serialized} currentUserId={currentUserId} />;
}
