"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  UserCheck,
  Clock,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  History,
  MapPin,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  CallOutRecord,
  RealTimeVisit,
  CaregiverMatchScore,
} from "@/types/scheduling";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import {
  getCallOutsFromStorage,
  saveCallOutsToStorage,
  getVisitsFromStorage,
  getSyncedSchedulingContext,
  subscribeToSchedulingSync,
  getRecommendedCaregivers,
  assignReplacementCaregiver,
  createCallOutForVisit,
  formatCompactTime,
} from "@/lib/scheduling/schedulingStore";
import { Modal } from "@/components/ui/Modal";
import {
  FormLabel,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";

const CARD_CLASS =
  "bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200";

function computeTimeRemainingLabel(dateIso: string, startTime: string): {
  label: string;
  urgent: boolean;
} {
  // Reference clock aligned with active demo day 2026-11-27 10:15
  const ref = new Date("2026-11-27T10:15:00");
  const target = new Date(`${dateIso}T${startTime}:00`);
  const diffMins = Math.round((target.getTime() - ref.getTime()) / 60000);
  if (diffMins <= 0) {
    return { label: `${Math.abs(diffMins)}m past start`, urgent: true };
  }
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hrs < 4) {
    return { label: hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`, urgent: true };
  }
  if (hrs < 24) {
    return { label: `${hrs}h ${mins}m left`, urgent: false };
  }
  const days = Math.floor(hrs / 24);
  return { label: `${days}d ${hrs % 24}h left`, urgent: false };
}

export default function SchedulingCoveragePage() {
  const [callOuts, setCallOuts] = useState<CallOutRecord[]>([]);
  const [visits, setVisits] = useState<RealTimeVisit[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "unresolved" | "assigned">("all");
  const [selectedCallOutId, setSelectedCallOutId] = useState<string | null>(null);

  // Record Call-Out Modal
  const [isCallOutModalOpen, setIsCallOutModalOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState("");
  const [callOutReason, setCallOutReason] = useState("Sudden Illness / Medical");
  const [callOutNotes, setCallOutNotes] = useState("");

  useEffect(() => {
    const load = () => {
      setCallOuts(getCallOutsFromStorage());
      setVisits(getVisitsFromStorage());
      const ctx = getSyncedSchedulingContext();
      setClients(ctx.clients);
      setCaregivers(ctx.caregivers);
    };
    load();
    return subscribeToSchedulingSync(load);
  }, []);

  const filteredCallOuts = useMemo(() => {
    return callOuts.filter((c) => {
      if (statusFilter === "unresolved") return c.status === "Open" || c.status === "Candidates Reviewed";
      if (statusFilter === "assigned") return c.status === "Assigned" || c.status === "Resolved";
      return true;
    });
  }, [callOuts, statusFilter]);

  const activeCallOut = useMemo(() => {
    if (selectedCallOutId) {
      const found = filteredCallOuts.find((c) => c.id === selectedCallOutId);
      if (found) return found;
    }
    return filteredCallOuts[0] || null;
  }, [filteredCallOuts, selectedCallOutId]);

  const candidates: CaregiverMatchScore[] = useMemo(() => {
    if (!activeCallOut) return [];
    const linkedVisit = visits.find((v) => v.id === activeCallOut.visitId) || {
      id: activeCallOut.visitId,
      shiftNumber: activeCallOut.shiftNumber,
      date: activeCallOut.date,
      startTime: activeCallOut.startTime,
      endTime: activeCallOut.endTime,
      status: "Unassigned" as const,
      clientId: activeCallOut.clientId,
      clientName: activeCallOut.clientName,
      clientAdmin: "Dana Jenkins, MSW",
      clientClass: "Care",
      clientRegion: "Springfield",
      householdId: "hh-1001",
      householdName: activeCallOut.householdName,
      address: activeCallOut.address,
      caregiverId: null,
      caregiverName: null,
      serviceId: "svc-ces-waiver",
      serviceCode: "CES-WVR",
      serviceName: activeCallOut.serviceName,
      unitType: "Hourly",
      billRate: 34,
      payRate: 22.5,
      billableHours: 4,
      payableHours: 4,
      scheduledHours: 4,
      authorizationNumber: "AUTH-2026",
      authorizedWeeklyCap: 40,
      clockInLocation: "Client Residential Address" as const,
      clockOutLocation: "Same as clock in" as const,
      evvStatus: "Not Started" as const,
      careNoteStatus: "Pending" as const,
      requiredSkills: activeCallOut.requiredSkills,
      travelMinutes: 15,
      distanceMiles: 4,
      conflicts: [],
      memo: "",
      internalNotes: "",
      broadcasts: [],
      auditTrail: [],
    };
    return getRecommendedCaregivers(linkedVisit, caregivers, visits, clients).filter(
      (c) => c.caregiverId !== activeCallOut.originalCaregiverId
    );
  }, [activeCallOut, caregivers, visits, clients]);

  const unresolvedCount = callOuts.filter(
    (c) => c.status === "Open" || c.status === "Candidates Reviewed"
  ).length;
  const assignedCount = callOuts.filter(
    (c) => c.status === "Assigned" || c.status === "Resolved"
  ).length;
  const urgentCount = callOuts.filter((c) => {
    if (c.status === "Assigned" || c.status === "Resolved") return false;
    return computeTimeRemainingLabel(c.date, c.startTime).urgent;
  }).length;

  const eligibleVisitsForCallOut = useMemo(
    () =>
      visits.filter(
        (v) => !v.isRemoved && (v.status === "Scheduled" || v.status === "In-Progress") && v.caregiverId
      ),
    [visits]
  );

  const handleAssignReplacement = (callOutId: string, candidate: CaregiverMatchScore) => {
    const cg = caregivers.find((c) => c.id === candidate.caregiverId);
    if (!cg) return;
    assignReplacementCaregiver(callOutId, cg, "Dana Jenkins, MSW (Agency Scheduler)");
    toast.success(`Approved & assigned ${cg.name} to cover shift. Caregiver notified with instructions.`);
  };

  const handleMarkCandidatesReviewed = (callOutId: string) => {
    const next = callOuts.map((c) =>
      c.id === callOutId && c.status === "Open"
        ? {
            ...c,
            status: "Candidates Reviewed" as const,
            assignmentHistory: [
              {
                id: `coh-rev-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                actor: "Dana Jenkins, MSW",
                action: "Candidates Reviewed",
                details: "Scheduler reviewed eligible replacement candidates.",
              },
              ...c.assignmentHistory,
            ],
          }
        : c
    );
    saveCallOutsToStorage(next);
    toast.info("Marked candidates as reviewed.");
  };

  const handleRecordCallOut = (e: React.FormEvent) => {
    e.preventDefault();
    const v = visits.find((item) => item.id === selectedVisitId);
    if (!v) {
      toast.error("Select an affected visit.");
      return;
    }
    const created = createCallOutForVisit(
      v,
      "Agency Staff",
      callOutReason,
      callOutNotes,
      "Dana Jenkins, MSW"
    );
    setSelectedCallOutId(created.id);
    setIsCallOutModalOpen(false);
    setCallOutNotes("");
    toast.warning(`Visit ${v.shiftNumber} (${v.clientName}) flagged for replacement coverage.`);
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className={CARD_CLASS}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              href="/admin/scheduling"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3D6B22] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Real-Time Scheduling</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Open Shift Coverage &amp; Call-Outs
              </h1>
              {unresolvedCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                  {unresolvedCount} Unresolved Alert{unresolvedCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Review caregiver call-outs, screen eligible replacement candidates, and approve assignments. No shift is auto-assigned without agency approval.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/scheduling/insights"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>Hours &amp; OT Insights</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setSelectedVisitId(eligibleVisitsForCallOut[0]?.id || "");
                setIsCallOutModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#D93829] hover:bg-[#B91C1C] rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Call-Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={CARD_CLASS}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Unresolved Call-Outs</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{unresolvedCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Awaiting replacement approval</p>
        </div>
        <div className={CARD_CLASS}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Urgent (&lt;4h Remaining)</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{urgentCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Immediate dispatch priority</p>
        </div>
        <div className={CARD_CLASS}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Covered / Assigned</p>
          <p className="text-2xl font-extrabold text-[#3D6B22] mt-1">{assignedCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Replacement approved &amp; notified</p>
        </div>
        <div className={CARD_CLASS}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Eligible Pool</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {caregivers.filter((c) => c.status === "Active").length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Cleared caregivers on roster</p>
        </div>
      </div>

      {/* Main Split Workspace: Call-Out Queue (Left) + Replacement Candidates & History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Affected Visits &amp; Open Shifts
            </h2>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              {(["all", "unresolved", "assigned"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize cursor-pointer ${
                    statusFilter === tab
                      ? "bg-[#3D6B22] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredCallOuts.length === 0 ? (
            <div className={CARD_CLASS + " text-center py-10"}>
              <CheckCircle2 className="w-8 h-8 text-[#3D6B22] mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No call-outs in this filter</p>
              <p className="text-xs text-slate-500 mt-1">All affected shifts are covered.</p>
            </div>
          ) : (
            filteredCallOuts.map((co) => {
              const isSelected = activeCallOut?.id === co.id;
              const remaining = computeTimeRemainingLabel(co.date, co.startTime);
              const isResolved = co.status === "Assigned" || co.status === "Resolved";

              return (
                <button
                  key={co.id}
                  type="button"
                  onClick={() => setSelectedCallOutId(co.id)}
                  className={`w-full text-left rounded-xl lg:rounded-2xl p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#3D6B22] ring-2 ring-[#3D6B22]/20 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">
                          {co.clientName}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {co.shiftNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{co.serviceName}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        isResolved
                          ? "bg-[#E3F1D9] text-[#1E5622] border-[#93C573]"
                          : remaining.urgent
                            ? "bg-rose-100 text-rose-800 border-rose-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {isResolved ? co.status : remaining.label}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {co.date} · {formatCompactTime(co.startTime)}–{formatCompactTime(co.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                      <span className="truncate">Orig: {co.originalCaregiverName}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-rose-700 truncate">
                      Reason: {co.reason}
                    </span>
                    <span className="font-bold text-slate-500 shrink-0">{co.status}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Detail: Replacement Candidates & Assignment History */}
        <div className="lg:col-span-7 space-y-5">
          {activeCallOut ? (
            <>
              <div className={CARD_CLASS + " space-y-4"}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {activeCallOut.id}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">
                        {activeCallOut.clientName} — {activeCallOut.shiftNumber}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeCallOut.address}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeCallOut.status === "Open" && (
                      <button
                        type="button"
                        onClick={() => handleMarkCandidatesReviewed(activeCallOut.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    <Link
                      href={`/admin/scheduling/${activeCallOut.visitId}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#3D6B22] bg-[#F2F8EE] border border-[#C7E4B3] hover:bg-[#E3F1D9]"
                    >
                      Open Visit Profile
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                    <span className="text-[10px] font-bold uppercase text-rose-700">Original Caregiver</span>
                    <p className="font-bold text-slate-900 mt-0.5">{activeCallOut.originalCaregiverName}</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">{activeCallOut.reason}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Reported By</span>
                    <p className="font-bold text-slate-900 mt-0.5">{activeCallOut.reportedBy}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{activeCallOut.reportedAt}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F2F8EE] border border-[#C7E4B3]">
                    <span className="text-[10px] font-bold uppercase text-[#1E5622]">Replacement Status</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {activeCallOut.replacementCaregiverName || "Pending Agency Approval"}
                    </p>
                    <p className="text-[11px] text-[#3D6B22] mt-0.5">{activeCallOut.status}</p>
                  </div>
                </div>

                {activeCallOut.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800">Call-out note:</span> {activeCallOut.notes}
                  </p>
                )}

                {/* Eligible Replacement Candidates */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#3D6B22]" />
                      <span>Eligible Replacement Candidates ({candidates.length})</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Ranked by availability, skills, distance &amp; weekly hours
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {candidates.slice(0, 6).map((cand) => (
                      <div
                        key={cand.caregiverId}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#3D6B22]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {cand.caregiverName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E3F1D9] text-[#1E5622]">
                              {cand.overallScore}% Match
                            </span>
                            {cand.isHouseholdLinked && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Household Linked
                              </span>
                            )}
                            {cand.hasConflict && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {cand.conflictReason}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            <span>{cand.employmentClassification}</span>
                            <span>· {cand.distanceMiles} mi ({cand.travelMinutes}m)</span>
                            <span>
                              · {cand.scheduledHoursThisWeek}h / {cand.weeklyCapacityHours}h wk
                            </span>
                            <span>· Skills: {cand.matchedSkills.join(", ") || "Standard"}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={
                            activeCallOut.status === "Assigned" ||
                            activeCallOut.status === "Resolved" ||
                            !cand.isActivated
                          }
                          onClick={() => handleAssignReplacement(activeCallOut.id, cand)}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>
                            {activeCallOut.replacementCaregiverId === cand.caregiverId
                              ? "Assigned"
                              : "Approve & Assign"}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assignment History */}
              <div className={CARD_CLASS + " space-y-3"}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>Original &amp; Replacement Assignment History</span>
                </h3>
                <div className="space-y-2.5">
                  {activeCallOut.assignmentHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#3D6B22] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900">{item.action}</span>
                          <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{item.details}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Actor: {item.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Record Agency Call-Out Modal */}
      <Modal
        isOpen={isCallOutModalOpen}
        onClose={() => setIsCallOutModalOpen(false)}
        title="Record Caregiver Call-Out"
        description="Flag an assigned visit for replacement coverage without auto-assigning."
        icon={<AlertTriangle className="w-5 h-5" />}
        footer={
          <>
            <FormButtonCancel onClick={() => setIsCallOutModalOpen(false)} />
            <FormButtonPrimary type="submit" form="record-callout-form">
              Flag for Coverage
            </FormButtonPrimary>
          </>
        }
      >
        <form id="record-callout-form" onSubmit={handleRecordCallOut} className="space-y-4">
          <div>
            <FormLabel required>Affected Scheduled Visit</FormLabel>
            <FormSelect
              value={selectedVisitId}
              onChange={(e) => setSelectedVisitId(e.target.value)}
            >
              {eligibleVisitsForCallOut.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.date} {v.startTime}–{v.endTime} · {v.clientName} (CG: {v.caregiverName})
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FormLabel required>Call-Out Reason</FormLabel>
            <FormSelect
              value={callOutReason}
              onChange={(e) => setCallOutReason(e.target.value)}
            >
              <option value="Sudden Illness / Medical">Sudden Illness / Medical</option>
              <option value="Family Emergency">Family Emergency</option>
              <option value="Transportation / Vehicle Issue">Transportation / Vehicle Issue</option>
              <option value="No-Call / No-Show">No-Call / No-Show</option>
              <option value="Caregiver Requested Reassignment">Caregiver Requested Reassignment</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel>Coverage Notes</FormLabel>
            <FormTextarea
              rows={2}
              placeholder="Any handoff notes or urgency details for the scheduler..."
              value={callOutNotes}
              onChange={(e) => setCallOutNotes(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
