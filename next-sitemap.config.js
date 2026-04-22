/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/portal", "/api"] },
    ],
  },
  exclude: ["/admin/*", "/portal/*", "/api/*"],
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
};
