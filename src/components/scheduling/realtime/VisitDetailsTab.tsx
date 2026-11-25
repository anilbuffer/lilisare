"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Calendar,
  Edit3,
  Save,
  X,
  RefreshCw,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Home,
  UserCheck,
  Send,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  RealTimeVisit,
  VisitStatus,
  ClockLocationType,
  CareNoteStatus,
} from "@/types/scheduling";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import { Household } from "@/lib/households/mockData";
import { LILISARE_SERVICES } from "@/lib/services";
import {
  ALL_VISIT_STATUSES,
  MODIFICATION_REASONS,
  calculateDurationHours,
  formatCompactTime,
  formatHoursShort,
} from "@/lib/scheduling/schedulingStore";
import { VISIT_STATUS_PALETTE } from "./statusPalette";

interface VisitDetailsTabProps {
  visit: RealTimeVisit;
  portal: "admin" | "intake";
  clients: ClientRecord[];
  caregivers: CaregiverRecord[];
  households: Household[];
  canViewFinancials: boolean;
  canEditFinancials: boolean;
  isEditing?: boolean;
  onToggleEdit?: (editing: boolean) => void;
  onSaveVisit: (updated: RealTimeVisit, actionLabel: string) => void;
  onOpenMatching?: () => void;
  onOpenBroadcast?: () => void;
}

const CARD_CLASS =
  "bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between";

const INPUT_CLASS =
  "w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800";

export function VisitDetailsTab({
  visit,
  portal,
  clients,
  caregivers,
  households,
  canViewFinancials,
  canEditFinancials,
  isEditing: externalIsEditing,
  onToggleEdit,
  onSaveVisit,
  onOpenMatching,
  onOpenBroadcast,
}: VisitDetailsTabProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing =
    externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;

  const setIsEditing = (val: boolean) => {
    setInternalIsEditing(val);
    onToggleEdit?.(val);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<RealTimeVisit>(visit);
  const [skillsText, setSkillsText] = useState((visit.requiredSkills || []).join(", "));

  const activeVisit = isEditing ? draft : visit;

  const activeCaregivers = useMemo(
    () => caregivers.filter((c) => c.status === "Active"),
    [caregivers]
  );

  const linkedHousehold = useMemo(
    () =>
      households.find(
        (h) => h.id === activeVisit.householdId || h.client.id === activeVisit.clientId
      ),
    [households, activeVisit.householdId, activeVisit.clientId]
  );

  const liveDuration = useMemo(
    () => calculateDurationHours(activeVisit.startTime, activeVisit.endTime),
    [activeVisit.startTime, activeVisit.endTime]
  );

  const updateDraft = (patch: Partial<RealTimeVisit>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      if (patch.startTime !== undefined || patch.endTime !== undefined) {
        const dur = calculateDurationHours(next.startTime, next.endTime);
        next.scheduledHours = dur;
        if (next.status !== "Missed" && !next.isRemoved) {
          next.billableHours = dur;
          next.payableHours = dur;
        }
      }
      return next;
    });
  };

  const handleStartEdit = () => {
    setDraft(visit);
    setSkillsText((visit.requiredSkills || []).join(", "));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraft(visit);
    setSkillsText((visit.requiredSkills || []).join(", "));
    setIsEditing(false);
    toast.info("Visit edits discarded.");
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    const parsedSkills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const finalVisit: RealTimeVisit = {
      ...draft,
      requiredSkills: parsedSkills.length > 0 ? parsedSkills : draft.requiredSkills,
      isModifiedFromSchedule:
        draft.isModifiedFromSchedule ||
        (draft.modificationReason !== undefined &&
          draft.modificationReason !== "None / Original Schedule"),
    };

    setTimeout(() => {
      onSaveVisit(finalVisit, "Master Visit Record Updated");
      setIsSaving(false);
      setIsEditing(false);
    }, 250);
  };

  const pal = VISIT_STATUS_PALETTE[activeVisit.status];

  const estimatedRevenue = (activeVisit.billRate * activeVisit.billableHours).toFixed(2);
  const estimatedPayroll = (activeVisit.payRate * activeVisit.payableHours).toFixed(2);
  const netMargin = (
    activeVisit.billRate * activeVisit.billableHours -
    activeVisit.payRate * activeVisit.payableHours
  ).toFixed(2);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* =========================================================================
          TOP BANNER: VIEW DETAILS VS. EDIT MODE SWITCHER (Matches Client & Caregiver)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Master Visit Record
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${isEditing
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
              >
                {isEditing ? "EDIT MODE" : "VIEW DETAILS"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Synchronized schedule window, client &amp; caregiver assignment, EVV telemetry, and authorization details
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl transition-all shadow-xs shadow-[#3D6B22]/20 active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          2x2 GRID OF THE 4 CORE VISIT CARDS
         ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* -------------------------------------------------------------------
            CARD 1: SCHEDULE WINDOW & SERVICE LINE
           ------------------------------------------------------------------- */}
        <div className={CARD_CLASS}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Schedule Window &amp; Service Line</span>
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                  title="Edit Schedule Window"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">
                    Visit Identifier
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {activeVisit.id} · {activeVisit.shiftNumber}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Current Visit Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${pal.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${pal.dotColor}`} />
                    {activeVisit.status}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Visit Date
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {activeVisit.date}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-slate-500">
                    Scheduled Window
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#3D6B22] inline-flex items-center gap-1.5 bg-[#E8F2E4] px-2.5 py-1 rounded-lg border border-[#3D6B22]/20">
                    <Calendar className="w-3.5 h-3.5 text-[#3D6B22]" />
                    <span>
                      {activeVisit.date} ({formatCompactTime(activeVisit.startTime)} –{" "}
                      {formatCompactTime(activeVisit.endTime)} ·{" "}
                      {formatHoursShort(liveDuration)})
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 gap-4">
                  <span className="text-[13px] font-medium text-slate-500 shrink-0">
                    Service Line
                  </span>
                  <span className="text-sm font-semibold text-slate-900 text-right">
                    {activeVisit.serviceCode} · {activeVisit.serviceName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Billing Unit Type
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {activeVisit.unitType}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 gap-4">
                  <span className="text-[13px] font-medium text-slate-500 shrink-0">
                    Modification Reason
                  </span>
                  <span className="text-xs font-semibold text-slate-700 text-right">
                    {activeVisit.modificationReason || "None / Original Schedule"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Visit Status
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        updateDraft({
                          status: e.target.value as VisitStatus,
                          isModifiedFromSchedule: true,
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      {ALL_VISIT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Modification Reason
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={draft.modificationReason || "None / Original Schedule"}
                      onChange={(e) =>
                        updateDraft({
                          modificationReason: e.target.value,
                          isModifiedFromSchedule:
                            e.target.value !== "None / Original Schedule",
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      {MODIFICATION_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Visit Date
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(e) => updateDraft({ date: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Time Window ({formatHoursShort(liveDuration)})
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={draft.startTime}
                      onChange={(e) => updateDraft({ startTime: e.target.value })}
                      className={INPUT_CLASS}
                    />
                    <input
                      type="time"
                      value={draft.endTime}
                      onChange={(e) => updateDraft({ endTime: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Service Line
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={draft.serviceId}
                      onChange={(e) => {
                        const svc = LILISARE_SERVICES.find(
                          (s) => s.id === e.target.value
                        );
                        if (!svc) return;
                        updateDraft({
                          serviceId: svc.id,
                          serviceCode: svc.code,
                          serviceName: svc.name,
                          unitType: svc.unitType,
                          billRate:
                            parseFloat(svc.defaultBillRate.replace(/[^0-9.]/g, "")) ||
                            draft.billRate,
                          payRate:
                            parseFloat(svc.defaultPayRate.replace(/[^0-9.]/g, "")) ||
                            draft.payRate,
                        });
                      }}
                      className={INPUT_CLASS}
                    >
                      {LILISARE_SERVICES.map((svc) => (
                        <option key={svc.id} value={svc.id}>
                          {svc.code} · {svc.shortName}
                          {canViewFinancials ? ` (${svc.defaultBillRate})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------
            CARD 2: CLIENT, CAREGIVER & HOUSEHOLD ASSIGNMENT
           ------------------------------------------------------------------- */}
        <div className={CARD_CLASS}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Client, Caregiver &amp; Household</span>
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {onOpenMatching && (
                  <button
                    type="button"
                    onClick={onOpenMatching}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 rounded-xl transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Recommend Caregiver</span>
                  </button>
                )}
                {onOpenBroadcast && (
                  <button
                    type="button"
                    onClick={onOpenBroadcast}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-500" />
                    <span>Send to Caregivers</span>
                  </button>
                )}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                    title="Edit Assignment"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">
                    Client Recipient
                  </span>
                  <Link
                    href={`/${portal}/clients/${activeVisit.clientId}/`}
                    className="text-sm font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
                  >
                    <span>
                      {activeVisit.clientName} ({activeVisit.clientId})
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Linked Household
                  </span>
                  {linkedHousehold ? (
                    <Link
                      href={`/${portal}/households/${linkedHousehold.id}/`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-[#3D6B22] hover:underline"
                    >
                      <Home className="w-3.5 h-3.5 text-[#3D6B22]" />
                      <span>{activeVisit.householdName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-slate-800">
                      {activeVisit.householdName}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center py-1.5 gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-slate-500">
                    Assigned Caregiver
                  </span>
                  {activeVisit.caregiverId && activeVisit.caregiverName ? (
                    <Link
                      href={`/${portal}/caregivers/${activeVisit.caregiverId}/`}
                      className="text-xs sm:text-sm font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-1.5 bg-[#E8F2E4] px-2.5 py-1 rounded-lg border border-[#3D6B22]/20"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
                      <span>{activeVisit.caregiverName}</span>
                      <ExternalLink className="w-3 h-3 text-[#3D6B22]" />
                    </Link>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Unassigned (Open Shift)
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Caregiver Classification
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {activeVisit.caregiverClass || "Pending Assignment"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Care Coordinator
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {activeVisit.clientAdmin} ({activeVisit.clientRegion})
                  </span>
                </div>

                <div className="flex justify-between items-start py-1.5 gap-4">
                  <span className="text-[13px] font-medium text-slate-500 shrink-0">
                    Service Address
                  </span>
                  <span className="text-xs font-semibold text-slate-800 text-right">
                    {activeVisit.address}
                  </span>
                </div>

                <div className="flex justify-between items-start py-1.5 gap-4">
                  <span className="text-[13px] font-medium text-slate-500 shrink-0">
                    Required Skills
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {(activeVisit.requiredSkills || []).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#3D6B22] border border-emerald-200/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Client Recipient
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={draft.clientId}
                      onChange={(e) => {
                        const c = clients.find((x) => x.id === e.target.value);
                        if (!c) return;
                        updateDraft({
                          clientId: c.id,
                          clientName: c.name,
                          householdId: c.household?.id || draft.householdId,
                          householdName: c.household?.name || draft.householdName,
                          clientRegion: c.household?.city || draft.clientRegion,
                          address: c.household?.address
                            ? `${c.household.address}, ${c.household.city}, ${c.household.state} ${c.household.zip}`
                            : draft.address,
                        });
                      }}
                      className={INPUT_CLASS}
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Assigned Caregiver
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={draft.caregiverId || ""}
                      onChange={(e) => {
                        const cg = caregivers.find((x) => x.id === e.target.value);
                        if (!cg) {
                          updateDraft({
                            caregiverId: null,
                            caregiverName: null,
                            caregiverClass: undefined,
                            status: "Unassigned",
                          });
                          return;
                        }
                        updateDraft({
                          caregiverId: cg.id,
                          caregiverName: cg.name,
                          caregiverClass: `${cg.type} (${cg.employmentClassification})`,
                          status:
                            draft.status === "Unassigned" ? "Scheduled" : draft.status,
                        });
                      }}
                      className={INPUT_CLASS}
                    >
                      <option value="">Unassigned (Open Shift)</option>
                      {activeCaregivers.map((cg) => (
                        <option key={cg.id} value={cg.id}>
                          {cg.name} ({cg.employmentClassification})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Service Address
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={draft.address}
                      onChange={(e) => updateDraft({ address: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Required Skills
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      placeholder="Comma-separated skills..."
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------
            CARD 3: EVV TELEMETRY & LOCATION RULES
           ------------------------------------------------------------------- */}
        <div className={CARD_CLASS}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>EVV Telemetry &amp; Location Rules</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  EVV: {activeVisit.evvStatus}
                </span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                    title="Edit EVV Rules"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">
                    Clock-In Location Rule
                  </span>
                  <span className="text-sm font-semibold text-slate-900 inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#3D6B22]" />
                    {activeVisit.clockInLocation}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Clock-Out Location Rule
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {activeVisit.clockOutLocation}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Clock-In Actual
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {activeVisit.clockInActual || "Pending"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Clock-Out Actual
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {activeVisit.clockOutActual || "Pending"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Travel Time &amp; Distance
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {activeVisit.travelMinutes} min · {activeVisit.distanceMiles} mi
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Scheduling Conflicts
                  </span>
                  {activeVisit.conflicts && activeVisit.conflicts.length > 0 && activeVisit.conflicts[0] !== "None" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {activeVisit.conflicts.join(", ")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      No Conflicts Detected
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    EVV Status
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={draft.evvStatus}
                      onChange={(e) =>
                        updateDraft({
                          evvStatus: e.target.value as RealTimeVisit["evvStatus"],
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Pending">Pending</option>
                      <option value="Verified">Verified</option>
                      <option value="Exception">Exception</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Clock-In Rule
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={draft.clockInLocation}
                      onChange={(e) =>
                        updateDraft({
                          clockInLocation: e.target.value as ClockLocationType,
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="Client Residential Address">
                        Client Residential Address
                      </option>
                      <option value="Any profile address">Any profile address</option>
                      <option value="Household Primary Address">
                        Household Primary Address
                      </option>
                      <option value="Community Outing (Approved)">
                        Community Outing (Approved)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Clock-Out Rule
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={draft.clockOutLocation}
                      onChange={(e) =>
                        updateDraft({
                          clockOutLocation: e.target.value as ClockLocationType,
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="Same as clock in">Same as clock in</option>
                      <option value="Client Residential Address">
                        Client Residential Address
                      </option>
                      <option value="Any profile address">Any profile address</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Actual Clock In / Out
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={draft.clockInActual || ""}
                      onChange={(e) => updateDraft({ clockInActual: e.target.value })}
                      placeholder="e.g. 08:02"
                      className={INPUT_CLASS}
                    />
                    <input
                      type="text"
                      value={draft.clockOutActual || ""}
                      onChange={(e) => updateDraft({ clockOutActual: e.target.value })}
                      placeholder="e.g. 16:00"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Travel (min / mi)
                  </label>
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={0}
                      value={draft.travelMinutes}
                      onChange={(e) =>
                        updateDraft({ travelMinutes: Number(e.target.value) || 0 })
                      }
                      className={INPUT_CLASS}
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={draft.distanceMiles}
                      onChange={(e) =>
                        updateDraft({ distanceMiles: Number(e.target.value) || 0 })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------
            CARD 4: AUTHORIZATION, NOTES & FINANCIAL SUMMARY
           ------------------------------------------------------------------- */}
        <div className={CARD_CLASS}>
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3D6B22]" />
                <span>Authorization, Notes &amp; Financials</span>
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D6B22] hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-200/80"
                  title="Edit Authorization & Notes"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] font-medium text-slate-500">
                    Authorization #
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {activeVisit.authorizationNumber}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Weekly Authorized Cap
                  </span>
                  <span className="text-sm font-bold text-[#3D6B22]">
                    {activeVisit.authorizedWeeklyCap} hrs/week
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    Care Note Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${activeVisit.careNoteStatus === "Completed"
                      ? "bg-emerald-50 text-[#1E5622] border-emerald-200"
                      : activeVisit.careNoteStatus === "Pending"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                  >
                    <FileText className="w-3 h-3" />
                    {activeVisit.careNoteStatus}
                  </span>
                </div>

                {canViewFinancials ? (
                  <>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-[13px] font-medium text-slate-500">
                        Bill Rate / Pay Rate
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        ${activeVisit.billRate.toFixed(2)}/hr · ${activeVisit.payRate.toFixed(2)}/hr
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-[13px] font-medium text-slate-500">
                        Est. Revenue / Payroll / Margin
                      </span>
                      <span className="text-sm font-bold text-[#3D6B22]">
                        ${estimatedRevenue} / ${estimatedPayroll} (+${netMargin})
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="py-2">
                    <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Bill rates and margin analytics are restricted to Agency Admin.
                      </span>
                    </div>
                  </div>
                )}

                <div className="py-2 space-y-1">
                  <span className="text-[13px] font-medium text-slate-500 block">
                    Caregiver Shift Memo
                  </span>
                  <p className="text-xs font-medium text-slate-800 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {activeVisit.memo || "No caregiver memo recorded."}
                  </p>
                </div>

                <div className="py-2 space-y-1">
                  <span className="text-[13px] font-medium text-slate-500 block">
                    Internal Coordinator Notes
                  </span>
                  <p className="text-xs font-medium text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {activeVisit.internalNotes || "No internal coordinator notes recorded."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Authorization #
                  </label>
                  <div className="sm:col-span-8">
                    <input
                      type="text"
                      value={draft.authorizationNumber}
                      onChange={(e) =>
                        updateDraft({ authorizationNumber: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                    Care Note Status
                  </label>
                  <div className="sm:col-span-8">
                    <select
                      value={draft.careNoteStatus}
                      onChange={(e) =>
                        updateDraft({
                          careNoteStatus: e.target.value as CareNoteStatus,
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Missing">Missing</option>
                    </select>
                  </div>
                </div>

                {canViewFinancials && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                    <label className="sm:col-span-4 text-[13px] font-medium text-slate-700">
                      Bill / Pay Rate ($/hr)
                    </label>
                    <div className="sm:col-span-8 grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.5"
                        disabled={!canEditFinancials}
                        value={draft.billRate}
                        onChange={(e) =>
                          updateDraft({ billRate: parseFloat(e.target.value) || 0 })
                        }
                        className={INPUT_CLASS}
                      />
                      <input
                        type="number"
                        step="0.5"
                        disabled={!canEditFinancials}
                        value={draft.payRate}
                        onChange={(e) =>
                          updateDraft({ payRate: parseFloat(e.target.value) || 0 })
                        }
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700 pt-2">
                    Caregiver Memo
                  </label>
                  <div className="sm:col-span-8">
                    <textarea
                      rows={2}
                      value={draft.memo}
                      onChange={(e) => updateDraft({ memo: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2">
                  <label className="sm:col-span-4 text-[13px] font-medium text-slate-700 pt-2">
                    Internal Notes
                  </label>
                  <div className="sm:col-span-8">
                    <textarea
                      rows={2}
                      value={draft.internalNotes}
                      onChange={(e) => updateDraft({ internalNotes: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
