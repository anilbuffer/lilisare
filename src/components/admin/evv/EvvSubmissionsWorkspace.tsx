"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Send,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  FileCode,
  X,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { EvvSubmissionRecord, EvvAggregatorStatus } from "@/types/evvVisit";
import {
  getEvvSubmissionsFromStorage,
  retryEvvSubmission,
  EVV_SYNC_EVENT,
} from "@/lib/admin/evvVisitsStore";
import { EvvSubNav } from "./EvvSubNav";

export function EvvSubmissionsWorkspace() {
  const [submissions, setSubmissions] = useState<EvvSubmissionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeSubmission, setActiveSubmission] = useState<EvvSubmissionRecord | null>(null);
  const [isRetryingId, setIsRetryingId] = useState<string | null>(null);

  const loadSubmissions = () => {
    setSubmissions(getEvvSubmissionsFromStorage());
  };

  useEffect(() => {
    loadSubmissions();
    if (typeof window !== "undefined") {
      window.addEventListener(EVV_SYNC_EVENT, loadSubmissions);
      window.addEventListener("storage", loadSubmissions);
      return () => {
        window.removeEventListener(EVV_SYNC_EVENT, loadSubmissions);
        window.removeEventListener("storage", loadSubmissions);
      };
    }
  }, []);

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: submissions.length,
      accepted: submissions.filter((s) => s.status === "Accepted").length,
      submitted: submissions.filter((s) => s.status === "Submitted").length,
      queued: submissions.filter((s) => s.status === "Queued").length,
      rejected: submissions.filter((s) => s.status === "Rejected").length,
      ackPending: submissions.filter((s) => s.status === "Acknowledgement Pending").length,
      retryRequired: submissions.filter((s) => s.status === "Retry Required").length,
    };
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      if (selectedStatus !== "ALL" && s.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSubId = s.id.toLowerCase().includes(q);
        const matchesVisitId = s.visitId.toLowerCase().includes(q);
        const matchesClient = s.clientName.toLowerCase().includes(q);
        const matchesCaregiver = s.caregiverName.toLowerCase().includes(q);
        const matchesReason = s.responseReason?.toLowerCase().includes(q);
        if (!matchesSubId && !matchesVisitId && !matchesClient && !matchesCaregiver && !matchesReason) {
          return false;
        }
      }
      return true;
    });
  }, [submissions, selectedStatus, searchQuery]);

  const handleRetry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetryingId(id);
    setTimeout(() => {
      const ok = retryEvvSubmission(id);
      setIsRetryingId(null);
      if (ok) {
        toast.success("Submission Re-queued", {
          description: `Transmission ${id} scheduled for state aggregator ingestion retry.`,
        });
        loadSubmissions();
      } else {
        toast.error("Retry failed");
      }
    }, 450);
  };

  const renderStatusBadge = (status: EvvAggregatorStatus) => {
    switch (status) {
      case "Accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      case "Retry Required":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <RotateCcw className="w-3 h-3 text-amber-600" />
            Retry Required
          </span>
        );
      case "Acknowledgement Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" />
            Ack Pending
          </span>
        );
      case "Submitted":
      case "Queued":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3 h-3 text-blue-600" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            EVV Aggregator Submissions
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
      <EvvSubNav rejectedCount={metrics.rejected} />

      {/* Neutral Provider Status Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl lg:rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Target Interface: EVV Aggregator</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Sandbox / Staging Engine
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Protocol: REST/JSON EDI 837P • State aggregator integration readiness mode (Colorado EVV architecture)
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-500  self-start sm:self-auto bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Gateway Ping: 200 OK • Rate Limit: 1,200 req/min
        </div>
      </div>

      {/* Compact Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: "Queued", count: metrics.queued, color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Submitted", count: metrics.submitted, color: "text-purple-700 bg-purple-50 border-purple-200" },
          { label: "Accepted", count: metrics.accepted, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "Rejected", count: metrics.rejected, color: "text-rose-700 bg-rose-50 border-rose-200" },
          { label: "Ack Pending", count: metrics.ackPending, color: "text-amber-800 bg-amber-50 border-amber-200" },
          { label: "Retry Required", count: metrics.retryRequired, color: "text-orange-800 bg-orange-50 border-orange-200" },
        ].map((m, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl lg:rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs"
          >
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              {m.label}
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {m.count}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.color}`}>
                {m.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Submission ID, Visit ID, Caregiver, Client, Error code..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Submitted">Submitted</option>
              <option value="Queued">Queued</option>
              <option value="Retry Required">Retry Required</option>
              <option value="Acknowledgement Pending">Ack Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-20">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Submission ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Visit ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Caregiver</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Client</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Aggregator Status</th>
                <th className="py-3 px-3.5">Response / Error Reason</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <p className="font-bold text-slate-800 text-sm">No submissions match filter</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isEligibleRetry =
                    sub.status === "Rejected" || sub.status === "Retry Required";

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setActiveSubmission(sub)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-slate-900 group-hover:text-[#3e6b2b]">
                        {sub.id}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-semibold text-slate-700">
                        <Link
                          href={`/admin/evv-visits/${sub.visitId}/`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline text-[#3e6b2b]"
                        >
                          {sub.visitId}
                        </Link>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-900">
                        {sub.caregiverName}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-900">
                        {sub.clientName}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {renderStatusBadge(sub.status)}
                      </td>

                      <td className="py-3 px-3.5">
                        <p className="text-xs font-medium text-slate-700 truncate max-w-sm" title={sub.responseReason || "Awaiting aggregator response packet"}>
                          {sub.responseReason || "Awaiting aggregator response packet"}
                        </p>
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div
                          className="inline-flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isEligibleRetry && (
                            <button
                              type="button"
                              onClick={(e) => handleRetry(sub.id, e)}
                              disabled={isRetryingId === sub.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3e6b2b] hover:bg-[#345c1d] text-white font-semibold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
                            >
                              <RotateCcw
                                className={`w-3.5 h-3.5 ${isRetryingId === sub.id ? "animate-spin" : ""
                                  }`}
                              />
                              <span>Retry</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setActiveSubmission(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
                          >
                            <span>Payload</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
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

      {/* Submission Detail & Payload Modal */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#3e6b2b]" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Transmission Detail: {activeSubmission.id}
                  </h3>
                  <p className="text-[11px] text-slate-500 ">
                    Visit: {activeSubmission.visitId} • Gateway: {activeSubmission.providerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubmission(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-600">Transmission Status:</span>
                <div>{renderStatusBadge(activeSubmission.status)}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Aggregator Response Code &amp; Reason:</span>
                <p className=" text-slate-800 text-xs">
                  {activeSubmission.responseCode}: {activeSubmission.responseReason}
                </p>
                <div className="pt-2 text-[11px] text-slate-400 flex justify-between border-t border-slate-200/60">
                  <span>Reconciliation: <strong>{activeSubmission.reconciliationStatus}</strong></span>
                  <span>Next State: {activeSubmission.nextRetryState}</span>
                </div>
              </div>

              {activeSubmission.payloadSummary && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    Normalized Ingestion Payload Summary (JSON):
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 text-[11px]  overflow-x-auto max-h-48 border border-slate-800">
                    {JSON.stringify(activeSubmission.payloadSummary, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Link
                href={`/admin/evv-visits/${activeSubmission.visitId}/`}
                className="text-xs font-bold text-[#3e6b2b] hover:underline inline-flex items-center gap-1"
              >
                <span>Investigate Visit {activeSubmission.visitId}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setActiveSubmission(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
