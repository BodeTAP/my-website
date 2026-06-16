import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Always regenerate so newly published articles/portfolios appear without redeploy.
export const revalidate = 3600; // 1 hour

function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    "https://mfweb.maffisorp.id";
  // Guard against localhost leaking into production sitemap.
  const trimmed = raw.replace(/\/+$/, "");
  if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1")) {
    return "https://mfweb.maffisorp.id";
  }
  return trimmed;
}

// Static marketing routes that should always be indexed.
const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/",                          changeFrequency: "daily",   priority: 1.0 },
  { path: "/about",                     changeFrequency: "monthly", priority: 0.6 },
  { path: "/layanan",                   changeFrequency: "weekly",  priority: 0.9 },
  { path: "/layanan/landing-page",      changeFrequency: "weekly",  priority: 0.9 },
  { path: "/layanan/company-profile",   changeFrequency: "weekly",  priority: 0.9 },
  { path: "/layanan/toko-online",       changeFrequency: "weekly",  priority: 0.9 },
  { path: "/layanan/optimasi-seo",      changeFrequency: "weekly",  priority: 0.9 },
  { path: "/layanan/aplikasi-web",      changeFrequency: "weekly",  priority: 0.9 },
  { path: "/portfolio",                 changeFrequency: "weekly",  priority: 0.8 },
  { path: "/blog",                      changeFrequency: "daily",   priority: 0.8 },
  { path: "/contact",                   changeFrequency: "monthly", priority: 0.7 },
  { path: "/kalkulasi-harga",           changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools",                     changeFrequency: "weekly",  priority: 0.7 },
  { path: "/lead-finder",               changeFrequency: "weekly",  priority: 0.7 },
  { path: "/tools/proposal-generator",  changeFrequency: "weekly",  priority: 0.7 },
  { path: "/tools/invoice-generator",   changeFrequency: "weekly",  priority: 0.7 },
  { path: "/tools/cek-kecepatan",       changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/cek-seo",             changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/cek-meta-tags",       changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/generator-nama",      changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/estimasi-harga",      changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/qr-code",             changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/roi-website",         changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Dynamic: published blog articles
  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });
    articleEntries = articles.map((a) => ({
      url: `${siteUrl}/blog/${a.slug}`,
      lastModified: a.updatedAt ?? a.publishedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // DB unavailable at build/edge — skip dynamic entries gracefully
  }

  return [...staticEntries, ...articleEntries];
}
