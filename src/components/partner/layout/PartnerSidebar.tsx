"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Send,
  ListFilter,
  BarChart3,
  MessageSquare,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  LogOut,
  Building2,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import { useAuth } from "@/hooks/useAuth";
import { SidebarTooltip, useSidebarTooltip } from "@/components/layout/SidebarTooltip";
import { mockOrganization, mockTeamMembers } from "@/lib/partner/mockData";

const NAV_ITEMS = [
  { name: "Dashboard", icon: LayoutDashboard, id: "dashboard", href: "/partner" },
  { name: "Submit Referral", icon: Send, id: "submit", href: "/partner/submit" },
  { name: "My Referrals", icon: ListFilter, id: "referrals", href: "/partner/referrals" },
  { name: "Analytics", icon: BarChart3, id: "analytics", href: "/partner/analytics" },
  { name: "Messages", icon: MessageSquare, id: "messages", href: "/partner/messages" },
  { name: "Account Settings", icon: Settings, id: "settings", href: "/partner/settings" },
];

interface PartnerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function PartnerSidebar({ isOpen = false, onClose }: PartnerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { isCollapsed, toggleCollapse } = useSidebarCollapse();
  const { tooltip, showTooltip, hideTooltip } = useSidebarTooltip(isCollapsed);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    router.push("/login");
  };

  const activeItem = React.useMemo(() => {
    if (pathname === "/partner/submit") return "submit";
    if (pathname?.startsWith("/partner/referrals")) return "referrals";
    if (pathname?.startsWith("/partner/analytics")) return "analytics";
    if (pathname?.startsWith("/partner/messages")) return "messages";
    if (pathname?.startsWith("/partner/settings")) return "settings";
    if (pathname === "/partner") return "dashboard";
    return "dashboard";
  }, [pathname]);

  const activeMember = mockTeamMembers[0];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={clsx(
          "bg-sidebar-bg text-white flex flex-col h-screen fixed top-0 left-0 z-50 transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] lg:translate-x-0 lg:sticky lg:top-0 shadow-[4px_0_24px_rgba(0,0,0,0.15)] lg:shadow-none select-none overflow-x-hidden will-change-[width]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-[76px] w-[260px]" : "w-[260px]"
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
          className="hidden lg:flex absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full bg-brand-teal text-white items-center justify-center shadow-lg border border-white/90 ring-2 ring-slate-900/60 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <PanelLeftClose
            className={clsx(
              "w-4 h-4 transition-transform duration-300 ease-in-out",
              isCollapsed && "rotate-180"
            )}
          />
        </button>

        {/* Header / Logo Area */}
        <div
          className={clsx(
            "flex items-center h-20 border-b border-sidebar-active/40 px-3 relative overflow-hidden transition-all duration-300",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <Link href="/partner" className="flex items-center gap-3 overflow-hidden group w-full">
            <div className="w-12 h-12 rounded-xl bg-white/10 p-1 flex items-center justify-center shadow-md shadow-brand-teal/20 shrink-0 group-hover:scale-105 transition-transform">
              <img src="/logo-mark.svg" alt="LiliSare Logo" className="w-10 h-10 object-contain" />
            </div>
            <div
              className={clsx(
                "flex flex-col truncate transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden whitespace-nowrap",
                isCollapsed
                  ? "max-w-0 opacity-0 -translate-x-3 pointer-events-none"
                  : "max-w-[180px] opacity-100 translate-x-0"
              )}
            >
              <span className="font-bold text-base lg:text-xl tracking-wide text-white block leading-tight truncate">
                LiliSare
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-teal mt-0.5">
                Partner Portal
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className={clsx(
              "absolute right-4 lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors",
              isCollapsed && "hidden"
            )}
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          onScroll={hideTooltip}
          className="flex-1 overflow-y-auto px-3 py-4 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/80"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeItem === item.id;
              const Icon = item.icon;

              return (
                <li key={item.id} className="relative group">
                  {isActive && (
                    <div
                      className="absolute inset-0 bg-brand-teal rounded-xl shadow-md shadow-brand-teal/20 transition-opacity duration-150"
                    />
                  )}

                  <Link
                    href={item.href}
                    onClick={() => {
                      hideTooltip();
                      if (onClose) onClose();
                    }}
                    onMouseEnter={(e) => showTooltip(e, item.name, isActive)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltip(e, item.name, isActive)}
                    onBlur={hideTooltip}
                    aria-label={isCollapsed ? item.name : undefined}
                    className={clsx(
                      "relative flex items-center rounded-xl text-sm font-medium transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal h-10 px-3",
                      isActive ? "text-white font-semibold" : "text-slate-300 hover:text-white hover:bg-sidebar-active/60"
                    )}
                  >
                    <div className="flex items-center w-full overflow-hidden">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>
                      <span
                        className={clsx(
                          "truncate text-sm transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap overflow-hidden ml-2.5",
                          isCollapsed
                            ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none ml-0"
                            : "max-w-[170px] opacity-100 translate-x-0"
                        )}
                      >
                        {item.name}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-active/60 relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label={isCollapsed ? `${activeMember.name} Profile` : undefined}
            className={clsx(
              "flex items-center w-full hover:bg-sidebar-active p-2 rounded-xl transition-all duration-300 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C573]",
              isCollapsed ? "justify-center" : "gap-3 justify-between"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-sidebar-active shrink-0 overflow-hidden flex items-center justify-center ring-2 ring-[#93C573]/40">
              <User className="w-4.5 h-4.5 text-emerald-200" />
            </div>
            <div
              className={clsx(
                "flex-1 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap",
                isCollapsed
                  ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                  : "max-w-[150px] opacity-100 translate-x-0"
              )}
            >
              <div className="text-sm font-medium text-white truncate">
                {activeMember.name}
              </div>
              <div className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" />
                {mockOrganization.name}
              </div>
            </div>
            <div
              className={clsx(
                "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] shrink-0 overflow-hidden",
                isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-5 opacity-100"
              )}
            >
              <ChevronDown
                className={clsx(
                  "w-4 h-4 text-slate-400 transition-transform duration-200",
                  isProfileOpen && "rotate-180"
                )}
              />
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={clsx(
                  "absolute bg-[#14280E] border border-sidebar-active/80 rounded-2xl shadow-xl overflow-hidden z-50 p-1.5",
                  isCollapsed
                    ? "left-full ml-4 bottom-3 w-48"
                    : "bottom-[calc(100%-10px)] left-3 right-3 mb-2"
                )}
              >
                <div className="flex flex-col gap-1">
                  <Link
                    href="/partner/settings"
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-sidebar-active rounded-xl transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </Link>
                  <div className="h-px w-full bg-sidebar-active/60 my-0.5" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
      <SidebarTooltip tooltip={tooltip} />
    </>
  );
}
