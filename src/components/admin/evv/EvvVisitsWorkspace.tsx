"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  CreditCard,
  TrendingUp,
  Users,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Smartphone,
  PhoneCall,
  Sliders,
  DollarSign,
  Info,
} from "lucide-react";
import { EvvVisitRecord } from "@/types/evvVisit";
import {
  getEvvVisitsFromStorage,
  EVV_SYNC_EVENT,
  DEMO_DATE,
} from "@/lib/admin/evvVisitsStore";
import { EvvSubNav } from "./EvvSubNav";
import { EvvBulkActionBar } from "./EvvBulkActionBar";

export function EvvVisitsWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL view state: overview vs visits
  const initialView = searchParams.get("view") === "visits" ? "visits" : "overview";
  const [activeView, setActiveView] = useState<"overview" | "visits">(initialView);

  // SubNav Filters
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(
    searchParams.get("jurisdiction") || "All Jurisdictions"
  );
  const [selectedDateFilter, setSelectedDateFilter] = useState(
    searchParams.get("dateRange") || "Today & Recent"
  );

  useEffect(() => {
    const v = searchParams.get("view");
    if (v === "visits") {
      setActiveView("visits");
    } else if (v === "overview") {
      setActiveView("overview");
    }
    const j = searchParams.get("jurisdiction") || "All Jurisdictions";
    const d = searchParams.get("dateRange") || "Today & Recent";
    setSelectedJurisdiction(j);
    setSelectedDateFilter(d);
  }, [searchParams]);

  // Visits state
  const [visits, setVisits] = useState<EvvVisitRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters for "All Visits" grid
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssueFilter, setSelectedIssueFilter] = useState("ALL");
  const [complianceFilter, setComplianceFilter] = useState("ALL");
  const [visitStatusFilter, setVisitStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [billingHoldsOnly, setBillingHoldsOnly] = useState(false);

  const loadVisits = () => {
    setVisits(getEvvVisitsFromStorage());
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

  const handleTabChange = (view: "overview" | "visits") => {
    setActiveView(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`/admin/evv-visits?${params.toString()}`);
  };

  // Base visits filtered by jurisdiction & date
  const jurisdictionAndDateVisits = useMemo(() => {
    return visits.filter((v) => {
      // SubNav Jurisdiction Filter
      if (selectedJurisdiction !== "All Jurisdictions") {
        if (selectedJurisdiction === "Ohio Medicaid (ODM)") {
          const isOh =
            v.payerName?.includes("Ohio") ||
            v.payerName?.includes("OH") ||
            v.program?.includes("Ohio") ||
            v.aggregator === "Sandata";
          if (!isOh) return false;
        } else if (selectedJurisdiction === "NJ FamilyCare") {
          const isNj =
            v.payerName?.includes("NJ") ||
            v.payerName?.includes("New Jersey") ||
            v.program?.includes("NJ") ||
            v.aggregator === "HHAeXchange";
          if (!isNj) return false;
        } else if (selectedJurisdiction === "Florida AHCA") {
          const isFl =
            v.payerName?.includes("Florida") ||
            v.payerName?.includes("FL") ||
            v.program?.includes("Florida") ||
            v.aggregator === "Netsmart";
          if (!isFl) return false;
        } else if (selectedJurisdiction === "Private Pay / Commercial") {
          const isPvt =
            v.payerName?.includes("Private") ||
            v.payerName?.includes("Commercial") ||
            v.program?.includes("Private") ||
            v.aggregator === "CareBridge";
          if (!isPvt) return false;
        }
      }

      // SubNav Date Filter
      if (selectedDateFilter !== "Today & Recent") {
        if (selectedDateFilter === "Today (Nov 25, 2026)") {
          const isToday =
            v.date === DEMO_DATE || v.visitStatusBadge?.toLowerCase().includes("today");
          if (!isToday) return false;
        } else if (selectedDateFilter === "Yesterday (Nov 24, 2026)") {
          const isYesterday =
            v.date === "2026-11-24" || v.visitStatusBadge?.toLowerCase().includes("yesterday");
          if (!isYesterday) return false;
        }
      }

      return true;
    });
  }, [visits, selectedJurisdiction, selectedDateFilter]);

  // Dynamic metrics derived from jurisdiction & date filtered visits
  const totalMonitored = jurisdictionAndDateVisits.length;
  const verifiedCount = jurisdictionAndDateVisits.filter((v) => v.complianceStatus === "Verified").length;
  const resolvedCount = jurisdictionAndDateVisits.filter((v) => v.complianceStatus === "Resolved").length;
  const compliantCount = verifiedCount + resolvedCount;
  const exceptionVisitsInFilter = useMemo(() => {
    return jurisdictionAndDateVisits.filter(
      (v) => v.complianceStatus === "Exception" || Boolean(v.issueBadge)
    );
  }, [jurisdictionAndDateVisits]);
  const activeExceptionCount = exceptionVisitsInFilter.length;
  const complianceRate = totalMonitored > 0 ? Math.round((compliantCount / totalMonitored) * 100) : 0;
  const aggregatorAcceptedCount = jurisdictionAndDateVisits.filter(
    (v) => v.aggregatorStatusBadge === "Accepted"
  ).length;
  const payrollApprovedCount = jurisdictionAndDateVisits.filter(
    (v) => v.payrollStatusBadge === "Approved" || v.payrollStatusBadge === "Processed"
  ).length;
  const billingHoldCount = jurisdictionAndDateVisits.filter(
    (v) => v.billingStatusBadge === "Hold"
  ).length;
  const billingHoldExposure = jurisdictionAndDateVisits
    .filter((v) => v.billingStatusBadge === "Hold")
    .reduce((sum, v) => sum + (v.scheduledDurationHours || 4) * (v.billRate || 32), 0);
  const openExceptionsHold = exceptionVisitsInFilter.reduce(
    (sum, v) => sum + (v.scheduledDurationHours || 4) * (v.billRate || 32),
    0
  );
  const aggregatorRejectionsHold = jurisdictionAndDateVisits
    .filter((v) => v.aggregatorStatusBadge === "Rejected")
    .reduce((sum, v) => sum + (v.scheduledDurationHours || 4) * (v.billRate || 32), 0);

  // Filtered visits for the grid
  const filteredVisits = useMemo(() => {
    return jurisdictionAndDateVisits.filter((v) => {
      if (billingHoldsOnly && v.billingStatusBadge !== "Hold") return false;

      if (complianceFilter !== "ALL") {
        if (complianceFilter === "Exception" && v.complianceStatus !== "Exception") return false;
        if (complianceFilter === "Verified" && v.complianceStatus !== "Verified") return false;
        if (complianceFilter === "Resolved" && v.complianceStatus !== "Resolved") return false;
      }

      if (visitStatusFilter !== "ALL") {
        if (visitStatusFilter === "Completed" && v.visitStatus !== "Completed") return false;
        if (visitStatusFilter === "In Progress" && v.visitStatus !== "In Progress") return false;
        if (visitStatusFilter === "Scheduled" && v.visitStatus !== "Scheduled") return false;
      }

      if (methodFilter !== "ALL") {
        if (methodFilter === "GPS" && v.captureMethod !== "Mobile GPS") return false;
        if (methodFilter === "IVR" && v.captureMethod !== "Telephony / IVR") return false;
        if (methodFilter === "Manual" && v.captureMethod !== "Manual Entry") return false;
        if (methodFilter === "Fixed" && v.captureMethod !== "Fixed Device") return false;
      }

      if (selectedIssueFilter !== "ALL") {
        if (selectedIssueFilter === "Location Mismatch" && v.issueBadge !== "Location Mismatch") return false;
        if (selectedIssueFilter === "Missed In" && v.issueBadge !== "Missed In") return false;
        if (selectedIssueFilter === "Missed Out" && v.issueBadge !== "Missed Out") return false;
        if (selectedIssueFilter === "Missed Call" && v.issueBadge !== "Missed Call") return false;
        if (selectedIssueFilter === "Time Variance" && v.issueBadge !== "Time Variance") return false;
        if (selectedIssueFilter === "Verification Missing" && v.issueBadge !== "Verification Missing") return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId =
          v.id.toLowerCase().includes(q) ||
          v.visitNumber.toLowerCase().includes(q) ||
          (v.displayId && v.displayId.toLowerCase().includes(q));
        const matchesCaregiver = v.caregiverName.toLowerCase().includes(q);
        const matchesClient = v.clientName.toLowerCase().includes(q);
        const matchesIssue = v.issueBadge?.toLowerCase().includes(q) || v.exceptionReason?.toLowerCase().includes(q);
        if (!matchesId && !matchesCaregiver && !matchesClient && !matchesIssue) return false;
      }

      return true;
    });
  }, [
    jurisdictionAndDateVisits,
    searchQuery,
    selectedIssueFilter,
    complianceFilter,
    visitStatusFilter,
    methodFilter,
    billingHoldsOnly,
  ]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredVisits.map((v) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Helper for method badge style
  const getMethodBadge = (v: EvvVisitRecord) => {
    const method = v.captureMethod;
    if (method === "Mobile GPS") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <MapPin className="w-3 h-3" />
          GPS
        </span>
      );
    }
    if (method === "Telephony / IVR") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <PhoneCall className="w-3 h-3" />
          IVR
        </span>
      );
    }
    if (method === "Manual Entry") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          Manual
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        Fixed
      </span>
    );
  };

  const getComplianceBadge = (status?: string) => {
    if (status === "Exception") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Exception
        </span>
      );
    }
    if (status === "Resolved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Verified
      </span>
    );
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Shared SubNav Header */}
      <EvvSubNav
        activeTabOverride={activeView === "overview" ? "overview" : "visits"}
        onTabChange={handleTabChange}
        exceptionCount={activeExceptionCount}
        totalVisitsCount={totalMonitored}
        selectedJurisdiction={selectedJurisdiction}
        onJurisdictionChange={(j) => setSelectedJurisdiction(j)}
        selectedDateFilter={selectedDateFilter}
        onDateFilterChange={(d) => setSelectedDateFilter(d)}
      />

      {/* VIEW 1: EVV OVERVIEW (Screenshot 1) */}
      {activeView === "overview" && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: EVV Compliance (Clean White Card) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3D6B22] animate-pulse" />
                  EVV COMPLIANCE
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22]">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                    {complianceRate}%
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {verifiedCount} Ver • {resolvedCount} Res
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
                  <span>{totalMonitored} active visits monitored</span>
                  <span className="text-[#3D6B22] font-bold">↗</span>
                </div>
              </div>
            </div>

            {/* Card 2: Active Exceptions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">
                  ACTIVE EXCEPTIONS
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                    {activeExceptionCount}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Needs Review
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">
                  Isolated by workflow type
                </div>
              </div>
            </div>

            {/* Card 3: Aggregator Accepted */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">
                  AGGREGATOR ACCEPTED
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Send className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                    {aggregatorAcceptedCount}/{totalMonitored}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {jurisdictionAndDateVisits.filter((v) => v.billingStatusBadge === "Billed").length} Billed/Cleared
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium truncate">
                  Sandata • HHAeXchange • Netsmart
                </div>
              </div>
            </div>

            {/* Card 4: Payroll Approved */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">
                  PAYROLL APPROVED
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                    {payrollApprovedCount}/{totalMonitored}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {billingHoldCount} Billing Holds
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">
                  Independent payroll gate
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Trend, Donut, Billing Exposure */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 7-Day Compliance Trend */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    7-Day Compliance Trend
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    91.7% Avg
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  Compliant vs flagged visits (%)
                </p>

                {/* Stacked Bar Chart */}
                <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
                  {[
                    { day: "Thu", comp: 88, exc: 12 },
                    { day: "Fri", comp: 93, exc: 7, active: true },
                    { day: "Sat", comp: 96, exc: 4 },
                    { day: "Sun", comp: 95, exc: 5 },
                    { day: "Mon", comp: 92, exc: 8 },
                    { day: "Tue", comp: 90, exc: 10 },
                    { day: "Today", comp: 85, exc: 15 },
                  ].map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center h-full justify-end relative group">
                      {bar.active && (
                        <div className="absolute -top-6 bg-white border border-slate-200 text-slate-800 text-[10px] font-semibold px-2 py-1 rounded-md shadow-md whitespace-nowrap z-10 pointer-events-none">
                          Fri Compliant: 93% • Exc: 7%
                        </div>
                      )}
                      <div className="w-full max-w-[28px] flex flex-col items-center h-full justify-end rounded-t-md overflow-hidden">
                        <div
                          style={{ height: `${bar.exc}%` }}
                          className="w-full bg-amber-400 hover:bg-amber-500 transition-colors"
                        />
                        <div
                          style={{ height: `${bar.comp}%` }}
                          className="w-full bg-emerald-400 hover:bg-emerald-500 transition-colors"
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 mt-2">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 mt-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                  Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                  Exceptions
                </span>
              </div>
            </div>

            {/* Exception Breakdown Donut */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-slate-500" />
                    Exception Breakdown
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {activeExceptionCount} Total
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  Click a segment to filter Exceptions
                </p>

                <div className="flex items-center justify-between gap-4 py-2">
                  {/* Circular visual donut */}
                  <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        className="text-slate-100"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Segment 1: Compliant */}
                      <path
                        className="text-emerald-500"
                        strokeDasharray={`${complianceRate}, 100`}
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Segment 2: Exceptions */}
                      {complianceRate < 100 && (
                        <path
                          className="text-amber-500"
                          strokeDasharray={`${100 - complianceRate}, 100`}
                          strokeDashoffset={`-${complianceRate}`}
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      )}
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-lg font-extrabold text-slate-900 block leading-tight">
                        {complianceRate}%
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        COMPLIANT
                      </span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="flex-1 space-y-1.5 text-xs font-medium text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        Location Mismatch
                      </span>
                      <span className="font-bold text-slate-800">
                        {jurisdictionAndDateVisits.filter((v) => v.issueBadge === "Location Mismatch").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                        Missed Out
                      </span>
                      <span className="font-bold text-slate-800">
                        {jurisdictionAndDateVisits.filter((v) => v.issueBadge === "Missed Out").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        Missed In
                      </span>
                      <span className="font-bold text-slate-800">
                        {jurisdictionAndDateVisits.filter((v) => v.issueBadge === "Missed In").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                        Missed Call
                      </span>
                      <span className="font-bold text-slate-800">
                        {jurisdictionAndDateVisits.filter((v) => v.issueBadge === "Missed Call").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                        Time Variance
                      </span>
                      <span className="font-bold text-slate-800">
                        {jurisdictionAndDateVisits.filter((v) => v.issueBadge === "Time Variance").length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Hold Exposure */}
            <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Billing Hold Exposure
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                    PRE-CLAIM GATE
                  </span>
                </div>

                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-rose-600 block">
                    ${billingHoldExposure.toFixed(2)}
                  </span>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Held pending EVV resolution or aggregator acceptance
                  </p>
                </div>

                <div className="mt-5 space-y-2.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Open Exceptions</span>
                    <span className="font-bold text-slate-900">${openExceptionsHold.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Aggregator Rejections</span>
                    <span className="font-bold text-slate-900">${aggregatorRejectionsHold.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Link
                  href="/admin/evv-visits/exceptions"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all active:scale-95"
                >
                  <span>Review & Resolve Holds</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Row: Readiness, Coaching, Priority Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Processing Readiness */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    Processing Readiness
                  </h3>
                  <Link
                    href="/admin/evv-visits/submissions"
                    className="text-xs font-bold text-[#3D6B22] hover:text-[#345C1D] flex items-center gap-1"
                  >
                    Open Pipeline →
                  </Link>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  EVV, Aggregator, Billing & Payroll
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        EVV Verified or Resolved
                      </span>
                      <span className="font-bold text-slate-900">
                        {compliantCount}/{totalMonitored} ({complianceRate}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${complianceRate}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Aggregator Accepted
                      </span>
                      <span className="font-bold text-slate-900">
                        {aggregatorAcceptedCount}/{totalMonitored} ({totalMonitored > 0 ? Math.round((aggregatorAcceptedCount / totalMonitored) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${totalMonitored > 0 ? Math.round((aggregatorAcceptedCount / totalMonitored) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Billing Cleared / Billed
                      </span>
                      <span className="font-bold text-slate-900">
                        {jurisdictionAndDateVisits.filter((v) => v.billingStatusBadge === "Billed").length}/{totalMonitored} ({totalMonitored > 0 ? Math.round((jurisdictionAndDateVisits.filter((v) => v.billingStatusBadge === "Billed").length / totalMonitored) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${totalMonitored > 0 ? Math.round((jurisdictionAndDateVisits.filter((v) => v.billingStatusBadge === "Billed").length / totalMonitored) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                        Payroll Approved / Processed
                      </span>
                      <span className="font-bold text-slate-900">
                        {payrollApprovedCount}/{totalMonitored} ({totalMonitored > 0 ? Math.round((payrollApprovedCount / totalMonitored) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3D6B22] rounded-full"
                        style={{ width: `${totalMonitored > 0 ? Math.round((payrollApprovedCount / totalMonitored) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Caregivers Needing Coaching */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    Caregivers Needing Coaching
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    3 Staff
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  Repeat EVV punch exceptions this period
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        SJ
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Sarah Jenkins <span className="text-[10px] text-slate-400 font-medium">CG-1085</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Primary issue: Missed Out
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      6 EXCEPTIONS
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        DK
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          David Kim <span className="text-[10px] text-slate-400 font-medium">CG-1091</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Primary issue: Missed In
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      4 EXCEPTIONS
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        PS
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Hannah Miller <span className="text-[10px] text-slate-400 font-medium">CG-1084</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Primary issue: Location Mismatch
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      2 EXCEPTIONS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Exception Queue */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Priority Exception Queue
                  </h3>
                  <Link
                    href="/admin/evv-visits/exceptions"
                    className="text-xs font-bold text-[#3D6B22] hover:text-[#345C1D] flex items-center gap-1"
                  >
                    View All →
                  </Link>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  {activeExceptionCount} open exception{activeExceptionCount === 1 ? "" : "s"} requiring review
                </p>

                <div className="space-y-2.5">
                  {exceptionVisitsInFilter.length === 0 ? (
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-center text-xs text-slate-500 font-medium">
                      No open exceptions for selected filters.
                    </div>
                  ) : (
                    exceptionVisitsInFilter.slice(0, 3).map((exc) => (
                      <Link
                        key={exc.id}
                        href={`/admin/evv-visits/${exc.id}`}
                        className="block p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{exc.displayId || exc.id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            {exc.issueBadge || "Exception"}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-1">
                          {exc.caregiverName} → {exc.clientName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {exc.exceptionReason || exc.exceptionTitle || "Pending guided resolution"}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL VISITS OPERATIONAL GRID (Screenshot 2) */}
      {activeView === "visits" && (
        <div className="space-y-4">
          {/* Search, Filter Bar and Dropdowns */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Visit ID, caregiver, client, or issue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20"
                />
              </div>

              {/* Right Select Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={complianceFilter}
                  onChange={(e) => setComplianceFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 shadow-2xs cursor-pointer"
                >
                  <option value="ALL">Compliance: All</option>
                  <option value="Exception">Exception</option>
                  <option value="Verified">Verified</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  value={visitStatusFilter}
                  onChange={(e) => setVisitStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 shadow-2xs cursor-pointer"
                >
                  <option value="ALL">Visit Status: All</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Scheduled">Scheduled</option>
                </select>

                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 shadow-2xs cursor-pointer"
                >
                  <option value="ALL">Method: All</option>
                  <option value="GPS">GPS</option>
                  <option value="IVR">IVR</option>
                  <option value="Manual">Manual</option>
                  <option value="Fixed">Fixed</option>
                </select>

                <button
                  type="button"
                  onClick={() => setBillingHoldsOnly(!billingHoldsOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${billingHoldsOnly
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                    }`}
                >
                  <Filter className="w-3 h-3" />
                  <span>Billing Holds Only</span>
                </button>
              </div>
            </div>

            {/* Issue Filter Pills Row */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-slate-100">
              {[
                { id: "ALL", label: "All Issues", count: visits.length },
                { id: "Location Mismatch", label: "Location Mismatch", count: 1 },
                { id: "Missed In", label: "Missed In", count: 1 },
                { id: "Missed Out", label: "Missed Out", count: 1 },
                { id: "Missed Call", label: "Missed Call", count: 1 },
                { id: "Time Variance", label: "Time Variance", count: 1 },
                { id: "Verification Missing", label: "Verification Missing", count: 1 },
              ].map((pill) => {
                const isActive = selectedIssueFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedIssueFilter(pill.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                      ? "bg-[#3D6B22] text-white shadow-xs font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                      }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive
                        ? "bg-white/20 text-white"
                        : pill.id !== "ALL"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-slate-200 text-slate-700"
                        }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean Front List Table without Horizontal Scroll */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 pl-4 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredVisits.length > 0 &&
                          selectedIds.length === filteredVisits.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]/20 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-3 w-36">VISIT</th>
                    <th className="py-3.5 px-3">CAREGIVER</th>
                    <th className="py-3.5 px-3">CLIENT</th>
                    <th className="py-3.5 px-3">TIME</th>
                    <th className="py-3.5 px-3">EVV STATUS</th>
                    <th className="py-3.5 pr-4 pl-3 text-right w-24">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredVisits.map((visit) => {
                    const isSelected = selectedIds.includes(visit.id);
                    const isException = visit.complianceStatus === "Exception";
                    const targetUrl = `/admin/evv-visits/${visit.id}`;

                    return (
                      <tr
                        key={visit.id}
                        onClick={() => router.push(targetUrl)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${isSelected ? "bg-slate-50" : ""
                          }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="py-3 pl-4 pr-2"
                          onClick={(e) => handleToggleRow(visit.id, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }}
                            className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]/20 cursor-pointer"
                          />
                        </td>

                        {/* Visit ID & Visit Status badge */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                            {visit.displayId || visit.visitNumber || visit.id}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${visit.issueBadge === "Missed In" ||
                                visit.issueBadge === "Missed Out" ||
                                visit.issueBadge === "Missed Call"
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : visit.visitStatus === "In Progress"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : visit.visitStatus === "Scheduled"
                                    ? "bg-slate-100 text-slate-600 border-slate-200"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                            >
                              {visit.issueBadge === "Missed In" ||
                                visit.issueBadge === "Missed Out" ||
                                visit.issueBadge === "Missed Call"
                                ? "Incomplete"
                                : visit.visitStatus === "Scheduled"
                                  ? "Not Started"
                                  : visit.visitStatus}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {visit.date === "2026-11-24" ||
                                visit.visitStatusBadge?.toLowerCase().includes("yesterday")
                                ? "Yesterday"
                                : "Today"}
                            </span>
                          </div>
                        </td>

                        {/* Caregiver */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                              {visit.caregiverInitials || visit.caregiverName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900 truncate">
                              {visit.caregiverName}
                            </span>
                          </div>
                        </td>

                        {/* Client */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-blue-200">
                              {visit.clientInitials || visit.clientName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900 truncate">
                              {visit.clientName}
                            </span>
                          </div>
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-800 text-xs">
                            {visit.timeDisplay ? (
                              visit.timeDisplay.includes("Missing") ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {visit.timeDisplay.split(" ").map((token, idx) =>
                                    token === "Missing" || token === "In" || token === "Out" ? (
                                      <span key={idx} className="text-rose-600 font-bold">
                                        {token}
                                      </span>
                                    ) : (
                                      <span key={idx}>{token}</span>
                                    )
                                  )}
                                </div>
                              ) : (
                                visit.timeDisplay
                              )
                            ) : (
                              `${visit.scheduledStartTime} - ${visit.scheduledEndTime}`
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {visit.timeScheduledDisplay || `Sched: ${visit.scheduledStartTime} - ${visit.scheduledEndTime}`}
                          </div>
                        </td>

                        {/* EVV Status */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            {getComplianceBadge(visit.complianceStatus)}
                            {getMethodBadge(visit)}
                          </div>
                        </td>

                        {/* Action Details */}
                        <td className="py-3.5 pr-4 pl-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(targetUrl);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-2xs ${isException
                              ? "bg-[#3D6B22] hover:bg-[#345C1D] text-white font-bold"
                              : "bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-semibold"
                              }`}
                          >
                            <span>{isException ? "Review" : "Details"}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-800">{filteredVisits.length}</span> of{" "}
                <span className="font-bold text-slate-800">{visits.length}</span> visits
              </div>
              <div className="text-[11px] text-slate-400">
                Select any visit row to open full verification, exception resolution, and readiness details.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Actions Bar (Shown when any table checkbox is checked) */}
      <EvvBulkActionBar
        selectedIds={selectedIds}
        allVisits={visits}
        onClearSelection={() => setSelectedIds([])}
        onActionComplete={loadVisits}
      />
    </div>
  );
}
