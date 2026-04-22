import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") redirect("/admin/login");

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const serialized = admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }));
  const currentUserId = (session.user as { id?: string })?.id ?? "";

  return <TeamClient initialAdmins={serialized} currentUserId={currentUserId} />;
}
