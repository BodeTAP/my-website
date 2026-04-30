import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { prisma } from "@/lib/prisma";
import { FadeUp } from "@/components/public/motion";

type Params = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Params) {
  const { id } = await params;
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!article) notFound();

  return (
    <FadeUp>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/articles">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full bg-white/5 text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <PenTool className="w-6 h-6 text-violet-400" />
            Edit Artikel
          </h1>
          <p className="text-blue-200/50 text-sm mt-1">Perbarui konten artikel Anda.</p>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
        <ArticleEditor article={article} categories={categories} />
      </div>
    </FadeUp>
  );
}
