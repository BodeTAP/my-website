"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, Users, Briefcase,
  Receipt, MessageSquare, LogOut, Menu, X, Globe, ShieldCheck, Star, Settings, Tag,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",   href: "/admin",                  icon: LayoutDashboard },
  { label: "Artikel",     href: "/admin/articles",         icon: FileText },
  { label: "Kategori",    href: "/admin/categories",       icon: Tag },
  { label: "Portofolio",  href: "/admin/portfolio",        icon: Globe },
  { label: "Testimoni",   href: "/admin/testimonials",     icon: Star },
  { label: "Leads",       href: "/admin/leads",            icon: Users },
  { label: "Proyek",      href: "/admin/projects",         icon: Briefcase },
  { label: "Invoice",     href: "/admin/invoices",         icon: Receipt },
  { label: "Tiket",       href: "/admin/tickets",          icon: MessageSquare },
  { label: "Tim Admin",   href: "/admin/team",             icon: ShieldCheck },
  { label: "Pengaturan",  href: "/admin/settings",         icon: Settings },
];

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <Image src="/logo.png" alt="MFWEB" width={28} height={28} className="shrink-0" />
    <div>
      <p className="text-white text-sm font-bold leading-none">MFWEB</p>
      <p className="text-blue-400/60 text-xs">Admin</p>
    </div>
  </div>
);

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const SidebarContent = () => (
    <aside className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm group ${
              isActive(item.href)
                ? "bg-blue-600/20 text-white border border-blue-500/20"
                : "text-blue-200/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive(item.href) ? "text-blue-400" : "group-hover:text-blue-400"}`} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200/40 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex">
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <div className="hidden lg:flex w-60 shrink-0 glass border-r border-white/5 flex-col">
        <SidebarContent />
      </div>

      {/* ── Mobile drawer backdrop ───────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 glass border-r border-white/5 lg:hidden transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-blue-200/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 glass border-b border-white/5 sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-blue-200/50 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo />
          <div className="w-9" /> {/* spacer */}
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
