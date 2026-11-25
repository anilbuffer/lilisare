"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  X,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Building2,
  Calendar,
  RotateCcw,
  Sparkles,
  Trash2,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import {
  subscribeToIntakeSync,
  deleteReferralAcrossStores,
} from "@/lib/intake/intakeSync";
import {
  AdminIntakeReferralItem,
  SEED_ADMIN_REFERRALS,
  ReferralPriority,
  ReferralStatus,
  getAdminReferralsFromStorage,
  saveAdminReferralsToStorage,
} from "@/lib/intake-referrals/adminIntakeReferralsData";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function AdminIntakeReferralsDirectory() {
  const router = useRouter();
  const perms = usePortalPermissions();

  // State
  const [items, setItems] =
    useState<AdminIntakeReferralItem[]>(SEED_ADMIN_REFERRALS);
  const [deleteTarget, setDeleteTarget] = useState<AdminIntakeReferralItem | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [programFilter, setProgramFilter] = useState<string>("ALL");
  const [activeKpiKey, setActiveKpiKey] = useState<
    "ALL" | "ASSESSMENT" | "URGENT" | "READY" | "ENROLLED"
  >("ALL");

  // Filter Dropdowns state
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Synchronize with local storage & cross-portal intake events
  useEffect(() => {
    const load = () => {
      const stored = getAdminReferralsFromStorage();
      if (stored && stored.length > 0) {
        setItems(stored);
      }
    };
    load();
    return subscribeToIntakeSync(load);
  }, []);

  // New Referral Form State
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState(72);
  const [formGender, setFormGender] = useState("Female");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSource, setFormSource] = useState("Hospital Discharge (UPMC)");
  const [formProgram, setFormProgram] = useState("Medicaid Waiver (CHC)");
  const [formDiagnosis, setFormDiagnosis] = useState("");
  const [formPriority, setFormPriority] = useState<ReferralPriority>("Urgent");
  const [formServices, setFormServices] = useState("Skilled Nursing, Home Health Aide");

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
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPriorityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // KPI Calculations (Computed dynamically from synchronized records)
  const kpiData = useMemo(() => {
    const total = items.length;
    const assessmentCount = items.filter(
      (r) => r.status === "Clinical Assessment"
    ).length;
    const urgentCount = items.filter((r) => r.priority === "Urgent").length;
    const readyCount = items.filter(
      (r) => r.status === "Ready for Staffing"
    ).length;
    const enrolledCount = items.filter((r) => r.status === "Enrolled").length;
    const conversionRate = total > 0 ? `${((enrolledCount / total) * 100).toFixed(1)}%` : "0.0%";
    const avgDaysVal =
      total > 0
        ? (items.reduce((sum, r) => sum + (r.daysInPipeline || 0), 0) / total).toFixed(1)
        : "0.0";

    return {
      total,
      conversionRate,
      assessmentCount,
      avgDays: `${avgDaysVal} days`,
      urgentCount,
      readyCount,
      enrolledCount,
    };
  }, [items]);

  // Filtering Logic
  const filteredReferrals = useMemo(() => {
    return items.filter((item) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.patientName.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesDiag = item.primaryDiagnosis.toLowerCase().includes(q);
        const matchesSource = item.referralSource.toLowerCase().includes(q);
        const matchesCoord = item.assignedCoordinator.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDiag && !matchesSource && !matchesCoord) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "ALL" && item.priority !== priorityFilter) {
        return false;
      }

      // Program filter
      if (programFilter !== "ALL" && !item.program.includes(programFilter)) {
        return false;
      }

      // KPI card filter
      if (activeKpiKey === "ASSESSMENT" && item.status !== "Clinical Assessment") {
        return false;
      }
      if (activeKpiKey === "URGENT" && item.priority !== "Urgent") {
        return false;
      }
      if (activeKpiKey === "READY" && item.status !== "Ready for Staffing") {
        return false;
      }
      if (activeKpiKey === "ENROLLED" && item.status !== "Enrolled") {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, statusFilter, priorityFilter, programFilter, activeKpiKey]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, programFilter, activeKpiKey]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredReferrals.length / pageSize));
  const paginatedReferrals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReferrals.slice(start, start + pageSize);
  }, [filteredReferrals, currentPage, pageSize]);

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    programFilter !== "ALL" ||
    activeKpiKey !== "ALL" ||
    searchQuery.trim().length > 0;

  const activeFiltersCount =
    (statusFilter !== "ALL" ? 1 : 0) +
    (priorityFilter !== "ALL" ? 1 : 0) +
    (programFilter !== "ALL" ? 1 : 0) +
    (activeKpiKey !== "ALL" ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setProgramFilter("ALL");
    setActiveKpiKey("ALL");
    setCurrentPage(1);
  };

  const handleAddReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter patient name");
      return;
    }

    const servicesArray = formServices
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newRef: AdminIntakeReferralItem = {
      id: `REF-2026-${Math.floor(1050 + Math.random() * 900)}`,
      patientName: formName.trim(),
      age: Number(formAge) || 70,
      gender: formGender,
      phone: formPhone || "(555) 123-4567",
      email: formEmail || `${formName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      address: "100 LiliSare Care Way",
      city: "Springfield",
      zip: "19087",
      referralSource: formSource,
      program: formProgram,
      requestedServices: servicesArray.length > 0 ? servicesArray : ["Home Health Aide"],
      priority: formPriority,
      status: "New Referral",
      receivedDate: "Today",
      daysInPipeline: 0,
      primaryDiagnosis: formDiagnosis || "Post-acute recovery, personal care assistance required.",
      triageNotes: "Referral logged by Agency Admin. Pending initial outreach and RN triage assessment.",
      assignedCoordinator: "Maria Santos, BSN",
      insuranceVerified: true,
      payerName: formProgram.includes("Medicaid") ? "PA CHC Medicaid" : "Private Commercial",
      targetStartDate: "Within 7 days",
      estimatedHoursPerWeek: 25,
    };

    const updated = [newRef, ...items];
    setItems(updated);
    saveAdminReferralsToStorage(updated);
    toast.success(`Referral ${newRef.id} for ${newRef.patientName} created successfully`);
    setIsAddModalOpen(false);

    // Reset Form
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormDiagnosis("");
  };

  const handleConvertToClient = (referral: AdminIntakeReferralItem) => {
    const updated = items.map((r) =>
      r.id === referral.id
        ? { ...r, status: "Enrolled" as ReferralStatus }
        : r
    );
    setItems(updated);
    saveAdminReferralsToStorage(updated);
    toast.success(`${referral.patientName} successfully admitted as Active Client`);
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Intake & Referrals Directory
          </h1>
        </div>

        <Link
          href="/admin/intake-referrals/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Referral</span>
        </Link>
      </div>

      {/* 02. Executive KPI Cards (Harmonized with Clients & Caregivers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Referrals */}
        <div
          onClick={() => setActiveKpiKey(activeKpiKey === "ALL" ? "ALL" : "ALL")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "ALL"
            ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
            : "border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Referrals</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpiData.total}
          </div>
        </div>

        {/* Card 2: Conversion Rate */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Conversion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#3D6B22]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpiData.conversionRate}
          </div>
        </div>

        {/* Card 3: Clinical Assessment Pending */}
        <div
          onClick={() =>
            setActiveKpiKey(activeKpiKey === "ASSESSMENT" ? "ALL" : "ASSESSMENT")
          }
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "ASSESSMENT"
            ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
            : "border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">RN Assessments</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpiData.assessmentCount}
          </div>
        </div>

        {/* Card 4: Avg. Days to Onboard */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Intake Velocity</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpiData.avgDays}
          </div>
        </div>

        {/* Card 5: Urgent Discharge Triage */}
        <div
          onClick={() =>
            setActiveKpiKey(activeKpiKey === "URGENT" ? "ALL" : "URGENT")
          }
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "URGENT"
            ? "border-rose-500 shadow-md ring-2 ring-rose-500/15"
            : "border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Urgent Triage</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {kpiData.urgentCount}
          </div>
        </div>
      </div>

      {/* 03. Search, Dropdown Filters & View Switcher (Single Unified Card) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 p-3 sm:p-3.5 shadow-2xs">
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
              className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
            />
            {searchQuery && (
              <button
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

          {/* Controls: Status Dropdown Filter, Risk Dropdown Filter, View Toggle */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Status Dropdown Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${statusFilter !== "ALL"
                  ? "bg-[#3D6B22]/10 border-[#3D6B22]/30 text-[#3D6B22]"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {statusFilter === "ALL"
                    ? "Status: All"
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
                    { label: "All Statuses", value: "ALL" },
                    { label: "New Referral", value: "New Referral" },
                    { label: "Clinical Assessment", value: "Clinical Assessment" },
                    { label: "Documents & Auth", value: "Documents & Auth" },
                    { label: "Ready for Staffing", value: "Ready for Staffing" },
                    { label: "Enrolled", value: "Enrolled" },
                  ].map((option) => (
                    <button
                      key={option.value}
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

            {/* Risk Level / Priority Dropdown Filter */}
            <div className="relative" ref={priorityDropdownRef}>
              <button
                type="button"
                onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${priorityFilter !== "ALL"
                  ? "bg-[#3D6B22]/10 border-[#3D6B22]/30 text-[#3D6B22] font-semibold"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>{priorityFilter === "ALL" ? "Risk Level" : priorityFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isPriorityDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Risk Level
                  </div>
                  {[
                    { label: "All Risk Levels", value: "ALL" },
                    { label: "Urgent", value: "Urgent" },
                    { label: "High", value: "High" },
                    { label: "Standard", value: "Standard" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPriorityFilter(option.value);
                        setCurrentPage(1);
                        setIsPriorityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${priorityFilter === option.value
                        ? "bg-[#3D6B22]/10 text-[#3D6B22] font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <span>{option.label}</span>
                      {priorityFilter === option.value && (
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

      {/* 04. Referral Directory Content */}
      {viewMode === "list" ? (
        /* ======================== LIST VIEW ======================== */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requested Services</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedReferrals.map((ref) => (
                  <tr
                    key={ref.id}
                    onClick={() => router.push(`/admin/intake-referrals/${ref.id}`)}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  >
                    {/* Patient info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-semibold text-xs flex items-center justify-center shrink-0">
                          {getInitials(ref.patientName)}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                            {ref.patientName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Requested Services */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {ref.requestedServices.map((svc, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${ref.priority === "Urgent"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : ref.priority === "High"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                      >
                        {ref.priority === "Urgent" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                        <span>{ref.priority}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${ref.status === "Enrolled"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : ref.status === "Ready for Staffing"
                            ? "bg-teal-50 text-teal-800 border-teal-200"
                            : ref.status === "Clinical Assessment"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : ref.status === "Documents & Auth"
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                      >
                        <span>{ref.status}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/intake-referrals/${ref.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                        >
                          <span>View Profile</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                        <Link
                          href={`/admin/intake-referrals/${ref.id}/edit`}
                          title="Edit Referral"
                          className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 hover:bg-emerald-50/60 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        {perms.referrals.canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(ref)}
                            title="Delete Referral (Agency Admin)"
                            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedReferrals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-sm">
                        No intake referrals found
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try clearing your search query or adjusting your filters.
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
          {paginatedReferrals.map((ref) => (
            <div
              key={ref.id}
              onClick={() => router.push(`/admin/intake-referrals/${ref.id}`)}
              className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group"
            >
              {/* Card Top */}
              <div className="p-4 sm:p-5 space-y-3.5">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-black text-sm flex items-center justify-center shrink-0">
                      {getInitials(ref.patientName)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#3D6B22] transition-colors tracking-tight">
                        {ref.patientName}
                      </h3>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        {ref.id} • {ref.age}yo {ref.gender}
                      </div>
                    </div>
                  </div>

                  {/* Priority Pill */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ref.priority === "Urgent"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : ref.priority === "High"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                  >
                    {ref.priority}
                  </span>
                </div>

                {/* Program & Source */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">{ref.program}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{ref.receivedDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Source: {ref.referralSource}
                  </div>
                </div>

                {/* Primary Diagnosis */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Primary Diagnosis
                  </div>
                  <p className="text-xs text-slate-700 font-medium line-clamp-2">
                    {ref.primaryDiagnosis}
                  </p>
                </div>

                {/* Requested Services */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Requested Care
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ref.requestedServices.map((svc, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">Stage</span>
                  <span className="font-bold text-slate-800">{ref.status}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] group-hover:translate-x-0.5 transition-transform">
                  <span>Review Referral</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}

          {paginatedReferrals.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600 text-sm">No intake referrals found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust search query or filters to display records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 05. Global Standardized Pagination Bar */}
      {filteredReferrals.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredReferrals.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          entryLabel="referrals"
          variant="standalone-card"
        />
      )}

      {/* 06. Add New Referral Modal */}
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
                    Log New Intake Referral
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Enter clinical and payer details for administrative intake.
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

            <form onSubmit={handleAddReferral} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harold Green"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formAge}
                    onChange={(e) => setFormAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Priority Tier *
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as ReferralPriority)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  >
                    <option value="Urgent">Urgent (Discharge / Acute)</option>
                    <option value="High">High Priority</option>
                    <option value="Standard">Standard Intake</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Referral Source
                  </label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
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
                    <option value="Pediatric Special Care">Pediatric Special Care</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="e.g. s/p CVA, congestive heart failure, Parkinson's"
                  value={formDiagnosis}
                  onChange={(e) => setFormDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Referral</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 07. Delete Referral Confirmation Modal (Agency Admin Only) */}
      {perms.referrals.canDelete && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Intake Referral"
          description="Permanent deletion removes this referral across both Intake and Admin directories."
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          maxWidth="sm"
        >
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete referral{" "}
            <strong className="text-slate-900">{deleteTarget?.patientName}</strong> (
            {deleteTarget?.id})?
          </p>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-xs font-medium text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!deleteTarget) return;
                deleteReferralAcrossStores(deleteTarget.id);
                setItems((prev) => prev.filter((r) => r.id !== deleteTarget.id));
                toast.success(`Referral ${deleteTarget.id} deleted.`);
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
