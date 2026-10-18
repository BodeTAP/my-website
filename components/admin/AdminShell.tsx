"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BrandLogoIcon } from "@/components/brand/BrandLogo";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import type { Transition } from "framer-motion";
import {
  LayoutDashboard, FileText, Users, Briefcase,
  Receipt, MessageSquare, LogOut, Menu, X, Globe, Star, Settings, Tag, Wrench, ClipboardList, ScrollText, UserCheck, ChevronRight, Server, Shield, PanelLeftClose, PanelLeftOpen, Coins
} from "lucide-react";
import type { AdminModule } from "@/lib/permissions";

type MenuModule = AdminModule | "team";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";
const SIDEBAR_STORAGE_EVENT = "admin-sidebar-collapsed-change";
const SIDEBAR_SPRING: Transition = { type: "spring", stiffness: 360, damping: 38, mass: 0.9 };
const SIDEBAR_FADE: Transition = { duration: 0.18, ease: [0.22, 1, 0.36, 1] };

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  module?: MenuModule;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const ALL_MENU_GROUPS: MenuGroup[] = [
  {
    title: "Utama",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ]
  },
  {
    title: "Penjualan & Klien",
    items: [
      { label: "Inbox Leads", href: "/admin/leads", icon: Users, module: "leads" },
      { label: "Klien & Kontak", href: "/admin/clients", icon: UserCheck, module: "clients" },
      { label: "Kredit Klien", href: "/admin/credits", icon: Coins, module: "clients" },
      { label: "Proposal", href: "/admin/proposals", icon: ScrollText, module: "proposals" },
      { label: "Onboarding", href: "/admin/onboarding", icon: ClipboardList, module: "clients" },
    ]
  },
  {
    title: "Tools",
    items: [
      { label: "Tools", href: "/admin/tools", icon: Wrench, module: "proposals" },
    ]
  },
  {
    title: "Proyek & Layanan",
    items: [
      { label: "Manajemen Proyek", href: "/admin/projects",  icon: Briefcase, module: "projects" },
      { label: "Invoice & Tagihan", href: "/admin/invoices",  icon: Receipt, module: "invoices" },
      { label: "Tiket Dukungan",   href: "/admin/tickets",   icon: MessageSquare, module: "tickets" },
      { label: "Maintenance",      href: "/admin/maintenance", icon: Wrench, module: "maintenance" },
      { label: "Hosting & Domain", href: "/admin/hosting",   icon: Server, module: "hosting" },
    ]
  },
  {
    title: "Konten Publik",
    items: [
      { label: "Artikel Blog", href: "/admin/articles", icon: FileText, module: "articles" },
      { label: "Kategori Artikel", href: "/admin/categories", icon: Tag, module: "articles" },
      { label: "Portofolio", href: "/admin/portfolio", icon: Globe, module: "portfolio" },
      { label: "Testimoni", href: "/admin/testimonials", icon: Star, module: "testimonials" },
    ]
  },
  {
    title: "Sistem",
    items: [
      { label: "Pengaturan", href: "/admin/settings", icon: Settings, module: "ai_settings" },
      { label: "Team Settings", href: "/admin/settings/team", icon: Shield, module: "team" },
    ]
  }
];

function getFilteredMenuGroups(allowedModules: AdminModule[], isSuperAdmin: boolean): MenuGroup[] {
  return ALL_MENU_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.module) return true; // always show items without a module
        if (item.module === "team") return isSuperAdmin; // team only for Super Admin
        return allowedModules.includes(item.module as AdminModule);
      }),
    }))
    .filter((group) => group.items.length > 0); // remove empty groups
}

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
      href="/admin"
      className={`flex items-center group ${collapsed ? "justify-center gap-0 px-0" : "gap-3 px-2"}`}
      aria-label="MFWEB Admin Portal"
    >
      <motion.div
        layout
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xs transition-shadow"
        animate={{ rotate: collapsed ? -6 : 0, scale: collapsed ? 0.96 : 1 }}
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
        <p className="text-white text-base font-bold tracking-tight">MF<span className="text-slate-400">WEB</span></p>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Admin Portal</p>
      </motion.div>
    </Link>
  </motion.div>
);

interface AdminShellProps {
  children: React.ReactNode;
  allowedModules: AdminModule[];
  isSuperAdmin: boolean;
}

interface SidebarContentProps {
  collapsed?: boolean;
  hasNoAccess: boolean;
  isActive: (href: string) => boolean;
  menuGroups: MenuGroup[];
  onToggleCollapse: () => void;
  showCollapseToggle?: boolean;
}

function SidebarContent({
  collapsed = false,
  hasNoAccess,
  isActive,
  menuGroups,
  onToggleCollapse,
  showCollapseToggle = false,
}: SidebarContentProps) {
  return (
    <aside className="flex flex-col h-full bg-[#1E242E] text-slate-100 relative overflow-hidden border-r border-slate-800/90">
      {/* Logo Header */}
      <motion.div
        layout
        className={`border-b border-slate-800/90 relative z-10 ${collapsed ? "p-4" : "p-5"}`}
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
            className={`${showCollapseToggle ? "hidden lg:flex" : "hidden"} w-9 h-9 items-center justify-center rounded-xl text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 transition-all shadow-xs`}
            aria-label={collapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
            title={collapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={collapsed ? "open-sidebar" : "close-sidebar"}
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

      {/* Nav */}
      <motion.nav
        layout
        className={`flex-1 py-5 overflow-y-auto custom-scrollbar relative z-10 ${collapsed ? "px-2.5 space-y-4" : "px-4 space-y-6"}`}
        transition={SIDEBAR_SPRING}
      >
        {hasNoAccess ? (
          <motion.div
            layout
            className={`rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed ${
              collapsed ? "px-2 py-3 text-center" : "px-3 py-4"
            }`}
            title="Anda belum memiliki akses modul. Hubungi Super Admin."
            transition={SIDEBAR_SPRING}
          >
            {collapsed ? "!" : "Anda belum memiliki akses modul. Hubungi Super Admin."}
          </motion.div>
        ) : (
          menuGroups.map((group, i) => (
            <motion.div key={i} layout className={collapsed ? "space-y-1.5" : "space-y-1"} transition={SIDEBAR_SPRING}>
              <motion.h4
                aria-hidden={collapsed}
                className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400/80 overflow-hidden whitespace-nowrap"
                animate={{
                  opacity: collapsed ? 0 : 1,
                  height: collapsed ? 0 : "auto",
                  marginBottom: collapsed ? 0 : 8,
                  x: collapsed ? -10 : 0,
                }}
                transition={SIDEBAR_FADE}
              >
                {group.title}
              </motion.h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center rounded-xl transition-all text-xs font-semibold group overflow-hidden ${
                        collapsed ? "justify-center w-11 h-11 mx-auto px-0 py-0" : "justify-between px-3 py-2.5"
                      } ${
                        active
                          ? "bg-slate-800 text-white border border-slate-700/80 shadow-xs"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent"
                      }`}
                      aria-label={collapsed ? item.label : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <div
                          className={`absolute ${collapsed ? "inset-1 rounded-lg" : "inset-y-1.5 left-1 w-1 rounded-full"} bg-white`}
                        />
                      )}
                      <div className={`relative z-10 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                        <span className={`shrink-0 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                          <item.icon className="w-4 h-4" />
                        </span>
                        <motion.span
                          aria-hidden={collapsed}
                          className="overflow-hidden whitespace-nowrap text-xs"
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
                          <span className="relative z-10 opacity-70">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))
        )}
      </motion.nav>

      {/* User / Logout */}
      <motion.div
        layout
        className={`border-t border-slate-800/90 relative z-10 bg-slate-900/40 ${collapsed ? "p-3" : "p-4"}`}
        transition={SIDEBAR_SPRING}
      >
        <motion.div layout className={`flex items-center mb-3 ${collapsed ? "justify-center px-0" : "justify-between px-1"}`} transition={SIDEBAR_SPRING}>
          <div className={`flex items-center ${collapsed ? "w-11 justify-center" : "w-full gap-3"}`}>
            <motion.div
              layout
              className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs"
              animate={{ scale: collapsed ? 0.95 : 1 }}
              transition={SIDEBAR_SPRING}
            >
              A
            </motion.div>
            <motion.div
              aria-hidden={collapsed}
              className="min-w-0 flex-1 overflow-hidden whitespace-nowrap"
              animate={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : "auto",
                x: collapsed ? -8 : 0,
                filter: collapsed ? "blur(3px)" : "blur(0px)",
              }}
              transition={SIDEBAR_FADE}
            >
              <p className="text-white text-xs font-bold truncate">Admin Utama</p>
              <p className="text-slate-400 text-[10px] truncate mt-0.5">Administrator</p>
            </motion.div>
          </div>
        </motion.div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex items-center justify-center rounded-xl text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/80 border border-rose-500/20 transition-all text-xs font-semibold group shadow-xs ${
            collapsed ? "w-11 h-11 mx-auto px-0 py-0" : "w-full gap-2 px-3 py-2.5"
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

export default function AdminShell({ children, allowedModules, isSuperAdmin }: AdminShellProps) {
  const [open, setOpen] = useState(false);
  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot,
  ) === "true";
  const pathname = usePathname();
  
  const menuGroups = getFilteredMenuGroups(allowedModules, isSuperAdmin);
  const hasNoAccess = allowedModules.length === 0 && !isSuperAdmin;

  // Close drawer on route change
  useEffect(() => {
    const timeout = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  // Lock body scroll when drawer open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  const toggleSidebarCollapsed = () => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!sidebarCollapsed));
    window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <div
        className={`hidden lg:flex shrink-0 border-r border-slate-800/90 flex-col z-20 shadow-xs overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          hasNoAccess={hasNoAccess}
          isActive={isActive}
          menuGroups={menuGroups}
          onToggleCollapse={toggleSidebarCollapsed}
          showCollapseToggle
        />
      </div>

      {/* ── Mobile drawer backdrop ───────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 shadow-2xl border-r border-slate-800/90 lg:hidden transition-transform duration-300 ease-[0.22,1,0.36,1] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-5 right-5 z-50">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all shadow-xs"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent
          hasNoAccess={hasNoAccess}
          isActive={isActive}
          menuGroups={menuGroups}
          onToggleCollapse={toggleSidebarCollapsed}
        />
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-[#1E242E] border-b border-slate-800 sticky top-0 z-30 shadow-xs">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 transition-all shadow-xs"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/admin" className="flex items-center gap-2">
              <BrandLogoIcon size={24} variant="dark" />
              <span className="text-white font-bold tracking-tight">MF<span className="text-slate-400">WEB</span></span>
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
