"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  EyeOff,
  Send,
  TrendingUp,
  Award,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  RecommendedOpenVisit,
  WeeklyHoursSummary,
  CaregiverShiftRequest,
} from "@/lib/caregiver/caregiverSync";
import { Modal } from "@/components/ui/Modal";
import { FormButtonPrimary, FormButtonCancel } from "@/components/ui/FormControls";

interface RecommendedOpenVisitsPanelProps {
  openVisits: RecommendedOpenVisit[];
  weeklyHours: WeeklyHoursSummary;
  shiftRequests: CaregiverShiftRequest[];
  onRequestVisit: (visit: RecommendedOpenVisit) => void;
  onDeclineOrHideVisit: (visitId: string, action: "Decline" | "Hide") => void;
}

export function RecommendedOpenVisitsPanel({
  openVisits,
  weeklyHours,
  shiftRequests,
  onRequestVisit,
  onDeclineOrHideVisit,
}: RecommendedOpenVisitsPanelProps) {
  const [selectedOpenVisit, setSelectedOpenVisit] = useState<RecommendedOpenVisit | null>(null);

  const pendingCount = shiftRequests.filter((r) => r.status === "Pending Agency Review").length;
  const approvedRequests = shiftRequests.filter((r) => r.status === "Approved & Published");

  const getProjectedHours = (addHours: number) => {
    const newTotal = Math.round((weeklyHours.currentHours + addHours) * 10) / 10;
    const newPct = Math.min(100, Math.round((newTotal / weeklyHours.goalHours) * 1000) / 10);
    return { newTotal, newPct };
  };

  return (
    <div className="space-y-4">
      {/* Recommended Open Visits Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E3F1D9] text-[#1E5622] border border-[#C7E4B3]">
                <Sparkles className="w-3 h-3" />
                Recommended Open Visits
              </span>
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {pendingCount} Pending Agency Review
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1.5">
              Open Shifts Matched to Your LiliSare Credentials
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {openVisits.length} open {openVisits.length === 1 ? "visit" : "visits"} available
          </span>
        </div>

        {/* Approved & Published Notification Banner */}
        {approvedRequests.length > 0 && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#3D6B22] shrink-0" />
              <span>
                Assignment Published: <strong>{approvedRequests[0].clientName}</strong> ({approvedRequests[0].date} · {approvedRequests[0].hours}h) approved by Agency Scheduler!
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white text-[#1E5622] border border-emerald-200 text-[10px] font-bold shrink-0">
              Synced to Schedule
            </span>
          </div>
        )}

        {openVisits.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center">
            No open visits matching your zone right now. Check back soon or update your availability.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {openVisits.slice(0, 4).map((ov, idx) => {
              const projected = getProjectedHours(ov.hours);
              const isRequested = ov.requestStatus === "Pending Agency Review";
              const isApproved = ov.requestStatus === "Approved & Published";
              const isDeclined = ov.requestStatus === "Declined by Agency";

              return (
                <div
                  key={ov.visitId}
                  onClick={() => setSelectedOpenVisit(ov)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    idx === 0 && !ov.requestStatus
                      ? "border-[#3D6B22]/40 bg-[#F2F8EE]/50 hover:bg-[#F2F8EE]"
                      : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ov.matchLabel === "Great Match"
                            ? "bg-[#3D6B22] text-white"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        {ov.matchLabel} · {ov.matchScore}%
                      </span>
                      <span className="text-[11px] font-bold text-[#3D6B22]">
                        ${ov.payRate.toFixed(2)}/hr · {ov.hours}h
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {ov.clientName}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                        {ov.shiftNumber}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-600">
                      {ov.serviceName} ({ov.serviceCode})
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        {ov.dateLabel} · {ov.timeWindow}
                      </span>
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#3D6B22]" />
                        {ov.distanceMiles} mi away
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-600 font-medium">
                      Gets you to <strong className="text-[#3D6B22]">{projected.newPct}%</strong> of goal
                    </span>
                    {isRequested ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        Pending Agency Review
                      </span>
                    ) : isApproved ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Approved &amp; Published
                      </span>
                    ) : isDeclined ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                        Declined
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-[#3D6B22]">
                        Review &amp; Request <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preferred Weekly Hours Tracker */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Preferred Weekly Hours</h3>
              <p className="text-[11px] text-slate-500">
                Self-manage your weekly availability goal &amp; reduce scheduler coordination
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-[#3D6B22]">
              {Math.round(weeklyHours.currentPercent)}%
            </span>
            <p className="text-[11px] font-semibold text-slate-500">
              {weeklyHours.currentHours} / {weeklyHours.goalHours} hrs
            </p>
          </div>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <div
            className="h-full bg-[#3D6B22] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, weeklyHours.currentPercent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {weeklyHours.pendingRequestHours > 0
              ? `${weeklyHours.pendingRequestHours}h pending agency approval`
              : "Tap any Recommended Open Visit above to see how it boosts your weekly goal."}
          </span>
          <span className="font-semibold text-slate-700">
            Goal: {weeklyHours.goalHours} hrs/wk
          </span>
        </div>
      </div>

      {/* Open Visit Detail & Request/Decline/Hide Modal */}
      <Modal
        isOpen={Boolean(selectedOpenVisit)}
        onClose={() => setSelectedOpenVisit(null)}
        title={selectedOpenVisit ? `Open Visit: ${selectedOpenVisit.clientName}` : "Open Visit"}
        description={
          selectedOpenVisit
            ? `${selectedOpenVisit.dateLabel} · ${selectedOpenVisit.timeWindow} (${selectedOpenVisit.hours} hrs)`
            : undefined
        }
        icon={<Sparkles className="w-5 h-5" />}
        maxWidth="lg"
        footer={
          selectedOpenVisit ? (
            <div className="w-full flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FormButtonCancel
                  onClick={() => {
                    onDeclineOrHideVisit(selectedOpenVisit.visitId, "Hide");
                    setSelectedOpenVisit(null);
                  }}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Hide
                </FormButtonCancel>
                <button
                  type="button"
                  onClick={() => {
                    onDeclineOrHideVisit(selectedOpenVisit.visitId, "Decline");
                    setSelectedOpenVisit(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Decline
                </button>
              </div>
              <FormButtonPrimary
                disabled={Boolean(selectedOpenVisit.requestStatus)}
                onClick={() => {
                  onRequestVisit(selectedOpenVisit);
                  setSelectedOpenVisit(null);
                }}
              >
                <Send className="w-3.5 h-3.5" />
                {selectedOpenVisit.requestStatus
                  ? selectedOpenVisit.requestStatus
                  : "Request Open Visit"}
              </FormButtonPrimary>
            </div>
          ) : null
        }
      >
        {selectedOpenVisit && (
          <div className="space-y-4 text-xs">
            {/* Hours Impact Highlight */}
            <div className="p-3.5 rounded-xl bg-[#F2F8EE] border border-[#C7E4B3] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1E5622] uppercase tracking-wider text-[10px]">
                  Preferred Weekly Hours Impact
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#3D6B22] text-white text-[10px] font-bold">
                  {selectedOpenVisit.matchLabel} ({selectedOpenVisit.matchScore}%)
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                This visit gets you to{" "}
                <span className="text-[#3D6B22]">
                  {getProjectedHours(selectedOpenVisit.hours).newPct}%
                </span>{" "}
                of your {weeklyHours.goalHours}-hour goal (
                {getProjectedHours(selectedOpenVisit.hours).newTotal} / {weeklyHours.goalHours} hrs).
              </p>
            </div>

            {/* Client & Location Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {selectedOpenVisit.clientName}
                </span>
                <span className="text-slate-500 font-semibold">
                  {selectedOpenVisit.householdName}
                </span>
              </div>
              <p className="text-slate-600 font-medium">
                Service: <strong>{selectedOpenVisit.serviceName}</strong> ({selectedOpenVisit.serviceCode}) · ${selectedOpenVisit.payRate.toFixed(2)}/hr
              </p>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#3D6B22]" />
                  {selectedOpenVisit.address}
                </span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(selectedOpenVisit.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#3D6B22] font-bold hover:underline shrink-0"
                >
                  Open in Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                {selectedOpenVisit.memo}
              </p>
            </div>

            {/* Workflow Status Pipeline */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Coverage Workflow
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="px-2 py-1 rounded-lg bg-[#E3F1D9] text-[#1E5622]">1. Open Visit</span>
                <span>→</span>
                <span className={`px-2 py-1 rounded-lg ${selectedOpenVisit.requestStatus ? "bg-[#E3F1D9] text-[#1E5622]" : "bg-slate-100"}`}>
                  2. Caregiver Requests
                </span>
                <span>→</span>
                <span className={`px-2 py-1 rounded-lg ${selectedOpenVisit.requestStatus === "Pending Agency Review" ? "bg-amber-100 text-amber-800" : selectedOpenVisit.requestStatus === "Approved & Published" ? "bg-[#E3F1D9] text-[#1E5622]" : "bg-slate-100"}`}>
                  3. Agency Reviews
                </span>
                <span>→</span>
                <span className={`px-2 py-1 rounded-lg ${selectedOpenVisit.requestStatus === "Approved & Published" ? "bg-[#E3F1D9] text-[#1E5622]" : "bg-slate-100"}`}>
                  4. Assignment Published
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
