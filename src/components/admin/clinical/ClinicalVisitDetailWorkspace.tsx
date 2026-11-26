"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarPlus,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileText,
  FileWarning,
  Flag,
  History,
  Lock,
  Paperclip,
  Plus,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import {
  FormButtonCancel,
  FormButtonPrimary,
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "@/components/ui/FormControls";
import { useAuth } from "@/hooks/useAuth";
import {
  checkClinicalPermission,
  resolveClinicalActor,
} from "@/lib/admin/clinicalAuthGuard";
import {
  CLINICAL_PROFESSIONALS,
  DEMO_TODAY,
  assignClinicalReviewer,
  cancelClinicalRequirement,
  cancelClinicalVisit,
  completeClinicalFollowUp,
  completeClinicalSignOff,
  editClinicalRequirement,
  getClinicalAuditEvents,
  getClinicalFollowUps,
  getMockNotifications,
  resolveClinicalRecordByParam,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import { getClientById } from "@/lib/clients/mockData";
import {
  PriorityLevel,
  RequirementStatus,
  VisitDeliveryMethod,
} from "@/types/clinicalSupervisory";
import {
  ClinicalAvatarName,
  ClinicalReviewStatusBadge,
  ClinicalVisitStatusBadge,
  DeliveryMethodBadge,
  DocumentationStatusBadge,
  PriorityBadge,
  RequirementStatusBadge,
} from "./ClinicalBadges";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";
import {
  AssignProfessionalModal,
  CreateFollowUpModal,
  RequestDocumentationModal,
  ScheduleClinicalVisitModal,
  SendMockReminderModal,
} from "./ClinicalActionModals";

type DetailSectionTab =
  | "all"
  | "client_req"
  | "visit_schedule"
  | "documentation"
  | "review"
  | "followups"
  | "audit";

const VALID_DETAIL_TABS: DetailSectionTab[] = [
  "all",
  "client_req",
  "visit_schedule",
  "documentation",
  "review",
  "followups",
  "audit",
];

function calcDaysOverdue(dueDate: string): number {
  const due = new Date(`${dueDate}T12:00:00`).getTime();
  const today = new Date(`${DEMO_TODAY}T12:00:00`).getTime();
  return Math.max(0, Math.round((today - due) / (1000 * 60 * 60 * 24)));
}

export function ClinicalVisitDetailWorkspace({ visitId }: { visitId: string }) {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const urlTabParam = searchParams.get("tab") as DetailSectionTab | null;
  const highlightedEventId = searchParams.get("eventId");
  const resolvedUrlTab: DetailSectionTab =
    urlTabParam && VALID_DETAIL_TABS.includes(urlTabParam) ? urlTabParam : "all";

  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);
  const canEditReq = checkClinicalPermission(actor, "EDIT_REQUIREMENT").allowed;
  const canCancelReq = checkClinicalPermission(actor, "CANCEL_REQUIREMENT").allowed;
  const canSignOff = checkClinicalPermission(actor, "CLINICAL_SIGN_OFF").allowed;

  const [bundle, setBundle] = useState(() =>
    resolveClinicalRecordByParam(visitId, queryId)
  );
  const [followUps, setFollowUps] = useState(() => getClinicalFollowUps());
  const [auditEvents, setAuditEvents] = useState(() => getClinicalAuditEvents());
  const [mockNotifs, setMockNotifs] = useState(() => getMockNotifications());
  const [tabOverride, setTabOverride] = useState<{
    sourceKey: string;
    tab: DetailSectionTab;
  } | null>(null);

  const tabSourceKey = `${visitId}:${queryId || ""}:${resolvedUrlTab}`;
  const activeDetailTab: DetailSectionTab =
    tabOverride && tabOverride.sourceKey === tabSourceKey
      ? tabOverride.tab
      : resolvedUrlTab;
  const setActiveDetailTab = (tab: DetailSectionTab) =>
    setTabOverride({ sourceKey: tabSourceKey, tab });

  // Modals
  const [assignOpen, setAssignOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [escalateDefault, setEscalateDefault] = useState(false);
  const [reqDocOpen, setReqDocOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [editReqOpen, setEditReqOpen] = useState(false);
  const [cancelReqOpen, setCancelReqOpen] = useState(false);
  const [cancelVisitOpen, setCancelVisitOpen] = useState(false);
  const [assignReviewerOpen, setAssignReviewerOpen] = useState(false);
  const [signOffOpen, setSignOffOpen] = useState(false);

  // Edit / Reviewer / Sign-Off Form State
  const [editName, setEditName] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editDelivery, setEditDelivery] = useState<VisitDeliveryMethod>("In-home");
  const [editPriority, setEditPriority] = useState<PriorityLevel>("Medium");
  const [editStatus, setEditStatus] = useState<RequirementStatus>("Active");
  const [editNotes, setEditNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelVisitReason, setCancelVisitReason] = useState("");
  const [selectedReviewerId, setSelectedReviewerId] = useState("PROF-RN-01");
  const [signOffComment, setSignOffComment] = useState("");

  const reload = useCallback(() => {
    setBundle(resolveClinicalRecordByParam(visitId, queryId));
    setFollowUps(getClinicalFollowUps());
    setAuditEvents(getClinicalAuditEvents());
    setMockNotifs(getMockNotifications());
  }, [visitId, queryId]);

  useEffect(() => {
    const timer = window.setTimeout(reload, 0);
    const unsub = subscribeToClinicalSync(reload);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, [reload]);

  const { visit, requirement, documentation, review } = bundle;
  const clientRecord = useMemo(
    () => (visit ? getClientById(visit.clientId) : undefined),
    [visit]
  );

  const clinicalSigners = useMemo(
    () => CLINICAL_PROFESSIONALS.filter((p) => p.canPerformClinicalSignOff),
    []
  );

  const openEditModal = () => {
    if (!requirement) return;
    setEditName(requirement.requirementName);
    setEditDueDate(requirement.nextDueDate);
    setEditDelivery(requirement.deliveryMethod);
    setEditPriority(requirement.priority);
    setEditStatus(requirement.status);
    setEditNotes(requirement.internalNotes);
    setEditReqOpen(true);
  };

  const handleSaveEditReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement) return;
    try {
      editClinicalRequirement(
        requirement.id,
        {
          requirementName: editName.trim(),
          nextDueDate: editDueDate,
          deliveryMethod: editDelivery,
          priority: editPriority,
          status: editStatus,
          internalNotes: editNotes,
        },
        actor
      );
      toast.success("Requirement updated and audited");
      setEditReqOpen(false);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update requirement");
    }
  };

  const handleConfirmCancelReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement || !cancelReason.trim()) return;
    try {
      cancelClinicalRequirement(requirement.id, cancelReason.trim(), actor);
      toast.success(`Requirement ${requirement.id} cancelled`);
      setCancelReqOpen(false);
      setCancelReason("");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancellation failed");
    }
  };

  const handleConfirmCancelVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visit || !cancelVisitReason.trim()) return;
    try {
      cancelClinicalVisit(visit.id, cancelVisitReason.trim(), actor);
      toast.success(`Visit ${visit.id} cancelled and synced with Scheduling`);
      setCancelVisitOpen(false);
      setCancelVisitReason("");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Visit cancellation failed");
    }
  };

  const handleAssignReviewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visit || !selectedReviewerId) return;
    try {
      assignClinicalReviewer(visit.id, selectedReviewerId, actor);
      toast.success(`Clinical reviewer assigned for ${visit.id}`);
      setAssignReviewerOpen(false);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign reviewer");
    }
  };

  const handleSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visit) return;
    try {
      completeClinicalSignOff(visit.id, signOffComment, actor);
      toast.success(`Clinical sign-off completed for ${visit.id}`);
      setSignOffOpen(false);
      setSignOffComment("");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-off denied");
    }
  };

  const visitFollowUps = useMemo(
    () =>
      visit
        ? followUps.filter(
          (f) => f.visitId === visit.id || f.requirementId === visit.requirementId
        )
        : [],
    [visit, followUps]
  );

  const visitNotifications = useMemo(
    () => (visit ? mockNotifs.filter((n) => n.visitId === visit.id) : []),
    [visit, mockNotifs]
  );

  const visitAudit = useMemo(
    () =>
      visit
        ? auditEvents.filter(
          (e) =>
            e.relatedVisitId === visit.id ||
            e.entityId === visit.id ||
            e.entityId === visit.requirementId
        )
        : [],
    [visit, auditEvents]
  );

  const detailTabs: DomainTabItem<DetailSectionTab>[] = useMemo(
    () => [
      { id: "all", label: "All Sections", minWidth: 112 },
      { id: "client_req", label: "Client & Requirement", minWidth: 162 },
      { id: "visit_schedule", label: "Visit & Schedule", minWidth: 138 },
      { id: "documentation", label: "Documentation", minWidth: 130 },
      { id: "review", label: "Clinical Review", minWidth: 135 },
      {
        id: "followups",
        label: "Follow-ups",
        badge: String(visitFollowUps.length),
        minWidth: 120,
      },
      {
        id: "audit",
        label: "Audit History",
        badge: String(visitAudit.length),
        minWidth: 132,
      },
    ],
    [visitFollowUps.length, visitAudit.length]
  );

  if (!visit) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center space-y-3">
        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">
          Clinical Visit / Requirement Not Found
        </h2>
        <p className="text-xs text-slate-500">
          Record &ldquo;{queryId || visitId}&rdquo; could not be located.
        </p>
        <Link
          href="/admin/clinical/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Clinical &amp; Supervisory</span>
        </Link>
      </div>
    );
  }

  const daysLate =
    visit.visitStatus !== "Completed" && visit.visitStatus !== "Cancelled"
      ? calcDaysOverdue(visit.dueDate)
      : 0;
  const activeIssue = !visit.professionalId
    ? "No eligible professional assigned yet"
    : visit.visitStatus === "Missed" || daysLate > 0
      ? `Visit overdue / past due by ${daysLate} day(s)`
      : visit.documentationStatus === "Correction Requested"
        ? "Returned for documentation correction"
        : visit.documentationStatus === "Pending" ||
          visit.documentationStatus === "Incomplete" ||
          (visit.visitStatus === "Completed" &&
            visit.documentationStatus === "Not Started")
          ? `Documentation ${visit.documentationStatus.toLowerCase()} — awaiting evidence`
          : visit.reviewStatus === "Pending Review" ||
            visit.reviewStatus === "Under Review"
            ? `Awaiting clinical sign-off (${visit.daysPendingReview}d pending)`
            : visit.followUpRequired
              ? "Active operational follow-up / escalation required"
              : null;

  const showClientReq =
    activeDetailTab === "all" || activeDetailTab === "client_req";
  const showVisitSchedule =
    activeDetailTab === "all" || activeDetailTab === "visit_schedule";
  const showDocumentation =
    activeDetailTab === "all" || activeDetailTab === "documentation";
  const showReview = activeDetailTab === "all" || activeDetailTab === "review";
  const showFollowUps =
    activeDetailTab === "all" || activeDetailTab === "followups";
  const showAudit = activeDetailTab === "all" || activeDetailTab === "audit";

  return (
    <div className="w-full max-w-9xl mx-auto min-w-0 space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/clinical/requirements/"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Clinical &amp; Supervisory</span>
        </Link>

        <span className="text-xs font-semibold text-slate-500">
          {visit.id} · Requirement {visit.requirementId}
        </span>
      </div>

      {/* Header Identity & Actions Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                {visit.id}
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-medium">
                Req: {visit.requirementId}
              </span>
              <PriorityBadge priority={visit.priority} />
              <ClinicalVisitStatusBadge status={visit.visitStatus} />
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <div className="w-10 h-10 rounded-full bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm text-[#3D6B22] shrink-0">
                {visit.clientName
                  .split(" ")
                  .filter(Boolean)
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                  {visit.clientName}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {visit.visitType} · {visit.serviceName}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
              <span>{visit.agencyName}</span>
              <span className="text-slate-300">•</span>
              <span>{visit.programName}</span>
              <span className="text-slate-300">•</span>
              <span>
                Due: <strong className="font-mono text-slate-800">{visit.dueDate}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <DeliveryMethodBadge method={visit.deliveryMethod} />
            </div>
          </div>

          {/* 1 or 2 Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAssignOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs hover:text-slate-900 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>{visit.professionalId ? "Reassign" : "Assign Professional"}</span>
            </button>

            {visit.visitStatus !== "Completed" && visit.visitStatus !== "Cancelled" ? (
              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>{visit.scheduledDate ? "Reschedule Visit" : "Schedule Visit"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEscalateDefault(false);
                  setFollowUpOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Follow-up</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top 4-Card Status & Operational Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned Professional */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between space-y-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Assigned Professional
              </span>
              <UserCheck className="w-4 h-4 text-[#3D6B22]" />
            </div>
            <div>
              {visit.professionalName ? (
                <div className="font-bold text-sm text-slate-900 truncate">
                  {visit.professionalName}
                </div>
              ) : (
                <span className="text-xs font-bold text-[#ff6900] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 inline-block">
                  Unassigned
                </span>
              )}
              <p className="text-[11px] text-slate-500 mt-0.5">
                {visit.professionalQualification || "RN Required"} · {visit.deliveryMethod}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Staffing Status</span>
            <button
              type="button"
              onClick={() => setAssignOpen(true)}
              className="font-bold text-[#3D6B22] hover:underline cursor-pointer text-xs"
            >
              {visit.professionalId ? "Reassign" : "Assign Staff"}
            </button>
          </div>
        </div>

        {/* Card 2: Due Date & Timeliness */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between space-y-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Due Date &amp; Timeliness
              </span>
              <PriorityBadge priority={visit.priority} />
            </div>
            <div>
              <div className="text-sm font-bold font-mono text-slate-900">
                {visit.dueDate}
              </div>
              <p
                className={`text-[11px] font-semibold mt-0.5 ${
                  daysLate > 0
                    ? "text-[#c2410c] font-bold"
                    : visit.visitStatus === "Completed"
                      ? "text-slate-500"
                      : "text-[#3D6B22]"
                }`}
              >
                {daysLate > 0
                  ? `${daysLate} day(s) overdue`
                  : visit.visitStatus === "Completed"
                    ? "Visit completed"
                    : "On schedule"}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              {requirement?.frequency || "Periodic"}
            </span>
            {activeIssue && (
              <span
                className="text-amber-700 font-bold text-[11px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 max-w-[140px] truncate"
                title={activeIssue}
              >
                {activeIssue}
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Documentation Status */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between space-y-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Documentation
              </span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <DocumentationStatusBadge status={visit.documentationStatus} />
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {documentation?.documentType || "Awaiting visit submission"}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              {documentation?.attachments?.length || 0} file(s)
            </span>
            <button
              type="button"
              onClick={() => setReqDocOpen(true)}
              className="font-bold text-[#3D6B22] hover:underline cursor-pointer text-xs"
            >
              Request Docs
            </button>
          </div>
        </div>

        {/* Card 4: Clinical Review & Sign-Off */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between space-y-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Clinical Review
              </span>
              <ShieldCheck className="w-4 h-4 text-[#3D6B22]" />
            </div>
            <div>
              <ClinicalReviewStatusBadge status={visit.reviewStatus} />
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {review?.reviewerName
                  ? `Reviewer: ${review.reviewerName}`
                  : "Reviewer unassigned"}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              {visit.daysPendingReview > 0
                ? `${visit.daysPendingReview}d pending`
                : "Operational queue"}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedReviewerId(
                  review?.reviewerId || clinicalSigners[0]?.id || "PROF-RN-01"
                );
                setAssignReviewerOpen(true);
              }}
              className="font-bold text-[#3D6B22] hover:underline cursor-pointer text-xs"
            >
              {review?.reviewerName ? "Change" : "Assign Reviewer"}
            </button>
          </div>
        </div>
      </div>

      {/* Operational Attention Alert banner (if activeIssue exists) */}
      {activeIssue && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-[#ff6900] shrink-0" />
            <span>Attention Reason: {activeIssue}</span>
          </div>
          {daysLate > 0 && (
            <span className="font-mono font-bold text-[#c2410c] shrink-0">
              {daysLate}d overdue (due {visit.dueDate})
            </span>
          )}
        </div>
      )}

      {/* Detail Sections Space-Aware Overflow Tab Strip */}
      <ResponsiveDomainTabStrip
        tabs={detailTabs}
        activeTab={activeDetailTab}
        onSelectTab={setActiveDetailTab}
        ariaLabel="Clinical visit detail sections"
        moreHeading="Detail Sections"
      />

      {/* Sections A, B, C Grid */}
      {(showClientReq || showVisitSchedule) && (
        <div
          className={`grid grid-cols-1 gap-6 ${activeDetailTab === "all"
            ? "lg:grid-cols-3"
            : showClientReq && !showVisitSchedule
              ? "lg:grid-cols-2"
              : "lg:grid-cols-1"
            }`}
        >
          {/* Section A — Client Overview */}
          {showClientReq && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Section A — Client Overview
                </h2>
                <Link
                  href={`/admin/clients/${visit.clientId}/`}
                  className="text-xs font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
                >
                  <span>Client Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Client Name</dt>
                  <dd className="font-semibold text-slate-900">{visit.clientName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Client ID</dt>
                  <dd className="font-mono font-semibold text-slate-800">{visit.clientId}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Date of Birth</dt>
                  <dd className="font-mono text-slate-700">
                    {clientRecord?.dob || "Restricted"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Agency</dt>
                  <dd className="font-medium text-slate-800 text-right">{visit.agencyName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Program</dt>
                  <dd className="font-medium text-slate-800 text-right">{visit.programName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Active Service</dt>
                  <dd className="font-semibold text-slate-800 text-right">{visit.serviceName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Authorization ID</dt>
                  <dd className="font-mono text-slate-700">
                    {requirement?.authorizationId || clientRecord?.authorization?.authNumber || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Service Start Date</dt>
                  <dd className="font-mono text-slate-700">
                    {requirement?.serviceStartDate || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Assigned Caregiver</dt>
                  <dd className="font-medium text-slate-800">
                    {clientRecord?.assignedCareTeam?.primaryCaregiver?.name || "Unassigned"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Case Manager</dt>
                  <dd className="font-medium text-slate-800">
                    {clientRecord?.assignedCareTeam?.caseManager?.name || "Unassigned"}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Section B — Requirement Information */}
          {showClientReq && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Section B — Requirement Information
                  </h2>
                  <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Rule v{visit.ruleVersion}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {canEditReq && requirement && (
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs hover:text-slate-900 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-slate-500" />
                      <span>Edit</span>
                    </button>
                  )}
                  {canCancelReq && requirement && requirement.status !== "Cancelled" && (
                    <button
                      type="button"
                      onClick={() => setCancelReqOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-all cursor-pointer"
                    >
                      <XCircle className="w-3 h-3 text-rose-500" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Requirement ID</dt>
                  <dd className="font-mono font-bold text-slate-900">{visit.requirementId}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Requirement Type</dt>
                  <dd className="font-semibold text-slate-900 text-right">{visit.visitCategory}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Applicable Rule</dt>
                  <dd className="font-medium text-[#3D6B22] text-right">
                    <Link
                      href={`/admin/clinical/rules/${visit.ruleId}/`}
                      className="hover:underline"
                    >
                      {requirement?.ruleName || visit.ruleId}
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Required Professional</dt>
                  <dd className="font-semibold text-slate-800">{visit.professionalQualification}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Cadence Type</dt>
                  <dd className="text-slate-800">
                    {requirement?.isRecurring ? "Recurring" : "Initial / One-Time"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Frequency</dt>
                  <dd className="font-medium text-slate-800">{requirement?.frequency || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Last Completed</dt>
                  <dd className="font-mono text-slate-700">
                    {requirement?.lastCompletedDate || "None"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Next Due Date</dt>
                  <dd className="font-mono font-bold text-slate-900">
                    {requirement?.nextDueDate || visit.dueDate}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Delivery Method</dt>
                  <dd>
                    <DeliveryMethodBadge method={visit.deliveryMethod} />
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Section C — Visit Information */}
          {showVisitSchedule && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Section C — Visit Information
                  </h2>
                  <ClinicalVisitStatusBadge status={visit.visitStatus} />
                </div>
                <div className="flex items-center gap-1.5">
                  {visit.visitStatus !== "Completed" && visit.visitStatus !== "Cancelled" && (
                    <button
                      type="button"
                      onClick={() => setCancelVisitOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all cursor-pointer"
                    >
                      <XCircle className="w-3 h-3 text-rose-500" />
                      <span>Cancel Visit</span>
                    </button>
                  )}
                </div>
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Visit ID</dt>
                  <dd className="font-mono font-bold text-slate-900">{visit.id}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Scheduled Date</dt>
                  <dd className="font-mono font-semibold text-slate-800">
                    {visit.scheduledAt || "Not Scheduled"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Actual Visit Completed</dt>
                  <dd className="font-mono text-slate-700">
                    {visit.completedAt || "Pending Completion"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Performing Professional</dt>
                  <dd className="font-semibold text-slate-900">
                    {visit.professionalName || "Unassigned"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Delivery &amp; Location</dt>
                  <dd className="text-slate-700 text-right max-w-[200px]">
                    {visit.deliveryMethod} · {visit.locationDetails}
                  </dd>
                </div>
                <div className="flex justify-between gap-2 pt-1">
                  <dt className="text-slate-500">Linked Scheduling Record</dt>
                  <dd>
                    {visit.scheduledVisitId ? (
                      <Link
                        href={`/admin/scheduling/${visit.scheduledVisitId}/`}
                        className="font-mono font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
                      >
                        <span>{visit.scheduledVisitId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-slate-400">Not linked yet</span>
                    )}
                  </dd>
                </div>
                {visit.careNoteId && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Linked CareNote</dt>
                    <dd>
                      <Link
                        href={`/admin/care-notes/${visit.careNoteId}/`}
                        className="font-mono font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
                      >
                        <span>{visit.careNoteId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      )}

      {/* Section D & E Grid: Documentation (Read-only findings) + Clinical Review */}
      {(showDocumentation || showReview) && (
        <div
          className={`grid grid-cols-1 gap-6 ${showDocumentation && showReview ? "lg:grid-cols-12" : "lg:grid-cols-1"
            }`}
        >
          {/* Section D — Documentation */}
          {showDocumentation && (
            <div
              className={`${showReview ? "lg:col-span-7" : ""
                } bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 min-w-0`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Section D — Documentation &amp; Evidence
                  </h2>
                  <p className="text-xs text-slate-500">
                    Submitted clinical findings are immutable by Agency Admin. Missing documentation can be requested below.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <DocumentationStatusBadge status={visit.documentationStatus} />
                  <button
                    type="button"
                    onClick={() => setReqDocOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-800 cursor-pointer"
                  >
                    <FileWarning className="w-3.5 h-3.5" />
                    <span>Request Docs</span>
                  </button>
                </div>
              </div>

              {!documentation ? (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    No visit documentation submitted yet.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Once the assigned clinician completes the visit and submits documentation, operational completeness and attachments appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Document Type
                      </span>
                      <span className="font-semibold text-slate-900">
                        {documentation.documentType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Submitted By
                      </span>
                      <span className="font-semibold text-slate-900">
                        {documentation.submittedBy || "Pending"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Timestamp
                      </span>
                      <span className="font-mono text-slate-700">
                        {documentation.submittedAt || "Not Submitted"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Version
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        v{documentation.version}
                      </span>
                    </div>
                  </div>

                  {documentation.missingItems.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200 text-xs text-orange-950 space-y-1">
                      <div className="font-bold text-[#c2410c]">Missing Required Evidence:</div>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {documentation.missingItems.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Read-Only Clinical Assessment Sections */}
                  <div className="space-y-2.5">
                    {documentation.sections.map((sec) => (
                      <div
                        key={sec.key}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {sec.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Read-Only ({sec.status})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {sec.contentReadOnly}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Attachments */}
                  {documentation.attachments.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Supporting Attachments
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {documentation.attachments.map((att) => (
                          <span
                            key={att.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-[#3D6B22]" />
                            <span>{att.name}</span>
                            <span className="text-slate-400 text-[11px]">({att.fileSize})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section E — Clinical Review */}
          {showReview && (
            <div
              className={`${showDocumentation ? "lg:col-span-5" : ""
                } bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 min-w-0`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Section E — Clinical Review &amp; Sign-Off
                </h2>
                <div className="flex items-center gap-2">
                  <ClinicalReviewStatusBadge status={visit.reviewStatus} />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReviewerId(
                        review?.reviewerId || clinicalSigners[0]?.id || "PROF-RN-01"
                      );
                      setAssignReviewerOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
                  >
                    <UserCheck className="w-3 h-3 text-[#3D6B22]" />
                    <span>{review?.reviewerName ? "Change Reviewer" : "Assign Reviewer"}</span>
                  </button>
                </div>
              </div>

              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Assigned Reviewer</dt>
                  <dd className="font-semibold text-slate-900">
                    {review?.reviewerName || "Unassigned"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Days Pending Review</dt>
                  <dd
                    className={`font-mono font-bold ${visit.daysPendingReview >= 5
                      ? "text-[#ff6900]"
                      : visit.daysPendingReview > 0
                        ? "text-amber-700"
                        : "text-slate-600"
                      }`}
                  >
                    {visit.daysPendingReview} day(s)
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Review Date</dt>
                  <dd className="font-mono text-slate-700">
                    {review?.reviewedAt || "Pending"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Professional Sign-Off</dt>
                  <dd className="font-mono font-semibold text-slate-800">
                    {review?.signOffTimestamp || "Awaiting Authorised RN"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Follow-up Required</dt>
                  <dd className="font-semibold text-slate-800">
                    {visit.followUpRequired ? "Yes" : "No"}
                  </dd>
                </div>
              </dl>

              {review?.comments && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Reviewer Notes
                  </span>
                  {review.comments}
                </div>
              )}

              {review?.outstandingIssues && review.outstandingIssues.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 space-y-1">
                  <span className="font-bold">Outstanding Issues:</span>
                  <ul className="list-disc pl-5">
                    {review.outstandingIssues.map((iss, idx) => (
                      <li key={idx}>{iss}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Governance Lock for Sign-Off */}
              {canSignOff ? (
                <button
                  type="button"
                  onClick={() => setSignOffOpen(true)}
                  disabled={visit.reviewStatus === "Approved"}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {visit.reviewStatus === "Approved"
                      ? "Clinical Sign-Off Completed"
                      : "Complete Authorised Clinical Sign-Off"}
                  </span>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Clinical Sign-Off Restricted
                    </span>
                    Only authorised RN / Clinical Supervisor roles can sign off or modify clinical assessments. Agency Admin tracks status and escalations.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section F — History, Activity & Follow-ups */}
      {(showAudit || showFollowUps) && (
        <div
          className={`grid grid-cols-1 gap-6 ${showAudit && showFollowUps ? "lg:grid-cols-2" : "lg:grid-cols-1"
            }`}
        >
          {showAudit && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#3D6B22]" />
                  <span>Section F — History &amp; Activity</span>
                </h2>
                <span className="text-[11px] font-semibold text-slate-400">
                  {visitAudit.length} events
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto thin-scrollbar">
                {visitAudit.map((evt) => {
                  const isHighlighted = highlightedEventId === evt.id;
                  return (
                    <div
                      key={evt.id}
                      className={`p-3.5 rounded-xl border space-y-1 text-xs transition-all ${isHighlighted
                        ? "border-[#3D6B22] bg-emerald-50/40 ring-2 ring-[#3D6B22]/20"
                        : "border-slate-100 bg-slate-50/60"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[#3D6B22] text-[11px]">
                          {evt.id} · {evt.action.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {evt.timestamp}
                        </span>
                      </div>
                      <div className="text-slate-700 font-medium">
                        {evt.previousValue} → <strong>{evt.newValue}</strong>
                      </div>
                      <p className="text-[11px] text-slate-500">{evt.reason}</p>
                      <div className="text-[10px] text-slate-400">
                        {evt.performedBy} ({evt.performedByRole})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showFollowUps && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Operational Follow-up Tasks &amp; Reminders
                </h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEscalateDefault(false);
                      setFollowUpOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3D6B22]/10 hover:bg-[#3D6B22]/20 text-[#3D6B22] text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Follow-up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEscalateDefault(true);
                      setFollowUpOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#c2410c] border border-orange-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Escalate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-500" />
                    <span>Remind</span>
                  </button>
                </div>
              </div>

              {visitFollowUps.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No operational follow-up tasks created for this visit.
                </p>
              ) : (
                <div className="space-y-3">
                  {visitFollowUps.map((fu) => (
                    <div
                      key={fu.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {fu.followUpType} ({fu.status})
                        </span>
                        <PriorityBadge priority={fu.priority} />
                      </div>
                      <p className="text-slate-600">{fu.description}</p>
                      <div className="flex items-center justify-between pt-1.5 text-[11px] text-slate-500">
                        <span>
                          Owner: <strong>{fu.assignedToName}</strong> · Due {fu.dueDate}
                        </span>
                        {fu.status !== "Completed" && (
                          <button
                            type="button"
                            onClick={() => {
                              completeClinicalFollowUp(fu.id, actor);
                              toast.success("Follow-up completed");
                              reload();
                            }}
                            className="font-bold text-[#3D6B22] hover:underline cursor-pointer"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {visitNotifications.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Simulated Operational Reminders Sent</span>
                    <span>{visitNotifications.length} logged</span>
                  </div>
                  <div className="space-y-2">
                    {visitNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1"
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-bold text-slate-800">{n.recipientName}</span>
                          <span className="font-mono text-[10px] text-slate-400">{n.sentAt}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Requirement Modal */}
      <Modal
        isOpen={editReqOpen}
        onClose={() => setEditReqOpen(false)}
        title="Edit Visit Requirement"
        description={requirement ? `${requirement.id} · ${requirement.clientName}` : undefined}
        icon={<Edit3 className="w-5 h-5" />}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEditReq} className="space-y-4">
          <div>
            <FormLabel required>Requirement Name</FormLabel>
            <FormInput
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <FormLabel required>Next Due Date</FormLabel>
              <FormInput
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                required
              />
            </div>
            <div>
              <FormLabel required>Delivery Method</FormLabel>
              <FormSelect
                value={editDelivery}
                onChange={(e) => setEditDelivery(e.target.value as VisitDeliveryMethod)}
              >
                <option value="In-home">In-home</option>
                <option value="Virtual">Virtual</option>
                <option value="Other approved method">Other approved method</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel required>Priority</FormLabel>
              <FormSelect
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel required>Requirement Status</FormLabel>
              <FormSelect
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as RequirementStatus)}
              >
                <option value="Active">Active</option>
                <option value="Pending Assignment">Pending Assignment</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Overdue">Overdue</option>
                <option value="On Hold">On Hold</option>
              </FormSelect>
            </div>
          </div>
          <div>
            <FormLabel>Internal Operational Notes</FormLabel>
            <FormTextarea
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setEditReqOpen(false)} />
            <FormButtonPrimary type="submit">Save Changes</FormButtonPrimary>
          </div>
        </form>
      </Modal>

      {/* Cancel Scheduled Visit Modal */}
      <Modal
        isOpen={cancelVisitOpen}
        onClose={() => setCancelVisitOpen(false)}
        title="Cancel Scheduled Visit"
        description={`${visit.id} · ${visit.clientName}`}
        icon={<XCircle className="w-5 h-5" />}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmCancelVisit} className="space-y-4">
          <div>
            <FormLabel required>Visit Cancellation Reason (Audited &amp; Synced)</FormLabel>
            <FormTextarea
              rows={3}
              value={cancelVisitReason}
              onChange={(e) => setCancelVisitReason(e.target.value)}
              placeholder="Document operational reason for cancelling this visit..."
              required
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setCancelVisitOpen(false)} />
            <FormButtonPrimary type="submit">Confirm Visit Cancellation</FormButtonPrimary>
          </div>
        </form>
      </Modal>

      {/* Cancel Requirement Modal */}
      <Modal
        isOpen={cancelReqOpen}
        onClose={() => setCancelReqOpen(false)}
        title="Cancel Clinical Requirement"
        description={requirement ? `${requirement.id} · ${requirement.clientName}` : undefined}
        icon={<XCircle className="w-5 h-5" />}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmCancelReq} className="space-y-4">
          <div>
            <FormLabel required>Cancellation Reason (Audited)</FormLabel>
            <FormTextarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              required
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setCancelReqOpen(false)} />
            <FormButtonPrimary type="submit">Confirm Cancellation</FormButtonPrimary>
          </div>
        </form>
      </Modal>

      {/* Assign Clinical Reviewer Modal */}
      <Modal
        isOpen={assignReviewerOpen}
        onClose={() => setAssignReviewerOpen(false)}
        title="Assign Eligible Clinical Reviewer"
        description={`${visit.id} • ${visit.clientName}`}
        icon={<UserCheck className="w-5 h-5" />}
        maxWidth="md"
      >
        <form onSubmit={handleAssignReviewer} className="space-y-4">
          <div>
            <FormLabel required>Authorised Reviewer (RN / Clinical Supervisor)</FormLabel>
            <FormSelect
              value={selectedReviewerId}
              onChange={(e) => setSelectedReviewerId(e.target.value)}
              required
            >
              {clinicalSigners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.roleTitle} ({p.licenseNumber})
                </option>
              ))}
            </FormSelect>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setAssignReviewerOpen(false)} />
            <FormButtonPrimary type="submit">Assign Reviewer</FormButtonPrimary>
          </div>
        </form>
      </Modal>

      {/* Authorised RN Sign-off Modal */}
      <Modal
        isOpen={signOffOpen}
        onClose={() => setSignOffOpen(false)}
        title="Authorised Clinical Sign-Off"
        icon={<ShieldCheck className="w-5 h-5" />}
        maxWidth="md"
      >
        <form onSubmit={handleSignOff} className="space-y-4">
          <div>
            <FormLabel>Clinical Review Findings &amp; Sign-Off Note</FormLabel>
            <FormTextarea
              rows={3}
              value={signOffComment}
              onChange={(e) => setSignOffComment(e.target.value)}
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setSignOffOpen(false)} />
            <FormButtonPrimary type="submit">Sign Off Record</FormButtonPrimary>
          </div>
        </form>
      </Modal>

      <AssignProfessionalModal
        visit={assignOpen ? visit : null}
        actor={actor}
        onClose={() => setAssignOpen(false)}
        onSuccess={reload}
      />
      <ScheduleClinicalVisitModal
        visit={scheduleOpen ? visit : null}
        actor={actor}
        onClose={() => setScheduleOpen(false)}
        onSuccess={reload}
      />
      <CreateFollowUpModal
        visit={followUpOpen ? visit : null}
        actor={actor}
        defaultEscalate={escalateDefault}
        onClose={() => setFollowUpOpen(false)}
        onSuccess={reload}
      />
      <RequestDocumentationModal
        visit={reqDocOpen ? visit : null}
        actor={actor}
        onClose={() => setReqDocOpen(false)}
        onSuccess={reload}
      />
      <SendMockReminderModal
        visit={reminderOpen ? visit : null}
        actor={actor}
        onClose={() => setReminderOpen(false)}
        onSuccess={reload}
      />
    </div>
  );
}
