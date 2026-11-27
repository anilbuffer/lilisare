"use client";

import React, { useMemo, useState } from "react";
import {
  Bell,
  CalendarPlus,
  FileWarning,
  Flag,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import {
  FormButtonCancel,
  FormButtonPrimary,
  FormInput,
  FormLabel,
  FormSection,
  FormSelect,
  FormTextarea,
} from "@/components/ui/FormControls";
import {
  ClinicalFollowUp,
  ClinicalVisit,
  PriorityLevel,
  VisitDeliveryMethod,
} from "@/types/clinicalSupervisory";
import {
  ClinicalActorContext,
  isProfessionalEligibleForType,
} from "@/lib/admin/clinicalAuthGuard";
import {
  CLINICAL_PROFESSIONALS,
  DEMO_TODAY,
  INTERNAL_OWNERS,
  assignClinicalProfessional,
  createClinicalFollowUp,
  requestMissingDocumentation,
  scheduleOrRescheduleClinicalVisit,
  sendMockClinicalReminder,
} from "@/lib/admin/clinicalSupervisoryStore";

export function AssignProfessionalModal({
  visit,
  actor,
  onClose,
  onSuccess,
}: {
  visit: ClinicalVisit | null;
  actor: ClinicalActorContext;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return (
    <Modal
      isOpen={Boolean(visit)}
      onClose={onClose}
      title="Assign Eligible Professional"
      description={
        visit
          ? `${visit.clientName} • Requires: ${visit.professionalQualification}`
          : undefined
      }
      icon={<UserCheck className="w-5 h-5" />}
      maxWidth="2xl"
    >
      {visit && (
        <AssignProfessionalForm
          key={`${visit.id}-${visit.professionalId || "unassigned"}`}
          visit={visit}
          actor={actor}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}

function AssignProfessionalForm({
  visit,
  actor,
  onClose,
  onSuccess,
}: {
  visit: ClinicalVisit;
  actor: ClinicalActorContext;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const eligible = useMemo(() => {
    return CLINICAL_PROFESSIONALS.filter((p) =>
      isProfessionalEligibleForType(p, visit.professionalQualification)
    );
  }, [visit]);

  const [selectedId, setSelectedId] = useState(
    visit.professionalId || eligible[0]?.id || ""
  );
  const [reason, setReason] = useState(
    "Assigned eligible clinical/supervisory professional."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      toast.error("Please select an eligible professional.");
      return;
    }
    try {
      assignClinicalProfessional(visit.id, selectedId, actor, reason);
      toast.success(`Assigned professional for ${visit.clientName}`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assignment failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
        <div className="font-bold text-[#3D6B22] flex items-center gap-1.5 mb-0.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Qualification Guard Active</span>
        </div>
        Only professionals holding active credentials matching{" "}
        <strong>{visit.professionalQualification}</strong> are shown below.
      </div>

      <div>
        <FormLabel required>Eligible Professional</FormLabel>
        <FormSelect
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          required
        >
          <option value="">Select eligible professional...</option>
          {eligible.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.roleTitle} ({p.licenseNumber} · {p.activeCaseloadCount} active)
            </option>
          ))}
        </FormSelect>
      </div>

      <div>
        <FormLabel>Assignment Reason / Operational Note</FormLabel>
        <FormTextarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Record reason for assignment or reassignment..."
        />
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <FormButtonCancel onClick={onClose} />
        <FormButtonPrimary type="submit">Confirm Assignment</FormButtonPrimary>
      </div>
    </form>
  );
}

export function ScheduleClinicalVisitModal({
  visit,
  actor,
  onClose,
  onSuccess,
}: {
  visit: ClinicalVisit | null;
  actor: ClinicalActorContext;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return (
    <Modal
      isOpen={Boolean(visit)}
      onClose={onClose}
      title={visit?.scheduledDate ? "Reschedule Clinical Visit" : "Schedule Clinical Visit"}
      description={
        visit
          ? `${visit.clientName} • ${visit.visitType} (syncs to Scheduling module)`
          : undefined
      }
      icon={<CalendarPlus className="w-5 h-5" />}
      maxWidth="xl"
    >
      {visit && (
        <ScheduleClinicalVisitForm
          key={`${visit.id}-${visit.scheduledDate || "unscheduled"}-${visit.scheduledStartTime || ""}-${visit.deliveryMethod}`}
          visit={visit}
          actor={actor}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}

function ScheduleClinicalVisitForm({
  visit,
  actor,
  onClose,
  onSuccess,
}: {
  visit: ClinicalVisit;
  actor: ClinicalActorContext;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const eligible = useMemo(() => {
    return CLINICAL_PROFESSIONALS.filter((p) =>
      isProfessionalEligibleForType(p, visit.professionalQualification)
    );
  }, [visit]);

  const [date, setDate] = useState(visit.scheduledDate || visit.dueDate || DEMO_TODAY);
  const [startTime, setStartTime] = useState(visit.scheduledStartTime || "10:00");
  const [endTime, setEndTime] = useState(visit.scheduledEndTime || "11:00");
  const [deliveryMethod, setDeliveryMethod] = useState<VisitDeliveryMethod>(
    visit.deliveryMethod || "In-home"
  );
  const [professionalId, setProfessionalId] = useState(
    visit.professionalId || eligible[0]?.id || ""
  );
  const [notes, setNotes] = useState(visit.operationalNotes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      toast.error("Please select a visit date and time window.");
      return;
    }
    try {
      const res = scheduleOrRescheduleClinicalVisit(
        visit.id,
        {
          date,
          startTime,
          endTime,
          deliveryMethod,
          professionalId: professionalId || null,
          notes,
        },
        actor
      );
      toast.success(
        `Visit ${visit.scheduledDate ? "rescheduled" : "scheduled"} & linked to Scheduling (${res.scheduledVisitId})`
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scheduling failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title="Appointment & Scheduling Sync" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <FormLabel required>Visit Date</FormLabel>
          <FormInput
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <FormLabel required>Start Time</FormLabel>
          <FormInput
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <FormLabel required>End Time</FormLabel>
          <FormInput
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <FormLabel required>Assigned Professional ({visit.professionalQualification})</FormLabel>
          <FormSelect
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
          >
            <option value="">Leave Unassigned</option>
            {eligible.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.qualificationType})
              </option>
            ))}
          </FormSelect>
        </div>
        <div>
          <FormLabel required>Delivery Method</FormLabel>
          <FormSelect
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value as VisitDeliveryMethod)}
          >
            <option value="In-home">In-home</option>
            <option value="Virtual">Virtual</option>
            <option value="Other approved method">Other approved method</option>
          </FormSelect>
        </div>
      </div>

      <div>
        <FormLabel>Scheduling Coordination Notes</FormLabel>
        <FormTextarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instructions for clinical supervisor, telehealth link prep, or family timing..."
        />
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <FormButtonCancel onClick={onClose} />
        <FormButtonPrimary type="submit">
          {visit.scheduledDate ? "Save Rescheduled Visit" : "Schedule & Link Visit"}
        </FormButtonPrimary>
      </div>
    </form>
  );
}

export function CreateFollowUpModal({
  visit,
  actor,
  defaultEscalate = false,
  onClose,
  onSuccess,
}: {
  visit: ClinicalVisit | null;
  actor: ClinicalActorContext;
  defaultEscalate?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return (
    <Modal
      isOpen={Boolean(visit)}
      onClose={onClose}
      title={defaultEscalate ? "Escalate Clinical / Operational Issue" : "Create Operational Follow-up"}
      description={visit ? `${visit.clientName} • ${visit.id}` : undefined}
      icon={<Flag className="w-5 h-5" />}
      maxWidth="2xl"
    >
      {visit && (
        <CreateFollowUpForm
          key={`${visit.id}-${defaultEscalate ? "esc" : "fu"}`}
          visit={visit}
          actor={actor}
          defaultEscalate={defaultEscalate}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}

function CreateFollowUpForm({
  visit,
  actor,
  defaultEscalate = false,
  onClose,
  onSuccess,
}: {
  visit: ClinicalVisit;
  actor: ClinicalActorContext;
  defaultEscalate?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [followUpType, setFollowUpType] = useState<ClinicalFollowUp["followUpType"]>(
    defaultEscalate ? "Clinical Escalation" : "Missing Documentation"
  );
  const [assignedToId, setAssignedToId] = useState(INTERNAL_OWNERS[0].id);
  const [priority, setPriority] = useState<PriorityLevel>(
    defaultEscalate ? "Critical" : visit.priority || "High"
  );
  const [dueDate, setDueDate] = useState("2026-11-28");
  const [description, setDescription] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe the required follow-up action.");
      return;
    }
    const owner =
      INTERNAL_OWNERS.find((o) => o.id === assignedToId) ||
      CLINICAL_PROFESSIONALS.find((p) => p.id === assignedToId);
    try {
      createClinicalFollowUp(
        {
          visitId: visit.id,
          requirementId: visit.requirementId,
          clientId: visit.clientId,
          clientName: visit.clientName,
          assignedToId: owner?.id || "usr-001",
          assignedToName: owner?.name || actor.name,
          followUpType,
          priority,
          description: description.trim(),
          internalNotes: internalNotes.trim(),
          dueDate,
          escalate: defaultEscalate || followUpType === "Clinical Escalation",
        },
        actor
      );
      toast.success(
        defaultEscalate
          ? `Issue escalated for ${visit.clientName}`
          : `Follow-up created for ${visit.clientName}`
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save follow-up");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <FormLabel required>Follow-up Category</FormLabel>
          <FormSelect
            value={followUpType}
            onChange={(e) =>
              setFollowUpType(e.target.value as ClinicalFollowUp["followUpType"])
            }
          >
            <option value="Overdue Visit">Overdue Visit</option>
            <option value="Missing Documentation">Missing Documentation</option>
            <option value="Unassigned Requirement">Unassigned Requirement</option>
            <option value="Pending Clinical Sign-Off">Pending Clinical Sign-Off</option>
            <option value="Clinical Escalation">Clinical Escalation</option>
            <option value="Rule Exception">Rule Exception</option>
          </FormSelect>
        </div>
        <div>
          <FormLabel required>Priority</FormLabel>
          <FormSelect
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityLevel)}
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </FormSelect>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <FormLabel required>Assign Internal Owner / Reviewer</FormLabel>
          <FormSelect
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
          >
            {INTERNAL_OWNERS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.role})
              </option>
            ))}
            {CLINICAL_PROFESSIONALS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.roleTitle})
              </option>
            ))}
          </FormSelect>
        </div>
        <div>
          <FormLabel required>Target Due Date</FormLabel>
          <FormInput
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <FormLabel required>Follow-up Action Description</FormLabel>
        <FormTextarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Specify required operational follow-up or escalation action..."
          required
        />
      </div>

      <div>
        <FormLabel>Internal Notes</FormLabel>
        <FormTextarea
          rows={2}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Optional context for staff coordination..."
        />
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <FormButtonCancel onClick={onClose} />
        <FormButtonPrimary type="submit">
          {defaultEscalate ? "Raise Escalation" : "Create Follow-up"}
        </FormButtonPrimary>
      </div>
    </form>
  );
}

export function SendMockReminderModal({
  visit,
  actor,
  onClose,
  onSuccess,
}: {
  visit: ClinicalVisit | null;
  actor: ClinicalActorContext;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return (
    <Modal
      isOpen={Boolean(visit)}
      onClose={onClose}
      title="Send Operational Reminder (Mock)"
      description={
        visit
          ? `Recipient: ${visit.professionalName || "Unassigned Clinical Pool"} • ${visit.clientName}`
          : undefined
      }
      icon={<Bell className="w-5 h-5" />}
      maxWidth="lg"
    >
      {visit && (
        <SendMockReminderForm
          key={`${visit.id}-${visit.visitType}`}
          visit={visit}
          actor={actor}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}

function SendMockReminderForm({
  visit,
  actor,
  onClose,
  onSuccess,
}: {
  visit: ClinicalVisit;
  actor: ClinicalActorContext;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [message, setMessage] = useState(
    `Action reminder regarding ${visit.visitType} for ${visit.clientName} (Due: ${visit.dueDate}). Please review documentation and scheduling status.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      sendMockClinicalReminder(visit.id, message.trim(), actor);
      toast.success("Mock reminder recorded", {
        description: `Simulated notification logged for ${visit.professionalName || "Clinical Pool"} (mock environment only — no live email/SMS sent).`,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log reminder");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
        <strong>Mock Environment Notice:</strong> Submitting this form logs a simulated in-app reminder and audit trail entry. No external email or SMS gateway is active in Release 1.
      </div>

      <div>
        <FormLabel required>Reminder Message</FormLabel>
        <FormTextarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <FormButtonCancel onClick={onClose} />
        <FormButtonPrimary type="submit">Log Simulated Reminder</FormButtonPrimary>
      </div>
    </form>
  );
}

export function RequestDocumentationModal({
  visit,
  actor,
  onClose,
  onSuccess,
}: {
  visit: ClinicalVisit | null;
  actor: ClinicalActorContext;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return (
    <Modal
      isOpen={Boolean(visit)}
      onClose={onClose}
      title="Request Missing Documentation"
      description={
        visit
          ? `${visit.clientName} • Assigned: ${visit.professionalName || "Unassigned"}`
          : undefined
      }
      icon={<FileWarning className="w-5 h-5" />}
      maxWidth="2xl"
    >
      {visit && (
        <RequestDocumentationForm
          key={`${visit.id}-${visit.visitType}`}
          visit={visit}
          actor={actor}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}

function RequestDocumentationForm({
  visit,
  actor,
  onClose,
  onSuccess,
}: {
  visit: ClinicalVisit;
  actor: ClinicalActorContext;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [note, setNote] = useState(
    `Please submit missing clinical/supervisory evidence for ${visit.visitType} (${visit.clientName}).`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      requestMissingDocumentation(visit.id, note.trim(), actor);
      toast.success("Missing documentation request logged");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-600">
        Agency Admin cannot edit or author clinical findings. This action flags the visit as requiring missing documentation and records an audit event for the performing clinician.
      </p>

      <div>
        <FormLabel required>Requested Items / Clarification Note</FormLabel>
        <FormTextarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
        />
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <FormButtonCancel onClick={onClose} />
        <FormButtonPrimary type="submit">Request Documentation</FormButtonPrimary>
      </div>
    </form>
  );
}
