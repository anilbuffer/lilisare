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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  Trash2,
} from "lucide-react";
import { CaregiverRecord } from "@/types/caregiver";
import { getCaregiversFromStorage, INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { subscribeToIntakeSync, deleteCaregiverFromStorage } from "@/lib/intake/intakeSync";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import { Modal } from "@/components/ui/Modal";
import {
  SEED_ADMIN_CAREGIVERS,
  AdminCaregiverItem,
} from "@/lib/caregivers/adminCaregiversData";
import { AdminCaregiverTopTabs } from "./AdminCaregiverTopTabs";
import { CaregiverContactModal } from "@/components/caregivers/modals/CaregiverContactModal";
import { CaregiverScheduleShiftModal } from "@/components/caregivers/modals/CaregiverScheduleShiftModal";
import { toast } from "sonner";

export type { AdminCaregiverItem };

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
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
  const perms = usePortalPermissions();

  // View state: 'list' or 'grid' (default list per reference screenshot)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Caregivers state
  const [items, setItems] = useState<AdminCaregiverItem[]>(SEED_ADMIN_CAREGIVERS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCaregiverItem | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<"name" | "id">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [complianceFilter, setComplianceFilter] = useState<string>("ALL");
  const [activeKpiFilter, setActiveKpiFilter] = useState<
    "ALL" | "ACTIVE" | "ONBOARDING" | "HIGH_RATING" | "COMPLIANCE_GAP"
  >("ALL");

  // Dropdown states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverRecord | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Sync with storage on mount & live intake/admin events
  useEffect(() => {
    setIsLoaded(true);

    const buildAdminCaregiverItems = (stored: CaregiverRecord[]): AdminCaregiverItem[] => {
      const mappedFromStorage: AdminCaregiverItem[] = stored.map((cg) => {
        const seedMatch = SEED_ADMIN_CAREGIVERS.find(
          (s) => s.id === cg.id || s.numericId === cg.id
        );
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
        if (cg.status === "Active") mappedStatus = "Active";
        else if (cg.status === "Onboarding" || cg.status === "Pending") mappedStatus = "Onboarding";
        else if (cg.status === "On Hold") mappedStatus = "On Hold";
        else if (cg.status === "Inactive") mappedStatus = "Inactive";
        else if (seedMatch?.status) mappedStatus = seedMatch.status;

        const nameParts = cg.name.trim().split(" ");
        const sortName =
          seedMatch?.sortName ||
          (nameParts.length > 1
            ? `${nameParts[nameParts.length - 1]}, ${nameParts.slice(0, -1).join(" ")}`
            : cg.name);

        return {
          id: cg.id,
          numericId: seedMatch?.numericId || cg.id.replace(/\D/g, "") || "101",
          name: cg.name,
          sortName,
          role,
          status: mappedStatus,
          extStatus: seedMatch?.extStatus || (mappedStatus === "Active" ? "Active" : "In Review"),
          administrator: seedMatch?.administrator || "LiliSare Care Ops",
          gender: seedMatch?.gender || cg.personalInfo?.gender || "—",
          classes: seedMatch?.classes || [role],
          homePhone: seedMatch?.homePhone || cg.personalInfo?.secondaryPhone || "555-555-5555",
          mobilePhone: seedMatch?.mobilePhone || cg.personalInfo?.phone || "555-555-5555",
          rating,
          complianceRate,
          activePatients,
          lastActive: seedMatch?.lastActive || "Today",
          phone: cg.personalInfo?.phone || "(541) 555-0199",
          email: cg.personalInfo?.email || seedMatch?.email || "caregiver@lilisare.health",
          location:
            seedMatch?.location ||
            `${cg.personalInfo?.address?.street || "5525 Clovercrest Dr."}, ${cg.personalInfo?.address?.city || "Brentwood"}, ${cg.personalInfo?.address?.state || "TN"}`,
          age: seedMatch?.age || 38,
          branch: cg.branch || "Brentwood Hub",
          classification: cg.employmentClassification || "W-2",
        };
      });

      let deletedIds: string[] = [];
      try {
        const rawDel = localStorage.getItem("lilisare_deleted_admin_caregivers_v1");
        if (rawDel) deletedIds = JSON.parse(rawDel);
      } catch {
        // ignore
      }

      const missingSeeds = SEED_ADMIN_CAREGIVERS.filter(
        (s) =>
          !deletedIds.includes(s.id) &&
          !mappedFromStorage.some((m) => m.id === s.id || m.numericId === s.numericId)
      );
      return [...mappedFromStorage, ...missingSeeds];
    };

    const loadCaregivers = () => {
      try {
        const stored = getCaregiversFromStorage();
        if (Array.isArray(stored) && stored.length > 0) {
          setItems(buildAdminCaregiverItems(stored));
        } else {
          setItems(SEED_ADMIN_CAREGIVERS);
        }
      } catch {
        setItems(SEED_ADMIN_CAREGIVERS);
      }
    };

    loadCaregivers();
    return subscribeToIntakeSync(loadCaregivers);
  }, []);

  // Handle outside click for filter dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleDropdownOpen(false);
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

  // Filter & Search Logic
  const filteredCaregivers = useMemo(() => {
    const list = items.filter((cg) => {
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = cg.name.toLowerCase().includes(query);
        const matchesSortName = (cg.sortName || "").toLowerCase().includes(query);
        const matchesRole = cg.role.toLowerCase().includes(query);
        const matchesId = cg.id.toLowerCase().includes(query);
        const matchesNumId = (cg.numericId || "").includes(query);
        const matchesEmail = cg.email.toLowerCase().includes(query);
        const matchesAdmin = (cg.administrator || "").toLowerCase().includes(query);
        if (
          !matchesName &&
          !matchesSortName &&
          !matchesRole &&
          !matchesId &&
          !matchesNumId &&
          !matchesEmail &&
          !matchesAdmin
        ) {
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
        if (roleFilter === "RN" && !cg.role.includes("RN") && !cg.role.includes("Registered Nurse"))
          return false;
        if (roleFilter === "CNA" && !cg.role.includes("CNA") && !cg.role.includes("Certified Nurs"))
          return false;
        if (roleFilter === "HHA" && !cg.role.includes("HHA") && !cg.role.includes("Home Health"))
          return false;
        if (roleFilter === "HM" && !cg.role.includes("Homemaker")) return false;
      }

      // Compliance filter
      if (complianceFilter !== "ALL") {
        if (complianceFilter === "100" && cg.complianceRate !== 100) return false;
        if (complianceFilter === "70_99" && (cg.complianceRate < 70 || cg.complianceRate >= 100))
          return false;
        if (complianceFilter === "BELOW_70" && cg.complianceRate >= 70) return false;
      }

      return true;
    });

    // Sort list
    return list.sort((a, b) => {
      if (sortField === "name") {
        const nameA = a.sortName || a.name;
        const nameB = b.sortName || b.name;
        return sortDirection === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        const idA = parseInt(a.numericId || a.id.replace(/\D/g, "") || "0", 10);
        const idB = parseInt(b.numericId || b.id.replace(/\D/g, "") || "0", 10);
        return sortDirection === "asc" ? idA - idB : idB - idA;
      }
    });
  }, [
    items,
    searchQuery,
    activeKpiFilter,
    statusFilter,
    roleFilter,
    complianceFilter,
    sortField,
    sortDirection,
  ]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter, complianceFilter, activeKpiFilter, sortDirection]);

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

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "ALL" ||
    roleFilter !== "ALL" ||
    complianceFilter !== "ALL" ||
    activeKpiFilter !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setRoleFilter("ALL");
    setComplianceFilter("ALL");
    setActiveKpiFilter("ALL");
  };

  // Helper to open modals with a synthetic CaregiverRecord
  const getRecordForModal = (cg: AdminCaregiverItem): CaregiverRecord => {
    const rawAll = getCaregiversFromStorage();
    const existing = rawAll.find((c) => c.id === cg.id);
    if (existing) return existing;

    const base = INITIAL_CAREGIVERS[0];
    return {
      ...base,
      id: cg.id,
      name: cg.name,
      status: cg.status,
      personalInfo: {
        ...base.personalInfo,
        phone: cg.phone || "(541) 555-0199",
        email: cg.email || "caregiver@lilisare.health",
      },
    };
  };

  const handleOpenContact = (cg: AdminCaregiverItem) => {
    setSelectedCaregiver(getRecordForModal(cg));
    setIsContactModalOpen(true);
  };

  const handleOpenSchedule = (cg: AdminCaregiverItem) => {
    setSelectedCaregiver(getRecordForModal(cg));
    setIsScheduleModalOpen(true);
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Caregivers Directory
          </h1>
        </div>

        {/* Actions Bar & Connected Workflows */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href="/admin/evv-visits/"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#3D6B22]" />
            <span>EVV Monitoring</span>
          </Link>
          <Link
            href="/admin/scheduling/"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#3D6B22]" />
            <span>Scheduling</span>
          </Link>
          <Link
            href="/admin/caregivers/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Caregiver</span>
          </Link>
        </div>
      </div>

      {/* 02. Navigation Tabs */}
      <AdminCaregiverTopTabs activeTab="roster" />

      {/* 03. 4 Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Active Caregivers */}
        <button
          type="button"
          onClick={() => setActiveKpiFilter((prev) => (prev === "ACTIVE" ? "ALL" : "ACTIVE"))}
          className={`text-left bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden ${activeKpiFilter === "ACTIVE"
            ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
            : "border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">Active Caregivers</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {activeCount || 18}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Card 2: Onboarding */}
        <button
          type="button"
          onClick={() =>
            setActiveKpiFilter((prev) => (prev === "ONBOARDING" ? "ALL" : "ONBOARDING"))
          }
          className={`text-left bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden ${activeKpiFilter === "ONBOARDING"
            ? "border-purple-600 ring-2 ring-purple-600/20 shadow-md"
            : "border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">Onboarding</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {onboardingCount || 1}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Card 3: Avg. Rating */}
        <button
          type="button"
          onClick={() =>
            setActiveKpiFilter((prev) => (prev === "HIGH_RATING" ? "ALL" : "HIGH_RATING"))
          }
          className={`text-left bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden ${activeKpiFilter === "HIGH_RATING"
            ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
            : "border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">Avg. Rating</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">{avgRating}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
        </button>

        {/* Card 4: EVV Compliance */}
        <button
          type="button"
          onClick={() =>
            setActiveKpiFilter((prev) => (prev === "COMPLIANCE_GAP" ? "ALL" : "COMPLIANCE_GAP"))
          }
          className={`text-left bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden ${activeKpiFilter === "COMPLIANCE_GAP"
            ? "border-rose-500 ring-2 ring-rose-500/20 shadow-md"
            : "border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500">Compliance Rate</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">98%</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* 04. Search & Filter Bar */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, class, administrator, or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
            />
          </div>

          {/* Filter Dropdowns & View Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Dropdown Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${statusFilter !== "ALL"
                  ? "bg-[#3D6B22]/10 border-[#3D6B22]/30 text-[#3D6B22] font-semibold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>{statusFilter === "ALL" ? "Status: All" : statusFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { label: "All Statuses", value: "ALL" },
                    { label: "Active", value: "Active" },
                    { label: "Onboarding", value: "Onboarding" },
                    { label: "On Hold", value: "On Hold" },
                    { label: "Inactive", value: "Inactive" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(option.value);
                        setCurrentPage(1);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${statusFilter === option.value
                        ? "bg-[#3D6B22]/10 text-[#3D6B22] font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <span>{option.label}</span>
                      {statusFilter === option.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3D6B22]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Dropdown Filter */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${roleFilter !== "ALL"
                  ? "bg-[#3D6B22]/10 border-[#3D6B22]/30 text-[#3D6B22] font-semibold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>
                  {roleFilter === "ALL"
                    ? "Role: All"
                    : roleFilter === "RN"
                      ? "Registered Nurse"
                      : roleFilter === "CNA"
                        ? "Certified Nurse Aide"
                        : roleFilter === "HHA"
                          ? "Home Health Aide"
                          : "Homemaker"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Clinical Class
                  </div>
                  {[
                    { label: "All Roles", value: "ALL" },
                    { label: "Registered Nurse (RN)", value: "RN" },
                    { label: "Certified Nurse Aide (CNA)", value: "CNA" },
                    { label: "Home Health Aide (HHA)", value: "HHA" },
                    { label: "Homemaker", value: "HM" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setRoleFilter(option.value);
                        setCurrentPage(1);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${roleFilter === option.value
                        ? "bg-[#3D6B22]/10 text-[#3D6B22] font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <span>{option.label}</span>
                      {roleFilter === option.value && (
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
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
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
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === "list"
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
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === "grid"
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

      {/* 05. Main Caregivers Table - 12 Columns matching Reference Image 2 */}
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
        /* ================= LIST VIEW (MATCHING LILISARE BRAND QUALITY /ADMIN/CLIENTS/) ================= */
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Caregiver
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Role / Class
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                    Compliance
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Phone
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCaregivers.map((cg) => {
                  const initials = getInitials(cg.name);
                  // Clean single phone: mobile or primary without the "(h)" or "(m)" tags
                  const singlePhone =
                    cg.mobilePhone?.replace(/\s*\([a-z]\)/gi, "").trim() ||
                    cg.phone?.replace(/\s*\([a-z]\)/gi, "").trim() ||
                    cg.homePhone?.replace(/\s*\([a-z]\)/gi, "").trim() ||
                    "—";

                  const roleDisplay =
                    cg.classes && cg.classes.length > 0
                      ? cg.classes.join(" • ")
                      : cg.role || "Caregiver";

                  return (
                    <tr
                      key={cg.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/admin/caregivers/${cg.id}`)}
                    >
                      {/* Caregiver Name & Avatar */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3D6B22] font-semibold text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                              {cg.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role / Class */}
                      <td className="py-4 px-4 sm:px-6">
                        <p className="text-xs text-slate-700 font-medium max-w-xs md:max-w-md truncate">
                          {roleDisplay}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 sm:px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cg.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : cg.status === "Onboarding"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : cg.status === "On Hold"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                        >
                          {cg.status}
                        </span>
                      </td>

                      {/* Compliance */}
                      <td className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${(cg.complianceRate ?? 100) >= 90
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : (cg.complianceRate ?? 100) >= 75
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                        >
                          {(cg.complianceRate ?? 100)}% Compliant
                        </span>
                      </td>

                      {/* Phone - Single Clean Phone (Hidden on mobile for responsiveness) */}
                      <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                        <span className="text-xs text-slate-700 font-medium">
                          {singlePhone}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/admin/caregivers/${cg.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                          >
                            <span>View Profile</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          {perms.caregivers.canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(cg)}
                              title="Delete Caregiver (Agency Admin)"
                              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
            const displayId = cg.numericId || cg.id.replace(/\D/g, "") || "101";
            return (
              <div
                key={cg.id}
                className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                        {getInitials(cg.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/caregivers/${cg.id}`}
                            className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors text-sm hover:underline"
                          >
                            {cg.name}
                          </Link>
                          <span className="text-[10px] font-semibold text-slate-400">
                            #{displayId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{cg.role}</p>
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

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-slate-100 text-center">
                    <div className="bg-slate-50/70 rounded-xl p-2 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Supervisor</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                        {cg.administrator || "Mackenzie B."}
                      </p>
                    </div>

                    <div className="bg-slate-50/70 rounded-xl p-2 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                        Brentwood, TN
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Phone:</span>
                      <span className="font-semibold text-slate-700 ">
                        {cg.mobilePhone || cg.phone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Email:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                        {cg.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/caregivers/${cg.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenSchedule(cg)}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                      title="Schedule shift"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenContact(cg)}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                      title="Contact caregiver"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* Action Modals */}
      {selectedCaregiver && (
        <>
          <CaregiverContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            caregiver={selectedCaregiver}
            onLogCommunication={(_id, type, note) => {
              toast.success(`Logged ${type.toUpperCase()} for ${selectedCaregiver.name}`);
            }}
          />
          <CaregiverScheduleShiftModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            caregiver={selectedCaregiver}
            onScheduleShift={(_id, shift) => {
              toast.success(`Scheduled ${shift.type || "shift"} with ${shift.clientName}`);
            }}
          />
        </>
      )}
      {/* Delete Caregiver Confirmation Modal (Agency Admin Only) */}
      {perms.caregivers.canDelete && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Caregiver Record"
          description="Permanent deletion removes this caregiver across both Agency Admin and Intake directories."
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          maxWidth="sm"
        >
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-slate-900">{deleteTarget?.name}</strong> (
            {deleteTarget?.id})?
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
                deleteCaregiverFromStorage(deleteTarget.id);
                try {
                  const rawDel = localStorage.getItem("lilisare_deleted_admin_caregivers_v1");
                  const prevDel: string[] = rawDel ? JSON.parse(rawDel) : [];
                  if (!prevDel.includes(deleteTarget.id)) {
                    localStorage.setItem(
                      "lilisare_deleted_admin_caregivers_v1",
                      JSON.stringify([...prevDel, deleteTarget.id])
                    );
                  }
                } catch {
                  // ignore
                }
                setItems((prev) => prev.filter((c) => c.id !== deleteTarget.id));
                toast.success(`Caregiver ${deleteTarget.name} removed.`);
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
