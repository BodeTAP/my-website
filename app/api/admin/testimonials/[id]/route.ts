import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function PATCH(req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, business, text, rating, order, featured } = await req.json();

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(business !== undefined && { business: business.trim() }),
      ...(text !== undefined && { text: text.trim() }),
      ...(rating !== undefined && { rating: Number(rating) }),
      ...(order !== undefined && { order: Number(order) }),
      ...(featured !== undefined && { featured }),
    },
  });
  return NextResponse.json(testimonial);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
