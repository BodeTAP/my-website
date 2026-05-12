import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientBalance, getTransactionHistory } from "@/lib/credits";

async function getSessionClient() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, clientId: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });

  if (!user?.client) return { status: 404 as const, clientId: null };
  return { status: 200 as const, clientId: user.client.id };
}

export async function GET() {
  const { status, clientId } = await getSessionClient();
  if (!clientId) {
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Client not found" },
      { status },
    );
  }

  const [balance, transactions] = await Promise.all([
    getClientBalance(clientId),
    getTransactionHistory(clientId, 10),
  ]);

  return NextResponse.json({ balance, transactions });
}
