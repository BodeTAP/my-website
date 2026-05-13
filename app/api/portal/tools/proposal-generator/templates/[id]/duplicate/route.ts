import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function getClientId() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, clientId: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });

  if (!user?.client) return { status: 404 as const, clientId: null };
  return { status: 200 as const, clientId: user.client.id };
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function POST(_req: Request, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const source = await prisma.proposalTemplate.findFirst({
    where: {
      id,
      isActive: true,
      OR: [
        { isDefault: true, clientId: null },
        { clientId },
      ],
    },
  });

  if (!source) return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });

  const template = await prisma.proposalTemplate.create({
    data: {
      clientId,
      name: `${source.name} Copy`,
      category: source.category,
      description: source.description,
      sections: asJson(source.sections),
      variables: source.variables === null ? undefined : asJson(source.variables),
      isDefault: false,
      isActive: true,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
