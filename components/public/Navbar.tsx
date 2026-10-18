"use client";

import Link from "next/link";
import { BrandLogoIcon } from "@/components/brand/BrandLogo";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ChevronDown,
  FileText,
  Gauge,
  Globe,
  LayoutDashboard,
  Menu,
  QrCode,
  ReceiptText,
  Search,
  ShoppingCart,
  Sparkles,
  Tags,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type MenuItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
};

type MegaMenu = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  columns: {
    title: string;
    items: MenuItem[];
  }[];
};

type MegaMenuKey = "layanan" | "tools";

const megaMenus: Record<MegaMenuKey, MegaMenu> = {
  layanan: {
    eyebrow: "Layanan digital",
    title: "Bangun aset digital yang siap jualan",
    description:
      "Pilih layanan sesuai tahap bisnis: mulai dari landing page, company profile, toko online, SEO, hingga aplikasi web custom.",
    href: "/layanan",
    cta: "Lihat semua layanan",
    columns: [
      {
        title: "Website",
        items: [
          {
            label: "Landing Page",
            href: "/layanan/landing-page",
            description: "Halaman promosi cepat untuk iklan, campaign, dan validasi produk.",
            icon: Globe,
            badge: "Mulai 800K",
          },
          {
            label: "Company Profile",
            href: "/layanan/company-profile",
            description: "Website kredibel untuk profil bisnis, layanan, portofolio, dan kontak.",
            icon: Building2,
          },
          {
            label: "Toko Online",
            href: "/layanan/toko-online",
            description: "Katalog produk, checkout, pembayaran, dan dashboard pesanan.",
            icon: ShoppingCart,
          },
        ],
      },
      {
        title: "Growth",
        items: [
          {
            label: "Optimasi SEO",
            href: "/layanan/optimasi-seo",
            description: "Audit, keyword lokal, konten, dan perbaikan teknis untuk Google.",
            icon: Search,
            badge: "Populer",
          },
          {
            label: "Aplikasi Web Bisnis",
            href: "/layanan/aplikasi-web",
            description: "Sistem operasional custom dengan login, database, dan dashboard.",
            icon: LayoutDashboard,
          },
          {
            label: "Kalkulasi Harga",
            href: "/kalkulasi-harga",
            description: "Estimasi kebutuhan dan budget sebelum mulai diskusi proyek.",
            icon: BarChart3,
          },
        ],
      },
    ],
  },
  tools: {
    eyebrow: "Tools bisnis",
    title: "Alat bantu untuk cari prospek dan closing",
    description:
      "Gunakan tools gratis untuk audit awal, lalu naikkan produktivitas dengan tools premium di portal klien.",
    href: "/tools",
    cta: "Buka katalog tools",
    columns: [
      {
        title: "Premium",
        items: [
          {
            label: "Lead Finder",
            href: "/lead-finder",
            description: "Cari prospek bisnis lokal dari Google Maps. Coba 1x gratis tanpa login.",
            icon: Search,
            badge: "Populer",
          },
          {
            label: "Proposal Generator",
            href: "/tools/proposal-generator",
            description: "Buat proposal PDF profesional dari template. Coba 1x gratis tanpa login.",
            icon: FileText,
          },
          {
            label: "Invoice Generator",
            href: "/tools/invoice-generator",
            description: "Buat invoice PDF dengan PPN 11% dan template. Coba 1x gratis tanpa login.",
            icon: ReceiptText,
          },
        ],
      },
      {
        title: "Gratis",
        items: [
          {
            label: "Cek Kecepatan",
            href: "/tools/cek-kecepatan",
            description: "Audit performa website dan temukan hambatan loading.",
            icon: Gauge,
          },
          {
            label: "Cek SEO Score",
            href: "/tools/cek-seo",
            description: "Analisis faktor SEO on-page penting secara instan.",
            icon: BarChart3,
          },
          {
            label: "Generator Nama",
            href: "/tools/generator-nama",
            description: "Cari ide nama bisnis, slogan, dan positioning singkat.",
            icon: Sparkles,
          },
          {
            label: "QR Code",
            href: "/tools/qr-code",
            description: "Buat QR untuk link, WhatsApp, teks, atau kontak.",
            icon: QrCode,
          },
          {
            label: "Cek Meta Tags",
            href: "/tools/cek-meta-tags",
            description: "Preview tampilan website di Google dan media sosial.",
            icon: Tags,
          },
        ],
      },
    ],
  },
};

const navLinks: Array<
  | { type: "link"; label: string; href: string }
  | { type: "mega"; label: string; key: MegaMenuKey }
> = [
  { type: "link", label: "Beranda", href: "/" },
  { type: "mega", label: "Layanan", key: "layanan" },
  { type: "mega", label: "Tools", key: "tools" },
  { type: "link", label: "Portofolio", href: "/portfolio" },
  { type: "link", label: "Blog", href: "/blog" },
  { type: "link", label: "Kontak", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState<MegaMenuKey | null>(null);
  const [mobileSection, setMobileSection] = useState<MegaMenuKey | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMega(null);
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const closeMobileMenu = () => {
    setOpen(false);
    setMobileSection(null);
  };

  const renderMegaPanel = (menu: MegaMenu) => (
    <div className="grid grid-cols-[minmax(220px,0.75fr)_minmax(0,1.5fr)] gap-6">
      <div className="rounded-xl border border-slate-200/90 bg-slate-50 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          {menu.eyebrow}
        </p>
        <p className="mt-3 text-lg font-black leading-tight text-slate-900">
          {menu.title}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          {menu.description}
        </p>
        <Link
          href={menu.href}
          className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-900 transition-colors hover:text-slate-700"
          onClick={() => setActiveMega(null)}
        >
          {menu.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {menu.columns.map((column) => (
          <div key={column.title}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {column.title}
            </p>
            <div className="space-y-1.5">
              {column.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setActiveMega(null)}
                    className="group flex gap-3 rounded-xl border border-transparent p-2.5 transition-colors hover:border-slate-200/80 hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs transition-colors group-hover:border-slate-300 group-hover:bg-slate-100 group-hover:text-slate-950">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {item.label}
                        </span>
                        {item.badge ? (
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-700">
                            {item.badge}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const isDark = !scrolled && !open;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        open
          ? "bg-white/98 border-b border-slate-200 shadow-md backdrop-blur-xl"
          : scrolled
            ? "bg-white/95 border-b border-slate-200/80 shadow-xs backdrop-blur-md"
            : "bg-[#1E242E]/80 border-b border-slate-800 backdrop-blur-md"
      }`}
    >
      <nav
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        onMouseLeave={() => setActiveMega(null)}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandLogoIcon size={32} variant={isDark ? "dark" : "light"} />
          <span className={`font-black text-lg tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            MF<span className={isDark ? "text-slate-400" : "text-slate-500"}>WEB</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1.5">
          {navLinks.map((l) => (
            <li key={l.label}>
              {l.type === "mega" ? (
                <button
                  type="button"
                  className={`group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    activeMega === l.key
                      ? isDark
                        ? "bg-slate-800 text-white font-semibold"
                        : "bg-slate-100 text-slate-950 font-semibold"
                      : isDark
                        ? "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-950"
                  }`}
                  aria-expanded={activeMega === l.key}
                  onMouseEnter={() => setActiveMega(l.key)}
                  onFocus={() => setActiveMega(l.key)}
                  onClick={() => setActiveMega(activeMega === l.key ? null : l.key)}
                >
                  {l.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      isDark ? "text-slate-400" : "text-slate-400"
                    } ${
                      activeMega === l.key ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={l.href}
                  className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    isDark
                      ? "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-950"
                  }`}
                  onFocus={() => setActiveMega(null)}
                >
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <AnimatePresence>
          {activeMega ? (
            <motion.div
              key={activeMega}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute left-4 right-4 top-[calc(100%+0.75rem)] hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl md:block lg:left-8 lg:right-8"
              onMouseEnter={() => setActiveMega(activeMega)}
            >
              {renderMegaPanel(megaMenus[activeMega])}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/portal/login">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full font-medium text-sm ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Login Klien
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="sm"
              className={`rounded-full font-semibold text-sm px-5 shadow-xs ${
                isDark
                  ? "bg-white hover:bg-slate-100 text-slate-950 font-bold"
                  : "bg-slate-900 hover:bg-slate-800 text-white font-medium"
              }`}
            >
              Konsultasi Gratis
            </Button>
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className={`md:hidden p-1 rounded-lg transition-colors ${
            isDark ? "text-white hover:bg-slate-800" : "text-slate-900 hover:bg-slate-100"
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-slate-200 bg-white/98 shadow-xl backdrop-blur-xl"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                >
                  {l.type === "mega" ? (
                    <div>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
                        aria-expanded={mobileSection === l.key}
                        onClick={() =>
                          setMobileSection(mobileSection === l.key ? null : l.key)
                        }
                      >
                        {l.label}
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 transition-transform ${
                            mobileSection === l.key ? "rotate-180 text-slate-800" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileSection === l.key ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-inner">
                              {megaMenus[l.key].columns.map((column) => (
                                <div key={column.title}>
                                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    {column.title}
                                  </p>
                                  <div className="space-y-1">
                                    {column.items.map((item) => {
                                      const Icon = item.icon;

                                      return (
                                        <Link
                                          key={item.href}
                                          href={item.href}
                                          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-200/60 hover:text-slate-950 transition-colors"
                                          onClick={closeMobileMenu}
                                        >
                                          <Icon className="h-4 w-4 text-slate-600" />
                                          <span className="font-medium">{item.label}</span>
                                          {item.badge ? (
                                            <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                              {item.badge}
                                            </span>
                                          ) : null}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                              <Link
                                href={megaMenus[l.key].href}
                                className="inline-flex items-center gap-2 px-2 pt-1 text-sm font-bold text-slate-900 hover:text-slate-700"
                                onClick={closeMobileMenu}
                              >
                                {megaMenus[l.key].cta}
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-slate-700 hover:text-slate-950 text-sm font-medium"
                      onClick={closeMobileMenu}
                    >
                      {l.label}
                    </Link>
                  )}
                </motion.li>
              ))}
              <li className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link href="/portal/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" size="sm" className="w-full text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-full">
                    Login Klien
                  </Button>
                </Link>
                <Link href="/contact" onClick={closeMobileMenu}>
                  <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full">
                    Konsultasi Gratis
                  </Button>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
