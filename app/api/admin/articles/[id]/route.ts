import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, slug, excerpt, content, coverImage, metaTitle, metaDesc, status } = body;

  try {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt?.trim() || null,
        content: content ?? "",
        coverImage: coverImage?.trim() || null,
        metaTitle: metaTitle?.trim() || null,
        metaDesc: metaDesc?.trim() || null,
        status: status ?? "DRAFT",
        publishedAt:
          status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });
    return NextResponse.json(article);
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui artikel" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
