import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Params) {
  const { id } = await params;
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!article) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/articles">
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/5">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Artikel</h1>
      </div>
      <ArticleEditor article={article} categories={categories} />
    </div>
  );
}
