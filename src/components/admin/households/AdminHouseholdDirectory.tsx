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
} from "lucide-react";
import { toast } from "sonner";
import {
  MOCK_HOUSEHOLDS,
  Household,
  getHouseholdsFromStorage,
  saveHouseholdsToStorage,
} from "@/lib/households/mockData";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function AdminHouseholdDirectory() {
  const router = useRouter();

  // State
  const [householdsList, setHouseholdsList] =
    useState<Household[]>(MOCK_HOUSEHOLDS);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeKpiKey, setActiveKpiKey] = useState<
    "ALL" | "ACTIVE" | "EXPIRING" | "BOTTLENECK" | "HIGH_EVV"
  >("ALL");

  // Filter Dropdown state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Household for Quick Review Drawer
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Household Form State
  const [formName, setFormName] = useState("");
  const [formClientName, setFormClientName] = useState("");
  const [formCaregiverName, setFormCaregiverName] = useState("");
  const [formProgram, setFormProgram] = useState("Medicaid Waiver (CHC)");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("Springfield");
  const [formZip, setFormZip] = useState("19087");
  const [formHours, setFormHours] = useState(30);

  // Initialize from storage & sync
  useEffect(() => {
    const stored = getHouseholdsFromStorage();
    if (stored && stored.length > 0) {
      setHouseholdsList(stored);
    }
  }, []);

  // Close filter dropdown on outside click
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

  // Executive KPI calculations
  const kpiStats = useMemo(() => {
    const total = householdsList.length;
    const activeCareCount = householdsList.filter(
      (h) => h.authStatus === "Approved"
    ).length;
    const expiringCount = householdsList.filter(
      (h) => h.authStatus === "Expiring Soon" || h.authStatus === "Pending Review"
    ).length;
    const totalClients = total; // 1 client per primary household in sample
    const bottleneckCount = householdsList.filter(
      (h) => Boolean(h.triJourneyStatus.bottleneckMessage)
    ).length;

    return {
      totalHouseholds: total,
      activeCareCount,
      totalClients: totalClients + 6, // connected multi-client households
      connectedCaregivers: total + 13,
      authUtilization: "94.8%",
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

  const activeFiltersCount =
    (selectedProgram !== "ALL" ? 1 : 0) +
    (selectedStatus !== "ALL" ? 1 : 0) +
    (activeKpiKey !== "ALL" ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedProgram("ALL");
    setSelectedStatus("ALL");
    setActiveKpiKey("ALL");
    setCurrentPage(1);
  };

  const handleAddHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formClientName.trim()) {
      toast.error("Please fill in Household Name and Client Name");
      return;
    }

    const nextCodeNum = 1000 + householdsList.length + 1;
    const newHh: Household = {
      id: `hh-${nextCodeNum}`,
      code: `HH-${nextCodeNum}`,
      name: formName.trim(),
      address: formAddress || "100 Maple Avenue",
      city: formCity,
      state: "PA",
      zip: formZip,
      phone: "(555) 000-0000",
      program: formProgram,
      caseManager: {
        name: "Dana Jenkins, MSW",
        agency: "State Dept of Human Services",
        email: "dana.jenkins@dhs.state.gov",
        phone: "(555) 432-8765",
      },
      client: {
        id: `cl-${nextCodeNum}`,
        name: formClientName.trim(),
        role: "client",
        relationship: "Self",
        status: "Active",
        phone: "(555) 000-0000",
        email: `${formClientName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      },
      primaryCaregiver: {
        id: `cg-${nextCodeNum}`,
        name: formCaregiverName.trim() || "Elena Rodriguez",
        role: "caregiver",
        relationship: "Agency Caregiver",
        status: "Active",
        phone: "(555) 345-6789",
        email: "elena.r@lilisare.com",
      },
      authorizedHoursPerWeek: Number(formHours) || 30,
      scheduledHoursPerWeek: Math.max(0, Number(formHours) - 4) || 26,
      authStatus: "Approved",
      authExpiry: "2027-11-01",
      triJourneyStatus: {
        clientStage: "Care Active",
        caregiverStage: "Active",
        opsStage: "Scheduling",
      },
      evvComplianceRate: 98,
      lastVisitDate: "Today",
    };

    const updated = [newHh, ...householdsList];
    setHouseholdsList(updated);
    saveHouseholdsToStorage(updated);
    toast.success(`Household ${newHh.name} (${newHh.code}) registered`);
    setIsAddModalOpen(false);

    // Reset Form
    setFormName("");
    setFormClientName("");
    setFormCaregiverName("");
    setFormAddress("");
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Households Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Integrated Three-Journey management (Client, Caregiver, Agency Operations) across LiliSare households.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Household</span>
        </button>
      </div>

      {/* 02. Executive KPI Cards (Harmonized with Clients, Caregivers, Referrals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Active Households */}
        <div
          onClick={() => setActiveKpiKey(activeKpiKey === "ALL" ? "ALL" : "ALL")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "ALL"
            ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
            : "border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Total Households</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {kpiStats.totalHouseholds}
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>{householdsList.length} registered in roster</span>
            {activeKpiKey === "ALL" && (
              <span className="text-[10px] font-bold text-[#3D6B22] bg-[#E8F2E4] px-1.5 py-0.5 rounded border border-[#3D6B22]/20">
                ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Connected Clients */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Connected Clients</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#3D6B22]">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {kpiStats.totalClients}
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate">
            Patients receiving in-home care
          </div>
        </div>

        {/* Card 3: Connected Caregivers */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Assigned Staff</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {kpiStats.connectedCaregivers}
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate">
            Nurses, aides, & companions
          </div>
        </div>

        {/* Card 4: Auth Utilization Rate */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Auth Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#3D6B22]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {kpiStats.authUtilization}
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate">
            Scheduled vs authorized hours
          </div>
        </div>

        {/* Card 5: Operational Bottlenecks */}
        <div
          onClick={() =>
            setActiveKpiKey(activeKpiKey === "BOTTLENECK" ? "ALL" : "BOTTLENECK")
          }
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "BOTTLENECK"
            ? "border-amber-500 shadow-md ring-2 ring-amber-500/15"
            : "border-slate-200 shadow-2xs hover:border-amber-300 hover:shadow-md"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Action Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {kpiStats.bottleneckCount}
          </div>
          <div className="text-[11px] font-medium text-amber-700 truncate">
            Auth renewals or schedule gaps
          </div>
        </div>
      </div>

      {/* 03. Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search households by name, client, caregiver, or address..."
              className="w-full pl-10 pr-9 py-2.5 bg-white rounded-full border border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 bg-white border rounded-full text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer ${activeFiltersCount > 0
                ? "border-[#3D6B22] text-[#1E5622] bg-[#E8F2E4]"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#3D6B22] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-30 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Filter Households</span>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="text-[11px] text-[#3D6B22] font-semibold hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Program Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Care Program
                  </label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#3D6B22]"
                  >
                    <option value="ALL">All Programs</option>
                    <option value="Waiver">Medicaid Waiver</option>
                    <option value="VA">VA Community Care</option>
                    <option value="Private">Private Pay</option>
                    <option value="CES">CES Pediatric</option>
                  </select>
                </div>

                {/* Auth Status Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Authorization Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#3D6B22]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* View Switcher (List vs Grid) */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === "list"
                ? "bg-white text-[#1E5622] shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
                }`}
              title="Table List View"
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden md:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === "grid"
                ? "bg-white text-[#1E5622] shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
                }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* 04. Households Content */}
      {viewMode === "list" ? (
        /* ======================== LIST VIEW ======================== */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-6 py-4">Household</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Primary Caregiver</th>
                  <th className="px-6 py-4">Program</th>
                  <th className="px-6 py-4">Weekly Hours</th>
                  <th className="px-6 py-4">Tri-Journey Stage</th>
                  <th className="px-6 py-4 text-right">Action</th>
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
                          <div className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                            {hh.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-xs sm:text-sm">
                        {hh.client.name}
                      </div>
                    </td>

                    {/* Primary Caregiver */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                        {hh.primaryCaregiver.name}
                      </div>
                    </td>

                    {/* Program */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 text-xs truncate max-w-[180px]">
                        {hh.program}
                      </div>
                    </td>

                    {/* Hours */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {hh.scheduledHoursPerWeek} / {hh.authorizedHoursPerWeek}h
                        </span>
                        <span className="text-[11px] text-slate-400">/wk</span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-[#3D6B22] rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (hh.scheduledHoursPerWeek / hh.authorizedHoursPerWeek) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* Tri-Journey Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${hh.authStatus === "Approved"
                          ? "bg-[#E8F2E4] text-[#1E5622] border-[#3D6B22]/30"
                          : hh.authStatus === "Expiring Soon"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-purple-50 text-purple-800 border-purple-200"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${hh.authStatus === "Approved"
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
                      <Link
                        href={`/admin/households/${hh.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#E8F2E4] border border-slate-200 hover:border-[#3D6B22]/40 text-slate-700 hover:text-[#1E5622] rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#3D6B22]" />
                      </Link>
                    </td>
                  </tr>
                ))}

                {paginatedHouseholds.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
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
              className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group"
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

                {/* Weekly Hours Progress */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Authorization Fulfillment</span>
                    <span className="font-bold text-slate-800">
                      {hh.scheduledHoursPerWeek} / {hh.authorizedHoursPerWeek} hrs
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3D6B22] rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (hh.scheduledHoursPerWeek / hh.authorizedHoursPerWeek) * 100
                        )}%`,
                      }}
                    />
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

      {/* 05. Pagination Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500 font-medium">
          Showing{" "}
          <span className="font-bold text-slate-800">
            {filteredHouseholds.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-bold text-slate-800">
            {Math.min(currentPage * pageSize, filteredHouseholds.length)}
          </span>{" "}
          of <span className="font-bold text-slate-800">{filteredHouseholds.length}</span> households
        </div>

        <div className="flex items-center gap-2 self-center sm:self-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 06. Add New Household Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Create New Household
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Register a managed household uniting patient, caregiver, and care ops.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHousehold} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Household Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jenkins Family Household"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Primary Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Jenkins"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Assigned Caregiver
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Elena Rodriguez"
                    value={formCaregiverName}
                    onChange={(e) => setFormCaregiverName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Care Program
                  </label>
                  <select
                    value={formProgram}
                    onChange={(e) => setFormProgram(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  >
                    <option value="Medicaid Waiver (CHC)">Medicaid Waiver (CHC)</option>
                    <option value="VA Community Care">VA Community Care</option>
                    <option value="Private Pay">Private Pay</option>
                    <option value="CES Waiver (Children's Support)">
                      CES Waiver (Children's Support)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Authorized Hours / Week
                  </label>
                  <input
                    type="number"
                    value={formHours}
                    onChange={(e) => setFormHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 214 Maple Ridge Lane"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Household</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
