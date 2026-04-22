"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Portofolio", href: "/portfolio" },
  { label: "Kontak", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-white/5 shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-6 h-6">
              <polygon points="4,6 20,6 36,6 26,34 20,20 14,34" fill="black" />
              <polygon points="14,6 20,6 26,6 20,20" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-wide">
            VICTORIA <span className="text-blue-400">TECH</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm text-blue-100/80 hover:text-white transition-colors duration-200"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/portal/login">
            <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-white/5">
              Login Klien
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
              Konsultasi Gratis
            </Button>
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-white/5">
          <ul className="flex flex-col px-6 py-4 gap-4">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-blue-100/80 hover:text-white text-sm"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-white/5 flex flex-col gap-2">
              <Link href="/portal/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-blue-200 hover:text-white hover:bg-white/5">
                  Login Klien
                </Button>
              </Link>
              <Link href="/contact" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                  Konsultasi Gratis
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
