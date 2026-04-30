import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowRight, X, LayoutGrid, List as ListIcon } from "lucide-react";
import Breadcrumb from "@/components/public/Breadcrumb";
import { FadeUp, StaggerChildren, StaggerItem, HoverCard } from "@/components/public/motion";
import BlogSearch from "./BlogSearch";

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
  searchParams: Promise<{ category?: string; q?: string; view?: string }>;
}) {
  const { category, q, view = "grid" } = await searchParams;
  const isListView = view === "list";

  const [categories, articles] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category: { slug: category } } : {}),
        ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
      },
      orderBy: { publishedAt: "desc" },
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
  ]);

  const createUrl = (updates: { category?: string | null; q?: string | null; view?: string | null }) => {
    const params = new URLSearchParams();
    
    // Resolve new values or keep existing
    const newCat = updates.category !== undefined ? updates.category : category;
    const newQ = updates.q !== undefined ? updates.q : q;
    const newView = updates.view !== undefined ? updates.view : view;

    if (newCat) params.set("category", newCat);
    if (newQ) params.set("q", newQ);
    if (newView && newView !== "grid") params.set("view", newView);

    const queryString = params.toString();
    return `/blog${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: "Blog" }]} />
        <div className="text-center mb-10">
          <FadeUp>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Blog & <span className="text-gradient">Panduan</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.05}>
            <p className="text-blue-200/60 max-w-xl mx-auto mb-10">
              Tips praktis agar bisnis Anda mudah ditemukan di internet dan terlihat lebih profesional.
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <BlogSearch initialQuery={q ?? ""} />
          </FadeUp>
        </div>

        <div className="flex flex-row items-center gap-3 mb-8 w-full">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 glass rounded-xl border border-white/10 shrink-0 z-10">
            <Link
              href={createUrl({ view: "grid" })}
              className={`p-2 rounded-lg transition-all duration-300 ${
                !isListView 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "text-blue-200/60 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Mode Galeri (Grid)"
              title="Mode Galeri"
            >
              <LayoutGrid className="w-4 h-4" />
            </Link>
            <Link
              href={createUrl({ view: "list" })}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isListView 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "text-blue-200/60 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Mode Daftar (List)"
              title="Mode Daftar"
            >
              <ListIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Category filter */}
          <div className="flex-1 w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {categories.length > 0 && (
              <StaggerChildren stagger={0.03} className="flex flex-nowrap items-center gap-2 py-1 pr-4">
                <StaggerItem>
                  <Link
                    href={createUrl({ category: null })}
                    className={`shrink-0 flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                      !category
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "glass border-white/10 text-blue-200/70 hover:text-white hover:border-blue-500/30 hover:bg-white/5 hover:-translate-y-0.5"
                    }`}
                  >
                    Semua
                  </Link>
                </StaggerItem>
                {categories.map((c) => (
                  <StaggerItem key={c.slug}>
                    <Link
                      href={createUrl({ category: c.slug })}
                      className={`shrink-0 flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                        category === c.slug
                          ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                          : "glass border-white/10 text-blue-200/70 hover:text-white hover:border-blue-500/30 hover:bg-white/5 hover:-translate-y-0.5"
                      }`}
                    >
                      {c.name}
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            )}
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            {q ? (
              <div className="space-y-4">
                <p className="text-blue-200/40 text-lg">
                  Tidak ada artikel untuk pencarian "{q}"
                </p>
                <Link
                  href={createUrl({ q: null })}
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  Hapus pencarian
                </Link>
              </div>
            ) : (
              <p className="text-blue-200/40 text-lg">
                {category ? "Belum ada artikel di kategori ini." : "Artikel akan segera hadir. Pantau terus!"}
              </p>
            )}
          </div>
        ) : (
          <StaggerChildren className={isListView ? "flex flex-col gap-5" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {articles.map((a) => (
              <StaggerItem key={a.slug}>
                <HoverCard className={isListView ? "h-full md:h-auto" : "h-full"}>
                  <Link href={`/blog/${a.slug}`}>
                    <article className={`glass rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors duration-300 group h-full flex ${isListView ? 'flex-col sm:flex-row' : 'flex-col'}`}>
                      <div className={`${isListView ? 'h-48 sm:h-auto sm:w-64 lg:w-80 shrink-0 min-h-[192px]' : 'h-48'} bg-linear-to-br from-blue-900/40 to-indigo-900/20 overflow-hidden relative`}>
                        {a.coverImage ? (
                          <Image src={a.coverImage} alt={a.title} width={400} height={256} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl opacity-10 min-h-[192px]">📰</div>
                        )}
                      </div>
                      <div className={`p-6 flex flex-col flex-1 ${isListView ? 'justify-center' : ''}`}>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          {a.category && (
                            <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full">
                              {a.category.name}
                            </span>
                          )}
                          {a.publishedAt && (
                            <time className="text-blue-400/60 text-xs font-medium">
                              {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(a.publishedAt))}
                            </time>
                          )}
                        </div>
                        <h2 className={`text-white font-semibold mb-3 group-hover:text-blue-300 transition-colors ${isListView ? 'text-xl sm:text-2xl line-clamp-2' : 'text-lg line-clamp-2'}`}>
                          {a.title}
                        </h2>
                        {(a.excerpt || a.metaDesc) && (
                          <p className={`text-blue-200/50 text-sm mb-5 flex-1 ${isListView ? 'line-clamp-2 sm:line-clamp-3' : 'line-clamp-3'}`}>{a.excerpt ?? a.metaDesc}</p>
                        )}
                        <div className="mt-auto">
                          {a.tags.length > 0 && !isListView && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {a.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs text-blue-200/30">#{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-blue-400 text-sm font-medium">
                            Baca selengkapnya
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </div>
    </div>
  );
}
