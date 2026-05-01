"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FileText, Users, Briefcase,
  Receipt, MessageSquare, LogOut, Menu, X, Globe, Star, Settings, Tag, Wrench, ClipboardList, ScrollText, UserCheck, ChevronRight, Server
} from "lucide-react";

const menuGroups = [
  {
    title: "Utama",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ]
  },
  {
    title: "Penjualan & Klien",
    items: [
      { label: "Inbox Leads", href: "/admin/leads", icon: Users },
      { label: "Klien & Kontak", href: "/admin/clients", icon: UserCheck },
      { label: "Proposal", href: "/admin/proposals", icon: ScrollText },
      { label: "Onboarding", href: "/admin/onboarding", icon: ClipboardList },
    ]
  },
  {
    title: "Proyek & Layanan",
    items: [
      { label: "Manajemen Proyek", href: "/admin/projects",  icon: Briefcase },
      { label: "Invoice & Tagihan", href: "/admin/invoices",  icon: Receipt },
      { label: "Tiket Dukungan",   href: "/admin/tickets",   icon: MessageSquare },
      { label: "Maintenance",      href: "/admin/maintenance", icon: Wrench },
      { label: "Hosting & Domain", href: "/admin/hosting",   icon: Server },
    ]
  },
  {
    title: "Konten Publik",
    items: [
      { label: "Artikel Blog", href: "/admin/articles", icon: FileText },
      { label: "Kategori Artikel", href: "/admin/categories", icon: Tag },
      { label: "Portofolio", href: "/admin/portfolio", icon: Globe },
      { label: "Testimoni", href: "/admin/testimonials", icon: Star },
    ]
  },
  {
    title: "Sistem",
    items: [
      { label: "Pengaturan", href: "/admin/settings", icon: Settings },
    ]
  }
];

const Logo = () => (
  <Link href="/admin" className="flex items-center gap-3 px-2 group">
    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 overflow-hidden shadow-[0_0_15px_rgba(37,99,235,0.2)] group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
      <Image src="/logo.png" alt="MFWEB" width={24} height={24} className="shrink-0 relative z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />
    </div>
    <div>
      <p className="text-white text-base font-black tracking-wide bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">MFWEB</p>
      <p className="text-blue-400/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">Admin Portal</p>
    </div>
  </Link>
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
    <aside className="flex flex-col h-full bg-[#030914]/80 backdrop-blur-xl relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />

      {/* Logo */}
      <div className="p-6 border-b border-white/5 relative z-10">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-5 py-6 space-y-8 overflow-y-auto custom-scrollbar relative z-10">
        {menuGroups.map((group, i) => (
          <div key={i} className="space-y-2">
            <h4 className="px-3 text-[10px] font-black uppercase tracking-widest text-blue-200/40 mb-3">{group.title}</h4>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                      active
                        ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                        : "text-blue-200/60 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-blue-400" : "text-blue-200/40 group-hover:text-blue-300"}`} />
                      {item.label}
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-blue-500 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="p-5 border-t border-white/5 relative z-10 bg-black/20">
        <div className="flex items-center justify-between px-1 py-1 mb-4">
          <div className="flex items-center gap-3 w-full">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10 shadow-lg shrink-0">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-bold truncate">Admin Utama</p>
              <p className="text-blue-200/40 text-[10px] truncate mt-0.5">Administrator</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-red-400/80 hover:text-white bg-red-500/10 hover:bg-red-500/80 border border-red-500/20 transition-all text-sm font-bold w-full group shadow-[0_0_10px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
          Keluar Sesi
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-[#030914]">
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <div className="hidden lg:flex w-72 shrink-0 border-r border-white/5 flex-col z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <SidebarContent />
      </div>

      {/* ── Mobile drawer backdrop ───────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 shadow-[10px_0_40px_rgba(0,0,0,0.8)] border-r border-white/10 lg:hidden transition-transform duration-300 ease-[0.22,1,0.36,1] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-5 right-5 z-50">
          <button
            onClick={() => setOpen(false)}
            className="p-2.5 rounded-xl text-blue-200/50 hover:text-white bg-black/40 hover:bg-white/10 border border-white/5 transition-all backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-[#030914]/90 backdrop-blur-lg border-b border-white/5 sticky top-0 z-30 shadow-lg">
          <button
            onClick={() => setOpen(true)}
            className="p-2.5 rounded-xl text-blue-200/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MFWEB" width={24} height={24} />
              <span className="text-white font-black tracking-wide">MFWEB</span>
            </Link>
          </div>
          <div className="w-10" /> {/* spacer */}
        </header>

        <main className="flex-1 overflow-auto relative">
          <div className="p-5 sm:p-8 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
