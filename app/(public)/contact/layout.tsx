import type { Metadata } from "next";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/public/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mfweb.maffisorp.id";

export const metadata: Metadata = {
  title: "Konsultasi Gratis Pembuatan Website",
  description:
    "Hubungi MFWEB untuk konsultasi gratis pembuatan website bisnis Anda. Tanpa biaya, tanpa komitmen. Kami siap membantu Anda tampil profesional di internet.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Konsultasi Gratis Pembuatan Website",
    description:
      "Hubungi MFWEB untuk konsultasi gratis. Kami bantu bisnis lokal Anda tampil profesional dengan website cepat dan SEO-friendly.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Beranda", item: SITE_URL },
    { name: "Kontak", item: `${SITE_URL}/contact` },
  ]);

  return (
    <>
      <JsonLd id="json-ld-breadcrumb-contact" data={breadcrumbJsonLd} />
      {children}
    </>
  );
}
