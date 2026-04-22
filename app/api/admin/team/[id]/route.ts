import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

async function getAdminSession() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { password } = await req.json();

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id },
    data: { password: await bcrypt.hash(password, 12) },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Prevent self-deletion
  if (id === (session.user as { id?: string })?.id) {
    return NextResponse.json({ error: "Anda tidak dapat menghapus akun Anda sendiri." }, { status: 400 });
  }

  // Ensure at least one admin remains
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount <= 1) {
    return NextResponse.json({ error: "Harus ada minimal satu admin." }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { role: "CLIENT" } });

  return NextResponse.json({ ok: true });
}
