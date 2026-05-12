import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { FacebookPixel } from "@/components/public/FacebookPixel";
import { GoogleAnalytics } from "@/components/public/GoogleAnalytics";
import { getSiteSettings } from "@/lib/siteSettings";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

function absoluteUrl(baseUrl: string, pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, baseUrl).toString();
  } catch {
    return pathOrUrl;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = settings.seo_canonical_base_url || settings.brand_site_url || SITE_URL;
  const title = settings.seo_default_title;
  const description = settings.seo_default_description;
  const ogImage = absoluteUrl(siteUrl, settings.seo_default_og_image || settings.brand_default_og_image);
  const favicon = settings.brand_favicon_url || "/favicon.ico";
  const logo = settings.brand_logo_url || "/icon.png";

  return {
    title: {
      default: title,
      template: settings.seo_default_title_template || `%s | ${settings.brand_name}`,
    },
    description,
    keywords: [
      "jasa pembuatan website",
      "website profesional",
      "jasa web developer",
      "website bisnis lokal",
      "jasa bikin website",
      "web developer Indonesia",
      settings.brand_name,
    ],
    metadataBase: new URL(siteUrl),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: settings.brand_name,
      title,
      description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    icons: {
      icon: [
        { url: favicon, sizes: "any" },
        { url: logo, type: "image/png" },
      ],
      apple: logo,
    },
    robots: { index: true, follow: true },
  };
}

function buildJsonLd(settings: Record<string, string>) {
  const siteUrl = settings.seo_canonical_base_url || settings.brand_site_url || SITE_URL;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: settings.brand_name,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl(siteUrl, settings.brand_logo_url),
          width: 512,
          height: 512,
        },
        description: settings.seo_default_description,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: `+${settings.brand_public_whatsapp}`,
          contactType: "customer service",
          availableLanguage: ["Indonesian", "English"],
        },
        sameAs: [
          settings.social_instagram_url,
          settings.social_facebook_url,
          settings.social_linkedin_url,
        ].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: settings.brand_name,
        description: settings.seo_default_description,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "id-ID",
      },
    ],
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const jsonLd = buildJsonLd(settings);

  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        <FacebookPixel pixelId={settings.facebook_pixel_id ?? ""} />
        <GoogleAnalytics gaId={settings.google_analytics_id ?? ""} />
      </body>
      {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: [
              "(function(c,l,a,r,i,t,y){",
              "c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};",
              "t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;",
              "y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);",
              `})(window,document,'clarity','script','${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}');`,
            ].join("\n"),
          }}
        />
      )}
    </html>
  );
}
