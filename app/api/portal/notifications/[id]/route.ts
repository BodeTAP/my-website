import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: { select: { id: true } } },
  });
  if (!user?.client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id } = await params;

  // Only allow marking own notifications as read
  await prisma.notification.updateMany({
    where: { id, clientId: user.client.id },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}
