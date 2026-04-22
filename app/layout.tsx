import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MFWEB — Solusi Website Profesional untuk Bisnis Lokal",
    template: "%s | MFWEB",
  },
  description:
    "Kami membantu bisnis lokal tampil profesional di internet dengan website yang cepat, menarik, dan mudah ditemukan di Google.",
  keywords: ["website profesional", "jasa web developer", "website bisnis lokal", "MFWEB"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "MFWEB",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
