"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BrandLogoIcon } from "@/components/brand/BrandLogo";
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

const mobileNavLabels = new Set(["Dashboard", "Proyek Saya", "Tagihan", "Tools"]);

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
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden"
      animate={{ rotate: collapsed ? -8 : 0, scale: collapsed ? 0.96 : 1 }}
      transition={SIDEBAR_SPRING}
    >
      <BrandLogoIcon size={24} variant="dark" className="shrink-0 relative z-10" />
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
      <p className="text-white text-base font-black tracking-tight">MF<span className="text-zinc-400">WEB</span></p>
      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Portal Klien</p>
    </motion.div>
    </Link>
  </motion.div>
);

function UserAvatar({ src, name, sizeClasses, imageClasses, fallbackClasses }: { src?: string | null, name: string, sizeClasses: string, imageClasses?: string, fallbackClasses?: string }) {
  const [error, setError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  if (!src || error) {
    return (
      <div className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-bold bg-blue-600 ${fallbackClasses || ""}`}>
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
  creditBalance: number;
}

function SidebarContent({
  collapsed = false,
  isActive,
  onToggleCollapse,
  showCollapseToggle = false,
  userEmail,
  userImage,
  userName,
  creditBalance,
}: SidebarContentProps) {
  return (
    <aside className="flex flex-col h-full bg-[#1E242E] text-slate-200 relative overflow-hidden select-none">

      {/* Logo */}
      <motion.div
        layout
        className={`border-b border-slate-800/80 relative z-10 ${collapsed ? "p-4" : "px-5 py-5"}`}
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
            className={`${showCollapseToggle ? "hidden lg:flex" : "hidden"} w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-700/60 transition-colors`}
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
        className={`border-b border-slate-800/80 relative z-10 bg-[#171C24]/60 ${collapsed ? "px-3 py-4" : "px-5 py-4"}`}
        transition={SIDEBAR_SPRING}
      >
        <motion.div
          layout
          className={`flex items-center ${collapsed ? "flex-col gap-3" : "justify-between mb-3"}`}
          transition={SIDEBAR_SPRING}
        >
          <Link href="/portal/profile" className={`relative ${collapsed ? "w-10 flex justify-center" : ""}`} aria-label="Profil klien">
            <UserAvatar 
              src={userImage} 
              name={userName} 
              sizeClasses="w-9 h-9" 
              imageClasses="ring-2 ring-slate-700 hover:ring-slate-500 transition-all shadow-sm"
              fallbackClasses="text-xs ring-2 ring-slate-700 shadow-sm"
            />
            {!collapsed && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1E242E]" />
            )}
          </Link>
          <div className={collapsed ? "w-10 flex justify-center" : ""}>
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
          <p className="text-white text-sm font-semibold tracking-tight line-clamp-1">{userName}</p>
          <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{userEmail}</p>
        </motion.div>
        <Link
          href="/portal/credits"
          className={`mt-3 flex items-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15 hover:border-amber-400/40 transition-colors ${
            collapsed ? "w-10 h-10 justify-center mx-auto" : "justify-between gap-3 px-3 py-2"
          }`}
          aria-label={`Saldo kredit ${creditBalance} kredit`}
          title={`Saldo kredit: ${creditBalance} kredit`}
        >
          <span className={`flex items-center min-w-0 ${collapsed ? "justify-center" : "gap-2"}`}>
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <motion.span
              aria-hidden={collapsed}
              className="overflow-hidden whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-amber-300/80"
              animate={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : "auto",
                x: collapsed ? -6 : 0,
                filter: collapsed ? "blur(2px)" : "blur(0px)",
              }}
              transition={SIDEBAR_FADE}
            >
              Kredit Tools
            </motion.span>
          </span>
          <motion.span
            aria-hidden={collapsed}
            className="overflow-hidden whitespace-nowrap text-xs font-black text-amber-300 tabular-nums bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md"
            animate={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : "auto",
              x: collapsed ? -6 : 0,
              filter: collapsed ? "blur(2px)" : "blur(0px)",
            }}
            transition={SIDEBAR_FADE}
          >
            {creditBalance}
          </motion.span>
        </Link>
      </motion.div>

      {/* Nav */}
      <motion.nav
        layout
        className={`flex-1 py-5 overflow-y-auto custom-scrollbar relative z-10 ${collapsed ? "px-2.5 space-y-1" : "px-3.5 space-y-1"}`}
        transition={SIDEBAR_SPRING}
      >
        <motion.h4
          aria-hidden={collapsed}
          className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400/80 overflow-hidden whitespace-nowrap"
          animate={{
            opacity: collapsed ? 0 : 1,
            height: collapsed ? 0 : "auto",
            marginBottom: collapsed ? 0 : 10,
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
              className={`relative flex items-center rounded-xl transition-all text-sm font-medium group overflow-hidden ${
                collapsed ? "justify-center w-10 h-10 mx-auto px-0 py-0" : "justify-between px-3 py-2.5"
              } ${
                active
                  ? "bg-slate-800 text-white border border-slate-700/80 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
              }`}
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
            >
              <div className={`relative z-10 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                <motion.span
                  layout
                  animate={{ scale: active ? 1.05 : 1 }}
                  transition={SIDEBAR_SPRING}
                >
                  <item.icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
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
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 0.8, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={SIDEBAR_FADE}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
        className={`border-t border-slate-800/80 relative z-10 bg-[#171C24]/60 ${collapsed ? "p-2.5" : "p-4"}`}
        transition={SIDEBAR_SPRING}
      >
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex items-center justify-center rounded-xl text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all text-xs font-semibold group ${
            collapsed ? "w-10 h-10 mx-auto px-0 py-0" : "w-full gap-2 px-3 py-2.5"
          }`}
          aria-label={collapsed ? "Keluar sesi" : undefined}
          title={collapsed ? "Keluar sesi" : undefined}
        >
          <LogOut className={`w-4 h-4 shrink-0 transition-transform ${collapsed ? "" : "group-hover:-translate-x-0.5"}`} />
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
  creditBalance,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  creditBalance: number;
}) {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot,
  ) === "true";
  const pathname = usePathname();

  // Safety: always clear overflow on mount to prevent stuck scroll lock
  useEffect(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, []);

  useEffect(() => {
    const removeDesktopBackdrops = () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) return;

      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.querySelectorAll<HTMLElement>("[data-portal-mobile-backdrop]").forEach((element) => element.remove());
      document.querySelectorAll<HTMLElement>("div").forEach((element) => {
        const className = typeof element.className === "string" ? element.className : "";
        const looksLikeOldPortalBackdrop =
          className.includes("fixed") &&
          className.includes("inset-0") &&
          className.includes("bg-black/80") &&
          className.includes("backdrop-blur-sm") &&
          (className.includes("z-40") || className.includes("z-10"));

        if (looksLikeOldPortalBackdrop) element.remove();
      });
    };

    removeDesktopBackdrops();
    window.addEventListener("resize", removeDesktopBackdrops);
    return () => window.removeEventListener("resize", removeDesktopBackdrops);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      setIsDesktop(media.matches);
      if (media.matches) setOpen(false);
    };

    closeOnDesktop();
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open && !isDesktop ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, isDesktop]);

  const isActive = (href: string) => pathname.startsWith(href);
  const mobileDrawerOpen = open && !isDesktop;
  const toggleSidebarCollapsed = () => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!sidebarCollapsed));
    window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
  };

  return (
    <div className="h-screen overflow-hidden flex bg-[#F8F9FA]">
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <div
        className={`hidden lg:flex shrink-0 border-r border-slate-800 flex-col relative z-30 overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarCollapsed ? "w-20" : "w-64"
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
          creditBalance={creditBalance}
        />
      </div>

      {/* ── Mobile drawer backdrop ───────────────────────── */}
      {mobileDrawerOpen && (
        <div
          data-portal-mobile-backdrop
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-2xl border-r border-slate-800 lg:hidden transition-transform duration-300 ease-[0.22,1,0.36,1] ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4 z-50">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700 transition-all"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent
          isActive={isActive}
          onToggleCollapse={toggleSidebarCollapsed}
          userEmail={userEmail}
          userImage={userImage}
          userName={userName}
          creditBalance={creditBalance}
        />
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-20 bg-[#F8F9FA]">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-[#1E242E] border-b border-slate-800 sticky top-0 z-30 shadow-xs">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700 transition-all"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/portal/dashboard" className="flex items-center gap-2">
              <BrandLogoIcon size={22} variant="dark" />
              <span className="text-white font-black tracking-tight text-sm">MF<span className="text-slate-400">WEB</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/portal/profile">
              <UserAvatar 
                src={userImage} 
                name={userName} 
                sizeClasses="w-7 h-7" 
                imageClasses="ring-1 ring-slate-700"
                fallbackClasses="text-[10px] ring-1 ring-slate-700"
              />
            </Link>
          </div>
        </header>

        {/* Mobile bottom tab bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#1E242E] border-t border-slate-800 flex pb-safe">
          {navItems.filter((item) => mobileNavLabels.has(item.label)).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] transition-all relative ${
                  active ? "text-white font-bold" : "text-slate-400 font-medium hover:text-slate-200"
                }`}
              >
                {active && (
                  <div className="absolute top-0 inset-x-4 h-0.5 bg-white rounded-full" />
                )}
                <item.icon className="w-4 h-4" />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 relative">
          <div className="p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
