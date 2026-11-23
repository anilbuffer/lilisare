"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Users,
  UserCheck,
  UserPlus,
  FileText,
  Calendar,
  Star,
  ShieldCheck,
  Clock,
  Search,
  Filter,
  List as ListIcon,
  LayoutGrid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Plus,
  Check,
  RotateCcw,
  Phone,
  Mail,
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  X,
  ExternalLink,
} from "lucide-react";
import { CaregiverRecord } from "@/types/caregiver";
import { getCaregiversFromStorage } from "@/lib/caregivers/mockData";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";
import {
  SEED_ADMIN_CAREGIVERS,
  AdminCaregiverItem,
} from "@/lib/caregivers/adminCaregiversData";
import { AdminCaregiverTopTabs } from "./AdminCaregiverTopTabs";

export type { AdminCaregiverItem };

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getComplianceStyle(rate: number) {
  if (rate >= 90) {
    return {
      pillBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotBg: "bg-emerald-500",
      label: `${rate}% Compliant`,
    };
  }
  if (rate >= 70) {
    return {
      pillBg: "bg-amber-50 text-amber-700 border-amber-200",
      dotBg: "bg-amber-500",
      label: `${rate}% Compliant`,
    };
  }
  return {
    pillBg: "bg-rose-50 text-rose-700 border-rose-200",
    dotBg: "bg-rose-500",
    label: `${rate}% Compliant`,
  };
}

function getStatusStyle(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Onboarding":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "On Hold":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Inactive":
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function AdminCaregiverDirectory() {
  const router = useRouter();
  const pathname = usePathname();

  // View state: 'list' or 'grid' (default list per reference screenshot)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Caregivers state
  const [items, setItems] = useState<AdminCaregiverItem[]>(SEED_ADMIN_CAREGIVERS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [complianceFilter, setComplianceFilter] = useState<string>("ALL");
  const [activeKpiFilter, setActiveKpiFilter] = useState<"ALL" | "ACTIVE" | "ONBOARDING" | "HIGH_RATING" | "COMPLIANCE_GAP">("ALL");

  // Dropdown states
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Sync with storage on mount
  useEffect(() => {
    setIsLoaded(true);
    try {
      const stored = getCaregiversFromStorage();
      if (Array.isArray(stored) && stored.length > 0) {
        const mappedFromStorage: AdminCaregiverItem[] = stored.map((cg) => {
          const seedMatch = SEED_ADMIN_CAREGIVERS.find((s) => s.id === cg.id);
          const role =
            seedMatch?.role ||
            (cg.type === "Family Caregiver"
              ? "Family Caregiver"
              : cg.type === "Live-In Caregiver"
                ? "Live-In Attendant"
                : "Caregiver Specialist");

          const rating = seedMatch?.rating || 4.9;
          const complianceRate =
            seedMatch?.complianceRate ||
            (cg.verificationChecklist?.training === "Complete" ? 98 : 75);
          const activePatients =
            seedMatch?.activePatients ?? (cg.assignmentStatus === "Assigned" ? 1 : 0);

          let mappedStatus: AdminCaregiverItem["status"] = "Active";
          if (seedMatch?.status) {
            mappedStatus = seedMatch.status;
          } else if (cg.status === "Active") {
            mappedStatus = "Active";
          } else if (cg.status === "Onboarding" || cg.status === "Pending") {
            mappedStatus = "Onboarding";
          } else if (cg.status === "On Hold") {
            mappedStatus = "On Hold";
          } else {
            mappedStatus = "Inactive";
          }

          return {
            id: cg.id,
            name: cg.name,
            role,
            status: mappedStatus,
            rating,
            complianceRate,
            activePatients,
            lastActive: seedMatch?.lastActive || "Today",
            phone: cg.personalInfo?.phone || "(541) 555-0199",
            email: cg.personalInfo?.email || "caregiver@lilisare.health",
            branch: cg.branch || "North Metro",
            classification: cg.employmentClassification || "W-2",
          };
        });

        // Ensure seed reference caregivers are retained
        const missingSeeds = SEED_ADMIN_CAREGIVERS.filter(
          (s) => !mappedFromStorage.some((m) => m.id === s.id)
        );
        setItems([...mappedFromStorage, ...missingSeeds]);
      } else {
        setItems(SEED_ADMIN_CAREGIVERS);
      }
    } catch {
      setItems(SEED_ADMIN_CAREGIVERS);
    }

    const unsubscribe = subscribeToIntakeSync(() => {
      const freshStored = getCaregiversFromStorage();
      if (Array.isArray(freshStored) && freshStored.length > 0) {
        setItems((prev) => {
          const newOnes = freshStored.filter((f) => !prev.some((p) => p.id === f.id));
          if (newOnes.length === 0) return prev;
          const mappedNew: AdminCaregiverItem[] = newOnes.map((cg) => ({
            id: cg.id,
            name: cg.name,
            role: cg.type || "Caregiver",
            status: "Active",
            rating: 4.8,
            complianceRate: 95,
            activePatients: cg.assignmentStatus === "Assigned" ? 1 : 0,
            lastActive: "Today",
            phone: cg.personalInfo?.phone || "(541) 555-0199",
            email: cg.personalInfo?.email || "caregiver@lilisare.health",
            branch: cg.branch || "North Metro",
            classification: cg.employmentClassification || "W-2",
          }));
          return [...mappedNew, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle outside click for filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // KPI calculations
  const activeCount = useMemo(() => items.filter((i) => i.status === "Active").length, [items]);
  const onboardingCount = useMemo(
    () => items.filter((i) => i.status === "Onboarding").length,
    [items]
  );
  const avgRating = useMemo(() => {
    if (items.length === 0) return "4.8";
    const sum = items.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / items.length).toFixed(1);
  }, [items]);
  const avgCompliance = useMemo(() => {
    if (items.length === 0) return 92;
    const sum = items.reduce((acc, curr) => acc + curr.complianceRate, 0);
    return Math.round(sum / items.length);
  }, [items]);
  const expiringOrGapsCount = useMemo(
    () => items.filter((i) => i.complianceRate < 80).length + 10,
    [items]
  );

  // Filter & Search Logic
  const filteredCaregivers = useMemo(() => {
    return items.filter((cg) => {
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = cg.name.toLowerCase().includes(query);
        const matchesRole = cg.role.toLowerCase().includes(query);
        const matchesId = cg.id.toLowerCase().includes(query);
        const matchesEmail = cg.email.toLowerCase().includes(query);
        if (!matchesName && !matchesRole && !matchesId && !matchesEmail) {
          return false;
        }
      }

      // KPI card quick filter
      if (activeKpiFilter === "ACTIVE" && cg.status !== "Active") return false;
      if (activeKpiFilter === "ONBOARDING" && cg.status !== "Onboarding") return false;
      if (activeKpiFilter === "HIGH_RATING" && cg.rating < 4.8) return false;
      if (activeKpiFilter === "COMPLIANCE_GAP" && cg.complianceRate >= 80) return false;

      // Status dropdown filter
      if (statusFilter !== "ALL" && cg.status !== statusFilter) {
        return false;
      }

      // Role filter
      if (roleFilter !== "ALL") {
        if (roleFilter === "RN" && !cg.role.includes("RN") && !cg.role.includes("Registered Nurse")) return false;
        if (roleFilter === "CNA" && !cg.role.includes("CNA") && !cg.role.includes("Certified Nursing")) return false;
        if (roleFilter === "HHA" && !cg.role.includes("HHA") && !cg.role.includes("Home Health Aide")) return false;
        if (roleFilter === "PT" && !cg.role.includes("PT") && !cg.role.includes("Physical Therapist")) return false;
      }

      // Compliance filter
      if (complianceFilter !== "ALL") {
        if (complianceFilter === "100" && cg.complianceRate !== 100) return false;
        if (complianceFilter === "70_99" && (cg.complianceRate < 70 || cg.complianceRate >= 100)) return false;
        if (complianceFilter === "BELOW_70" && cg.complianceRate >= 70) return false;
      }

      return true;
    });
  }, [items, searchQuery, activeKpiFilter, statusFilter, roleFilter, complianceFilter]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter, complianceFilter, activeKpiFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCaregivers.length / pageSize) || 1;
  const paginatedCaregivers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCaregivers.slice(start, start + pageSize);
  }, [filteredCaregivers, currentPage]);

  const activeFiltersCount =
    (statusFilter !== "ALL" ? 1 : 0) +
    (roleFilter !== "ALL" ? 1 : 0) +
    (complianceFilter !== "ALL" ? 1 : 0) +
    (activeKpiFilter !== "ALL" ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setRoleFilter("ALL");
    setComplianceFilter("ALL");
    setActiveKpiFilter("ALL");
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Top Tab Navigation Bar (Matching Reference Screenshot) */}
      <AdminCaregiverTopTabs activeTab="roster" />

      {/* 02. Header & Action CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Roster Details
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {activeCount} active caregivers in roster.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/caregivers/new"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#1B3414] hover:bg-[#274C1D] rounded-xl shadow-md shadow-[#1B3414]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#93C573]" />
            <span>Add Caregiver</span>
          </Link>
        </div>
      </div>

      {/* 03. 5 Executive KPI Metric Cards (Matching Reference Screenshot) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* KPI 1: Active Caregivers */}
        <button
          type="button"
          onClick={() =>
            setActiveKpiFilter((prev) => (prev === "ACTIVE" ? "ALL" : "ACTIVE"))
          }
          className={`text-left bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 cursor-pointer overflow-hidden ${activeKpiFilter === "ACTIVE"
              ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 shadow-sm"
              : "border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">Active Caregivers</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {activeCount || 84}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] sm:text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
            + 2 this week
          </p>
        </button>

        {/* KPI 2: Onboarding */}
        <button
          type="button"
          onClick={() =>
            setActiveKpiFilter((prev) => (prev === "ONBOARDING" ? "ALL" : "ONBOARDING"))
          }
          className={`text-left bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 cursor-pointer overflow-hidden ${activeKpiFilter === "ONBOARDING"
              ? "border-purple-600 ring-2 ring-purple-600/20 shadow-sm"
              : "border-slate-200 shadow-2xs hover:border-purple-300 hover:shadow-md"
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">Onboarding</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {onboardingCount || 5}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200/80 text-purple-600 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-2">
            3 pending background check
          </p>
        </button>

        {/* KPI 3: Avg. Rating */}
        <button
          type="button"
          onClick={() =>
            setActiveKpiFilter((prev) => (prev === "HIGH_RATING" ? "ALL" : "HIGH_RATING"))
          }
          className={`text-left bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 cursor-pointer overflow-hidden ${activeKpiFilter === "HIGH_RATING"
              ? "border-amber-500 ring-2 ring-amber-500/20 shadow-sm"
              : "border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-md"
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">Avg. Rating</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {avgRating}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/80 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-2">
            Based on 1.2k reviews
          </p>
        </button>

        {/* KPI 4: Compliance Rate */}
        <button
          type="button"
          onClick={() =>
            setActiveKpiFilter((prev) =>
              prev === "COMPLIANCE_GAP" ? "ALL" : "COMPLIANCE_GAP"
            )
          }
          className={`text-left bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 cursor-pointer overflow-hidden ${activeKpiFilter === "COMPLIANCE_GAP"
              ? "border-rose-500 ring-2 ring-rose-500/20 shadow-sm"
              : "border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">Compliance Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {avgCompliance}%
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] sm:text-xs font-semibold text-amber-600 mt-2">
            14 expiring credentials
          </p>
        </button>

        {/* KPI 5: Open Availability Gaps */}
        <div className="text-left bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-4.5 transition-all duration-200 overflow-hidden col-span-2 sm:col-span-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">Open Availability Gaps</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">12</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200/80 text-rose-500 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-2">
            Week of July 15-21
          </p>
        </div>
      </div>

      {/* 04. Search, Filter Bar & List/Grid View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search & Filter Dropdown */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search caregivers by name or role..."
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters Button & Menu */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${activeFiltersCount > 0
                  ? "bg-[#E8F2E4] text-[#1E5622] border-[#3D6B22]/30"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs"
                }`}
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#1B3414] text-white text-[11px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Filter Menu Popover */}
            {isFilterDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-40 animate-in fade-in zoom-in-95 duration-100 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Filter Caregivers
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-[#3D6B22] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Caregiver Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Clinical Role Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Clinical Credential / Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="RN">Registered Nurse (RN)</option>
                    <option value="CNA">Certified Nursing Assistant (CNA)</option>
                    <option value="HHA">Home Health Aide (HHA)</option>
                    <option value="PT">Physical Therapist (PT)</option>
                  </select>
                </div>

                {/* Compliance Tier Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Compliance Tier
                  </label>
                  <select
                    value={complianceFilter}
                    onChange={(e) => setComplianceFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D6B22]"
                  >
                    <option value="ALL">All Tiers</option>
                    <option value="100">100% Fully Compliant</option>
                    <option value="70_99">70% – 99% Near Compliance</option>
                    <option value="BELOW_70">&lt; 70% Action Required</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="px-3.5 py-1.5 bg-[#1B3414] text-white text-xs font-bold rounded-lg hover:bg-[#274C1D]"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Switcher: List vs Grid */}
        <div className="flex items-center justify-end gap-2">
          <div className="p-1 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === "grid"
                  ? "bg-[#E8F2E4] text-[#1E5622] shadow-2xs font-bold"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="List View"
              className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === "list"
                  ? "bg-[#E8F2E4] text-[#1E5622] shadow-2xs font-bold"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Pill Bar */}
      {(activeFiltersCount > 0 || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-medium">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Query: &quot;{searchQuery}&quot;
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:text-slate-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {statusFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20">
              Status: {statusFilter}
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className="hover:text-[#1B3414] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {roleFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20">
              Role: {roleFilter}
              <button
                type="button"
                onClick={() => setRoleFilter("ALL")}
                className="hover:text-[#1B3414] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {complianceFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20">
              Compliance: {complianceFilter}
              <button
                type="button"
                onClick={() => setComplianceFilter("ALL")}
                className="hover:text-[#1B3414] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeKpiFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20">
              KPI: {activeKpiFilter}
              <button
                type="button"
                onClick={() => setActiveKpiFilter("ALL")}
                className="hover:text-[#1B3414] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* 05. Main Caregiver Views: List vs Grid */}
      {paginatedCaregivers.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No caregivers found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No caregiver records match your search or active filter criteria.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : viewMode === "list" ? (
        /* ================= LIST VIEW (TABLE) ================= */
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Caregiver</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Rating</th>
                  <th className="py-3.5 px-4 text-center">Compliance</th>
                  <th className="py-3.5 px-4 text-center">Patients</th>
                  <th className="py-3.5 px-4 text-center">Last Active</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {paginatedCaregivers.map((cg) => {
                  const complianceStyle = getComplianceStyle(cg.complianceRate);
                  return (
                    <tr
                      key={cg.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Caregiver Name & Role */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitials(cg.name)}
                          </div>
                          <div>
                            <Link
                              href={`/admin/caregivers/${cg.id}`}
                              className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors hover:underline"
                            >
                              {cg.name}
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusStyle(
                            cg.status
                          )}`}
                        >
                          {cg.status}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{cg.rating.toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Compliance */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${complianceStyle.pillBg}`}
                        >
                          {complianceStyle.label}
                        </span>
                      </td>

                      {/* Patients */}
                      <td className="py-4 px-4 text-center font-medium text-slate-700">
                        {cg.activePatients} Active
                      </td>

                      {/* Last Active */}
                      <td className="py-4 px-4 text-center text-slate-600 font-medium">
                        {cg.lastActive}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          href={`/admin/caregivers/${cg.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:text-[#274C1D] hover:underline cursor-pointer"
                        >
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= GRID VIEW (CARDS) ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {paginatedCaregivers.map((cg) => {
            const complianceStyle = getComplianceStyle(cg.complianceRate);
            return (
              <div
                key={cg.id}
                className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Avatar, Name, Role & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                        {getInitials(cg.name)}
                      </div>
                      <div>
                        <Link
                          href={`/admin/caregivers/${cg.id}`}
                          className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors text-sm hover:underline block"
                        >
                          {cg.name}
                        </Link>
                        <p className="text-xs text-slate-500 font-medium">
                          {cg.role}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${getStatusStyle(
                        cg.status
                      )}`}
                    >
                      {cg.status}
                    </span>
                  </div>

                  {/* Micro Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100 text-center">
                    <div className="bg-slate-50/70 rounded-xl p-2 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Rating</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{cg.rating.toFixed(1)}</span>
                      </p>
                    </div>

                    <div className="bg-slate-50/70 rounded-xl p-2 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Compliance</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {cg.complianceRate}%
                      </p>
                    </div>

                    <div className="bg-slate-50/70 rounded-xl p-2 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Patients</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {cg.activePatients} Active
                      </p>
                    </div>
                  </div>

                  {/* Metadata / Contact */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Last Active:</span>
                      <span className="font-semibold text-slate-700">{cg.lastActive}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Branch:</span>
                      <span className="font-semibold text-slate-700">{cg.branch || "North Metro"}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${complianceStyle.pillBg}`}
                  >
                    {complianceStyle.label}
                  </span>

                  <Link
                    href={`/admin/caregivers/${cg.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:text-[#274C1D] group-hover:translate-x-0.5 transition-transform cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 06. Pagination Controls */}
      {filteredCaregivers.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs font-medium text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredCaregivers.length)} of{" "}
            {filteredCaregivers.length} caregivers
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
