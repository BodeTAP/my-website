import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

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
    openGraph: {
      title: article.metaTitle ?? article.title,
      description: article.metaDesc ?? article.excerpt ?? undefined,
      images: article.coverImage ? [article.coverImage] : [],
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

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-8 text-blue-400 hover:text-blue-300 hover:bg-white/5 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Blog
          </Button>
        </Link>

        {/* Cover */}
        {article.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8 h-64 sm:h-80">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
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
      </div>
    </div>
  );
}
