"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Heart,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Search,
  Plus,
  Filter,
  List as ListIcon,
  LayoutGrid,
  ChevronDown,
  ArrowRight,
  MoreVertical,
  RotateCcw,
  User,
  ExternalLink,
  ShieldCheck,
  Home,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ClientRecord, ClientStatus, ClientRiskLevel } from "@/types/client";
import {
  getClientsFromStorage,
  getClientDiagnosis,
  getClientRiskLevel,
  normalizeClientStatus,
} from "@/lib/clients/mockData";
import { subscribeToIntakeSync, deleteClientFromStorage } from "@/lib/intake/intakeSync";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";

// Unified Client Model with clinical diagnosis, risk level, caregiver, next visit & auth status for Agency Admin
export interface AdminClientItem {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: ClientStatus;
  riskLevel: ClientRiskLevel;
  primaryDiagnosis: string;
  assignedCaregiver: string;
  nextVisit: string;
  authorizationStatus: "Verified" | "Expiring Soon" | "Pending Renewal" | "Expired";
  householdName?: string;
  householdCode?: string;
}

// Reference metadata enrichment for synchronized LiliSare clients
const SEED_ADMIN_CLIENTS: AdminClientItem[] = [
  {
    id: "CL-1002",
    name: "Marcus Whitfield",
    age: 72,
    gender: "Male",
    status: "Active",
    riskLevel: "High Risk",
    primaryDiagnosis: "s/p right hip ORIF, early-stage vascular dementia",
    assignedCaregiver: "Elena Whitfield (RN / W-2)",
    nextVisit: "Today, 2:00 PM",
    authorizationStatus: "Verified",
    householdName: "Whitfield Household",
    householdCode: "HH-1002",
  },
  {
    id: "CL-1004",
    name: "Jackson Vance",
    age: 6,
    gender: "Male",
    status: "On Hold",
    riskLevel: "Medium Risk",
    primaryDiagnosis: "Developmental Mobility Delay, Sensory Support",
    assignedCaregiver: "Maria Santos, BSN",
    nextVisit: "Start of Care Pending",
    authorizationStatus: "Pending Renewal",
    householdName: "Vance Household",
    householdCode: "HH-1004",
  },
  {
    id: "CL-1008",
    name: "Mary Smith",
    age: 65,
    gender: "Female",
    status: "Active",
    riskLevel: "Low Risk",
    primaryDiagnosis: "General Debility, Mild Cognitive Impairment",
    assignedCaregiver: "Tanya Brooks, HHA",
    nextVisit: "Tomorrow, 9:00 AM",
    authorizationStatus: "Verified",
    householdName: "Smith Family Care",
    householdCode: "HH-1008",
  },
  {
    id: "CL-1003",
    name: "Sarah Connor",
    age: 62,
    gender: "Female",
    status: "Active",
    riskLevel: "High Risk",
    primaryDiagnosis: "Severe Rheumatoid Arthritis, managing chronic pain",
    assignedCaregiver: "Jessica Taylor, RN",
    nextVisit: "Today, 4:30 PM",
    authorizationStatus: "Expiring Soon",
    householdName: "Connor Household",
    householdCode: "HH-1003",
  },
  {
    id: "CL-1005",
    name: "James Doe",
    age: 72,
    gender: "Male",
    status: "Hospitalized",
    riskLevel: "High Risk",
    primaryDiagnosis: "Early-onset dementia, Acute Respiratory Infection",
    assignedCaregiver: "David Kim, MSW",
    nextVisit: "Paused (Inpatient)",
    authorizationStatus: "Verified",
    householdName: "Doe Household",
    householdCode: "HH-1005",
  },
  {
    id: "CL-1006",
    name: "Martha Smith",
    age: 68,
    gender: "Female",
    status: "Active",
    riskLevel: "Low Risk",
    primaryDiagnosis: "General debility",
    assignedCaregiver: "Clara Jenkins, HHA",
    nextVisit: "Mon, 10:00 AM",
    authorizationStatus: "Verified",
    householdName: "Smith Household",
    householdCode: "HH-1006",
  },
  {
    id: "CL-1001",
    name: "Leo Miller",
    age: 8,
    gender: "Male",
    status: "Active",
    riskLevel: "Medium Risk",
    primaryDiagnosis: "Autism Spectrum Disorder (Level 2), Sensory Processing",
    assignedCaregiver: "Sarah Miller (W-2)",
    nextVisit: "Today, 8:00 AM",
    authorizationStatus: "Verified",
    householdName: "Miller Household",
    householdCode: "HH-1001",
  },
  {
    id: "CL-1007",
    name: "Raymond Chen",
    age: 80,
    gender: "Male",
    status: "Active",
    riskLevel: "Medium Risk",
    primaryDiagnosis: "Congestive Heart Failure (NYHA Class II), Hypertension",
    assignedCaregiver: "Evelyn Vance, RN",
    nextVisit: "Tomorrow, 11:30 AM",
    authorizationStatus: "Verified",
    householdName: "Chen Household",
    householdCode: "HH-1007",
  },
  {
    id: "CL-1009",
    name: "Robert Davis",
    age: 68,
    gender: "Male",
    status: "Discharged",
    riskLevel: "High Risk",
    primaryDiagnosis: "Type 2 Diabetes, Diabetic Neuropathy, Mobility Impairment",
    assignedCaregiver: "Unassigned",
    nextVisit: "Discharged",
    authorizationStatus: "Expired",
    householdName: "Davis Family Care",
    householdCode: "HH-1009",
  },
];

// Helper to extract 2-letter initials
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function AdminClientDirectory() {
  const router = useRouter();
  const perms = usePortalPermissions();

  // View state: 'list' or 'grid'
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Client items state
  const [items, setItems] = useState<AdminClientItem[]>(SEED_ADMIN_CLIENTS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminClientItem | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [activeKpiKey, setActiveKpiKey] = useState<"TOTAL" | "ACTIVE" | "HIGH_RISK" | "HOSPITALIZED">("TOTAL");

  // Pagination State: max 10 entries per page
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dropdown UI states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRiskDropdownOpen, setIsRiskDropdownOpen] = useState(false);
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const riskDropdownRef = useRef<HTMLDivElement>(null);

  // Sync with live storage and intake events
  useEffect(() => {
    setIsLoaded(true);

    const loadSyncedClients = () => {
      try {
        const stored = getClientsFromStorage();
        if (Array.isArray(stored) && stored.length > 0) {
          const mapped: AdminClientItem[] = stored.map((c) => {
            const seedMatch = SEED_ADMIN_CLIENTS.find((s) => s.id === c.id);
            const diagnosis = getClientDiagnosis(c);
            const risk = getClientRiskLevel(c);
            const mappedStatus = normalizeClientStatus(c.status);

            const assignedCaregiver =
              c.assignedCareTeam?.primaryCaregiver?.name ||
              seedMatch?.assignedCaregiver ||
              c.assignedCareTeam?.onboardingCoordinator?.name ||
              "Unassigned";

            const nextVisit =
              mappedStatus === "Discharged"
                ? "Discharged"
                : mappedStatus === "Hospitalized"
                  ? "Paused (Inpatient)"
                  : mappedStatus === "On Hold"
                    ? "Start of Care Pending"
                    : seedMatch?.nextVisit && seedMatch.status === "Active"
                      ? seedMatch.nextVisit
                      : c.carePlan?.frequency || "Scheduled";

            const authRaw = c.authorization?.status;
            const authorizationStatus: AdminClientItem["authorizationStatus"] =
              authRaw === "Verified" ||
              authRaw === "Expiring Soon" ||
              authRaw === "Pending Renewal" ||
              authRaw === "Expired"
                ? authRaw
                : seedMatch?.authorizationStatus || "Pending Renewal";

            return {
              id: c.id,
              name: c.name,
              age: c.age || 65,
              gender: c.gender || "Female",
              status: mappedStatus,
              riskLevel: risk,
              primaryDiagnosis: diagnosis,
              assignedCaregiver,
              nextVisit,
              authorizationStatus,
              householdName: c.household?.name,
              householdCode: c.household?.code,
            };
          });
          setItems(mapped);
        } else {
          setItems([]);
        }
      } catch {
        setItems(SEED_ADMIN_CLIENTS);
      }
    };

    loadSyncedClients();
    return subscribeToIntakeSync(loadSyncedClients);
  }, []);

  // Handle outside click to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (riskDropdownRef.current && !riskDropdownRef.current.contains(event.target as Node)) {
        setIsRiskDropdownOpen(false);
      }
      if (activeCardMenuId) {
        setActiveCardMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeCardMenuId]);

  // Computed KPI counts
  const kpis = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.status === "Active").length;
    const highRisk = items.filter((i) => i.riskLevel === "High Risk").length;
    const hospitalized = items.filter((i) => i.status === "Hospitalized").length;

    return { total, active, highRisk, hospitalized };
  }, [items]);

  // Filter clients based on search, status dropdown, risk dropdown, and active KPI card
  const filteredClients = useMemo(() => {
    return items.filter((client) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = client.name.toLowerCase().includes(query);
        const matchesDiag = client.primaryDiagnosis.toLowerCase().includes(query);
        const matchesId = client.id.toLowerCase().includes(query);
        const matchesRisk = client.riskLevel.toLowerCase().includes(query);
        const matchesStatus = client.status.toLowerCase().includes(query);
        if (!matchesName && !matchesDiag && !matchesId && !matchesRisk && !matchesStatus) {
          return false;
        }
      }

      // Status dropdown filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "High Risk") {
          if (client.riskLevel !== "High Risk") return false;
        } else if (client.status !== statusFilter) {
          return false;
        }
      }

      // Risk dropdown filter
      if (riskFilter !== "ALL" && client.riskLevel !== riskFilter) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, statusFilter, riskFilter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));

  // Reset to page 1 if current page exceeds total pages after filtering
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  // KPI card click handler
  const handleKpiCardClick = (key: "TOTAL" | "ACTIVE" | "HIGH_RISK" | "HOSPITALIZED") => {
    setActiveKpiKey(key);
    setCurrentPage(1);
    if (key === "TOTAL") {
      setStatusFilter("ALL");
      setRiskFilter("ALL");
    } else if (key === "ACTIVE") {
      setStatusFilter("Active");
      setRiskFilter("ALL");
    } else if (key === "HIGH_RISK") {
      setStatusFilter("ALL");
      setRiskFilter("High Risk");
    } else if (key === "HOSPITALIZED") {
      setStatusFilter("Hospitalized");
      setRiskFilter("ALL");
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setRiskFilter("ALL");
    setActiveKpiKey("TOTAL");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "ALL" || riskFilter !== "ALL";

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* =========================================================================
          1. PAGE HEADER (Matches Reference 1)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Clients Directory
          </h1>
        </div>

        <Link
          href="/admin/clients/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Client</span>
        </Link>
      </div>

      {/* =========================================================================
          2. EXECUTIVE KPI CARDS (4 Core Roster KPIs)
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Clients */}
        <div
          onClick={() => handleKpiCardClick("TOTAL")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "TOTAL"
            ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
            : "border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Clients</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100/80 border border-slate-200/80 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpis.total}
          </div>
        </div>

        {/* Card 2: Active Care */}
        <div
          onClick={() => handleKpiCardClick("ACTIVE")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "ACTIVE"
            ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
            : "border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Active Care</span>
            <div className="w-7 h-7 rounded-lg bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22]">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpis.active}
          </div>
        </div>

        {/* Card 3: High Risk */}
        <div
          onClick={() => handleKpiCardClick("HIGH_RISK")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "HIGH_RISK"
            ? "border-rose-500 shadow-md ring-2 ring-rose-500/15"
            : "border-slate-200 shadow-2xs hover:border-rose-300 hover:shadow-md"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">High Risk</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpis.highRisk}
          </div>
        </div>

        {/* Card 4: Hospitalized */}
        <div
          onClick={() => handleKpiCardClick("HOSPITALIZED")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "HOSPITALIZED"
            ? "border-amber-500 shadow-md ring-2 ring-amber-500/15"
            : "border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-md"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Hospitalized</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpis.hospitalized}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. SEARCH, DROPDOWN FILTERS & VIEW SWITCHER (List vs Grid)
         ========================================================================= */}
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
              placeholder="Search by client name, diagnosis, ID, or risk status..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: Status Dropdown Filter, Risk Dropdown Filter, View Toggle */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Status Dropdown Filter (Requested: "STATUS: Pill badges not needed, need it as dropdown filter") */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${statusFilter !== "ALL"
                  ? "bg-[#3D6B22]/10 border-[#3D6B22]/30 text-[#3D6B22]"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {statusFilter === "ALL"
                    ? "Status: All"
                    : statusFilter === "High Risk"
                      ? "Status: High Risk"
                      : `Status: ${statusFilter}`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Filter by Status
                  </div>
                  {[
                    { label: "All Clients", value: "ALL" },
                    { label: "Active", value: "Active" },
                    { label: "Hospitalized", value: "Hospitalized" },
                    { label: "On Hold", value: "On Hold" },
                    { label: "Discharged", value: "Discharged" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setCurrentPage(1);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors ${statusFilter === option.value
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

            {/* Risk Level Dropdown Filter */}
            <div className="relative" ref={riskDropdownRef}>
              <button
                type="button"
                onClick={() => setIsRiskDropdownOpen(!isRiskDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${riskFilter !== "ALL"
                  ? "bg-[#3D6B22]/10 border-[#3D6B22]/30 text-[#3D6B22] font-semibold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>{riskFilter === "ALL" ? "Risk Level" : riskFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRiskDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Clinical Risk
                  </div>
                  {[
                    { label: "All Risk Levels", value: "ALL" },
                    { label: "High Risk", value: "High Risk" },
                    { label: "Medium Risk", value: "Medium Risk" },
                    { label: "Low Risk", value: "Low Risk" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setRiskFilter(option.value);
                        setCurrentPage(1);
                        setIsRiskDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors ${riskFilter === option.value
                        ? "bg-[#3D6B22]/10 text-[#3D6B22] font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <span>{option.label}</span>
                      {riskFilter === option.value && (
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
                onClick={handleResetFilters}
                title="Reset all filters"
                className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
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
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === "list"
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
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === "grid"
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

      {/* =========================================================================
          4. CONTENT AREA: LIST VIEW vs GRID VIEW
         ========================================================================= */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No clients found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No records matched your search query or filter criteria. Try clearing filters to see all clients.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === "list" ? (
        /* =========================================================================
           LIST VIEW (Matches Reference 1 Table)
           ========================================================================= */
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Assigned Caregiver / RN
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Next Visit
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Authorization
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedClients.map((client) => {
                  const initials = getInitials(client.name);

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/admin/clients/${client.id}`)}
                    >
                      {/* Client */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3e6b2b] font-bold text-[10px] shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <span className="font-semibold text-xs text-slate-900 group-hover:text-[#3D6B22] transition-colors whitespace-nowrap">
                            {client.name}
                          </span>
                        </div>
                      </td>

                      {/* Diagnosis */}
                      <td className="py-4 px-4">
                        <p className="text-xs text-slate-700 font-medium max-w-[220px] truncate">
                          {client.primaryDiagnosis}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${client.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : client.status === "Hospitalized"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : client.status === "On Hold"
                                ? "bg-sky-50 text-sky-700 border-sky-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                        >
                          {client.status}
                        </span>
                      </td>

                      {/* Risk */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${client.riskLevel === "High Risk"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : client.riskLevel === "Medium Risk"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                        >
                          {client.riskLevel}
                        </span>
                      </td>

                      {/* Assigned Caregiver / RN */}
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-slate-700 whitespace-nowrap block max-w-[170px] truncate">
                          {client.assignedCaregiver}
                        </span>
                      </td>

                      {/* Next Visit */}
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                          {client.nextVisit}
                        </span>
                      </td>

                      {/* Authorization Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${client.authorizationStatus === "Verified"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : client.authorizationStatus === "Expiring Soon"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : client.authorizationStatus === "Pending Renewal"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                        >
                          {client.authorizationStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                          >
                            <span>View Profile</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          {perms.clients.canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(client)}
                              title="Delete Client (Agency Admin)"
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
        /* =========================================================================
           GRID VIEW (Matches Reference 2 Cards)
           ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {paginatedClients.map((client) => {
            const initials = getInitials(client.name);
            const isMenuOpen = activeCardMenuId === client.id;

            return (
              <div
                key={client.id}
                className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Card Header: Default Avatar, Name, Age • Gender, 3-Dots Menu */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Default Avatar (Initial Badge) */}
                      <div className="w-11 h-11 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3D6B22] font-bold text-sm shrink-0 shadow-2xs">
                        {initials}
                      </div>
                      <div>
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#3D6B22] transition-colors line-clamp-1"
                        >
                          {client.name}
                        </Link>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {client.age} yrs • {client.gender}
                        </p>
                      </div>
                    </div>

                    {/* Context Menu Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCardMenuId(isMenuOpen ? null : client.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <User className="w-3.5 h-3.5 text-[#3D6B22]" />
                            View Profile
                          </Link>
                          {client.householdCode && (
                            <Link
                              href={`/admin/households/${client.householdCode.toLowerCase()}`}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Home className="w-3.5 h-3.5 text-blue-600" />
                              View Household
                            </Link>
                          )}
                          <Link
                            href={`/admin/clients/${client.id}/edit`}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            Edit Record
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Status, Risk Level, Diagnosis */}
                  <div className="space-y-2.5 text-xs">
                    {/* Status Row */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Status</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${client.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : client.status === "Hospitalized"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : client.status === "On Hold"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                      >
                        {client.status}
                      </span>
                    </div>

                    {/* Risk Level Row */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Risk Level</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${client.riskLevel === "High Risk"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : client.riskLevel === "Medium Risk"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                      >
                        {client.riskLevel}
                      </span>
                    </div>

                    {/* Diagnosis Row */}
                    <div className="pt-1">
                      <span className="text-slate-500 font-medium block mb-1">Diagnosis</span>
                      <p className="text-slate-800 font-semibold text-xs leading-relaxed line-clamp-2">
                        {client.primaryDiagnosis}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer: View Profile link */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:text-[#345C1D] transition-colors"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {client.householdCode && (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                      {client.householdCode}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          5. GLOBAL STANDARDIZED PAGINATION BAR
         ========================================================================= */}
      {filteredClients.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredClients.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          entryLabel="clients"
          variant="standalone-card"
        />
      )}
      {/* Delete Client Confirmation Modal (Agency Admin Only) */}
      {perms.clients.canDelete && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Client Record"
          description="Permanent deletion removes this client across both Agency Admin and Intake directories."
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          maxWidth="sm"
        >
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-slate-900">{deleteTarget?.name}</strong> (
            {deleteTarget?.id})? For clinical/operational closures, prefer{" "}
            <strong>Discharge</strong> inside the client profile.
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
                deleteClientFromStorage(deleteTarget.id);
                setItems((prev) => prev.filter((c) => c.id !== deleteTarget.id));
                toast.success(`Client ${deleteTarget.name} removed.`);
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
