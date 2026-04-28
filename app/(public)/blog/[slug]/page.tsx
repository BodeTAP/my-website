import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Calendar, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import ReadingProgress from "@/components/public/ReadingProgress";
import Breadcrumb from "@/components/public/Breadcrumb";

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).filter((w) => w.length > 1).length;
  return Math.max(1, Math.round(words / 200));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return articles.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return {};
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDesc ?? article.excerpt ?? undefined,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      title: article.metaTitle ?? article.title,
      description: article.metaDesc ?? article.excerpt ?? undefined,
      images: article.coverImage ? [article.coverImage] : [],
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { category: { select: { name: true, slug: true } } },
  });
  if (!article) notFound();

  // Run both related-article queries in parallel instead of sequentially
  const relatedSelect = {
    id: true, title: true, slug: true, coverImage: true, publishedAt: true,
    category: { select: { name: true, slug: true } },
  } as const;

  const [sameCat, otherCat] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", id: { not: article.id }, categoryId: article.categoryId },
      select: relatedSelect,
      orderBy: { publishedAt: "desc" },
      take: 2,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", id: { not: article.id } },
      select: relatedSelect,
      orderBy: { publishedAt: "desc" },
      take: 2,
    }),
  ]);

  const seen = new Set(sameCat.map((a) => a.id));
  const relatedArticles = [
    ...sameCat,
    ...otherCat.filter((a) => !seen.has(a.id)),
  ].slice(0, 2);

  // JSON-LD: BlogPosting + BreadcrumbList
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.metaDesc ?? article.excerpt ?? "",
    image: article.coverImage ?? undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    author: {
      "@type": "Organization",
      name: "MFWEB",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "MFWEB",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}/blog/${slug}`,
      },
    ],
  };

  const readTime = estimateReadTime(article.content);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <ReadingProgress />
      <div className="max-w-3xl mx-auto">
        <Breadcrumb items={[
          { label: "Blog", href: "/blog" },
          { label: article.title },
        ]} />

        {/* Cover */}
        {article.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8 h-64 sm:h-80">
            <Image src={article.coverImage} alt={article.title} width={768} height={320} className="w-full h-full object-cover" priority />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {article.category && (
              <Link href={`/blog?category=${article.category.slug}`}
                className="text-xs bg-blue-600/20 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-full hover:bg-blue-600/30 transition-colors">
                {article.category.name}
              </Link>
            )}
            {article.publishedAt && (
              <div className="flex items-center gap-2 text-blue-400/60 text-sm">
                <Calendar className="w-4 h-4" />
                <time>
                  {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.publishedAt))}
                </time>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-blue-400/50 text-sm">
              <Clock className="w-4 h-4" />
              <span>{readTime} menit baca</span>
            </div>
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag) => (
                <span key={tag} className="text-xs text-blue-200/40">#{tag}</span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-blue-200/60 text-lg leading-relaxed border-l-2 border-blue-500/50 pl-4">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-invert prose-blue max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-p:text-blue-100/70 prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-code:text-blue-300 prose-code:bg-blue-900/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-blockquote:border-blue-500/50 prose-blockquote:text-blue-200/60
            prose-ul:text-blue-100/70 prose-ol:text-blue-100/70
            prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Artikel Terkait */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-white/5">
            <h3 className="text-2xl font-bold text-white mb-6">Artikel Terkait</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedArticles.map((rel) => (
                <Link key={rel.id} href={`/blog/${rel.slug}`} className="group block h-full">
                  <div className="glass rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors duration-300 h-full flex flex-col">
                    <div className="h-40 bg-linear-to-br from-blue-900/40 to-indigo-900/20 overflow-hidden">
                      {rel.coverImage ? (
                        <Image src={rel.coverImage} alt={rel.title} width={400} height={160} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-10">📰</div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="text-white font-semibold text-lg leading-snug group-hover:text-blue-300 transition-colors line-clamp-2 mb-3">
                        {rel.title}
                      </h4>
                      <div className="mt-auto flex items-center justify-between text-xs">
                        <span className="text-blue-400">{rel.category?.name ?? "Umum"}</span>
                        <span className="text-blue-200/40">
                          {rel.publishedAt ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(rel.publishedAt)) : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 glass rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">
            Siap Membuat Website untuk Bisnis Anda?
          </h3>
          <p className="text-blue-200/60 mb-6">
            Konsultasi gratis, kami bantu dari awal hingga website Anda live.
          </p>
          <Link href="/contact">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8">
              Konsultasi Gratis Sekarang
            </Button>
          </Link>
        </div>

        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld-article"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <Script
          id="json-ld-breadcrumb"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </div>
    </div>
  );
}
