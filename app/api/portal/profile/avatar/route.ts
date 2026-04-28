import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED  = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData  = await req.formData();
  const file      = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Hanya JPG, PNG, WebP, atau GIF" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 2 MB" }, { status: 400 });
  }

  const ext      = file.type.split("/")[1];
  const filename = `avatars/${Date.now()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    token:  process.env.BLOB_READ_WRITE_TOKEN,
  });

  // Persist to User.image
  await prisma.user.update({
    where: { email: session.user.email },
    data:  { image: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}
