import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi MFWEB menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
  alternates: { canonical: "/kebijakan-privasi" },
  robots: { index: false, follow: false },
};

const UPDATED = "27 April 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="w-full bg-[#1E242E] text-white pt-24 pb-16 sm:pt-28 sm:pb-20 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-slate-500" />
            <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
              Legalitas & Privasi
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Kebijakan Privasi
          </h1>
          <p className="mt-3 text-slate-400 text-xs font-mono">
            Terakhir diperbarui: {UPDATED}
          </p>
          <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            MFWEB (&quot;<strong className="text-white font-medium">kami</strong>&quot;) berkomitmen penuh menjaga kerahasiaan dan keamanan data pribadi Anda sesuai standar perlindungan data yang berlaku.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto space-y-10 text-slate-600 text-sm sm:text-base leading-relaxed">

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">1. Informasi yang Kami Kumpulkan</h2>
            <p className="mb-3">Kami mengumpulkan informasi yang Anda berikan secara langsung saat menggunakan layanan kami, antara lain:</p>
            <ul className="space-y-2 list-disc pl-5 text-slate-600">
              <li>Nama lengkap dan kontak identitas (email, nomor WhatsApp aktif)</li>
              <li>Profil entitas usaha atau merek dagang</li>
              <li>Informasi transaksi pembayaran (diproses aman melalui gateway tersertifikasi)</li>
              <li>Materi proyek yang dikirimkan melalui portal atau formulir brief</li>
              <li>Data kredensial akun portal klien (email dan kata sandi terenkripsi)</li>
            </ul>
            <p className="mt-4 text-xs text-slate-500 font-mono">
              Kami juga mengumpulkan data analitik teknis seperti alamat IP, tipe browser, dan log aktivitas guna memastikan stabilitas infrastruktur kami.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">2. Tujuan Penggunaan Informasi</h2>
            <p className="mb-3">Informasi yang dikumpulkan dimanfaatkan secara proporsional untuk keperluan:</p>
            <ul className="space-y-2 list-disc pl-5 text-slate-600">
              <li>Pengerjaan, konfigurasi teknis, dan serah terima proyek website</li>
              <li>Penerbitan dokumen invoice resmi dan validasi pembayaran</li>
              <li>Komunikasi koordinasi berkala selama masa pengerjaan</li>
              <li>Otentikasi akses ke portal klien mandiri Anda</li>
              <li>Peningkatan kualitas keamanan sistem dan pencegahan ancaman siber</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">3. Pihak Ketiga & Infrastruktur</h2>
            <p className="mb-3">Kami tidak pernah menjual data pribadi Anda kepada pihak manapun. Kami hanya bermitra dengan penyedia infrastruktur tepercaya untuk kebutuhan operasional:</p>
            <ul className="space-y-2 list-disc pl-5 text-slate-600">
              <li><strong className="text-slate-900">Tripay</strong> — Gateway transaksi berizin resmi Bank Indonesia</li>
              <li><strong className="text-slate-900">Vercel</strong> — Infrastruktur hosting dan Edge Network berstandar global</li>
              <li><strong className="text-slate-900">Resend</strong> — Layanan pengiriman notifikasi transactional email</li>
              <li><strong className="text-slate-900">Neon PostgreSQL</strong> — Penyimpanan basis data cloud dengan enkripsi at-rest</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">4. Keamanan dan Enkripsi Data</h2>
            <p>
              Seluruh transmisi data dienkripsi menggunakan protokol SSL/TLS modern (HTTPS). Akses ke basis data internal dilindungi dengan autentikasi bertingkat dan prinsip least-privilege untuk meminimalkan risiko kebocoran data.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">5. Hak Kepemilikan Data Anda</h2>
            <p className="mb-3">Sebagai pemilik data, Anda berhak untuk:</p>
            <ul className="space-y-2 list-disc pl-5 text-slate-600">
              <li>Meminta salinan data riwayat akun yang kami catat</li>
              <li>Melakukan pembaruan atau perbaikan informasi yang tidak akurat</li>
              <li>Mengajukan penghapusan akun portal setelah seluruh kewajiban proyek terselesaikan</li>
            </ul>
            <p className="mt-4">
              Untuk menyampaikan permohonan hak data, silakan hubungi kami via{" "}
              <Link href="/contact" className="text-slate-900 underline font-semibold">
                halaman kontak
              </Link>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FA] p-6 sm:p-8">
            <h2 className="text-slate-900 font-bold text-lg mb-3">6. Hubungi Tim Hukum & Kepatuhan</h2>
            <p>
              Jika Anda memiliki pertanyaan spesifik mengenai ketentuan privasi ini, silakan berkonsultasi melalui{" "}
              <Link href="/contact" className="text-slate-900 underline font-semibold">
                halaman kontak resmi MFWEB
              </Link>{" "}
              atau melalui nomor WhatsApp operasional kami.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
