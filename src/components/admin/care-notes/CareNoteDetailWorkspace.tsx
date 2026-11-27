"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CareNote,
  CareNoteSection,
  CareNoteVersion,
  CareNoteRule,
} from "@/types/careNotes";
import {
  INITIAL_CARE_NOTES,
  INITIAL_CARE_NOTE_RULES,
  getCareNoteById,
  getCareNoteRulesFromStorage,
  CARE_NOTES_SYNC_EVENT,
  CARE_NOTE_REVIEWERS,
  markCareNoteReviewed,
  approveCareNote,
  requestCareNoteCorrection,
  resubmitCareNote,
  acceptCareNoteCorrection,
  flagCareNote,
  resolveCareNoteFlag,
  addCareNoteInternalReviewNote,
} from "@/lib/admin/careNotesStore";
import { CareNoteStatusBadge, CareNoteQualityIndicator } from "./CareNotesBadges";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Send,
  MessageSquare,
  Sparkles,
  User,
  Heart,
  Calendar,
  MapPin,
  ClipboardCheck,
  FileText,
  History,
  Check,
  X,
  AlertCircle,
  Eye,
  Layers,
  ChevronRight,
  SplitSquareVertical,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  PhoneCall,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveDomainTabStrip } from "@/components/ui/ResponsiveDomainTabStrip";

interface CareNoteDetailWorkspaceProps {
  noteId: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function CareNoteDetailWorkspace({ noteId }: CareNoteDetailWorkspaceProps) {
  const router = useRouter();

  const [note, setNote] = useState<CareNote | null>(
    () => INITIAL_CARE_NOTES.find((n) => n.id === noteId) || null
  );
  const [rules, setRules] = useState<CareNoteRule[]>(INITIAL_CARE_NOTE_RULES);
  const [activeTab, setActiveTab] = useState<"note" | "history" | "compare">("note");

  // Modal States
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isClinicalFlagModalOpen, setIsClinicalFlagModalOpen] = useState(false);
  const [isComplianceFlagModalOpen, setIsComplianceFlagModalOpen] = useState(false);
  const [isInternalNoteModalOpen, setIsInternalNoteModalOpen] = useState(false);
  const [isResubmitSimulationModalOpen, setIsResubmitSimulationModalOpen] = useState(false);

  // Form states for modals
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionSections, setCorrectionSections] = useState<string[]>([]);
  const [correctionInstructions, setCorrectionInstructions] = useState("");
  const [correctionDueDate, setCorrectionDueDate] = useState("2026-11-28 17:00");

  const [flagReason, setFlagReason] = useState("");
  const [flagNotes, setFlagNotes] = useState("");

  const [internalNoteText, setInternalNoteText] = useState("");

  const adminActor = CARE_NOTE_REVIEWERS[0]; // Dana Jenkins, MSW (Agency Operations Admin)

  const reloadData = () => {
    const data = getCareNoteById(noteId);
    if (data) {
      setNote(JSON.parse(JSON.stringify(data)));
    }
    setRules(getCareNoteRulesFromStorage());
  };

  useEffect(() => {
    reloadData();
    window.addEventListener(CARE_NOTES_SYNC_EVENT, reloadData);
    return () => window.removeEventListener(CARE_NOTES_SYNC_EVENT, reloadData);
  }, [noteId]);

  if (!note) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Care Note Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Care note &quot;{noteId}&quot; does not exist or has been archived.
        </p>
        <Link
          href="/admin/care-notes"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3D6B22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CareNotes Directory</span>
        </Link>
      </div>
    );
  }

  // Find applicable documentation rule
  const applicableRule = rules.find((r) => r.serviceCode === note.serviceCode && r.status === "active");

  // Handlers for Review Actions
  const handleMarkReviewed = () => {
    const success = markCareNoteReviewed(note.id, adminActor, "Administrative review verified on dashboard.");
    if (success) {
      toast.success(`Care note #${note.id} marked as Reviewed`);
      reloadData();
    }
  };

  const handleApprove = () => {
    const result = approveCareNote(note.id, adminActor, "All required sections verified against program standards.");
    if (result.success) {
      toast.success(`Care note #${note.id} Approved`);
      reloadData();
    } else {
      toast.error(result.error || "Approval blocked");
    }
  };

  const handleSubmitCorrection = () => {
    if (!correctionReason.trim()) {
      toast.error("Please enter a correction reason");
      return;
    }
    if (correctionSections.length === 0) {
      toast.error("Please select at least one affected note section");
      return;
    }
    requestCareNoteCorrection(note.id, {
      requestedBy: adminActor,
      reason: correctionReason,
      affectedSections: correctionSections,
      caregiverInstructions: correctionInstructions,
      dueDate: correctionDueDate,
    });
    toast.success("Correction request dispatched to caregiver");
    setIsCorrectionModalOpen(false);
    reloadData();
  };

  const handleFlagSubmit = (type: "clinical" | "compliance") => {
    if (!flagReason.trim()) {
      toast.error("Please specify a reason for escalation");
      return;
    }
    flagCareNote(note.id, {
      flagType: type,
      flaggedBy: adminActor,
      reason: flagReason,
      notes: flagNotes,
    });
    toast.success(`Note flagged for ${type === "clinical" ? "Clinical (RN)" : "Compliance"} review`);
    setIsClinicalFlagModalOpen(false);
    setIsComplianceFlagModalOpen(false);
    setFlagReason("");
    setFlagNotes("");
    reloadData();
  };

  const handleAddInternalNote = () => {
    if (!internalNoteText.trim()) return;
    addCareNoteInternalReviewNote(note.id, internalNoteText, adminActor);
    toast.success("Internal review comment added");
    setInternalNoteText("");
    setIsInternalNoteModalOpen(false);
    reloadData();
  };

  const handleSimulateResubmission = () => {
    const updatedSections = note.sections.map((s) => ({
      sectionKey: s.sectionKey,
      content: s.content + "\n\n[Caregiver Revision]: Updated with requested details and supervisor guidance.",
    }));
    resubmitCareNote(note.id, updatedSections, "Caregiver amended documentation per admin feedback.");
    toast.success("New note version resubmitted by caregiver");
    setIsResubmitSimulationModalOpen(false);
    reloadData();
  };

  const handleAcceptCorrection = () => {
    acceptCareNoteCorrection(note.id, adminActor, "Resubmitted revisions verified and accepted.");
    toast.success("Caregiver correction accepted");
    reloadData();
  };

  // Check blocking conditions
  const hasIncompleteSections = note.sections.some((s) => s.required && s.completionStatus !== "complete");
  const hasOpenClinicalFlag = note.flags.some((f) => f.flagType === "clinical" && f.status === "open");

  return (
    <div className="w-full max-w-9xl mx-auto space-y-4 pb-16 animate-in fade-in duration-300">
      {/* =========================================================================
          TOP NAVIGATION BREADCRUMB
         ========================================================================= */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/admin/care-notes"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to CareNotes Directory</span>
        </Link>
      </div>

      {/* =========================================================================
          01. HERO IDENTITY CARD
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            {/* Row 1: Note ID and Status Pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-[#3D6B22] font-bold text-xs shrink-0 shadow-2xs">
                {getInitials(note.clientName)}
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {note.clientName}
              </h1>
              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs border border-slate-200/80">
                {note.id}
              </span>
              <CareNoteStatusBadge status={note.reviewStatus} />
              <CareNoteQualityIndicator status={note.qualityStatus} />
              {note.currentVersion > 1 && (
                <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs border border-slate-200/80">
                  Version {note.currentVersion}
                </span>
              )}
              {note.isMissing && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Missing Expected Note
                </span>
              )}
            </div>

            {/* Row 2: Program and Service info (Caregiver, Date of Service, and Visit moved to dedicated cards below) */}
            <div className="mt-0.5 flex items-center gap-2.5 flex-wrap text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#3D6B22] border border-emerald-200/80">
                {note.programName}
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Service:{" "}
                <strong className="text-slate-900 font-semibold">{note.serviceType}</strong>{" "}
                <span className="font-mono text-xs text-slate-500">({note.serviceCode})</span>
              </span>
            </div>
          </div>

          {/* Right-Aligned Action Buttons: ONLY Mark Reviewed and Approve Note stay here */}
          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0 flex-wrap">
            {/* Mark Reviewed */}
            {note.reviewStatus !== "reviewed" && note.reviewStatus !== "approved" && (
              <button
                type="button"
                onClick={handleMarkReviewed}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Reviewed</span>
              </button>
            )}

            {/* Approve Note (Primary action) */}
            <button
              type="button"
              onClick={handleApprove}
              disabled={hasIncompleteSections || hasOpenClinicalFlag || note.reviewStatus === "approved"}
              title={
                hasIncompleteSections
                  ? "Approval blocked: Missing or incomplete documentation sections"
                  : hasOpenClinicalFlag
                    ? "Approval blocked: Unresolved clinical escalation requires RN sign-off"
                    : "Approve care note"
              }
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer ${note.reviewStatus === "approved"
                ? "bg-emerald-50 text-[#008f5a] border border-emerald-200 cursor-default"
                : hasIncompleteSections || hasOpenClinicalFlag
                  ? "bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                  : "text-white bg-[#3D6B22] hover:bg-[#345C1D] shadow-[#3D6B22]/20 hover:shadow-md active:scale-95"
                }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{note.reviewStatus === "approved" ? "Approved" : "Approve Note"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          02. DEDICATED INDIVIDUAL METADATA CARDS (Caregiver + Date of Service + Visit + Client)
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dedicated Card 1: Caregiver */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> Caregiver
          </div>
          <div className="font-bold text-slate-900 text-sm sm:text-base">{note.caregiverName}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">ID: {note.caregiverId}</div>
          <div className="text-[11px] font-semibold text-emerald-700 mt-1">
            {note.caregiverClassification}
          </div>
        </div>

        {/* Dedicated Card 2: Date of Service */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#3D6B22]" /> Date of Service
          </div>
          <div className="font-bold text-slate-900 text-sm sm:text-base">{note.serviceDate}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Submitted: {note.submittedAt || "Draft / In Progress"}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Filing SLA: Verified &lt; 24h
          </div>
        </div>

        {/* Dedicated Card 3: Visit */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-amber-500" /> Visit & EVV
          </div>
          <div className="font-bold text-slate-900 text-sm sm:text-base font-mono">{note.visitId}</div>
          <div className="text-xs text-slate-600 mt-1 font-medium">
            Scheduled: {note.scheduledTime || "N/A"}
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            EVV: {note.actualVisitTime || "Verified GPS Stamp"}
          </div>
        </div>

        {/* Dedicated Card 4: Client Profile */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5 text-[#3D6B22]" /> Client Profile
          </div>
          <div className="font-bold text-slate-900 text-sm sm:text-base">{note.clientName}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">ID: {note.clientId}</div>
          <div className="text-[11px] font-medium text-slate-400 mt-1">{note.agencyName}</div>
        </div>
      </div>

      {/* =========================================================================
          03. DEDICATED INDIVIDUAL ACTION CARDS (Moved from Header Right Side)
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Administrative Review & Quality Actions
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Request caregiver corrections, attach supervisor review comments, or route clinical and compliance flags
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/80">
            Agency Admin Controls
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Request Correction */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Request Correction</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Return note to caregiver for missing required sections or documentation amendments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCorrectionSections(
                  note.sections.filter((s) => s.completionStatus !== "complete").map((s) => s.sectionKey)
                );
                setIsCorrectionModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/80 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Request Correction</span>
            </button>
          </div>

          {/* Card 2: Internal Review Note */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-slate-900 text-xs font-bold mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                <span>Internal Review Note</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Add confidential administrative review commentary hidden from the caregiver.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsInternalNoteModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Add Internal Note</span>
            </button>
          </div>

          {/* Card 3: Flag Clinical */}
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50/70 transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-purple-900 text-xs font-bold mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                <span>Flag Clinical (RN)</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Route vital sign alerts or acute client changes to Registered Nurse Supervisor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsClinicalFlagModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300/80 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
              <span>Flag Clinical</span>
            </button>
          </div>

          {/* Card 4: Flag Compliance */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-slate-900 text-xs font-bold mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
                <span>Flag Compliance</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Escalate EVV duration discrepancies, GPS telemetries, or billing variances.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsComplianceFlagModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
              <span>Flag Compliance</span>
            </button>
          </div>
        </div>

        {/* If resubmitted: Accept correction banner */}
        {note.correctionStatus === "resubmitted" && (
          <div className="mt-3.5 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2.5 text-xs text-blue-900 font-medium">
              <Check className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Caregiver has resubmitted amendments for this note. Please review and verify the updated narrative.</span>
            </div>
            <button
              type="button"
              onClick={handleAcceptCorrection}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Correction</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          02. VIEW SWITCHER TABS (Space-Aware Responsive Tab Strip)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <ResponsiveDomainTabStrip
            tabs={[
              { id: "note", label: "Current Note Content" },
              { id: "history", label: `Version History (${note.versions?.length || 1})` },
              ...(note.versions && note.versions.length > 0
                ? [{ id: "compare" as const, label: "Compare Versions (Diff)" }]
                : []),
            ]}
            activeTab={activeTab}
            onSelectTab={(t) => setActiveTab(t)}
            ariaLabel="Care note sections"
          />
        </div>

        {/* Caregiver simulation button (Demonstrating Release 2 / Resubmission lifecycle) */}
        <button
          type="button"
          onClick={() => setIsResubmitSimulationModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-[#3D6B22] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all shrink-0 cursor-pointer"
          title="Simulate caregiver resubmitting amended note"
        >
          <Layers className="w-3.5 h-3.5 text-[#3D6B22]" />
          <span>Simulate Caregiver Resubmission</span>
        </button>
      </div>

      {/* =========================================================================
          04. MAIN DETAIL LAYOUT
         ========================================================================= */}
      {/* Tab 1: Current Note Content with Completeness Sidebar */}
      {activeTab === "note" && (() => {
        const verifiedCount = note.sections.filter((s) => s.completionStatus === "complete").length;
        const totalSections = note.sections.length;
        const completenessPct = totalSections > 0 ? Math.round((verifiedCount / totalSections) * 100) : 100;
        const openFlags = note.flags.filter((f) => f.status === "open");

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Caregiver Submitted Documentation */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-6">
                {/* Card Header with Standard Emerald Icon Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Caregiver Submitted Documentation
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Authored by <strong className="text-slate-800">{note.caregiverName}</strong> • Submitted{" "}
                        {note.submittedAt || "Unsubmitted draft"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <span className="font-mono text-xs font-bold bg-[#3D6B22]/10 text-[#3D6B22] px-2.5 py-1 rounded-lg border border-[#3D6B22]/20">
                      Template: {note.serviceCode}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                      v{note.currentVersion}
                    </span>
                  </div>
                </div>

                {/* Open Flags / Alerts Banner */}
                {openFlags.length > 0 && (
                  <div className="space-y-2.5">
                    {openFlags.map((flag) => (
                      <div
                        key={flag.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${flag.flagType === "clinical"
                          ? "bg-purple-50/80 border-purple-200 text-purple-950"
                          : "bg-rose-50/80 border-rose-200 text-rose-950"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${flag.flagType === "clinical"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-rose-100 text-rose-700"
                              }`}
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold sm:text-sm">
                              {flag.flagType === "clinical" ? "Clinical Supervisory Flag" : "Compliance Flag"}: {flag.reason}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{flag.notes}</p>
                            <div className="text-[11px] text-slate-500 mt-1.5 font-medium">
                              Flagged by {flag.flaggedBy} • {flag.flaggedAt}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            resolveCareNoteFlag(note.id, flag.id, "Resolved by Agency Admin inspection", adminActor);
                            toast.success("Flag resolved");
                            reloadData();
                          }}
                          className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shrink-0 cursor-pointer shadow-2xs transition-all self-start"
                        >
                          Resolve Flag
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Document Sections Section Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Care Documentation Sections ({totalSections})
                    </h3>
                    <div className="h-px bg-slate-100 flex-1" />
                    <span className="text-[11px] font-semibold text-slate-500">
                      {verifiedCount} of {totalSections} sections verified
                    </span>
                  </div>

                  {/* Note Sections (Structured LiliSare Document Viewer) */}
                  <div className="space-y-4">
                    {note.sections.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className={`p-4 sm:p-5 rounded-xl border transition-all space-y-3 ${sec.completionStatus === "missing"
                          ? "bg-rose-50/40 border-rose-200"
                          : sec.completionStatus === "incomplete"
                            ? "bg-amber-50/35 border-amber-200"
                            : "bg-slate-50/40 border-slate-200/90 hover:border-slate-300"
                          }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${sec.completionStatus === "missing"
                                ? "bg-rose-100 text-rose-700 border-rose-200"
                                : sec.completionStatus === "incomplete"
                                  ? "bg-amber-100 text-amber-800 border-amber-200"
                                  : "bg-[#3D6B22]/10 text-[#3D6B22] border-[#3D6B22]/20"
                                }`}
                            >
                              {idx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight">{sec.sectionTitle}</h4>
                            {sec.required ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 uppercase tracking-wider">
                                Mandatory
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Optional
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {sec.completionStatus !== "complete" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCorrectionSections([sec.sectionKey]);
                                  setIsCorrectionModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/80 transition-colors cursor-pointer"
                              >
                                Request Fix
                              </button>
                            )}

                            {sec.completionStatus === "complete" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-[#008f5a] border border-emerald-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00d084]" />
                                Verified Complete
                              </span>
                            ) : sec.completionStatus === "missing" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-rose-700 border border-rose-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Missing Entry
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-amber-700 border border-amber-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Needs Clarification
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Submitted Content Narrative */}
                        {sec.content ? (
                          <div className="text-xs text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80 font-sans whitespace-pre-line shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            {sec.content}
                          </div>
                        ) : (
                          <div className="p-4 bg-white rounded-xl border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2 italic">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>No documentation entered for this required section. Caregiver correction required.</span>
                          </div>
                        )}

                        {/* Validation Feedback Messages */}
                        {sec.validationMessages && sec.validationMessages.length > 0 && (
                          <div className="space-y-1.5">
                            {sec.validationMessages.map((msg, mIdx) => (
                              <div
                                key={mIdx}
                                className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200/80 text-xs text-rose-700 flex items-start gap-2 font-medium"
                              >
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <span>{msg}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviewer Action Trail & Notes */}
                {note.reviews && note.reviews.length > 0 && (
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Reviewer Notes &amp; Action Trail ({note.reviews.length})
                      </h4>
                      <div className="h-px bg-slate-100 flex-1" />
                    </div>
                    <div className="space-y-2.5">
                      {note.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/90 text-xs space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{rev.reviewerName}</span>
                              <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                                {rev.reviewerRole}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">{rev.reviewedAt}</span>
                          </div>
                          <p className="text-slate-700 font-medium leading-relaxed">
                            {rev.reviewNotes || "Status updated"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caregiver Authorship Governance Footer */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#3D6B22] shrink-0" />
                    <span>
                      Read-only caregiver submission — Admin audits quality without silently altering caregiver text.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className="font-bold text-[#3D6B22] hover:text-[#345C1D] inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    View Version History (v{note.currentVersion}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Documentation Completeness & Applicable Rule Panel */}
            <div className="lg:col-span-4 space-y-6">
              {/* Completeness Panel */}
              <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-5">
                {/* Header matching Caregiver Submitted Documentation */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Documentation Completeness
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Validation score &amp; section checklist
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Verification Readiness */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {verifiedCount} / {totalSections} Sections Verified
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${completenessPct === 100
                        ? "bg-emerald-50 text-[#008f5a] border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                    >
                      {completenessPct}%
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${completenessPct === 100
                        ? "bg-[#3D6B22]"
                        : completenessPct >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                        }`}
                      style={{ width: `${completenessPct}%` }}
                    />
                  </div>

                  <div
                    className={`text-[11px] font-semibold flex items-center gap-1.5 ${hasIncompleteSections || hasOpenClinicalFlag ? "text-rose-700" : "text-[#008f5a]"
                      }`}
                  >
                    {hasIncompleteSections ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Approval blocked until missing sections are corrected</span>
                      </>
                    ) : hasOpenClinicalFlag ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="text-purple-800">Awaiting Clinical RN sign-off for open flag</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>All mandatory documentation checks passed</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Structured Checklist Rows */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Section Verification Checklist
                    </span>
                    <div className="h-px bg-slate-100 flex-1" />
                  </div>

                  <div className="rounded-xl border border-slate-200/80 divide-y divide-slate-100 bg-white overflow-hidden">
                    {note.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-3 flex items-center justify-between gap-2.5 text-xs hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">{sec.sectionTitle}</div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {sec.required ? "Mandatory Field" : "Optional Field"}
                          </div>
                        </div>
                        {sec.completionStatus === "complete" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-[#008f5a] border border-emerald-200/80 shrink-0">
                            <Check className="w-3 h-3" /> Pass
                          </span>
                        ) : sec.completionStatus === "missing" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shrink-0">
                            <X className="w-3 h-3" /> Missing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0">
                            <AlertTriangle className="w-3 h-3" /> Incomplete
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connected Journey Mini Integrity Row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      EVV Telemetry
                    </div>
                    <div
                      className={`text-xs font-bold flex items-center gap-1.5 ${note.evvStatus === "verified" ? "text-[#008f5a]" : "text-amber-700"
                        }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${note.evvStatus === "verified" ? "bg-[#00d084]" : "bg-amber-500"
                          }`}
                      />
                      <span className="capitalize">{note.evvStatus || "Verified"}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Filing SLA
                    </div>
                    <div
                      className={`text-xs font-bold flex items-center gap-1.5 ${note.isOverdue ? "text-rose-700" : "text-slate-800"
                        }`}
                    >
                      <Clock className={`w-3.5 h-3.5 ${note.isOverdue ? "text-rose-600" : "text-[#3D6B22]"}`} />
                      <span>{note.isOverdue ? "SLA Overdue" : "Within 24h"}</span>
                    </div>
                  </div>
                </div>

                {/* Applicable Rule Details */}
                {applicableRule && (
                  <div className="pt-1 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Applicable Documentation Rule
                      </span>
                      <Link
                        href="/admin/care-notes?tab=rules"
                        className="text-[11px] font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-0.5"
                      >
                        Rules <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{applicableRule.requirementName}</span>
                        <span className="font-mono text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                          {applicableRule.id}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {applicableRule.requirementDescription}
                      </p>
                      {applicableRule.validationInstructions && (
                        <div className="p-2.5 bg-amber-50/80 rounded-lg border border-amber-200/80 text-[11px] text-amber-900 font-medium leading-relaxed">
                          <strong className="font-bold">Audit Guidance:</strong> {applicableRule.validationInstructions}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Correction Status Card */}
              {note.corrections && note.corrections.length > 0 && (
                <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        Correction Workflow
                      </h3>
                    </div>
                    <CareNoteStatusBadge status={note.correctionStatus} type="correction" />
                  </div>
                  <div className="space-y-3">
                    {note.corrections.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900">{c.reason}</span>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">{c.requestedAt}</span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{c.caregiverInstructions}</p>
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>
                            Requested by <strong className="text-slate-700">{c.requestedBy}</strong>
                          </span>
                          {c.resubmittedAt && (
                            <span className="text-[#008f5a] font-bold">
                              Resubmitted: {c.resubmittedAt}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Tab 2: Full Version History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 sm:p-7 space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Complete Note Version Trail</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Every amendment creates an immutable snapshot. Older versions cannot be deleted or replaced.
            </p>
          </div>

          <div className="relative border-l-2 border-slate-200 pl-6 space-y-6 ml-3">
            {/* Current Active Version */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#3D6B22] border-2 border-white ring-4 ring-[#3D6B22]/20" />
              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900">
                    Version {note.currentVersion} (Current Active Note)
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{note.submittedAt || "Unsubmitted"}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">Submitted by: {note.caregiverName}</p>
                <div className="text-xs text-slate-800 mt-3 bg-white p-4 rounded-xl border border-slate-100 font-sans whitespace-pre-line shadow-2xs">
                  {note.sections.map((s) => s.content).filter(Boolean).join("\n\n")}
                </div>
              </div>
            </div>

            {/* Archived Snapshots */}
            {note.versions &&
              note.versions.map((ver) => (
                <div key={ver.id} className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-300 border-2 border-white ring-2 ring-slate-100" />
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-800">Version {ver.versionNumber}</span>
                      <span className="text-xs font-medium text-slate-400">{ver.submittedAt}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Submitted by: {ver.submittedBy} ({ver.submittedByRole})
                    </p>
                    {ver.changeReason && (
                      <div className="mt-1 text-xs text-amber-800 font-semibold italic">
                        Change Reason: {ver.changeReason}
                      </div>
                    )}
                    <div className="text-xs text-slate-700 mt-3 bg-white p-4 rounded-xl border border-slate-100 font-sans whitespace-pre-line shadow-2xs">
                      {ver.contentSnapshot && ver.contentSnapshot.length > 0 ? (
                        ver.contentSnapshot.map((s) => s.content).filter(Boolean).join("\n\n")
                      ) : (
                        <span className="text-slate-400 italic">Snapshot content recorded</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Side-by-Side Compare (Diff) */}
      {activeTab === "compare" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Before & After Version Comparison
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Compare initial caregiver submission against corrected resubmission
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
              Comparing v{note.versions?.[0]?.versionNumber || 1} vs v{note.currentVersion}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Previous Version Box */}
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/60">
                <span className="font-bold text-sm text-amber-950">
                  Original Submission (v{note.versions?.[0]?.versionNumber || 1})
                </span>
                <span className="text-xs text-amber-800 font-semibold">Prior to Correction</span>
              </div>
              {note.versions?.[0]?.contentSnapshot && note.versions[0].contentSnapshot.length > 0 ? (
                note.versions[0].contentSnapshot.map((sec) => (
                  <div key={sec.id} className="text-xs space-y-1.5">
                    <div className="font-bold text-slate-700">{sec.sectionTitle}</div>
                    <div className="p-3.5 bg-white rounded-xl border border-amber-100 text-slate-700 leading-relaxed">
                      {sec.content || <span className="italic text-slate-400">Section blank</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-3">Original submission snapshot.</div>
              )}
            </div>

            {/* Current Active Version Box */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200/60">
                <span className="font-bold text-sm text-emerald-950">
                  Resubmitted Version (v{note.currentVersion})
                </span>
                <span className="text-xs text-emerald-700 font-semibold">Current Active Note</span>
              </div>
              {note.sections.map((sec) => (
                <div key={sec.id} className="text-xs space-y-1.5">
                  <div className="font-bold text-slate-900">{sec.sectionTitle}</div>
                  <div className="p-3.5 bg-white rounded-xl border border-emerald-100 text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                    {sec.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GLOBAL MODALS (Matching LiliSare Form Standards)
         ========================================================================= */}
      {/* MODAL 1: Request Correction */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Request Caregiver Correction
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Return note #{note.id} to {note.caregiverName} for clarification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Correction Category / Reason *
                </label>
                <select
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                >
                  <option value="">Select reason...</option>
                  <option value="Missing Mandatory Section Content">Missing Mandatory Section Content</option>
                  <option value="Vague ADL or Assist Description">Vague ADL or Assist Description</option>
                  <option value="Vital Signs Incomplete or Missing">Vital Signs Incomplete or Missing</option>
                  <option value="Time Duration Inconsistent with Shift">Time Duration Inconsistent with Shift</option>
                  <option value="Omitted Assistive Devices / Mobility Clarification">
                    Omitted Assistive Devices / Mobility Clarification
                  </option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Affected Note Sections *
                </label>
                <div className="space-y-2">
                  {note.sections.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={correctionSections.includes(s.sectionKey)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCorrectionSections([...correctionSections, s.sectionKey]);
                          } else {
                            setCorrectionSections(correctionSections.filter((key) => key !== s.sectionKey));
                          }
                        }}
                        className="rounded text-[#3D6B22] focus:ring-[#3D6B22]"
                      />
                      <span className="font-semibold text-slate-800">{s.sectionTitle}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Specific Instructions for Caregiver
                </label>
                <textarea
                  rows={3}
                  value={correctionInstructions}
                  onChange={(e) => setCorrectionInstructions(e.target.value)}
                  placeholder="Detail what specific amendments are needed so the caregiver can resubmit quickly..."
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Correction Due Date</label>
                <input
                  type="text"
                  value={correctionDueDate}
                  onChange={(e) => setCorrectionDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCorrection}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
              >
                Dispatch Correction Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Flag Clinical */}
      {isClinicalFlagModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Flag for Clinical Supervisory Review
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Route to RN Carlos Mendez for clinical assessment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClinicalFlagModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Clinical Escalation Reason *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acute BP deviation, cognitive change, skin tear observation..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Clinical Supervisor Guidance & Context
                </label>
                <textarea
                  rows={3}
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="Enter details for RN Carlos Mendez..."
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900 font-medium leading-relaxed">
                Note: Flagging for Clinical Review blocks administrative approval until authorized RN sign-off is completed.
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsClinicalFlagModalOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFlagSubmit("clinical")}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Escalate to Clinical RN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Flag Compliance */}
      {isComplianceFlagModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Flag for Compliance Audit
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Route to Sarah Alverez (Billing & Compliance Auditor)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsComplianceFlagModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Compliance Reason *</label>
                <input
                  type="text"
                  placeholder="e.g. EVV time discrepancy, signature date mismatch..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Auditor Notes</label>
                <textarea
                  rows={3}
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="Provide context for compliance queue..."
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsComplianceFlagModalOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFlagSubmit("compliance")}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Flag for Compliance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Internal Review Note */}
      {isInternalNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Add Internal Review Note</h3>
              <button
                onClick={() => setIsInternalNoteModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-3">
              <label className="text-xs font-semibold text-slate-600 block">
                Internal review comments are visible only to Agency Admin and Clinical Supervisors:
              </label>
              <textarea
                rows={4}
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                placeholder="Enter review notes or observations..."
                className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>
            <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50 flex justify-end gap-2.5">
              <button
                onClick={() => setIsInternalNoteModalOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInternalNote}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Save Internal Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Simulate Caregiver Resubmission */}
      {isResubmitSimulationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Simulate Caregiver Resubmission</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Demonstrates Versioning & Audit Trail</p>
              </div>
              <button
                onClick={() => setIsResubmitSimulationModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-3.5 text-xs text-slate-600">
              <p className="leading-relaxed">
                In production, the caregiver reviews admin feedback on their mobile app and resubmits the corrected note.
              </p>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-medium leading-relaxed">
                Clicking <strong>Resubmit Version {note.currentVersion + 1}</strong> will archive current Version {note.currentVersion} into history, update section contents, and set status to Resubmitted.
              </div>
            </div>
            <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50 flex justify-end gap-2.5">
              <button
                onClick={() => setIsResubmitSimulationModalOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateResubmission}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Resubmit Version {note.currentVersion + 1}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
