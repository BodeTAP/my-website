import Link from "next/link";
import { Check, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, StaggerItem, HoverCard } from "@/components/public/motion";

const WA = process.env.WHATSAPP_NUMBER ?? "6282221682343";

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
    <section className="relative px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeUp className="mb-12 max-w-2xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-blue-200/55">
            Paket website
          </p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Harga dibuat jelas sejak awal.
          </h2>
          <p className="mt-4 text-blue-100/58 leading-relaxed">
            Pilih paket website sesuai kebutuhan. Semua paket sudah termasuk
            domain, hosting, SSL, dan konsultasi sebelum pengerjaan.
          </p>
          <Link href="/kalkulasi-harga">
            <span className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-blue-200 transition-colors hover:bg-white/[0.06]">
              <Calculator className="w-3.5 h-3.5" />
              Hitung estimasi dengan fitur tambahan
            </span>
          </Link>
        </FadeUp>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            const waText = `Halo MFWEB, saya tertarik dengan paket ${plan.name} (Rp ${plan.price}). Boleh konsultasi lebih lanjut?`;

            return (
              <StaggerItem key={plan.name} className={plan.featured ? "relative z-10" : "relative z-0"}>
              <HoverCard className="h-full">
              <div
                className={`relative flex flex-col rounded-xl p-6 h-full transition-all duration-300 ${
                  plan.featured
                    ? "border border-teal-400/45 bg-[#071c24] lg:-translate-y-2"
                    : "border border-white/8 bg-white/[0.025] hover:border-blue-400/25"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="rounded-full border border-teal-300/25 bg-teal-400/15 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-teal-100">
                      Sering dipilih
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-5 relative">
                  <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-blue-200/50 text-xs leading-snug">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-6 relative">
                  <p className="text-blue-200/40 text-xs mb-1">Mulai dari</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-blue-200/60 text-sm font-medium">Rp</span>
                    <span
                      className={`text-4xl font-extrabold leading-none tracking-tight ${
                        plan.featured ? "text-teal-400" : "text-white"
                      }`}
                    >
                      {plan.price}
                    </span>
                  </div>
                </div>

                {/* Features — flex-1 agar mendorong tombol ke bawah */}
                <ul className="space-y-3 flex-1 mb-8 relative">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.featured ? "text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" : "text-blue-400/70"
                        }`}
                      />
                      <span className={`${plan.featured ? "text-blue-50/90" : "text-blue-100/70"} text-sm leading-snug`}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA — selalu di bawah */}
                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-auto relative z-20"
                >
                  <Button
                    className={`w-full h-12 font-bold text-sm rounded-lg transition-all ${
                      plan.featured
                        ? "bg-teal-500 hover:bg-teal-400 text-[#031011]"
                        : "border border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    }`}
                  >
                    Pilih Paket
                  </Button>
                </a>
              </div>
              </HoverCard>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
