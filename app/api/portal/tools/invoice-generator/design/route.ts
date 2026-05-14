import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientInvoiceDesign, upsertClientInvoiceDesign } from "@/lib/invoiceDesign";
import { prisma } from "@/lib/prisma";

async function getClientId() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });

  return user?.client?.id ?? null;
}

export async function GET() {
  const clientId = await getClientId();
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ design: await getClientInvoiceDesign(clientId) });
}

export async function PUT(req: Request) {
  const clientId = await getClientId();
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const design = await upsertClientInvoiceDesign(clientId, body);
  return NextResponse.json({ design });
}
