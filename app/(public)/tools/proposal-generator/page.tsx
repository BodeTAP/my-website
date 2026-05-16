import type { Metadata } from "next";
import { Brain, Download, LayoutTemplate, Palette } from "lucide-react";
import PaidToolLanding from "../_components/PaidToolLanding";
import { getToolSettings } from "@/lib/toolSettings";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mfweb.maffisorp.id";
const pageTitle = "Proposal Generator untuk Buat Proposal PDF Profesional | MFWEB";
const pageDescription =
  "Buat proposal PDF profesional dengan template, brand kit, konten terarah, dan riwayat dokumen langsung dari portal klien MFWEB.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/tools/proposal-generator" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/tools/proposal-generator",
    siteName: "MFWEB",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/opengraph-image"],
  },
};

export default async function ProposalGeneratorLandingPage() {
  const settings = await getToolSettings();
  const creditCost = settings.proposalGenerator.creditCost;

  return (
    <PaidToolLanding
      eyebrow="Proposal Generator"
      title="Proposal Generator untuk Buat Proposal PDF Profesional"
      description={pageDescription}
      canonicalPath="/tools/proposal-generator"
      primaryCta="Buat proposal"
      portalHref="/portal/tools/proposal-generator"
      accent="blue"
      mockup="proposal"
      creditCost={creditCost}
      features={[
        {
          icon: LayoutTemplate,
          title: "Template siap pakai",
          desc: "Mulai dari struktur proposal yang sudah rapi, lalu sesuaikan isi sesuai kebutuhan prospek.",
        },
        {
          icon: Palette,
          title: "Brand kit",
          desc: "Gunakan logo, warna, font, layout, dan visibilitas elemen agar proposal konsisten dengan bisnis.",
        },
        {
          icon: Brain,
          title: "Konten terarah",
          desc: "Bantu user menyusun konteks, scope pekerjaan, timeline, dan penawaran dengan alur yang jelas.",
        },
        {
          icon: Download,
          title: "Download PDF",
          desc: "Proposal yang dibuat dapat diunduh sebagai PDF untuk dikirim ke calon klien atau disimpan sebagai arsip.",
        },
      ]}
      workflow={[
        "Isi informasi prospek, nama bisnis, konteks kebutuhan, dan detail penawaran.",
        "Pilih template proposal atau gunakan template yang sudah disimpan di portal.",
        "Atur brand kit seperti logo, warna, font, posisi logo, dan elemen yang ingin ditampilkan.",
        "Review isi proposal sebelum generate agar biaya kredit hanya dipakai saat dokumen siap dibuat.",
        "Download PDF dan kirim ke prospek melalui kanal komunikasi yang biasa digunakan.",
      ]}
      useCases={[
        "Agency atau freelancer yang sering mengirim proposal jasa ke calon klien.",
        "Tim sales B2B yang butuh dokumen penawaran rapi dalam waktu singkat.",
        "Bisnis layanan yang ingin menjaga tampilan proposal tetap konsisten.",
        "Founder atau operator yang perlu membuat proposal tanpa memakai aplikasi desain tambahan.",
      ]}
      pricing={[
        {
          label: "Biaya generate",
          value: `${creditCost} kredit`,
          hint: "Kredit dipotong saat proposal berhasil dibuat dan tersimpan di portal.",
        },
        {
          label: "Output",
          value: "PDF",
          hint: "Dokumen bisa diunduh kapan saja dari riwayat Proposal Generator.",
        },
        {
          label: "Template",
          value: "Reusable",
          hint: "Brand kit dan template dapat disimpan agar proposal berikutnya lebih cepat dibuat.",
        },
      ]}
      faqs={[
        {
          q: "Apakah proposal harus tersambung ke pembayaran?",
          a: "Tidak. Proposal Generator fokus membuat dokumen PDF, bukan payment link.",
        },
        {
          q: "Apakah bisa pakai logo sendiri?",
          a: "Bisa. Logo dapat diupload dari portal dan disimpan sebagai bagian dari brand kit.",
        },
        {
          q: "Apakah proposal lama berubah jika brand kit diedit?",
          a: "Tidak. Proposal menyimpan snapshot desain saat dibuat, sehingga dokumen lama tetap konsisten.",
        },
        {
          q: "Kapan kredit dipotong?",
          a: "Kredit dipotong saat proposal berhasil digenerate, bukan saat user mengedit form atau brand kit.",
        },
      ]}
    />
  );
}
