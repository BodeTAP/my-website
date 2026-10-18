import Link from "next/link";
import { Plus, Edit, Eye, Calendar, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteArticleButton from "./DeleteArticleButton";
import ArticleSearch from "./ArticleSearch";
import ArticleFilter from "./ArticleFilter";
import ArticlePagination from "./ArticlePagination";
import { FadeUp } from "@/components/public/motion";
import { requireModule } from "@/lib/permissions";

const PER_PAGE = 10;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireModule("articles");
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
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-700">
              <FileText className="w-5 h-5 text-slate-700" />
            </div>
            Manajemen Artikel
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">{total} artikel terpublikasi dan tersimpan di sistem.</p>
        </div>
        <Link href="/admin/articles/new" className="relative z-10">
          <Button className="bg-[#1E242E] hover:bg-slate-800 text-white h-10 px-5 rounded-xl font-semibold shadow-xs transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Tulis Artikel Baru
          </Button>
        </Link>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="bg-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-slate-200 shadow-2xs relative z-10">
          <ArticleSearch />
          <ArticleFilter />
        </div>
      </FadeUp>

      <FadeUp delay={0.2} className="relative z-10">
        <div className="bg-white rounded-2xl overflow-hidden mb-6 border border-slate-200 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left px-6 py-3.5 text-slate-500 font-semibold text-xs tracking-wider uppercase">Judul Artikel</th>
                  <th className="text-left px-6 py-3.5 text-slate-500 font-semibold text-xs tracking-wider uppercase">Slug Tautan</th>
                  <th className="text-left px-6 py-3.5 text-slate-500 font-semibold text-xs tracking-wider uppercase">Status</th>
                  <th className="text-left px-6 py-3.5 text-slate-500 font-semibold text-xs tracking-wider uppercase">Terakhir Diubah</th>
                  <th className="text-right px-6 py-3.5 text-slate-500 font-semibold text-xs tracking-wider uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 relative">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                          <FileText className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium text-sm">
                          {q || status ? "Tidak ada artikel yang cocok dengan filter." : "Belum ada artikel. Buat yang pertama!"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  articles.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-slate-900 font-semibold line-clamp-1 group-hover:text-slate-700 transition-colors">{a.title}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-mono line-clamp-1 max-w-[200px]">{a.slug}</td>
                      <td className="px-6 py-4">
                        {a.status === "PUBLISHED" ? (
                          <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium text-xs">
                            Tayang
                          </Badge>
                        ) : a.scheduledAt ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 px-2.5 py-0.5 rounded-full font-medium text-xs w-fit">
                              <Calendar className="w-3 h-3 mr-1.5" />
                              Dijadwalkan
                            </Badge>
                            <span className="text-slate-400 text-[10px] font-medium">
                              {new Intl.DateTimeFormat("id-ID", {
                                day: "numeric", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              }).format(new Date(a.scheduledAt))}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium text-xs">
                            Draft
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                        {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(a.updatedAt))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {a.status === "PUBLISHED" && (
                            <a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                          <Link href={`/admin/articles/${a.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-2xl border border-slate-200 shadow-2xs relative z-10">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="text-slate-900 font-semibold">{startIdx}-{endIdx}</span> dari <span className="text-slate-900 font-semibold">{total}</span> artikel
            </p>
            <ArticlePagination totalPages={totalPages} />
          </div>
        </FadeUp>
      )}
    </div>
  );
}
