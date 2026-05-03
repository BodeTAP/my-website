import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi MFWEB menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
  alternates: { canonical: "/kebijakan-privasi" },
  robots: { index: false, follow: false },
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";
const UPDATED = "27 April 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-blue-400/60 text-sm mb-2">Terakhir diperbarui: {UPDATED}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Kebijakan Privasi</h1>
          <p className="text-blue-200/60 leading-relaxed">
            MFWEB (&quot;<strong className="text-blue-200">kami</strong>&quot;) berkomitmen untuk melindungi privasi Anda.
            Kebijakan ini menjelaskan informasi apa yang kami kumpulkan, bagaimana kami menggunakannya,
            dan hak-hak yang Anda miliki atas data Anda.
          </p>
        </div>

        <div className="prose prose-invert prose-blue max-w-none space-y-8">

          <section>
            <h2 className="text-white font-bold text-xl mb-3">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-blue-200/60 mb-3">Kami mengumpulkan informasi yang Anda berikan secara langsung, antara lain:</p>
            <ul className="text-blue-200/60 space-y-1.5 list-disc pl-5">
              <li>Nama lengkap dan informasi kontak (email, nomor WhatsApp)</li>
              <li>Nama bisnis dan informasi usaha</li>
              <li>Informasi pembayaran (diproses oleh pihak ketiga yang aman)</li>
              <li>Konten yang Anda kirimkan melalui form konsultasi atau onboarding</li>
              <li>Data akun portal klien (email, password terenkripsi)</li>
            </ul>
            <p className="text-blue-200/60 mt-3">Kami juga mengumpulkan data secara otomatis melalui cookies dan teknologi serupa, seperti alamat IP, jenis browser, dan halaman yang dikunjungi.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">2. Cara Kami Menggunakan Informasi</h2>
            <p className="text-blue-200/60 mb-3">Informasi yang kami kumpulkan digunakan untuk:</p>
            <ul className="text-blue-200/60 space-y-1.5 list-disc pl-5">
              <li>Menyediakan dan mengelola layanan pembuatan website</li>
              <li>Memproses pembayaran dan mengirimkan invoice</li>
              <li>Berkomunikasi dengan Anda terkait proyek dan layanan</li>
              <li>Mengelola akun portal klien Anda</li>
              <li>Meningkatkan kualitas layanan dan website kami</li>
              <li>Memenuhi kewajiban hukum yang berlaku</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">3. Berbagi Informasi dengan Pihak Ketiga</h2>
            <p className="text-blue-200/60 mb-3">Kami tidak menjual atau menyewakan data pribadi Anda. Kami hanya berbagi informasi dengan pihak ketiga terpercaya untuk keperluan operasional, termasuk:</p>
            <ul className="text-blue-200/60 space-y-1.5 list-disc pl-5">
              <li><strong className="text-blue-200">Tripay</strong> — gateway pembayaran untuk memproses transaksi</li>
              <li><strong className="text-blue-200">Vercel</strong> — hosting dan infrastruktur server</li>
              <li><strong className="text-blue-200">Resend</strong> — layanan pengiriman email</li>
              <li><strong className="text-blue-200">Neon PostgreSQL</strong> — penyimpanan database</li>
            </ul>
            <p className="text-blue-200/60 mt-3">Semua pihak ketiga tunduk pada kebijakan privasi mereka masing-masing dan kami memastikan mereka memiliki standar keamanan yang memadai.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">4. Keamanan Data</h2>
            <p className="text-blue-200/60">
              Kami menerapkan langkah-langkah keamanan teknis dan organisasional untuk melindungi data Anda, termasuk enkripsi data, koneksi HTTPS, dan autentikasi yang aman. Namun, tidak ada metode transmisi internet yang 100% aman, dan kami tidak dapat menjamin keamanan mutlak.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">5. Cookies</h2>
            <p className="text-blue-200/60">
              Kami menggunakan cookies untuk menjaga sesi login Anda dan meningkatkan pengalaman pengguna. Anda dapat mengatur browser untuk menolak cookies, namun beberapa fitur mungkin tidak berfungsi dengan baik.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">6. Hak-Hak Anda</h2>
            <p className="text-blue-200/60 mb-3">Anda memiliki hak untuk:</p>
            <ul className="text-blue-200/60 space-y-1.5 list-disc pl-5">
              <li>Mengakses data pribadi yang kami simpan tentang Anda</li>
              <li>Meminta koreksi data yang tidak akurat</li>
              <li>Meminta penghapusan data Anda (dengan ketentuan tertentu)</li>
              <li>Menolak pemrosesan data untuk tujuan tertentu</li>
            </ul>
            <p className="text-blue-200/60 mt-3">
              Untuk menggunakan hak-hak tersebut, hubungi kami di{" "}
              <Link href="/contact" className="text-blue-400 hover:underline">halaman kontak</Link> atau via WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">7. Retensi Data</h2>
            <p className="text-blue-200/60">
              Kami menyimpan data Anda selama hubungan bisnis berlangsung dan sesuai kewajiban hukum yang berlaku. Data akun akan dihapus dalam waktu 30 hari setelah permintaan penghapusan akun, kecuali diperlukan untuk keperluan hukum atau akuntansi.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">8. Perubahan Kebijakan</h2>
            <p className="text-blue-200/60">
              Kami dapat memperbarui kebijakan privasi ini sewaktu-waktu. Perubahan akan diumumkan di halaman ini dengan memperbarui tanggal &quot;Terakhir diperbarui&quot;. Kami menyarankan Anda meninjau halaman ini secara berkala.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">9. Hubungi Kami</h2>
            <p className="text-blue-200/60">
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui{" "}
              <Link href="/contact" className="text-blue-400 hover:underline">halaman kontak</Link> atau langsung via WhatsApp.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
