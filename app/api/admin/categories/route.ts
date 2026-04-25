import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function GET() {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nama kategori wajib diisi." }, { status: 400 });

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Kategori sudah ada." }, { status: 409 });

  const category = await prisma.category.create({ data: { name: name.trim(), slug } });
  return NextResponse.json(category, { status: 201 });
}
