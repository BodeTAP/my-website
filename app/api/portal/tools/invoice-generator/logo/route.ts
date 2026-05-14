import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getClientId() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, clientId: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });

  if (!user?.client) return { status: 404 as const, clientId: null };
  return { status: 200 as const, clientId: user.client.id };
}

export async function POST(req: Request) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "File logo tidak ditemukan." }, { status: 400 });

  const allowed = ["image/jpeg", "image/png"];
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
  };
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Gunakan logo JPG atau PNG agar aman untuk PDF." }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran logo maksimal 2MB." }, { status: 400 });
  }

  const filename = `${Date.now()}-${randomUUID()}.${extMap[file.type]}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  try {
    if (token) {
      const blob = await put(
        `invoice-logos/${clientId}/${filename}`,
        file,
        {
          access: "public",
          token,
        },
      );

      return NextResponse.json({ url: blob.url });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "invoice-logos", clientId);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ url: `/uploads/invoice-logos/${clientId}/${filename}` });
  } catch (err) {
    console.error("[InvoiceLogoUpload]", err);
    return NextResponse.json({ error: "Gagal mengupload logo." }, { status: 500 });
  }
}
