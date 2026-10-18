import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowRight, X, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildPublicBreadcrumbJsonLd } from "@/components/public/JsonLd";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";
import BlogSearch from "./BlogSearch";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Tips & Panduan Website untuk Bisnis Lokal | Blog",
  description:
    "Pelajari cara membuat website profesional, tips SEO, dan strategi digital marketing untuk bisnis lokal Indonesia. Panduan lengkap dari MFWEB.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 60;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; view?: string; page?: string }>;
}) {
  const { category, q, view = "grid", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const isListView = view === "list";
  const breadcrumbJsonLd = buildPublicBreadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Blog", path: "/blog" },
  ]);

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const createUrl = (updates: { category?: string | null; q?: string | null; view?: string | null }) => {
    const params = new URLSearchParams();
    
    const newCat = updates.category !== undefined ? updates.category : category;
    const newQ = updates.q !== undefined ? updates.q : q;
    const newView = updates.view !== undefined ? updates.view : view;

    if (newCat) params.set("category", newCat);
    if (newQ) params.set("q", newQ);
    if (newView && newView !== "grid") params.set("view", newView);

    if (updates.view !== undefined && updates.category === undefined && updates.q === undefined && currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    const queryString = params.toString();
    return `/blog${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-blog" data={breadcrumbJsonLd} />

      {/* ── Full-Width Deep Slate Hero ────────────────────── */}
      <section className="w-full bg-[#1E242E] text-white pt-28 pb-16 sm:pt-32 sm:pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Blog" }]} />

          <div className="max-w-3xl mx-auto text-center mt-6">
            <FadeUp>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-px w-8 bg-slate-500" />
                <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                  Wawasan & Panduan Digital
                </span>
                <span className="h-px w-8 bg-slate-500" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15] mb-4">
                Panduan website untuk bisnis lokal
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto mb-8">
                Catatan praktis dan panduan esensial seputar website, SEO dasar, konversi pelanggan, dan alur kerja digital.
              </p>
            </FadeUp>

            <FadeUp delay={0.1}>
              <BlogSearch initialQuery={q ?? ""} />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Content & Articles Section ────────────────────── */}
      <section className="py-12 sm:py-16 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls: View toggle & Categories */}
          <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 w-full">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-full border border-slate-200 bg-white shrink-0 shadow-xs">
              <Link
                href={createUrl({ view: "grid" })}
                className={`p-2 rounded-full transition-colors ${
                  !isListView 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
                aria-label="Mode Galeri"
                title="Mode Galeri (Grid)"
              >
                <LayoutGrid className="w-4 h-4" />
              </Link>
              <Link
                href={createUrl({ view: "list" })}
                className={`p-2 rounded-full transition-colors ${
                  isListView 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
                aria-label="Mode Daftar"
                title="Mode Daftar (List)"
              >
                <ListIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Category filter pills */}
            <div className="flex-1 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -my-2">
              {categories.length > 0 && (
                <div className="flex flex-nowrap items-center gap-2 py-2">
                  <Link
                    href={createUrl({ category: null })}
                    className={`shrink-0 flex items-center px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-colors border ${
                      !category
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
                    }`}
                  >
                    Semua Topik
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={createUrl({ category: c.slug })}
                      className={`shrink-0 flex items-center px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-colors border ${
                        category === c.slug
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
                      }`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Suspense key={`${category || 'all'}-${q || ''}-${view}-${currentPage}`} fallback={<ArticlesLoading view={view} />}>
            <ArticlesGrid category={category} q={q} view={view} currentPage={currentPage} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

function ArticlesLoading({ view }: { view: string }) {
  const isListView = view === "list";
  return (
    <div className={isListView ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`flex overflow-hidden rounded-2xl border border-slate-200 bg-white animate-pulse ${isListView ? 'flex-row h-36' : 'flex-col h-[380px]'}`}>
          <div className={`${isListView ? 'w-48 shrink-0 h-full' : 'h-48 w-full'} bg-slate-100`}></div>
          <div className="p-5 flex flex-col flex-1 gap-3 justify-center">
            <div className="h-4 w-20 bg-slate-100 rounded-full"></div>
            <div className="h-5 w-3/4 bg-slate-100 rounded"></div>
            <div className="h-4 w-full bg-slate-100 rounded"></div>
            <div className="mt-auto h-4 w-24 bg-slate-100 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ArticlesGrid({ category, q, view, currentPage }: { category?: string; q?: string; view: string; currentPage: number }) {
  const isListView = view === "list";
  const take = 9;
  const skip = (currentPage - 1) * take;

  const whereClause = {
    status: "PUBLISHED" as const,
    ...(category ? { category: { slug: category } } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [articles, totalArticles] = await Promise.all([
    prisma.article.findMany({
      where: whereClause,
      orderBy: { publishedAt: "desc" },
      take,
      skip,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        metaDesc: true,
        tags: true,
        category: { select: { name: true, slug: true } },
      },
    }).catch(() => []),
    prisma.article.count({ where: whereClause }).catch(() => 0),
  ]);

  const totalPages = Math.ceil(totalArticles / take);

  if (articles.length === 0) {
    return (
      <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white p-8">
        {q ? (
          <div className="space-y-4">
            <p className="text-slate-600 text-base">
              Tidak ditemukan artikel untuk pencarian &quot;{q}&quot;
            </p>
            <Link
              href={category ? `/blog?category=${category}&view=${view}` : `/blog?view=${view}`}
              className="inline-flex items-center gap-2 text-slate-900 font-medium hover:underline text-sm"
            >
              <X className="w-4 h-4" />
              Reset pencarian
            </Link>
          </div>
        ) : (
          <p className="text-slate-500 text-base">
            {category ? "Belum ada artikel di kategori ini." : "Artikel akan segera hadir. Pantau terus!"}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <StaggerChildren className={isListView ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"}>
        {articles.map((a) => (
          <StaggerItem key={a.slug}>
            <Link href={`/blog/${a.slug}`} className="block h-full group">
              <article className={`overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 h-full flex ${isListView ? 'flex-row' : 'flex-col'}`}>
                <div className={`${isListView ? 'w-1/3 min-w-[120px] sm:w-64 lg:w-72 shrink-0' : 'h-48'} bg-slate-100 overflow-hidden relative border-b sm:border-b-0 sm:border-r border-slate-100`}>
                  {a.coverImage ? (
                    <Image
                      src={a.coverImage}
                      alt={a.title}
                      width={400}
                      height={256}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-400">
                      MFWEB Artikel
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {a.category && (
                      <span className="text-[11px] font-mono bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full">
                        {a.category.name}
                      </span>
                    )}
                    {a.publishedAt && (
                      <time className="text-slate-400 text-xs font-mono">
                        {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(a.publishedAt))}
                      </time>
                    )}
                  </div>

                  <h2 className="text-slate-900 font-bold text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
                    {a.title}
                  </h2>

                  {(a.excerpt || a.metaDesc) && (
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                      {a.excerpt ?? a.metaDesc}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-900 group-hover:text-slate-700">
                      Baca panduan
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {totalPages > 1 && (() => {
        const getPageUrl = (p: number) => {
          const params = new URLSearchParams();
          if (category) params.set("category", category);
          if (q) params.set("q", q);
          if (view && view !== "grid") params.set("view", view);
          if (p > 1) params.set("page", p.toString());
          return `/blog${params.toString() ? `?${params.toString()}` : ""}`;
        };

        return (
          <div className="flex items-center justify-center mt-12 gap-1.5 flex-wrap">
            {currentPage > 1 ? (
              <Link
                href={getPageUrl(currentPage - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </div>
            )}

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <Link
                  key={p}
                  href={getPageUrl(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                    currentPage === p
                      ? "bg-slate-900 text-white border border-slate-900"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs"
                  }`}
                >
                  {p}
                </Link>
              );
            })}

            {currentPage < totalPages ? (
              <Link
                href={getPageUrl(currentPage + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs"
                aria-label="Halaman selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      })()}
    </>
  );
}
