"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Briefcase, Receipt, MessageSquare, LogOut, Menu, X, UserCircle, ChevronRight, Server } from "lucide-react";
import NotificationBell from "@/components/portal/NotificationBell";

const navItems = [
  { label: "Dashboard",   href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Proyek Saya", href: "/portal/projects",  icon: Briefcase },
  { label: "Tagihan",     href: "/portal/invoices",  icon: Receipt },
  { label: "Hosting",     href: "/portal/hosting",   icon: Server },
  { label: "Bantuan",     href: "/portal/tickets",   icon: MessageSquare },
  { label: "Pengaturan",  href: "/portal/profile",   icon: UserCircle },
];

const Logo = () => (
  <Link href="/portal/dashboard" className="flex items-center gap-3 px-2 group">
    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 overflow-hidden shadow-[0_0_15px_rgba(37,99,235,0.2)] group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
      <Image src="/logo.png" alt="MFWEB" width={24} height={24} className="shrink-0 relative z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />
    </div>
    <div>
      <p className="text-white text-base font-black tracking-wide bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">MFWEB</p>
      <p className="text-blue-400/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">Portal Klien</p>
    </div>
  </Link>
);

function UserAvatar({ src, name, sizeClasses, imageClasses, fallbackClasses }: { src?: string | null, name: string, sizeClasses: string, imageClasses?: string, fallbackClasses?: string }) {
  const [error, setError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  if (!src || error) {
    return (
      <div className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-indigo-500 to-blue-600 ${fallbackClasses || ""}`}>
        {initial}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={100}
      height={100}
      className={`${sizeClasses} rounded-full object-cover ${imageClasses || ""}`}
      onError={() => setError(true)}
    />
  );
}

export default function PortalShell({
  children,
  userName,
  userEmail,
  userImage,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userImage?: string | null;
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
    <aside className="flex flex-col h-full bg-[#030914]/80 backdrop-blur-xl relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />

      {/* Logo */}
      <div className="p-6 border-b border-white/5 relative z-10">
        <Logo />
      </div>

      {/* User info + Bell */}
      <div className="px-5 py-5 border-b border-white/5 relative z-10 bg-black/20">
        <div className="flex items-center justify-between mb-3">
          <Link href="/portal/profile" className="relative">
            <UserAvatar 
              src={userImage} 
              name={userName} 
              sizeClasses="w-10 h-10" 
              imageClasses="ring-2 ring-blue-500/30 hover:ring-blue-400/60 transition-all shadow-lg"
              fallbackClasses="text-sm ring-2 ring-white/10 shadow-lg"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#030914]"></div>
          </Link>
          <NotificationBell />
        </div>
        <div>
          <p className="text-white text-sm font-bold line-clamp-1">{userName}</p>
          <p className="text-blue-200/40 text-[10px] line-clamp-1 mt-0.5">{userEmail}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-5 py-6 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10">
        <h4 className="px-3 text-[10px] font-black uppercase tracking-widest text-blue-200/40 mb-3">Menu Utama</h4>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all text-sm font-medium group ${
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
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-white/5 relative z-10 bg-black/20">
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
            <Link href="/portal/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MFWEB" width={24} height={24} />
              <span className="text-white font-black tracking-wide">Portal</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/portal/profile">
              <UserAvatar 
                src={userImage} 
                name={userName} 
                sizeClasses="w-8 h-8" 
                imageClasses="ring-2 ring-blue-500/20"
                fallbackClasses="text-xs ring-1 ring-white/10"
              />
            </Link>
          </div>
        </header>

        {/* Mobile bottom tab bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#030914]/90 backdrop-blur-xl border-t border-white/10 flex pb-safe">
          {navItems.filter(item => !['Hosting', 'Pengaturan'].includes(item.label)).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1.5 text-[10px] transition-all relative ${
                  active ? "text-blue-400 font-bold" : "text-blue-200/50 font-medium hover:text-blue-200/80"
                }`}
              >
                {active && (
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />
                )}
                <item.icon className={`w-5 h-5 ${active ? "animate-pulse-slow" : ""}`} />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-auto pb-24 lg:pb-0 relative">
          <div className="p-5 sm:p-8 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
