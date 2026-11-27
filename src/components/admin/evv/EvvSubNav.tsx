"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  ListFilter,
  AlertTriangle,
  Send,
  Download,
  Calendar,
  ChevronDown,
  Globe,
} from "lucide-react";
import { exportEvvVisitsCsv, getEvvVisitsFromStorage } from "@/lib/admin/evvVisitsStore";
import { toast } from "sonner";

interface EvvSubNavProps {
  activeTabOverride?: "overview" | "visits" | "exceptions" | "submissions";
  onTabChange?: (tab: "overview" | "visits") => void;
  exceptionCount?: number;
  totalVisitsCount?: number;
  selectedJurisdiction?: string;
  onJurisdictionChange?: (jurisdiction: string) => void;
  selectedDateFilter?: string;
  onDateFilterChange?: (dateFilter: string) => void;
}

export function EvvSubNav({
  activeTabOverride,
  onTabChange,
  exceptionCount = 6,
  totalVisitsCount = 11,
  selectedJurisdiction: propJurisdiction,
  onJurisdictionChange,
  selectedDateFilter: propDateFilter,
  onDateFilterChange,
}: EvvSubNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlJurisdiction = searchParams.get("jurisdiction");
  const urlDateFilter = searchParams.get("dateRange");

  const [jurisdictionState, setJurisdictionState] = useState(
    propJurisdiction ?? urlJurisdiction ?? "All Jurisdictions"
  );
  const [dateFilterState, setDateFilterState] = useState(
    propDateFilter ?? urlDateFilter ?? "Today & Recent"
  );

  useEffect(() => {
    if (propJurisdiction !== undefined) {
      setJurisdictionState(propJurisdiction);
    } else if (urlJurisdiction) {
      setJurisdictionState(urlJurisdiction);
    }
  }, [propJurisdiction, urlJurisdiction]);

  useEffect(() => {
    if (propDateFilter !== undefined) {
      setDateFilterState(propDateFilter);
    } else if (urlDateFilter) {
      setDateFilterState(urlDateFilter);
    }
  }, [propDateFilter, urlDateFilter]);

  const currentJurisdiction = propJurisdiction ?? jurisdictionState;
  const currentDateFilter = propDateFilter ?? dateFilterState;

  // Determine which tab is active
  const isExactVisits = pathname === "/admin/evv-visits" || pathname === "/admin/evv-visits/";
  const currentView = searchParams.get("view");

  let activeTab: "overview" | "visits" | "exceptions" | "submissions" = "overview";

  if (activeTabOverride) {
    activeTab = activeTabOverride;
  } else if (pathname.startsWith("/admin/evv-visits/exceptions")) {
    activeTab = "exceptions";
  } else if (
    pathname.startsWith("/admin/evv-visits/submissions") ||
    pathname.startsWith("/admin/evv-visits/rules")
  ) {
    activeTab = "submissions";
  } else if (isExactVisits) {
    activeTab = currentView === "grid" || currentView === "visits" ? "visits" : "overview";
  }

  const handleJurisdictionSelect = (val: string) => {
    setJurisdictionState(val);
    if (onJurisdictionChange) {
      onJurisdictionChange(val);
    }
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "All Jurisdictions") {
      params.set("jurisdiction", val);
    } else {
      params.delete("jurisdiction");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleDateFilterSelect = (val: string) => {
    setDateFilterState(val);
    if (onDateFilterChange) {
      onDateFilterChange(val);
    }
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "Today & Recent") {
      params.set("dateRange", val);
    } else {
      params.delete("dateRange");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const buildNavHref = (basePath: string, viewParam?: string) => {
    const params = new URLSearchParams();
    if (viewParam) params.set("view", viewParam);
    if (currentJurisdiction && currentJurisdiction !== "All Jurisdictions") {
      params.set("jurisdiction", currentJurisdiction);
    }
    if (currentDateFilter && currentDateFilter !== "Today & Recent") {
      params.set("dateRange", currentDateFilter);
    }
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const handleExport = () => {
    const visits = getEvvVisitsFromStorage();
    // Filter visits based on current active jurisdiction and date
    const filteredForExport = visits.filter((v) => {
      if (currentJurisdiction && currentJurisdiction !== "All Jurisdictions") {
        if (currentJurisdiction === "Ohio Medicaid (ODM)") {
          const isOh = v.payerName?.includes("Ohio") || v.payerName?.includes("OH") || v.program?.includes("Ohio") || v.aggregator === "Sandata";
          if (!isOh) return false;
        } else if (currentJurisdiction === "NJ FamilyCare") {
          const isNj = v.payerName?.includes("NJ") || v.payerName?.includes("New Jersey") || v.program?.includes("NJ") || v.aggregator === "HHAeXchange";
          if (!isNj) return false;
        } else if (currentJurisdiction === "Florida AHCA") {
          const isFl = v.payerName?.includes("Florida") || v.payerName?.includes("FL") || v.program?.includes("Florida") || v.aggregator === "Netsmart";
          if (!isFl) return false;
        } else if (currentJurisdiction === "Private Pay / Commercial") {
          const isPvt = v.payerName?.includes("Private") || v.payerName?.includes("Commercial") || v.program?.includes("Private") || v.aggregator === "CareBridge";
          if (!isPvt) return false;
        }
      }

      if (currentDateFilter && currentDateFilter !== "Today & Recent") {
        if (currentDateFilter === "Today (Nov 25, 2026)") {
          const isToday = v.date === "2026-11-25" || v.visitStatusBadge?.toLowerCase().includes("today");
          if (!isToday) return false;
        } else if (currentDateFilter === "Yesterday (Nov 24, 2026)") {
          const isYesterday = v.date === "2026-11-24" || v.visitStatusBadge?.toLowerCase().includes("yesterday");
          if (!isYesterday) return false;
        }
      }
      return true;
    });

    exportEvvVisitsCsv(filteredForExport);
    toast.success("EVV Report Exported", {
      description: `Downloaded ${filteredForExport.length} filtered visit records to CSV.`,
    });
  };

  const navItems = [
    {
      id: "overview" as const,
      title: "EVV Overview",
      subtitle: "Compliance & trends",
      icon: LayoutGrid,
      href: buildNavHref("/admin/evv-visits", "overview"),
      isActive: activeTab === "overview",
      badge: null,
      onClick: () => {
        if (onTabChange) {
          onTabChange("overview");
        } else {
          router.push(buildNavHref("/admin/evv-visits", "overview"));
        }
      },
    },
    {
      id: "visits" as const,
      title: "All Visits",
      subtitle: "Unified operational grid",
      icon: ListFilter,
      href: buildNavHref("/admin/evv-visits", "visits"),
      isActive: activeTab === "visits",
      badge: totalVisitsCount,
      badgeColor: "bg-slate-100 text-slate-700",
      activeBadgeColor: "bg-white/20 text-white",
      onClick: () => {
        if (onTabChange) {
          onTabChange("visits");
        } else {
          router.push(buildNavHref("/admin/evv-visits", "visits"));
        }
      },
    },
    {
      id: "exceptions" as const,
      title: "Exceptions",
      subtitle: "Guided resolution queue",
      icon: AlertTriangle,
      href: buildNavHref("/admin/evv-visits/exceptions"),
      isActive: activeTab === "exceptions",
      badge: exceptionCount,
      badgeColor: "bg-rose-50 text-rose-700 border border-rose-200",
      activeBadgeColor: "bg-rose-500 text-white",
      onClick: () => {
        router.push(buildNavHref("/admin/evv-visits/exceptions"));
      },
    },
    {
      id: "submissions" as const,
      title: "Aggregator & Billing",
      subtitle: "Submission, holds & rules",
      icon: Send,
      href: buildNavHref("/admin/evv-visits/submissions"),
      isActive: activeTab === "submissions",
      badge: null,
      onClick: () => {
        router.push(buildNavHref("/admin/evv-visits/submissions"));
      },
    },
  ];

  return (
    <div className="w-full space-y-4 mb-6">
      {/* Top Header Row with Title, Badge, Dropdowns, and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            EVV & Visits
          </h1>
          {exceptionCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {exceptionCount} Open Exceptions
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Jurisdiction Dropdown */}
          <div className="relative">
            <select
              value={currentJurisdiction}
              onChange={(e) => handleJurisdictionSelect(e.target.value)}
              className="appearance-none pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 shadow-[0_6px_32px_rgba(0,0,0,0.06)] cursor-pointer"
            >
              <option value="All Jurisdictions">All Jurisdictions</option>
              <option value="Ohio Medicaid (ODM)">Ohio Medicaid (ODM)</option>
              <option value="NJ FamilyCare">NJ FamilyCare</option>
              <option value="Florida AHCA">Florida AHCA</option>
              <option value="Private Pay / Commercial">Private Pay / Commercial</option>
            </select>
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <select
              value={currentDateFilter}
              onChange={(e) => handleDateFilterSelect(e.target.value)}
              className="appearance-none pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 shadow-[0_6px_32px_rgba(0,0,0,0.06)] cursor-pointer"
            >
              <option value="Today & Recent">Today & Recent</option>
              <option value="Today (Nov 25, 2026)">Today (Nov 25, 2026)</option>
              <option value="Yesterday (Nov 24, 2026)">Yesterday (Nov 24, 2026)</option>
              <option value="Past 7 Days">Past 7 Days</option>
              <option value="Current Pay Period">Current Pay Period</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Standardized Main Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer ${item.isActive
                ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-md shadow-[#3D6B22]/20"
                : "bg-white text-slate-800 border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 hover:bg-slate-50/70 hover:-translate-y-0.5"
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-bold tracking-tight truncate ${item.isActive ? "text-white" : "text-slate-900"
                      }`}
                  >
                    {item.title}
                  </div>
                  <div
                    className={`text-[10px] sm:text-[11px] font-medium truncate mt-0.5 ${item.isActive ? "text-emerald-100" : "text-slate-500"
                      }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.badge !== null && (
                <span
                  className={`ml-2 shrink-0 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${item.isActive
                    ? "bg-white/25 text-white"
                    : item.badgeColor
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
