"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  DollarSign,
  ChevronRight,
  RotateCcw,
  Server,
  Layers,
  FileCode,
  X,
  CreditCard,
  ShieldCheck,
  Check,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { EvvVisitRecord, EvvBatchRecord, EvvToleranceRule } from "@/types/evvVisit";
import {
  getEvvVisitsFromStorage,
  getEvvBatchesFromStorage,
  getEvvRulesFromStorage,
  saveEvvRule,
  EVV_SYNC_EVENT,
  DEMO_DATE,
} from "@/lib/admin/evvVisitsStore";
import { EvvSubNav } from "./EvvSubNav";
import { EvvBulkActionBar } from "./EvvBulkActionBar";

export function EvvSubmissionsWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sub-tabs: 'readiness' | 'batch' | 'rules'
  const tabParam = searchParams.get("tab");
  const initialSubTab =
    tabParam === "batch" ? "batch" : tabParam === "rules" ? "rules" : "readiness";
  const [subTab, setSubTab] = useState<"readiness" | "batch" | "rules">(initialSubTab);

  const [selectedJurisdiction, setSelectedJurisdiction] = useState(
    searchParams.get("jurisdiction") || "All Jurisdictions"
  );
  const [selectedDateFilter, setSelectedDateFilter] = useState(
    searchParams.get("dateRange") || "Today & Recent"
  );

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "batch") setSubTab("batch");
    else if (t === "rules") setSubTab("rules");
    else if (t === "readiness") setSubTab("readiness");

    const j = searchParams.get("jurisdiction") || "All Jurisdictions";
    const d = searchParams.get("dateRange") || "Today & Recent";
    setSelectedJurisdiction(j);
    setSelectedDateFilter(d);
  }, [searchParams]);

  const [visits, setVisits] = useState<EvvVisitRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batches, setBatches] = useState<EvvBatchRecord[]>([]);
  const [rules, setRules] = useState<EvvToleranceRule[]>([]);

  // Filter state for Visit Readiness & Holds
  const [readinessFilter, setReadinessFilter] = useState<
    "ALL" | "REJECTED" | "HOLDS" | "PAYROLL"
  >("ALL");

  // Search for Batches
  const [batchSearchQuery, setBatchSearchQuery] = useState("");
  const [selectedBatchJson, setSelectedBatchJson] = useState<EvvBatchRecord | null>(null);

  const loadData = () => {
    setVisits(getEvvVisitsFromStorage());
    setBatches(getEvvBatchesFromStorage());
    setRules(getEvvRulesFromStorage());
  };

  useEffect(() => {
    loadData();
    if (typeof window !== "undefined") {
      window.addEventListener(EVV_SYNC_EVENT, loadData);
      window.addEventListener("storage", loadData);
      return () => {
        window.removeEventListener(EVV_SYNC_EVENT, loadData);
        window.removeEventListener("storage", loadData);
      };
    }
  }, []);

  const handleSubTabChange = (tab: "readiness" | "batch" | "rules") => {
    setSubTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab === "rules") {
      router.push(`/admin/evv-visits/rules?${params.toString()}`);
    } else {
      router.push(`/admin/evv-visits/submissions?${params.toString()}`);
    }
  };

  // Filtered visits for Visit Readiness table
  const filteredVisits = useMemo(() => {
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

      if (readinessFilter === "REJECTED") {
        return v.aggregatorStatusBadge === "Rejected";
      }
      if (readinessFilter === "HOLDS") {
        return v.billingStatusBadge === "Hold";
      }
      if (readinessFilter === "PAYROLL") {
        return v.payrollStatusBadge === "Pending Review";
      }
      return true;
    });
  }, [visits, readinessFilter, selectedJurisdiction, selectedDateFilter]);

  // Filtered batches for Batch Submissions table
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      // SubNav Jurisdiction Filter
      if (selectedJurisdiction !== "All Jurisdictions") {
        if (selectedJurisdiction === "Ohio Medicaid (ODM)") {
          const isOh = b.state === "OH" || b.aggregatorName === "Sandata";
          if (!isOh) return false;
        } else if (selectedJurisdiction === "NJ FamilyCare") {
          const isNj = b.state === "NJ" || b.aggregatorName === "HHAeXchange" || b.aggregator.includes("NY");
          if (!isNj) return false;
        } else if (selectedJurisdiction === "Florida AHCA") {
          const isFl = b.state === "FL" || b.aggregatorName === "Netsmart";
          if (!isFl) return false;
        }
      }

      // SubNav Date Filter
      if (selectedDateFilter !== "Today & Recent") {
        if (selectedDateFilter === "Today (Nov 25, 2026)") {
          const isToday = b.timestamp.toLowerCase().includes("today");
          if (!isToday) return false;
        } else if (selectedDateFilter === "Yesterday (Nov 24, 2026)") {
          const isYesterday = b.timestamp.toLowerCase().includes("yesterday");
          if (!isYesterday) return false;
        }
      }

      if (batchSearchQuery.trim()) {
        const q = batchSearchQuery.toLowerCase().trim();
        return (
          b.id.toLowerCase().includes(q) ||
          b.aggregator.toLowerCase().includes(q) ||
          b.status.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [batches, batchSearchQuery, selectedJurisdiction, selectedDateFilter]);

  // Actions
  const handleQuickSubmit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Visit Submitted to Aggregator", {
      description: `Visit ${id} queued for state gateway batch transmission.`,
    });
  };

  const handleClearBill = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Billing Cleared", {
      description: `Hold removed from visit ${id}. Cleared for 837 claim generation.`,
    });
  };

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
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitBatchNow = () => {
    toast.success("Batch Submission Dispatched", {
      description: "14 pending visits transmitted to state aggregators (Sandata & HHAeXchange).",
    });
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Shared SubNav Header */}
      <EvvSubNav
        activeTabOverride="submissions"
        exceptionCount={visits.filter((v) => v.complianceStatus === "Exception" || Boolean(v.issueBadge)).length}
        totalVisitsCount={visits.length || 11}
        selectedJurisdiction={selectedJurisdiction}
        onJurisdictionChange={(j) => setSelectedJurisdiction(j)}
        selectedDateFilter={selectedDateFilter}
        onDateFilterChange={(d) => setSelectedDateFilter(d)}
      />

      {/* Sub-Navigation Pills (Screenshot 4, 5, 6) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          type="button"
          onClick={() => handleSubTabChange("readiness")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${subTab === "readiness"
            ? "bg-[#3D6B22] text-white border border-[#3D6B22] shadow-sm"
            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Visit Readiness & Holds</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabChange("batch")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${subTab === "batch"
            ? "bg-[#3D6B22] text-white border border-[#3D6B22] shadow-sm"
            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Batch Submissions</span>
        </button>

        <Link
          href="/admin/evv-visits/rules"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${subTab === "rules"
            ? "bg-[#3D6B22] text-white border border-[#3D6B22] shadow-sm"
            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Payer Tolerance & State Connectors</span>
        </Link>
      </div>

      {/* SUB-TAB 1: VISIT READINESS & HOLDS (Screenshot 4) */}
      {subTab === "readiness" && (
        <div className="space-y-6">
          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Aggregator Accepted */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">
                  AGGREGATOR ACCEPTED
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 mb-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-600">
                  2
                </span>
                <p className="text-xs text-slate-500 font-medium mt-1">State portal confirmed</p>
              </div>
            </div>

            {/* Card 2: Aggregator Rejections */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">
                  AGGREGATOR REJECTIONS
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 mb-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-rose-600">
                  1
                </span>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Requires correction & resend
                </p>
              </div>
            </div>

            {/* Card 3: Billing Holds */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">
                  BILLING HOLDS
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 mb-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-700">
                  7
                </span>
                <p className="text-xs text-slate-500 font-medium mt-1">Blocked from 837 claims</p>
              </div>
            </div>

            {/* Card 4: Payroll Pending */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">
                  PAYROLL PENDING
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 mb-1">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  3
                </span>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Completed visits awaiting approval
                </p>
              </div>
            </div>
          </div>

          {/* Section Header & Filter Pills */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Visit Readiness & Holds
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Summary readiness across Aggregator, Billing, and Payroll. Open any row for rejection reasons and financial controls.
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
              {[
                { id: "ALL" as const, label: "All Visits" },
                { id: "REJECTED" as const, label: "Aggregator Rejected" },
                { id: "HOLDS" as const, label: "Billing Holds" },
                { id: "PAYROLL" as const, label: "Payroll Pending" },
              ].map((pill) => {
                const isActive = readinessFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setReadinessFilter(pill.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                      ? "bg-[#3D6B22] text-white shadow-2xs font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table: Visit Readiness & Holds */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-3 w-40">VISIT</th>
                    <th className="py-3.5 px-3">CAREGIVER / CLIENT</th>
                    <th className="py-3.5 px-3">COMPLIANCE</th>
                    <th className="py-3.5 px-3">AGGREGATOR</th>
                    <th className="py-3.5 px-3">BILLING</th>
                    <th className="py-3.5 px-3">PAYROLL</th>
                    <th className="py-3.5 pr-6 pl-3 text-right">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredVisits.map((visit) => {
                    const targetUrl = `/admin/evv-visits/${visit.id}`;

                    // Status Pill Helpers
                    const complianceBadge =
                      visit.complianceStatus === "Exception" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Exception
                        </span>
                      ) : visit.complianceStatus === "Resolved" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Verified
                        </span>
                      );

                    const aggregatorBadge =
                      visit.aggregatorStatusBadge === "Accepted" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Accepted
                        </span>
                      ) : visit.aggregatorStatusBadge === "Rejected" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Rejected
                        </span>
                      ) : visit.aggregatorStatusBadge === "Submitted" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Submitted
                        </span>
                      ) : visit.aggregatorStatusBadge === "Pending" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Not Submitted
                        </span>
                      );

                    const billingBadge =
                      visit.billingStatusBadge === "Cleared" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Cleared
                        </span>
                      ) : visit.billingStatusBadge === "Billed" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Billed
                        </span>
                      ) : visit.billingStatusBadge === "Hold" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Hold
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Pending Review
                        </span>
                      );

                    const payrollBadge =
                      visit.payrollStatusBadge === "Approved" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Approved
                        </span>
                      ) : visit.payrollStatusBadge === "Processed" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Processed
                        </span>
                      ) : visit.payrollStatusBadge === "Hold" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Hold
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Pending Review
                        </span>
                      );

                    return (
                      <tr
                        key={visit.id}
                        onClick={() => router.push(targetUrl)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Visit ID & Status */}
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                            {visit.displayId || visit.visitNumber || visit.id}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${visit.visitStatus === "Completed"
                                ? "bg-slate-100 text-slate-700 border-slate-200"
                                : visit.visitStatus === "In Progress"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                            >
                              {visit.visitStatus === "In Progress" ? "Incomplete" : visit.visitStatus}
                            </span>
                          </div>
                        </td>

                        {/* Caregiver / Client */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 truncate">
                            {visit.caregiverName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {visit.clientName}
                          </div>
                        </td>

                        {/* Compliance */}
                        <td className="py-3 px-3">{complianceBadge}</td>

                        {/* Aggregator */}
                        <td className="py-3 px-3">{aggregatorBadge}</td>

                        {/* Billing */}
                        <td className="py-3.5 px-3">{billingBadge}</td>

                        {/* Payroll */}
                        <td className="py-3.5 px-3">{payrollBadge}</td>

                        {/* Action Details with quick action buttons */}
                        <td className="py-3.5 pr-6 pl-3 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            {visit.id === "EVV-2026-007" && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickSubmit(visit.id, e)}
                                  className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                                >
                                  Submit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleClearBill(visit.id, e)}
                                  className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 rounded-md transition-colors cursor-pointer"
                                >
                                  Clear Bill
                                </button>
                              </>
                            )}

                            {(visit.id === "EVV-2026-010" || visit.id === "EVV-2026-011") && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickSubmit(visit.id, e)}
                                className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                              >
                                Submit
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(targetUrl);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-2xs bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-semibold"
                            >
                              <span>Details</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BATCH SUBMISSIONS (Screenshot 5) */}
      {subTab === "batch" && (
        <div className="space-y-6">
          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Accepted Rate */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">
                  ACCEPTED RATE
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 mb-1">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  98.2%
                </span>
              </div>
            </div>

            {/* Rejected Visits */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">
                  REJECTED VISITS
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 mb-1">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  3
                </span>
              </div>
            </div>

            {/* Total Submissions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">
                  TOTAL SUBMISSIONS
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Server className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 mb-1">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  423
                </span>
              </div>
            </div>

            {/* Pending Batch with Submit Now Button (Light Card) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 block">
                  PENDING BATCH
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 block">
                  14 Visits
                </span>
              </div>
              <button
                type="button"
                onClick={handleSubmitBatchNow}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <span>Submit Now</span>
                <span className="text-sm">↗</span>
              </button>
            </div>
          </div>

          {/* Table Header & Search */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Recent Aggregator Submissions
            </h2>

            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search batch ID or aggregator..."
                value={batchSearchQuery}
                onChange={(e) => setBatchSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20"
              />
            </div>
          </div>

          {/* Recent Aggregator Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 pl-4 pr-3">BATCH ID</th>
                    <th className="py-3.5 px-3">AGGREGATOR</th>
                    <th className="py-3.5 px-3">TIMESTAMP</th>
                    <th className="py-3.5 px-3">VISITS INCLUDED</th>
                    <th className="py-3.5 px-3">STATUS</th>
                    <th className="py-3.5 pr-4 pl-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredBatches.map((batch) => {
                    const isAccepted = batch.status === "Accepted";
                    return (
                      <tr
                        key={batch.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 pl-4 pr-3 font-bold text-slate-900">
                          {batch.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {batch.state}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {batch.aggregatorName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {batch.timestamp}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {batch.visitsIncluded} visits
                        </td>
                        <td className="py-3 px-3">
                          {isAccepted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Accepted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              {batch.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBatchJson(batch)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#3D6B22] bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-[#3D6B22]/40 transition-all cursor-pointer shadow-2xs"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>View JSON</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* JSON Payload Modal */}
      {selectedBatchJson && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Aggregator Transmission Payload
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Batch {selectedBatchJson.id} • {selectedBatchJson.aggregator}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatchJson(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 bg-slate-50 border-t border-slate-100 font-mono text-xs text-slate-800">
              <pre className="whitespace-pre-wrap leading-relaxed text-slate-700">
                {JSON.stringify(
                  {
                    batch_header: {
                      batch_id: selectedBatchJson.id,
                      aggregator: selectedBatchJson.aggregator,
                      state: selectedBatchJson.state,
                      transmitted_at: selectedBatchJson.timestamp,
                      total_records: selectedBatchJson.visitsIncluded,
                      interchange_control: "ISA*00*          *00*          *ZZ*LILISARE       *ZZ*STATE_GATEWAY  *",
                      standard: "HIPAA ASC X12 837 / State EVV v2.4",
                      status: selectedBatchJson.status,
                    },
                    sample_visit_transmission: {
                      visit_id: "EVV-2026-003",
                      individual_receiving: "Sarah Johnson",
                      medicaid_id: "•••-••-8814",
                      individual_providing: "Hannah Miller",
                      caregiver_npi: "1982736450",
                      service_code: "T1019",
                      date_of_service: "2026-11-25",
                      clock_in: "2026-11-25T08:07:12Z",
                      clock_out: "2026-11-25T12:02:40Z",
                      capture_method: "GPS",
                      geofence_verified: false,
                      variance_feet: 185,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50 gap-2">
              <button
                type="button"
                onClick={() => setSelectedBatchJson(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Actions Bar (Shown when any table checkbox is checked) */}
      <EvvBulkActionBar
        selectedIds={selectedIds}
        allVisits={visits}
        onClearSelection={() => setSelectedIds([])}
        onActionComplete={loadData}
      />
    </div>
  );
}
