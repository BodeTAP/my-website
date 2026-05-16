import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LeadFinderListRow = {
  id: string;
  name: string;
  query: string;
  city: string | null;
  mode: string;
  socialScan: boolean;
  total: number;
  createdAt: Date;
  updatedAt: Date;
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 200) : fallback;
}

function asItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 300).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return {};
    return item as Record<string, unknown>;
  });
}

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

export async function GET() {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const lists = await prisma.$queryRaw<LeadFinderListRow[]>(Prisma.sql`
    SELECT
      "id",
      "name",
      "query",
      "city",
      "mode",
      "socialScan",
      "total",
      "createdAt",
      "updatedAt"
    FROM "lead_finder_lists"
    WHERE "clientId" = ${clientId}
    ORDER BY "createdAt" DESC
    LIMIT 50
  `);

  return NextResponse.json({ lists });
}

export async function POST(req: NextRequest) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const body = await req.json().catch(() => ({}));
  const name = asString(body.name) || "Lead List";
  const query = asString(body.query);
  const city = asString(body.city) || null;
  const mode = body.mode === "deep" ? "deep" : "standard";
  const socialScan = body.socialScan === true;
  const items = asItems(body.items);
  const total = Array.isArray(body.items) ? Math.min(body.items.length, 300) : 0;

  if (!query) return NextResponse.json({ error: "Query wajib diisi." }, { status: 400 });
  if (total === 0) return NextResponse.json({ error: "Tidak ada lead untuk disimpan." }, { status: 400 });

  const id = randomUUID();
  const itemsJson = JSON.stringify(items);
  const [list] = await prisma.$queryRaw<(LeadFinderListRow & { items: unknown })[]>(Prisma.sql`
    INSERT INTO "lead_finder_lists" (
      "id",
      "clientId",
      "name",
      "query",
      "city",
      "mode",
      "socialScan",
      "total",
      "items",
      "updatedAt"
    ) VALUES (
      ${id},
      ${clientId},
      ${name},
      ${query},
      ${city},
      ${mode},
      ${socialScan},
      ${total},
      ${itemsJson}::jsonb,
      NOW()
    )
    RETURNING
      "id",
      "name",
      "query",
      "city",
      "mode",
      "socialScan",
      "total",
      "items",
      "createdAt",
      "updatedAt"
  `);

  return NextResponse.json({ list }, { status: 201 });
}
