import type { MetadataRoute } from "next";

function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    "https://mfweb.maffisorp.id";
  const trimmed = raw.replace(/\/+$/, "");
  if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1")) {
    return "https://mfweb.maffisorp.id";
  }
  return trimmed;
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/portal",
          "/api/",
          "/onboarding/",
          "/bayar/",
          "/monitoring",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
