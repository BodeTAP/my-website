"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Briefcase, Receipt, MessageSquare, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard",   href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Proyek Saya", href: "/portal/projects",  icon: Briefcase },
  { label: "Invoice",     href: "/portal/invoices",  icon: Receipt },
  { label: "Bantuan",     href: "/portal/tickets",   icon: MessageSquare },
];

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-7 h-7 bg-white rounded flex items-center justify-center shrink-0">
      <svg viewBox="0 0 40 40" className="w-5 h-5">
        <polygon points="4,6 20,6 36,6 26,34 20,20 14,34" fill="black" />
        <polygon points="14,6 20,6 26,6 20,20" fill="white" />
      </svg>
    </div>
    <div>
      <p className="text-white text-sm font-bold leading-none">MFWEB</p>
      <p className="text-blue-400/60 text-xs">Portal Klien</p>
    </div>
  </div>
);

export default function PortalShell({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => pathname.startsWith(href);

  const SidebarContent = () => (
    <aside className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Logo />
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="w-9 h-9 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 text-sm font-bold mb-2">
          {userName.charAt(0).toUpperCase()}
        </div>
        <p className="text-white text-sm font-medium line-clamp-1">{userName}</p>
        <p className="text-blue-200/40 text-xs line-clamp-1">{userEmail}</p>
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
        <Link href="/api/auth/signout">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200/40 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm w-full">
            <LogOut className="w-4 h-4 shrink-0" />
            Keluar
          </button>
        </Link>
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
          {/* Avatar singkat */}
          <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 text-xs font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Mobile bottom tab bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-white/5 flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs transition-colors ${
                isActive(item.href) ? "text-blue-400" : "text-blue-200/40"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="leading-none">{item.label}</span>
            </Link>
          ))}
        </nav>

        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
