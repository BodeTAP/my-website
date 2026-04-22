import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function getAdminSession() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(admins);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password } = await req.json();

  if (!email || !password) return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === "ADMIN") return NextResponse.json({ error: "Email sudah terdaftar sebagai admin." }, { status: 409 });
    // Upgrade existing CLIENT user to ADMIN
    const updated = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", password: await bcrypt.hash(password, 12) },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return NextResponse.json(updated, { status: 201 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: { name: name || null, email, password: hashed, role: "ADMIN" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json(admin, { status: 201 });
}
