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
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full bg-white/5 text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <PenTool className="w-6 h-6 text-violet-400" />
            Tulis Artikel Baru
          </h1>
          <p className="text-blue-200/50 text-sm mt-1">Buat konten menarik untuk blog Anda.</p>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
        <ArticleEditor categories={categories} />
      </div>
    </FadeUp>
  );
}
