"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
      { label: "Template Proposal", href: "/admin/proposal-templates", icon: FileText, module: "proposals" },
      { label: "Onboarding", href: "/admin/onboarding", icon: ClipboardList, module: "clients" },
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
      <p className="text-blue-400/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">Admin Portal</p>
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
          key={collapsed ? "sidebar-contract" : "sidebar-expand"}
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
        className={`flex-1 py-6 overflow-y-auto custom-scrollbar relative z-10 ${collapsed ? "px-3 space-y-5" : "px-5 space-y-8"}`}
        transition={SIDEBAR_SPRING}
      >
        {hasNoAccess ? (
          <motion.div
            layout
            className={`rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300/80 text-xs leading-relaxed ${
              collapsed ? "px-2 py-3 text-center" : "px-3 py-4"
            }`}
            title="Anda belum memiliki akses modul. Hubungi Super Admin."
            transition={SIDEBAR_SPRING}
          >
            {collapsed ? "!" : "Anda belum memiliki akses modul. Hubungi Super Admin."}
          </motion.div>
        ) : (
          menuGroups.map((group, i) => (
            <motion.div key={i} layout className={collapsed ? "space-y-1.5" : "space-y-2"} transition={SIDEBAR_SPRING}>
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
                {group.title}
              </motion.h4>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center rounded-xl transition-colors text-sm font-medium group overflow-hidden ${
                        collapsed ? "justify-center w-12 h-12 mx-auto px-0 py-0" : "justify-between px-3 py-2.5"
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
                          layoutId="admin-sidebar-active-orb"
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
              </div>
            </motion.div>
          ))
        )}
      </motion.nav>

      {/* User / Logout */}
      <motion.div
        layout
        className={`border-t border-white/5 relative z-10 bg-black/20 ${collapsed ? "p-3" : "p-5"}`}
        transition={SIDEBAR_SPRING}
      >
        <motion.div layout className={`flex items-center py-1 mb-4 ${collapsed ? "justify-center px-0" : "justify-between px-1"}`} transition={SIDEBAR_SPRING}>
          <div className={`flex items-center ${collapsed ? "w-12 justify-center" : "w-full gap-3"}`}>
            <motion.div
              layout
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10 shadow-lg shrink-0"
              animate={{ scale: collapsed ? 0.95 : 1, boxShadow: collapsed ? "0 0 18px rgba(99,102,241,0.18)" : "0 10px 15px rgba(0,0,0,0.2)" }}
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
              <p className="text-blue-200/40 text-[10px] truncate mt-0.5">Administrator</p>
            </motion.div>
          </div>
        </motion.div>
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
    <div className="min-h-screen flex bg-[#030914]">
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <div
        className={`hidden lg:flex shrink-0 border-r border-white/5 flex-col z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)] overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
          hasNoAccess={hasNoAccess}
          isActive={isActive}
          menuGroups={menuGroups}
          onToggleCollapse={toggleSidebarCollapsed}
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
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/logo.png" alt="MFWEB" width={24} height={24} style={{ width: 24, height: 24 }} />
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
