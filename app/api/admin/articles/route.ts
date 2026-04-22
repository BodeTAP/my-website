import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, excerpt, content, coverImage, metaTitle, metaDesc, status } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: "Judul dan slug wajib diisi" }, { status: 400 });
  }

  try {
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt?.trim() || null,
        content: content ?? "",
        coverImage: coverImage?.trim() || null,
        metaTitle: metaTitle?.trim() || null,
        metaDesc: metaDesc?.trim() || null,
        status: status ?? "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
    if (article.status === "PUBLISHED") {
      revalidatePath("/blog");
      revalidatePath("/");
    }
    return NextResponse.json(article, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal menyimpan artikel" }, { status: 500 });
  }
}
