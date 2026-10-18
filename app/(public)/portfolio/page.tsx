import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Globe, TrendingUp, ExternalLink, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, buildPublicBreadcrumbJsonLd } from "@/components/public/JsonLd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

export const metadata: Metadata = {
  title: "Portfolio Website Profesional untuk Bisnis Lokal",
  description:
    "Lihat koleksi website profesional yang telah kami bangun untuk bisnis lokal di Indonesia. Desain modern, cepat, dan SEO-friendly.",
  alternates: { canonical: "/portfolio" },
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const portfolios = await prisma.portfolio
    .findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    })
    .catch(() => []);

  const breadcrumbJsonLd = buildPublicBreadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd id="json-ld-breadcrumb-portfolio" data={breadcrumbJsonLd} />

      {/* ── Full-Width Deep Slate Hero ────────────────────── */}
      <section className="w-full bg-[#1E242E] text-white pt-28 pb-16 sm:pt-32 sm:pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Portfolio" }]} />

          <div className="max-w-3xl mt-6">
            <FadeUp>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-8 bg-slate-500" />
                <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                  Hasil Kerja & Dokumentasi Proyek
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Beberapa website yang sudah kami kerjakan
              </h1>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                Contoh implementasi nyata untuk bisnis lokal, dari profil perusahaan yang kredibel sampai halaman promosi yang terbukti mempermudah konversi pelanggan.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Portfolio Grid Section ────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {portfolios.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white">
              <Globe className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Portofolio Segera Ditambahkan</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Kami sedang mendokumentasikan studi kasus proyek terbaru kami. Hubungi kami untuk melihat sampel privat.
              </p>
              <Link href="/contact">
                <Button className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium px-6">
                  Diskusikan Proyek Anda
                </Button>
              </Link>
            </div>
          ) : (
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {portfolios.map((p) => (
                <StaggerItem key={p.slug}>
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
                    {/* Cover Image Container */}
                    <div className="relative h-56 bg-slate-100 overflow-hidden border-b border-slate-100">
                      {p.coverImage ? (
                        <Image
                          src={p.coverImage}
                          alt={p.title}
                          width={600}
                          height={336}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Globe className="w-10 h-10" />
                        </div>
                      )}

                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Buka website ${p.title}`}
                          className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-xs p-2 text-slate-700 hover:text-slate-900 shadow-xs hover:bg-white transition-all z-10"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {p.clientName && (
                          <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                            {p.clientName}
                          </span>
                        )}
                      </div>

                      <h2 className="text-slate-900 font-bold text-lg mb-2 group-hover:text-slate-700 transition-colors">
                        {p.title}
                      </h2>

                      {p.description && (
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-5 flex-1">
                          {p.description}
                        </p>
                      )}

                      {/* Tech stack */}
                      {p.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4 pt-2 border-t border-slate-100">
                          {p.techStack.map((t) => (
                            <Badge
                              key={t}
                              variant="outline"
                              className="text-slate-600 border-slate-200 bg-slate-50 text-[11px] font-mono px-2 py-0.5 rounded-md"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Metrics badge */}
                      {p.metrics && (
                        <div className="flex items-center gap-2 text-slate-800 text-xs font-medium bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 mt-auto">
                          <TrendingUp className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                          <span>{p.metrics}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}

          {/* ── Bottom CTA ─────────────────────────────────── */}
          <div className="mt-16 sm:mt-20">
            <FadeUp>
              <div className="rounded-3xl border border-slate-800 bg-[#1E242E] text-white p-8 sm:p-12 text-center max-w-3xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Ingin website bisnis Anda tampil profesional seperti ini?
                </h2>
                <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
                  Ceritakan model bisnis Anda dan referensi yang Anda sukai. Kami akan membantu menyusun estimasi pengerjaan dan roadmap teknisnya.
                </p>
                <Link href="/contact">
                  <Button className="h-12 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 transition-colors">
                    Konsultasi Gratis Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </div>
  );
}
