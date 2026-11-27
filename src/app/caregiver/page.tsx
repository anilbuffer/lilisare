"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CaregiverLayout } from "@/components/caregiver/CaregiverLayout";
import { ClockInOutCard } from "@/components/caregiver/ClockInOutCard";
import { TodayVisitsPanel } from "@/components/caregiver/TodayVisitsPanel";
import { VisitTaskChecklist } from "@/components/caregiver/VisitTaskChecklist";
import { EndVisitModal } from "@/components/caregiver/EndVisitModal";
import { RecommendedOpenVisitsPanel } from "@/components/caregiver/RecommendedOpenVisitsPanel";
import { INITIAL_VISITS, Visit, VisitVitals } from "@/lib/caregiver/caregiverPortalData";
import {
  getVisitsFromStorage,
  subscribeToSchedulingSync,
  createCallOutForVisit,
} from "@/lib/scheduling/schedulingStore";
import {
  getRecommendedOpenVisitsForCaregiver,
  getCaregiverWeeklyHoursSummary,
  getShiftRequestsFromStorage,
  submitOpenVisitRequest,
  hideOrDeclineOpenVisit,
  subscribeToCaregiverSync,
  syncCaregiverClockInToAgency,
  syncCaregiverClockOutToAgency,
  RecommendedOpenVisit,
  WeeklyHoursSummary,
  CaregiverShiftRequest,
} from "@/lib/caregiver/caregiverSync";
import { RealTimeVisit } from "@/types/scheduling";
import { Modal } from "@/components/ui/Modal";
import {
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";
import { toast } from "sonner";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  Lock,
  History,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Activity,
  MessageSquare,
  ClipboardCheck,
  Stethoscope,
} from "lucide-react";

export default function CaregiverTodayPage() {
  const [visits, setVisits] = useState<Visit[]>(INITIAL_VISITS);
  const [activeVisitId, setActiveVisitId] = useState<string>("visit-101");
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"today" | "history">("today");
  const [syncedVisits, setSyncedVisits] = useState<RealTimeVisit[]>([]);
  const [openVisits, setOpenVisits] = useState<RecommendedOpenVisit[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHoursSummary>({
    currentHours: 6.5,
    goalHours: 20,
    currentPercent: 32.5,
    pendingRequestHours: 0,
  });
  const [shiftRequests, setShiftRequests] = useState<CaregiverShiftRequest[]>([]);
  const [showCallOutModal, setShowCallOutModal] = useState(false);
  const [callOutVisitId, setCallOutVisitId] = useState("");
  const [callOutReason, setCallOutReason] = useState("Sudden Illness / Unable to Attend");
  const [callOutNotes, setCallOutNotes] = useState("");

  // Vitals & General Observations state for active visit
  const [vitals, setVitals] = useState<VisitVitals>({
    recordedAt: "09:45 AM",
    temperatureF: "98.6",
    pulseBpm: "75",
    respirations: "16",
    bloodPressure: "110/70",
    bpLocation: "Left Arm",
    o2Saturation: "95",
  });
  const [generalNotes, setGeneralNotes] = useState<string>(
    "Just woke up, walking around. Alert and calm, complaining of mild headache."
  );

  useEffect(() => {
    const load = () => {
      setSyncedVisits(getVisitsFromStorage());
      setOpenVisits(getRecommendedOpenVisitsForCaregiver("CG-101"));
      setWeeklyHours(getCaregiverWeeklyHoursSummary("CG-101", 20, 6.5));
      setShiftRequests(getShiftRequestsFromStorage());
    };
    load();
    const unsubSched = subscribeToSchedulingSync(load);
    const unsubCg = subscribeToCaregiverSync(load);
    return () => {
      unsubSched();
      unsubCg();
    };
  }, []);

  const activeVisit = visits.find((v) => v.id === activeVisitId) || visits[0];

  const matchedSyncedVisit = useMemo(
    () =>
      syncedVisits.find(
        (sv) =>
          sv.clientName.toLowerCase() === activeVisit.clientName.toLowerCase() ||
          sv.id === activeVisit.id
      ),
    [syncedVisits, activeVisit]
  );

  const scheduledForCallOut = useMemo(
    () => syncedVisits.filter((v) => !v.isRemoved && v.status === "Scheduled" && v.caregiverId),
    [syncedVisits]
  );

  const visitHistory = useMemo(
    () =>
      syncedVisits.filter(
        (v) => v.status === "Completed" || v.status === "Verified"
      ),
    [syncedVisits]
  );

  const handleReportCallOut = (e: React.FormEvent) => {
    e.preventDefault();
    const target = syncedVisits.find((v) => v.id === callOutVisitId) || scheduledForCallOut[0];
    if (!target) {
      toast.error("No upcoming scheduled visit selected.");
      return;
    }
    createCallOutForVisit(
      target,
      "Caregiver",
      callOutReason,
      callOutNotes,
      target.caregiverName || "Caregiver (Mobile App)"
    );
    toast.warning(`Call-out reported for ${target.clientName} (${target.date}). Agency scheduler notified.`);
    setShowCallOutModal(false);
    setCallOutNotes("");
  };

  // Handle Clock In (with real-time Agency EVV + Scheduling Sync)
  const handleClockIn = (method: "gps" | "ivr" | "fvv", reason?: string) => {
    const clockInStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setIsClockedIn(true);
    setVisits((prev) =>
      prev.map((v) =>
        v.id === activeVisitId
          ? {
            ...v,
            status: "In Progress",
            clockInTime: clockInStr,
            clockInMethod: method,
            clockInReason: reason,
          }
          : v
      )
    );
    syncCaregiverClockInToAgency({
      visit: activeVisit,
      clockInTime: clockInStr,
      method,
      reason,
    });
    toast.success(`CLOCKED IN at ${clockInStr}. Real-time EVV synced to Agency Scheduling & EVV Monitoring.`);
  };

  const handleRequestOpenVisit = (ov: RecommendedOpenVisit) => {
    submitOpenVisitRequest(ov, "CG-101", "Maria Santos, CNA");
    toast.success(`Shift request sent for ${ov.clientName} (${ov.dateLabel}). Agency Scheduler notified for review.`);
  };

  const handleDeclineOrHideOpenVisit = (visitId: string, action: "Decline" | "Hide") => {
    hideOrDeclineOpenVisit(visitId, action);
    toast.info(`Open visit ${action === "Decline" ? "declined" : "hidden"} from your recommendations.`);
  };

  const handleUpdateTaskNote = (taskId: string, note: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === activeVisitId
          ? {
            ...v,
            tasks: v.tasks.map((t) =>
              t.id === taskId ? { ...t, taskNote: note } : t
            ),
          }
          : v
      )
    );
  };

  // Handle Task Checkbox Toggle
  const handleToggleTask = (taskId: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === activeVisitId
          ? {
            ...v,
            tasks: v.tasks.map((t) =>
              t.id === taskId
                ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toLocaleTimeString() : undefined,
                  skipped: false,
                }
                : t
            ),
          }
          : v
      )
    );
  };

  // Handle Skip Task Reason
  const handleSkipTaskReason = (taskId: string, reason: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === activeVisitId
          ? {
            ...v,
            tasks: v.tasks.map((t) =>
              t.id === taskId
                ? {
                  ...t,
                  completed: false,
                  skipped: true,
                  skipReason: reason,
                }
                : t
            ),
          }
          : v
      )
    );
  };

  // Handle Medication Logging
  const handleLogMedication = (
    medId: string,
    status: "reminded" | "took" | "declined" | "pending"
  ) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === activeVisitId
          ? {
            ...v,
            medications: v.medications.map((m) =>
              m.id === medId ? { ...m, status, loggedAt: new Date().toLocaleTimeString() } : m
            ),
          }
          : v
      )
    );
  };

  // Handle End of Visit Completion (with full Cross-Portal Sync)
  const handleCompleteVisit = (data: {
    notes: string;
    signatureUrl?: string;
    unableToSignReason?: string;
    photos: any[];
    mileage: number;
  }) => {
    const clockOutStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setIsClockedIn(false);
    setShowEndModal(false);
    setVisits((prev) =>
      prev.map((v) =>
        v.id === activeVisitId
          ? {
            ...v,
            status: "Completed",
            clockOutTime: clockOutStr,
            visitNotes: data.notes,
            generalNotes,
            vitals,
            signatureUrl: data.signatureUrl,
            unableToSignReason: data.unableToSignReason,
            photos: data.photos,
            mileageRecorded: data.mileage,
          }
          : v
      )
    );
    syncCaregiverClockOutToAgency({
      visit: activeVisit,
      clockOutTime: clockOutStr,
      generalNotes: generalNotes || data.notes,
      vitals,
      signatureUrl: data.signatureUrl,
      unableToSignReason: data.unableToSignReason,
    });
    toast.success("Visit signed & submitted! Synced to EVV Monitoring, Care Notes Review, Payroll & Billing Readiness.");
  };

  return (
    <CaregiverLayout
      isClockedIn={isClockedIn}
      activeClientName={activeVisit.clientName}
      pendingSyncCount={isClockedIn ? 2 : 0}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_32px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div>
            <div className="flex items-center gap-2 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Caregiver Today Dashboard
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">Welcome back, Maria!</h1>
            <p className="text-xs text-gray-500 mt-1">
              You have 3 visits scheduled today in Springfield North Zone. All client care plans synced.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveView("today")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === "today" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                Today&apos;s Visits
              </button>
              <button
                type="button"
                onClick={() => setActiveView("history")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  activeView === "history" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Visit History ({visitHistory.length})</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setCallOutVisitId(scheduledForCallOut[0]?.id || "");
                setShowCallOutModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Issue / Call-Out</span>
            </button>
          </div>
        </div>

        {/* Clean Caregiver Quick Menu (Visits, Tasks, Communication, Documentation) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setActiveView("today")}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-[#3D6B22] shadow-2xs text-left transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E3F1D9] text-[#3D6B22] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Visits</div>
              <div className="text-[11px] text-slate-500">{visits.length} today · {openVisits.length} open</div>
            </div>
          </button>

          <a
            href="#adl-tasks-section"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-[#3D6B22] shadow-2xs text-left transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Tasks</div>
              <div className="text-[11px] text-slate-500">
                {activeVisit.tasks.filter((t) => t.completed).length}/{activeVisit.tasks.length} ADLs
              </div>
            </div>
          </a>

          <Link
            href="/caregiver/messages"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-[#3D6B22] shadow-2xs text-left transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Communication</div>
              <div className="text-[11px] text-slate-500">Care Team &amp; Dispatch</div>
            </div>
          </Link>

          <a
            href="#vitals-documentation-section"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-[#3D6B22] shadow-2xs text-left transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Documentation</div>
              <div className="text-[11px] text-slate-500">Vitals &amp; Care Notes</div>
            </div>
          </a>
        </div>

        {activeView === "today" ? (
          /* Desktop 2-Column Dashboard Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Column (Left/Center - 8 Cols on Desktop) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Recommended Open Visits & Preferred Weekly Hours */}
              <RecommendedOpenVisitsPanel
                openVisits={openVisits}
                weeklyHours={weeklyHours}
                shiftRequests={shiftRequests}
                onRequestVisit={handleRequestOpenVisit}
                onDeclineOrHideVisit={handleDeclineOrHideOpenVisit}
              />

              {/* Clock-In / Clock-Out Card */}
              <ClockInOutCard
                visit={activeVisit}
                isClockedIn={isClockedIn}
                onClockIn={handleClockIn}
                onClockOutClick={() => setShowEndModal(true)}
              />

              {/* Client & Visit-Specific Instructions (Access Controlled) */}
              <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#3D6B22]" />
                    <span>Client &amp; Visit Instructions</span>
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2F8EE] text-[#1E5622] border border-[#C7E4B3]">
                    <Lock className="w-3 h-3" />
                    <span>Assigned Caregiver Access</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Client-Specific Instructions
                    </span>
                    <p className="text-slate-700 mt-1 font-medium">
                      {matchedSyncedVisit?.clientInstructions ||
                        "Use calm verbal cues before transfers; keep labeled hydration bottle within reach."}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      Visit-Specific Instructions
                    </span>
                    <p className="text-slate-700 mt-1 font-medium">
                      {matchedSyncedVisit?.visitInstructions ||
                        matchedSyncedVisit?.memo ||
                        "Complete morning ADL routine and log medication reminder before noon."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Visit Task Checklist */}
              <div id="adl-tasks-section">
                <VisitTaskChecklist
                  clientName={activeVisit.clientName}
                  tasks={activeVisit.tasks}
                  medications={activeVisit.medications}
                  onToggleTask={handleToggleTask}
                  onSkipTaskReason={handleSkipTaskReason}
                  onUpdateTaskNote={handleUpdateTaskNote}
                  onLogMedication={handleLogMedication}
                />
              </div>

              {/* Vitals (Where Authorized) & General Observations */}
              <div id="vitals-documentation-section" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vitals Card */}
                <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#3D6B22]" />
                      <span>Clinical Vitals (Authorized)</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E3F1D9] text-[#1E5622]">
                      Synced to Care Notes
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <FormLabel>Time</FormLabel>
                      <FormInput
                        value={vitals.recordedAt}
                        onChange={(e) => setVitals({ ...vitals, recordedAt: e.target.value })}
                      />
                    </div>
                    <div>
                      <FormLabel>Temperature (°F)</FormLabel>
                      <FormInput
                        value={vitals.temperatureF}
                        onChange={(e) => setVitals({ ...vitals, temperatureF: e.target.value })}
                      />
                    </div>
                    <div>
                      <FormLabel>Pulse (bpm)</FormLabel>
                      <FormInput
                        value={vitals.pulseBpm}
                        onChange={(e) => setVitals({ ...vitals, pulseBpm: e.target.value })}
                      />
                    </div>
                    <div>
                      <FormLabel>Respirations (/min)</FormLabel>
                      <FormInput
                        value={vitals.respirations}
                        onChange={(e) => setVitals({ ...vitals, respirations: e.target.value })}
                      />
                    </div>
                    <div>
                      <FormLabel>Blood Pressure</FormLabel>
                      <FormInput
                        value={vitals.bloodPressure}
                        onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      />
                    </div>
                    <div>
                      <FormLabel>BP Location</FormLabel>
                      <FormSelect
                        value={vitals.bpLocation}
                        onChange={(e) =>
                          setVitals({
                            ...vitals,
                            bpLocation: e.target.value as VisitVitals["bpLocation"],
                          })
                        }
                      >
                        <option value="Left Arm">Left Arm</option>
                        <option value="Right Arm">Right Arm</option>
                        <option value="Left Wrist">Left Wrist</option>
                        <option value="Right Wrist">Right Wrist</option>
                      </FormSelect>
                    </div>
                    <div className="col-span-2">
                      <FormLabel>O2 Saturation (%)</FormLabel>
                      <FormInput
                        value={vitals.o2Saturation}
                        onChange={(e) => setVitals({ ...vitals, o2Saturation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* General Observations Card */}
                <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#3D6B22]" />
                        <span>General Observations</span>
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Required
                      </span>
                    </div>
                    <div>
                      <FormLabel>Client Condition &amp; Shift Observations</FormLabel>
                      <FormTextarea
                        rows={6}
                        value={generalNotes}
                        onChange={(e) => setGeneralNotes(e.target.value)}
                        placeholder="Describe client mood, mobility, appetite, or any new symptoms..."
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEndModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#3D6B22] hover:bg-[#345C1D] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    Review Summary, Client Signature &amp; Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Side Panel (Right - 4 Cols on Desktop) */}
            <div className="lg:col-span-4 space-y-6 sticky top-20">
              <TodayVisitsPanel
                visits={visits}
                activeVisitId={activeVisitId}
                onSelectVisit={(id) => setActiveVisitId(id)}
              />
            </div>
          </div>
        ) : (
          /* Visit History View */
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-[#3D6B22]" />
                <span>Completed Visit History &amp; EVV Verification</span>
              </h2>
              <span className="text-xs text-slate-500">{visitHistory.length} verified records</span>
            </div>
            <div className="space-y-2.5">
              {visitHistory.slice(0, 10).map((hv) => (
                <div
                  key={hv.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{hv.clientName}</span>
                      <span className="text-slate-400">· {hv.shiftNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E3F1D9] text-[#1E5622]">
                        {hv.evvStatus}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      {hv.date} · Scheduled {hv.startTime}–{hv.endTime}
                      {hv.clockInActual ? ` · Actual ${hv.clockInActual}–${hv.clockOutActual || "--"}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
                      Care Note: {hv.careNoteStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* End of Visit Multi-step Modal */}
      <EndVisitModal
        isOpen={showEndModal}
        visit={activeVisit}
        vitals={vitals}
        generalNotes={generalNotes}
        onClose={() => setShowEndModal(false)}
        onComplete={handleCompleteVisit}
      />

      {/* Report Issue / Call-Out Modal */}
      <Modal
        isOpen={showCallOutModal}
        onClose={() => setShowCallOutModal(false)}
        title="Report Issue or Call-Out"
        description="Immediately notifies the agency coverage desk and flags the shift for replacement."
        icon={<AlertTriangle className="w-5 h-5" />}
        footer={
          <>
            <FormButtonCancel onClick={() => setShowCallOutModal(false)} />
            <FormButtonPrimary type="submit" form="cg-callout-form">
              Submit Call-Out
            </FormButtonPrimary>
          </>
        }
      >
        <form id="cg-callout-form" onSubmit={handleReportCallOut} className="space-y-4">
          <div>
            <FormLabel required>Affected Scheduled Visit</FormLabel>
            <FormSelect
              value={callOutVisitId}
              onChange={(e) => setCallOutVisitId(e.target.value)}
            >
              {scheduledForCallOut.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.date} {v.startTime}–{v.endTime} · {v.clientName}
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FormLabel required>Reason</FormLabel>
            <FormSelect
              value={callOutReason}
              onChange={(e) => setCallOutReason(e.target.value)}
            >
              <option value="Sudden Illness / Unable to Attend">Sudden Illness / Unable to Attend</option>
              <option value="Family Emergency">Family Emergency</option>
              <option value="Transportation / Vehicle Issue">Transportation / Vehicle Issue</option>
              <option value="Running Late (>30 mins)">Running Late (&gt;30 mins)</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel>Details for Dispatcher</FormLabel>
            <FormTextarea
              rows={2}
              placeholder="Optional notes about arrival delay or coverage handoff..."
              value={callOutNotes}
              onChange={(e) => setCallOutNotes(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </CaregiverLayout>
  );
}
