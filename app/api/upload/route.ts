import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });

  // SVG excluded: can contain embedded JavaScript, causing XSS when accessed directly
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png":  "png",
    "image/webp": "webp",
    "image/gif":  "gif",
  };
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran file maksimal 5MB." }, { status: 400 });
  }

  // Use MIME-derived extension, never trust user-supplied filename
  const ext = extMap[file.type];
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN, // Pastikan token diambil (terutama berguna saat lokal)
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Vercel Blob Upload Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan pada server saat mengupload gambar." },
      { status: 500 }
    );
  }
}
