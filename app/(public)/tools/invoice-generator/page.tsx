import type { Metadata } from "next";
import { Copy, Palette, Percent, ReceiptText } from "lucide-react";
import PaidToolLanding from "../_components/PaidToolLanding";
import { getToolSettings } from "@/lib/toolSettings";
import PublicInvoiceForm from "@/components/public/tools/PublicInvoiceForm";
import { getWelcomeCreditBreakdown } from "@/lib/welcomeCredits";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mfweb.maffisorp.id";
const pageTitle = "Invoice Generator PDF dengan Template dan PPN 11% | MFWEB";
const pageDescription =
  "Buat invoice PDF cepat dengan template desain, brand kit, PPN 11% opsional, duplicate invoice, edit detail, status manual, dan download PDF.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: "/tools/invoice-generator" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/tools/invoice-generator",
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

export default async function InvoiceGeneratorLandingPage() {
  const settings = await getToolSettings();
  const creditCost = settings.invoiceGenerator.creditCost;
  const defaultTax = settings.invoiceGenerator.defaultIncludeTax;
  const welcomeCredits = settings.signupBonus.enabled ? settings.signupBonus.amount : 0;
  const welcomeBonusBreakdown = welcomeCredits > 0
    ? getWelcomeCreditBreakdown(welcomeCredits, settings).summary
    : "";

  return (
    <>
      {/* Free-tier public invoice form */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Coba Invoice Generator Gratis
          </h1>
          <p className="text-sm text-blue-200/50">
            Buat invoice sederhana langsung tanpa login. Daftar akun untuk fitur lengkap.
          </p>
        </div>
        <PublicInvoiceForm
          welcomeCredits={welcomeCredits}
          welcomeBonusBreakdown={welcomeBonusBreakdown}
        />
      </section>

      {/* Separator */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs font-bold text-blue-200/30 uppercase tracking-widest">Atau daftar untuk fitur lengkap</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
      </div>

      <PaidToolLanding
      eyebrow="Invoice Generator"
      title="Invoice Generator PDF dengan Template dan PPN 11%"
      description={pageDescription}
      canonicalPath="/tools/invoice-generator"
      primaryCta="Buat invoice"
      portalHref="/portal/tools/invoice-generator"
      accent="emerald"
      mockup="invoice"
      creditCost={creditCost}
      features={[
        {
          icon: ReceiptText,
          title: "Invoice PDF mandiri",
          desc: "Buat invoice yang tidak terhubung ke Tripay atau payment link, cocok untuk dokumen tagihan offline.",
        },
        {
          icon: Percent,
          title: "PPN 11% opsional",
          desc: "User bisa memilih menyertakan PPN 11%, lalu sistem menghitung pajak dan total otomatis.",
        },
        {
          icon: Palette,
          title: "Template desain",
          desc: "Atur logo, warna, font, layout, posisi logo, dan elemen PDF yang ingin ditampilkan.",
        },
        {
          icon: Copy,
          title: "Duplicate dan edit",
          desc: "Invoice lama dapat dibuka ulang, diedit, diduplikasi, diberi status manual, atau diunduh lagi.",
        },
      ]}
      workflow={[
        "Isi data pengirim, penerima, tanggal invoice, jatuh tempo, dan catatan pembayaran.",
        "Tambahkan item layanan, kuantitas, harga, diskon, dan opsi PPN 11% jika diperlukan.",
        "Pilih template desain atau gunakan brand kit yang sudah disimpan dari profil.",
        "Generate invoice untuk menyimpan dokumen dan membuat PDF siap download.",
        "Buka detail invoice untuk edit, duplicate, ubah status manual, atau download ulang PDF.",
      ]}
      useCases={[
        "Freelancer dan agency yang perlu invoice PDF cepat tanpa payment gateway.",
        "Bisnis layanan yang ingin mengirim tagihan rapi ke klien setelah pekerjaan selesai.",
        "Admin operasional yang sering membuat invoice berulang untuk layanan serupa.",
        "Pemilik bisnis yang perlu dokumen invoice dengan PPN 11% opsional dan desain konsisten.",
      ]}
      pricing={[
        {
          label: "Biaya generate",
          value: `${creditCost} kredit`,
          hint: "Kredit dipotong saat invoice berhasil dibuat dan tersimpan.",
        },
        {
          label: "Pajak default",
          value: defaultTax ? "PPN aktif" : "PPN opsional",
          hint: "Label pajak fixed PPN 11%, tetapi user tetap bisa memilih menyertakan atau tidak.",
        },
        {
          label: "Output",
          value: "PDF",
          hint: "Invoice dapat diunduh ulang dari riwayat atau halaman detail invoice.",
        },
      ]}
      welcomeCredits={welcomeCredits}
      welcomeBonusBreakdown={welcomeBonusBreakdown}
      faqs={[
        {
          q: "Apakah invoice ini tersambung ke pembayaran?",
          a: "Tidak. Invoice Generator sengaja dibuat sebagai generator PDF mandiri tanpa payment link atau Tripay.",
        },
        {
          q: "Apakah PPN bisa diubah selain 11%?",
          a: "Tidak untuk saat ini. Label dan kalkulasi pajak dibuat fixed PPN 11% agar konsisten.",
        },
        {
          q: "Apakah invoice bisa diedit setelah dibuat?",
          a: "Bisa. Detail invoice dapat dibuka ulang untuk mengedit data, item, status manual, atau mengunduh PDF lagi.",
        },
        {
          q: "Apakah bisa menggunakan logo sendiri?",
          a: "Bisa. Logo diupload dari portal dan dapat disimpan sebagai bagian dari template desain atau brand kit global.",
        },
      ]}
    />
    </>
  );
}
