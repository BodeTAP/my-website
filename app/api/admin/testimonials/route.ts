import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin() {
  return auth().then((s) =>
    !s || (s.user as { role?: string })?.role !== "ADMIN"
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : null
  );
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(testimonials);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { name, business, text, rating, order, featured } = await req.json();
  if (!name?.trim() || !business?.trim() || !text?.trim()) {
    return NextResponse.json({ error: "Nama, bisnis, dan teks wajib diisi." }, { status: 400 });
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      name: name.trim(),
      business: business.trim(),
      text: text.trim(),
      rating: Number(rating) || 5,
      order: Number(order) || 0,
      featured: featured ?? true,
    },
  });
  return NextResponse.json(testimonial, { status: 201 });
}
