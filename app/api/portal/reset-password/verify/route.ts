import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Token dan password (min. 8 karakter) wajib diisi." }, { status: 400 });
  }

  const record = await prisma.verificationToken.findFirst({ where: { token } });

  if (!record || !record.identifier.startsWith("password-reset:")) {
    return NextResponse.json({ error: "Link tidak valid atau sudah digunakan." }, { status: 400 });
  }

  // Delete first regardless, to prevent reuse
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token } },
  });

  if (record.expires < new Date()) {
    return NextResponse.json({ error: "Link sudah kedaluwarsa. Silakan minta ulang." }, { status: 400 });
  }

  const email = record.identifier.replace("password-reset:", "");
  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.update({ where: { email }, data: { password: hashed } });

  return NextResponse.json({ ok: true });
}
