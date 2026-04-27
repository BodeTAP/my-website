import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Globe, TrendingUp, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Breadcrumb from "@/components/public/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeUp, StaggerChildren, StaggerItem, HoverCard, ScaleIn } from "@/components/public/motion";

export const metadata: Metadata = {
  title: "Portfolio Website Profesional untuk Bisnis Lokal",
  description:
    "Lihat koleksi website profesional yang telah kami bangun untuk bisnis lokal di Indonesia. Desain modern, cepat, dan SEO-friendly.",
  alternates: { canonical: "/portfolio" },
};

export const revalidate = 60;

export default async function PortfolioPage() {
  const portfolios = await prisma.portfolio.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  }).catch(() => []);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: "Portfolio" }]} />
        {/* Header */}
        <FadeUp className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Hasil <span className="text-gradient">Karya Kami</span>
          </h1>
          <p className="text-blue-200/60 max-w-xl mx-auto">
            Website profesional yang telah membantu bisnis lokal tumbuh dan ditemukan lebih banyak pelanggan.
          </p>
        </FadeUp>

        {portfolios.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="w-16 h-16 text-blue-500/20 mx-auto mb-4" />
            <p className="text-blue-200/40 text-lg">Portofolio akan segera ditambahkan.</p>
            <Link href="/contact" className="mt-6 inline-block">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                Jadilah Klien Pertama
              </Button>
            </Link>
          </div>
        ) : (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((p) => (
              <StaggerItem key={p.slug}>
              <HoverCard className="h-full">
              <div className="glass rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors duration-300 group flex flex-col h-full">
                {/* Cover / Before-After */}
                <div className="relative h-52 bg-linear-to-br from-blue-900/40 to-indigo-900/20 overflow-hidden">
                  {p.coverImage ? (
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      width={400}
                      height={208}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Globe className="w-16 h-16 text-blue-500/20" />
                    </div>
                  )}

                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 glass rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                    </a>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-white font-bold text-lg mb-1 group-hover:text-blue-300 transition-colors">
                    {p.title}
                  </h2>

                  {p.clientName && (
                    <p className="text-blue-400/60 text-xs mb-3">{p.clientName}</p>
                  )}

                  {p.description && (
                    <p className="text-blue-200/50 text-sm line-clamp-3 mb-4 flex-1">{p.description}</p>
                  )}

                  {/* Tech stack */}
                  {p.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.techStack.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-blue-300 border-blue-500/20 bg-blue-500/5 text-xs"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Metrics */}
                  {p.metrics && (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-500/10 rounded-lg px-3 py-2">
                      <TrendingUp className="w-4 h-4 shrink-0" />
                      <span>{p.metrics}</span>
                    </div>
                  )}
                </div>
              </div>
              </HoverCard>
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}

        {/* CTA */}
        <ScaleIn className="mt-16 text-center">
          <div className="glass rounded-2xl p-10 max-w-2xl mx-auto">
            <h2 className="text-white font-bold text-2xl mb-3">
              Bisnis Anda Bisa Jadi Yang Berikutnya
            </h2>
            <p className="text-blue-200/60 mb-6">
              Hubungi kami untuk konsultasi gratis dan dapatkan estimasi pengerjaan.
            </p>
            <Link href="/contact">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white px-10">
                Mulai Sekarang
              </Button>
            </Link>
          </div>
        </ScaleIn>
      </div>
    </div>
  );
}
