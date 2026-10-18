import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import ReadingProgress from "@/components/public/ReadingProgress";
import Breadcrumb from "@/components/public/Breadcrumb";
import { FadeUp } from "@/components/public/motion";
import { JsonLd } from "@/components/public/JsonLd";

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
      images: article.coverImage ? [article.coverImage] : [`${SITE_URL}/og-image.png`],
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

  const relatedSelect = {
    id: true,
    title: true,
    slug: true,
    coverImage: true,
    publishedAt: true,
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
    <div className="min-h-screen bg-white">
      <ReadingProgress />

      {/* ── Breadcrumb & Article Header ────────────────────── */}
      <header className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-[#F8F9FA]">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb
            items={[
              { label: "Blog", href: "/blog" },
              { label: article.title },
            ]}
          />

          <FadeUp className="mt-6">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {article.category && (
                <Link
                  href={`/blog?category=${article.category.slug}`}
                  className="text-xs font-mono bg-slate-200/80 text-slate-800 border border-slate-300 px-3 py-1 rounded-full hover:bg-slate-300 transition-colors"
                >
                  {article.category.name}
                </Link>
              )}
              {article.publishedAt && (
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <time>
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(article.publishedAt))}
                  </time>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime} menit baca</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed border-l-2 border-slate-900 pl-4 py-1">
                {article.excerpt}
              </p>
            )}
          </FadeUp>
        </div>
      </header>

      {/* ── Article Content ────────────────────────────────── */}
      <main className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Cover image if available */}
          {article.coverImage && (
            <div className="rounded-2xl overflow-hidden mb-12 border border-slate-200 bg-slate-100 shadow-xs h-64 sm:h-96">
              <Image
                src={article.coverImage}
                alt={article.title}
                width={800}
                height={400}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          )}

          {/* HTML body rendered with clean prose */}
          <div
            className="prose prose-slate max-w-none
              prose-headings:font-bold prose-headings:text-slate-900
              prose-p:text-slate-700 prose-p:leading-relaxed
              prose-a:text-slate-900 prose-a:underline hover:prose-a:text-slate-600
              prose-strong:text-slate-900
              prose-code:text-slate-800 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
              prose-blockquote:border-slate-300 prose-blockquote:text-slate-600 prose-blockquote:font-normal
              prose-ul:text-slate-700 prose-ol:text-slate-700
              prose-img:rounded-2xl prose-img:border prose-img:border-slate-200"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 pt-6 border-t border-slate-200">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-16 pt-10 border-t border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Artikel Terkait</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedArticles.map((rel) => (
                  <Link key={rel.id} href={`/blog/${rel.slug}`} className="group block h-full">
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all shadow-xs">
                      <div className="h-40 bg-slate-100 overflow-hidden border-b border-slate-100">
                        {rel.coverImage ? (
                          <Image
                            src={rel.coverImage}
                            alt={rel.title}
                            width={400}
                            height={160}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-400">
                            MFWEB
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h4 className="text-slate-900 font-bold text-base leading-snug group-hover:text-slate-700 transition-colors line-clamp-2 mb-3">
                          {rel.title}
                        </h4>
                        <div className="mt-auto flex items-center justify-between text-xs font-mono text-slate-500">
                          <span>{rel.category?.name ?? "Umum"}</span>
                          <span>
                            {rel.publishedAt
                              ? new Intl.DateTimeFormat("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }).format(new Date(rel.publishedAt))
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA Block */}
          <div className="mt-16 rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-8 sm:p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Ingin website bisnis Anda dirancang secara profesional?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base mb-6 max-w-md mx-auto leading-relaxed">
              Konsultasi gratis dengan tim MFWEB. Kami bantu evaluasi kebutuhan dan menyusun roadmap teknis yang tepat.
            </p>
            <Link href="/contact">
              <Button className="h-11 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 transition-colors">
                Mulai Konsultasi Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* JSON-LD Structured Data */}
      <JsonLd id="json-ld-article" data={articleJsonLd} />
      <JsonLd id="json-ld-breadcrumb" data={breadcrumbJsonLd} />
    </div>
  );
}
