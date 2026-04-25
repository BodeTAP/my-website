import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konsultasi Gratis Pembuatan Website",
  description:
    "Hubungi MFWEB untuk konsultasi gratis pembuatan website bisnis Anda. Tanpa biaya, tanpa komitmen. Kami siap membantu Anda tampil profesional di internet.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Konsultasi Gratis Pembuatan Website | MFWEB",
    description:
      "Hubungi MFWEB untuk konsultasi gratis. Kami bantu bisnis lokal Anda tampil profesional dengan website cepat dan SEO-friendly.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
