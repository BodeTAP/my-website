import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { prisma } from "@/lib/prisma";

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/articles">
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/5">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">Tulis Artikel Baru</h1>
      </div>
      <ArticleEditor categories={categories} />
    </div>
  );
}
