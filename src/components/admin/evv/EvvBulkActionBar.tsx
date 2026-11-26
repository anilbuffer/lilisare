"use client";

import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  FileText,
  Download,
  RotateCcw,
  Clock,
  X,
  AlertTriangle,
  Info,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { EvvVisitRecord } from "@/types/evvVisit";
import {
  EVV_REVIEWERS,
  bulkAssignReviewer,
  bulkResolveVariances,
  exportEvvVisitsCsv,
} from "@/lib/admin/evvVisitsStore";

interface EvvBulkActionBarProps {
  selectedIds: string[];
  allVisits: EvvVisitRecord[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

export function EvvBulkActionBar({
  selectedIds,
  allVisits,
  onClearSelection,
  onActionComplete,
}: EvvBulkActionBarProps) {
  const [modalAction, setModalAction] = useState<
    "ASSIGN" | "APPROVE_VARIANCE" | "REQUEST_CORRECTION" | null
  >(null);
  const [selectedReviewer, setSelectedReviewer] = useState(EVV_REVIEWERS[0].name);
  const [actionNotes, setActionNotes] = useState("");
  const [skippedList, setSkippedList] = useState<string[]>([]);
  const [showSkippedModal, setShowSkippedModal] = useState(false);

  if (selectedIds.length === 0) return null;

  const selectedVisits = allVisits.filter((v) => selectedIds.includes(v.id));

  // Determine eligibility for variance approval
  const ineligibleForVariance = selectedVisits.filter(
    (v) =>
      v.exceptionType === "MISSING_CLOCK_IN_OUT" ||
      v.exceptionType === "LOCATION_VERIFICATION" ||
      v.visitStatus !== "Completed"
  );
  const eligibleForVariance = selectedVisits.filter(
    (v) =>
      v.exceptionType !== "MISSING_CLOCK_IN_OUT" &&
      v.exceptionType !== "LOCATION_VERIFICATION" &&
      v.visitStatus === "Completed"
  );

  const handleExportSelected = () => {
    exportEvvVisitsCsv(selectedVisits);
    toast.success("Exported selected records", {
      description: `Downloaded ${selectedVisits.length} selected EVV records to CSV.`,
    });
  };

  const handleConfirmAction = () => {
    if (modalAction === "ASSIGN") {
      const count = bulkAssignReviewer(selectedIds, selectedReviewer);
      toast.success("Reviewer Assigned", {
        description: `Assigned ${count} visits to ${selectedReviewer}.`,
      });
      setModalAction(null);
      onClearSelection();
      onActionComplete();
    } else if (modalAction === "APPROVE_VARIANCE") {
      const result = bulkResolveVariances(
        selectedIds,
        selectedReviewer,
        actionNotes || "Bulk approved minor variance per agency tolerance policy."
      );
      if (result.skipped.length > 0) {
        setSkippedList(result.skipped);
        setShowSkippedModal(true);
        toast.warning("Bulk Variance Processed with Exceptions", {
          description: `Approved ${result.processed} visits. ${result.skipped.length} records were skipped due to missing clock or location criteria.`,
        });
      } else {
        toast.success("Bulk Variance Approved", {
          description: `Successfully verified and approved ${result.processed} eligible visits.`,
        });
      }
      setModalAction(null);
      onClearSelection();
      onActionComplete();
    }
  };

  return (
    <>
      {/* Sticky Bottom Floating Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl px-4 sm:px-5 py-3 shadow-2xl border border-slate-700/80 flex items-center gap-3 sm:gap-4 max-w-4xl w-[94vw] sm:w-auto animate-slide-up">
        <div className="flex items-center gap-2 border-r border-slate-700 pr-3 sm:pr-4">
          <span className="w-6 h-6 rounded-full bg-[#3e6b2b] text-white text-xs font-bold flex items-center justify-center">
            {selectedIds.length}
          </span>
          <span className="text-xs font-semibold whitespace-nowrap hidden sm:inline">
            selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            title="Deselect all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
          {/* Assign Reviewer */}
          <button
            type="button"
            onClick={() => setModalAction("ASSIGN")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Assign Reviewer</span>
          </button>

          {/* Approve Minor Variance */}
          <button
            type="button"
            onClick={() => setModalAction("APPROVE_VARIANCE")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approve Variance</span>
          </button>

          {/* Export Selected */}
          <button
            type="button"
            onClick={handleExportSelected}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3e6b2b]/10 text-[#3e6b2b] flex items-center justify-center font-bold">
                  {modalAction === "ASSIGN" ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {modalAction === "ASSIGN"
                      ? "Bulk Assign Reviewer"
                      : "Bulk Approve Minor Variance"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Applying to {selectedIds.length} selected EVV records
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAction(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {modalAction === "ASSIGN" ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Select Assigned Reviewer
                  </label>
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3e6b2b]/20 focus:border-[#3e6b2b]"
                  >
                    {EVV_REVIEWERS.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {/* Eligibility Summary */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600">Eligible Records:</span>
                    <span className="text-emerald-700 font-bold">
                      {eligibleForVariance.length} records
                    </span>
                  </div>
                  {ineligibleForVariance.length > 0 && (
                    <div className="flex justify-between font-semibold text-rose-700">
                      <span>Ineligible (Skipped by policy):</span>
                      <span className="font-bold">{ineligibleForVariance.length} records</span>
                    </div>
                  )}
                </div>

                {ineligibleForVariance.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Safeguard:</strong> Missing clock events and location deviations outside
                      geofence cannot be auto-approved in bulk and will be safely preserved for individual
                      evidence review.
                    </p>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Audit Notes / Justification</label>
                  <textarea
                    rows={2}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Approved minor variance within applicable payer tolerance window..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="px-4 py-2 text-xs font-bold text-white bg-[#3e6b2b] hover:bg-[#345c1d] rounded-xl shadow-md shadow-[#3e6b2b]/20"
              >
                Confirm Bulk Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skipped Items Inspection Modal */}
      {showSkippedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Skipped Records Inspection
              </h3>
              <button
                onClick={() => setShowSkippedModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              The following {skippedList.length} records were protected and skipped from bulk variance
              approval because they require dedicated telemetry investigation:
            </p>
            <div className="max-h-56 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
              {skippedList.map((item, idx) => (
                <div key={idx} className="p-2 rounded bg-white border border-slate-100 text-xs font-mono text-slate-700">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowSkippedModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#3e6b2b] rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
