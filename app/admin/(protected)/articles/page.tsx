import Link from "next/link";
import { Plus, Edit, Eye, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteArticleButton from "./DeleteArticleButton";
import ArticleSearch from "./ArticleSearch";
import ArticleFilter from "./ArticleFilter";
import ArticlePagination from "./ArticlePagination";

const PER_PAGE = 10;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const status = params.status || "";
  const page = Number(params.page || "1");

  const where = {
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
    ...(status === "PUBLISHED" ? { status: "PUBLISHED" as const, scheduledAt: null } : {}),
    ...(status === "SCHEDULED" ? { scheduledAt: { not: null } } : {}),
    ...(status === "DRAFT" ? { status: "DRAFT" as const, scheduledAt: null } : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const startIdx = (page - 1) * PER_PAGE + 1;
  const endIdx = Math.min(page * PER_PAGE, total);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Artikel</h1>
          <p className="text-blue-200/50 text-sm mt-1">{total} artikel ditemukan</p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Tulis Artikel
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <ArticleSearch />
        <ArticleFilter />
      </div>

      <div className="glass rounded-2xl overflow-hidden mb-6">
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
                    {q || status ? "Tidak ada artikel yang cocok dengan filter." : "Belum ada artikel. Buat yang pertama!"}
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
                      {a.status === "PUBLISHED" ? (
                        <Badge variant="outline" className="text-green-300 border-green-500/20 bg-green-500/5">
                          Tayang
                        </Badge>
                      ) : a.scheduledAt ? (
                        <div className="flex flex-col gap-0.5">
                          <Badge variant="outline" className="text-blue-300 border-blue-500/20 bg-blue-500/5 w-fit">
                            <Calendar className="w-3 h-3 mr-1" />
                            Dijadwalkan
                          </Badge>
                          <span className="text-blue-200/40 text-[11px]">
                            {new Intl.DateTimeFormat("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            }).format(new Date(a.scheduledAt))}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-amber-300 border-amber-500/20 bg-amber-500/5">
                          Draft
                        </Badge>
                      )}
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

      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl">
          <p className="text-xs text-blue-200/40">
            Menampilkan <span className="text-blue-200">{startIdx}-{endIdx}</span> dari <span className="text-blue-200">{total}</span> artikel
          </p>
          <ArticlePagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
