"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Inbox,
  AlertCircle,
  Sliders,
  BarChart3,
  History,
  Plus,
  Download,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { checkClinicalPermission, resolveClinicalActor } from "@/lib/admin/clinicalAuthGuard";
import {
  exportClinicalCsv,
  getClinicalKpiSummary,
  getClinicalRequirements,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";

export type ClinicalNavTabId =
  | "overview"
  | "requirements"
  | "schedule"
  | "review"
  | "overdue"
  | "rules"
  | "reports"
  | "audit";

export interface ClinicalSubNavProps {
  title?: string;
  activeTab?: ClinicalNavTabId;
  onExport?: () => void;
}

interface ClinicalTabItem {
  id: ClinicalNavTabId;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: number;
  badgeColor?: string;
}

const TAB_MIN_WIDTHS: Record<ClinicalNavTabId, number> = {
  overview: 112,
  requirements: 152,
  schedule: 145,
  review: 156,
  overdue: 185,
  rules: 122,
  reports: 112,
  audit: 142,
};

const MORE_BUTTON_MIN_WIDTH = 112;

export function ClinicalSubNav({
  title = "Clinical & Supervisory",
  activeTab: controlledActiveTab,
  onExport,
}: ClinicalSubNavProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);
  const canManageRules = checkClinicalPermission(actor, "MANAGE_RULES").allowed;
  const canCreateReq = checkClinicalPermission(actor, "CREATE_REQUIREMENT").allowed;

  const [kpi, setKpi] = useState(() => getClinicalKpiSummary());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const refresh = () => setKpi(getClinicalKpiSummary());
    const timer = window.setTimeout(refresh, 0);
    const unsub = subscribeToClinicalSync(refresh);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);

  const derivedActiveTab: ClinicalNavTabId = useMemo(() => {
    if (controlledActiveTab) return controlledActiveTab;
    if (pathname.startsWith("/admin/clinical/requirements")) return "requirements";
    if (pathname.startsWith("/admin/clinical/schedule")) return "schedule";
    if (pathname.startsWith("/admin/clinical/review")) return "review";
    if (pathname.startsWith("/admin/clinical/overdue")) return "overdue";
    if (pathname.startsWith("/admin/clinical/rules")) return "rules";
    if (pathname.startsWith("/admin/clinical/reports")) return "reports";
    if (pathname.startsWith("/admin/clinical/audit")) return "audit";
    return "overview";
  }, [controlledActiveTab, pathname]);

  const navTabs: ClinicalTabItem[] = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        href: "/admin/clinical/",
        icon: LayoutDashboard,
      },
      {
        id: "requirements",
        label: "Requirements",
        href: "/admin/clinical/requirements/",
        icon: ClipboardList,
        count: kpi.totalActiveRequirements,
      },
      {
        id: "schedule",
        label: "Visit Schedule",
        href: "/admin/clinical/schedule/",
        icon: CalendarDays,
        count: kpi.upcomingVisits,
      },
      {
        id: "review",
        label: "Review Queue",
        href: "/admin/clinical/review/",
        icon: Inbox,
        badge: kpi.pendingClinicalReview > 0 ? kpi.pendingClinicalReview : undefined,
        badgeColor: "bg-amber-100 text-amber-800 border border-amber-200/80",
      },
      {
        id: "overdue",
        label: "Overdue & Follow-up",
        href: "/admin/clinical/overdue/",
        icon: AlertCircle,
        badge:
          kpi.overdueVisits + kpi.unassignedCount > 0
            ? kpi.overdueVisits + kpi.unassignedCount
            : undefined,
        badgeColor: "bg-orange-100 text-[#c2410c] border border-orange-200/80",
      },
      {
        id: "rules",
        label: "Visit Rules",
        href: "/admin/clinical/rules/",
        icon: Sliders,
      },
      {
        id: "reports",
        label: "Reports",
        href: "/admin/clinical/reports/",
        icon: BarChart3,
      },
      {
        id: "audit",
        label: "Audit History",
        href: "/admin/clinical/audit/",
        icon: History,
      },
    ],
    [kpi]
  );

  // Space-aware ResizeObserver overflow calculation matching CareNotesSubNav / ResponsiveDomainTabStrip
  const stripOuterRef = useRef<HTMLDivElement>(null);
  const tabStripRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(navTabs.length);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        stripOuterRef.current &&
        !stripOuterRef.current.contains(event.target as Node)
      ) {
        setIsMoreOpen(false);
      }
    }
    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMoreOpen]);

  useEffect(() => {
    const calculateOverflow = () => {
      if (!tabStripRef.current) return;
      const containerWidth = tabStripRef.current.clientWidth;
      // Container horizontal padding (12px) + safety margin (16px)
      const availableWidth = containerWidth - 28;
      if (availableWidth <= 0) return;

      const measureChildren = measureContainerRef.current
        ? (Array.from(measureContainerRef.current.children) as HTMLElement[])
        : [];
      const moreMeasureEl =
        measureChildren.length > navTabs.length
          ? measureChildren[navTabs.length]
          : null;
      const moreActiveMeasureEl =
        measureChildren.length > navTabs.length + 1
          ? measureChildren[navTabs.length + 1]
          : null;
      const measuredMoreWidth = Math.max(
        moreMeasureEl ? moreMeasureEl.getBoundingClientRect().width : 0,
        moreActiveMeasureEl ? moreActiveMeasureEl.getBoundingClientRect().width : 0
      );
      const moreWidth = Math.max(measuredMoreWidth, MORE_BUTTON_MIN_WIDTH);

      const tabElements = measureChildren.slice(0, navTabs.length);
      const tabWidths = navTabs.map((tab, idx) => {
        const measured = tabElements[idx]?.getBoundingClientRect().width || 0;
        return Math.max(measured, TAB_MIN_WIDTHS[tab.id] || 100);
      });

      const GAP = 4;
      const totalAllWidth = tabWidths.reduce(
        (acc, w, idx) => acc + w + (idx > 0 ? GAP : 0),
        0
      );

      // Require clear breathing room on desktop before rendering all 8 tabs inline
      if (availableWidth >= totalAllWidth + 16) {
        setVisibleCount(navTabs.length);
        return;
      }

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

      setVisibleCount(Math.min(navTabs.length - 1, Math.max(1, count)));
    };

    const rafId = window.requestAnimationFrame(calculateOverflow);
    const resizeObserver = new ResizeObserver(() => calculateOverflow());
    if (tabStripRef.current) {
      resizeObserver.observe(tabStripRef.current);
    }
    window.addEventListener("resize", calculateOverflow);
    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateOverflow);
    };
  }, [navTabs]);

  const handleDefaultExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    const reqs = getClinicalRequirements();
    exportClinicalCsv(
      reqs.map((r) => ({
        RequirementID: r.id,
        Client: r.clientName,
        Agency: r.agencyName,
        Program: r.programName,
        Service: r.serviceName,
        VisitType: r.visitType,
        RequiredProfessional: r.professionalType,
        AssignedProfessional: r.assignedProfessionalName || "Unassigned",
        NextDueDate: r.nextDueDate,
        RequirementStatus: r.status,
        DocumentationStatus: r.documentationStatus,
        ReviewStatus: r.reviewStatus,
      })),
      "lilisare-clinical-requirements.csv"
    );
    toast.success(`Exported ${reqs.length} clinical & supervisory records to CSV`);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setKpi(getClinicalKpiSummary());
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Clinical & supervisory oversight data synchronized");
    }, 350);
  };

  const visibleTabs = navTabs.slice(0, visibleCount);
  const overflowTabs = navTabs.slice(visibleCount);
  const isOverflowActive = overflowTabs.some((t) => t.id === derivedActiveTab);
  const activeOverflowTab = overflowTabs.find((t) => t.id === derivedActiveTab);

  return (
    <div className="w-full min-w-0 space-y-4 mb-5">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            title="Synchronize clinical data"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            type="button"
            onClick={handleDefaultExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          {canManageRules && (
            <Link
              href="/admin/clinical/rules/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>Configure Rules</span>
            </Link>
          )}

          {canCreateReq && (
            <Link
              href="/admin/clinical/requirements/new/"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Visit Requirement</span>
            </Link>
          )}
        </div>
      </div>

      {/* Space-Aware Responsive Tab Strip */}
      <div ref={stripOuterRef} className="relative w-full min-w-0">
        {/* In-bounds zero-height measurement row matching font-bold active tab size */}
        <div
          aria-hidden="true"
          className="h-0 overflow-hidden invisible pointer-events-none w-full min-w-0"
        >
          <div
            ref={measureContainerRef}
            className="inline-flex items-center gap-1 whitespace-nowrap"
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div
                  key={`measure-${tab.id}`}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap rounded-xl shrink-0"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count !== undefined && tab.badge === undefined && (
                    <span className="text-[11px] font-medium">({tab.count})</span>
                  )}
                </div>
              );
            })}
            <div className="px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap rounded-xl flex items-center gap-1.5 border shrink-0">
              <span>MORE (8)</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            <div className="px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap rounded-xl flex items-center gap-1.5 border shrink-0">
              <span className="truncate max-w-[130px] sm:max-w-[180px]">
                MORE: Overdue &amp; Follow-up
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Dynamic Strip (overflow-hidden guarantees zero horizontal scrollbars across viewports) */}
        <div
          ref={tabStripRef}
          role="tablist"
          aria-label="Clinical & Supervisory navigation"
          className="relative w-full min-w-0 bg-white shadow-2xs rounded-xl lg:rounded-2xl border border-slate-200 p-1.5 flex items-center gap-1 flex-nowrap overflow-hidden"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = derivedActiveTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                onClick={() => setIsMoreOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 cursor-pointer ${isActive
                  ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20 font-bold"
                  : "font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${isActive
                      ? "bg-white/20 text-white"
                      : tab.badgeColor || "bg-slate-200 text-slate-700"
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && tab.badge === undefined && (
                  <span
                    className={`text-[11px] font-medium shrink-0 ${isActive ? "text-emerald-100" : "text-slate-400"
                      }`}
                  >
                    ({tab.count})
                  </span>
                )}
              </Link>
            );
          })}

          {overflowTabs.length > 0 && (
            <button
              type="button"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              aria-expanded={isMoreOpen}
              aria-label="More clinical navigation tabs"
              className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${isOverflowActive
                ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
                : isMoreOpen
                  ? "bg-slate-100 text-slate-900 border border-slate-300"
                  : "text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:text-slate-900"
                }`}
            >
              <span className="truncate max-w-[130px] sm:max-w-[180px]">
                {isOverflowActive && activeOverflowTab
                  ? `MORE: ${activeOverflowTab.label}`
                  : `MORE (${overflowTabs.length})`}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""
                  }`}
              />
            </button>
          )}
        </div>

        {/* Overflow Dropdown Popover anchored cleanly within strip bounds */}
        {overflowTabs.length > 0 && isMoreOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 p-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Additional Views</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                {overflowTabs.length} tabs
              </span>
            </div>
            <div className="py-1 max-h-80 overflow-y-auto space-y-0.5">
              {overflowTabs.map((tab) => {
                const Icon = tab.icon;
                const isTabActive = derivedActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      router.push(tab.href);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors cursor-pointer ${isTabActive
                      ? "bg-[#3D6B22]/10 text-[#3D6B22] font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${isTabActive ? "text-[#3D6B22]" : "text-slate-400"
                          }`}
                      />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${tab.badgeColor || "bg-slate-200 text-slate-700"
                          }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                    {tab.count !== undefined && tab.badge === undefined && (
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">
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
    </div>
  );
}
