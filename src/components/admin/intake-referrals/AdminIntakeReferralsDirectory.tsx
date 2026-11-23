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
  ChevronLeft,
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
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminIntakeReferralItem,
  SEED_ADMIN_REFERRALS,
  ReferralPriority,
  ReferralStatus,
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

  // State
  const [items, setItems] =
    useState<AdminIntakeReferralItem[]>(SEED_ADMIN_REFERRALS);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [programFilter, setProgramFilter] = useState<string>("ALL");
  const [activeKpiKey, setActiveKpiKey] = useState<
    "ALL" | "ASSESSMENT" | "URGENT" | "READY" | "ENROLLED"
  >("ALL");

  // Filter Dropdown state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Referral for Drawer/Modal
  const [selectedReferral, setSelectedReferral] =
    useState<AdminIntakeReferralItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  // KPI Calculations
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

    return {
      total: 42, // Total historical/platform pipeline
      conversionRate: "78.5%",
      assessmentCount,
      avgDays: "5.4 days",
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

    setItems((prev) => [newRef, ...prev]);
    toast.success(`Referral ${newRef.id} for ${newRef.patientName} created successfully`);
    setIsAddModalOpen(false);

    // Reset Form
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormDiagnosis("");
  };

  const handleConvertToClient = (referral: AdminIntakeReferralItem) => {
    setItems((prev) =>
      prev.map((r) =>
        r.id === referral.id
          ? { ...r, status: "Enrolled" }
          : r
      )
    );
    toast.success(`${referral.patientName} successfully admitted as Active Client`);
    if (selectedReferral && selectedReferral.id === referral.id) {
      setSelectedReferral((prev) => (prev ? { ...prev, status: "Enrolled" } : null));
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Intake & Referrals Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Executive referral pipeline, clinical triage, and conversion tracking for LiliSare Agency.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Referral</span>
        </button>
      </div>

      {/* 02. Executive KPI Cards (Harmonized with Clients & Caregivers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Referrals */}
        <div
          onClick={() => setActiveKpiKey(activeKpiKey === "ALL" ? "ALL" : "ALL")}
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "ALL"
            ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
            : "border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Total Referrals</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {kpiData.total}
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>{items.length} active in directory</span>
            {activeKpiKey === "ALL" && (
              <span className="text-[10px] font-bold text-[#3D6B22] bg-[#E8F2E4] px-1.5 py-0.5 rounded border border-[#3D6B22]/20">
                ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Conversion Rate */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Conversion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#3D6B22]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {kpiData.conversionRate}
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate">
            Referral-to-admission ratio
          </div>
        </div>

        {/* Card 3: Clinical Assessment Pending */}
        <div
          onClick={() =>
            setActiveKpiKey(activeKpiKey === "ASSESSMENT" ? "ALL" : "ASSESSMENT")
          }
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "ASSESSMENT"
            ? "border-[#3D6B22] shadow-md ring-2 ring-[#3D6B22]/15"
            : "border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">RN Assessments</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {kpiData.assessmentCount}
          </div>
          <div className="text-[11px] font-medium text-blue-700 truncate">
            Clinical evaluation pending
          </div>
        </div>

        {/* Card 4: Avg. Days to Onboard */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Intake Velocity</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {kpiData.avgDays}
          </div>
          <div className="text-[11px] font-medium text-slate-500 truncate">
            Average turnaround to care
          </div>
        </div>

        {/* Card 5: Urgent Discharge Triage */}
        <div
          onClick={() =>
            setActiveKpiKey(activeKpiKey === "URGENT" ? "ALL" : "URGENT")
          }
          className={`cursor-pointer bg-white rounded-xl lg:rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 relative overflow-hidden ${activeKpiKey === "URGENT"
            ? "border-rose-500 shadow-md ring-2 ring-rose-500/15"
            : "border-slate-200 shadow-2xs hover:border-rose-300 hover:shadow-md"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">Urgent Triage</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {kpiData.urgentCount}
          </div>
          <div className="text-[11px] font-medium text-rose-600 truncate">
            Hospital discharge priority
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
              placeholder="Search referrals by patient, ID, diagnosis, or source..."
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
                  <span className="text-xs font-bold text-slate-900">Filter Referrals</span>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="text-[11px] text-[#3D6B22] font-semibold hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Pipeline Stage
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#3D6B22]"
                  >
                    <option value="ALL">All Stages</option>
                    <option value="New Referral">New Referral</option>
                    <option value="Clinical Assessment">Clinical Assessment</option>
                    <option value="Documents & Auth">Documents & Auth</option>
                    <option value="Ready for Staffing">Ready for Staffing</option>
                    <option value="Enrolled">Enrolled</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Priority Tier
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#3D6B22]"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>

                {/* Program Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Care Program
                  </label>
                  <select
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#3D6B22]"
                  >
                    <option value="ALL">All Programs</option>
                    <option value="Medicaid">Medicaid Waiver (CHC)</option>
                    <option value="VA">VA Community Care</option>
                    <option value="Private">Private Pay</option>
                    <option value="Pediatric">Pediatric Special Care</option>
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

      {/* 04. Referral Directory Content */}
      {viewMode === "list" ? (
        /* ======================== LIST VIEW ======================== */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Program</th>
                  <th className="px-6 py-4">Requested Services</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Coordinator</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedReferrals.map((ref) => (
                  <tr
                    key={ref.id}
                    onClick={() => setSelectedReferral(ref)}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  >
                    {/* Patient info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(ref.patientName)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                            {ref.patientName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Program */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                        {ref.program}
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
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${ref.priority === "Urgent"
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
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${ref.status === "Enrolled"
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

                    {/* Coordinator */}
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      <div>{ref.assignedCoordinator}</div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedReferral(ref)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#E8F2E4] border border-slate-200 hover:border-[#3D6B22]/40 text-slate-700 hover:text-[#1E5622] rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#3D6B22]" />
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedReferrals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
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
              onClick={() => setSelectedReferral(ref)}
              className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group"
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

      {/* 05. Pagination Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500 font-medium">
          Showing{" "}
          <span className="font-bold text-slate-800">
            {filteredReferrals.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-bold text-slate-800">
            {Math.min(currentPage * pageSize, filteredReferrals.length)}
          </span>{" "}
          of <span className="font-bold text-slate-800">{filteredReferrals.length}</span> referrals
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

      {/* 06. Selected Referral Review Drawer / Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-black flex items-center justify-center">
                  {getInitials(selectedReferral.patientName)}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {selectedReferral.patientName}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {selectedReferral.id} • {selectedReferral.age}yo {selectedReferral.gender}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedReferral(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Snapshot strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Stage</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedReferral.status}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Priority</div>
                  <div className="font-bold text-rose-700 mt-0.5">{selectedReferral.priority}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Target Hours</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedReferral.estimatedHoursPerWeek} hrs/week
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Insurance</div>
                  <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

              {/* Clinical Triage Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Clinical Triage Notes
                </h4>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 text-slate-700 leading-relaxed font-medium">
                  {selectedReferral.triageNotes}
                </div>
              </div>

              {/* Patient Contact & Referral Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact Info</span>
                  </div>
                  <div className="text-slate-600">{selectedReferral.phone}</div>
                  <div className="text-slate-600 truncate">{selectedReferral.email}</div>
                  <div className="text-slate-500 text-xs">
                    {selectedReferral.address}, {selectedReferral.city} {selectedReferral.zip}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Referral Source</span>
                  </div>
                  <div className="text-slate-800 font-semibold">{selectedReferral.referralSource}</div>
                  <div className="text-slate-500 text-xs">
                    Contact: {selectedReferral.referralSourceContact || "Hospital Discharge Planner"}
                  </div>
                  <div className="text-slate-500 text-xs">
                    Payer: {selectedReferral.payerName}
                  </div>
                </div>
              </div>

              {/* Linked Records if converted */}
              {selectedReferral.clientId && (
                <div className="p-3.5 bg-[#E8F2E4]/40 border border-[#3D6B22]/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3D6B22]" />
                    <span className="text-xs font-bold text-[#1E5622]">
                      Connected Client Profile: {selectedReferral.clientId}
                    </span>
                  </div>
                  <Link
                    href={`/admin/clients/${selectedReferral.clientId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:underline"
                  >
                    <span>View Client Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedReferral.status !== "Enrolled" ? (
                  <button
                    onClick={() => handleConvertToClient(selectedReferral)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Admit as Active Client</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Client Enrolled
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 07. Add New Referral Modal */}
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
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
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
    </div>
  );
}
