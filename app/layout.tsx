import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Clarity from "@/components/public/Clarity";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jasa Pembuatan Website Profesional untuk Bisnis Lokal | MFWEB",
    template: "%s | MFWEB",
  },
  description:
    "MFWEB membantu bisnis lokal tampil profesional di internet dengan website yang cepat, menarik, dan mudah ditemukan di Google. Mulai dari Rp 800K.",
  keywords: [
    "jasa pembuatan website",
    "website profesional",
    "jasa web developer",
    "website bisnis lokal",
    "jasa bikin website",
    "web developer Indonesia",
    "MFWEB",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "MFWEB",
    title: "Jasa Pembuatan Website Profesional untuk Bisnis Lokal | MFWEB",
    description:
      "Kami membantu bisnis lokal tampil profesional di internet. Website cepat, menarik, SEO-friendly. Mulai Rp 800K.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jasa Pembuatan Website Profesional untuk Bisnis Lokal | MFWEB",
    description:
      "Kami membantu bisnis lokal tampil profesional di internet. Website cepat, menarik, SEO-friendly.",
  },
  robots: { index: true, follow: true },
  verification: {
    // Tambahkan Google Search Console verification code di sini nanti
    // google: "your-verification-code",
  },
};

// JSON-LD structured data for Organization + WebSite
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "MFWEB",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
      description:
        "MFWEB membantu bisnis lokal tampil profesional di internet dengan website yang cepat, menarik, dan mudah ditemukan di Google.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: process.env.WHATSAPP_NUMBER ? `+${process.env.WHATSAPP_NUMBER}` : "+6282221682343",
        contactType: "customer service",
        availableLanguage: ["Indonesian", "English"],
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "MFWEB",
      description:
        "Jasa Pembuatan Website Profesional untuk Bisnis Lokal",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "id-ID",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        <Clarity />
      </body>
    </html>
  );
}
