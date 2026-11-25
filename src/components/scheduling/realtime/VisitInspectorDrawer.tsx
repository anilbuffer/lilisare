"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  Maximize2,
  Trash2,
  Copy,
  Info,
  CalendarDays,
  DollarSign,
  Tag,
  ClipboardList,
  MoreVertical,
  Lock,
  Unlock,
  Send,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Home,
  Edit3,
  Save,
} from "lucide-react";
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
  formatHoursShort,
} from "@/lib/scheduling/schedulingStore";
import { VISIT_STATUS_PALETTE } from "./statusPalette";
import {
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";

type InspectorTab = "details" | "financial" | "memo" | "care-plan" | "more";

interface VisitInspectorDrawerProps {
  visit: RealTimeVisit;
  portal: "admin" | "intake";
  clients: ClientRecord[];
  caregivers: CaregiverRecord[];
  households: Household[];
  canDelete: boolean;
  canViewFinancials: boolean;
  canEditFinancials: boolean;
  onClose: () => void;
  onSave: (updated: RealTimeVisit) => void;
  onDelete: (visitId: string) => void;
  onDuplicate: (visit: RealTimeVisit) => void;
  onOpenRecommend: (visit: RealTimeVisit) => void;
  onOpenBroadcast: (visit: RealTimeVisit) => void;
}

export function VisitInspectorDrawer({
  visit,
  portal,
  clients,
  caregivers,
  households,
  canDelete,
  canViewFinancials,
  canEditFinancials,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  onOpenRecommend,
  onOpenBroadcast,
}: VisitInspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("details");
  const [draft, setDraft] = useState<RealTimeVisit>(visit);
  const [isClientLocked, setIsClientLocked] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const updateDraft = (patch: Partial<RealTimeVisit>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      // Recompute duration automatically when times change
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
    setIsDirty(true);
  };

  const liveDuration = useMemo(
    () => calculateDurationHours(draft.startTime, draft.endTime),
    [draft.startTime, draft.endTime]
  );

  const activeCaregivers = useMemo(
    () => caregivers.filter((c) => c.status === "Active"),
    [caregivers]
  );

  const linkedClient = useMemo(
    () => clients.find((c) => c.id === draft.clientId),
    [clients, draft.clientId]
  );

  const linkedHousehold = useMemo(
    () =>
      households.find(
        (h) => h.id === draft.householdId || h.client.id === draft.clientId
      ),
    [households, draft.householdId, draft.clientId]
  );

  const handleClientChange = (newClientId: string) => {
    const c = clients.find((x) => x.id === newClientId);
    if (!c) return;
    updateDraft({
      clientId: c.id,
      clientName: c.name,
      clientAdmin: c.agencyInfo?.administrator || "Dana Jenkins, MSW",
      clientClass: c.careType || "Family Care",
      clientRegion: c.household?.city || "Springfield",
      householdId: c.household?.id || draft.householdId,
      householdName: c.household?.name || draft.householdName,
      address: `${c.household?.address || ""}, ${c.household?.city || ""}, ${c.household?.state || ""} ${c.household?.zip || ""}`.trim(),
      authorizationNumber: c.authorization?.authNumber || draft.authorizationNumber,
      authorizedWeeklyCap: c.carePlan?.authorizedWeeklyHours || 40,
    });
  };

  const handleCaregiverChange = (newCaregiverId: string) => {
    if (!newCaregiverId) {
      updateDraft({
        caregiverId: null,
        caregiverName: null,
        caregiverAdmin: undefined,
        caregiverClass: undefined,
        caregiverRegion: undefined,
        status: "Unassigned",
        isModifiedFromSchedule: true,
      });
      return;
    }
    const cg = caregivers.find((x) => x.id === newCaregiverId);
    if (!cg) return;
    updateDraft({
      caregiverId: cg.id,
      caregiverName: cg.name,
      caregiverAdmin: "Dana Jenkins, MSW",
      caregiverClass: `${cg.type} (${cg.employmentClassification})`,
      caregiverRegion: cg.personalInfo?.address?.city || "Springfield",
      status: draft.status === "Unassigned" ? "Scheduled" : draft.status,
      isModifiedFromSchedule: true,
    });
  };

  const handleServiceChange = (newServiceId: string) => {
    const svc = LILISARE_SERVICES.find((s) => s.id === newServiceId);
    if (!svc) return;
    const billRate = parseFloat(svc.defaultBillRate.replace(/[^0-9.]/g, "")) || draft.billRate;
    const payRate = parseFloat(svc.defaultPayRate.replace(/[^0-9.]/g, "")) || draft.payRate;
    updateDraft({
      serviceId: svc.id,
      serviceCode: svc.code,
      serviceName: svc.name,
      unitType: svc.unitType,
      billRate,
      payRate,
    });
  };

  const handleSave = () => {
    const finalVisit: RealTimeVisit = {
      ...draft,
      isModifiedFromSchedule:
        draft.isModifiedFromSchedule ||
        (draft.modificationReason !== undefined &&
          draft.modificationReason !== "None / Original Schedule"),
    };
    onSave(finalVisit);
    setIsDirty(false);
    onClose();
  };

  const fullPageHref = `/${portal}/scheduling/${draft.id}/`;
  const statusPalette = VISIT_STATUS_PALETTE[draft.status];

  const tabs: Array<{ id: InspectorTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "details", label: "Details", icon: CalendarDays },
    { id: "financial", label: "Financial", icon: DollarSign },
    { id: "memo", label: "Memo", icon: Tag },
    { id: "care-plan", label: "Care Plan", icon: ClipboardList },
    { id: "more", label: "More", icon: MoreVertical },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visit Details Modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Top Modal Header */}
        <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Visit
                </h2>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {draft.id} · {draft.shiftNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                {draft.clientName} · {draft.householdName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href={fullPageHref}
              className="p-2 rounded-xl text-slate-500 hover:text-[#3D6B22] hover:bg-[#F2F8EE] transition-colors"
              title="Expand to Full-Page Visit Detail View"
              aria-label="Expand Visit to Full Page"
            >
              <Maximize2 className="w-4 h-4" />
            </Link>
            <Link
              href={`/${portal}/scheduling/${draft.id}/edit/`}
              className="p-2 rounded-xl text-slate-500 hover:text-[#3D6B22] hover:bg-[#F2F8EE] transition-colors"
              title="Open Dedicated Visit Edit Page"
              aria-label="Open Dedicated Visit Edit Page"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => onDuplicate(draft)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Duplicate Visit to Next Day"
              aria-label="Duplicate Visit"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(draft.id)}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title={canDelete ? "Delete Visit" : "Mark Visit Removed"}
              aria-label={canDelete ? "Delete Visit" : "Remove Visit"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Modal"
              aria-label="Close Visit Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modification / Status Banner */}
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
            <Info className="w-3.5 h-3.5 text-[#3D6B22] shrink-0" />
            <span className="truncate">
              {draft.isModifiedFromSchedule || isDirty
                ? "Visit has been modified from schedule"
                : `Synced · ${draft.householdName}`}
            </span>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusPalette.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusPalette.dotColor}`} />
            {draft.status}
          </span>
        </div>

        {/* 5 Inspector Tabs */}
        <div className="grid grid-cols-5 border-b border-slate-200 bg-white shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-1 sm:px-2 flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold transition-colors border-b-2 cursor-pointer ${active
                  ? "text-[#3D6B22] border-[#3D6B22] bg-[#F2F8EE]/50"
                  : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50"
                  }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar bg-white">
          {activeTab === "details" && (
            <div className="space-y-3.5">
              {/* Status & Modification Reason */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <FormLabel htmlFor="insp-status">Visit Status</FormLabel>
                  <FormSelect
                    id="insp-status"
                    value={draft.status}
                    onChange={(e) =>
                      updateDraft({
                        status: e.target.value as VisitStatus,
                        isModifiedFromSchedule: true,
                      })
                    }
                  >
                    {ALL_VISIT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </FormSelect>
                </div>

                <div>
                  <FormLabel htmlFor="insp-reason">Reason for modification</FormLabel>
                  <FormSelect
                    id="insp-reason"
                    value={draft.modificationReason || "None / Original Schedule"}
                    onChange={(e) =>
                      updateDraft({
                        modificationReason: e.target.value,
                        isModifiedFromSchedule: e.target.value !== "None / Original Schedule",
                      })
                    }
                  >
                    {MODIFICATION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </FormSelect>
                </div>
              </div>

              {/* Date + Start / End + Duration */}
              <div className="space-y-2.5 pt-1 border-t border-slate-100">
                <div>
                  <FormLabel htmlFor="insp-date">Date</FormLabel>
                  <FormInput
                    id="insp-date"
                    type="date"
                    value={draft.date}
                    onChange={(e) => updateDraft({ date: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <FormLabel htmlFor="insp-start">Start</FormLabel>
                    <FormInput
                      id="insp-start"
                      type="time"
                      value={draft.startTime}
                      onChange={(e) => updateDraft({ startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <FormLabel htmlFor="insp-end">End</FormLabel>
                    <FormInput
                      id="insp-end"
                      type="time"
                      value={draft.endTime}
                      onChange={(e) => updateDraft({ endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 text-xs font-bold text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span className="uppercase tracking-wider text-[11px] text-slate-400">
                    DURATION
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F2F8EE] text-[#3D6B22] border border-[#C7E4B3]">
                    {formatHoursShort(liveDuration)}
                  </span>
                </div>
              </div>

              {/* Clock In / Out Locations */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
                <div>
                  <FormLabel htmlFor="insp-clockin" className="text-xs">
                    Clock In Location
                  </FormLabel>
                  <FormSelect
                    id="insp-clockin"
                    className="text-xs py-2"
                    value={draft.clockInLocation}
                    onChange={(e) =>
                      updateDraft({ clockInLocation: e.target.value as ClockLocationType })
                    }
                  >
                    <option value="Any profile address">Any profile address</option>
                    <option value="Client Residential Address">Client Residential Address</option>
                    <option value="Household Primary Address">Household Primary Address</option>
                    <option value="Community Outing (Approved)">Community Outing</option>
                  </FormSelect>
                </div>
                <div>
                  <FormLabel htmlFor="insp-clockout" className="text-xs">
                    Clock Out Location
                  </FormLabel>
                  <FormSelect
                    id="insp-clockout"
                    className="text-xs py-2"
                    value={draft.clockOutLocation}
                    onChange={(e) =>
                      updateDraft({ clockOutLocation: e.target.value as ClockLocationType })
                    }
                  >
                    <option value="Same as clock in">Same as clock in</option>
                    <option value="Client Residential Address">Client Residential Address</option>
                    <option value="Any profile address">Any profile address</option>
                  </FormSelect>
                </div>
              </div>

              {/* Client & Caregiver Selectors */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel htmlFor="insp-client" className="mb-0">
                      Client
                    </FormLabel>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/${portal}/clients/${draft.clientId}/`}
                        className="text-[11px] font-semibold text-[#3D6B22] hover:underline inline-flex items-center gap-0.5"
                        title="Open Client Profile"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setIsClientLocked(!isClientLocked)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={isClientLocked ? "Unlock Client Field" : "Lock Client Field"}
                      >
                        {isClientLocked ? (
                          <Lock className="w-3.5 h-3.5 text-[#3D6B22]" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-amber-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <FormSelect
                    id="insp-client"
                    disabled={isClientLocked}
                    value={draft.clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </FormSelect>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel htmlFor="insp-caregiver" className="mb-0">
                      Caregiver
                    </FormLabel>
                    {draft.caregiverId && (
                      <Link
                        href={`/${portal}/caregivers/${draft.caregiverId}/`}
                        className="text-[11px] font-semibold text-[#3D6B22] hover:underline inline-flex items-center gap-0.5"
                        title="Open Caregiver Profile"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <FormSelect
                    id="insp-caregiver"
                    value={draft.caregiverId || ""}
                    onChange={(e) => handleCaregiverChange(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {activeCaregivers.map((cg) => (
                      <option key={cg.id} value={cg.id}>
                        {cg.name} ({cg.employmentClassification})
                      </option>
                    ))}
                  </FormSelect>

                  {/* SEND TO CAREGIVERS & RECOMMEND smart matching row */}
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenBroadcast(draft)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#0F5E6E] hover:text-[#3D6B22] uppercase tracking-wide py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>SEND TO CAREGIVERS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenRecommend(draft)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#3D6B22] hover:text-[#2C5217] uppercase tracking-wide py-1 px-2.5 rounded-lg bg-[#F2F8EE] hover:bg-[#E3F1D9] border border-[#C7E4B3] transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>RECOMMEND</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Service Selector */}
              <div className="pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <FormLabel htmlFor="insp-service" className="mb-0">
                    Service
                  </FormLabel>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E0F2F5] text-[#0F5E6E]">
                    {draft.unitType}
                  </span>
                </div>
                <FormSelect
                  id="insp-service"
                  value={draft.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                >
                  {LILISARE_SERVICES.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.code}: {svc.shortName}
                      {canViewFinancials ? ` (${svc.defaultBillRate})` : ""}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </div>
          )}

          {activeTab === "financial" && (
            <div className="space-y-4">
              <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Authorization #</span>
                  <span className="font-bold text-slate-900">{draft.authorizationNumber}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Weekly Auth Cap</span>
                  <span className="font-bold text-[#3D6B22]">{draft.authorizedWeeklyCap} hrs/wk</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Scheduled Duration</span>
                  <span className="font-bold text-slate-900">{liveDuration} hrs</span>
                </div>
              </div>

              {canViewFinancials ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FormLabel htmlFor="insp-bill-rate">Bill Rate ($/hr)</FormLabel>
                      <FormInput
                        id="insp-bill-rate"
                        type="number"
                        step="0.5"
                        disabled={!canEditFinancials}
                        value={draft.billRate}
                        onChange={(e) =>
                          updateDraft({ billRate: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <FormLabel htmlFor="insp-pay-rate">Pay Rate ($/hr)</FormLabel>
                      <FormInput
                        id="insp-pay-rate"
                        type="number"
                        step="0.5"
                        disabled={!canEditFinancials}
                        value={draft.payRate}
                        onChange={(e) =>
                          updateDraft({ payRate: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FormLabel htmlFor="insp-bill-hrs">Billable Hours</FormLabel>
                      <FormInput
                        id="insp-bill-hrs"
                        type="number"
                        step="0.25"
                        disabled={!canEditFinancials}
                        value={draft.billableHours}
                        onChange={(e) =>
                          updateDraft({ billableHours: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <FormLabel htmlFor="insp-pay-hrs">Payable Hours</FormLabel>
                      <FormInput
                        id="insp-pay-hrs"
                        type="number"
                        step="0.25"
                        disabled={!canEditFinancials}
                        value={draft.payableHours}
                        onChange={(e) =>
                          updateDraft({ payableHours: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3.5 space-y-2 bg-[#F2F8EE]/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Estimated Billable</span>
                      <span className="font-bold text-slate-900">
                        ${(draft.billRate * draft.billableHours).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Estimated Payroll</span>
                      <span className="font-bold text-slate-900">
                        ${(draft.payRate * draft.payableHours).toFixed(2)}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1E5622]">Net Visit Margin</span>
                      <span className="font-extrabold text-[#3D6B22]">
                        $
                        {(
                          draft.billRate * draft.billableHours -
                          draft.payRate * draft.payableHours
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Financial Rates Restricted (RBAC)</span>
                  </div>
                  <p>
                    Bill rates, caregiver pay rates, and margin analytics are restricted to Agency
                    Administrator and Billing Finance roles. Operational authorization caps remain
                    visible above.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "memo" && (
            <div className="space-y-4">
              <div>
                <FormLabel htmlFor="insp-memo">Caregiver Shift Memo</FormLabel>
                <FormTextarea
                  id="insp-memo"
                  rows={3}
                  value={draft.memo}
                  onChange={(e) => updateDraft({ memo: e.target.value })}
                  placeholder="Instructions visible to caregiver on mobile app..."
                />
              </div>

              <div>
                <FormLabel htmlFor="insp-internal">Internal Coordinator Notes (HIPAA)</FormLabel>
                <FormTextarea
                  id="insp-internal"
                  rows={3}
                  value={draft.internalNotes}
                  onChange={(e) => updateDraft({ internalNotes: e.target.value })}
                  placeholder="Internal coordination, call-off details, or family updates..."
                />
              </div>

              {draft.broadcasts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Recent Broadcasts ({draft.broadcasts.length})
                  </div>
                  <div className="space-y-2">
                    {draft.broadcasts.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-xl p-2.5 bg-[#F2F8EE]/60 border border-[#C7E4B3] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-[#1E5622]">
                          <span>{b.channel}</span>
                          <span>{b.sentAt}</span>
                        </div>
                        <p className="text-slate-600">
                          Sent to {b.caregiverNames.length} caregiver(s):{" "}
                          {b.caregiverNames.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "care-plan" && (
            <div className="space-y-3.5">
              {linkedClient ? (
                <>
                  <div className="rounded-xl p-3.5 bg-[#F2F8EE]/60 border border-[#C7E4B3]">
                    <div className="text-[11px] font-bold text-[#3D6B22] uppercase tracking-wider">
                      Active Care Program
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {linkedClient.carePlan?.program || "Home Care Plan"}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {linkedClient.carePlan?.frequency}
                    </div>
                  </div>

                  {linkedClient.carePlan?.allergies &&
                    linkedClient.carePlan.allergies.length > 0 && (
                      <div className="rounded-xl p-3 bg-rose-50 border border-rose-200 text-xs">
                        <div className="font-bold text-rose-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Allergies & Clinical Alerts</span>
                        </div>
                        <p className="text-rose-700 mt-1">
                          {linkedClient.carePlan.allergies.join(", ")}
                        </p>
                      </div>
                    )}

                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Visit ADL & Support Checklist
                    </div>
                    <div className="space-y-1.5">
                      {(
                        linkedClient.carePlan?.adlSupportNeeds ||
                        linkedClient.carePlan?.approvedServices ||
                        ["Personal Care", "Meal Setup"]
                      ).map((adl, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22] shrink-0" />
                          <span>{adl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/${portal}/clients/${linkedClient.id}/?tab=plan-of-care`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline"
                  >
                    <span>Open Full Client Care Plan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </>
              ) : (
                <p className="text-xs text-slate-500">No linked client care plan found.</p>
              )}
            </div>
          )}

          {activeTab === "more" && (
            <div className="space-y-4">
              <div>
                <FormLabel htmlFor="insp-carenote">Care Note Status</FormLabel>
                <FormSelect
                  id="insp-carenote"
                  value={draft.careNoteStatus}
                  onChange={(e) =>
                    updateDraft({ careNoteStatus: e.target.value as CareNoteStatus })
                  }
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Missing">Missing</option>
                </FormSelect>
              </div>

              <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>EVV Verification & Logistics</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">EVV Status</span>
                  <span className="font-bold text-slate-900">{draft.evvStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Estimated Travel</span>
                  <span className="font-semibold text-slate-800">
                    {draft.travelMinutes} min / {draft.distanceMiles} mi
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Service Address</span>
                  <span className="font-medium text-slate-700 text-right max-w-[190px] truncate">
                    {draft.address}
                  </span>
                </div>
              </div>

              {linkedHousehold && (
                <div className="rounded-xl p-3.5 bg-[#F2F8EE]/50 border border-[#C7E4B3] space-y-2 text-xs">
                  <div className="font-bold text-[#1E5622] flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5" />
                      {linkedHousehold.name}
                    </span>
                    <Link
                      href={`/${portal}/households/${linkedHousehold.id}/`}
                      className="text-[#3D6B22] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold">
                    <div className="bg-white rounded-lg p-1.5 border border-slate-200">
                      <div className="text-slate-400">Client</div>
                      <div className="text-slate-800 truncate">
                        {linkedHousehold.triJourneyStatus.clientStage}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-1.5 border border-slate-200">
                      <div className="text-slate-400">Caregiver</div>
                      <div className="text-slate-800 truncate">
                        {linkedHousehold.triJourneyStatus.caregiverStage}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-1.5 border border-slate-200">
                      <div className="text-slate-400">Ops</div>
                      <div className="text-slate-800 truncate">
                        {linkedHousehold.triJourneyStatus.opsStage}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Link
                href={fullPageHref}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] shadow-sm transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Open Full-Page Visit Workspace</span>
              </Link>
            </div>
          )}
        </div>

        {/* Standardized Modal Footer (Matches Send Open Shift to Caregivers) */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/70 rounded-b-2xl sm:rounded-b-[20px] z-10">
          <FormButtonCancel onClick={onClose} />
          <FormButtonPrimary type="button" onClick={handleSave}>
            <Save className="w-4 h-4" />
            <span>{isDirty ? "Save Changes" : "Save Visit"}</span>
          </FormButtonPrimary>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
