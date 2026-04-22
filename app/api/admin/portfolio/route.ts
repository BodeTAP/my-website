import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

function requireAdmin() {
  return auth().then((session) => {
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, coverImage, clientName, techStack, liveUrl, metrics, order, featured } = body;

  if (!title) return NextResponse.json({ error: "Judul wajib diisi." }, { status: 400 });

  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.portfolio.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const portfolio = await prisma.portfolio.create({
    data: {
      title,
      slug,
      description: description || null,
      coverImage: coverImage || null,
      clientName: clientName || null,
      techStack: Array.isArray(techStack) ? techStack : [],
      liveUrl: liveUrl || null,
      metrics: metrics || null,
      order: Number(order) || 0,
      featured: Boolean(featured),
    },
  });

  revalidatePath("/portfolio");
  revalidatePath("/");
  return NextResponse.json(portfolio, { status: 201 });
}
