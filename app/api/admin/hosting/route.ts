import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/hosting — list semua dengan info klien
export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const status   = searchParams.get("status");

  const records = await prisma.hostingRecord.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: {
      client: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: [
      { domainExpiry: "asc" },
    ],
  });

  return NextResponse.json(records);
}

// POST /api/admin/hosting — tambah record baru
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    clientId, domainName, domainProvider, domainExpiry,
    hostingProvider, hostingPlan, hostingExpiry,
    sslExpiry, status, notes,
  } = body;

  if (!clientId || !domainName) {
    return NextResponse.json({ error: "clientId dan domainName wajib diisi" }, { status: 400 });
  }

  const record = await prisma.hostingRecord.create({
    data: {
      clientId,
      domainName,
      domainProvider:  domainProvider  || null,
      domainExpiry:    domainExpiry    ? new Date(domainExpiry)    : null,
      hostingProvider: hostingProvider || null,
      hostingPlan:     hostingPlan     || null,
      hostingExpiry:   hostingExpiry   ? new Date(hostingExpiry)   : null,
      sslExpiry:       sslExpiry       ? new Date(sslExpiry)       : null,
      status:          status          || "ACTIVE",
      notes:           notes           || null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
