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

export function EvvVisitsWorkspace() {
  const router = useRouter();
  const [visits, setVisits] = useState<EvvVisitRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [activeExceptionType, setActiveExceptionType] = useState<EvvExceptionType | "ALL" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("ALL");
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState("ALL");
  const [selectedDateFilter, setSelectedDateFilter] = useState<"TODAY" | "ALL">("TODAY");
  const [isSyncing, setIsSyncing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

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

  const kpis = useMemo(() => calculateEvvKpis(visits), [visits]);

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
    return visits.filter((v) => {
      if (selectedDateFilter === "TODAY" && v.date !== DEMO_DATE) return false;

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
    visits,
    selectedDateFilter,
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
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            In Progress
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            Scheduled
          </span>
        );
      case "Missed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Missed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
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
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-16">

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
          {/* Today / Demo Date Switcher */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setSelectedDateFilter("TODAY");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${selectedDateFilter === "TODAY"
                ? "bg-[#3D6B22] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Today · Nov 25, 2026
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDateFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${selectedDateFilter === "ALL"
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
        visits={visits}
        activeExceptionType={activeExceptionType}
        onSelectExceptionType={handleExceptionTypeSelect}
      />

      {/* C. Visit Monitoring Workspace */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Search & Filter Bar with Standardized Form Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <FormInput
              placeholder="Search caregiver, client or visit ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              icon={<Search className="w-4 h-4" />}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Secondary Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Visit Status Filter Dropdown */}
            <div className="w-44">
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
            <div className="w-44">
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
            <div className="w-44">
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

            {(searchQuery ||
              activeTab !== "ALL" ||
              selectedService !== "ALL" ||
              selectedVerificationStatus !== "ALL" ||
              activeExceptionType) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
          </div>
        </div>

        {/* Clean Front List Table (Desktop & Tablet) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Visit ID</th>
                <th className="py-3 px-4">Caregiver</th>
                <th className="py-3 px-4">Scheduled</th>
                <th className="py-3 px-4">Actual Time</th>
                <th className="py-3 px-4">Visit Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {paginatedVisits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-slate-700">No visits match your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search query, status tabs, or service filters.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#3D6B22] bg-[#3D6B22]/10 rounded-lg hover:bg-[#3D6B22]/20"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedVisits.map((visit) => {
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
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Visit ID */}
                      <td className="py-3.5 px-4 font-medium text-xs text-slate-600 whitespace-nowrap">
                        {visit.id}
                      </td>

                      {/* Caregiver Name (Single-line primary value) */}
                      <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                        <Link
                          href={`/admin/caregivers/${visit.caregiverId}/`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[#3D6B22] hover:underline"
                        >
                          {visit.caregiverName}
                        </Link>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
                        {scheduledStr}
                      </td>

                      {/* Actual EVV Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600">
                        {actualStr}
                      </td>

                      {/* Visit Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderVisitStatusBadge(visit.visitStatus)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/evv-visits/${visit.id}/`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-lg shadow-xs transition-all active:scale-95"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Adaptive Cards View (Below sm viewport) */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {paginatedVisits.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm text-slate-700">No visits match your criteria</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#3D6B22] bg-[#3D6B22]/10 rounded-lg hover:bg-[#3D6B22]/20"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            paginatedVisits.map((visit) => (
              <div
                key={visit.id}
                onClick={() => router.push(`/admin/evv-visits/${visit.id}/`)}
                className="p-4 space-y-2 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{visit.id}</span>
                  <div>
                    {renderVisitStatusBadge(visit.visitStatus)}
                  </div>
                </div>

                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-900">{visit.caregiverName}</div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>
                    {formatTimeDisplay(visit.scheduledStartTime)} – {formatTimeDisplay(visit.scheduledEndTime)}
                  </span>
                  <Link
                    href={`/admin/evv-visits/${visit.id}/`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:underline"
                  >
                    <span>View Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination & Summary Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredVisits.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * pageSize, filteredVisits.length)}
            </span>{" "}
            of <span className="font-semibold text-slate-800">{filteredVisits.length}</span> visits
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
