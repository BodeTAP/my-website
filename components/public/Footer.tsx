import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#020611] overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Desc */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Image src="/logo.png" alt="MFWEB" width={24} height={24} className="brightness-0 invert" />
              </div>
              <span className="font-bold text-xl text-white tracking-wide">MFWEB</span>
            </div>
            <p className="text-blue-100/50 text-sm max-w-sm leading-relaxed mb-8">
              Agensi pengembangan web profesional yang berdedikasi untuk membantu bisnis lokal tumbuh dan mendominasi pasar digital dengan website yang super cepat, menarik, dan SEO-friendly.
            </p>
            
            {/* Socials */}
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-blue-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-blue-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-blue-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Links - Layanan */}
          <div>
            <h4 className="text-white font-semibold mb-6">Layanan Kami</h4>
            <ul className="space-y-4">
              {[
                { label: "Company Profile", href: "/layanan/company-profile" },
                { label: "Toko Online / E-Commerce", href: "/layanan/toko-online" },
                { label: "Landing Page", href: "/layanan/landing-page" },
                { label: "Jasa SEO", href: "/layanan/seo" },
                { label: "Maintenance Web", href: "/layanan/maintenance" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-blue-100/50 hover:text-blue-300 text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-blue-500/0 group-hover:bg-blue-400 transition-all" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Perusahaan */}
          <div>
            <h4 className="text-white font-semibold mb-6">Perusahaan</h4>
            <ul className="space-y-4">
              {[
                { label: "Portofolio", href: "/portfolio" },
                { label: "Tentang Kami", href: "/about" },
                { label: "Blog & Artikel", href: "/blog" },
                { label: "Tools Gratis", href: "/tools" },
                { label: "Login Klien", href: "/portal/login" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-blue-100/50 hover:text-blue-300 text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-blue-500/0 group-hover:bg-blue-400 transition-all" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-6">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-blue-100/50 text-sm">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>Jl. Brigadir Jenderal Katamso No.14, Kp. Dalem, Kec. Kota, Kota Kediri, Jawa Timur</span>
              </li>
              <li className="flex items-center gap-3 text-blue-100/50 text-sm">
                <Phone className="w-5 h-5 text-green-400 shrink-0" />
                <span>+62 822-2168-2343</span>
              </li>
              <li className="flex items-center gap-3 text-blue-100/50 text-sm">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <span>hello@mfweb.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-blue-100/30 text-xs sm:text-sm">
            © {year} MFWEB. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/kebijakan-privasi" className="text-blue-100/30 hover:text-blue-300 text-xs sm:text-sm transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/ketentuan-layanan" className="text-blue-100/30 hover:text-blue-300 text-xs sm:text-sm transition-colors">
              Ketentuan Layanan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
