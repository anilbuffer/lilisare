"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  FileText,
  MapPin,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { EvvVisitRecord } from "@/types/evvVisit";
import {
  getEvvVisitsFromStorage,
  EVV_SYNC_EVENT,
  DEMO_DATE,
} from "@/lib/admin/evvVisitsStore";
import { EvvSubNav } from "./EvvSubNav";
import { EvvBulkActionBar } from "./EvvBulkActionBar";

export function EvvExceptionsWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedJurisdiction, setSelectedJurisdiction] = useState(
    searchParams.get("jurisdiction") || "All Jurisdictions"
  );
  const [selectedDateFilter, setSelectedDateFilter] = useState(
    searchParams.get("dateRange") || "Today & Recent"
  );

  useEffect(() => {
    const j = searchParams.get("jurisdiction") || "All Jurisdictions";
    const d = searchParams.get("dateRange") || "Today & Recent";
    setSelectedJurisdiction(j);
    setSelectedDateFilter(d);
  }, [searchParams]);

  const [visits, setVisits] = useState<EvvVisitRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssueFilter, setSelectedIssueFilter] = useState("ALL");
  const [selectedWorkflowCard, setSelectedWorkflowCard] = useState<string | null>(null);
  const [visitStatusFilter, setVisitStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [billingHoldsOnly, setBillingHoldsOnly] = useState(false);

  const loadData = () => {
    setVisits(getEvvVisitsFromStorage());
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

  // Filter only exceptions
  const exceptionVisits = useMemo(() => {
    return visits.filter(
      (v) =>
        v.complianceStatus === "Exception" ||
        v.verificationStatus === "Exception" ||
        Boolean(v.issueBadge)
    );
  }, [visits]);

  // Secondary filters
  const filteredExceptions = useMemo(() => {
    return exceptionVisits.filter((v) => {
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

      if (billingHoldsOnly && v.billingStatusBadge !== "Hold") return false;

      if (visitStatusFilter !== "ALL") {
        if (visitStatusFilter === "Completed" && v.visitStatus !== "Completed") return false;
        if (visitStatusFilter === "In Progress" && v.visitStatus !== "In Progress") return false;
      }

      if (methodFilter !== "ALL") {
        if (methodFilter === "GPS" && v.captureMethod !== "Mobile GPS") return false;
        if (methodFilter === "IVR" && v.captureMethod !== "Telephony / IVR") return false;
        if (methodFilter === "Manual" && v.captureMethod !== "Manual Entry") return false;
        if (methodFilter === "Fixed" && v.captureMethod !== "Fixed Device") return false;
      }

      // Workflow card filter
      if (selectedWorkflowCard === "missed_punches") {
        if (v.issueBadge !== "Missed In" && v.issueBadge !== "Missed Out") return false;
      } else if (selectedWorkflowCard === "attestation") {
        if (v.issueBadge !== "Missed Call" && v.issueBadge !== "Verification Missing") return false;
      } else if (selectedWorkflowCard === "location") {
        if (v.issueBadge !== "Location Mismatch" && v.issueBadge !== "Time Variance") return false;
      }

      // Issue pill filter
      if (selectedIssueFilter !== "ALL") {
        if (v.issueBadge !== selectedIssueFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId =
          v.id.toLowerCase().includes(q) ||
          v.visitNumber.toLowerCase().includes(q) ||
          (v.displayId && v.displayId.toLowerCase().includes(q));
        const matchesCaregiver = v.caregiverName.toLowerCase().includes(q);
        const matchesClient = v.clientName.toLowerCase().includes(q);
        const matchesIssue =
          v.issueBadge?.toLowerCase().includes(q) ||
          v.exceptionReason?.toLowerCase().includes(q);
        if (!matchesId && !matchesCaregiver && !matchesClient && !matchesIssue) return false;
      }

      return true;
    });
  }, [
    exceptionVisits,
    selectedJurisdiction,
    selectedDateFilter,
    selectedIssueFilter,
    selectedWorkflowCard,
    visitStatusFilter,
    methodFilter,
    billingHoldsOnly,
    searchQuery,
  ]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredExceptions.map((v) => v.id));
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

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Shared SubNav Header */}
      <EvvSubNav
        activeTabOverride="exceptions"
        exceptionCount={filteredExceptions.length}
        totalVisitsCount={visits.length || 11}
        selectedJurisdiction={selectedJurisdiction}
        onJurisdictionChange={(j) => setSelectedJurisdiction(j)}
        selectedDateFilter={selectedDateFilter}
        onDateFilterChange={(d) => setSelectedDateFilter(d)}
      />

      {/* 3 Guided Resolution / Workflow Cards (Screenshot 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Card 1: Missed In / Missed Out */}
        <button
          type="button"
          onClick={() =>
            setSelectedWorkflowCard((prev) =>
              prev === "missed_punches" ? null : "missed_punches"
            )
          }
          className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
            selectedWorkflowCard === "missed_punches"
              ? "bg-rose-50/60 border-rose-300 shadow-md ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Missed In / Missed Out
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                Capture missing start or end punch while preserving raw original EVV events.
              </p>
            </div>
          </div>
        </button>

        {/* Card 2: Missed Call & Manual Attestation */}
        <button
          type="button"
          onClick={() =>
            setSelectedWorkflowCard((prev) =>
              prev === "attestation" ? null : "attestation"
            )
          }
          className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
            selectedWorkflowCard === "attestation"
              ? "bg-amber-50/60 border-amber-300 shadow-md ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Missed Call & Manual Attestation
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                Confirm via signed timesheet, alternate IVR voice, and mandatory attestation.
              </p>
            </div>
          </div>
        </button>

        {/* Card 3: Location & Verification Review */}
        <button
          type="button"
          onClick={() =>
            setSelectedWorkflowCard((prev) =>
              prev === "location" ? null : "location"
            )
          }
          className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
            selectedWorkflowCard === "location"
              ? "bg-blue-50/60 border-blue-300 shadow-md ring-2 ring-blue-500/20"
              : "bg-white border-slate-200 hover:border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Location & Verification Review
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                Update service addresses, link patient phones, and verify GPS/IVR variance.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
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
              disabled
              value="Exception"
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-rose-700 shadow-2xs"
            >
              <option value="Exception">Exception</option>
            </select>

            <select
              value={visitStatusFilter}
              onChange={(e) => setVisitStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 shadow-2xs cursor-pointer"
            >
              <option value="ALL">Visit Status: All</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                billingHoldsOnly
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
            { id: "ALL", label: "All Issues", count: 7 },
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
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#3D6B22] text-white shadow-xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clean Front List Table without Horizontal Scrolling */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredExceptions.length > 0 &&
                      selectedIds.length === filteredExceptions.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]/20 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 w-36">VISIT</th>
                <th className="py-3.5 px-3">CAREGIVER</th>
                <th className="py-3.5 px-3">CLIENT</th>
                <th className="py-3.5 px-3">TIME</th>
                <th className="py-3.5 px-3">ISSUE & STATUS</th>
                <th className="py-3.5 pr-4 pl-3 text-right w-24">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredExceptions.map((visit) => {
                const isSelected = selectedIds.includes(visit.id);
                const targetUrl = `/admin/evv-visits/exceptions/${visit.id}`;

                return (
                  <tr
                    key={visit.id}
                    onClick={() => router.push(targetUrl)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                      isSelected ? "bg-slate-50" : ""
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
                        onChange={() => {}}
                        className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]/20 cursor-pointer"
                      />
                    </td>

                    {/* Visit ID & Status */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                        {visit.displayId || visit.visitNumber || visit.id}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                            visit.issueBadge === "Missed In" ||
                            visit.issueBadge === "Missed Out" ||
                            visit.issueBadge === "Missed Call"
                              ? "bg-rose-50 text-rose-600 border-rose-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {visit.issueBadge === "Missed In" ||
                          visit.issueBadge === "Missed Out" ||
                          visit.issueBadge === "Missed Call"
                            ? "Incomplete"
                            : "Completed"}
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

                    {/* Issue & Status */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Exception
                        </span>
                        {visit.issueBadge && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50/80 text-rose-700 border border-rose-200 shrink-0">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            {visit.issueBadge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Details */}
                    <td className="py-3 pr-4 pl-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(targetUrl);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#3D6B22] hover:bg-[#345C1D] text-white shadow-2xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredExceptions.length}</span> of{" "}
            <span className="font-bold text-slate-800">7</span> visits
          </div>
          <div className="text-[11px] text-slate-400">
            Select any visit row to open full verification, exception resolution, and readiness details.
          </div>
        </div>
      </div>

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
