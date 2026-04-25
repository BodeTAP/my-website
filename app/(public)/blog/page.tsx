import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowRight } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem, HoverCard } from "@/components/public/motion";

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
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [categories, articles] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category: { slug: category } } : {}),
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

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeUp className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Blog & <span className="text-gradient">Panduan</span>
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Tips praktis agar bisnis Anda mudah ditemukan di internet dan terlihat lebih profesional.
          </p>
        </FadeUp>

        {/* Category filter */}
        {categories.length > 0 && (
          <FadeUp delay={0.1} className="flex flex-wrap justify-center gap-2 mb-10">
            <Link
              href="/blog"
              className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${
                !category
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "glass border-white/10 text-blue-200/60 hover:text-white hover:border-blue-500/30"
              }`}
            >
              Semua
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/blog?category=${c.slug}`}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${
                  category === c.slug
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "glass border-white/10 text-blue-200/60 hover:text-white hover:border-blue-500/30"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </FadeUp>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-blue-200/40 text-lg">
              {category ? "Belum ada artikel di kategori ini." : "Artikel akan segera hadir. Pantau terus!"}
            </p>
          </div>
        ) : (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <StaggerItem key={a.slug}>
              <HoverCard className="h-full">
              <Link href={`/blog/${a.slug}`}>
                <article className="glass rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors duration-300 group h-full flex flex-col">
                  <div className="h-48 bg-linear-to-br from-blue-900/40 to-indigo-900/20 overflow-hidden">
                    {a.coverImage ? (
                      <Image src={a.coverImage} alt={a.title} width={400} height={192} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-10">📰</div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {a.category && (
                        <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full">
                          {a.category.name}
                        </span>
                      )}
                      {a.publishedAt && (
                        <time className="text-blue-400/60 text-xs">
                          {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(a.publishedAt))}
                        </time>
                      )}
                    </div>
                    <h2 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                      {a.title}
                    </h2>
                    {(a.excerpt || a.metaDesc) && (
                      <p className="text-blue-200/50 text-sm line-clamp-3 mb-4 flex-1">{a.excerpt ?? a.metaDesc}</p>
                    )}
                    {a.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {a.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs text-blue-200/30">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-blue-400 text-sm font-medium mt-auto">
                      Baca selengkapnya
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
