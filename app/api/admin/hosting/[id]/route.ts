import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/hosting/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    clientId, domainName, domainProvider, domainExpiry,
    hostingProvider, hostingPlan, hostingExpiry,
    sslExpiry, status, notes,
  } = body;

  const record = await prisma.hostingRecord.update({
    where: { id },
    data: {
      ...(clientId        ? { clientId }                             : {}),
      ...(domainName      ? { domainName }                          : {}),
      domainProvider:  domainProvider  ?? null,
      domainExpiry:    domainExpiry    ? new Date(domainExpiry)    : null,
      hostingProvider: hostingProvider ?? null,
      hostingPlan:     hostingPlan     ?? null,
      hostingExpiry:   hostingExpiry   ? new Date(hostingExpiry)   : null,
      sslExpiry:       sslExpiry       ? new Date(sslExpiry)       : null,
      ...(status ? { status } : {}),
      notes: notes ?? null,
    },
  });

  return NextResponse.json(record);
}

// DELETE /api/admin/hosting/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.hostingRecord.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
