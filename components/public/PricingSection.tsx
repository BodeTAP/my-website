import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const WA = process.env.WHATSAPP_NUMBER ?? "6281234567890";

const plans = [
  {
    name: "Landing Page",
    tagline: "Pilihan terbaik untuk Iklan / Promosi",
    price: "800 K",
    featured: false,
    features: [
      "Desain 1 Halaman",
      "Standar Design",
      "Domain .com (1 Tahun)",
      "Hosting & SSL Gratis (1 Tahun)",
      "DDOS Protection",
      "Optimasi Speed Loading",
      "Optimasi Image/Foto/Video",
      "Integrasi WhatsApp/Telegram",
      "Integrasi Google Maps",
      "Bantuan Pembuatan Copywriting",
      "Dashboard Admin",
      "1x Revisi",
    ],
  },
  {
    name: "Compro Simple",
    tagline: "Cocok untuk Profil Usaha Simple",
    price: "1,5 Juta",
    featured: false,
    features: [
      "Desain 3-4 Halaman",
      "Standar Design",
      "Domain .com (1 Tahun)",
      "Hosting & SSL Gratis (1 Tahun)",
      "DDOS Protection",
      "1 Akun Email Bisnis",
      "Optimasi Speed Loading",
      "Optimasi Image/Foto/Video",
      "Integrasi Google Maps",
      "Integrasi WhatsApp/Telegram",
      "Bantuan Pembuatan Copywriting",
      "Optimasi SEO Dasar",
      "Dashboard Admin",
      "2x Revisi",
    ],
  },
  {
    name: "Compro Pro",
    tagline: "Cocok untuk Profil Usaha Lengkap",
    price: "3,5 Juta",
    featured: true,
    features: [
      "Desain 5-7 Halaman",
      "Design Custom & Modern",
      "Domain .com (1 Tahun)",
      "Hosting & SSL Gratis (1 Tahun)",
      "DDOS Protection",
      "3-5 Akun Email Bisnis",
      "Optimasi Speed Loading",
      "Optimasi Image/Foto/Video",
      "Integrasi Google Maps",
      "Integrasi WhatsApp/Telegram",
      "Optimasi SEO Dasar",
      "Multi Bahasa",
      "Bantuan Pembuatan Copywriting",
      "Dashboard Admin",
      "3x Revisi",
    ],
  },
  {
    name: "Toko Online",
    tagline: "Cocok untuk Penjualan Online",
    price: "5,4 Juta",
    featured: false,
    features: [
      "Desain Unlimited Halaman",
      "Custom & Modern Design",
      "Domain .com (1 Tahun)",
      "Hosting & SSL Gratis (1 Tahun)",
      "DDOS Protection",
      "5 Akun Email Bisnis",
      "Optimasi Speed Loading",
      "Optimasi Image/Foto/Video",
      "Integrasi Google Maps",
      "Optimasi SEO Dasar",
      "Integrasi WhatsApp/Telegram",
      "Multi Bahasa",
      "Integrasi Metode Pembayaran",
      "Bantuan Pembuatan Copywriting",
      "Bantuan Upload Produk Konten",
      "Dashboard Admin",
      "3x Revisi",
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Paket <span className="text-gradient">Harga Transparan</span>
          </h2>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Semua paket sudah termasuk
            domain, hosting, dan konsultasi gratis sebelum pengerjaan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            const waText = `Halo MFWEB, saya tertarik dengan paket ${plan.name} (Rp ${plan.price}). Boleh konsultasi lebih lanjut?`;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                  plan.featured
                    ? "glass border border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.15)]"
                    : "glass hover:border-blue-500/30"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Paling Populer
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-5">
                  <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                  <p className="text-blue-200/50 text-xs leading-snug">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-blue-200/40 text-xs mb-1">Mulai dari</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-blue-200/60 text-sm font-medium">Rp</span>
                    <span
                      className={`text-3xl font-extrabold leading-none ${
                        plan.featured ? "text-teal-400" : "text-white"
                      }`}
                    >
                      {plan.price}
                    </span>
                  </div>
                </div>

                {/* Features — flex-1 agar mendorong tombol ke bawah */}
                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.featured ? "text-teal-400" : "text-green-400"
                        }`}
                      />
                      <span className="text-blue-100/70 text-sm leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA — selalu di bawah */}
                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-auto"
                >
                  <Button
                    className={`w-full h-11 font-semibold ${
                      plan.featured
                        ? "bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25"
                        : "border border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    }`}
                  >
                    Pilih Paket
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
