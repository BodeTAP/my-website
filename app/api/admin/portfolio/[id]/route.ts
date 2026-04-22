import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") return false;
  return true;
}

export async function PATCH(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, description, coverImage, clientName, techStack, liveUrl, metrics, order, featured } = body;

  const data: Record<string, unknown> = {};
  if (title !== undefined) {
    data.title = title;
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const existing = await prisma.portfolio.findUnique({ where: { slug } });
      if (!existing || existing.id === id) break;
      slug = `${baseSlug}-${suffix++}`;
    }
    data.slug = slug;
  }
  if (description !== undefined) data.description = description || null;
  if (coverImage !== undefined) data.coverImage = coverImage || null;
  if (clientName !== undefined) data.clientName = clientName || null;
  if (techStack !== undefined) data.techStack = Array.isArray(techStack) ? techStack : [];
  if (liveUrl !== undefined) data.liveUrl = liveUrl || null;
  if (metrics !== undefined) data.metrics = metrics || null;
  if (order !== undefined) data.order = Number(order) || 0;
  if (featured !== undefined) data.featured = Boolean(featured);

  const portfolio = await prisma.portfolio.update({ where: { id }, data });
  revalidatePath("/portfolio");
  revalidatePath("/");
  return NextResponse.json(portfolio);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.portfolio.delete({ where: { id } });
  revalidatePath("/portfolio");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
