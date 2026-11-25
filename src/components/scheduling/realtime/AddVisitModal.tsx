"use client";

import React, { useState, useMemo } from "react";
import { CalendarPlus, Clock, MapPin, ShieldCheck, UserCheck } from "lucide-react";
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
import { RealTimeVisit, ClockLocationType, VisitStatus } from "@/types/scheduling";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import { LILISARE_SERVICES } from "@/lib/services";
import { calculateDurationHours } from "@/lib/scheduling/schedulingStore";
import { toast } from "sonner";

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVisit: (visit: RealTimeVisit) => void;
  clients: ClientRecord[];
  caregivers: CaregiverRecord[];
  defaultClientId?: string;
  defaultCaregiverId?: string;
  defaultDate?: string;
  actorName: string;
  actorRole: string;
  canViewFinancials: boolean;
}

export function AddVisitModal({
  isOpen,
  onClose,
  onCreateVisit,
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
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [serviceId, setServiceId] = useState("svc-family-caregiver");
  const [status, setStatus] = useState<VisitStatus>(
    defaultCaregiverId ? "Scheduled" : "Unassigned"
  );
  const [clockInLocation, setClockInLocation] = useState<ClockLocationType>(
    "Client Residential Address"
  );
  const [clockOutLocation, setClockOutLocation] =
    useState<ClockLocationType>("Same as clock in");
  const [memo, setMemo] = useState("");

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
    () => calculateDurationHours(startTime, endTime),
    [startTime, endTime]
  );

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

    const visitNum = Math.floor(440 + Math.random() * 500);
    const newVisit: RealTimeVisit = {
      id: `VIS-${visitNum + 1000}`,
      shiftNumber: `#${visitNum}`,
      date,
      startTime,
      endTime,
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
      billableHours: duration,
      payableHours: duration,
      scheduledHours: duration,
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
      internalNotes: "",
      broadcasts: [],
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
          action: "Visit Created",
          details: `Scheduled ${duration}h ${selectedService.code} visit on ${date} (${startTime}–${endTime}).`,
        },
      ],
    };

    onCreateVisit(newVisit);
    toast.success(`Visit ${newVisit.id} added to Real-Time Schedule`);
    setMemo("");
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
          <FormSection title="Date, Time Window & Live Duration" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 items-end">
            <div className="sm:col-span-2">
              <FormLabel required htmlFor="add-visit-date">
                Visit Date
              </FormLabel>
              <FormInput
                id="add-visit-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <FormLabel required htmlFor="add-visit-start">
                Start Time
              </FormLabel>
              <FormInput
                id="add-visit-start"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <FormLabel required htmlFor="add-visit-end">
                End Time
              </FormLabel>
              <FormInput
                id="add-visit-end"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F2F8EE] border border-[#C7E4B3] text-xs">
            <span className="font-semibold text-[#1E5622] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Calculated Visit Duration
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
