import type { Metadata } from "next";
import Link from "next/link";
import { Search, ArrowRight, CheckCircle2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/public/motion";
import PublicLeadFinderForm from "@/components/public/tools/PublicLeadFinderForm";

export const metadata: Metadata = {
  title: "Lead Finder Gratis - Cari Prospek Bisnis Lokal | MFWEB",
  description:
    "Coba Lead Finder gratis tanpa login. Temukan prospek bisnis lokal dari Google Maps dengan 1 pencarian per hari.",
  alternates: { canonical: "/tools/lead-finder" },
};

export default function ToolsLeadFinderPage() {
  return (
    <div className="min-h-screen overflow-x-clip">
      {/* Hero section */}
      <section className="relative px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <FadeUp>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-300">
              <Target className="h-4 w-4" />
              Coba gratis
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Temukan prospek bisnis lokal sekarang
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-blue-100/60 sm:text-lg">
              Masukkan kategori bisnis dan kota, lalu Lead Finder akan mencarikan data kontak yang relevan dari Google Maps.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs font-semibold text-blue-200/55">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Tanpa login
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                1 pencarian/hari
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Maks 5 hasil
              </span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Form section */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <FadeUp delay={0.1}>
            <PublicLeadFinderForm />
          </FadeUp>
        </div>
      </section>

      {/* CTA to full version */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <FadeUp delay={0.2}>
          <div className="mx-auto max-w-3xl rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-400/10">
              <Search className="h-6 w-6 text-blue-300" />
            </div>
            <h2 className="text-xl font-black text-white sm:text-2xl">
              Butuh lebih banyak hasil?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-blue-200/55">
              Daftar akun gratis untuk mendapatkan 15 kredit dan akses Deep Search, Social Scan, export CSV, dan pencarian tanpa batas.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/portal/register">
                <Button
                  size="lg"
                  className="h-11 w-full rounded-xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-500 sm:w-auto"
                >
                  Daftar gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/lead-finder">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 w-full rounded-xl border-white/10 bg-white/5 px-6 font-bold text-white hover:bg-white/10 sm:w-auto"
                >
                  Lihat fitur lengkap
                </Button>
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
