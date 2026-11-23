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
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MoreVertical,
  RotateCcw,
  User,
  ExternalLink,
  ShieldCheck,
  Home,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { getClientsFromStorage } from "@/lib/clients/mockData";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";

// Unified Client Model with clinical diagnosis & risk level for Agency Admin
export interface AdminClientItem {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: "Active" | "Hospitalized" | "Care Completed" | "Discharged" | "Onboarding";
  riskLevel: "High Risk" | "Medium Risk" | "Low Risk";
  primaryDiagnosis: string;
  householdName?: string;
  householdCode?: string;
}

// Reference clients matching the user's provided screenshots + existing LiliSare data
const SEED_ADMIN_CLIENTS: AdminClientItem[] = [
  {
    id: "CL-1002",
    name: "Eleanor Ruth Whitfield",
    age: 78,
    gender: "Female",
    status: "Active",
    riskLevel: "High Risk",
    primaryDiagnosis: "s/p right hip ORIF, early-stage vascular dementia",
    householdName: "Whitfield Residence",
    householdCode: "HH-1002",
  },
  {
    id: "CL-1004",
    name: "John Doe",
    age: 76,
    gender: "Male",
    status: "Hospitalized",
    riskLevel: "High Risk",
    primaryDiagnosis: "Post-Stroke Recovery",
    householdName: "Doe Household",
    householdCode: "HH-1004",
  },
  {
    id: "CL-1008",
    name: "Mary Smith",
    age: 65,
    gender: "Female",
    status: "Care Completed",
    riskLevel: "Low Risk",
    primaryDiagnosis: "Routine Checkup",
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
    householdName: "Connor Household",
    householdCode: "HH-1003",
  },
  {
    id: "CL-1005",
    name: "James Doe",
    age: 72,
    gender: "Male",
    status: "Active",
    riskLevel: "Medium Risk",
    primaryDiagnosis: "Early-onset dementia",
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

  // View state: 'list' or 'grid'
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Client items state
  const [items, setItems] = useState<AdminClientItem[]>(SEED_ADMIN_CLIENTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [activeKpiKey, setActiveKpiKey] = useState<"TOTAL" | "ACTIVE" | "HIGH_RISK" | "HOSPITALIZED" | "COMPLETED">("TOTAL");

  // Pagination State: max 10 entries per page
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dropdown UI states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRiskDropdownOpen, setIsRiskDropdownOpen] = useState(false);
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const riskDropdownRef = useRef<HTMLDivElement>(null);

  // Sync with storage and intake events
  useEffect(() => {
    setIsLoaded(true);
    try {
      const stored = getClientsFromStorage();
      if (Array.isArray(stored) && stored.length > 0) {
        // Map stored records into admin presentation format
        const mapped: AdminClientItem[] = stored.map((c) => {
          // Check if seed has a diagnosis for this ID
          const seedMatch = SEED_ADMIN_CLIENTS.find((s) => s.id === c.id);
          const diagnosis =
            seedMatch?.primaryDiagnosis ||
            c.carePlan?.careNeeds?.[0] ||
            c.carePlan?.program ||
            "Comprehensive In-Home Support";

          let risk: "High Risk" | "Medium Risk" | "Low Risk" = "Low Risk";
          if (seedMatch) {
            risk = seedMatch.riskLevel;
          } else if (c.readiness?.overallScore && c.readiness.overallScore < 70) {
            risk = "High Risk";
          } else if (c.readiness?.documents === "Review needed" || c.status === "On Hold") {
            risk = "Medium Risk";
          }

          let mappedStatus: AdminClientItem["status"] = "Active";
          if (seedMatch?.status) {
            mappedStatus = seedMatch.status;
          } else if (c.status === "Active") {
            mappedStatus = "Active";
          } else if (c.status === "Discharged") {
            mappedStatus = "Discharged";
          } else if (c.status === "Onboarding") {
            mappedStatus = "Onboarding";
          }

          return {
            id: c.id,
            name: c.name,
            age: c.age || 65,
            gender: c.gender || "Female",
            status: mappedStatus,
            riskLevel: risk,
            primaryDiagnosis: diagnosis,
            householdName: c.household?.name,
            householdCode: c.household?.code,
          };
        });

        // Ensure all reference items are present in case stored is partial
        const missingSeeds = SEED_ADMIN_CLIENTS.filter(
          (s) => !mapped.some((m) => m.id === s.id)
        );
        setItems([...mapped, ...missingSeeds]);
      } else {
        setItems(SEED_ADMIN_CLIENTS);
      }
    } catch {
      setItems(SEED_ADMIN_CLIENTS);
    }

    const unsubscribe = subscribeToIntakeSync(() => {
      // Re-trigger load if intake converts a lead into a client
      const freshStored = getClientsFromStorage();
      if (Array.isArray(freshStored) && freshStored.length > 0) {
        // preserve enriched items
        setItems((prev) => {
          const newOnes = freshStored.filter((f) => !prev.some((p) => p.id === f.id));
          if (newOnes.length === 0) return prev;
          const mappedNew: AdminClientItem[] = newOnes.map((c) => ({
            id: c.id,
            name: c.name,
            age: c.age || 65,
            gender: c.gender || "Female",
            status: "Active",
            riskLevel: "Medium Risk",
            primaryDiagnosis: c.carePlan?.program || "Personal Care Assistance",
            householdName: c.household?.name,
            householdCode: c.household?.code,
          }));
          return [...mappedNew, ...prev];
        });
      }
    });

    return () => unsubscribe();
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
    const completed = items.filter((i) => i.status === "Care Completed").length;

    return { total, active, highRisk, hospitalized, completed };
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
  const handleKpiCardClick = (key: "TOTAL" | "ACTIVE" | "HIGH_RISK" | "HOSPITALIZED" | "COMPLETED") => {
    setActiveKpiKey(key);
    setCurrentPage(1);
    if (key === "TOTAL") {
      setStatusFilter("ALL");
      setRiskFilter("ALL");
    } else if (key === "ACTIVE") {
      setStatusFilter("Active");
    } else if (key === "HIGH_RISK") {
      setStatusFilter("High Risk");
    } else if (key === "HOSPITALIZED") {
      setStatusFilter("Hospitalized");
    } else if (key === "COMPLETED") {
      setStatusFilter("Care Completed");
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* =========================================================================
          1. PAGE HEADER (Matches Reference 1)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Clients Directory
          </h1>
        </div>

        <Link
          href="/admin/clients/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3D6B22] hover:bg-[#345C1D] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Client</span>
        </Link>
      </div>

      {/* =========================================================================
          2. EXECUTIVE KPI CARDS (Matches Reference 1 - 5 Filter Cards)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Clients */}
        <div
          onClick={() => handleKpiCardClick("TOTAL")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${
            activeKpiKey === "TOTAL"
              ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
              : "border-slate-200 shadow-2xs hover:border-[#3D6B22]/50 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Total Clients</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {kpis.total}
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>{filteredClients.length} loaded in view</span>
            {activeKpiKey === "TOTAL" && (
              <span className="text-[10px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 px-1.5 py-0.5 rounded border border-[#3D6B22]/20">
                ACTIVE FILTER
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Active Care */}
        <div
          onClick={() => handleKpiCardClick("ACTIVE")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${
            activeKpiKey === "ACTIVE"
              ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
              : "border-slate-200 shadow-2xs hover:border-[#3D6B22]/50 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Active Care</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#3D6B22]">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {kpis.active}
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate">
            On active service, not discharged.
          </div>
        </div>

        {/* Card 3: High Risk Alert */}
        <div
          onClick={() => handleKpiCardClick("HIGH_RISK")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${
            activeKpiKey === "HIGH_RISK"
              ? "border-rose-500 shadow-md ring-2 ring-rose-500/15"
              : "border-slate-200 shadow-2xs hover:border-rose-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">High Risk Alert</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {kpis.highRisk}
          </div>
          <div className="text-[11px] font-medium text-rose-600 truncate">
            Requires priority monitoring
          </div>
        </div>

        {/* Card 4: Hospitalized */}
        <div
          onClick={() => handleKpiCardClick("HOSPITALIZED")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${
            activeKpiKey === "HOSPITALIZED"
              ? "border-amber-500 shadow-md ring-2 ring-amber-500/15"
              : "border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Hospitalized</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {kpis.hospitalized}
          </div>
          <div className="text-[11px] font-medium text-amber-700 truncate">
            Inpatient / Temp Hold
          </div>
        </div>

        {/* Card 5: Care Completed */}
        <div
          onClick={() => handleKpiCardClick("COMPLETED")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${
            activeKpiKey === "COMPLETED"
              ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
              : "border-slate-200 shadow-2xs hover:border-[#3D6B22]/50 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Care Completed</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {kpis.completed}
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate">
            No longer on active service
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
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  statusFilter !== "ALL"
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
                    { label: "High Risk", value: "High Risk" },
                    { label: "Hospitalized", value: "Hospitalized" },
                    { label: "Discharged", value: "Discharged" },
                    { label: "Care Completed", value: "Care Completed" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setCurrentPage(1);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                        statusFilter === option.value
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
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  riskFilter !== "ALL"
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
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                        riskFilter === option.value
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
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "list"
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
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === "grid"
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
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Client Details
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Primary Diagnosis
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
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
                      {/* Client Details: Default Avatar + Name + Age • Gender */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {/* Default Avatar (Initial Badge) */}
                          <div className="w-10 h-10 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3D6B22] font-bold text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                              {client.name}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">
                              {client.age} yrs • {client.gender}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 sm:px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            client.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : client.status === "Hospitalized"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : client.status === "Care Completed"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : client.status === "Discharged"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>

                      {/* Risk Level */}
                      <td className="py-4 px-4 sm:px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            client.riskLevel === "High Risk"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : client.riskLevel === "Medium Risk"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {client.riskLevel}
                        </span>
                      </td>

                      {/* Primary Diagnosis */}
                      <td className="py-4 px-4 sm:px-6">
                        <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xs md:max-w-md truncate">
                          {client.primaryDiagnosis}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:text-[#345C1D] hover:underline"
                        >
                          <span>View Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
                className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-[#3D6B22]/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group"
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
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          client.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : client.status === "Hospitalized"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : client.status === "Care Completed"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : client.status === "Discharged"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>

                    {/* Risk Level Row */}
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Risk Level</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          client.riskLevel === "High Risk"
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
          5. PAGINATION BAR (Max 10 entries per page)
         ========================================================================= */}
      {filteredClients.length > 0 && (
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 px-4 py-3.5 sm:px-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{Math.min((currentPage - 1) * pageSize + 1, filteredClients.length)}</span> to{" "}
            <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, filteredClients.length)}</span> of{" "}
            <span className="font-bold text-slate-900">{filteredClients.length}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-[#3D6B22] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-1 cursor-pointer"
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
