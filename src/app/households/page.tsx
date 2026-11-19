"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
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
  CheckCircle2,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  Check,
  LayoutGrid,
  List,
  FilterX,
  FileWarning,
  UserCheck,
  ClipboardCheck,
} from "lucide-react";
import { MOCK_HOUSEHOLDS, Household } from "@/lib/households/mockData";
import { toast } from "sonner";

export default function HouseholdsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  // Dropdown states for header controls (matching /intake/pipeline & /clients)
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("30d");

  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateOptions = [
    { id: "30d", label: "Last 30 Days" },
    { id: "7d", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "all", label: "All Active Records" },
  ];

  // Tab definitions
  const tabs = [
    { id: "ALL", label: "All Households", count: MOCK_HOUSEHOLDS.length },
    {
      id: "CARE_ACTIVE",
      label: "Care Active",
      count: MOCK_HOUSEHOLDS.filter((h) => h.triJourneyStatus.clientStage === "Care Active").length,
    },
    {
      id: "ONBOARDING",
      label: "In Onboarding",
      count: MOCK_HOUSEHOLDS.filter((h) => h.triJourneyStatus.clientStage !== "Care Active").length,
    },
    {
      id: "PENDING_AUTH",
      label: "Pending Auth",
      count: MOCK_HOUSEHOLDS.filter((h) => h.authStatus !== "Approved").length,
    },
    {
      id: "STUCK",
      label: "Delayed & Stuck",
      count: MOCK_HOUSEHOLDS.filter(
        (h) =>
          Boolean(h.triJourneyStatus.bottleneckMessage) ||
          h.authStatus === "Expired" ||
          h.authStatus === "Expiring Soon"
      ).length,
    },
  ];

  // Filter logic
  const filteredHouseholds = useMemo(() => {
    return MOCK_HOUSEHOLDS.filter((hh) => {
      // Tab filter
      if (selectedTab === "CARE_ACTIVE" && hh.triJourneyStatus.clientStage !== "Care Active") {
        return false;
      }
      if (selectedTab === "ONBOARDING" && hh.triJourneyStatus.clientStage === "Care Active") {
        return false;
      }
      if (selectedTab === "PENDING_AUTH" && hh.authStatus === "Approved") {
        return false;
      }
      if (selectedTab === "STUCK") {
        const isStuck =
          Boolean(hh.triJourneyStatus.bottleneckMessage) ||
          hh.authStatus === "Expired" ||
          hh.authStatus === "Expiring Soon";
        if (!isStuck) return false;
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
  }, [searchQuery, selectedProgram, selectedTab]);

  const isFiltered = searchQuery !== "" || selectedProgram !== "all" || selectedTab !== "ALL";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProgram("all");
    setSelectedTab("ALL");
  };

  const getClientChartLink = (hhId: string) => {
    switch (hhId) {
      case "hh-1001":
        return "/clients/CL-1001";
      case "hh-1002":
        return "/clients/CL-1002";
      case "hh-1003":
        return "/clients/CL-1003";
      default:
        return "/clients";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-12 animate-in fade-in duration-200">
      {/* 01. Standardized Page Header matching /intake/pipeline & /clients */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
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
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between cursor-pointer ${selectedDateRange === opt.id
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
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B3414] hover:bg-[#274C1D] text-white text-xs font-bold rounded-xl shadow-sm transition-all shadow-[#1B3414]/25 hover:shadow-md active:scale-95 cursor-pointer">
            <Plus className="w-4 h-4 text-[#93C573]" />
            Register Household
          </button>
        </div>
      </header>

      {/* 02. KPI Stats Strip - Uniform styling matching LiliSare KPI cards */}
      <section aria-label="Household Key Performance Indicators" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {[
          {
            id: "ALL",
            label: "Total Households",
            value: MOCK_HOUSEHOLDS.length.toLocaleString(),
            icon: Home,
            tone: "forest" as const,
          },
          {
            id: "CARE_ACTIVE",
            label: "Active Care Units",
            value: MOCK_HOUSEHOLDS.filter((h) => h.triJourneyStatus.clientStage === "Care Active").length.toLocaleString(),
            icon: Heart,
            tone: "forest" as const,
          },
          {
            id: "PENDING_AUTH",
            label: "Pending Authorisations",
            value: MOCK_HOUSEHOLDS.filter((h) => h.authStatus !== "Approved").length.toLocaleString(),
            icon: ClipboardCheck,
            tone: "amber" as const,
          },
          {
            id: "ONBOARDING",
            label: "In Onboarding",
            value: MOCK_HOUSEHOLDS.filter((h) => h.triJourneyStatus.clientStage !== "Care Active").length.toLocaleString(),
            icon: Clock,
            tone: "amber" as const,
          },
          {
            id: "STUCK",
            label: "Households Stuck",
            value: MOCK_HOUSEHOLDS.filter(
              (h) =>
                Boolean(h.triJourneyStatus.bottleneckMessage) ||
                h.authStatus === "Expired" ||
                h.authStatus === "Expiring Soon"
            ).length.toLocaleString(),
            icon: Home,
            tone: "coral" as const,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          const isSelected = selectedTab === kpi.id;

          const toneStyles = {
            forest: {
              cardBorder: "border-slate-200 hover:border-[#3D6B22]/50",
              iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
              valText: "text-slate-900",
              selected:
                "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 shadow-md bg-gradient-to-b from-[#F2F8EE]/70 via-white to-white -translate-y-0.5",
            },
            amber: {
              cardBorder: "border-amber-300 hover:border-amber-400 bg-white",
              iconBg: "bg-amber-100 text-amber-800",
              valText: "text-amber-900",
              selected:
                "border-amber-400 ring-2 ring-amber-400/20 shadow-md bg-gradient-to-b from-amber-50/70 via-white to-white -translate-y-0.5",
            },
            coral: {
              cardBorder: "border-rose-300 hover:border-rose-400 bg-white",
              iconBg: "bg-rose-100 text-rose-700",
              valText: "text-rose-900",
              selected:
                "border-rose-400 ring-2 ring-rose-400/20 shadow-md bg-gradient-to-b from-rose-50/70 via-white to-white -translate-y-0.5",
            },
          }[kpi.tone];

          return (
            <button
              key={kpi.id}
              type="button"
              onClick={() => setSelectedTab(selectedTab === kpi.id ? "ALL" : kpi.id)}
              className={`group text-left focus:outline-none cursor-pointer w-full bg-white rounded-2xl p-4 sm:p-4.5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${isSelected
                ? toneStyles.selected
                : `${toneStyles.cardBorder} shadow-sm hover:shadow-md hover:-translate-y-0.5`
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 tracking-tight truncate pr-1">
                  {kpi.label}
                </span>
                <div
                  className={`p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-105 ${toneStyles.iconBg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${toneStyles.valText}`}
                >
                  {kpi.value}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-slate-500 transition-opacity" />
              </div>
            </button>
          );
        })}
      </section>

      {/* 03. Household Management Workspace Card */}
      <section aria-label="Household Management Workspace" className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          {/* Workspace Toolbar Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Household Management
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {filteredHouseholds.length} shown
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and coordinate linked families, caregivers, and authorizations
              </p>
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
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
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

              {/* View Mode Toggle (Grid vs Table) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Table View"
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${viewMode === "table"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Tabs matching /intake/pipeline & /clients */}
          <div className="pt-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-max border-b border-slate-100 pb-2.5">
              {tabs.map((tab) => {
                const isActive = selectedTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                      ? "bg-[#1B3414] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 ml-auto rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Content: Grid or Table */}
          <div className="mt-4">
            {filteredHouseholds.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Home className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 text-sm">No households match your criteria</p>
                <p className="text-xs text-slate-400 mt-0.5">Try searching for another name or clearing active filters.</p>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E5622] bg-[#E3F1D9] hover:bg-[#d5eac8] rounded-xl transition-colors cursor-pointer"
                  >
                    <FilterX className="w-3.5 h-3.5" />
                    <span>Clear All Filters</span>
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredHouseholds.map((hh) => (
                  <div
                    key={hh.id}
                    className="h-full bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden space-y-3.5"
                  >
                    {/* Header: Name, Code & Program */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors text-base">{hh.name}</h3>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md font-mono border border-slate-200/60">
                            {hh.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {hh.city}, {hh.state}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-[#1E5622] bg-[#E3F1D9] border border-[#3D6B22]/20 px-2 py-0.5 rounded-full text-[11px]">
                            {hh.program}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${hh.authStatus === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                        >
                          {hh.authStatus === "Approved" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          )}
                          {hh.authStatus}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Expires: {hh.authExpiry}
                        </p>
                      </div>
                    </div>

                    {/* Linked Dual Entity Display (Client & Caregiver) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                      {/* Client Box with direct link into Client Chart */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Care Recipient (Client)</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {hh.client.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {hh.client.relationship}
                        </div>
                        <Link
                          href={getClientChartLink(hh.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline pt-0.5"
                        >
                          View Client Chart <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Caregiver Box with direct link into Caregiver File */}
                      <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Heart className="w-3.5 h-3.5 text-rose-600" />
                          <span>Paid Family Caregiver</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {hh.primaryCaregiver.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {hh.primaryCaregiver.relationship}
                        </div>
                        <Link
                          href="/caregivers"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline pt-0.5"
                        >
                          View Caregiver File <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Tri-Journey Status Ribbon */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tri-Journey Synchronization Status
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                        <div className="p-1.5 bg-blue-50/70 text-blue-800 rounded-lg border border-blue-100">
                          <div className="text-[9px] uppercase font-bold text-blue-500">1. Client</div>
                          <div className="font-bold truncate mt-0.5 text-[11px]">{hh.triJourneyStatus.clientStage}</div>
                        </div>
                        <div className="p-1.5 bg-emerald-50/70 text-emerald-800 rounded-lg border border-emerald-100">
                          <div className="text-[9px] uppercase font-bold text-emerald-500">2. Caregiver</div>
                          <div className="font-bold truncate mt-0.5 text-[11px]">{hh.triJourneyStatus.caregiverStage}</div>
                        </div>
                        <div className="p-1.5 bg-indigo-50/70 text-indigo-800 rounded-lg border border-indigo-100">
                          <div className="text-[9px] uppercase font-bold text-indigo-500">3. Agency Ops</div>
                          <div className="font-bold truncate mt-0.5 text-[11px]">{hh.triJourneyStatus.opsStage}</div>
                        </div>
                      </div>

                      {hh.triJourneyStatus.bottleneckMessage && (
                        <div className="flex items-center gap-1.5 p-2 bg-amber-50 text-amber-800 text-[11px] rounded-lg border border-amber-200/80">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span className="truncate">{hh.triJourneyStatus.bottleneckMessage}</span>
                        </div>
                      )}
                    </div>

                    {/* Operational Footer */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                      <div className="text-slate-600 text-[11px] truncate max-w-[200px]">
                        <span className="text-slate-400">Case Mgr:</span>{" "}
                        <span className="font-semibold text-slate-800">{hh.caseManager.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-slate-900 text-xs">
                            {hh.scheduledHoursPerWeek} / {hh.authorizedHoursPerWeek}
                          </span>
                          <span className="text-slate-400 text-[10px] block">Weekly Hours</span>
                        </div>
                        <Link
                          href={`/households/${hh.id}`}
                          className="px-3 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm shadow-[#1B3414]/20 active:scale-95 cursor-pointer"
                        >
                          Manage <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Household</th>
                        <th className="py-3.5 px-4">Program</th>
                        <th className="py-3.5 px-4">Care Recipient (Client)</th>
                        <th className="py-3.5 px-4">Paid Family Caregiver</th>
                        <th className="py-3.5 px-4">Case Manager</th>
                        <th className="py-3.5 px-4">Auth Status</th>
                        <th className="py-3.5 px-4">Weekly Hours</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredHouseholds.map((hh) => (
                        <tr
                          key={hh.id}
                          onClick={() => setSelectedHousehold(hh)}
                          className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">{hh.name}</span>
                              <span className="text-[11px] font-mono text-slate-400">{hh.code}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] font-medium text-[#1E5622] bg-[#E3F1D9] border border-[#3D6B22]/20 px-2.5 py-0.5 rounded-full">
                              {hh.program}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Link
                              href={getClientChartLink(hh.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-blue-600 hover:underline"
                            >
                              {hh.client.name}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4">
                            <Link
                              href="/caregivers"
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-slate-800 hover:text-[#3D6B22]"
                            >
                              {hh.primaryCaregiver.name}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {hh.caseManager.name}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${hh.authStatus === "Approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                            >
                              {hh.authStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {hh.scheduledHoursPerWeek} / {hh.authorizedHoursPerWeek} hrs
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/households/${hh.id}`}
                              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 04. Secondary Sections: Household Bottlenecks & Coordination Activity matching /intake/pipeline & /clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Actionable Bottlenecks Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  Household Journey Bottlenecks
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  2 Approvals Due
                </span>
              </div>
              <span className="text-xs font-semibold text-[#3D6B22]">3 Items</span>
            </div>

            <div className="mt-3.5 space-y-2">
              <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50/30 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-rose-100 text-rose-700 transition-transform group-hover:scale-105">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      Case Manager authorization renewal pending
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Whitfield Household (HH-1002) · Due in 11 days
                    </p>
                  </div>
                </div>
                <Link
                  href="/billing/authorizations"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs shrink-0 transition-colors"
                >
                  <span>Push CM</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/30 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-amber-100 text-amber-800 transition-transform group-hover:scale-105">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      Annual family caregiver refresher training due
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Miller Household (HH-1001) · Sarah Miller
                    </p>
                  </div>
                </div>
                <Link
                  href="/caregivers"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-emerald-50 text-slate-800 hover:text-[#3D6B22] border border-slate-200 shadow-xs shrink-0 transition-colors"
                >
                  <span>Follow up</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-sky-100 text-sky-800 transition-transform group-hover:scale-105">
                    <FileWarning className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      Legal guardian intake documentation confirmation
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Santos Household (HH-1003) · Des Moines
                    </p>
                  </div>
                </div>
                <Link
                  href="/clients"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-xs shrink-0 transition-colors"
                >
                  <span>View Doc</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Household Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  Recent Household Activity
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D6B22] animate-pulse" title="Live Sync" />
              </div>
              <span className="text-xs font-semibold text-[#3D6B22]">Live Roster</span>
            </div>

            <div className="mt-3.5 space-y-2">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all text-xs flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-emerald-100 text-[#1E5622] transition-transform group-hover:scale-105">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                      EVV shift verified (40/40 hrs compliant)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Miller Household · Mother A (Sarah Miller) · Today
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">08:30 AM</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all text-xs flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-sky-100 text-sky-800 transition-transform group-hover:scale-105">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                      Primary family caregiver assigned
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Whitfield Household · Elena Whitfield · Yesterday
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">Yesterday</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all text-xs flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-purple-100 text-purple-800 transition-transform group-hover:scale-105">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                      New household registered from converted intake
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Bennett Household · Intake Coordinator · 2 days ago
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">2d ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Modal */}
      {selectedHousehold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1B3414] p-5 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{selectedHousehold.name}</h2>
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-semibold rounded font-mono">
                    {selectedHousehold.code}
                  </span>
                </div>
                <p className="text-xs text-[#93C573] mt-1">{selectedHousehold.program} • {selectedHousehold.city}, {selectedHousehold.state}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHousehold(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {/* Linked Household Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Care Recipient (Client)</h4>
                  <p className="font-semibold text-slate-900">{selectedHousehold.client.name}</p>
                  <p className="text-xs text-slate-500">{selectedHousehold.client.relationship}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedHousehold.client.phone}</p>
                  <Link
                    href={getClientChartLink(selectedHousehold.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mt-2"
                  >
                    Open Client Chart <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Designated Caregiver</h4>
                  <p className="font-semibold text-slate-900">{selectedHousehold.primaryCaregiver.name}</p>
                  <p className="text-xs text-slate-500">{selectedHousehold.primaryCaregiver.relationship}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedHousehold.primaryCaregiver.phone}</p>
                  <Link
                    href="/caregivers"
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline mt-2"
                  >
                    Open Caregiver File <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Case Manager Coordination */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Case Manager & Service Authorization</h4>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
                    {selectedHousehold.authorizedHoursPerWeek} Hours / Week Authorized
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2">
                  <div><strong>Case Manager:</strong> {selectedHousehold.caseManager.name}</div>
                  <div><strong>Agency:</strong> {selectedHousehold.caseManager.agency}</div>
                  <div><strong>Email:</strong> {selectedHousehold.caseManager.email}</div>
                  <div><strong>Phone:</strong> {selectedHousehold.caseManager.phone}</div>
                </div>
              </div>

              {/* Quick Action Navigation */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/billing/authorizations"
                  className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 text-xs transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#3D6B22]" /> Manage Authorizations
                </Link>
                <Link
                  href="/scheduling"
                  className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 text-xs transition-colors"
                >
                  <Calendar className="w-4 h-4 text-blue-600" /> Open Shift Scheduler
                </Link>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHousehold(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}