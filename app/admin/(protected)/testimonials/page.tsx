import { prisma } from "@/lib/prisma";
import TestimonialsClient from "./TestimonialsClient";

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  return <TestimonialsClient initial={testimonials} />;
}
