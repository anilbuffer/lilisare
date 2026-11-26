"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Search,
  Filter,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { EvvVisitRecord } from "@/types/evvVisit";
import {
  getEvvVisitsFromStorage,
  EVV_REVIEWERS,
  EVV_SYNC_EVENT,
  bulkAssignReviewer,
} from "@/lib/admin/evvVisitsStore";
import { EvvSubNav } from "./EvvSubNav";

export function EvvExceptionsWorkspace() {
  const router = useRouter();
  const [visits, setVisits] = useState<EvvVisitRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExceptionType, setSelectedExceptionType] = useState("ALL");
  const [selectedReviewer, setSelectedReviewer] = useState("ALL");
  const [selectedResolutionStatus, setSelectedResolutionStatus] = useState("ALL");
  const [selectedService, setSelectedService] = useState("ALL");

  const loadData = () => {
    const all = getEvvVisitsFromStorage();
    setVisits(all);
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

  // Filter only visits with exceptions
  const exceptionVisits = useMemo(() => {
    return visits.filter(
      (v) =>
        v.verificationStatus === "Exception" ||
        v.verificationStatus === "Under Review" ||
        v.verificationStatus === "Correction Required" ||
        Boolean(v.exceptionReason)
    );
  }, [visits]);

  // Secondary filtering
  const filteredExceptions = useMemo(() => {
    return exceptionVisits.filter((v) => {
      if (selectedExceptionType !== "ALL" && v.exceptionType !== selectedExceptionType)
        return false;
      if (selectedReviewer !== "ALL" && v.assignedReviewer !== selectedReviewer) return false;
      if (selectedService !== "ALL" && v.serviceName !== selectedService) return false;
      if (selectedResolutionStatus !== "ALL") {
        if (selectedResolutionStatus === "Under Review" && v.verificationStatus !== "Under Review")
          return false;
        if (
          selectedResolutionStatus === "Correction Required" &&
          v.verificationStatus !== "Correction Required"
        )
          return false;
        if (selectedResolutionStatus === "Exception" && v.verificationStatus !== "Exception")
          return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = v.id.toLowerCase().includes(q);
        const matchesCaregiver = v.caregiverName.toLowerCase().includes(q);
        const matchesClient = v.clientName.toLowerCase().includes(q);
        const matchesReason = v.exceptionReason?.toLowerCase().includes(q);
        if (!matchesId && !matchesCaregiver && !matchesClient && !matchesReason) return false;
      }

      return true;
    });
  }, [
    exceptionVisits,
    selectedExceptionType,
    selectedReviewer,
    selectedService,
    selectedResolutionStatus,
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

  const handleBulkAssign = (reviewerName: string) => {
    if (selectedIds.length === 0) return;
    const count = bulkAssignReviewer(selectedIds, reviewerName);
    toast.success("Reviewer Assigned", {
      description: `Assigned ${count} exceptions to ${reviewerName}.`,
    });
    setSelectedIds([]);
    loadData();
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            EVV Exceptions Queue
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/evv-visits"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs"
          >
            <span>Back to All Visits</span>
          </Link>
        </div>
      </div>

      {/* Sub Navigation */}
      <EvvSubNav exceptionCount={exceptionVisits.length} />

      {/* Queue Filters */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Visit ID, Caregiver, Client, Reason..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>

          {/* Exception Type */}
          <div>
            <select
              value={selectedExceptionType}
              onChange={(e) => setSelectedExceptionType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="ALL">Issue: All Types</option>
              <option value="MISSING_CLOCK_IN_OUT">Missing Clock-in / Out</option>
              <option value="LOCATION_VERIFICATION">Location Deviation</option>
              <option value="MISSING_VISIT_INFO">Missing Client Verification</option>
              <option value="DURATION_MISMATCH">Duration Mismatch</option>
              <option value="AGGREGATOR_REJECTED">Aggregator Rejection</option>
            </select>
          </div>

          {/* Assigned Reviewer */}
          <div>
            <select
              value={selectedReviewer}
              onChange={(e) => setSelectedReviewer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="ALL">Reviewer: All Assigned</option>
              {EVV_REVIEWERS.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Resolution Status */}
          <div>
            <select
              value={selectedResolutionStatus}
              onChange={(e) => setSelectedResolutionStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="ALL">Status: All Exceptions</option>
              <option value="Exception">Exception (Unassigned)</option>
              <option value="Under Review">Under Review</option>
              <option value="Correction Required">Correction Required</option>
            </select>
          </div>
        </div>

        {/* Selected Bulk Assignment Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-white text-xs">
            <span className="font-semibold">
              {selectedIds.length} exceptions selected for bulk assignment:
            </span>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkAssign(e.target.value);
                }}
                className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1 text-xs"
                defaultValue=""
              >
                <option value="" disabled>
                  Assign to Reviewer...
                </option>
                {EVV_REVIEWERS.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.role})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white px-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exception Queue Table */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-20">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredExceptions.length > 0 &&
                      filteredExceptions.every((v) => selectedIds.includes(v.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-[#3e6b2b] h-3.5 w-3.5 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap">Visit ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Caregiver</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Client</th>
                <th className="py-3 px-3.5">Exception Issue</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Assigned Reviewer</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Resolution Status</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredExceptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">No Open Exceptions in Queue</p>
                    <p className="text-xs text-slate-500 mt-1">
                      All visits match tolerance rules or have been resolved.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExceptions.map((visit) => {
                  const isSelected = selectedIds.includes(visit.id);
                  return (
                    <tr
                      key={visit.id}
                      onClick={() => router.push(`/admin/evv-visits/exceptions/${visit.id}/`)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? "bg-[#3e6b2b]/5" : ""
                        }`}
                    >
                      <td
                        className="py-3 px-3.5 text-center"
                        onClick={(e) => handleToggleRow(visit.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => { }}
                          className="rounded text-[#3e6b2b] h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-slate-900 group-hover:text-[#3e6b2b]">
                        {visit.id}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-900">
                        {visit.caregiverName}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-900">
                        {visit.clientName}
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5 text-amber-900 font-medium text-xs truncate max-w-sm" title={visit.exceptionReason || visit.exceptionTitle || "Exception"}>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{visit.exceptionReason || visit.exceptionTitle || "Exception"}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {visit.assignedReviewer ? (
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            {visit.assignedReviewer}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${visit.verificationStatus === "Under Review"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : visit.verificationStatus === "Correction Required"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                        >
                          {visit.verificationStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div
                          className="inline-flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={`/admin/evv-visits/exceptions/${visit.id}/`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#3e6b2b] hover:bg-[#345c1d] text-white font-semibold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </Link>
                          <Link
                            href={`/admin/evv-visits/exceptions/${visit.id}/`}
                            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Open full exception investigation"
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
      </div>
    </div>
  );
}
