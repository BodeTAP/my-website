import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips dan panduan untuk pemilik bisnis lokal agar mudah ditemukan di internet.",
};

export const revalidate = 60;

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      metaDesc: true,
    },
  }).catch(() => []);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Blog & <span className="text-gradient">Panduan</span>
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Tips praktis agar bisnis Anda mudah ditemukan di internet dan terlihat lebih profesional.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-blue-200/40 text-lg">Artikel akan segera hadir. Pantau terus!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`}>
                <article className="glass rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 group h-full flex flex-col">
                  <div className="h-48 bg-linear-to-br from-blue-900/40 to-indigo-900/20 overflow-hidden">
                    {a.coverImage ? (
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-10">
                        📰
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    {a.publishedAt && (
                      <time className="text-blue-400/60 text-xs mb-2 block">
                        {new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(a.publishedAt))}
                      </time>
                    )}
                    <h2 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                      {a.title}
                    </h2>
                    {(a.excerpt || a.metaDesc) && (
                      <p className="text-blue-200/50 text-sm line-clamp-3 mb-4 flex-1">
                        {a.excerpt ?? a.metaDesc}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-blue-400 text-sm font-medium mt-auto">
                      Baca selengkapnya
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
