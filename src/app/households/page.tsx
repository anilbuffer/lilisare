"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Heart,
  ShieldCheck,
  Calendar,
  Clock,
  Search,
  Plus,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  Check,
  Kanban,
  List,
  FilterX,
  FileCheck2,
  Archive,
  Inbox,
  Filter,
} from "lucide-react";
import { MOCK_HOUSEHOLDS, Household, getHouseholdsFromStorage } from "@/lib/households/mockData";
import { toast } from "sonner";

export type HouseholdKanbanStage =
  | "Intake & Discovery"
  | "Onboarding & Docs"
  | "Pending Authorization"
  | "Care Active"
  | "On Hold / Inactive";

export const HOUSEHOLD_KANBAN_STAGES: {
  id: HouseholdKanbanStage;
  title: string;
  icon: React.ElementType;
  badge: {
    bg: string;
    text: string;
    border: string;
    dot: string;
    headerBadge: string;
  };
}[] = [
  {
    id: "Intake & Discovery",
    title: "Intake & Discovery",
    icon: Sparkles,
    badge: {
      bg: "bg-sky-50",
      text: "text-sky-800",
      border: "border-sky-200",
      dot: "bg-sky-600",
      headerBadge: "bg-sky-100 text-sky-800 border-sky-200",
    },
  },
  {
    id: "Onboarding & Docs",
    title: "Onboarding & Docs",
    icon: Clock,
    badge: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-500",
      headerBadge: "bg-amber-100 text-amber-800 border-amber-200",
    },
  },
  {
    id: "Pending Authorization",
    title: "Pending Auth",
    icon: FileCheck2,
    badge: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      dot: "bg-purple-500",
      headerBadge: "bg-purple-100 text-purple-800 border-purple-200",
    },
  },
  {
    id: "Care Active",
    title: "Care Active",
    icon: CheckCircle2,
    badge: {
      bg: "bg-[#E3F1D9]",
      text: "text-[#1E5622]",
      border: "border-[#3D6B22]/20",
      dot: "bg-[#3D6B22]",
      headerBadge: "bg-[#E8F2E4] text-[#1E5622] border-[#93C573]/30",
    },
  },
  {
    id: "On Hold / Inactive",
    title: "On Hold / Inactive",
    icon: Archive,
    badge: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
      headerBadge: "bg-slate-200 text-slate-700 border-slate-300",
    },
  },
];

const STAGE_CONFIG_MAP = new Map(
  HOUSEHOLD_KANBAN_STAGES.map((col) => [col.id, col])
);

export function resolveHouseholdStage(
  hh: Household,
  overrides: Record<string, HouseholdKanbanStage>
): HouseholdKanbanStage {
  if (overrides[hh.id]) {
    return overrides[hh.id];
  }
  if (
    hh.authStatus === "Expired" ||
    hh.triJourneyStatus.bottleneckMessage?.toLowerCase().includes("hold") ||
    hh.triJourneyStatus.bottleneckMessage?.toLowerCase().includes("delayed")
  ) {
    return "On Hold / Inactive";
  }
  if (hh.triJourneyStatus.clientStage === "Care Active" && hh.authStatus === "Approved") {
    return "Care Active";
  }
  if (
    hh.authStatus === "Pending Review" ||
    hh.authStatus === "Expiring Soon" ||
    hh.triJourneyStatus.clientStage === "Authorized" ||
    hh.triJourneyStatus.clientStage === "Assessment"
  ) {
    return "Pending Authorization";
  }
  if (hh.triJourneyStatus.clientStage === "Registered") {
    return "Onboarding & Docs";
  }
  if (hh.triJourneyStatus.clientStage === "Inquiry") {
    return "Intake & Discovery";
  }
  return "On Hold / Inactive";
}

export default function HouseholdsPage() {
  const router = useRouter();

  const [householdsList, setHouseholdsList] = useState<Household[]>(MOCK_HOUSEHOLDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [stageOverrides, setStageOverrides] = useState<Record<string, HouseholdKanbanStage>>({});

  // Dropdown states for header controls & stage filters
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("30d");
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [draggedHouseholdId, setDraggedHouseholdId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<HouseholdKanbanStage | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const dateRef = useRef<HTMLDivElement>(null);
  const stageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHouseholdsList(getHouseholdsFromStorage());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
      if (stageDropdownRef.current && !stageDropdownRef.current.contains(event.target as Node)) {
        setIsStageDropdownOpen(false);
      }
      if (activeMenuId) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  const dateOptions = [
    { id: "30d", label: "Last 30 Days" },
    { id: "7d", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "all", label: "All Active Records" },
  ];

  // Filter logic
  const filteredHouseholds = useMemo(() => {
    return householdsList.filter((hh) => {
      const stage = resolveHouseholdStage(hh, stageOverrides);

      // Tab filter
      if (selectedTab === "STUCK") {
        const isStuck =
          Boolean(hh.triJourneyStatus.bottleneckMessage) ||
          hh.authStatus === "Expired" ||
          hh.authStatus === "Expiring Soon" ||
          hh.authStatus === "Pending Review";
        if (!isStuck) return false;
      } else if (selectedTab !== "ALL") {
        if (stage !== selectedTab) {
          return false;
        }
      }

      // Program filter
      if (selectedProgram !== "all" && hh.program !== selectedProgram) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = hh.name.toLowerCase().includes(query);
        const matchesClient = hh.client.name.toLowerCase().includes(query);
        const matchesCaregiver = hh.primaryCaregiver.name.toLowerCase().includes(query);
        const matchesCode = hh.code.toLowerCase().includes(query);
        const matchesCity = hh.city.toLowerCase().includes(query);

        if (!matchesName && !matchesClient && !matchesCaregiver && !matchesCode && !matchesCity) {
          return false;
        }
      }

      return true;
    });
  }, [householdsList, searchQuery, selectedProgram, selectedTab, stageOverrides]);

  const isFiltered = searchQuery !== "" || selectedProgram !== "all" || selectedTab !== "ALL";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProgram("all");
    setSelectedTab("ALL");
  };

  // Move household between stages (drag & drop or quick menu)
  const handleMoveStage = (householdId: string, targetStage: HouseholdKanbanStage) => {
    const targetHh = householdsList.find((h) => h.id === householdId);
    if (!targetHh) return;

    const currentStage = resolveHouseholdStage(targetHh, stageOverrides);
    if (currentStage === targetStage) return;

    setStageOverrides((prev) => ({
      ...prev,
      [householdId]: targetStage,
    }));
    setActiveMenuId(null);
    toast.success(`Moved ${targetHh.name} to "${targetStage}"`);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedHouseholdId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stage: HouseholdKanbanStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: HouseholdKanbanStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const householdId = e.dataTransfer.getData("text/plain") || draggedHouseholdId;
    if (householdId) {
      handleMoveStage(householdId, targetStage);
    }
    setDraggedHouseholdId(null);
  };

  const getAuthBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-[#E3F1D9] text-[#1E5622] border-[#3D6B22]/20";
      case "Expiring Soon":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Pending Review":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Expired":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const currentStageFilter: HouseholdKanbanStage | null =
    selectedTab !== "ALL" && selectedTab !== "STUCK" && HOUSEHOLD_KANBAN_STAGES.some((s) => s.id === selectedTab)
      ? (selectedTab as HouseholdKanbanStage)
      : null;

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Standardized Page Header matching /intake/pipeline & /clients */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Households & Family Units
          </h1>
        </div>

        {/* Action Controls & Journey Cross-Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Filter */}
          <div className="relative" ref={dateRef}>
            <button
              type="button"
              onClick={() => setIsDateOpen(!isDateOpen)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateOptions.find((d) => d.id === selectedDateRange)?.label || "Date Range"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isDateOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedDateRange(opt.id);
                      setIsDateOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between cursor-pointer ${
                      selectedDateRange === opt.id
                        ? "bg-[#F2F8EE] text-[#3D6B22] font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedDateRange === opt.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Register Household CTA (Dedicated Action) */}
          <Link
            href="/households/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3D6B22] hover:bg-[#345C1D] text-white text-xs font-bold rounded-xl shadow-[0_4px_16px_rgba(61,107,34,0.25)] transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Register Household</span>
          </Link>
        </div>
      </header>

      {/* 02. KPI Stats Strip - Uniform styling matching /intake/pipeline & /clients */}
      <section aria-label="Household Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          {
            id: "ALL",
            label: "Total Households",
            value: householdsList.length.toLocaleString(),
            icon: Home,
            iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
          },
          {
            id: "Care Active",
            label: "Active Care Units",
            value: householdsList.filter((h) => resolveHouseholdStage(h, stageOverrides) === "Care Active").length.toLocaleString(),
            icon: Heart,
            iconBg: "bg-[#E3F1D9] text-[#1E5622]",
          },
          {
            id: "Onboarding & Docs",
            label: "In Onboarding",
            value: householdsList.filter((h) => resolveHouseholdStage(h, stageOverrides) === "Onboarding & Docs").length.toLocaleString(),
            icon: Clock,
            iconBg: "bg-amber-100 text-amber-800",
          },
          {
            id: "STUCK",
            label: "Needs Attention",
            value: householdsList.filter(
              (h) =>
                Boolean(h.triJourneyStatus.bottleneckMessage) ||
                h.authStatus === "Expired" ||
                h.authStatus === "Expiring Soon" ||
                h.authStatus === "Pending Review"
            ).length.toLocaleString(),
            icon: AlertTriangle,
            iconBg: "bg-rose-100 text-rose-700",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          const isSelected = selectedTab === kpi.id;

          return (
            <button
              key={kpi.id}
              type="button"
              onClick={() => setSelectedTab(selectedTab === kpi.id ? "ALL" : kpi.id)}
              className={`group text-left focus:outline-none cursor-pointer w-full bg-white backdrop-blur-xl rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-gradient-to-b from-[#F2F8EE]/70 via-white to-white shadow-[0_8px_30px_rgba(61,107,34,0.12)] -translate-y-0.5"
                  : "border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:border-[#3D6B22]/60"
              }`}
            >
              {/* Top row: Label & Animated Icon Container */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 tracking-tight truncate pr-1">
                  {kpi.label}
                </span>
                <div
                  className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0 ${kpi.iconBg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Metric Value & Hover Glow Arrow */}
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                  {kpi.value}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </section>

      {/* 03. Household Management Workspace Card (Strict consistency with /intake/pipeline) */}
      <section aria-label="Household Management Workspace">
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-5">
          {/* Workspace Toolbar Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Household Management
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Input */}
              <div className="relative w-full sm:w-64 md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search household, client, caregiver, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-xs"
                />
              </div>

              {/* Program Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all cursor-pointer"
                >
                  <option value="all">All Care Programs</option>
                  <option value="Pediatric In-Home">Pediatric In-Home</option>
                  <option value="Medicaid Waiver">Medicaid Waiver</option>
                  <option value="Senior Community Care">Senior Community Care</option>
                </select>
              </div>

              {/* Stage Filter Dropdown */}
              <div className="relative" ref={stageDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsStageDropdownOpen(!isStageDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  title="Filter households by stage"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-400 font-normal hidden sm:inline">Stage:</span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-900 truncate max-w-[130px]">
                    {currentStageFilter ? (
                      <>
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            STAGE_CONFIG_MAP.get(currentStageFilter)?.badge.dot || "bg-slate-400"
                          }`}
                        />
                        <span className="truncate">
                          {STAGE_CONFIG_MAP.get(currentStageFilter)?.title}
                        </span>
                      </>
                    ) : (
                      "All Stages"
                    )}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isStageDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isStageDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
                      <span>Filter by Stage</span>
                      {selectedTab !== "ALL" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTab("ALL");
                            setIsStageDropdownOpen(false);
                          }}
                          className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTab("ALL");
                          setIsStageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          selectedTab === "ALL"
                            ? "bg-slate-50 font-bold text-slate-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>All Stages</span>
                        {selectedTab === "ALL" && (
                          <Check className="w-3.5 h-3.5 text-[#3D6B22]" />
                        )}
                      </button>

                      {HOUSEHOLD_KANBAN_STAGES.map((s) => {
                        const isSelected = selectedTab === s.id;
                        const count = householdsList.filter(
                          (h) => resolveHouseholdStage(h, stageOverrides) === s.id
                        ).length;

                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedTab(s.id);
                              setIsStageDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-slate-50 font-bold text-slate-900"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${s.badge.dot}`} />
                              <span>{s.title}</span>
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* View Switcher: Kanban vs List */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === "kanban"
                      ? "bg-white text-[#3D6B22] shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Kanban Board View"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white text-[#3D6B22] shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  title="Clear all active filters"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Content Area: Proper Kanban Board View vs List View */}
          {viewMode === "kanban" ? (
            /* KANBAN BOARD VIEW (5 Columns with clean, scannable household cards) */
            <div className="w-full overflow-x-auto pb-3 pt-1 no-scrollbar sm:scrollbar-thin">
              <div className="flex gap-3.5 min-w-[1250px] items-start">
                {HOUSEHOLD_KANBAN_STAGES.map((col) => {
                  const columnHouseholds = filteredHouseholds.filter(
                    (h) => resolveHouseholdStage(h, stageOverrides) === col.id
                  );
                  const isDragOver = dragOverStage === col.id;
                  const isFilteredStage = selectedTab === col.id;

                  return (
                    <div
                      key={col.id}
                      onDragOver={(e) => handleDragOver(e, col.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, col.id)}
                      className={`w-[275px] shrink-0 flex flex-col rounded-2xl border transition-all duration-300 ${
                        isDragOver
                          ? "bg-emerald-50/70 border-[#3D6B22] ring-2 ring-[#3D6B22]/30 shadow-md"
                          : isFilteredStage
                          ? "bg-[#EEF4F0] border-[#3D6B22]/60 ring-1 ring-[#3D6B22]/20"
                          : "bg-[#F8FAF9] border-slate-200/80"
                      }`}
                    >
                      {/* Lane Header */}
                      <div className="p-3 border-b border-slate-200/60 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${col.badge.dot}`} />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 truncate">
                            {col.title}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 bg-white ${col.badge.text} ${col.badge.border} shadow-2xs`}
                        >
                          {columnHouseholds.length}
                        </span>
                      </div>

                      {/* Cards Stack */}
                      <div className="p-2.5 space-y-2.5 min-h-[440px] flex flex-col">
                        {columnHouseholds.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-300/70 rounded-xl text-center bg-white/40">
                            <Inbox className="w-5 h-5 text-slate-300 mb-1" />
                            <span className="text-xs font-medium text-slate-400">
                              No households in stage
                            </span>
                          </div>
                        ) : (
                          columnHouseholds.map((hh) => {
                            const isDragging = draggedHouseholdId === hh.id;
                            const isUrgent =
                              hh.authStatus === "Expiring Soon" ||
                              hh.authStatus === "Expired" ||
                              Boolean(hh.triJourneyStatus.bottleneckMessage);

                            return (
                              <div
                                key={hh.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, hh.id)}
                                onClick={() => router.push(`/households/${hh.id}`)}
                                className={`group text-left focus:outline-none cursor-pointer w-full bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#3D6B22]/50 transition-all duration-200 relative overflow-hidden flex flex-col justify-between select-none ${
                                  isDragging ? "opacity-40 scale-95 ring-2 ring-[#3D6B22]" : ""
                                }`}
                              >
                                <div>
                                  {/* Row 1: Household Name & Code */}
                                  <div className="flex items-start justify-between gap-1.5 mb-1">
                                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#3D6B22] transition-colors leading-tight truncate flex-1">
                                      {hh.name}
                                    </h4>
                                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                      {hh.code}
                                    </span>
                                  </div>

                                  {/* Row 2: Connected Members (Clean single line) */}
                                  <p className="text-xs text-slate-500 truncate">
                                    {hh.client.name} <span className="text-slate-300">·</span> {hh.primaryCaregiver.name}
                                  </p>

                                  {/* Row 3: Tags (Program & Hours) */}
                                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                                    <span className="text-[10px] font-medium text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md truncate max-w-[170px]">
                                      {hh.program}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                                      {hh.authorizedHoursPerWeek}h/wk
                                    </span>
                                  </div>
                                </div>

                                {/* Footer: Case Manager · Auth Status & Quick Move */}
                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                  <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${getAuthBadge(
                                        hh.authStatus
                                      )}`}
                                    >
                                      {hh.authStatus}
                                    </span>
                                    <span className="truncate text-slate-400 text-[11px]">
                                      {hh.caseManager.name.split(" ")[0]}
                                    </span>
                                  </div>

                                  <div
                                    className="flex items-center gap-1 shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Quick Move Stage dropdown */}
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActiveMenuId(
                                            activeMenuId === hh.id ? null : hh.id
                                          )
                                        }
                                        title="Move to another stage"
                                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </button>

                                      {activeMenuId === hh.id && (
                                        <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                                          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                            Move Stage
                                          </div>
                                          {HOUSEHOLD_KANBAN_STAGES.map((s) => {
                                            const isCurrent =
                                              resolveHouseholdStage(hh, stageOverrides) === s.id;
                                            return (
                                              <button
                                                key={s.id}
                                                type="button"
                                                onClick={() =>
                                                  handleMoveStage(hh.id, s.id)
                                                }
                                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                                              >
                                                <span className="flex items-center gap-1.5">
                                                  <span
                                                    className={`w-1.5 h-1.5 rounded-full ${s.badge.dot}`}
                                                  />
                                                  <span>{s.title}</span>
                                                </span>
                                                {isCurrent && (
                                                  <Check className="w-3.5 h-3.5 text-[#3D6B22]" />
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    {/* ArrowUpRight hover indicator */}
                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 opacity-60 group-hover:opacity-100 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* LIST VIEW (Clean, scannable table matching Intake List view) */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Household</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Care Recipient</th>
                      <th className="py-3 px-4">Caregiver</th>
                      <th className="py-3 px-4">Program</th>
                      <th className="py-3 px-4">Auth Status</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4">Hours</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredHouseholds.map((hh) => {
                      const stage = resolveHouseholdStage(hh, stageOverrides);
                      const stageConfig = STAGE_CONFIG_MAP.get(stage);

                      return (
                        <tr
                          key={hh.id}
                          onClick={() => router.push(`/households/${hh.id}`)}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors text-xs">
                              {hh.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 ml-1.5">
                              {hh.code}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs">
                            {hh.city}, {hh.state}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800 text-xs">
                            {hh.client.name}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800 text-xs">
                            {hh.primaryCaregiver.name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                              {hh.program}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getAuthBadge(
                                hh.authStatus
                              )}`}
                            >
                              {hh.authStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                stageConfig?.badge.bg ?? "bg-slate-100"
                              } ${stageConfig?.badge.text ?? "text-slate-700"} ${
                                stageConfig?.badge.border ?? "border-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  stageConfig?.badge.dot ?? "bg-slate-400"
                                }`}
                              />
                              <span>{stageConfig?.title ?? stage}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800 text-xs">
                            {hh.authorizedHoursPerWeek}h/wk
                          </td>
                          <td
                            className="py-3 px-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={`/households/${hh.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#F2F8EE] border border-slate-200 hover:border-[#3D6B22]/40 text-slate-700 hover:text-[#3D6B22] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                            >
                              <span>Details</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#3D6B22]" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
