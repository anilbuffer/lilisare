"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  ListFilter,
  Inbox,
  AlertTriangle,
  Sliders,
  FileCode,
  BarChart3,
  History,
  Download,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import {
  getCareNotesFromStorage,
  getCareNotesKpiSummary,
  exportCareNotesCsv,
  CARE_NOTES_SYNC_EVENT,
} from "@/lib/admin/careNotesStore";
import { toast } from "sonner";

export interface CareNotesSubNavProps {
  title?: string;
  description?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export interface CareNotesTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
  count?: number;
}

const TAB_MIN_WIDTHS: Record<string, number> = {
  overview: 105,
  all: 120,
  review: 140,
  corrections: 175,
  rules: 165,
  templates: 140,
  reports: 145,
  audit: 125,
};

const MORE_BUTTON_MIN_WIDTH = 96;

export function CareNotesSubNav({
  title = "CareNotes",
  description = "Monitor care documentation, review submitted notes and manage documentation quality across your agency.",
  activeTab: controlledActiveTab,
  onTabChange,
}: CareNotesSubNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [kpi, setKpi] = useState(() => getCareNotesKpiSummary());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine active tab from prop, URL search param, or pathname
  const derivedActiveTab = React.useMemo(() => {
    if (controlledActiveTab) return controlledActiveTab;
    const urlTab = searchParams.get("tab");
    if (urlTab) return urlTab;
    if (pathname.startsWith("/admin/care-notes/all")) return "all";
    if (pathname.startsWith("/admin/care-notes/review")) return "review";
    if (pathname.startsWith("/admin/care-notes/corrections")) return "corrections";
    if (pathname.startsWith("/admin/care-notes/rules")) return "rules";
    if (pathname.startsWith("/admin/care-notes/templates")) return "templates";
    if (pathname.startsWith("/admin/care-notes/reports")) return "reports";
    if (pathname.startsWith("/admin/care-notes/audit")) return "audit";
    return "overview";
  }, [controlledActiveTab, searchParams, pathname]);

  const [activeTabState, setActiveTabState] = useState<string>(derivedActiveTab);

  useEffect(() => {
    setActiveTabState(derivedActiveTab);
  }, [derivedActiveTab]);

  useEffect(() => {
    const handleSync = () => {
      setKpi(getCareNotesKpiSummary());
    };
    window.addEventListener(CARE_NOTES_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(CARE_NOTES_SYNC_EVENT, handleSync);
  }, []);

  const handleExport = () => {
    const notes = getCareNotesFromStorage();
    exportCareNotesCsv(notes);
    toast.success(`Exported ${notes.length} care notes to CSV`);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setKpi(getCareNotesKpiSummary());
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Care documentation records synchronized");
    }, 400);
  };

  // 8 Canonical Tabs
  const navTabs: CareNotesTabItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: FileText,
    },
    {
      id: "all",
      label: "All Notes",
      icon: ListFilter,
      count: kpi.totalNotes,
    },
    {
      id: "review",
      label: "Review Queue",
      icon: Inbox,
      badge: kpi.pendingReviewCount > 0 ? kpi.pendingReviewCount : undefined,
      badgeColor: "bg-amber-100 text-amber-800 border border-amber-200/80",
    },
    {
      id: "corrections",
      label: "Correction Requests",
      icon: AlertTriangle,
      badge: kpi.needsCorrectionCount > 0 ? kpi.needsCorrectionCount : undefined,
      badgeColor: "bg-rose-100 text-rose-700 border border-rose-200/80",
    },
    {
      id: "rules",
      label: "Documentation Rules",
      icon: Sliders,
    },
    {
      id: "templates",
      label: "Note Templates",
      icon: FileCode,
    },
    {
      id: "reports",
      label: "Quality & Reports",
      icon: BarChart3,
    },
    {
      id: "audit",
      label: "Audit History",
      icon: History,
    },
  ];

  // Space-Aware Responsive Tab Strip State
  const tabStripRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(navTabs.length);

  // Close More dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMoreOpen]);

  // Dynamic space-aware overflow calculation
  useEffect(() => {
    const calculateOverflow = () => {
      if (!tabStripRef.current) return;

      const containerWidth = tabStripRef.current.clientWidth;
      // Container padding: p-1.5 = 12px horizontal + safety buffer 12px = 24px
      const availableWidth = containerWidth - 24;
      if (availableWidth <= 0) return;

      const measureChildren = measureContainerRef.current
        ? (Array.from(measureContainerRef.current.children) as HTMLElement[])
        : [];

      // The last child in the measure container is the "MORE (8) ▾" template
      const moreMeasureEl =
        measureChildren.length > 0 ? measureChildren[measureChildren.length - 1] : null;
      const measuredMoreWidth = moreMeasureEl ? moreMeasureEl.getBoundingClientRect().width : 0;
      const moreWidth = Math.max(measuredMoreWidth, MORE_BUTTON_MIN_WIDTH);

      // The first 8 children are the tab buttons
      const tabElements = measureChildren.slice(0, navTabs.length);
      const tabWidths = navTabs.map((tab, idx) => {
        const measured = tabElements[idx]?.getBoundingClientRect().width || 0;
        return Math.max(measured, TAB_MIN_WIDTHS[tab.id] || 90);
      });

      const GAP = 4; // gap-1 in Tailwind is 4px

      // 1. Check if ALL tabs fit cleanly within available container width
      const totalAllWidth = tabWidths.reduce((acc, w, idx) => acc + w + (idx > 0 ? GAP : 0), 0);
      if (availableWidth >= totalAllWidth + 4) {
        setVisibleCount(navTabs.length);
        return;
      }

      // 2. Otherwise reserve space for directly adjacent MORE button
      const maxTabsWidth = availableWidth - moreWidth - GAP;

      let currentWidth = 0;
      let count = 0;
      for (let i = 0; i < tabWidths.length; i++) {
        const nextWidth = currentWidth + (count > 0 ? GAP : 0) + tabWidths[i];
        if (nextWidth <= maxTabsWidth) {
          currentWidth = nextWidth;
          count++;
        } else {
          break;
        }
      }

      // Ensure at least 1 tab is visible and at most (navTabs.length - 1) tabs when overflowing
      setVisibleCount(Math.min(navTabs.length - 1, Math.max(1, count)));
    };

    calculateOverflow();

    const resizeObserver = new ResizeObserver(() => {
      calculateOverflow();
    });

    if (tabStripRef.current) {
      resizeObserver.observe(tabStripRef.current);
    }

    window.addEventListener("resize", calculateOverflow);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateOverflow);
    };
  }, [navTabs.length, kpi.totalNotes, kpi.pendingReviewCount, kpi.needsCorrectionCount]);

  const handleSelectTab = (tabId: string) => {
    setActiveTabState(tabId);
    setIsMoreOpen(false);

    if (onTabChange) {
      onTabChange(tabId);
    } else {
      // In-page tab navigation fallback with query sync
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.replace(`/admin/care-notes?${params.toString()}`);
    }
  };

  const visibleTabs = navTabs.slice(0, visibleCount);
  const overflowTabs = navTabs.slice(visibleCount);
  const isOverflowActive = overflowTabs.some((t) => t.id === activeTabState);
  const activeOverflowTab = overflowTabs.find((t) => t.id === activeTabState);

  return (
    <div className="w-full space-y-4 mb-4">
      {/* 01. Standard Page Header (Natural page flow, not fixed header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#3D6B22] border border-emerald-200/80">
              Agency Admin
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">{description}</p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh care documentation data"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            title="Export filtered records to CSV"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab("rules")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Documentation Rules</span>
          </button>
        </div>
      </div>

      {/* 02. Space-Aware Tab Navigation Strip */}
      <div className="relative">
        {/* Hidden measurement row for pixel-perfect dynamic overflow calculation */}
        <div
          ref={measureContainerRef}
          aria-hidden="true"
          className="absolute -top-[9999px] -left-[9999px] pointer-events-none flex items-center gap-1 opacity-0 z-[-1]"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div
                key={`measure-${tab.id}`}
                className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap rounded-xl shrink-0"
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && !tab.badge && (
                  <span className="text-[11px] font-medium">
                    ({tab.count})
                  </span>
                )}
              </div>
            );
          })}
          {/* Measure reference for the "MORE (8) ▾" template */}
          <div className="px-3.5 py-2 text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap rounded-xl flex items-center gap-1.5 border shrink-0">
            <span>MORE (8)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Dynamic Space-Aware Tab Navigation Strip: "More" is directly adjacent with zero empty gap */}
        <div
          ref={tabStripRef}
          className="relative w-full bg-white shadow-2xs rounded-xl lg:rounded-2xl border border-slate-200 p-1.5 flex items-center gap-1 flex-nowrap overflow-visible"
        >
          {/* Front Visible Tabs (Buttons, NOT Route Links) */}
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabState === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : tab.badgeColor || "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && !tab.badge && (
                  <span className={`text-[11px] font-medium ${isActive ? "text-emerald-100" : "text-slate-400"}`}>
                    ({tab.count})
                  </span>
                )}
              </button>
            );
          })}

          {/* Collapsed Overflow Tabs Dropdown Menu (Directly adjacent to visible tabs without gap) */}
          {overflowTabs.length > 0 && (
            <div ref={moreDropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isOverflowActive
                    ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
                    : isMoreOpen
                    ? "bg-slate-100 text-slate-900 border border-slate-300"
                    : "text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:text-slate-900"
                }`}
                aria-expanded={isMoreOpen}
                aria-label="More care notes tabs"
              >
                <span>
                  {isOverflowActive && activeOverflowTab
                    ? `MORE: ${activeOverflowTab.label}`
                    : `MORE (${overflowTabs.length})`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu Popover */}
              {isMoreOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-64 max-w-[calc(100vw-32px)] bg-white rounded-2xl border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 p-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Additional Tabs</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                      {overflowTabs.length} tabs
                    </span>
                  </div>

                  <div className="py-1 max-h-80 overflow-y-auto space-y-0.5">
                    {overflowTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isTabActive = activeTabState === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleSelectTab(tab.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors cursor-pointer ${
                            isTabActive
                              ? "bg-[#3D6B22]/10 text-[#3D6B22] font-bold"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isTabActive ? "text-[#3D6B22]" : "text-slate-400"}`} />
                            <span>{tab.label}</span>
                          </div>
                          {tab.badge !== undefined && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tab.badgeColor || "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
                          {tab.count !== undefined && !tab.badge && (
                            <span className="text-[11px] font-medium text-slate-400">
                              ({tab.count})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
