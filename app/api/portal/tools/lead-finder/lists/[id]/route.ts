import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
type LeadFinderListRow = {
  id: string;
  clientId: string;
  name: string;
  query: string;
  city: string | null;
  mode: string;
  socialScan: boolean;
  total: number;
  items: unknown;
  createdAt: Date;
  updatedAt: Date;
};

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

export async function GET(_req: NextRequest, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const [list] = await prisma.$queryRaw<LeadFinderListRow[]>(Prisma.sql`
    SELECT
      "id",
      "clientId",
      "name",
      "query",
      "city",
      "mode",
      "socialScan",
      "total",
      "items",
      "createdAt",
      "updatedAt"
    FROM "lead_finder_lists"
    WHERE "id" = ${id} AND "clientId" = ${clientId}
    LIMIT 1
  `);

  if (!list) return NextResponse.json({ error: "List tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ list });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";

  if (!name) return NextResponse.json({ error: "Nama list wajib diisi." }, { status: 400 });

  const updated = await prisma.$executeRaw(Prisma.sql`
    UPDATE "lead_finder_lists"
    SET "name" = ${name}, "updatedAt" = NOW()
    WHERE "id" = ${id} AND "clientId" = ${clientId}
  `);

  if (updated === 0) return NextResponse.json({ error: "List tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const { id } = await params;
  const deleted = await prisma.$executeRaw(Prisma.sql`
    DELETE FROM "lead_finder_lists"
    WHERE "id" = ${id} AND "clientId" = ${clientId}
  `);

  if (deleted === 0) return NextResponse.json({ error: "List tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
