"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  ChevronDown,
  ChevronLeft,
  X,
  Phone,
  Mail,
  ExternalLink,
  List as ListIcon,
  LayoutGrid,
  Filter,
  RotateCcw,
  Building2,
  Briefcase,
  Activity,
  Trash2,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import {
  MOCK_HOUSEHOLDS,
  Household,
  getHouseholdsFromStorage,
  saveHouseholdsToStorage,
} from "@/lib/households/mockData";
import { subscribeToIntakeSync, deleteHouseholdFromStorage } from "@/lib/intake/intakeSync";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function AdminHouseholdDirectory() {
  const router = useRouter();
  const perms = usePortalPermissions();

  // State
  const [householdsList, setHouseholdsList] =
    useState<Household[]>(MOCK_HOUSEHOLDS);
  const [deleteTarget, setDeleteTarget] = useState<Household | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeKpiKey, setActiveKpiKey] = useState<
    "ALL" | "ACTIVE" | "EXPIRING" | "BOTTLENECK" | "HIGH_EVV"
  >("ALL");

  // Dropdown Filter states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const programDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Household for Quick Review Drawer
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(
    null
  );
  // Initialize from storage & sync across journeys
  useEffect(() => {
    const stored = getHouseholdsFromStorage();
    if (stored && stored.length > 0) {
      setHouseholdsList(stored);
    }
    const unsubscribe = subscribeToIntakeSync(() => {
      setHouseholdsList(getHouseholdsFromStorage());
    });
    return unsubscribe;
  }, []);

  // Close filter dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
      if (
        programDropdownRef.current &&
        !programDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProgramDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Executive KPI calculations (Computed dynamically from synchronized records)
  const kpiStats = useMemo(() => {
    const total = householdsList.length;
    const activeCareCount = householdsList.filter(
      (h) => h.authStatus === "Approved"
    ).length;
    const expiringCount = householdsList.filter(
      (h) => h.authStatus === "Expiring Soon" || h.authStatus === "Pending Review"
    ).length;
    const totalClients = householdsList.filter((h) => Boolean(h.client?.name)).length;
    const connectedCaregivers = householdsList.filter((h) => Boolean(h.primaryCaregiver?.name)).length;
    const totalAuthorized = householdsList.reduce((acc, h) => acc + (h.authorizedHoursPerWeek || 0), 0);
    const totalScheduled = householdsList.reduce((acc, h) => acc + (h.scheduledHoursPerWeek || 0), 0);
    const authUtilization =
      totalAuthorized > 0 ? `${Math.min(100, (totalScheduled / totalAuthorized) * 100).toFixed(1)}%` : "0.0%";
    const bottleneckCount = householdsList.filter(
      (h) => Boolean(h.triJourneyStatus.bottleneckMessage)
    ).length;

    return {
      totalHouseholds: total,
      activeCareCount,
      totalClients,
      connectedCaregivers,
      authUtilization,
      expiringCount,
      bottleneckCount,
    };
  }, [householdsList]);

  // Filtering Logic
  const filteredHouseholds = useMemo(() => {
    return householdsList.filter((hh) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = hh.name.toLowerCase().includes(q);
        const matchesCode = hh.code.toLowerCase().includes(q);
        const matchesClient = hh.client.name.toLowerCase().includes(q);
        const matchesCaregiver = hh.primaryCaregiver.name
          .toLowerCase()
          .includes(q);
        const matchesAddress = `${hh.address} ${hh.city}`.toLowerCase().includes(q);
        const matchesProgram = hh.program.toLowerCase().includes(q);
        if (
          !matchesName &&
          !matchesCode &&
          !matchesClient &&
          !matchesCaregiver &&
          !matchesAddress &&
          !matchesProgram
        ) {
          return false;
        }
      }

      // Program filter
      if (selectedProgram !== "ALL" && !hh.program.includes(selectedProgram)) {
        return false;
      }

      // Auth status filter
      if (selectedStatus !== "ALL" && hh.authStatus !== selectedStatus) {
        return false;
      }

      // KPI card click filter
      if (activeKpiKey === "ACTIVE" && hh.authStatus !== "Approved") {
        return false;
      }
      if (
        activeKpiKey === "EXPIRING" &&
        hh.authStatus !== "Expiring Soon" &&
        hh.authStatus !== "Pending Review"
      ) {
        return false;
      }
      if (
        activeKpiKey === "BOTTLENECK" &&
        !hh.triJourneyStatus.bottleneckMessage
      ) {
        return false;
      }

      return true;
    });
  }, [householdsList, searchQuery, selectedProgram, selectedStatus, activeKpiKey]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedProgram, selectedStatus, activeKpiKey]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredHouseholds.length / pageSize));
  const paginatedHouseholds = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHouseholds.slice(start, start + pageSize);
  }, [filteredHouseholds, currentPage, pageSize]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedProgram !== "ALL" ||
    selectedStatus !== "ALL" ||
    activeKpiKey !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedProgram("ALL");
    setSelectedStatus("ALL");
    setActiveKpiKey("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Households Directory
          </h1>
        </div>

        <Link
          href="/admin/households/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Household</span>
        </Link>
      </div>

      {/* 02. Executive KPI Cards (Harmonized with Clients, Caregivers, Referrals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Active Households */}
        <div
          onClick={() => setActiveKpiKey(activeKpiKey === "ALL" ? "ALL" : "ALL")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "ALL"
            ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
            : "border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Households</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpiStats.totalHouseholds}
          </div>
        </div>

        {/* Card 2: Connected Clients */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Connected Clients</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#3D6B22]">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpiStats.totalClients}
          </div>
        </div>

        {/* Card 3: Connected Caregivers */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Assigned Staff</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpiStats.connectedCaregivers}
          </div>
        </div>

        {/* Card 4: Auth Utilization Rate */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Auth Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#3D6B22]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpiStats.authUtilization}
          </div>
        </div>

        {/* Card 5: Operational Bottlenecks */}
        <div
          onClick={() =>
            setActiveKpiKey(activeKpiKey === "BOTTLENECK" ? "ALL" : "BOTTLENECK")
          }
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "BOTTLENECK"
            ? "border-amber-500 shadow-md ring-2 ring-amber-500/15"
            : "border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-md"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Action Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpiStats.bottleneckCount}
          </div>
        </div>
      </div>

      {/* 03. Search, Dropdown Filters & View Switcher (Contained in One Card matching Caregivers & Clients Directory) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by household name, client, caregiver, or address..."
              className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: Status Dropdown Filter, Program Dropdown Filter, Reset, View Toggle */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Status Dropdown Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${selectedStatus !== "ALL"
                  ? "bg-[#3D6B22]/10 border-[#3D6B22]/30 text-[#3D6B22]"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {selectedStatus === "ALL"
                    ? "Status: All"
                    : `Status: ${selectedStatus}`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Filter by Status
                  </div>
                  {[
                    { label: "All Statuses", value: "ALL" },
                    { label: "Approved", value: "Approved" },
                    { label: "Pending Review", value: "Pending Review" },
                    { label: "Expiring Soon", value: "Expiring Soon" },
                    { label: "Expired", value: "Expired" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedStatus(option.value);
                        setCurrentPage(1);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${selectedStatus === option.value
                        ? "bg-[#3D6B22]/10 text-[#3D6B22] font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <span>{option.label}</span>
                      {selectedStatus === option.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3D6B22]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Program Dropdown Filter */}
            <div className="relative" ref={programDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProgramDropdownOpen(!isProgramDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${selectedProgram !== "ALL"
                  ? "bg-[#3D6B22]/10 border-[#3D6B22]/30 text-[#3D6B22] font-semibold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>
                  {selectedProgram === "ALL"
                    ? "Program: All"
                    : selectedProgram === "Waiver"
                      ? "Medicaid Waiver"
                      : selectedProgram === "VA"
                        ? "VA Care"
                        : selectedProgram === "Private"
                          ? "Private Pay"
                          : selectedProgram === "CES"
                            ? "CES Pediatric"
                            : selectedProgram}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProgramDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Care Program
                  </div>
                  {[
                    { label: "All Programs", value: "ALL" },
                    { label: "Medicaid Waiver", value: "Waiver" },
                    { label: "VA Community Care", value: "VA" },
                    { label: "Private Pay", value: "Private" },
                    { label: "CES Pediatric", value: "CES" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedProgram(option.value);
                        setCurrentPage(1);
                        setIsProgramDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${selectedProgram === option.value
                        ? "bg-[#3D6B22]/10 text-[#3D6B22] font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <span>{option.label}</span>
                      {selectedProgram === option.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3D6B22]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filter Button if active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset all filters"
                className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* View Switcher: List vs Grid Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === "list"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                <ListIcon className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 04. Households Content */}
      {viewMode === "list" ? (
        /* ======================== LIST VIEW ======================== */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Household</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Caregiver</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tri-Journey Stage</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHouseholds.map((hh) => (
                  <tr
                    key={hh.id}
                    onClick={() => router.push(`/admin/households/${hh.id}`)}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  >
                    {/* Household info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold text-xs flex items-center justify-center shrink-0">
                          <Home className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                            {hh.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-xs">
                        {hh.client.name}
                      </div>
                    </td>

                    {/* Primary Caregiver */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-xs">
                        {hh.primaryCaregiver.name}
                      </div>
                    </td>

                    {/* Tri-Journey Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${hh.authStatus === "Approved"
                          ? "bg-[#E8F2E4] text-[#1E5622] border-[#3D6B22]/30"
                          : hh.authStatus === "Expiring Soon"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-purple-50 text-purple-800 border-purple-200"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 text-[11px] rounded-full ${hh.authStatus === "Approved"
                            ? "bg-[#3D6B22]"
                            : hh.authStatus === "Expiring Soon"
                              ? "bg-amber-500"
                              : "bg-purple-500"
                            }`}
                        />
                        <span>{hh.triJourneyStatus.clientStage}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/households/${hh.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                        >
                          <span>View Profile</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                        <Link
                          href={`/admin/households/${hh.id}/edit`}
                          title="Edit Household"
                          className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 hover:bg-emerald-50/60 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        {perms.households.canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(hh)}
                            title="Delete Household (Agency Admin)"
                            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedHouseholds.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <Home className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-sm">
                        No households found
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try adjusting your search criteria or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================== GRID VIEW ======================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
          {paginatedHouseholds.map((hh) => (
            <div
              key={hh.id}
              onClick={() => router.push(`/admin/households/${hh.id}`)}
              className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group"
            >
              {/* Card Top */}
              <div className="p-4 sm:p-5 space-y-3.5">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-black text-sm flex items-center justify-center shrink-0">
                      <Home className="w-5 h-5 text-[#3D6B22]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#3D6B22] transition-colors tracking-tight">
                        {hh.name}
                      </h3>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        {hh.code} • {hh.city}, {hh.state}
                      </div>
                    </div>
                  </div>

                  {/* Auth status badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${hh.authStatus === "Approved"
                      ? "bg-[#E8F2E4] text-[#1E5622] border-[#3D6B22]/30"
                      : hh.authStatus === "Expiring Soon"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                  >
                    {hh.authStatus}
                  </span>
                </div>

                {/* Two Connected Journey Strips: Client & Caregiver */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Client Tile */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Patient / Client
                    </span>
                    <span className="font-bold text-slate-800 truncate block">
                      {hh.client.name}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold block">
                      {hh.client.status}
                    </span>
                  </div>

                  {/* Caregiver Tile */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Staff
                    </span>
                    <span className="font-bold text-slate-800 truncate block">
                      {hh.primaryCaregiver.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {hh.primaryCaregiver.relationship}
                    </span>
                  </div>
                </div>

                {/* Tri-Journey Status Pills */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20">
                    Client: {hh.triJourneyStatus.clientStage}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    Staff: {hh.triJourneyStatus.caregiverStage}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    Ops: {hh.triJourneyStatus.opsStage}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">EVV Rating</span>
                  <span className="font-bold text-emerald-700">{hh.evvComplianceRate}% Verified</span>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] group-hover:translate-x-0.5 transition-transform">
                  <span>Manage Household</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}

          {paginatedHouseholds.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Home className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600 text-sm">No households found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust search query or filters to display records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 05. Global Standardized Pagination Bar */}
      {filteredHouseholds.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredHouseholds.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          entryLabel="households"
          className="pt-2 border-t border-slate-100"
        />
      )}
      {/* Delete Household Confirmation Modal (Agency Admin Only) */}
      {perms.households.canDelete && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Household Unit"
          description="Permanent deletion removes this household across both Agency Admin and Intake directories."
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          maxWidth="sm"
        >
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-slate-900">{deleteTarget?.name}</strong> (
            {deleteTarget?.code})?
          </p>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!deleteTarget) return;
                deleteHouseholdFromStorage(deleteTarget.id);
                setHouseholdsList((prev) => prev.filter((h) => h.id !== deleteTarget.id));
                toast.success(`Household ${deleteTarget.name} deleted.`);
                setDeleteTarget(null);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
