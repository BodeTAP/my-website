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
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-100px] w-[500px] h-[500px] bg-teal-600/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <FadeUp className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Paket <span className="text-gradient">Harga Transparan</span>
          </h2>
          <p className="text-blue-200/60 max-w-xl mx-auto mb-5">
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Semua paket sudah termasuk
            domain, hosting, dan konsultasi gratis sebelum pengerjaan.
          </p>
          <Link href="/kalkulasi-harga">
            <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-blue-300 border border-blue-500/20 hover:border-blue-400/40 transition-colors cursor-pointer">
              <Calculator className="w-3.5 h-3.5" />
              Hitung estimasi harga dengan fitur tambahan →
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
                className={`relative flex flex-col rounded-2xl p-6 h-full transition-all duration-300 ${
                  plan.featured
                    ? "glass border-2 border-teal-500/60 shadow-[0_0_40px_-10px_rgba(20,184,166,0.3)] lg:scale-105 bg-linear-to-b from-[#0a1224]/90 to-[#060b14]/90"
                    : "glass border border-white/5 hover:border-blue-500/30 bg-white/[0.02]"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-linear-to-r from-teal-400 to-emerald-500 text-white text-[11px] font-extrabold tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-teal-500/30 whitespace-nowrap uppercase">
                      Paling Populer
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-5 relative">
                  {plan.featured && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
                  )}
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
                    className={`w-full h-12 font-bold text-sm rounded-xl transition-all ${
                      plan.featured
                        ? "bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white shadow-[0_0_20px_-5px_rgba(20,184,166,0.5)] hover:scale-[1.02]"
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
