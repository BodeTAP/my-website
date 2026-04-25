import Link from "next/link";
import { ArrowLeft, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none animate-float" />

      <div className="text-center max-w-lg relative">
        {/* 404 number */}
        <div className="relative mb-6 select-none">
          <p className="text-[160px] sm:text-[200px] font-black leading-none text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)" }}>
            404
          </p>
          {/* Glitch overlay */}
          <p className="absolute inset-0 text-[160px] sm:text-[200px] font-black leading-none text-blue-500/10"
            style={{ transform: "translate(3px, -3px)" }}>
            404
          </p>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-blue-200/60 mb-10 leading-relaxed">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
          Coba kembali ke beranda atau hubungi kami jika membutuhkan bantuan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-6">
              <Home className="w-4 h-4 mr-2" />
              Ke Beranda
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-11 px-6">
              <MessageCircle className="w-4 h-4 mr-2" />
              Hubungi Kami
            </Button>
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-blue-200/30 text-sm mb-4">Mungkin Anda mencari:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Blog", href: "/blog" },
              { label: "Portofolio", href: "/portfolio" },
              { label: "Layanan", href: "/layanan" },
              { label: "Konsultasi", href: "/contact" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-blue-400/60 hover:text-blue-300 text-sm transition-colors underline underline-offset-4 decoration-blue-500/30"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
