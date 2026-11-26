"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  FileCheck2,
  ShieldCheck,
  Send,
  User,
  ExternalLink,
  ChevronRight,
  Info,
  Smartphone,
  PhoneCall,
  Lock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { EvvVisitRecord } from "@/types/evvVisit";
import {
  EVV_REASON_CODES,
  EVV_RESOLUTION_CODES,
  EVV_REVIEWERS,
  resolveEvvException,
  approveMinorVariance,
  requestCaregiverCorrection,
  addEvvReviewNote,
} from "@/lib/admin/evvVisitsStore";

interface EvvQuickReviewDrawerProps {
  visit: EvvVisitRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EvvQuickReviewDrawer({
  visit,
  isOpen,
  onClose,
  onUpdated,
}: EvvQuickReviewDrawerProps) {
  const [selectedReasonCode, setSelectedReasonCode] = useState("");
  const [selectedResolutionCode, setSelectedResolutionCode] = useState("");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [selectedReviewer, setSelectedReviewer] = useState("Dana Jenkins, MSW");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionTab, setActionTab] = useState<"RESOLVE" | "CORRECTION" | "REVIEW">("RESOLVE");

  if (!isOpen || !visit) return null;

  const isMissingClockEvent =
    visit.exceptionType === "MISSING_CLOCK_IN_OUT" ||
    !visit.actualClockInTime ||
    !visit.actualClockOutTime;

  const isLocationIssue =
    visit.exceptionType === "LOCATION_VERIFICATION" ||
    visit.locationVerificationStatus === "Outside Geofence";

  const handleResolve = () => {
    if (!selectedReasonCode) {
      toast.error("Reason code required", {
        description: "Please select an applicable exception reason code before resolving.",
      });
      return;
    }
    if (!selectedResolutionCode) {
      toast.error("Resolution code required", {
        description: "Please select an approved resolution code.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      resolveEvvException(
        visit.id,
        selectedReasonCode,
        selectedResolutionCode,
        reviewerNotes,
        selectedReviewer
      );
      setIsSubmitting(false);
      toast.success("Exception Resolved & Verified", {
        description: `Visit ${visit.id} has been audited and updated to Verified.`,
      });
      onUpdated();
      onClose();
    }, 400);
  };

  const handleApproveVariance = () => {
    if (isMissingClockEvent) {
      toast.error("Cannot auto-approve missing clock event", {
        description: "Missing clock-in or clock-out requires authorized caregiver timesheet correction.",
      });
      return;
    }
    if (isLocationIssue) {
      toast.error("Cannot auto-approve geofence violation", {
        description: "Location discrepancies outside 250ft require supervisor evidence documentation.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      approveMinorVariance(visit.id, selectedReviewer, reviewerNotes || "Minor variance within payer tolerance approved.");
      setIsSubmitting(false);
      toast.success("Variance Approved", {
        description: `Visit ${visit.id} variance marked as verified within policy tolerance.`,
      });
      onUpdated();
      onClose();
    }, 350);
  };

  const handleRequestCorrection = () => {
    if (!reviewerNotes.trim()) {
      toast.error("Notes required", {
        description: "Please provide specific correction instructions for the caregiver.",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      requestCaregiverCorrection(visit.id, selectedReviewer, reviewerNotes);
      setIsSubmitting(false);
      toast.success("Correction Requested", {
        description: `Correction request sent to caregiver ${visit.caregiverName}.`,
      });
      onUpdated();
      onClose();
    }, 350);
  };

  const handleMarkUnderReview = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      addEvvReviewNote(
        visit.id,
        selectedReviewer,
        "Operations Reviewer",
        reviewerNotes || "Marked for in-depth operational and authorization review.",
        "INVESTIGATION_STARTED"
      );
      setIsSubmitting(false);
      toast.info("Status Updated to Under Review", {
        description: `Visit ${visit.id} queued for investigation.`,
      });
      onUpdated();
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 overflow-hidden animate-slide-left">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3e6b2b]/10 border border-[#3e6b2b]/20 flex items-center justify-center text-[#3e6b2b]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900">{visit.id}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Shift {visit.visitNumber}
                </span>
                <span className="text-xs text-slate-400">• {visit.date}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                Quick Exception Resolution
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Exception Banner */}
          {visit.exceptionReason && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block">Flagged Issue:</span>
                  <p className="font-medium text-amber-800 mt-0.5">{visit.exceptionReason}</p>
                  {visit.exceptionDescription && (
                    <p className="text-[11px] text-amber-700 mt-1">{visit.exceptionDescription}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Participant & Service Context */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Caregiver
              </span>
              <p className="font-bold text-slate-800 text-sm truncate">{visit.caregiverName}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{visit.caregiverId} • {visit.caregiverRole}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Client / Recipient
              </span>
              <p className="font-bold text-slate-800 text-sm truncate">{visit.clientName}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{visit.clientMedicaidId}</p>
            </div>
          </div>

          {/* Times & Variance Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-700">Service: {visit.serviceName}</span>
              <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                {visit.serviceCode}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Scheduled</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {visit.scheduledStartTime} – {visit.scheduledEndTime}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">({visit.scheduledDurationHours}h)</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Actual EVV</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {visit.actualClockInTime || "--:--"} – {visit.actualClockOutTime || "--:--"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({visit.actualDurationHours ? `${visit.actualDurationHours}h` : "In Progress"})
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Variance</span>
                <span className="font-bold text-xs mt-0.5 block text-slate-800">
                  {visit.varianceDisplay || "0m"}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                    visit.varianceStatus === "Within Tolerance"
                      ? "bg-emerald-100 text-emerald-800"
                      : visit.varianceStatus === "Outside Tolerance"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {visit.varianceStatus || "Evaluated"}
                </span>
              </div>
            </div>
          </div>

          {/* Captured Evidence Section */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 text-xs flex items-center justify-between">
              <span>Captured Verification Evidence</span>
              <span className="text-[10px] text-slate-400 font-normal">Method: {visit.captureMethod}</span>
            </h3>

            {/* Location telemetry */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Location Verification
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    visit.locationVerificationStatus === "Verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : visit.locationVerificationStatus === "Outside Geofence"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {visit.locationVerificationStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate">
                Approved: {visit.clientAddress}
              </p>
              {visit.clockInLocation?.distanceFeet !== undefined ? (
                <p className="text-[11px] font-mono text-slate-500">
                  Distance: {visit.clockInLocation.distanceFeet} ft from centroid (Geofence radius: {visit.geofenceRadiusFeet} ft)
                  {visit.clockInLocation.lat && ` • GPS: ${visit.clockInLocation.lat.toFixed(4)}, ${visit.clockInLocation.lng?.toFixed(4)}`}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Location data unavailable (Non-GPS telephony or fixed token method)</p>
              )}
            </div>

            {/* Patient verification */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                  Patient Verification Evidence
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Type: {visit.patientVerification?.signatureType || "None"} • Ref: {visit.patientVerification?.evidenceRef || "None recorded"}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  visit.patientVerification?.signatureCaptured === "Yes" || visit.patientVerification?.voiceVerificationCaptured === "Yes"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {visit.patientVerification?.signatureCaptured === "Yes" ? "Signed" : visit.patientVerification?.voiceVerificationCaptured === "Yes" ? "Voice Attested" : "Unverified"}
              </span>
            </div>
          </div>

          {/* Pending Corrections (if any) */}
          {visit.corrections && visit.corrections.length > 0 && (
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 text-xs space-y-2">
              <span className="font-bold text-blue-900 block">Caregiver Submitted Timesheet Correction:</span>
              {visit.corrections.map((c) => (
                <div key={c.id} className="p-2 rounded bg-white border border-blue-100 text-[11px] space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Field: {c.fieldChanged}</span>
                    <span className="text-blue-700 font-bold">{c.status}</span>
                  </div>
                  <div className="flex gap-4 text-slate-700">
                    <div>Original: <span className="font-mono text-slate-500">{c.originalValue}</span></div>
                    <div>Corrected: <span className="font-mono text-emerald-700 font-bold">{c.correctedValue}</span></div>
                  </div>
                  <p className="text-slate-600 italic">Reason: {c.reason}</p>
                </div>
              ))}
            </div>
          )}

          {/* Action Segmented Controls */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setActionTab("RESOLVE")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  actionTab === "RESOLVE"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Resolve Exception
              </button>
              <button
                type="button"
                onClick={() => setActionTab("CORRECTION")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  actionTab === "CORRECTION"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Request Correction
              </button>
              <button
                type="button"
                onClick={() => setActionTab("REVIEW")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  actionTab === "REVIEW"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Under Review
              </button>
            </div>

            {/* TAB: RESOLVE EXCEPTION */}
            {actionTab === "RESOLVE" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Exception Reason Code <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedReasonCode}
                    onChange={(e) => setSelectedReasonCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3e6b2b]/20 focus:border-[#3e6b2b]"
                  >
                    <option value="">-- Select standard reason code --</option>
                    {EVV_REASON_CODES.map((rc) => (
                      <option key={rc.code} value={rc.code}>
                        {rc.code} — {rc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Resolution Code <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedResolutionCode}
                    onChange={(e) => setSelectedResolutionCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3e6b2b]/20 focus:border-[#3e6b2b]"
                  >
                    <option value="">-- Select resolution code --</option>
                    {EVV_RESOLUTION_CODES.map((res) => (
                      <option key={res.code} value={res.code}>
                        {res.code} — {res.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Reviewer Notes & Justification
                  </label>
                  <textarea
                    rows={2}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Document audit notes, corroborated evidence, or supervisor sign-off..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3e6b2b]/20 focus:border-[#3e6b2b]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleApproveVariance}
                    disabled={isSubmitting || Boolean(isMissingClockEvent || isLocationIssue)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                    title={
                      isMissingClockEvent
                        ? "Missing clock events cannot be auto-approved."
                        : isLocationIssue
                        ? "Location issues require formal resolution."
                        : "Approve minor variance within policy."
                    }
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3e6b2b]" />
                    <span>Approve Minor Variance</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResolve}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3e6b2b] hover:bg-[#345c1d] text-white font-bold rounded-xl text-xs shadow-md shadow-[#3e6b2b]/20 transition-all cursor-pointer"
                  >
                    <span>Save & Mark Verified</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB: REQUEST CORRECTION */}
            {actionTab === "CORRECTION" && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Send a formal correction request to caregiver <span className="font-bold text-slate-900">{visit.caregiverName}</span>. This will place the visit in &ldquo;Correction Required&rdquo; status and block downstream billing.
                </p>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Correction Request Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Specify the missing event, clock discrepancy, or required paperwork..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3e6b2b]/20 focus:border-[#3e6b2b]"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleRequestCorrection}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Request to Caregiver</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: UNDER REVIEW */}
            {actionTab === "REVIEW" && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Escalate this visit for clinical supervisor or case manager review without resolving.
                </p>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reviewer Assignment</label>
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    {EVV_REVIEWERS.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} — {r.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Investigation Notes</label>
                  <textarea
                    rows={2}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="State reason for review escalation..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleMarkUnderReview}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mark Under Review</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <Link
            href={`/admin/evv-visits/${visit.id}/`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3e6b2b] hover:text-[#345c1d] transition-colors"
          >
            <span>Open Full Visit Investigation Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
