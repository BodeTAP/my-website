"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { LayoutDashboard, Briefcase, Receipt, MessageSquare, LogOut, Menu, X, UserCircle, ChevronRight, Server, PanelLeftClose, PanelLeftOpen, Wrench, Coins } from "lucide-react";
import NotificationBell from "@/components/portal/NotificationBell";

const SIDEBAR_STORAGE_KEY = "portal-sidebar-collapsed";
const SIDEBAR_STORAGE_EVENT = "portal-sidebar-collapsed-change";
const SIDEBAR_SPRING: Transition = { type: "spring", stiffness: 360, damping: 38, mass: 0.9 };
const SIDEBAR_FADE: Transition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] };

const navItems = [
  { label: "Dashboard",   href: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Proyek Saya", href: "/portal/projects",  icon: Briefcase },
  { label: "Tagihan",     href: "/portal/invoices",  icon: Receipt },
  { label: "Hosting",     href: "/portal/hosting",   icon: Server },
  { label: "Bantuan",     href: "/portal/tickets",   icon: MessageSquare },
  { label: "Tools",       href: "/portal/tools",     icon: Wrench },
  { label: "Kredit",      href: "/portal/credits",   icon: Coins },
  { label: "Pengaturan",  href: "/portal/profile",   icon: UserCircle },
];

function getSidebarCollapsedSnapshot() {
  if (typeof window === "undefined") return "false";
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) ?? "false";
}

function getSidebarCollapsedServerSnapshot() {
  return "false";
}

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);
  };
}

const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <motion.div layout transition={SIDEBAR_SPRING}>
    <Link
      href="/portal/dashboard"
      className={`flex items-center group ${collapsed ? "justify-center gap-0 px-0" : "gap-3 px-2"}`}
      aria-label="MFWEB Portal Klien"
    >
    <motion.div
      layout
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 overflow-hidden shadow-[0_0_15px_rgba(37,99,235,0.2)] group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-shadow"
      animate={{ rotate: collapsed ? -8 : 0, scale: collapsed ? 0.96 : 1 }}
      transition={SIDEBAR_SPRING}
    >
      <Image src="/logo.png" alt="MFWEB" width={24} height={24} className="shrink-0 relative z-10" style={{ width: 24, height: 24 }} />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />
    </motion.div>
    <motion.div
      aria-hidden={collapsed}
      className="overflow-hidden whitespace-nowrap"
      animate={{
        opacity: collapsed ? 0 : 1,
        width: collapsed ? 0 : 96,
        x: collapsed ? -8 : 0,
        filter: collapsed ? "blur(3px)" : "blur(0px)",
      }}
      transition={SIDEBAR_FADE}
    >
      <p className="text-white text-base font-black tracking-wide bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">MFWEB</p>
      <p className="text-blue-400/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">Portal Klien</p>
    </motion.div>
    </Link>
  </motion.div>
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

interface SidebarContentProps {
  collapsed?: boolean;
  isActive: (href: string) => boolean;
  onToggleCollapse: () => void;
  showCollapseToggle?: boolean;
  userEmail: string;
  userImage?: string | null;
  userName: string;
}

function SidebarContent({
  collapsed = false,
  isActive,
  onToggleCollapse,
  showCollapseToggle = false,
  userEmail,
  userImage,
  userName,
}: SidebarContentProps) {
  return (
    <aside className="flex flex-col h-full bg-[#030914]/80 backdrop-blur-xl relative overflow-hidden">
      {/* Glow Effects */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none"
        animate={{ x: collapsed ? -40 : 0, opacity: collapsed ? 0.35 : 1 }}
        transition={SIDEBAR_SPRING}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none"
        animate={{ x: collapsed ? 48 : 0, opacity: collapsed ? 0.35 : 1 }}
        transition={SIDEBAR_SPRING}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={collapsed ? "portal-sidebar-contract" : "portal-sidebar-expand"}
          className="absolute inset-y-0 -left-16 w-28 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent pointer-events-none"
          initial={{ x: collapsed ? 230 : 40, opacity: 0 }}
          animate={{ x: collapsed ? -40 : 290, opacity: [0, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>

      {/* Logo */}
      <motion.div
        layout
        className={`border-b border-white/5 relative z-10 ${collapsed ? "p-4" : "p-6"}`}
        transition={SIDEBAR_SPRING}
      >
        <motion.div
          layout
          className={`flex items-center ${collapsed ? "flex-col gap-3" : "justify-between gap-3"}`}
          transition={SIDEBAR_SPRING}
        >
          <Logo collapsed={collapsed} />
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`${showCollapseToggle ? "hidden lg:flex" : "hidden"} w-9 h-9 items-center justify-center rounded-xl text-blue-200/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all hover:shadow-[0_0_18px_rgba(37,99,235,0.22)]`}
            aria-label={collapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
            title={collapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={collapsed ? "open-portal-sidebar" : "close-portal-sidebar"}
                initial={{ opacity: 0, rotate: collapsed ? -35 : 35, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: collapsed ? 35 : -35, scale: 0.7 }}
                transition={SIDEBAR_FADE}
              >
                {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </motion.div>
      </motion.div>

      {/* User info + Bell */}
      <motion.div
        layout
        className={`border-b border-white/5 relative z-10 bg-black/20 ${collapsed ? "px-3 py-5" : "px-5 py-5"}`}
        transition={SIDEBAR_SPRING}
      >
        <motion.div
          layout
          className={`flex items-center ${collapsed ? "flex-col gap-3" : "justify-between mb-3"}`}
          transition={SIDEBAR_SPRING}
        >
          <Link href="/portal/profile" className={`relative ${collapsed ? "w-12 flex justify-center" : ""}`} aria-label="Profil klien">
            <UserAvatar 
              src={userImage} 
              name={userName} 
              sizeClasses="w-10 h-10" 
              imageClasses="ring-2 ring-blue-500/30 hover:ring-blue-400/60 transition-all shadow-lg"
              fallbackClasses="text-sm ring-2 ring-white/10 shadow-lg"
            />
            <div className="absolute bottom-0 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#030914]"></div>
          </Link>
          <div className={collapsed ? "w-12 flex justify-center" : ""}>
            <NotificationBell />
          </div>
        </motion.div>
        <motion.div
          aria-hidden={collapsed}
          className="overflow-hidden whitespace-nowrap"
          animate={{
            opacity: collapsed ? 0 : 1,
            height: collapsed ? 0 : "auto",
            x: collapsed ? -8 : 0,
            filter: collapsed ? "blur(3px)" : "blur(0px)",
          }}
          transition={SIDEBAR_FADE}
        >
          <p className="text-white text-sm font-bold line-clamp-1">{userName}</p>
          <p className="text-blue-200/40 text-[10px] line-clamp-1 mt-0.5">{userEmail}</p>
        </motion.div>
      </motion.div>

      {/* Nav */}
      <motion.nav
        layout
        className={`flex-1 py-6 overflow-y-auto custom-scrollbar relative z-10 ${collapsed ? "px-3 space-y-1.5" : "px-5 space-y-1.5"}`}
        transition={SIDEBAR_SPRING}
      >
        <motion.h4
          aria-hidden={collapsed}
          className="px-3 text-[10px] font-black uppercase tracking-widest text-blue-200/40 overflow-hidden whitespace-nowrap"
          animate={{
            opacity: collapsed ? 0 : 1,
            height: collapsed ? 0 : "auto",
            marginBottom: collapsed ? 0 : 12,
            x: collapsed ? -10 : 0,
          }}
          transition={SIDEBAR_FADE}
        >
          Menu Utama
        </motion.h4>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center rounded-xl transition-colors text-sm font-medium group overflow-hidden ${
                collapsed ? "justify-center w-12 h-12 mx-auto px-0 py-0" : "justify-between px-3 py-3"
              } ${
                active
                  ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                  : "text-blue-200/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="portal-sidebar-active-orb"
                  className={`absolute ${collapsed ? "inset-1.5 rounded-lg" : "inset-y-1 left-1 w-1 rounded-full"} bg-blue-400/25`}
                  transition={SIDEBAR_SPRING}
                />
              )}
              <div className={`relative z-10 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                <motion.span
                  layout
                  animate={{ scale: active ? 1.08 : 1, y: active && collapsed ? -1 : 0 }}
                  transition={SIDEBAR_SPRING}
                >
                  <item.icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-blue-400" : "text-blue-200/40 group-hover:text-blue-300"}`} />
                </motion.span>
                <motion.span
                  aria-hidden={collapsed}
                  className="overflow-hidden whitespace-nowrap"
                  animate={{
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : "auto",
                    x: collapsed ? -8 : 0,
                    filter: collapsed ? "blur(3px)" : "blur(0px)",
                  }}
                  transition={SIDEBAR_FADE}
                >
                  {item.label}
                </motion.span>
              </div>
              <AnimatePresence initial={false}>
                {active && !collapsed && (
                  <motion.span
                    className="relative z-10"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 0.6, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={SIDEBAR_FADE}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </motion.nav>

      {/* Logout */}
      <motion.div
        layout
        className={`border-t border-white/5 relative z-10 bg-black/20 ${collapsed ? "p-3" : "p-5"}`}
        transition={SIDEBAR_SPRING}
      >
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex items-center justify-center rounded-xl text-red-400/80 hover:text-white bg-red-500/10 hover:bg-red-500/80 border border-red-500/20 transition-all text-sm font-bold group shadow-[0_0_10px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] ${
            collapsed ? "w-12 h-12 mx-auto px-0 py-0" : "w-full gap-2 px-3 py-3"
          }`}
          aria-label={collapsed ? "Keluar sesi" : undefined}
          title={collapsed ? "Keluar sesi" : undefined}
        >
          <LogOut className={`w-4 h-4 shrink-0 transition-transform ${collapsed ? "" : "group-hover:-translate-x-1"}`} />
          <motion.span
            aria-hidden={collapsed}
            className="overflow-hidden whitespace-nowrap"
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto", x: collapsed ? -8 : 0 }}
            transition={SIDEBAR_FADE}
          >
            Keluar Sesi
          </motion.span>
        </button>
      </motion.div>
    </aside>
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
  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot,
  ) === "true";
  const pathname = usePathname();

  useEffect(() => {
    const timeout = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => pathname.startsWith(href);
  const toggleSidebarCollapsed = () => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!sidebarCollapsed));
    window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
  };

  return (
    <div className="min-h-screen flex bg-[#030914]">
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <div
        className={`hidden lg:flex shrink-0 border-r border-white/5 flex-col z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)] overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          isActive={isActive}
          onToggleCollapse={toggleSidebarCollapsed}
          showCollapseToggle
          userEmail={userEmail}
          userImage={userImage}
          userName={userName}
        />
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
            type="button"
            onClick={() => setOpen(false)}
            className="p-2.5 rounded-xl text-blue-200/50 hover:text-white bg-black/40 hover:bg-white/10 border border-white/5 transition-all backdrop-blur-md"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent
          isActive={isActive}
          onToggleCollapse={toggleSidebarCollapsed}
          userEmail={userEmail}
          userImage={userImage}
          userName={userName}
        />
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-[#030914]/90 backdrop-blur-lg border-b border-white/5 sticky top-0 z-30 shadow-lg">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2.5 rounded-xl text-blue-200/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/portal/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MFWEB" width={24} height={24} style={{ width: 24, height: 24 }} />
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
