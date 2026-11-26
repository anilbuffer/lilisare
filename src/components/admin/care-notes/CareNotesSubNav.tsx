"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import {
  getCareNotesFromStorage,
  getCareNotesKpiSummary,
  exportCareNotesCsv,
  CARE_NOTES_SYNC_EVENT,
} from "@/lib/admin/careNotesStore";
import { toast } from "sonner";

interface CareNotesSubNavProps {
  title?: string;
  description?: string;
}

export function CareNotesSubNav({
  title = "CareNotes",
  description = "Monitor care documentation, review submitted notes and manage documentation quality across your agency.",
}: CareNotesSubNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [kpi, setKpi] = useState(() => getCareNotesKpiSummary());
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Sub-navigation tabs
  const navTabs = [
    {
      id: "overview",
      label: "Overview",
      href: "/admin/care-notes",
      icon: FileText,
      active: pathname === "/admin/care-notes" || pathname === "/admin/care-notes/",
    },
    {
      id: "all",
      label: "All Notes",
      href: "/admin/care-notes/all",
      icon: ListFilter,
      count: kpi.totalNotes,
      active: pathname.startsWith("/admin/care-notes/all"),
    },
    {
      id: "review",
      label: "Review Queue",
      href: "/admin/care-notes/review",
      icon: Inbox,
      badge: kpi.pendingReviewCount > 0 ? kpi.pendingReviewCount : undefined,
      badgeColor: "bg-amber-100 text-amber-800 border border-amber-200/80",
      active: pathname.startsWith("/admin/care-notes/review"),
    },
    {
      id: "corrections",
      label: "Correction Requests",
      href: "/admin/care-notes/corrections",
      icon: AlertTriangle,
      badge: kpi.needsCorrectionCount > 0 ? kpi.needsCorrectionCount : undefined,
      badgeColor: "bg-rose-100 text-rose-700 border border-rose-200/80",
      active: pathname.startsWith("/admin/care-notes/corrections"),
    },
    {
      id: "rules",
      label: "Documentation Rules",
      href: "/admin/care-notes/rules",
      icon: Sliders,
      active: pathname.startsWith("/admin/care-notes/rules"),
    },
    {
      id: "templates",
      label: "Note Templates",
      href: "/admin/care-notes/templates",
      icon: FileCode,
      active: pathname.startsWith("/admin/care-notes/templates"),
    },
    {
      id: "reports",
      label: "Quality & Reports",
      href: "/admin/care-notes/reports",
      icon: BarChart3,
      active: pathname.startsWith("/admin/care-notes/reports"),
    },
    {
      id: "audit",
      label: "Audit History",
      href: "/admin/care-notes/audit",
      icon: History,
      active: pathname.startsWith("/admin/care-notes/audit"),
    },
  ];

  return (
    <div className="w-full space-y-6 mb-4">
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

          <Link
            href="/admin/care-notes/rules"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Documentation Rules</span>
          </Link>
        </div>
      </div>

      {/* 02. Separate Standalone Cards Bar with Tabs (Free from header) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${tab.active
                ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
            >
              <Icon className={`w-4 h-4 ${tab.active ? "text-white" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tab.active ? "bg-white/20 text-white" : tab.badgeColor || "bg-slate-200 text-slate-700"
                    }`}
                >
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && !tab.badge && (
                <span className={`text-[11px] font-medium ${tab.active ? "text-emerald-100" : "text-slate-400"}`}>
                  ({tab.count})
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
