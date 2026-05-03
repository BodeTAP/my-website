import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const { allowed, retryAfterMs } = await rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa saat." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const { name, email, businessName, phone, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !businessName?.trim() || !password) {
      return NextResponse.json(
        { error: "Nama, email, nama bisnis, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });

    // Return same response regardless of whether email exists to prevent enumeration
    if (existing) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
        role: "CLIENT",
        client: {
          create: {
            businessName: businessName.trim(),
            phone: phone?.trim() || null,
          },
        },
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
