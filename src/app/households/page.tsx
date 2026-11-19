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
  AlertTriangle,
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

      {/* 02. KPI Stats Strip - Uniform styling matching /intake/pipeline & /clients */}
      <section aria-label="Household Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          {
            id: "ALL",
            label: "Total Households",
            value: MOCK_HOUSEHOLDS.length.toLocaleString(),
            icon: Home,
            iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
          },
          {
            id: "CARE_ACTIVE",
            label: "Active Care Units",
            value: MOCK_HOUSEHOLDS.filter((h) => h.triJourneyStatus.clientStage === "Care Active").length.toLocaleString(),
            icon: Heart,
            iconBg: "bg-[#E3F1D9] text-[#1E5622]",
          },
          {
            id: "ONBOARDING",
            label: "In Onboarding",
            value: MOCK_HOUSEHOLDS.filter((h) => h.triJourneyStatus.clientStage !== "Care Active").length.toLocaleString(),
            icon: Clock,
            iconBg: "bg-amber-100 text-amber-800",
          },
          {
            id: "STUCK",
            label: "Needs Attention",
            value: MOCK_HOUSEHOLDS.filter(
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
                <span
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#3D6B22] transition-colors"
                >
                  {kpi.value}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHouseholds.map((hh) => {
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

                  return (
                    <Link
                      key={hh.id}
                      href={`/households/${hh.id}`}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#3D6B22]/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20"
                    >
                      <div>
                        {/* Top: Household Name, Code, City & Auth Status Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors text-base truncate">
                              {hh.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <span className="font-mono text-slate-500 font-medium">{hh.code}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                {hh.city}, {hh.state}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${getAuthBadge(
                              hh.authStatus
                            )}`}
                          >
                            {hh.authStatus}
                          </span>
                        </div>

                        {/* Connected Members: Care Recipient & Family Caregiver */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 shrink-0">
                              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              Client:
                            </span>
                            <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                              {hh.client.name}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 shrink-0">
                              <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              Caregiver:
                            </span>
                            <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                              {hh.primaryCaregiver.name}
                            </span>
                          </div>
                        </div>

                        {/* Compact Tags */}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-medium bg-[#E3F1D9] text-[#1E5622] px-2 py-0.5 rounded-lg border border-[#3D6B22]/20 truncate">
                            {hh.program}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 shrink-0">
                            {hh.authorizedHoursPerWeek} hrs/wk
                          </span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1 truncate text-slate-500">
                          <span className="text-slate-400">CM:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[140px]">
                            {hh.caseManager.name.replace(/,.*$/, "")}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 font-semibold text-xs text-[#3D6B22] group-hover:translate-x-1 transition-transform shrink-0">
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Household</th>
                        <th className="py-3.5 px-4">Program</th>
                        <th className="py-3.5 px-4">Care Recipient (Client)</th>
                        <th className="py-3.5 px-4">Family Caregiver</th>
                        <th className="py-3.5 px-4">Case Manager</th>
                        <th className="py-3.5 px-4">Auth Status</th>
                        <th className="py-3.5 px-4">Weekly Hours</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredHouseholds.map((hh) => {
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

                        return (
                          <tr
                            key={hh.id}
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            <td className="py-3.5 px-4">
                              <Link href={`/households/${hh.id}`} className="block">
                                <div className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors text-xs">
                                  {hh.name}
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                  {hh.code} • {hh.city}, {hh.state}
                                </div>
                              </Link>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[11px] font-medium text-[#1E5622] bg-[#E3F1D9] border border-[#3D6B22]/20 px-2.5 py-0.5 rounded-full inline-block">
                                {hh.program}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800 text-xs">
                                {hh.client.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {hh.client.relationship}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800 text-xs">
                                {hh.primaryCaregiver.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {hh.primaryCaregiver.relationship}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 text-xs">
                              <div className="font-medium text-slate-800">{hh.caseManager.name.replace(/,.*$/, "")}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{hh.caseManager.agency}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getAuthBadge(
                                  hh.authStatus
                                )}`}
                              >
                                {hh.authStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                              {hh.scheduledHoursPerWeek} / {hh.authorizedHoursPerWeek} hrs
                            </td>
                            <td className="py-3.5 px-4 text-right">
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
        </div>
      </section>

      {/* 04. Secondary Sections: Household Bottlenecks & Coordination Activity matching /intake/pipeline & /clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Actionable Bottlenecks Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between">
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
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between">
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
    </div>
  );
}