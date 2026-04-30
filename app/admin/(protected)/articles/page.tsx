import Link from "next/link";
import { Plus, Edit, Eye, Calendar, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteArticleButton from "./DeleteArticleButton";
import ArticleSearch from "./ArticleSearch";
import ArticleFilter from "./ArticleFilter";
import ArticlePagination from "./ArticlePagination";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

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
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-600/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-500/20">
              <FileText className="w-5 h-5 text-violet-400" />
            </div>
            Manajemen Artikel
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">{total} artikel terpublikasi dan tersimpan di sistem.</p>
        </div>
        <Link href="/admin/articles/new" className="relative z-10">
          <Button className="bg-violet-600 hover:bg-violet-500 text-white h-11 px-6 rounded-xl font-semibold shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-2" />
            Tulis Artikel Baru
          </Button>
        </Link>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-white/5 relative z-10">
          <ArticleSearch />
          <ArticleFilter />
        </div>
      </FadeUp>

      <FadeUp delay={0.2} className="relative z-10">
        <div className="glass rounded-3xl overflow-hidden mb-6 border border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Judul Artikel</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Slug Tautan</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Terakhir Diubah</th>
                  <th className="text-right px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 relative">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-blue-200/20" />
                        </div>
                        <p className="text-blue-200/50 font-medium">
                          {q || status ? "Tidak ada artikel yang cocok dengan filter." : "Belum ada artikel. Buat yang pertama!"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  articles.map((a) => (
                    <tr key={a.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-white font-bold line-clamp-1 group-hover:text-violet-300 transition-colors">{a.title}</p>
                      </td>
                      <td className="px-6 py-5 text-blue-200/40 text-xs font-mono line-clamp-1 max-w-[200px]">{a.slug}</td>
                      <td className="px-6 py-5">
                        {a.status === "PUBLISHED" ? (
                          <Badge variant="outline" className="text-green-300 border-green-500/30 bg-green-500/10 px-3 py-1">
                            Tayang
                          </Badge>
                        ) : a.scheduledAt ? (
                          <div className="flex flex-col gap-1.5">
                            <Badge variant="outline" className="text-blue-300 border-blue-500/30 bg-blue-500/10 px-3 py-1 w-fit">
                              <Calendar className="w-3 h-3 mr-1.5" />
                              Dijadwalkan
                            </Badge>
                            <span className="text-blue-200/40 text-[10px] font-medium">
                              {new Intl.DateTimeFormat("id-ID", {
                                day: "numeric", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              }).format(new Date(a.scheduledAt))}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-300 border-amber-500/30 bg-amber-500/10 px-3 py-1">
                            Draft
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-5 text-blue-200/50 text-xs font-medium">
                        {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(a.updatedAt))}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          {a.status === "PUBLISHED" && (
                            <a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 hover:ring-1 hover:ring-blue-500/30 transition-all">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                          <Link href={`/admin/articles/${a.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 hover:ring-1 hover:ring-amber-500/30 transition-all">
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
      </FadeUp>

      {total > 0 && (
        <FadeUp delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass p-4 sm:px-6 rounded-2xl border border-white/5 relative z-10">
            <p className="text-xs text-blue-200/40 font-medium">
              Menampilkan <span className="text-blue-200">{startIdx}-{endIdx}</span> dari <span className="text-blue-200">{total}</span> artikel
            </p>
            <ArticlePagination totalPages={totalPages} />
          </div>
        </FadeUp>
      )}
    </div>
  );
}
