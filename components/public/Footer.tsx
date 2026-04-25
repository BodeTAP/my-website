import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 mt-auto bg-[#050d1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="MFWEB" width={28} height={28} />
              <span className="font-bold text-white tracking-wide">MFWEB</span>
            </div>
            <p className="text-blue-100/50 text-sm max-w-xs leading-relaxed">
              Membantu bisnis lokal tampil profesional di internet dengan website yang cepat, menarik, dan mudah ditemukan.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Layanan</h4>
            <ul className="space-y-3">
              {[
                { label: "Layanan", href: "/layanan" },
                { label: "Portofolio", href: "/portfolio" },
                { label: "Tentang Kami", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Konsultasi", href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-blue-100/50 hover:text-blue-300 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Akun</h4>
            <ul className="space-y-2">
              {[
                { label: "Login Klien", href: "/portal/login" },
                { label: "Dashboard", href: "/portal/dashboard" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-blue-100/50 hover:text-blue-300 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-blue-100/30 text-xs">
            © {year} MFWEB. All rights reserved.
          </p>
          <p className="text-blue-100/30 text-xs">
            Dibuat dengan ❤️ untuk bisnis lokal Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
