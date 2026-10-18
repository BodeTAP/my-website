import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ketentuan Layanan",
  description: "Ketentuan layanan MFWEB mengatur penggunaan layanan pembuatan website dan portal klien kami.",
  alternates: { canonical: "/ketentuan-layanan" },
  robots: { index: false, follow: false },
};

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282221682343";
const UPDATED = "27 April 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="w-full bg-[#1E242E] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-slate-500" />
            <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
              Perjanjian & Regulasi
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Ketentuan Layanan
          </h1>
          <p className="mt-3 text-slate-400 text-xs font-mono">
            Terakhir diperbarui: {UPDATED}
          </p>
          <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Perjanjian ini mengatur syarat dan tata cara penggunaan jasa pengembangan website, pemeliharaan sistem, dan portal klien MFWEB.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto space-y-10 text-slate-600 text-sm sm:text-base leading-relaxed">

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">1. Definisi Istilah</h2>
            <ul className="space-y-2 list-disc pl-5 text-slate-600">
              <li><strong className="text-slate-900">&quot;MFWEB&quot;</strong> merujuk pada entitas penyedia jasa perancangan dan rekayasa web.</li>
              <li><strong className="text-slate-900">&quot;Klien&quot;</strong> merujuk pada perorangan atau badan usaha yang menjalin kontrak layanan.</li>
              <li><strong className="text-slate-900">&quot;Layanan&quot;</strong> mencakup perancangan antarmuka, pemrograman, integrasi sistem, dan optimasi SEO.</li>
              <li><strong className="text-slate-900">&quot;Portal Klien&quot;</strong> merujuk pada dashboard online tempat Klien memantau status proyek, tagihan, dan tools.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">2. Lingkup Pekerjaan & Batasan</h2>
            <p className="mb-3">MFWEB melayani pengembangan website sesuai spesifikasi yang disepakati, meliputi:</p>
            <ul className="space-y-2 list-disc pl-5 text-slate-600">
              <li>Pembuatan Landing Page berorientasi konversi, Profil Perusahaan, dan Toko Online</li>
              <li>Konfigurasi arsitektur SEO on-page dan performa kecepatan (Core Web Vitals)</li>
              <li>Penyediaan domain dan hosting performa tinggi (pada paket yang mencakup)</li>
              <li>Dukungan pemeliharaan berkala serta pendampingan teknis setelah go-live</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">3. Mekanisme Pemesanan & Pembayaran</h2>
            <div className="space-y-3">
              <p>3.1 Pengerjaan proyek dimulai secara resmi setelah pembayaran uang muka (DP) diterima dan materi dasar divalidasi.</p>
              <p>3.2 Pembayaran dapat dilakukan melalui saluran resmi gateway Tripay (QRIS, Virtual Account, Transfer Bank).</p>
              <p>3.3 Invoice tagihan memiliki tanggal jatuh tempo yang tercatat resmi pada sistem portal klien.</p>
              <p>3.4 Keterlambatan pembayaran termin dapat berdampak pada penyesuaian jadwal rilis atau penundaan sementara akses pengerjaan.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">4. Hak Cipta & Kepemilikan Aset</h2>
            <div className="space-y-3">
              <p>4.1 Setelah seluruh kewajiban pembayaran dilunasi penuh, Klien memegang hak milik penuh atas domain, materi konten, dan source code website.</p>
              <p>4.2 MFWEB berhak mencantumkan hasil karya pada portofolio dan dokumentasi studi kasus, kecuali ada perjanjian tertulis NDA sebelumnya.</p>
              <p>4.3 Klien menjamin bahwa seluruh aset gambar, teks, dan video yang diserahkan tidak melanggar hak cipta pihak ketiga.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">5. Ketentuan Revisi & Garansi</h2>
            <div className="space-y-3">
              <p>5.1 Setiap paket layanan mencakup kuota revisi minor (1 hingga 3 kali) yang berfokus pada penyelarasan konten, tata letak, dan visual.</p>
              <p>5.2 Perubahan besar di luar cakupan brief awal (scope creep) akan dikalkulasikan sebagai add-on pekerjaan terpisah.</p>
              <p>5.3 Garansi perbaikan bug teknis berlaku selama masa pemeliharaan aktif sejak tanggal serah terima.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">6. Dukungan Teknis & Layanan Pelanggan</h2>
            <p>
              Bantuan teknis dan koordinasi pengerjaan dilayani melalui portal klien atau via WhatsApp di nomor{" "}
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="text-slate-900 underline font-semibold">
                +{WA}
              </a>{" "}
              pada jam operasional kerja Senin–Sabtu, pukul 09.00–21.00 WIB.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
