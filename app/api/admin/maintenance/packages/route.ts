import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function GET() {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const packages = await prisma.maintenancePackage.findMany({ orderBy: { price: "asc" } });
  return NextResponse.json(packages);
}

export async function POST(req: Request) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, description, price, features, isActive } = await req.json();
  if (!name?.trim() || !price) return NextResponse.json({ error: "Nama dan harga wajib diisi." }, { status: 400 });

  const pkg = await prisma.maintenancePackage.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      price: Math.round(Number(price)),
      features: Array.isArray(features) ? features : [],
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(pkg, { status: 201 });
}
