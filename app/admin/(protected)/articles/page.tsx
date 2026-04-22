import Link from "next/link";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteArticleButton from "./DeleteArticleButton";

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Artikel</h1>
          <p className="text-blue-200/50 text-sm mt-1">{articles.length} artikel</p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Tulis Artikel
          </Button>
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">Judul</th>
                <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">Slug</th>
                <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">Status</th>
                <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">Terakhir diubah</th>
                <th className="text-left px-5 py-3 text-blue-200/40 font-medium text-xs">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-blue-200/30">
                    Belum ada artikel. Buat yang pertama!
                  </td>
                </tr>
              ) : (
                articles.map((a) => (
                  <tr key={a.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white font-medium line-clamp-1">{a.title}</p>
                    </td>
                    <td className="px-5 py-4 text-blue-200/50 text-xs font-mono">{a.slug}</td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={a.status === "PUBLISHED"
                          ? "text-green-300 border-green-500/20 bg-green-500/5"
                          : "text-amber-300 border-amber-500/20 bg-amber-500/5"}
                      >
                        {a.status === "PUBLISHED" ? "Tayang" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-blue-200/50 text-xs">
                      {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(a.updatedAt))}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {a.status === "PUBLISHED" && (
                          <a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400/60 hover:text-blue-300 hover:bg-white/5">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Link href={`/admin/articles/${a.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400/60 hover:text-blue-300 hover:bg-white/5">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <DeleteArticleButton id={a.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
