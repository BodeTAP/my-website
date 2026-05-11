import { prisma } from "@/lib/prisma";
import { requireModule } from "@/lib/permissions";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  await requireModule("articles");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  return <CategoriesClient initial={categories} />;
}
