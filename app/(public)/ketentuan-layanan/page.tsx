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
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-blue-400/60 text-sm mb-2">Terakhir diperbarui: {UPDATED}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ketentuan Layanan</h1>
          <p className="text-blue-200/60 leading-relaxed">
            Dengan menggunakan layanan MFWEB, Anda menyetujui ketentuan-ketentuan berikut.
            Harap baca dengan seksama sebelum menggunakan layanan kami.
          </p>
        </div>

        <div className="space-y-8">

          <section>
            <h2 className="text-white font-bold text-xl mb-3">1. Definisi</h2>
            <ul className="text-blue-200/60 space-y-1.5 list-disc pl-5">
              <li><strong className="text-blue-200">"MFWEB"</strong> merujuk pada penyedia layanan pembuatan website.</li>
              <li><strong className="text-blue-200">"Klien"</strong> merujuk pada individu atau badan usaha yang menggunakan layanan MFWEB.</li>
              <li><strong className="text-blue-200">"Layanan"</strong> merujuk pada jasa pembuatan website, portal klien, dan layanan terkait.</li>
              <li><strong className="text-blue-200">"Portal Klien"</strong> merujuk pada platform digital untuk memantau proyek dan invoice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">2. Layanan yang Disediakan</h2>
            <p className="text-blue-200/60 mb-3">MFWEB menyediakan layanan meliputi:</p>
            <ul className="text-blue-200/60 space-y-1.5 list-disc pl-5">
              <li>Pembuatan landing page, company profile, dan toko online</li>
              <li>Optimasi SEO website</li>
              <li>Hosting dan pengelolaan domain</li>
              <li>Support teknis dan pemeliharaan website (paket maintenance)</li>
              <li>Akses portal klien untuk memantau proyek dan invoice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">3. Pemesanan dan Pembayaran</h2>
            <div className="text-blue-200/60 space-y-3">
              <p>3.1 Pemesanan dianggap sah setelah Klien melakukan pembayaran uang muka (DP) sesuai kesepakatan.</p>
              <p>3.2 Pembayaran dapat dilakukan melalui transfer bank, QRIS, atau metode pembayaran lain yang tersedia melalui gateway pembayaran kami (Tripay).</p>
              <p>3.3 Invoice akan dikirimkan melalui portal klien dan/atau email. Pembayaran harus diselesaikan sesuai jatuh tempo yang tercantum.</p>
              <p>3.4 Keterlambatan pembayaran dapat menyebabkan penundaan pengerjaan proyek.</p>
              <p>3.5 Biaya yang sudah dibayarkan tidak dapat dikembalikan kecuali jika MFWEB gagal memenuhi kewajibannya.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">4. Alur Transaksi Pembayaran</h2>
            <div className="text-blue-200/60 space-y-2">
              <p className="mb-3">Proses pembayaran layanan MFWEB melalui platform digital berjalan sebagai berikut:</p>
              <ol className="space-y-2 list-decimal pl-5">
                <li>Klien menerima invoice melalui portal klien (<code className="text-blue-300 bg-blue-900/30 px-1 rounded">/portal/invoices</code>).</li>
                <li>Klien memilih metode pembayaran yang tersedia (transfer bank, QRIS, e-wallet, atau gerai retail).</li>
                <li>Klien melakukan pembayaran sesuai instruksi yang diberikan.</li>
                <li>Gateway pembayaran (Tripay) memverifikasi pembayaran secara otomatis.</li>
                <li>Sistem kami menerima notifikasi dari Tripay dan memperbarui status invoice menjadi <strong className="text-green-400">LUNAS</strong>.</li>
                <li>Klien dan admin menerima konfirmasi pembayaran otomatis.</li>
              </ol>
              <p className="mt-3">Konfirmasi pembayaran manual via WhatsApp tetap tersedia sebagai alternatif.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">5. Pengerjaan dan Revisi</h2>
            <div className="text-blue-200/60 space-y-3">
              <p>5.1 Estimasi waktu pengerjaan diberikan setelah konsultasi dan bergantung pada paket yang dipilih serta kelengkapan materi dari Klien.</p>
              <p>5.2 Jumlah revisi yang termasuk dalam paket sesuai dengan ketentuan paket yang dipilih (1-3x revisi).</p>
              <p>5.3 Revisi di luar paket dikenakan biaya tambahan sesuai kesepakatan.</p>
              <p>5.4 MFWEB berhak menunda pengerjaan jika Klien tidak memberikan materi yang dibutuhkan dalam waktu yang wajar.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">6. Kepemilikan dan Hak Cipta</h2>
            <div className="text-blue-200/60 space-y-3">
              <p>6.1 Setelah pelunasan pembayaran, Klien memiliki hak penuh atas website yang telah dibuat, termasuk kode dan desain.</p>
              <p>6.2 MFWEB berhak menampilkan hasil pekerjaan sebagai portofolio, kecuali Klien secara eksplisit meminta sebaliknya.</p>
              <p>6.3 Klien bertanggung jawab atas legalitas konten yang diunggah ke website.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">7. Tanggung Jawab Terbatas</h2>
            <div className="text-blue-200/60 space-y-3">
              <p>7.1 MFWEB tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan layanan.</p>
              <p>7.2 MFWEB tidak menjamin peringkat tertentu di mesin pencari, kecuali dalam paket SEO dengan ketentuan khusus.</p>
              <p>7.3 Gangguan layanan pihak ketiga (hosting, domain, payment gateway) di luar kendali MFWEB bukan merupakan tanggung jawab MFWEB.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">8. Pembatalan Layanan</h2>
            <div className="text-blue-200/60 space-y-3">
              <p>8.1 Klien dapat membatalkan pesanan sebelum pengerjaan dimulai dan mendapatkan pengembalian dana penuh.</p>
              <p>8.2 Pembatalan setelah pengerjaan dimulai akan dikenakan biaya sesuai persentase pekerjaan yang telah diselesaikan.</p>
              <p>8.3 MFWEB berhak membatalkan layanan jika Klien melanggar ketentuan ini.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">9. Dukungan dan Kontak</h2>
            <p className="text-blue-200/60">
              Untuk pertanyaan, keluhan, atau dukungan teknis, Klien dapat menghubungi kami melalui:{" "}
              <Link href="/contact" className="text-blue-400 hover:underline">halaman kontak</Link>,
              {" "}email, atau langsung via WhatsApp di nomor{" "}
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                +{WA}
              </a>.
              Tim kami siap membantu pada hari kerja Senin–Sabtu, pukul 09.00–21.00 WIB.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">10. Hukum yang Berlaku</h2>
            <p className="text-blue-200/60">
              Ketentuan ini tunduk pada hukum yang berlaku di Indonesia. Setiap sengketa diselesaikan secara musyawarah. Jika tidak tercapai kesepakatan, penyelesaian dilakukan melalui mekanisme hukum yang berlaku.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
