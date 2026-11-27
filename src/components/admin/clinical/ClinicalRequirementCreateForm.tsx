"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardPlus,
  Info,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  FormButtonCancel,
  FormButtonPrimary,
  FormButtonSecondary,
  FormInput,
  FormLabel,
  FormSection,
  FormSelect,
  FormTextarea,
} from "@/components/ui/FormControls";
import { useAuth } from "@/hooks/useAuth";
import {
  isProfessionalEligibleForType,
  resolveClinicalActor,
} from "@/lib/admin/clinicalAuthGuard";
import {
  CLINICAL_AGENCIES,
  CLINICAL_PROFESSIONALS,
  CLINICAL_PROGRAMS,
  DEMO_TODAY,
  INTERNAL_OWNERS,
  createClinicalRequirement,
  getClinicalDetailHref,
  getClinicalRequirements,
  getClinicalRules,
} from "@/lib/admin/clinicalSupervisoryStore";
import { INITIAL_CLIENTS, getClientsFromStorage } from "@/lib/clients/mockData";
import { LILISARE_SERVICES } from "@/lib/services";
import {
  ClinicalProfessionalType,
  ClinicalVisitCategory,
  PriorityLevel,
  VisitDeliveryMethod,
} from "@/types/clinicalSupervisory";

export function ClinicalRequirementCreateForm() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);

  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const rules = useMemo(() => getClinicalRules(), []);
  const existingRequirements = useMemo(() => getClinicalRequirements(), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setClients(getClientsFromStorage());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Section A: Client & Service
  const [clientId, setClientId] = useState(INITIAL_CLIENTS[0]?.id || "CL-1001");
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId) || clients[0],
    [clients, clientId]
  );

  const [agencyId, setAgencyId] = useState(CLINICAL_AGENCIES[0].id);
  const [programName, setProgramName] = useState(
    selectedClient?.carePlan?.program || CLINICAL_PROGRAMS[0]
  );
  const [ruleId, setRuleId] = useState(rules[0]?.id || "CRULE-01");
  const selectedRule = useMemo(
    () => rules.find((r) => r.id === ruleId) || rules[0],
    [rules, ruleId]
  );

  const [serviceName, setServiceName] = useState(
    selectedRule?.serviceName || LILISARE_SERVICES[0].name
  );
  const [serviceStartDate, setServiceStartDate] = useState(
    selectedClient?.authorization?.startDate || DEMO_TODAY
  );
  const [authorizationId, setAuthorizationId] = useState(
    selectedClient?.authorization?.authNumber || ""
  );

  // Section B: Requirement Details
  const [requirementName, setRequirementName] = useState(() =>
    selectedClient && selectedRule
      ? `${selectedClient.name} — ${selectedRule.visitType}`
      : ""
  );
  const [visitType, setVisitType] = useState(selectedRule?.visitType || "Initial RN Visit");
  const [visitCategory, setVisitCategory] = useState<ClinicalVisitCategory>(
    selectedRule?.visitCategory || "Initial RN Visit"
  );
  const [professionalType, setProfessionalType] = useState<ClinicalProfessionalType>(
    selectedRule?.professionalType || "RN"
  );
  const [initialOrRecurring, setInitialOrRecurring] = useState<
    "Initial Only" | "Recurring Only" | "Initial + Recurring"
  >(
    selectedRule?.initialVisitRequired && selectedRule?.recurrenceType !== "None"
      ? "Initial + Recurring"
      : selectedRule?.recurrenceType !== "None"
        ? "Recurring Only"
        : "Initial Only"
  );
  const [deliveryMethod, setDeliveryMethod] = useState<VisitDeliveryMethod>(
    selectedRule?.deliveryMethod || "In-home"
  );
  const [frequency, setFrequency] = useState(
    selectedRule?.frequencyLabel || "Quarterly (90d)"
  );
  const [recurrenceIntervalDays, setRecurrenceIntervalDays] = useState<number>(
    selectedRule?.recurrenceIntervalDays || 90
  );
  const [firstDueDate, setFirstDueDate] = useState("2026-12-03");
  const [nextDueDate, setNextDueDate] = useState("2026-12-03");
  const [effectiveDate, setEffectiveDate] = useState(DEMO_TODAY);
  const [endDate, setEndDate] = useState("");

  // Section C: Assignment
  const eligibleProfessionals = useMemo(
    () =>
      CLINICAL_PROFESSIONALS.filter((p) =>
        isProfessionalEligibleForType(p, professionalType)
      ),
    [professionalType]
  );
  const [assignedProfessionalId, setAssignedProfessionalId] = useState<string>(
    eligibleProfessionals[0]?.id || ""
  );
  const [internalOwnerId, setInternalOwnerId] = useState(INTERNAL_OWNERS[0].id);
  const [priority, setPriority] = useState<PriorityLevel>("High");
  const [internalNotes, setInternalNotes] = useState("");
  const [exceptionConfirmed, setExceptionConfirmed] = useState(false);

  // Sync client context when client changes
  const handleClientChange = (nextClientId: string) => {
    setClientId(nextClientId);
    const c = clients.find((x) => x.id === nextClientId);
    if (c) {
      setProgramName(c.carePlan?.program || CLINICAL_PROGRAMS[0]);
      setServiceStartDate(c.authorization?.startDate || DEMO_TODAY);
      setAuthorizationId(c.authorization?.authNumber || "");
      setRequirementName(
        `${c.name} — ${selectedRule?.visitType || "Clinical Supervisory Visit"}`
      );
    }
  };

  // Apply rule defaults when rule changes
  const handleRuleChange = (nextRuleId: string) => {
    setRuleId(nextRuleId);
    const r = rules.find((x) => x.id === nextRuleId);
    if (!r) return;
    setServiceName(r.serviceName);
    setVisitType(r.visitType);
    setVisitCategory(r.visitCategory);
    setProfessionalType(r.professionalType);
    setDeliveryMethod(r.deliveryMethod);
    setFrequency(r.frequencyLabel);
    setRecurrenceIntervalDays(r.recurrenceIntervalDays);
    setInitialOrRecurring(
      r.initialVisitRequired && r.recurrenceType !== "None"
        ? "Initial + Recurring"
        : r.recurrenceType !== "None"
          ? "Recurring Only"
          : "Initial Only"
    );
    if (selectedClient) {
      setRequirementName(`${selectedClient.name} — ${r.visitType}`);
    }
    const firstEligible = CLINICAL_PROFESSIONALS.find((p) =>
      isProfessionalEligibleForType(p, r.professionalType)
    );
    setAssignedProfessionalId(firstEligible?.id || "");
  };

  // Duplicate check
  const duplicateRequirement = useMemo(() => {
    return existingRequirements.find(
      (r) =>
        r.clientId === clientId &&
        r.ruleId === ruleId &&
        r.status !== "Cancelled" &&
        r.status !== "Completed" &&
        r.status !== "Not Required"
    );
  }, [existingRequirements, clientId, ruleId]);

  const isUnskilledContractor =
    selectedRule?.serviceName.toLowerCase().includes("unskilled") ||
    serviceName.toLowerCase().includes("unskilled");

  const selectedAgency =
    CLINICAL_AGENCIES.find((a) => a.id === agencyId) || CLINICAL_AGENCIES[0];
  const selectedProf = CLINICAL_PROFESSIONALS.find(
    (p) => p.id === assignedProfessionalId
  );
  const selectedOwner =
    INTERNAL_OWNERS.find((o) => o.id === internalOwnerId) || INTERNAL_OWNERS[0];

  const handleSave = (asDraft: boolean) => {
    if (!selectedClient) {
      toast.error("Please select a client.");
      return;
    }
    if (!requirementName.trim() || !visitType.trim() || !firstDueDate) {
      toast.error("Please complete Requirement Name, Visit Type, and First Due Date.");
      return;
    }
    if (duplicateRequirement && !asDraft && !exceptionConfirmed) {
      toast.error(
        `Duplicate active requirement (${duplicateRequirement.id}) detected. Confirm exception override below to proceed.`
      );
      return;
    }
    if (isUnskilledContractor && !asDraft && !exceptionConfirmed) {
      toast.error(
        "Unskilled Contractor services do not automatically generate routine supervisory visits. Confirm the exception override checkbox to create this requirement."
      );
      return;
    }

    try {
      const matchedSvc =
        LILISARE_SERVICES.find(
          (s) =>
            s.name.toLowerCase() === serviceName.toLowerCase() ||
            s.code === selectedRule?.serviceCode
        ) || LILISARE_SERVICES[0];

      const { visit } = createClinicalRequirement(
        {
          requirementName: requirementName.trim(),
          clientId: selectedClient.id,
          agencyId: selectedAgency.id,
          agencyName: selectedAgency.name,
          programName,
          serviceId: matchedSvc.id,
          serviceName,
          serviceCode: selectedRule?.serviceCode || matchedSvc.code,
          serviceStartDate,
          authorizationId,
          ruleId: selectedRule?.id || "CRULE-01",
          visitCategory,
          visitType: visitType.trim(),
          professionalType,
          isInitial: initialOrRecurring !== "Recurring Only",
          isRecurring: initialOrRecurring !== "Initial Only",
          frequency,
          recurrenceIntervalDays,
          deliveryMethod,
          effectiveDate,
          endDate: endDate || undefined,
          firstDueDate,
          nextDueDate: nextDueDate || firstDueDate,
          assignedProfessionalId: assignedProfessionalId || null,
          internalOwnerId: selectedOwner.id,
          internalOwnerName: selectedOwner.name,
          priority,
          internalNotes,
          asDraft,
          exceptionConfirmed,
        },
        actor
      );
      toast.success(
        asDraft
          ? "Visit requirement saved as Draft"
          : `Visit requirement created (${visit.requirementId})`
      );
      router.push(getClinicalDetailHref(visit.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save requirement");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/admin/clinical/requirements/"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Requirements</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
                <ClipboardPlus className="w-5 h-5" />
              </span>
              <span>Create Clinical &amp; Supervisory Visit Requirement</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Establish an initial or recurring clinical/supervisory requirement governed by configurable agency service rules.
            </p>
          </div>
        </div>
      </div>

      {/* Section A — Client and Service */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <FormSection
          title="Section A — Client and Service"
          description="Select the client and active service authorization. Client context syncs directly from Client Management."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FormLabel required>Select Client</FormLabel>
            <FormSelect
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id} · {c.status})
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormLabel required>Agency</FormLabel>
            <FormSelect
              value={agencyId}
              onChange={(e) => setAgencyId(e.target.value)}
            >
              {CLINICAL_AGENCIES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.state})
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormLabel required>Program</FormLabel>
            <FormSelect
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
            >
              {CLINICAL_PROGRAMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormLabel required>Applicable Service Rule</FormLabel>
            <FormSelect
              value={ruleId}
              onChange={(e) => handleRuleChange(e.target.value)}
            >
              {rules
                .filter((r) => r.status === "Active")
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.ruleName} (v{r.version})
                  </option>
                ))}
            </FormSelect>
          </div>

          <div>
            <FormLabel required>Active Service</FormLabel>
            <FormInput
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. IHSS, CNA, HMA, CES Waiver..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FormLabel required>Service Start Date</FormLabel>
              <FormInput
                type="date"
                value={serviceStartDate}
                onChange={(e) => setServiceStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <FormLabel>Related Authorization / Plan</FormLabel>
              <FormInput
                value={authorizationId}
                onChange={(e) => setAuthorizationId(e.target.value)}
                placeholder="AUTH-2026-..."
              />
            </div>
          </div>
        </div>

        {/* Live Client Management Context Card */}
        {selectedClient && (
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Client Care Plan Program
              </span>
              <span className="font-semibold text-slate-800">
                {selectedClient.carePlan?.program || "Standard"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Assigned Primary Caregiver
              </span>
              <span className="font-semibold text-slate-800">
                {selectedClient.assignedCareTeam?.primaryCaregiver?.name || "Unassigned"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Approved Services (Client Record)
              </span>
              <span className="font-semibold text-slate-800 line-clamp-1">
                {selectedClient.carePlan?.approvedServices?.join(", ") || "Pending"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Section B — Requirement Details */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <FormSection
          title="Section B — Requirement Details"
          description="Define visit category, professional qualification, cadence, and delivery method."
        />

        {selectedRule?.confirmationStatus === "Pending LiliSare Confirmation" && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Configurable Reference Rule:</strong> {selectedRule.internalNotes}
            </div>
          </div>
        )}

        {isUnskilledContractor && (
          <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200 text-xs text-orange-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#ff6900] shrink-0 mt-0.5" />
            <div>
              <strong>Unskilled Contractor Policy:</strong> Routine supervisory visits are not auto-created for unskilled contractor arrangements. Confirm an exception override in Section D if a supervisory visit is specifically required.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FormLabel required>Requirement Name</FormLabel>
            <FormInput
              value={requirementName}
              onChange={(e) => setRequirementName(e.target.value)}
              placeholder="e.g. Leo Miller — Quarterly RN Supervisory Visit"
              required
            />
          </div>

          <div>
            <FormLabel required>Visit Type</FormLabel>
            <FormInput
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              required
            />
          </div>

          <div>
            <FormLabel required>Requirement Category</FormLabel>
            <FormSelect
              value={visitCategory}
              onChange={(e) =>
                setVisitCategory(e.target.value as ClinicalVisitCategory)
              }
            >
              <option value="Initial RN Visit">Initial RN Visit</option>
              <option value="Recurring RN Visit">Recurring RN Visit</option>
              <option value="Supervisory Visit">Supervisory Visit</option>
              <option value="Annual In-home Visit">Annual In-home Visit</option>
              <option value="IHSS Required Visit">IHSS Required Visit</option>
              <option value="Other Configured Visit">Other Configured Visit</option>
            </FormSelect>
          </div>

          <div>
            <FormLabel required>Required Professional Type</FormLabel>
            <FormSelect
              value={professionalType}
              onChange={(e) => {
                const nextType = e.target.value as ClinicalProfessionalType;
                setProfessionalType(nextType);
                const first = CLINICAL_PROFESSIONALS.find((p) =>
                  isProfessionalEligibleForType(p, nextType)
                );
                setAssignedProfessionalId(first?.id || "");
              }}
            >
              <option value="RN">RN (Registered Nurse Required)</option>
              <option value="Clinical Supervisor">Clinical Supervisor</option>
              <option value="Field Supervisor">Field Supervisor</option>
              <option value="Qualified Non-RN Supervisor">
                Qualified Non-RN Supervisor (When Rule Permits)
              </option>
            </FormSelect>
          </div>

          <div>
            <FormLabel required>Initial or Recurring</FormLabel>
            <FormSelect
              value={initialOrRecurring}
              onChange={(e) =>
                setInitialOrRecurring(
                  e.target.value as "Initial Only" | "Recurring Only" | "Initial + Recurring"
                )
              }
            >
              <option value="Initial + Recurring">Initial + Recurring</option>
              <option value="Initial Only">Initial Only</option>
              <option value="Recurring Only">Recurring Only</option>
            </FormSelect>
          </div>

          <div>
            <FormLabel required>Delivery Method</FormLabel>
            <FormSelect
              value={deliveryMethod}
              onChange={(e) =>
                setDeliveryMethod(e.target.value as VisitDeliveryMethod)
              }
            >
              <option value="In-home">In-home</option>
              <option value="Virtual">Virtual</option>
              <option value="Other approved method">Other approved method</option>
            </FormSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FormLabel required>Frequency Label</FormLabel>
              <FormInput
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Quarterly (90d)"
              />
            </div>
            <div>
              <FormLabel>Interval (Days)</FormLabel>
              <FormInput
                type="number"
                min={0}
                value={recurrenceIntervalDays}
                onChange={(e) =>
                  setRecurrenceIntervalDays(Number(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div>
            <FormLabel required>First Due Date</FormLabel>
            <FormInput
              type="date"
              value={firstDueDate}
              onChange={(e) => {
                setFirstDueDate(e.target.value);
                setNextDueDate(e.target.value);
              }}
              required
            />
          </div>

          <div>
            <FormLabel required>Next Due Date</FormLabel>
            <FormInput
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              required
            />
          </div>

          <div>
            <FormLabel required>Effective Date</FormLabel>
            <FormInput
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required
            />
          </div>

          <div>
            <FormLabel>End Date (If Applicable)</FormLabel>
            <FormInput
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Section C — Assignment */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <FormSection
          title="Section C — Assignment"
          description="Only professionals holding qualifications matching the requirement are selectable."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FormLabel>Assigned RN / Supervisor</FormLabel>
            <FormSelect
              value={assignedProfessionalId}
              onChange={(e) => setAssignedProfessionalId(e.target.value)}
            >
              <option value="">Leave Pending Assignment</option>
              {eligibleProfessionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.qualificationType} · {p.licenseNumber})
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormLabel required>Internal Owner</FormLabel>
            <FormSelect
              value={internalOwnerId}
              onChange={(e) => setInternalOwnerId(e.target.value)}
            >
              {INTERNAL_OWNERS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.role})
                </option>
              ))}
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

        <div>
          <FormLabel>Internal Operational Notes</FormLabel>
          <FormTextarea
            rows={3}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Record scheduling coordination context, caregiver reminders, or special oversight notes..."
          />
        </div>
      </div>

      {/* Section D — Review and Save */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <FormSection
          title="Section D — Review and Save"
          description="Verify requirement details, rule version snapshot, and duplicate checks before saving."
        />

        {duplicateRequirement && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
            <div className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>
                Duplicate Active Requirement Detected ({duplicateRequirement.id})
              </span>
            </div>
            <p>
              {selectedClient?.name} already has an active requirement under{" "}
              <strong>{selectedRule?.ruleName}</strong> (Status:{" "}
              {duplicateRequirement.status}, Due: {duplicateRequirement.nextDueDate}).
            </p>
          </div>
        )}

        {(duplicateRequirement || isUnskilledContractor) && (
          <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={exceptionConfirmed}
              onChange={(e) => setExceptionConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]"
            />
            <span className="font-semibold text-slate-800">
              Authorized Exception Override: Confirm creation despite active duplicate or exception-only policy.
            </span>
          </label>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Selected Client
            </span>
            <span className="font-bold text-slate-900">
              {selectedClient?.name} ({selectedClient?.id})
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Active Service
            </span>
            <span className="font-bold text-slate-900">{serviceName}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Applicable Rule
            </span>
            <span className="font-bold text-slate-900">
              {selectedRule?.id} · v{selectedRule?.version}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Visit Requirement
            </span>
            <span className="font-bold text-slate-900">
              {visitType} ({deliveryMethod})
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Assigned Professional
            </span>
            <span className="font-bold text-[#3D6B22]">
              {selectedProf ? selectedProf.name : "Pending Assignment"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              First Due Date
            </span>
            <span className="font-mono font-bold text-slate-900">{firstDueDate}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Recurrence
            </span>
            <span className="font-bold text-slate-900">
              {initialOrRecurring} · {frequency}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Governance Safeguard
            </span>
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3D6B22]" /> Audited on Save
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
          <FormButtonCancel
            onClick={() => router.push("/admin/clinical/requirements/")}
          />
          <FormButtonSecondary onClick={() => handleSave(true)}>
            Save as Draft
          </FormButtonSecondary>
          <FormButtonPrimary onClick={() => handleSave(false)}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Create Requirement</span>
          </FormButtonPrimary>
        </div>
      </div>
    </div>
  );
}
