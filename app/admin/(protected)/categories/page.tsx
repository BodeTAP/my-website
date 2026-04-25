import { prisma } from "@/lib/prisma";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  return <CategoriesClient initial={categories} />;
}
