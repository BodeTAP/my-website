import Link from "next/link";
import { BrandLogoIcon } from "@/components/brand/BrandLogo";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/siteSettings";

const serviceLinks = [
  { label: "Jasa Landing Page", href: "/layanan/landing-page" },
  { label: "Jasa Company Profile", href: "/layanan/company-profile" },
  { label: "Toko Online / E-Commerce", href: "/layanan/toko-online" },
  { label: "Jasa Optimasi SEO", href: "/layanan/optimasi-seo" },
  { label: "Aplikasi Web Bisnis", href: "/layanan/aplikasi-web" },
];

const toolLinks = [
  { label: "Lead Finder", href: "/lead-finder" },
  { label: "Proposal Generator", href: "/tools/proposal-generator" },
  { label: "Invoice Generator", href: "/tools/invoice-generator" },
  { label: "Cek SEO Score", href: "/tools/cek-seo" },
  { label: "Estimasi Harga Website", href: "/tools/estimasi-harga" },
];

const companyLinks = [
  { label: "Portofolio", href: "/portfolio" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Blog & Artikel", href: "/blog" },
  { label: "Kalkulasi Harga", href: "/kalkulasi-harga" },
  { label: "Login Klien", href: "/portal/login" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="text-slate-400 hover:text-white text-xs sm:text-sm transition-colors flex items-center gap-2 group"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-slate-300 transition-colors" />
        {label}
      </Link>
    </li>
  );
}

export default async function Footer() {
  const year = new Date().getFullYear();
  const settings = await getSiteSettings();
  const whatsappNumber = settings.brand_public_whatsapp.replace(/\D/g, "");
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Halo%20MFWEB%2C%20saya%20ingin%20konsultasi%20website`
    : "/contact";

  return (
    <footer className="relative bg-[#181C24] text-slate-300 border-t border-slate-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-xs">
                <BrandLogoIcon size={22} variant="dark" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                MF<span className="text-slate-400">WEB</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed mb-7">
              {settings.seo_default_description}
            </p>

            <div className="mb-7 max-w-sm rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5">
              <p className="text-sm font-bold text-white">
                Mulai Diskusi Proyek Digital
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Konsultasikan kebutuhan digital Anda, dari website sampai pipeline tools bisnis.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-slate-200"
                >
                  Konsultasi Gratis
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Katalog Tools
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {settings.social_instagram_url ? (
                <a
                  href={settings.social_instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              ) : null}
              {settings.social_facebook_url ? (
                <a
                  href={settings.social_facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              ) : null}
              {settings.social_linkedin_url ? (
                <a
                  href={settings.social_linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-5">Layanan Website</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-5">Tools Bisnis</h4>
            <ul className="space-y-3">
              {toolLinks.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-5">Perusahaan</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-5">Hubungi Kami</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-slate-400 text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{settings.brand_business_address}</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400 text-xs sm:text-sm">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={whatsappHref}
                  className="transition-colors hover:text-white"
                >
                  +{settings.brand_public_whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400 text-xs sm:text-sm">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${settings.brand_contact_email}`}
                  className="transition-colors hover:text-white"
                >
                  {settings.brand_contact_email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>
            &copy; {year} {settings.brand_footer_text}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              href="/kebijakan-privasi"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/ketentuan-layanan"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Ketentuan Layanan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
