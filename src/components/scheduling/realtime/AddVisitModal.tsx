"use client";

import React, { useState, useMemo } from "react";
import { CalendarPlus, Clock, MapPin, ShieldCheck, UserCheck, Repeat, Split, Plus, Trash2, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  FormSection,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";
import { RealTimeVisit, ClockLocationType, VisitStatus, RecurrencePattern } from "@/types/scheduling";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import { LILISARE_SERVICES } from "@/lib/services";
import { calculateDurationHours, generateRecurringVisitInstances } from "@/lib/scheduling/schedulingStore";
import { toast } from "sonner";

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVisit: (visit: RealTimeVisit) => void;
  onCreateVisits?: (visits: RealTimeVisit[]) => void;
  clients: ClientRecord[];
  caregivers: CaregiverRecord[];
  defaultClientId?: string;
  defaultCaregiverId?: string;
  defaultDate?: string;
  actorName: string;
  actorRole: string;
  canViewFinancials: boolean;
}

const WEEKDAY_OPTIONS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function AddVisitModal({
  isOpen,
  onClose,
  onCreateVisit,
  onCreateVisits,
  clients,
  caregivers,
  defaultClientId,
  defaultCaregiverId,
  defaultDate,
  actorName,
  actorRole,
  canViewFinancials,
}: AddVisitModalProps) {
  const [clientId, setClientId] = useState(defaultClientId || clients[0]?.id || "CL-1001");
  const [caregiverId, setCaregiverId] = useState(defaultCaregiverId || "");
  const [date, setDate] = useState(defaultDate || "2026-11-25");
  const [endDate, setEndDate] = useState("2026-12-18");
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>("one-time");
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  const [intervalWeeks, setIntervalWeeks] = useState<number>(1);
  const [exceptionDatesText, setExceptionDatesText] = useState<string>("");
  const [isSplitShift, setIsSplitShift] = useState<boolean>(false);
  const [segments, setSegments] = useState<Array<{ startTime: string; endTime: string; splitLabel: string }>>([
    { startTime: "09:00", endTime: "12:00", splitLabel: "Morning Segment" },
  ]);
  const [serviceId, setServiceId] = useState("svc-family-caregiver");
  const [status, setStatus] = useState<VisitStatus>(
    defaultCaregiverId ? "Scheduled" : "Unassigned"
  );
  const [clockInLocation, setClockInLocation] = useState<ClockLocationType>(
    "Client Residential Address"
  );
  const [clockOutLocation, setClockOutLocation] =
    useState<ClockLocationType>("Same as clock in");
  const [clientInstructions, setClientInstructions] = useState("");
  const [visitInstructions, setVisitInstructions] = useState("");
  const [memo, setMemo] = useState("");

  const startTime = segments[0]?.startTime || "09:00";
  const endTime = segments[0]?.endTime || "12:00";

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId) || clients[0],
    [clients, clientId]
  );

  const activeCaregivers = useMemo(
    () => caregivers.filter((cg) => cg.status === "Active"),
    [caregivers]
  );

  const selectedService = useMemo(
    () => LILISARE_SERVICES.find((s) => s.id === serviceId) || LILISARE_SERVICES[1],
    [serviceId]
  );

  const duration = useMemo(
    () =>
      segments.reduce(
        (sum, seg) => sum + calculateDurationHours(seg.startTime, seg.endTime),
        0
      ),
    [segments]
  );

  const toggleWeekday = (dayVal: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(dayVal) ? prev.filter((d) => d !== dayVal) : [...prev, dayVal].sort()
    );
  };

  const toggleSplitShift = () => {
    if (!isSplitShift) {
      setIsSplitShift(true);
      setSegments([
        { startTime: segments[0]?.startTime || "08:00", endTime: segments[0]?.endTime || "12:00", splitLabel: "Morning Split" },
        { startTime: "16:00", endTime: "19:00", splitLabel: "Evening Split" },
      ]);
    } else {
      setIsSplitShift(false);
      setSegments([segments[0] || { startTime: "09:00", endTime: "12:00", splitLabel: "Morning Segment" }]);
    }
  };

  const handleCaregiverSelect = (val: string) => {
    setCaregiverId(val);
    if (!val) {
      setStatus("Unassigned");
    } else if (status === "Unassigned") {
      setStatus("Scheduled");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast.error("Please select a client.");
      return;
    }
    if (duration <= 0) {
      toast.error("Shift duration must be greater than 0 hours.");
      return;
    }
    if ((recurrencePattern === "weekly" || recurrencePattern === "custom") && selectedWeekdays.length === 0) {
      toast.error("Select at least one weekday for recurring visits.");
      return;
    }

    const assignedCg = caregivers.find((c) => c.id === caregiverId) || null;
    const effectiveStatus: VisitStatus = !assignedCg
      ? status === "Standalone"
        ? "Standalone"
        : "Unassigned"
      : status === "Unassigned"
        ? "Scheduled"
        : status;

    const billRateNum = parseFloat(selectedService.defaultBillRate.replace(/[^0-9.]/g, "")) || 32.0;
    const payRateNum = parseFloat(selectedService.defaultPayRate.replace(/[^0-9.]/g, "")) || 21.0;

    const exceptionDates = exceptionDatesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const generated = generateRecurringVisitInstances({
      pattern: recurrencePattern,
      startDate: date,
      endDate: recurrencePattern === "one-time" ? date : endDate || date,
      weekdays: selectedWeekdays,
      intervalWeeks,
      exceptionDates,
      segments,
      baseVisit: {
        status: effectiveStatus,
        isModifiedFromSchedule: false,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientAdmin: selectedClient.agencyInfo?.administrator || "Dana Jenkins, MSW",
        clientClass: selectedClient.careType || "Family Care",
        clientRegion: selectedClient.household?.city || "Springfield",
        householdId: selectedClient.household?.id || "hh-1001",
        householdName: selectedClient.household?.name || `${selectedClient.name} Household`,
        address: `${selectedClient.household?.address || ""}, ${selectedClient.household?.city || ""}, ${selectedClient.household?.state || ""} ${selectedClient.household?.zip || ""}`.trim(),
        caregiverId: assignedCg?.id || null,
        caregiverName: assignedCg?.name || null,
        caregiverAdmin: assignedCg ? "Dana Jenkins, MSW" : undefined,
        caregiverClass: assignedCg
          ? `${assignedCg.type} (${assignedCg.employmentClassification})`
          : undefined,
        caregiverRegion: assignedCg?.personalInfo?.address?.city || undefined,
        serviceId: selectedService.id,
        serviceCode: selectedService.code,
        serviceName: selectedService.name,
        unitType: selectedService.unitType,
        billRate: billRateNum,
        payRate: payRateNum,
        authorizationNumber: selectedClient.authorization?.authNumber || "AUTH-2026-NEW",
        authorizedWeeklyCap: selectedClient.carePlan?.authorizedWeeklyHours || 40,
        clockInLocation,
        clockOutLocation,
        evvStatus: "Not Started",
        careNoteStatus: "Pending",
        requiredSkills: selectedClient.carePlan?.careNeeds?.slice(0, 3) || ["Personal Care", "ADL Support"],
        travelMinutes: assignedCg ? 12 : 18,
        distanceMiles: assignedCg ? 3.8 : 6.2,
        conflicts: [],
        memo: memo.trim() || `Scheduled ${selectedService.shortName} visit for ${selectedClient.name}.`,
        clientInstructions: clientInstructions.trim() || undefined,
        visitInstructions: visitInstructions.trim() || undefined,
        internalNotes: "",
        broadcasts: [],
        publishedAt: new Date().toISOString(),
        auditTrail: [
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            actor: actorName,
            actorRole,
            action: recurrencePattern === "one-time" ? "Visit Created" : `Recurring Series Created (${recurrencePattern})`,
            details: `Scheduled ${selectedService.code}${isSplitShift ? " (Split Shift)" : ""} starting ${date}.`,
          },
        ],
      },
    });

    if (generated.length === 0) {
      toast.error("No visits matched the selected date range and exception rules.");
      return;
    }

    if (onCreateVisits) {
      onCreateVisits(generated);
    } else {
      generated.forEach((v) => onCreateVisit(v));
    }

    toast.success(
      generated.length === 1
        ? `Visit ${generated[0].id} added to Real-Time Schedule`
        : `${generated.length} visits created (${recurrencePattern}${isSplitShift ? " · split shifts" : ""})`
    );
    setMemo("");
    setClientInstructions("");
    setVisitInstructions("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule New Visit"
      icon={<CalendarPlus className="w-5 h-5" />}
      maxWidth="3xl"
      footer={
        <>
          <FormButtonCancel onClick={onClose} />
          <FormButtonPrimary type="submit" form="add-realtime-visit-form">
            <CalendarPlus className="w-4 h-4" />
            <span>Create Visit ({duration}h)</span>
          </FormButtonPrimary>
        </>
      }
    >
      <form id="add-realtime-visit-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FormSection title="Client & Caregiver Assignment" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel required htmlFor="add-visit-client">
                Client
              </FormLabel>
              <FormSelect
                id="add-visit-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) — {c.household?.city || "Local"}
                  </option>
                ))}
              </FormSelect>
              {selectedClient && (
                <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>
                    Auth Cap: {selectedClient.carePlan?.authorizedWeeklyHours || 40}h/wk ·{" "}
                    {selectedClient.household?.name}
                  </span>
                </p>
              )}
            </div>

            <div>
              <FormLabel htmlFor="add-visit-caregiver">Caregiver (Active Only)</FormLabel>
              <FormSelect
                id="add-visit-caregiver"
                value={caregiverId}
                onChange={(e) => handleCaregiverSelect(e.target.value)}
              >
                <option value="">Unassigned (Open Shift)</option>
                {activeCaregivers.map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name} — {cg.type} ({cg.employmentClassification})
                  </option>
                ))}
              </FormSelect>
              <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
                <span>Only cleared & activated caregivers are eligible for scheduling.</span>
              </p>
            </div>
          </div>
        </div>

        <div>
          <FormSection title="Recurrence, Date & Split Shifts" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3">
            <div>
              <FormLabel htmlFor="add-visit-recurrence">Recurrence Pattern</FormLabel>
              <FormSelect
                id="add-visit-recurrence"
                icon={<Repeat className="w-4 h-4" />}
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
              >
                <option value="one-time">One-time visit</option>
                <option value="daily">Daily recurring</option>
                <option value="weekly">Weekly recurring</option>
                <option value="custom">Custom recurring pattern</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel required htmlFor="add-visit-date">
                {recurrencePattern === "one-time" ? "Visit Date" : "Start Date"}
              </FormLabel>
              <FormInput
                id="add-visit-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            {recurrencePattern !== "one-time" && (
              <div>
                <FormLabel required htmlFor="add-visit-end-date">
                  End Date
                </FormLabel>
                <FormInput
                  id="add-visit-end-date"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {(recurrencePattern === "weekly" || recurrencePattern === "custom") && (
            <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">Repeat on Weekdays</span>
                {recurrencePattern === "custom" && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Every</span>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={intervalWeeks}
                      onChange={(e) => setIntervalWeeks(Math.max(1, Number(e.target.value)))}
                      className="w-12 px-2 py-1 rounded-lg border border-slate-200 bg-white text-center font-bold text-slate-800"
                    />
                    <span className="text-slate-500">week(s)</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_OPTIONS.map((wd) => {
                  const active = selectedWeekdays.includes(wd.value);
                  return (
                    <button
                      key={wd.value}
                      type="button"
                      onClick={() => toggleWeekday(wd.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        active
                          ? "bg-[#3D6B22] text-white border-[#3D6B22]"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {wd.label}
                    </button>
                  );
                })}
              </div>
              <div>
                <FormLabel htmlFor="add-visit-exceptions">
                  Holiday / Exception Dates (comma-separated YYYY-MM-DD)
                </FormLabel>
                <FormInput
                  id="add-visit-exceptions"
                  placeholder="e.g. 2026-11-26, 2026-12-25"
                  value={exceptionDatesText}
                  onChange={(e) => setExceptionDatesText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Split Shift & Time Segments */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Visit Time Window(s)</span>
              <button
                type="button"
                onClick={toggleSplitShift}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isSplitShift
                    ? "bg-amber-50 text-amber-800 border-amber-300"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>{isSplitShift ? "Split Shift Enabled (Separate EVV Records)" : "Add Split Shift"}</span>
              </button>
            </div>

            {segments.map((seg, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end p-2.5 rounded-xl bg-slate-50/70 border border-slate-200">
                {isSplitShift && (
                  <div className="sm:col-span-4">
                    <FormLabel>Segment Label</FormLabel>
                    <FormInput
                      value={seg.splitLabel}
                      onChange={(e) =>
                        setSegments((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, splitLabel: e.target.value } : s))
                        )
                      }
                      placeholder={`Split ${idx + 1}`}
                    />
                  </div>
                )}
                <div className={isSplitShift ? "sm:col-span-3" : "sm:col-span-6"}>
                  <FormLabel required>Start Time</FormLabel>
                  <FormInput
                    type="time"
                    required
                    value={seg.startTime}
                    onChange={(e) =>
                      setSegments((prev) =>
                        prev.map((s, i) => (i === idx ? { ...s, startTime: e.target.value } : s))
                      )
                    }
                  />
                </div>
                <div className={isSplitShift ? "sm:col-span-3" : "sm:col-span-6"}>
                  <FormLabel required>End Time</FormLabel>
                  <FormInput
                    type="time"
                    required
                    value={seg.endTime}
                    onChange={(e) =>
                      setSegments((prev) =>
                        prev.map((s, i) => (i === idx ? { ...s, endTime: e.target.value } : s))
                      )
                    }
                  />
                </div>
                {isSplitShift && (
                  <div className="sm:col-span-2 flex justify-end gap-1">
                    {segments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSegments((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Remove segment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {idx === segments.length - 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSegments((prev) => [
                            ...prev,
                            { startTime: "18:00", endTime: "20:00", splitLabel: `Split ${prev.length + 1}` },
                          ])
                        }
                        className="p-2 rounded-lg text-[#3D6B22] hover:bg-[#E3F1D9] cursor-pointer"
                        title="Add another segment"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F2F8EE] border border-[#C7E4B3] text-xs">
            <span className="font-semibold text-[#1E5622] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Calculated Daily Duration ({segments.length} {segments.length > 1 ? "split records" : "visit"})
            </span>
            <span className="font-extrabold text-[#3D6B22]">{duration} hrs</span>
          </div>
        </div>

        <div>
          <FormSection title="Service Line & EVV Locations" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel required htmlFor="add-visit-service">
                LiliSare Service Code
              </FormLabel>
              <FormSelect
                id="add-visit-service"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
              >
                {LILISARE_SERVICES.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.code} · {svc.shortName}
                    {canViewFinancials ? ` (${svc.defaultBillRate})` : ""}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div>
              <FormLabel htmlFor="add-visit-status">Initial Visit Status</FormLabel>
              <FormSelect
                id="add-visit-status"
                value={caregiverId ? status : status === "Standalone" ? "Standalone" : "Unassigned"}
                onChange={(e) => setStatus(e.target.value as VisitStatus)}
              >
                <option value="Unassigned">Unassigned (Open)</option>
                <option value="Scheduled" disabled={!caregiverId}>
                  Scheduled
                </option>
                <option value="Standalone">Standalone</option>
              </FormSelect>
            </div>

            <div>
              <FormLabel htmlFor="add-visit-clockin">Clock-In Location</FormLabel>
              <FormSelect
                id="add-visit-clockin"
                icon={<MapPin className="w-4 h-4" />}
                value={clockInLocation}
                onChange={(e) => setClockInLocation(e.target.value as ClockLocationType)}
              >
                <option value="Client Residential Address">Client Residential Address</option>
                <option value="Any profile address">Any profile address</option>
                <option value="Household Primary Address">Household Primary Address</option>
                <option value="Community Outing (Approved)">Community Outing (Approved)</option>
              </FormSelect>
            </div>

            <div>
              <FormLabel htmlFor="add-visit-clockout">Clock-Out Location</FormLabel>
              <FormSelect
                id="add-visit-clockout"
                icon={<MapPin className="w-4 h-4" />}
                value={clockOutLocation}
                onChange={(e) => setClockOutLocation(e.target.value as ClockLocationType)}
              >
                <option value="Same as clock in">Same as clock in</option>
                <option value="Client Residential Address">Client Residential Address</option>
                <option value="Any profile address">Any profile address</option>
              </FormSelect>
            </div>
          </div>
        </div>

        <div>
          <FormSection title="Client & Visit-Specific Instructions" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3">
            <div>
              <FormLabel htmlFor="add-client-instructions">Client-Specific Instructions</FormLabel>
              <FormTextarea
                id="add-client-instructions"
                rows={2}
                placeholder="Standing care preferences, allergies, communication cues..."
                value={clientInstructions}
                onChange={(e) => setClientInstructions(e.target.value)}
              />
            </div>
            <div>
              <FormLabel htmlFor="add-visit-instructions">Visit-Specific Instructions</FormLabel>
              <FormTextarea
                id="add-visit-instructions"
                rows={2}
                placeholder="Instructions for this shift only (e.g., escort to PT, prep dinner)..."
                value={visitInstructions}
                onChange={(e) => setVisitInstructions(e.target.value)}
              />
            </div>
          </div>
          <FormLabel htmlFor="add-visit-memo">Caregiver Shift Memo</FormLabel>
          <FormTextarea
            id="add-visit-memo"
            rows={2}
            placeholder="Special ADL instructions, gate codes, or clinical alerts for caregiver..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
