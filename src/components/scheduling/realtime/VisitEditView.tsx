"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import {
  FormSection,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";
import {
  RealTimeVisit,
  VisitStatus,
  ClockLocationType,
  CareNoteStatus,
  RecurringEditScope,
} from "@/types/scheduling";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import { LILISARE_SERVICES } from "@/lib/services";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import {
  getVisitsFromStorage,
  saveVisitsToStorage,
  getVisitById,
  getSyncedSchedulingContext,
  calculateDurationHours,
  formatHoursShort,
  ALL_VISIT_STATUSES,
  MODIFICATION_REASONS,
  computeVisitConflicts,
  applyRecurringVisitEdit,
} from "@/lib/scheduling/schedulingStore";

interface VisitEditViewProps {
  visitId: string;
  portal: "admin" | "intake";
}

export function VisitEditView({ visitId, portal }: VisitEditViewProps) {
  const router = useRouter();
  const perms = usePortalPermissions(portal);
  const canViewFinancials = perms.isAdmin;
  const canEditFinancials = perms.isAdmin;

  const baseDetailPath = `/${portal}/scheduling/${visitId}/`;
  const baseListPath = `/${portal}/scheduling/`;

  const [isMounted, setIsMounted] = useState(false);
  const [allVisits, setAllVisits] = useState<RealTimeVisit[]>([]);
  const [visit, setVisit] = useState<RealTimeVisit | null>(null);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverRecord[]>([]);

  // Form states
  const [status, setStatus] = useState<VisitStatus>("Scheduled");
  const [modificationReason, setModificationReason] = useState(
    "None / Original Schedule"
  );
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");

  const [clientId, setClientId] = useState("");
  const [caregiverId, setCaregiverId] = useState<string>("");
  const [serviceId, setServiceId] = useState("");
  const [address, setAddress] = useState("");
  const [requiredSkillsText, setRequiredSkillsText] = useState("");

  const [evvStatus, setEvvStatus] = useState<RealTimeVisit["evvStatus"]>("Not Started");
  const [clockInLocation, setClockInLocation] = useState<ClockLocationType>(
    "Client Residential Address"
  );
  const [clockOutLocation, setClockOutLocation] =
    useState<ClockLocationType>("Same as clock in");
  const [clockInActual, setClockInActual] = useState("");
  const [clockOutActual, setClockOutActual] = useState("");
  const [travelMinutes, setTravelMinutes] = useState(0);
  const [distanceMiles, setDistanceMiles] = useState(0);

  const [authorizationNumber, setAuthorizationNumber] = useState("");
  const [authorizedWeeklyCap, setAuthorizedWeeklyCap] = useState(40);
  const [careNoteStatus, setCareNoteStatus] = useState<CareNoteStatus>("Pending");
  const [billRate, setBillRate] = useState(0);
  const [payRate, setPayRate] = useState(0);
  const [billableHours, setBillableHours] = useState(0);
  const [payableHours, setPayableHours] = useState(0);
  const [memo, setMemo] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [clientInstructions, setClientInstructions] = useState("");
  const [visitInstructions, setVisitInstructions] = useState("");
  const [partialCompletion, setPartialCompletion] = useState(false);
  const [partialReason, setPartialReason] = useState("");
  const [editScope, setEditScope] = useState<RecurringEditScope>("this_visit");

  useEffect(() => {
    const load = () => {
      setIsMounted(true);
      const ctx = getSyncedSchedulingContext();
      setClients(ctx.clients);
      setCaregivers(ctx.caregivers);

      const stored = getVisitsFromStorage();
      setAllVisits(stored);

      const found = getVisitById(visitId);
      if (found) {
        setVisit(found);
        setStatus(found.status);
        setModificationReason(
          found.modificationReason || "None / Original Schedule"
        );
        setDate(found.date);
        setStartTime(found.startTime);
        setEndTime(found.endTime);

        setClientId(found.clientId);
        setCaregiverId(found.caregiverId || "");
        setServiceId(found.serviceId);
        setAddress(found.address);
        setRequiredSkillsText((found.requiredSkills || []).join(", "));

        setEvvStatus(found.evvStatus);
        setClockInLocation(found.clockInLocation);
        setClockOutLocation(found.clockOutLocation);
        setClockInActual(found.clockInActual || "");
        setClockOutActual(found.clockOutActual || "");
        setTravelMinutes(found.travelMinutes);
        setDistanceMiles(found.distanceMiles);

        setAuthorizationNumber(found.authorizationNumber);
        setAuthorizedWeeklyCap(found.authorizedWeeklyCap);
        setCareNoteStatus(found.careNoteStatus);
        setBillRate(found.billRate);
        setPayRate(found.payRate);
        setBillableHours(found.billableHours);
        setPayableHours(found.payableHours);
        setMemo(found.memo);
        setInternalNotes(found.internalNotes);
        setClientInstructions(found.clientInstructions || "");
        setVisitInstructions(found.visitInstructions || "");
        setPartialCompletion(Boolean(found.partialCompletion));
        setPartialReason(found.partialReason || "");
      }
    };
    queueMicrotask(load);
  }, [visitId]);

  const activeCaregivers = useMemo(
    () => caregivers.filter((c) => c.status === "Active"),
    [caregivers]
  );

  const liveDuration = useMemo(
    () => calculateDurationHours(startTime, endTime),
    [startTime, endTime]
  );

  const handleTimeChange = (newStart: string, newEnd: string) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    const dur = calculateDurationHours(newStart, newEnd);
    if (status !== "Missed") {
      setBillableHours(dur);
      setPayableHours(dur);
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">
          Loading Visit Editor...
        </p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center text-slate-500">
        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">
          Visit Record Not Found
        </h2>
        <Link
          href={baseListPath}
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3D6B22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Real-Time Scheduling</span>
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Visit date is required.");
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    const selectedCaregiver = caregivers.find((cg) => cg.id === caregiverId);
    const selectedService = LILISARE_SERVICES.find((s) => s.id === serviceId);

    const skills = requiredSkillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

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
      action: "Visit Updated (Edit Workspace)",
      reason: modificationReason,
      details: `${date} ${startTime}–${endTime} · Status: ${status} · Caregiver: ${selectedCaregiver?.name || "Unassigned"}`,
    };

    const updated: RealTimeVisit = {
      ...visit,
      status,
      modificationReason,
      isModifiedFromSchedule:
        visit.isModifiedFromSchedule ||
        modificationReason !== "None / Original Schedule",
      date,
      startTime,
      endTime,
      scheduledHours: liveDuration,
      clientId: selectedClient?.id || visit.clientId,
      clientName: selectedClient?.name || visit.clientName,
      householdId: selectedClient?.household?.id || visit.householdId,
      householdName: selectedClient?.household?.name || visit.householdName,
      clientRegion: selectedClient?.household?.city || visit.clientRegion,
      address: address.trim() || visit.address,
      caregiverId: selectedCaregiver ? selectedCaregiver.id : null,
      caregiverName: selectedCaregiver ? selectedCaregiver.name : null,
      caregiverClass: selectedCaregiver
        ? `${selectedCaregiver.type} (${selectedCaregiver.employmentClassification})`
        : undefined,
      caregiverRegion: selectedCaregiver
        ? selectedCaregiver.personalInfo?.address?.city || visit.caregiverRegion
        : undefined,
      serviceId: selectedService?.id || visit.serviceId,
      serviceCode: selectedService?.code || visit.serviceCode,
      serviceName: selectedService?.name || visit.serviceName,
      unitType: selectedService?.unitType || visit.unitType,
      requiredSkills: skills.length > 0 ? skills : visit.requiredSkills,
      evvStatus,
      clockInLocation,
      clockOutLocation,
      clockInActual: clockInActual.trim() || undefined,
      clockOutActual: clockOutActual.trim() || undefined,
      travelMinutes: Number(travelMinutes) || 0,
      distanceMiles: Number(distanceMiles) || 0,
      authorizationNumber: authorizationNumber.trim(),
      authorizedWeeklyCap: Number(authorizedWeeklyCap) || 0,
      careNoteStatus,
      billRate: canEditFinancials ? Number(billRate) || 0 : visit.billRate,
      payRate: canEditFinancials ? Number(payRate) || 0 : visit.payRate,
      billableHours: canEditFinancials
        ? Number(billableHours) || 0
        : visit.billableHours,
      payableHours: canEditFinancials
        ? Number(payableHours) || 0
        : visit.payableHours,
      memo: memo.trim(),
      internalNotes: internalNotes.trim(),
      clientInstructions: clientInstructions.trim() || undefined,
      visitInstructions: visitInstructions.trim() || undefined,
      partialCompletion,
      partialReason: partialCompletion ? partialReason.trim() || undefined : undefined,
      auditTrail: [auditEntry, ...(visit.auditTrail || [])],
    };

    const exists = allVisits.some((v) => v.id === updated.id);
    let nextList: RealTimeVisit[];
    if (exists && visit.seriesId && editScope !== "this_visit") {
      nextList = applyRecurringVisitEdit(
        allVisits,
        visit,
        {
          status,
          modificationReason,
          startTime,
          endTime,
          caregiverId: updated.caregiverId,
          caregiverName: updated.caregiverName,
          caregiverClass: updated.caregiverClass,
          serviceId: updated.serviceId,
          serviceCode: updated.serviceCode,
          serviceName: updated.serviceName,
          memo: updated.memo,
          clientInstructions: updated.clientInstructions,
          visitInstructions: updated.visitInstructions,
          clockInLocation,
          clockOutLocation,
        },
        editScope,
        perms.actorName,
        perms.roleLabel
      );
    } else {
      nextList = exists
        ? allVisits.map((v) => (v.id === updated.id ? updated : v))
        : [updated, ...allVisits];
    }

    const withConflicts = nextList.map((v) => ({
      ...v,
      conflicts: computeVisitConflicts(v, nextList),
    }));

    saveVisitsToStorage(withConflicts);
    toast.success(
      visit.seriesId && editScope !== "this_visit"
        ? `Updated ${editScope === "this_and_future" ? "this & future visits" : "entire recurring series"}!`
        : `Visit ${updated.id} (${updated.clientName}) updated successfully!`
    );
    router.push(`/${portal}/scheduling/${updated.id}/`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header & Breadcrumb (Mirrors AdminIntakeReferralEditView & ClientEditView) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <Link
            href={baseDetailPath}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Visit Profile ({visit.id})</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Visit: {visit.clientName}
          </h1>
          <p className="text-xs text-slate-500">
            Update schedule window, caregiver assignment, EVV rules, authorization caps, and shift notes.
          </p>
        </div>

        <span className="text-xs font-bold bg-[#E3F1D9] text-[#1E5622] px-3 py-1.5 rounded-full border border-[#1E5622]/20 self-start sm:self-auto">
          {visit.id} · {visit.shiftNumber} · {status}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {visit.seriesId && (
          <Card className="p-4 sm:p-5 border-amber-200 bg-amber-50/50 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recurring Visit Series ({visit.recurrencePattern || "weekly"})
                </h3>
                <p className="text-xs text-slate-600">
                  Choose whether your changes apply only to this date or across the recurring series.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: "this_visit", label: "Only this visit" },
                    { id: "this_and_future", label: "This & future visits" },
                    { id: "entire_series", label: "Entire series" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEditScope(opt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      editScope === opt.id
                        ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
        {/* Section 1: Schedule Window & Visit Status */}
        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="1. Schedule Window & Visit Status"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel required>Visit Status</FormLabel>
              <FormSelect
                value={status}
                onChange={(e) => setStatus(e.target.value as VisitStatus)}
              >
                {ALL_VISIT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div className="sm:col-span-2">
              <FormLabel>Modification Reason</FormLabel>
              <FormSelect
                value={modificationReason}
                onChange={(e) => setModificationReason(e.target.value)}
              >
                {MODIFICATION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel required>Visit Date</FormLabel>
              <FormInput
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <FormLabel required>Start Time</FormLabel>
              <FormInput
                type="time"
                required
                value={startTime}
                onChange={(e) => handleTimeChange(e.target.value, endTime)}
              />
            </div>
            <div>
              <FormLabel required>
                End Time (Duration: {formatHoursShort(liveDuration)})
              </FormLabel>
              <FormInput
                type="time"
                required
                value={endTime}
                onChange={(e) => handleTimeChange(startTime, e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Client, Caregiver & Service Assignment */}
        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="2. Client, Caregiver & Service Assignment"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel required>Client</FormLabel>
              <FormSelect
                value={clientId}
                onChange={(e) => {
                  const c = clients.find((x) => x.id === e.target.value);
                  setClientId(e.target.value);
                  if (c?.household?.address) {
                    setAddress(
                      `${c.household.address}, ${c.household.city}, ${c.household.state} ${c.household.zip}`
                    );
                  }
                }}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </FormSelect>
            </div>

            <div>
              <FormLabel>Assigned Caregiver</FormLabel>
              <FormSelect
                value={caregiverId}
                onChange={(e) => {
                  const nextCgId = e.target.value;
                  setCaregiverId(nextCgId);
                  if (!nextCgId) {
                    setStatus("Unassigned");
                  } else if (status === "Unassigned") {
                    setStatus("Scheduled");
                  }
                }}
              >
                <option value="">Unassigned (Open Shift)</option>
                {activeCaregivers.map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name} ({cg.employmentClassification})
                  </option>
                ))}
              </FormSelect>
            </div>

            <div>
              <FormLabel>Service Line</FormLabel>
              <FormSelect
                value={serviceId}
                onChange={(e) => {
                  const svc = LILISARE_SERVICES.find(
                    (s) => s.id === e.target.value
                  );
                  setServiceId(e.target.value);
                  if (svc && canEditFinancials) {
                    setBillRate(
                      parseFloat(svc.defaultBillRate.replace(/[^0-9.]/g, "")) ||
                      billRate
                    );
                    setPayRate(
                      parseFloat(svc.defaultPayRate.replace(/[^0-9.]/g, "")) ||
                      payRate
                    );
                  }
                }}
              >
                {LILISARE_SERVICES.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.code} · {svc.shortName}
                    {canViewFinancials ? ` (${svc.defaultBillRate})` : ""}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Service Address</FormLabel>
              <FormInput
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Required Skills (comma-separated)</FormLabel>
              <FormInput
                type="text"
                value={requiredSkillsText}
                onChange={(e) => setRequiredSkillsText(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Section 3: EVV Rules & Logistics */}
        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="3. EVV Rules & Clinical Logistics"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel>EVV Verification Status</FormLabel>
              <FormSelect
                value={evvStatus}
                onChange={(e) =>
                  setEvvStatus(e.target.value as RealTimeVisit["evvStatus"])
                }
              >
                <option value="Not Started">Not Started</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Exception">Exception</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel>Clock-In Location Rule</FormLabel>
              <FormSelect
                value={clockInLocation}
                onChange={(e) =>
                  setClockInLocation(e.target.value as ClockLocationType)
                }
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
              </FormSelect>
            </div>
            <div>
              <FormLabel>Clock-Out Location Rule</FormLabel>
              <FormSelect
                value={clockOutLocation}
                onChange={(e) =>
                  setClockOutLocation(e.target.value as ClockLocationType)
                }
              >
                <option value="Same as clock in">Same as clock in</option>
                <option value="Client Residential Address">
                  Client Residential Address
                </option>
                <option value="Any profile address">Any profile address</option>
              </FormSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <FormLabel>Clock-In Actual</FormLabel>
              <FormInput
                type="text"
                value={clockInActual}
                placeholder="e.g. 08:02"
                onChange={(e) => setClockInActual(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Clock-Out Actual</FormLabel>
              <FormInput
                type="text"
                value={clockOutActual}
                placeholder="e.g. 16:00"
                onChange={(e) => setClockOutActual(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Travel Minutes</FormLabel>
              <FormInput
                type="number"
                min={0}
                value={travelMinutes}
                onChange={(e) => setTravelMinutes(Number(e.target.value))}
              />
            </div>
            <div>
              <FormLabel>Distance (mi)</FormLabel>
              <FormInput
                type="number"
                min={0}
                step="0.1"
                value={distanceMiles}
                onChange={(e) => setDistanceMiles(Number(e.target.value))}
              />
            </div>
          </div>
        </Card>

        {/* Section 4: Authorization, Financials & Shift Notes */}
        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="4. Authorization, Financials & Shift Notes"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel>Authorization #</FormLabel>
              <FormInput
                type="text"
                value={authorizationNumber}
                onChange={(e) => setAuthorizationNumber(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Weekly Authorized Cap (hrs)</FormLabel>
              <FormInput
                type="number"
                min={0}
                value={authorizedWeeklyCap}
                onChange={(e) => setAuthorizedWeeklyCap(Number(e.target.value))}
              />
            </div>
            <div>
              <FormLabel>Care Note Status</FormLabel>
              <FormSelect
                value={careNoteStatus}
                onChange={(e) =>
                  setCareNoteStatus(e.target.value as CareNoteStatus)
                }
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Missing">Missing</option>
              </FormSelect>
            </div>
          </div>

          {canViewFinancials ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <FormLabel>Bill Rate ($/hr)</FormLabel>
                <FormInput
                  type="number"
                  step="0.5"
                  disabled={!canEditFinancials}
                  value={billRate}
                  onChange={(e) => setBillRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <FormLabel>Pay Rate ($/hr)</FormLabel>
                <FormInput
                  type="number"
                  step="0.5"
                  disabled={!canEditFinancials}
                  value={payRate}
                  onChange={(e) => setPayRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <FormLabel>Billable Hours</FormLabel>
                <FormInput
                  type="number"
                  step="0.25"
                  disabled={!canEditFinancials}
                  value={billableHours}
                  onChange={(e) =>
                    setBillableHours(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div>
                <FormLabel>Payable Hours</FormLabel>
                <FormInput
                  type="number"
                  step="0.25"
                  disabled={!canEditFinancials}
                  value={payableHours}
                  onChange={(e) =>
                    setPayableHours(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Financial rates &amp; payroll margins are restricted to Agency Administrator.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Client-Specific Instructions (Caregiver Visible)</FormLabel>
              <FormTextarea
                rows={2}
                placeholder="Standing care preferences, allergies, communication cues..."
                value={clientInstructions}
                onChange={(e) => setClientInstructions(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Visit-Specific Instructions</FormLabel>
              <FormTextarea
                rows={2}
                placeholder="Shift-specific instructions for this visit..."
                value={visitInstructions}
                onChange={(e) => setVisitInstructions(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Caregiver Shift Memo</FormLabel>
              <FormTextarea
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Internal Coordinator Notes</FormLabel>
              <FormTextarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={partialCompletion}
                onChange={(e) => setPartialCompletion(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]"
              />
              <span>Mark as Partial Visit Completion</span>
            </label>
            {partialCompletion && (
              <div className="flex-1">
                <FormInput
                  placeholder="Reason for partial completion (e.g., Client requested early end for appointment)"
                  value={partialReason}
                  onChange={(e) => setPartialReason(e.target.value)}
                />
              </div>
            )}
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <FormButtonCancel onClick={() => router.push(baseDetailPath)}>
            Cancel
          </FormButtonCancel>
          <FormButtonPrimary type="submit">
            <Save className="w-4 h-4" />
            <span>Save Visit Changes</span>
          </FormButtonPrimary>
        </div>
      </form>
    </div>
  );
}
