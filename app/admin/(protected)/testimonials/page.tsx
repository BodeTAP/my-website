import { prisma } from "@/lib/prisma";
import TestimonialsClient from "./TestimonialsClient";
import { requireModule } from "@/lib/permissions";

export default async function TestimonialsPage() {
  await requireModule("testimonials");
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  return <TestimonialsClient initial={testimonials} />;
}
