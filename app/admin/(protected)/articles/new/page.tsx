import { ArrowLeft, PenTool } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { prisma } from "@/lib/prisma";
import { FadeUp } from "@/components/public/motion";

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <FadeUp>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/articles">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <PenTool className="w-6 h-6 text-slate-700" />
            Tulis Artikel Baru
          </h1>
          <p className="text-slate-500 text-sm mt-1">Buat konten menarik untuk blog Anda.</p>
        </div>
      </div>
      
      <div className="relative">
        <ArticleEditor categories={categories} />
      </div>
    </FadeUp>
  );
}
