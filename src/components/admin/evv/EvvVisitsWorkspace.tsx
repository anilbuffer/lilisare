"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Sparkles,
  FileText,
  MapPin,
  ExternalLink,
  ShieldCheck,
  X,
  Users,
  Building2,
  CalendarDays,
  ArrowRight,
  List as ListIcon,
  LayoutGrid,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  EvvVisitRecord,
  EvvVisitStatus,
  EvvVerificationStatus,
  EvvExceptionType,
} from "@/types/evvVisit";
import {
  getEvvVisitsFromStorage,
  calculateEvvKpis,
  exportEvvVisitsCsv,
  DEMO_DATE,
  EVV_SYNC_EVENT,
} from "@/lib/admin/evvVisitsStore";
import { EvvKpiCards } from "./EvvKpiCards";
import { EvvExceptionsBanner } from "./EvvExceptionsBanner";
import { FormInput, FormSelect } from "@/components/ui/FormControls";

type TabFilter = "ALL" | "SCHEDULED" | "COMPLETED" | "IN_PROGRESS" | "EXCEPTIONS";

function getInitials(name: string): string {
  if (!name) return "CG";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDateLabel(isoDate: string): string {
  try {
    const [y, m, d] = isoDate.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return isoDate;
  }
}

export function EvvVisitsWorkspace() {
  const router = useRouter();
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const [visits, setVisits] = useState<EvvVisitRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(DEMO_DATE);
  const [selectedDateFilter, setSelectedDateFilter] = useState<"SPECIFIC" | "ALL">("SPECIFIC");
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [activeExceptionType, setActiveExceptionType] = useState<EvvExceptionType | "ALL" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("ALL");
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isSyncing, setIsSyncing] = useState(false);

  // Pagination (Matches /admin/clients/ 10 entries per page standard)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load from storage and listen to sync events
  useEffect(() => {
    const loadVisits = () => {
      setVisits(getEvvVisitsFromStorage());
    };
    loadVisits();

    if (typeof window !== "undefined") {
      window.addEventListener(EVV_SYNC_EVENT, loadVisits);
      window.addEventListener("storage", loadVisits);
      return () => {
        window.removeEventListener(EVV_SYNC_EVENT, loadVisits);
        window.removeEventListener("storage", loadVisits);
      };
    }
  }, []);

  // Day Stepping Handlers

  // Date-filtered pool of visits (e.g. today's 128 visits or all dates)
  const dateFilteredVisits = useMemo(() => {
    if (selectedDateFilter === "ALL") return visits;
    return visits.filter((v) => v.date === selectedDate);
  }, [visits, selectedDateFilter, selectedDate]);

  // Recalculate KPIs based on date filter
  const kpis = useMemo(() => calculateEvvKpis(dateFilteredVisits), [dateFilteredVisits]);

  const handleTabChange = (tab: TabFilter) => {
    setActiveTab(tab);
    setActiveExceptionType(null);
    setCurrentPage(1);
  };

  const handleKpiCardSelect = (filterId: string) => {
    if (filterId === "ALL") handleTabChange("ALL");
    else if (filterId === "IN_PROGRESS") handleTabChange("IN_PROGRESS");
    else if (filterId === "COMPLETED") handleTabChange("COMPLETED");
    else if (filterId === "EXCEPTIONS") handleTabChange("EXCEPTIONS");
  };

  const handleExceptionTypeSelect = (type: EvvExceptionType | "ALL" | null) => {
    setActiveExceptionType(type);
    if (type) {
      setActiveTab("EXCEPTIONS");
    }
    setCurrentPage(1);
  };

  // Sync / Refresh Simulation
  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setVisits(getEvvVisitsFromStorage());
      setIsSyncing(false);
      toast.success("EVV aggregator feeds synchronized", {
        description: "Colorado State (Sandata & HHAeXchange) aggregator feeds up to date.",
      });
    }, 600);
  };

  // CSV Export
  const handleExport = () => {
    try {
      exportEvvVisitsCsv(filteredVisits);
      toast.success("EVV visits exported", {
        description: `Exported ${filteredVisits.length} records to CSV.`,
      });
    } catch {
      toast.error("Failed to export EVV visits");
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setActiveTab("ALL");
    setActiveExceptionType(null);
    setSearchQuery("");
    setSelectedService("ALL");
    setSelectedVerificationStatus("ALL");
    setSelectedDate(DEMO_DATE);
    setSelectedDateFilter("SPECIFIC");
    setCurrentPage(1);
  };

  // Unique services for filter dropdown
  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    visits.forEach((v) => set.add(v.serviceName));
    return Array.from(set).sort();
  }, [visits]);

  // Filtering Logic
  const filteredVisits = useMemo(() => {
    return dateFilteredVisits.filter((v) => {
      if (activeTab === "SCHEDULED" && v.visitStatus !== "Scheduled") return false;
      if (activeTab === "COMPLETED" && v.visitStatus !== "Completed") return false;
      if (activeTab === "IN_PROGRESS" && v.visitStatus !== "In Progress") return false;
      if (activeTab === "EXCEPTIONS") {
        const isException =
          v.verificationStatus === "Exception" ||
          v.verificationStatus === "Under Review" ||
          v.verificationStatus === "Correction Required";
        if (!isException) return false;
      }

      if (activeExceptionType && activeExceptionType !== "ALL") {
        if (v.exceptionType !== activeExceptionType) return false;
      }

      if (selectedService !== "ALL" && v.serviceName !== selectedService) return false;

      if (
        selectedVerificationStatus !== "ALL" &&
        v.verificationStatus !== selectedVerificationStatus
      )
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCaregiver = v.caregiverName.toLowerCase().includes(q);
        const matchesClient = v.clientName.toLowerCase().includes(q);
        const matchesId = v.id.toLowerCase().includes(q) || v.visitNumber.toLowerCase().includes(q);
        const matchesService = v.serviceName.toLowerCase().includes(q);
        if (!matchesCaregiver && !matchesClient && !matchesId && !matchesService) {
          return false;
        }
      }

      return true;
    });
  }, [
    dateFilteredVisits,
    activeTab,
    activeExceptionType,
    selectedService,
    selectedVerificationStatus,
    searchQuery,
  ]);

  const totalPages = Math.ceil(filteredVisits.length / pageSize) || 1;
  const paginatedVisits = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVisits.slice(start, start + pageSize);
  }, [filteredVisits, currentPage, pageSize]);

  const renderVisitStatusBadge = (status: EvvVisitStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
            Completed
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
            In Progress
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-600 border-slate-200">
            Scheduled
          </span>
        );
      case "Missed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-rose-50 text-rose-700 border-rose-200">
            Missed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200">
            {status}
          </span>
        );
    }
  };

  const renderVerificationStatusBadge = (status: EvvVerificationStatus) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E3F1D9] text-[#1E5622] border border-[#1E5622]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E5622]" />
            Verified
          </span>
        );
      case "Exception":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Exception
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            Under Review
          </span>
        );
      case "Correction Required":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            Correction Req.
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Pending
          </span>
        );
    }
  };

  const formatTimeDisplay = (time24?: string) => {
    if (!time24) return "—";
    const [h, m] = time24.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return time24;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-5 pb-16">

      {/* A. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              EVV Visits & Monitoring
            </h1>
          </div>
        </div>

        {/* Date Filter & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Functional Date Filter (Pill container matching LiliSare standards) */}
          <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-2xs">
            {/* Date Button with Native Date Input Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSelectedDateFilter("SPECIFIC");
                  dateInputRef.current?.showPicker?.();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${selectedDateFilter === "SPECIFIC"
                    ? "bg-[#3D6B22] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
                title="Click to select date"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {selectedDate === DEMO_DATE
                    ? "Today · Nov 25, 2026"
                    : formatDateLabel(selectedDate)}
                </span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setSelectedDateFilter("SPECIFIC");
                    setCurrentPage(1);
                  }
                }}
                className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
                tabIndex={-1}
              />
            </div>

            {/* All Dates Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedDateFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${selectedDateFilter === "ALL"
                  ? "bg-[#3D6B22] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              All Dates
            </button>
          </div>

          {/* Sync / Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isSyncing}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer disabled:opacity-50"
            title="Sync EVV Feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#3D6B22]" : ""}`} />
            <span className="hidden sm:inline">Sync Feeds</span>
          </button>

          {/* Export Report */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export EVV</span>
          </button>
        </div>
      </div>

      {/* B. Summary KPI Cards */}
      <EvvKpiCards
        kpis={kpis}
        activeFilter={activeTab}
        onSelectFilter={handleKpiCardSelect}
      />

      {/* D. Exception Monitoring Section */}
      <EvvExceptionsBanner
        visits={dateFilteredVisits}
        activeExceptionType={activeExceptionType}
        onSelectExceptionType={handleExceptionTypeSelect}
      />

      {/* =========================================================================
          3. SEARCH, DROPDOWN FILTERS & VIEW SWITCHER (Matches /admin/clients/ style)
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
              placeholder="Search by caregiver, client or visit ID..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
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

          {/* Controls: Visit Status Dropdown, Service Dropdown, Verification Dropdown, Reset, View Switcher */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Visit Status Filter Dropdown */}
            <div className="w-40 sm:w-44">
              <FormSelect
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value as TabFilter)}
              >
                <option value="ALL">All Visits ({kpis.totalVisits})</option>
                <option value="IN_PROGRESS">In Progress ({kpis.inProgress})</option>
                <option value="COMPLETED">Completed ({kpis.completed})</option>
                <option value="SCHEDULED">Scheduled ({kpis.scheduled})</option>
                <option value="EXCEPTIONS">Exceptions ({kpis.exceptions})</option>
              </FormSelect>
            </div>

            {/* Service Filter Dropdown */}
            <div className="w-36 sm:w-40">
              <FormSelect
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Services</option>
                {serviceOptions.map((svc) => (
                  <option key={svc} value={svc}>
                    {svc}
                  </option>
                ))}
              </FormSelect>
            </div>

            {/* Verification Status Filter Dropdown */}
            <div className="w-36 sm:w-40">
              <FormSelect
                value={selectedVerificationStatus}
                onChange={(e) => {
                  setSelectedVerificationStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Verifications</option>
                <option value="Verified">Verified</option>
                <option value="Exception">Exception</option>
                <option value="Under Review">Under Review</option>
                <option value="Correction Required">Correction Required</option>
                <option value="Pending">Pending</option>
              </FormSelect>
            </div>

            {/* Reset Filter Button if active */}
            {(searchQuery ||
              activeTab !== "ALL" ||
              selectedService !== "ALL" ||
              selectedVerificationStatus !== "ALL" ||
              activeExceptionType) && (
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

      {/* =========================================================================
          4. CONTENT AREA: LIST VIEW vs GRID VIEW (Matches /admin/clients/ style)
         ========================================================================= */}
      {filteredVisits.length === 0 ? (
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No visits found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No records matched your search query or filter criteria. Try clearing filters to see all visits.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW */
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Visit ID
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Caregiver
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {selectedDateFilter === "ALL" ? "Date & Scheduled" : "Scheduled"}
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Actual Time
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Visit Status
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedVisits.map((visit) => {
                  const initials = getInitials(visit.caregiverName);
                  const scheduledStr = `${formatTimeDisplay(visit.scheduledStartTime)} – ${formatTimeDisplay(
                    visit.scheduledEndTime
                  )}`;
                  const actualStr = visit.actualClockInTime
                    ? `${formatTimeDisplay(visit.actualClockInTime)} – ${visit.actualClockOutTime ? formatTimeDisplay(visit.actualClockOutTime) : "In Progress"
                    }`
                    : "Not Started";

                  return (
                    <tr
                      key={visit.id}
                      onClick={() => router.push(`/admin/evv-visits/${visit.id}/`)}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    >
                      {/* Visit ID */}
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-medium text-xs text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                          {visit.id}
                        </span>
                      </td>

                      {/* Caregiver with Avatar Initials */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3D6B22] font-bold text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-800 group-hover:text-[#3D6B22] transition-colors">
                              {visit.caregiverName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-4 px-4 sm:px-6">
                        <p className="text-xs text-slate-800 font-medium">
                          {selectedDateFilter === "ALL" && (
                            <span className="block font-semibold text-slate-900 text-[11px] mb-0.5">
                              {formatDateLabel(visit.date)}
                            </span>
                          )}
                          {scheduledStr}
                        </p>
                      </td>

                      {/* Actual Time */}
                      <td className="py-4 px-4 sm:px-6">
                        <p className="text-xs text-slate-800 font-medium">
                          {actualStr}
                        </p>
                      </td>

                      {/* Visit Status */}
                      <td className="py-4 px-4 sm:px-6">
                        {renderVisitStatusBadge(visit.visitStatus)}
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 px-4 sm:px-6">
                        {renderVerificationStatusBadge(visit.verificationStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/admin/evv-visits/${visit.id}/`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                          >
                            <span>Review Visit</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
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
        /* GRID VIEW (Matches /admin/clients/ style) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {paginatedVisits.map((visit) => {
            const initials = getInitials(visit.caregiverName);
            const scheduledStr = `${formatTimeDisplay(visit.scheduledStartTime)} – ${formatTimeDisplay(
              visit.scheduledEndTime
            )}`;
            const actualStr = visit.actualClockInTime
              ? `${formatTimeDisplay(visit.actualClockInTime)} – ${visit.actualClockOutTime ? formatTimeDisplay(visit.actualClockOutTime) : "In Progress"
              }`
              : "Not Started";

            return (
              <div
                key={visit.id}
                onClick={() => router.push(`/admin/evv-visits/${visit.id}/`)}
                className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3D6B22] font-bold text-sm shrink-0 shadow-2xs">
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                          {visit.caregiverName}
                        </div>
                        <p className="font-mono text-xs text-slate-400 font-medium mt-0.5">
                          {visit.id}
                        </p>
                      </div>
                    </div>
                    {renderVisitStatusBadge(visit.visitStatus)}
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">
                        {selectedDateFilter === "ALL" ? "Date & Scheduled" : "Scheduled"}
                      </span>
                      <span className="text-slate-800 font-semibold text-right">
                        {selectedDateFilter === "ALL" && (
                          <span className="block text-[11px] text-slate-500">
                            {formatDateLabel(visit.date)}
                          </span>
                        )}
                        {scheduledStr}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Actual EVV</span>
                      <span className="text-slate-800 font-semibold">{actualStr}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/admin/evv-visits/${visit.id}/`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:text-[#345C1D] transition-colors"
                  >
                    <span>Review Visit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 font-mono">
                    Shift {visit.visitNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          5. PAGINATION BAR (Matches /admin/clients/ style)
         ========================================================================= */}
      {filteredVisits.length > 0 && (
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 px-4 py-3.5 sm:px-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{Math.min((currentPage - 1) * pageSize + 1, filteredVisits.length)}</span> to{" "}
            <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, filteredVisits.length)}</span> of{" "}
            <span className="font-bold text-slate-900">{filteredVisits.length}</span> entries
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum
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
