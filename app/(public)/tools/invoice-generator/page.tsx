import type { Metadata } from "next";
import { Copy, Palette, Percent, ReceiptText } from "lucide-react";
import PaidToolLanding from "../_components/PaidToolLanding";
import { getToolSettings } from "@/lib/toolSettings";

export const metadata: Metadata = {
  title: "Invoice Generator PDF dengan Template & PPN 11% | MFWEB",
  description:
    "Buat invoice PDF cepat dari portal klien dengan template desain, brand kit, PPN 11% opsional, edit detail, duplicate, dan download PDF.",
  alternates: { canonical: "/tools/invoice-generator" },
};

export default async function InvoiceGeneratorLandingPage() {
  const settings = await getToolSettings();
  const creditCost = settings.invoiceGenerator.creditCost;
  const defaultTax = settings.invoiceGenerator.defaultIncludeTax;

  return (
    <PaidToolLanding
      eyebrow="Invoice Generator"
      title="Buat invoice PDF cepat dengan desain yang tetap profesional"
      description="Invoice Generator membantu user membuat tagihan PDF mandiri tanpa payment gateway, lengkap dengan template desain, status manual, duplicate invoice, dan PPN 11% opsional."
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
  );
}
