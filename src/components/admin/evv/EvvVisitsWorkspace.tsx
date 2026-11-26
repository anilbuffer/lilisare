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
  ArrowUpDown,
  FileText,
  MapPin,
  ExternalLink,
  ShieldCheck,
  X,
  Users,
  Building2,
  CalendarDays,
  ArrowRight,
  Sliders,
  Check,
  AlertCircle,
  Smartphone,
  PhoneCall,
  Lock,
  Layers,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  EvvVisitRecord,
  EvvVisitStatus,
  EvvVerificationStatus,
  EvvAggregatorStatus,
  EvvBillingReadiness,
  EvvPayrollReadiness,
  EvvCaptureMethod,
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
import { EvvSubNav } from "./EvvSubNav";
import { EvvQuickReviewDrawer } from "./EvvQuickReviewDrawer";
import { EvvBulkActionBar } from "./EvvBulkActionBar";

type TabFilter =
  | "ALL"
  | "IN_PROGRESS"
  | "PENDING_VERIFICATION"
  | "EXCEPTIONS"
  | "AGGREGATOR_ISSUES"
  | "BILLING_READINESS";

type SortField = "date" | "caregiver" | "client" | "service" | "status";
type SortDirection = "asc" | "desc";

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

function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return "--:--";
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 === 0 ? 12 : h % 12;
  return `${formattedHour}:${mStr} ${ampm}`;
}

export function EvvVisitsWorkspace() {
  const router = useRouter();

  // Core visits & loading state
  const [visits, setVisits] = useState<EvvVisitRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState("Today at 10:44 AM");

  // Selection & bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer state
  const [reviewDrawerVisit, setReviewDrawerVisit] = useState<EvvVisitRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Tabs & KPIs
  const [activeTab, setActiveTab] = useState<TabFilter>("ALL");
  const [activeKpiFilter, setActiveKpiFilter] = useState("ALL");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(DEMO_DATE);
  const [selectedDateMode, setSelectedDateMode] = useState<"SPECIFIC" | "ALL">("SPECIFIC");
  const [selectedVisitStatus, setSelectedVisitStatus] = useState("ALL");
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState("ALL");
  const [selectedService, setSelectedService] = useState("ALL");
  const [selectedPayer, setSelectedPayer] = useState("ALL");
  const [selectedCaptureMethod, setSelectedCaptureMethod] = useState("ALL");
  const [selectedAggregatorStatus, setSelectedAggregatorStatus] = useState("ALL");
  const [selectedBillingReadiness, setSelectedBillingReadiness] = useState("ALL");
  const [selectedPayrollReadiness, setSelectedPayrollReadiness] = useState("ALL");
  const [selectedExceptionType, setSelectedExceptionType] = useState("ALL");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination (10, 25, 50, 100)
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Load visits
  const loadVisits = () => {
    setIsLoading(true);
    const data = getEvvVisitsFromStorage();
    setVisits(data);
    setIsLoading(false);
  };

  useEffect(() => {
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

  // Sync / Refresh Simulation
  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      loadVisits();
      setIsSyncing(false);
      const nowStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      setLastSyncedTime(`Today at ${nowStr}`);
      toast.success("EVV Feeds Synchronized", {
        description: "State Aggregator buffer, GPS telemetry, and IVR caller feeds updated.",
      });
    }, 500);
  };

  // Date-filtered pool for KPIs
  const dateFilteredVisits = useMemo(() => {
    if (selectedDateMode === "ALL") return visits;
    return visits.filter((v) => v.date === selectedDate);
  }, [visits, selectedDateMode, selectedDate]);

  // Derived KPIs
  const kpis = useMemo(() => calculateEvvKpis(dateFilteredVisits), [dateFilteredVisits]);

  // KPI card selection handler
  const handleKpiCardSelect = (filterId: string) => {
    setActiveKpiFilter(filterId);
    if (filterId === "ALL") {
      setActiveTab("ALL");
    } else if (filterId === "IN_PROGRESS") {
      setActiveTab("IN_PROGRESS");
    } else if (filterId === "PENDING_VERIFICATION") {
      setActiveTab("PENDING_VERIFICATION");
    } else if (filterId === "EXCEPTIONS") {
      setActiveTab("EXCEPTIONS");
    } else if (filterId === "CLEARED_BILLING") {
      setActiveTab("BILLING_READINESS");
      setSelectedBillingReadiness("Cleared for Billing");
    } else if (filterId === "AGGREGATOR_REJECTED") {
      setActiveTab("AGGREGATOR_ISSUES");
      setSelectedAggregatorStatus("Rejected");
    }
    setCurrentPage(1);
  };

  // Tab change handler
  const handleTabChange = (tab: TabFilter) => {
    setActiveTab(tab);
    setActiveKpiFilter(tab);
    setCurrentPage(1);
  };

  // Reset all filters
  const handleClearFilters = () => {
    setActiveTab("ALL");
    setActiveKpiFilter("ALL");
    setSearchQuery("");
    setSelectedDate(DEMO_DATE);
    setSelectedDateMode("SPECIFIC");
    setSelectedVisitStatus("ALL");
    setSelectedVerificationStatus("ALL");
    setSelectedService("ALL");
    setSelectedPayer("ALL");
    setSelectedCaptureMethod("ALL");
    setSelectedAggregatorStatus("ALL");
    setSelectedBillingReadiness("ALL");
    setSelectedPayrollReadiness("ALL");
    setSelectedExceptionType("ALL");
    setCurrentPage(1);
    toast.info("Filters Reset", { description: "Viewing all operational visits." });
  };

  // Unique options for filter dropdowns
  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    visits.forEach((v) => v.serviceName && set.add(v.serviceName));
    return Array.from(set).sort();
  }, [visits]);

  const payerOptions = useMemo(() => {
    const set = new Set<string>();
    visits.forEach((v) => v.payerName && set.add(v.payerName));
    return Array.from(set).sort();
  }, [visits]);

  // Tab Counts
  const tabCounts = useMemo(() => {
    const inProgressCount = dateFilteredVisits.filter((v) => v.visitStatus === "In Progress").length;
    const pendingVerificationCount = dateFilteredVisits.filter(
      (v) => v.visitStatus === "Completed" && v.verificationStatus === "Pending"
    ).length;
    const exceptionsCount = dateFilteredVisits.filter(
      (v) =>
        v.verificationStatus === "Exception" ||
        v.verificationStatus === "Under Review" ||
        v.verificationStatus === "Correction Required"
    ).length;
    const aggregatorIssuesCount = dateFilteredVisits.filter(
      (v) => v.aggregatorStatus === "Rejected" || v.aggregatorStatus === "Retry Required"
    ).length;
    const readyBillingCount = dateFilteredVisits.filter(
      (v) => v.billingReadiness === "Cleared for Billing" || v.billingReadiness === "Ready for Review"
    ).length;

    return {
      all: dateFilteredVisits.length,
      inProgress: inProgressCount,
      pendingVerification: pendingVerificationCount,
      exceptions: exceptionsCount,
      aggregatorIssues: aggregatorIssuesCount,
      billingReadiness: readyBillingCount,
    };
  }, [dateFilteredVisits]);

  // Filtering Logic
  const filteredVisits = useMemo(() => {
    return dateFilteredVisits.filter((v) => {
      // 1. Tab filters
      if (activeTab === "IN_PROGRESS" && v.visitStatus !== "In Progress") return false;
      if (
        activeTab === "PENDING_VERIFICATION" &&
        !(v.visitStatus === "Completed" && v.verificationStatus === "Pending")
      )
        return false;
      if (activeTab === "EXCEPTIONS") {
        const isException =
          v.verificationStatus === "Exception" ||
          v.verificationStatus === "Under Review" ||
          v.verificationStatus === "Correction Required";
        if (!isException) return false;
      }
      if (
        activeTab === "AGGREGATOR_ISSUES" &&
        !(v.aggregatorStatus === "Rejected" || v.aggregatorStatus === "Retry Required")
      )
        return false;
      if (
        activeTab === "BILLING_READINESS" &&
        !(v.billingReadiness === "Cleared for Billing" || v.billingReadiness === "Ready for Review")
      )
        return false;

      // 2. Dropdown filters
      if (selectedVisitStatus !== "ALL" && v.visitStatus !== selectedVisitStatus) return false;
      if (
        selectedVerificationStatus !== "ALL" &&
        v.verificationStatus !== selectedVerificationStatus
      )
        return false;
      if (selectedService !== "ALL" && v.serviceName !== selectedService) return false;
      if (selectedPayer !== "ALL" && v.payerName !== selectedPayer) return false;
      if (selectedCaptureMethod !== "ALL" && v.captureMethod !== selectedCaptureMethod)
        return false;
      if (selectedAggregatorStatus !== "ALL" && v.aggregatorStatus !== selectedAggregatorStatus)
        return false;
      if (selectedBillingReadiness !== "ALL" && v.billingReadiness !== selectedBillingReadiness)
        return false;
      if (selectedPayrollReadiness !== "ALL" && v.payrollReadiness !== selectedPayrollReadiness)
        return false;
      if (selectedExceptionType !== "ALL" && v.exceptionType !== selectedExceptionType)
        return false;

      // 3. Search query across Visit ID, Caregiver, Client, Service, Payer
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId =
          v.id.toLowerCase().includes(q) || v.visitNumber.toLowerCase().includes(q);
        const matchesCaregiver = v.caregiverName.toLowerCase().includes(q);
        const matchesClient = v.clientName.toLowerCase().includes(q);
        const matchesService =
          v.serviceName.toLowerCase().includes(q) || v.serviceCode.toLowerCase().includes(q);
        const matchesPayer = v.payerName.toLowerCase().includes(q);
        if (!matchesId && !matchesCaregiver && !matchesClient && !matchesService && !matchesPayer) {
          return false;
        }
      }

      return true;
    });
  }, [
    dateFilteredVisits,
    activeTab,
    selectedVisitStatus,
    selectedVerificationStatus,
    selectedService,
    selectedPayer,
    selectedCaptureMethod,
    selectedAggregatorStatus,
    selectedBillingReadiness,
    selectedPayrollReadiness,
    selectedExceptionType,
    searchQuery,
  ]);

  // Sorting Logic
  const sortedVisits = useMemo(() => {
    return [...filteredVisits].sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = a.date.localeCompare(b.date);
      } else if (sortField === "caregiver") {
        comparison = a.caregiverName.localeCompare(b.caregiverName);
      } else if (sortField === "client") {
        comparison = a.clientName.localeCompare(b.clientName);
      } else if (sortField === "service") {
        comparison = a.serviceName.localeCompare(b.serviceName);
      } else if (sortField === "status") {
        comparison = a.verificationStatus.localeCompare(b.verificationStatus);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredVisits, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedVisits.length / pageSize) || 1;
  const paginatedVisits = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedVisits.slice(start, start + pageSize);
  }, [sortedVisits, currentPage, pageSize]);

  // Select all visible on current page
  const handleSelectAllVisible = (checked: boolean) => {
    if (checked) {
      const visibleIds = paginatedVisits.map((v) => v.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      const visibleIds = new Set(paginatedVisits.map((v) => v.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    }
  };

  const isAllVisibleSelected =
    paginatedVisits.length > 0 && paginatedVisits.every((v) => selectedIds.includes(v.id));

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const openQuickReview = (v: EvvVisitRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviewDrawerVisit(v);
    setIsDrawerOpen(true);
  };

  // Helper status badge renderers
  const renderVisitStatusBadge = (status: EvvVisitStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
            Completed
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-blue-50 text-blue-700 border-blue-200">
            In Progress
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-slate-100 text-slate-600 border-slate-200">
            Scheduled
          </span>
        );
      case "Missed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-rose-50 text-rose-700 border-rose-200">
            Missed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-slate-100 text-slate-500 border-slate-200">
            Cancelled
          </span>
        );
    }
  };

  const renderVerificationStatusBadge = (status: EvvVerificationStatus) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#3e6b2b]/15 text-[#3e6b2b] border border-[#3e6b2b]/30">
            <ShieldCheck className="w-3 h-3 text-[#3e6b2b]" />
            Verified
          </span>
        );
      case "Exception":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Exception
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" />
            Under Review
          </span>
        );
      case "Correction Required":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <FileText className="w-3 h-3 text-rose-600" />
            Correction Req.
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Pending
          </span>
        );
    }
  };

  const renderAggregatorBadge = (status: EvvAggregatorStatus) => {
    switch (status) {
      case "Accepted":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Accepted
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Rejected
          </span>
        );
      case "Submitted":
      case "Queued":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {status}
          </span>
        );
      case "Retry Required":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Retry Req.
          </span>
        );
      case "Acknowledgement Pending":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Ack Pending
          </span>
        );
      case "Not Submitted":
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
            Not Submitted
          </span>
        );
    }
  };

  const renderReadinessBadge = (
    label: string,
    readiness: EvvBillingReadiness | EvvPayrollReadiness
  ) => {
    const isCleared = readiness === "Cleared for Billing" || readiness === "Cleared for Payroll";
    const isBlocked = readiness === "Blocked";
    const isReady = readiness === "Ready for Review";

    return (
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="font-semibold text-slate-400 uppercase w-10 text-right">{label}:</span>
        <span
          className={`px-1.5 py-0.2 rounded font-bold ${isCleared
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
            : isBlocked
              ? "bg-rose-50 text-rose-700 border border-rose-200/60"
              : isReady
                ? "bg-amber-50 text-amber-800 border border-amber-200/60"
                : "bg-slate-50 text-slate-500 border border-slate-200/60"
            }`}
        >
          {readiness}
        </span>
      </div>
    );
  };

  const renderCaptureMethodIcon = (method: EvvCaptureMethod) => {
    switch (method) {
      case "Mobile GPS":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Mobile GPS</span>
          </span>
        );
      case "Telephony / IVR":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 font-medium">
            <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
            <span>IVR / Telephony</span>
          </span>
        );
      case "Fixed Device":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Fixed FOB</span>
          </span>
        );
      case "Manual Entry":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 font-medium">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Manual Entry</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-fade-in">
      {/* =========================================================================
          1. PAGE HEADER
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            EVV Visits
          </h1>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/admin/evv-visits/rules"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Configure Rules</span>
          </Link>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={() => exportEvvVisitsCsv(filteredVisits)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3e6b2b] hover:bg-[#345c1d] rounded-xl shadow-md shadow-[#3e6b2b]/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation bar linking to Exceptions, Submissions, Rules */}
      <EvvSubNav exceptionCount={kpis.exceptions} rejectedCount={kpis.aggregatorRejected} />

      {/* =========================================================================
          2. COMPACT 6-CARD KPI SUMMARY (Derived from real mock data)
         ========================================================================= */}
      <EvvKpiCards
        kpis={kpis}
        activeFilter={activeKpiFilter}
        onSelectFilter={handleKpiCardSelect}
      />

      {/* =========================================================================
          3. OPERATIONAL TABS (Segmented navigation with live counts)
         ========================================================================= */}
      <div className="bg-white p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: "ALL", label: "All Visits", count: tabCounts.all },
          { id: "IN_PROGRESS", label: "In Progress", count: tabCounts.inProgress },
          { id: "PENDING_VERIFICATION", label: "Pending Verification", count: tabCounts.pendingVerification },
          { id: "EXCEPTIONS", label: "Exceptions", count: tabCounts.exceptions, alert: tabCounts.exceptions > 0 },
          { id: "AGGREGATOR_ISSUES", label: "Aggregator Issues", count: tabCounts.aggregatorIssues, alert: tabCounts.aggregatorIssues > 0 },
          { id: "BILLING_READINESS", label: "Billing / Payroll Ready", count: tabCounts.billingReadiness },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as TabFilter)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${isActive
                ? "bg-[#3e6b2b] text-white font-bold shadow-sm shadow-[#3e6b2b]/25 border border-[#3e6b2b]"
                : "bg-slate-50/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/70 font-semibold shadow-2xs"
                }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border transition-colors ${isActive
                  ? "bg-white/20 text-white border-white/30"
                  : tab.alert
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-white text-slate-700 border-slate-200"
                  }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          4. COMPREHENSIVE FILTER TOOLBAR (Aligned directly with table columns)
         ========================================================================= */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
          {/* Search Query */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Visit ID, Caregiver, Client, Service code..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3e6b2b]/20 focus:border-[#3e6b2b] placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Date Selector */}
          <div>
            <select
              value={selectedDateMode === "ALL" ? "ALL" : selectedDate}
              onChange={(e) => {
                if (e.target.value === "ALL") {
                  setSelectedDateMode("ALL");
                } else {
                  setSelectedDateMode("SPECIFIC");
                  setSelectedDate(e.target.value);
                }
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none text-slate-700"
            >
              <option value={DEMO_DATE}>Date: {DEMO_DATE} (Today)</option>
              <option value="ALL">Date: All Service Dates</option>
            </select>
          </div>

          {/* Service Type */}
          <div>
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none text-slate-700 truncate"
            >
              <option value="ALL">Service: All Services</option>
              {serviceOptions.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>

          {/* EVV Verification Status */}
          <div>
            <select
              value={selectedVerificationStatus}
              onChange={(e) => {
                setSelectedVerificationStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none text-slate-700"
            >
              <option value="ALL">Verification: All</option>
              <option value="Verified">Verified</option>
              <option value="Exception">Exception</option>
              <option value="Under Review">Under Review</option>
              <option value="Correction Required">Correction Required</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Toolbar Footer with Clear Filters & Active Count */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-900 font-bold">{sortedVisits.length}</strong> of{" "}
              {visits.length} operational visits
            </span>
            {(searchQuery ||
              selectedVerificationStatus !== "ALL" ||
              selectedService !== "ALL" ||
              selectedDateMode === "ALL" ||
              activeTab !== "ALL") && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-[#3e6b2b] hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Rows per page:</span>
            {[10, 25, 50, 100].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${pageSize === size
                  ? "bg-[#3e6b2b] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. MAIN OPERATIONAL EVV TABLE (Streamlined, zero horizontal scrolling)
         ========================================================================= */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Sticky Table Header */}
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-20 backdrop-blur-xs">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={(e) => handleSelectAllVisible(e.target.checked)}
                    className="rounded text-[#3e6b2b] focus:ring-[#3e6b2b] h-3.5 w-3.5 cursor-pointer"
                  />
                </th>

                <th
                  onClick={() => handleSort("date")}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Visit ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3 px-3.5 whitespace-nowrap">Service Date &amp; Time</th>

                <th
                  onClick={() => handleSort("caregiver")}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Caregiver</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("client")}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Client / Patient</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("service")}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Service</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort("status")}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Verification Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm">No EVV records match filters</h3>
                      <p className="text-xs text-slate-500">
                        Try adjusting your query, clearing active filters, or changing the service date.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3e6b2b] text-white font-semibold rounded-xl text-xs cursor-pointer shadow-md shadow-[#3e6b2b]/20 hover:bg-[#345c1d] transition-all"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedVisits.map((visit) => {
                  const isSelected = selectedIds.includes(visit.id);
                  const initials = getInitials(visit.caregiverName);

                  const actualDisplay = !visit.actualClockInTime
                    ? `--:-- – ${visit.actualClockOutTime ? formatTimeDisplay(visit.actualClockOutTime) : "In Progress"}`
                    : `${formatTimeDisplay(visit.actualClockInTime)} – ${visit.actualClockOutTime
                      ? formatTimeDisplay(visit.actualClockOutTime)
                      : "In Progress"
                    }`;

                  return (
                    <tr
                      key={visit.id}
                      onClick={() => router.push(`/admin/evv-visits/${visit.id}/`)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${isSelected ? "bg-[#3e6b2b]/5" : ""
                        }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3 px-3.5 text-center"
                        onClick={(e) => handleToggleRow(visit.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => { }}
                          className="rounded text-[#3e6b2b] focus:ring-[#3e6b2b] h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>

                      {/* Visit ID */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 group-hover:text-[#3e6b2b] transition-colors">
                          {visit.id}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-700">
                        <span className="font-medium text-slate-900">{visit.date}</span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span className="text-slate-600">{actualDisplay}</span>
                      </td>

                      {/* Caregiver */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3e6b2b] font-bold text-[10px] shrink-0">
                            {initials}
                          </div>
                          <span className="font-semibold text-slate-900 group-hover:text-[#3e6b2b] transition-colors">
                            {visit.caregiverName}
                          </span>
                        </div>
                      </td>

                      {/* Client / Patient */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-900">
                        {visit.clientName}
                      </td>

                      {/* Service & Code */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {visit.serviceName}
                        </span>
                        <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                          {visit.serviceCode}
                        </span>
                      </td>

                      {/* Verification Status with Exception indicator */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {renderVerificationStatusBadge(visit.verificationStatus)}
                          {visit.exceptionReason && (
                            <span
                              title={visit.exceptionReason}
                              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700"
                            >
                              <AlertTriangle className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div
                          className="inline-flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => openQuickReview(visit, e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#3e6b2b]" />
                            <span>Review</span>
                          </button>
                          <Link
                            href={`/admin/evv-visits/${visit.id}/`}
                            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Open full visit details"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        {sortedVisits.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of{" "}
              {totalPages} ({sortedVisits.length} total entries)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs ${currentPage === pageNum
                      ? "bg-[#3e6b2b] text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. CONTEXTUAL BULK ACTIONS BAR (When records selected)
         ========================================================================= */}
      <EvvBulkActionBar
        selectedIds={selectedIds}
        allVisits={visits}
        onClearSelection={() => setSelectedIds([])}
        onActionComplete={loadVisits}
      />

      {/* =========================================================================
          7. RIGHT-SIDE QUICK REVIEW & RESOLUTION DRAWER
         ========================================================================= */}
      <EvvQuickReviewDrawer
        visit={reviewDrawerVisit}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdated={loadVisits}
      />
    </div>
  );
}
