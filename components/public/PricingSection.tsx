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
    <section className="relative bg-white px-4 py-24 sm:px-6 lg:px-8 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        <FadeUp className="mb-14 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Paket Website
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Investasi transparan, tanpa biaya tersembunyi.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed text-base">
            Pilih paket website sesuai skala dan tahap pertumbuhan bisnis Anda. Semua paket sudah mencakup domain .com, cloud hosting, sertifikat SSL, dan garansi revisi.
          </p>
          <Link href="/kalkulasi-harga">
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900">
              <Calculator className="w-3.5 h-3.5 text-slate-600" />
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
                className={`relative flex flex-col rounded-2xl p-7 h-full transition-all duration-300 ${
                  plan.featured
                    ? "border border-slate-700/80 bg-[#1E242E] text-white shadow-2xl lg:-translate-y-2"
                    : "border border-slate-200 bg-white text-slate-900 shadow-xs hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span className="rounded-full border border-slate-600 bg-slate-800 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-200 shadow-xs">
                      Paling Populer
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-5 relative">
                  <h3 className={`font-extrabold text-xl mb-1 ${plan.featured ? "text-white" : "text-slate-900"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs leading-snug ${plan.featured ? "text-slate-300" : "text-slate-500"}`}>
                    {plan.tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6 relative">
                  <p className={`text-[11px] mb-1 font-medium ${plan.featured ? "text-slate-400" : "text-slate-400"}`}>
                    Mulai dari
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-sm font-semibold ${plan.featured ? "text-slate-400" : "text-slate-500"}`}>
                      Rp
                    </span>
                    <span
                      className={`text-4xl font-black leading-none tracking-tight ${
                        plan.featured ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {plan.price}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8 relative">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.featured ? "text-slate-200" : "text-slate-800"
                        }`}
                      />
                      <span className={`text-xs leading-relaxed ${plan.featured ? "text-slate-200" : "text-slate-600"}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(waText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-auto relative z-20"
                >
                  <Button
                    className={`w-full h-11 font-bold text-xs rounded-full transition-all ${
                      plan.featured
                        ? "bg-white hover:bg-slate-100 text-slate-950 shadow-sm"
                        : "border border-slate-200 bg-slate-50 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-800 shadow-2xs"
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
