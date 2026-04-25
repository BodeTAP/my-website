import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIP } from "@/lib/rateLimit";
import crypto from "crypto";

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const { allowed } = rateLimit(`reset-pw:${ip}`, 3, 15 * 60 * 1000); // 3 per 15 min
  if (!allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi dalam 15 menit." }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

  // Always return success to prevent email enumeration
  if (!user || !user.password) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const identifier = `password-reset:${user.email}`;
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Remove old tokens for this user then create new one
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({ data: { identifier, token, expires } });

  try {
    await sendPasswordResetEmail(user.email!, user.name ?? "Klien", token);
  } catch {
    // Email failure is non-fatal — token already saved
  }

  return NextResponse.json({ ok: true });
}
