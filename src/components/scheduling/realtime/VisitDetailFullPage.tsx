"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Send,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Home,
  Lock,
  ExternalLink,
  Trash2,
  History,
  FileText,
  Radio,
  Edit3,
  RefreshCw,
  ChevronDown,
  DollarSign,
  ClipboardList,
  Navigation,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  RealTimeVisit,
  VisitStatus,
  CareNoteStatus,
  CaregiverMatchScore,
  VisitBroadcastRecord,
} from "@/types/scheduling";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import { Household } from "@/lib/households/mockData";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import {
  getVisitsFromStorage,
  saveVisitsToStorage,
  getVisitById,
  getSyncedSchedulingContext,
  subscribeToSchedulingSync,
  calculateDurationHours,
  formatCompactTime,
  ALL_VISIT_STATUSES,
  getRecommendedCaregivers,
  computeVisitConflicts,
  createBroadcastRecord,
} from "@/lib/scheduling/schedulingStore";
import { VISIT_STATUS_PALETTE } from "./statusPalette";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";
import {
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonSecondary,
} from "@/components/ui/FormControls";
import { Modal } from "@/components/ui/Modal";
import { SendToCaregiversModal } from "./SendToCaregiversModal";
import { VisitDetailsTab } from "./VisitDetailsTab";

type VisitFullTab =
  | "details"
  | "matching"
  | "care-plan"
  | "evv"
  | "financial"
  | "household"
  | "memo"
  | "audit";

const VISIT_TABS: DomainTabItem<VisitFullTab>[] = [
  { id: "details", label: "VISIT DETAILS", minWidth: 120 },
  { id: "matching", label: "CAREGIVER MATCHING", minWidth: 162 },
  { id: "care-plan", label: "CARE PLAN & ADLS", minWidth: 146 },
  { id: "evv", label: "EVV & TELEMETRY", minWidth: 140 },
  { id: "financial", label: "FINANCIAL & AUTH", minWidth: 144 },
  { id: "household", label: "HOUSEHOLD JOURNEY", minWidth: 164 },
  { id: "memo", label: "MEMO & CARE NOTES", minWidth: 152 },
  { id: "audit", label: "AUDIT & HISTORY", minWidth: 138 },
];

const CARD_CLASS =
  "bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.replace(/^The\s+/i, "").slice(0, 2).toUpperCase();
}

interface VisitDetailFullPageProps {
  visitId: string;
  portal: "admin" | "intake";
  initialEditMode?: boolean;
}

export function VisitDetailFullPage({
  visitId,
  portal,
  initialEditMode = false,
}: VisitDetailFullPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const perms = usePortalPermissions(portal);
  const canViewFinancials = perms.isAdmin;
  const canEditFinancials = perms.isAdmin;
  const canDelete = perms.isAdmin;
  const baseBackHref = `/${portal}/scheduling/`;

  const [isMounted, setIsMounted] = useState(false);
  const [allVisits, setAllVisits] = useState<RealTimeVisit[]>([]);
  const [visit, setVisit] = useState<RealTimeVisit | null>(null);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverRecord[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [activeTab, setActiveTab] = useState<VisitFullTab>(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const match = VISIT_TABS.find(
        (t) =>
          t.id === tabParam.toLowerCase() ||
          t.label.toLowerCase() === tabParam.toLowerCase()
      );
      if (match) return match.id;
    }
    return "details";
  });
  const [isEditingDetails, setIsEditingDetails] = useState(
    () => initialEditMode || searchParams.get("mode") === "edit"
  );
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Tab-local drafts for Financial & Memo tabs so edits are explicit & clean
  const [finDraft, setFinDraft] = useState({
    billRate: 0,
    payRate: 0,
    billableHours: 0,
    payableHours: 0,
  });
  const [memoDraft, setMemoDraft] = useState({
    careNoteStatus: "Pending" as CareNoteStatus,
    memo: "",
    internalNotes: "",
  });

  useEffect(() => {
    const load = () => {
      setIsMounted(true);
      const ctx = getSyncedSchedulingContext();
      setClients(ctx.clients);
      setCaregivers(ctx.caregivers);
      setHouseholds(ctx.households);
      const stored = getVisitsFromStorage();
      setAllVisits(stored);
      const found = getVisitById(visitId);
      if (found) {
        const enriched = {
          ...found,
          conflicts: computeVisitConflicts(found, stored),
        };
        setVisit(enriched);
        setFinDraft({
          billRate: enriched.billRate,
          payRate: enriched.payRate,
          billableHours: enriched.billableHours,
          payableHours: enriched.payableHours,
        });
        setMemoDraft({
          careNoteStatus: enriched.careNoteStatus,
          memo: enriched.memo,
          internalNotes: enriched.internalNotes,
        });
      }
    };
    queueMicrotask(load);
    const unsub = subscribeToSchedulingSync(load);
    return unsub;
  }, [visitId]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const modeParam = searchParams.get("mode");
    queueMicrotask(() => {
      if (tabParam) {
        const match = VISIT_TABS.find(
          (t) =>
            t.id === tabParam.toLowerCase() ||
            t.label.toLowerCase() === tabParam.toLowerCase()
        );
        if (match) setActiveTab(match.id);
      }
      if (modeParam === "edit" || initialEditMode) {
        setIsEditingDetails(true);
        setActiveTab("details");
      }
    });
  }, [searchParams, initialEditMode]);

  const liveDuration = useMemo(
    () => (visit ? calculateDurationHours(visit.startTime, visit.endTime) : 0),
    [visit]
  );

  const linkedClient = useMemo(
    () => (visit ? clients.find((c) => c.id === visit.clientId) : undefined),
    [clients, visit]
  );

  const linkedHousehold = useMemo(
    () =>
      visit
        ? households.find(
          (h) => h.id === visit.householdId || h.client.id === visit.clientId
        )
        : undefined,
    [households, visit]
  );

  const rankedMatches = useMemo(() => {
    if (!visit) return [];
    return getRecommendedCaregivers(visit, caregivers, allVisits, clients);
  }, [visit, caregivers, allVisits, clients]);

  const persistFullVisit = (nextVisit: RealTimeVisit, actionLabel: string) => {
    const now = new Date();
    const auditEntry = {
      id: `aud-${now.getTime()}`,
      timestamp: now.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      actor: perms.actorName,
      actorRole: perms.roleLabel,
      action: actionLabel,
      reason: nextVisit.modificationReason,
      details: `${nextVisit.date} ${nextVisit.startTime}–${nextVisit.endTime} · Status: ${nextVisit.status} · Caregiver: ${nextVisit.caregiverName || "Unassigned"}`,
    };
    const finalRecord: RealTimeVisit = {
      ...nextVisit,
      auditTrail: [auditEntry, ...(nextVisit.auditTrail || [])],
    };
    const exists = allVisits.some((v) => v.id === finalRecord.id);
    const updatedList = exists
      ? allVisits.map((v) => (v.id === finalRecord.id ? finalRecord : v))
      : [finalRecord, ...allVisits];
    const withConflicts = updatedList.map((v) => ({
      ...v,
      conflicts: computeVisitConflicts(v, updatedList),
    }));
    saveVisitsToStorage(withConflicts);
    setAllVisits(withConflicts);
    const synced =
      withConflicts.find((v) => v.id === finalRecord.id) || finalRecord;
    setVisit(synced);
    setFinDraft({
      billRate: synced.billRate,
      payRate: synced.payRate,
      billableHours: synced.billableHours,
      payableHours: synced.payableHours,
    });
    setMemoDraft({
      careNoteStatus: synced.careNoteStatus,
      memo: synced.memo,
      internalNotes: synced.internalNotes,
    });
    toast.success(`Saved ${finalRecord.id} across Real-Time Scheduling`);
  };

  const handleStatusChange = (nextStatus: VisitStatus) => {
    if (!visit) return;
    setIsStatusDropdownOpen(false);
    const next: RealTimeVisit = {
      ...visit,
      status: nextStatus,
      isModifiedFromSchedule: true,
      modificationReason: visit.modificationReason || "Status Updated by Coordinator",
    };
    persistFullVisit(next, `Status Changed to ${nextStatus}`);
  };

  const handleAssignMatch = (match: CaregiverMatchScore) => {
    if (!visit) return;
    const next: RealTimeVisit = {
      ...visit,
      caregiverId: match.caregiverId,
      caregiverName: match.caregiverName,
      caregiverAdmin: "Dana Jenkins, MSW",
      caregiverClass: `${match.type} (${match.employmentClassification})`,
      caregiverRegion: match.region,
      status: "Scheduled",
      isModifiedFromSchedule: true,
      modificationReason: "Matched via Smart Recommender",
      travelMinutes: match.travelMinutes,
      distanceMiles: match.distanceMiles,
    };
    persistFullVisit(next, `Caregiver Matched (${match.overallScore}%)`);
  };

  const handleSendBroadcast = (
    _visitId: string,
    caregiverIds: string[],
    caregiverNames: string[],
    channel: VisitBroadcastRecord["channel"],
    urgency: VisitBroadcastRecord["urgency"],
    message: string
  ) => {
    if (!visit) return;
    const rec = createBroadcastRecord(
      caregiverIds,
      caregiverNames,
      perms.actorName,
      channel,
      urgency,
      message
    );
    const next: RealTimeVisit = {
      ...visit,
      broadcasts: [rec, ...(visit.broadcasts || [])],
    };
    persistFullVisit(next, `Broadcast Sent (${channel})`);
  };

  const handleDeleteOrRemove = () => {
    if (!visit) return;
    if (canDelete) {
      const next = allVisits.filter((v) => v.id !== visit.id);
      saveVisitsToStorage(next);
      setIsDeleteModalOpen(false);
      toast.success(`Visit ${visit.id} permanently deleted.`);
      router.push(baseBackHref);
    } else {
      const next: RealTimeVisit = {
        ...visit,
        isRemoved: true,
        isModifiedFromSchedule: true,
        modificationReason: "Removed by Intake Coordinator",
      };
      persistFullVisit(next, "Marked Removed");
      setIsDeleteModalOpen(false);
      router.push(baseBackHref);
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full max-w-9xl mx-auto py-16 text-center text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">
          Loading Visit Workspace...
        </p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="w-full max-w-9xl mx-auto py-16 text-center text-slate-500">
        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">
          Visit Record Not Found
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Visit ID &quot;{visitId}&quot; could not be located in the scheduling
          store.
        </p>
        <Link
          href={baseBackHref}
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3D6B22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Real-Time Scheduling</span>
        </Link>
      </div>
    );
  }

  const pal = VISIT_STATUS_PALETTE[visit.status];
  const initials = getInitials(visit.clientName);

  return (
    <div className="w-full max-w-9xl mx-auto space-y-5 pb-16 animate-in fade-in duration-200">
      {/* =========================================================================
          01. BACK NAVIGATION LINK (Matches Client, Caregiver & Referral Details)
         ========================================================================= */}
      <div>
        <Link
          href={baseBackHref}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Real-Time Scheduling</span>
        </Link>
      </div>

      {/* =========================================================================
          02. HERO IDENTITY CARD (Matched to Caregiver & Referral Hero Cards)
         ========================================================================= */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Avatar Box with Initials & Visit Status Overlay */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/20 flex items-center justify-center text-xl font-bold">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs border-2 border-white ${pal.legendActiveBg} ${pal.legendActiveText}`}
              >
                {visit.status}
              </span>
            </div>
          </div>

          {/* Heading & Concise Metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                {visit.clientName}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                {visit.id} · {visit.shiftNumber}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-2.5 flex-wrap text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#3D6B22] border border-emerald-200/80">
                {visit.serviceCode} · {visit.serviceName}
              </span>
              {visit.visitCategory === "Clinical & Supervisory" && (
                <Link
                  href={visit.clinicalVisitId ? `/admin/clinical/${visit.clinicalVisitId}/` : "/admin/clinical/"}
                  className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <span>Clinical & Supervisory Record</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500">
                {visit.householdName}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 border-t xl:border-t-0 pt-3.5 xl:pt-0 border-slate-100">
          {/* Status Quick Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsMoreOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>{visit.status}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                  Update Status
                </div>
                {ALL_VISIT_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${visit.status === st
                      ? "font-semibold text-[#3D6B22] bg-emerald-50/50"
                      : "text-slate-800"
                      }`}
                  >
                    <span>{st}</span>
                    {visit.status === st && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action: Edit Visit (Standardized to LiliSare detail pages) */}
          <Link
            href={`/${portal}/scheduling/${visit.id}/edit/`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4 text-emerald-100" />
            <span>Edit Visit</span>
          </Link>

          {/* More Actions Dropdown (Maintains clean hero bar while retaining quick access) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMoreOpen(!isMoreOpen);
                setIsStatusDropdownOpen(false);
              }}
              className="inline-flex items-center justify-center p-2.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="More actions"
              aria-label="More actions"
            >
              <MoreVertical className="w-4 h-4 text-slate-600" />
            </button>

            {isMoreOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    setActiveTab("matching");
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-[#3D6B22] cursor-pointer font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>Recommend Caregiver</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsBroadcastOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-[#3D6B22] cursor-pointer font-medium"
                >
                  <Send className="w-3.5 h-3.5 text-slate-400" />
                  <span>Send to Caregivers</span>
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{canDelete ? "Delete Visit" : "Remove Visit"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          03. SPACE-AWARE RESPONSIVE TAB NAVIGATION STRIP
         ========================================================================= */}
      <ResponsiveDomainTabStrip
        tabs={VISIT_TABS}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        ariaLabel="Visit workspace domains"
      />

      {/* =========================================================================
          04. DEDICATED DOMAIN VIEWS (8 Complete Modular Tabs)
         ========================================================================= */}

      {/* 1. VISIT DETAILS (Master Visit Record View/Edit Switcher + 2x2 Cards) */}
      {activeTab === "details" && (
        <VisitDetailsTab
          visit={visit}
          portal={portal}
          clients={clients}
          caregivers={caregivers}
          households={households}
          canViewFinancials={canViewFinancials}
          canEditFinancials={canEditFinancials}
          isEditing={isEditingDetails}
          onToggleEdit={setIsEditingDetails}
          onSaveVisit={persistFullVisit}
          onOpenMatching={() => setActiveTab("matching")}
          onOpenBroadcast={() => setIsBroadcastOpen(true)}
        />
      )}

      {/* 2. CAREGIVER MATCHING */}
      {activeTab === "matching" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Smart Caregiver Recommender
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Ranked by availability, travel distance, clinical skill match, and weekly hours headroom for {visit.clientName}.
                </p>
              </div>
            </div>
            <FormButtonPrimary onClick={() => setIsBroadcastOpen(true)}>
              <Radio className="w-4 h-4" />
              <span>Broadcast Shift Offer</span>
            </FormButtonPrimary>
          </div>

          <div className="space-y-3">
            {rankedMatches.map((m, idx) => (
              <div
                key={m.caregiverId}
                className={`${CARD_CLASS} flex flex-col md:flex-row md:items-center justify-between gap-4 ${visit.caregiverId === m.caregiverId
                  ? "bg-[#F2F8EE]/60 border-[#3D6B22]"
                  : ""
                  }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-400">
                      #{idx + 1}
                    </span>
                    <Link
                      href={`/${portal}/caregivers/${m.caregiverId}/`}
                      className="text-sm font-bold text-slate-900 hover:text-[#3D6B22] hover:underline"
                    >
                      {m.caregiverName}
                    </Link>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {m.type} · {m.employmentClassification}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#3D6B22] text-white">
                      {m.overallScore}% Match
                    </span>
                    {visit.caregiverId === m.caregiverId && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#1E5622]">
                        Currently Assigned
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span>
                      Distance: <strong className="text-slate-900">{m.distanceMiles} mi</strong> ({m.travelMinutes}m)
                    </span>
                    <span>
                      Weekly Hours: <strong className="text-slate-900">{m.scheduledHoursThisWeek}</strong> /{" "}
                      {m.weeklyCapacityHours}h
                    </span>
                    <span>
                      Skills Match: <strong className="text-slate-900">{m.skillMatchScore}%</strong>
                    </span>
                    <span>
                      Availability: <strong className="text-slate-900">{m.availabilityScore}%</strong>
                    </span>
                  </div>

                  {m.hasConflict && m.conflictReason && (
                    <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg w-fit inline-flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{m.conflictReason}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!m.isActivated || visit.caregiverId === m.caregiverId}
                  onClick={() => handleAssignMatch(m)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${!m.isActivated
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : visit.caregiverId === m.caregiverId
                      ? "bg-emerald-100 text-[#1E5622] cursor-default"
                      : "bg-[#3D6B22] hover:bg-[#345C1D] text-white shadow-sm"
                    }`}
                >
                  {visit.caregiverId === m.caregiverId
                    ? "Assigned"
                    : m.isActivated
                      ? "Assign to Visit"
                      : "Pending Clearance"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CARE PLAN & ADLS */}
      {activeTab === "care-plan" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Synchronized Client Care Plan &amp; Visit ADL Tasks
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Pulled directly from {visit.clientName}&apos;s active clinical care plan.
                </p>
              </div>
            </div>
            <Link
              href={`/${portal}/clients/${visit.clientId}/?tab=plan-of-care`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 rounded-xl transition-colors w-fit"
            >
              <span>Open Full Client Care Plan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                  <span>Clinical Program &amp; Precautions</span>
                </h3>
              </div>

              {linkedClient?.carePlan ? (
                <div className="space-y-3.5">
                  <div className="rounded-xl p-4 bg-[#F2F8EE]/60 border border-[#C7E4B3] space-y-1.5">
                    <div className="text-[11px] font-bold text-[#3D6B22] uppercase tracking-wider">
                      Program &amp; Frequency
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {linkedClient.carePlan.program}
                    </div>
                    <div className="text-xs text-slate-600">
                      {linkedClient.carePlan.frequency}
                    </div>
                  </div>

                  {linkedClient.carePlan.specialInstructions && (
                    <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-800">
                        Special Instructions
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {linkedClient.carePlan.specialInstructions}
                      </p>
                    </div>
                  )}

                  {linkedClient.carePlan.allergies &&
                    linkedClient.carePlan.allergies.length > 0 && (
                      <div className="rounded-xl p-4 bg-rose-50 border border-rose-200 text-xs space-y-1">
                        <div className="font-bold text-rose-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Allergies &amp; Safety Precautions</span>
                        </div>
                        <p className="text-rose-700 font-semibold">
                          {linkedClient.carePlan.allergies.join(" · ")}
                        </p>
                      </div>
                    )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Care plan details will populate once clinical assessment is completed.
                </p>
              )}
            </div>

            <div className={CARD_CLASS}>
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                  <span>Required ADL &amp; Task Checklist</span>
                </h3>
              </div>

              {linkedClient?.carePlan ? (
                <div className="space-y-2.5">
                  {(
                    linkedClient.carePlan.adlSupportNeeds ||
                    linkedClient.carePlan.approvedServices
                  ).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#3D6B22] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No ADL support tasks linked yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. EVV & TELEMETRY */}
      {activeTab === "evv" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Electronic Visit Verification (EVV) &amp; GPS Telemetry
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Real-time clock-in/out compliance, travel distance, and geo-fence verification.
                </p>
              </div>
            </div>
            <Link
              href={`/admin/evv-visits/${visit.id}/`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-xs transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Open in EVV Workspace</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={CARD_CLASS}>
              <div className="text-xs font-semibold text-slate-500">EVV Status</div>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {visit.evvStatus}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Geo-fence verification state
              </div>
            </div>
            <div className={CARD_CLASS}>
              <div className="text-xs font-semibold text-slate-500">
                Clock-In Actual
              </div>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {visit.clockInActual || "Pending"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Scheduled: {formatCompactTime(visit.startTime)}
              </div>
            </div>
            <div className={CARD_CLASS}>
              <div className="text-xs font-semibold text-slate-500">
                Clock-Out Actual
              </div>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {visit.clockOutActual || "Pending"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Scheduled: {formatCompactTime(visit.endTime)}
              </div>
            </div>
            <div className={CARD_CLASS}>
              <div className="text-xs font-semibold text-slate-500">
                Travel / Distance
              </div>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {visit.travelMinutes}m · {visit.distanceMiles} mi
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Estimated transit buffer
              </div>
            </div>
          </div>

          <div className={CARD_CLASS}>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Verified Service Address &amp; Location Boundaries</span>
              </h3>
            </div>
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex justify-between items-center py-1">
                <span className="text-[13px] font-medium text-slate-500">
                  Service Address
                </span>
                <span className="text-sm font-bold text-slate-900 inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#3D6B22]" />
                  {visit.address}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-[13px] font-medium text-slate-500">
                  Clock-In Rule
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {visit.clockInLocation}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-[13px] font-medium text-slate-500">
                  Clock-Out Rule
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {visit.clockOutLocation}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FINANCIAL & AUTH */}
      {activeTab === "financial" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Authorization &amp; Financial Reconciliation
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Medicaid/Payer authorization limits and Agency Admin billable/payable ledger.
                </p>
              </div>
            </div>
            {canEditFinancials && (
              <FormButtonPrimary
                onClick={() =>
                  persistFullVisit(
                    {
                      ...visit,
                      billRate: finDraft.billRate,
                      payRate: finDraft.payRate,
                      billableHours: finDraft.billableHours,
                      payableHours: finDraft.payableHours,
                      isModifiedFromSchedule: true,
                    },
                    "Financial Rates Updated"
                  )
                }
              >
                <Save className="w-4 h-4" />
                <span>Save Financial Rates</span>
              </FormButtonPrimary>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={CARD_CLASS}>
              <div className="text-xs font-semibold text-slate-500">
                Authorization #
              </div>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {visit.authorizationNumber}
              </div>
            </div>
            <div className={CARD_CLASS}>
              <div className="text-xs font-semibold text-slate-500">
                Weekly Authorized Cap
              </div>
              <div className="text-xl font-bold text-[#3D6B22] mt-2">
                {visit.authorizedWeeklyCap} hrs/week
              </div>
            </div>
            <div className={CARD_CLASS}>
              <div className="text-xs font-semibold text-slate-500">
                Scheduled Visit Hours
              </div>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {liveDuration} hrs
              </div>
            </div>
          </div>

          {canViewFinancials ? (
            <div className={`${CARD_CLASS} space-y-5`}>
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                  <span>Billable &amp; Payable Rate Controls</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <FormLabel htmlFor="full-bill-rate">Bill Rate ($/hr)</FormLabel>
                  <FormInput
                    id="full-bill-rate"
                    type="number"
                    step="0.5"
                    disabled={!canEditFinancials}
                    value={finDraft.billRate}
                    onChange={(e) =>
                      setFinDraft({
                        ...finDraft,
                        billRate: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <FormLabel htmlFor="full-pay-rate">Pay Rate ($/hr)</FormLabel>
                  <FormInput
                    id="full-pay-rate"
                    type="number"
                    step="0.5"
                    disabled={!canEditFinancials}
                    value={finDraft.payRate}
                    onChange={(e) =>
                      setFinDraft({
                        ...finDraft,
                        payRate: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <FormLabel htmlFor="full-bill-hrs">Billable Hours</FormLabel>
                  <FormInput
                    id="full-bill-hrs"
                    type="number"
                    step="0.25"
                    disabled={!canEditFinancials}
                    value={finDraft.billableHours}
                    onChange={(e) =>
                      setFinDraft({
                        ...finDraft,
                        billableHours: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <FormLabel htmlFor="full-pay-hrs">Payable Hours</FormLabel>
                  <FormInput
                    id="full-pay-hrs"
                    type="number"
                    step="0.25"
                    disabled={!canEditFinancials}
                    value={finDraft.payableHours}
                    onChange={(e) =>
                      setFinDraft({
                        ...finDraft,
                        payableHours: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="rounded-xl p-4 bg-[#F2F8EE] border border-[#C7E4B3] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Estimated Billable Revenue
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    ${(finDraft.billRate * finDraft.billableHours).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Estimated Caregiver Payroll
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    ${(finDraft.payRate * finDraft.payableHours).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#1E5622] uppercase">
                    Net Visit Margin
                  </div>
                  <div className="text-xl font-black text-[#3D6B22]">
                    $
                    {(
                      finDraft.billRate * finDraft.billableHours -
                      finDraft.payRate * finDraft.payableHours
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-5 bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-slate-900">
                  Financial Rates &amp; Margin Restricted to Agency Admin
                </div>
                <p>
                  Intake Coordinators have full operational visibility into
                  authorization caps and scheduled hours, while billing rates,
                  payroll cost, and revenue margins remain restricted under
                  LiliSare RBAC.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. HOUSEHOLD JOURNEY */}
      {activeTab === "household" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Connected Three Journeys · {visit.householdName}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Synchronized Client, Caregiver, and Agency Operations journey status for this household.
                </p>
              </div>
            </div>
            {linkedHousehold && (
              <Link
                href={`/${portal}/households/${linkedHousehold.id}/`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 rounded-xl transition-colors w-fit"
              >
                <span>Open Household Record</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {linkedHousehold ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={CARD_CLASS}>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  1. Client Journey
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-2">
                  {linkedHousehold.triJourneyStatus.clientStage}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {linkedHousehold.client.name} · {linkedHousehold.program}
                </div>
              </div>
              <div className={CARD_CLASS}>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  2. Caregiver Journey
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-2">
                  {linkedHousehold.triJourneyStatus.caregiverStage}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Primary: {linkedHousehold.primaryCaregiver.name}
                </div>
              </div>
              <div className={`${CARD_CLASS} bg-[#F2F8EE]/60 border-[#C7E4B3]`}>
                <div className="text-[11px] font-bold text-[#3D6B22] uppercase tracking-wider">
                  3. Agency Operations Journey
                </div>
                <div className="text-base font-extrabold text-[#1E5622] mt-2">
                  {linkedHousehold.triJourneyStatus.opsStage}
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  EVV Rate: {linkedHousehold.evvComplianceRate}% · Auth{" "}
                  {linkedHousehold.authStatus}
                </div>
              </div>
            </div>
          ) : (
            <div className={CARD_CLASS}>
              <p className="text-xs text-slate-500">
                Household {visit.householdName} linked to {visit.clientName}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 7. MEMO & CARE NOTES */}
      {activeTab === "memo" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Shift Memo, Care Note Status &amp; Internal Notes
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Caregiver shift instructions and HIPAA-protected coordinator documentation.
                </p>
              </div>
            </div>
            <FormButtonPrimary
              onClick={() =>
                persistFullVisit(
                  {
                    ...visit,
                    careNoteStatus: memoDraft.careNoteStatus,
                    memo: memoDraft.memo,
                    internalNotes: memoDraft.internalNotes,
                    isModifiedFromSchedule: true,
                  },
                  "Memo & Care Note Updated"
                )
              }
            >
              <Save className="w-4 h-4" />
              <span>Save Notes</span>
            </FormButtonPrimary>
          </div>

          <div className={`${CARD_CLASS} space-y-5`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <FormLabel htmlFor="full-carenote-status">
                  Care Note Status
                </FormLabel>
                <FormSelect
                  id="full-carenote-status"
                  icon={<FileText className="w-4 h-4" />}
                  value={memoDraft.careNoteStatus}
                  onChange={(e) =>
                    setMemoDraft({
                      ...memoDraft,
                      careNoteStatus: e.target.value as CareNoteStatus,
                    })
                  }
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Missing">Missing</option>
                </FormSelect>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="full-memo">Caregiver Shift Memo</FormLabel>
                <FormTextarea
                  id="full-memo"
                  rows={4}
                  value={memoDraft.memo}
                  onChange={(e) =>
                    setMemoDraft({ ...memoDraft, memo: e.target.value })
                  }
                />
              </div>
              <div>
                <FormLabel htmlFor="full-internal">
                  Internal Coordinator Notes
                </FormLabel>
                <FormTextarea
                  id="full-internal"
                  rows={4}
                  value={memoDraft.internalNotes}
                  onChange={(e) =>
                    setMemoDraft({ ...memoDraft, internalNotes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. AUDIT & HISTORY */}
      {activeTab === "audit" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                HIPAA Immutable Audit Trail &amp; Broadcast Log
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Chronological log of all schedule modifications, caregiver matches, and broadcast dispatches.
              </p>
            </div>
          </div>

          <div className={`${CARD_CLASS} space-y-3`}>
            {(visit.auditTrail || []).map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <History className="w-4 h-4 text-[#3D6B22] shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      {entry.action}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {entry.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-600">{entry.details}</p>
                  <div className="text-[11px] text-slate-500">
                    Actor: <strong>{entry.actor}</strong> ({entry.actorRole})
                    {entry.reason ? ` · Reason: ${entry.reason}` : ""}
                  </div>
                </div>
              </div>
            ))}
            {(!visit.auditTrail || visit.auditTrail.length === 0) && (
              <div className="text-xs text-slate-500 py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                No modification events logged yet for {visit.id}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS (Global Modal Standardization)
         ========================================================================= */}
      {isBroadcastOpen && (
        <SendToCaregiversModal
          key={visit.id}
          isOpen={true}
          onClose={() => setIsBroadcastOpen(false)}
          visit={visit}
          caregivers={caregivers}
          allVisits={allVisits}
          clients={clients}
          onSendBroadcast={handleSendBroadcast}
        />
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={canDelete ? "Delete Visit Record" : "Remove Scheduled Visit"}
        description={
          canDelete
            ? "Permanent deletion removes this visit from Real-Time Scheduling and connected logs."
            : "Marks this visit as removed from the active schedule while preserving the audit log."
        }
        icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        maxWidth="sm"
      >
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Are you sure you want to {canDelete ? "permanently delete" : "remove"}{" "}
          visit <strong className="text-slate-900">{visit.id}</strong> for{" "}
          <strong className="text-slate-900">{visit.clientName}</strong> on{" "}
          {visit.date}?
        </p>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <FormButtonSecondary onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </FormButtonSecondary>
          <button
            type="button"
            onClick={handleDeleteOrRemove}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm cursor-pointer transition-all"
          >
            {canDelete ? "Confirm Delete" : "Confirm Remove"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
