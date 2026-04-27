import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getClientId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: { select: { id: true } } },
  });
  return user?.client?.id ?? null;
}

export async function GET() {
  const clientId = await getClientId();
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json(notifications);
}

// Mark all as read
export async function PATCH() {
  const clientId = await getClientId();
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { clientId, read: false },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}
