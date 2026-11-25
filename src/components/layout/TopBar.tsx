"use client";

import React from "react";
import { Menu } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsCenter } from "./NotificationsCenter";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { isCollapsed, toggleCollapse } = useSidebarCollapse();

  const handleToggleSidebar = () => {
    // On mobile / tablet screens (< 1024px), toggle mobile overlay drawer
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onMenuClick?.();
    } else {
      // On desktop, toggle rail collapse
      toggleCollapse();
    }
  };

  return (
    <header className="h-16 sm:h-20 px-3 sm:px-6 flex items-center justify-between bg-page-bg/90 backdrop-blur-md sticky top-0 z-30 transition-all duration-300 border-b border-slate-200">
      {/* Left aligned: Sidebar toggle button directly to the left of the search box */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 max-w-xl">
        <button
          onClick={handleToggleSidebar}
          className="h-10 w-10 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6B22]/30"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        >
          <Menu className="w-5 h-5 text-slate-600 transition-colors" />
        </button>

        <div className="flex-1 min-w-0">
          <GlobalSearch />
        </div>
      </div>

      {/* Right aligned: Notifications Center */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-3">
        <NotificationsCenter />
      </div>
    </header>
  );
}
