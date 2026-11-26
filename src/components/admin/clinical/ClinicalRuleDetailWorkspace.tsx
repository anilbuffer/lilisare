"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  History,
  Info,
  Power,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import {
  FormButtonCancel,
  FormButtonPrimary,
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "@/components/ui/FormControls";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";
import { useAuth } from "@/hooks/useAuth";
import {
  checkClinicalPermission,
  resolveClinicalActor,
} from "@/lib/admin/clinicalAuthGuard";
import {
  CLINICAL_AGENCIES,
  CLINICAL_PROGRAMS,
  DEMO_TODAY,
  duplicateClinicalRule,
  getClinicalAuditEvents,
  getClinicalDetailHref,
  getClinicalRequirements,
  getClinicalRuleDetailHref,
  resolveClinicalRuleByParam,
  saveClinicalRule,
  subscribeToClinicalSync,
  toggleClinicalRuleStatus,
} from "@/lib/admin/clinicalSupervisoryStore";
import {
  ClinicalAuditEvent,
  ClinicalProfessionalType,
  ClinicalRequirement,
  ClinicalRule,
  ClinicalVisitCategory,
  RecurrenceType,
  VisitDeliveryMethod,
} from "@/types/clinicalSupervisory";
import { ClinicalAvatarName, RequirementStatusBadge } from "./ClinicalBadges";

type RuleDetailTab = "all" | "config" | "governance" | "requirements" | "versions" | "audit";

export function ClinicalRuleDetailWorkspace({ ruleId }: { ruleId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);
  const canManageRules = checkClinicalPermission(actor, "MANAGE_RULES").allowed;

  const [rule, setRule] = useState<ClinicalRule | null>(() =>
    resolveClinicalRuleByParam(ruleId, queryId)
  );
  const [requirements, setRequirements] = useState<ClinicalRequirement[]>(() =>
    getClinicalRequirements()
  );
  const [auditEvents, setAuditEvents] = useState<ClinicalAuditEvent[]>(() =>
    getClinicalAuditEvents()
  );
  const [activeTab, setActiveTab] = useState<RuleDetailTab>("all");
  const [isEditing, setIsEditing] = useState(false);

  // Full-page Edit Form State
  const [confirmImpactChecked, setConfirmImpactChecked] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [agencyId, setAgencyId] = useState(CLINICAL_AGENCIES[0].id);
  const [stateCode, setStateCode] = useState("OR");
  const [programName, setProgramName] = useState(CLINICAL_PROGRAMS[0]);
  const [serviceName, setServiceName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [visitCategory, setVisitCategory] =
    useState<ClinicalVisitCategory>("Recurring RN Visit");
  const [visitType, setVisitType] = useState("");
  const [profType, setProfType] = useState<ClinicalProfessionalType>("RN");
  const [initialReq, setInitialReq] = useState(true);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("Quarterly");
  const [intervalDays, setIntervalDays] = useState(90);
  const [deliveryMethod, setDeliveryMethod] =
    useState<VisitDeliveryMethod>("In-home");
  const [docRequired, setDocRequired] = useState(true);
  const [reviewRequired, setReviewRequired] = useState(true);
  const [effectiveDate, setEffectiveDate] = useState(DEMO_TODAY);
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Draft">("Active");
  const [confirmationStatus, setConfirmationStatus] = useState<
    "Confirmed" | "Pending LiliSare Confirmation"
  >("Pending LiliSare Confirmation");
  const [notes, setNotes] = useState("");
  const [changeSummary, setChangeSummary] = useState("");

  const reload = useCallback(() => {
    setRule(resolveClinicalRuleByParam(ruleId, queryId));
    setRequirements(getClinicalRequirements());
    setAuditEvents(getClinicalAuditEvents());
  }, [ruleId, queryId]);

  useEffect(() => {
    const timer = window.setTimeout(reload, 0);
    const unsub = subscribeToClinicalSync(reload);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, [reload]);

  const linkedRequirements = useMemo(
    () => (rule ? requirements.filter((r) => r.ruleId === rule.id) : []),
    [rule, requirements]
  );

  const ruleAuditEvents = useMemo(
    () => (rule ? auditEvents.filter((e) => e.entityId === rule.id) : []),
    [rule, auditEvents]
  );

  const detailTabs: DomainTabItem<RuleDetailTab>[] = useMemo(
    () => [
      { id: "all", label: "All Sections", minWidth: 112 },
      { id: "config", label: "Rule Configuration", minWidth: 152 },
      { id: "governance", label: "Documentation & Policy", minWidth: 170 },
      {
        id: "requirements",
        label: "Linked Requirements",
        badge: String(linkedRequirements.length),
        minWidth: 170,
      },
      {
        id: "versions",
        label: "Version History",
        badge: String(rule?.versionHistory.length || 0),
        minWidth: 145,
      },
      {
        id: "audit",
        label: "Audit Trail",
        badge: String(ruleAuditEvents.length),
        minWidth: 125,
      },
    ],
    [linkedRequirements.length, rule?.versionHistory.length, ruleAuditEvents.length]
  );

  const startEditing = () => {
    if (!rule) return;
    setConfirmImpactChecked(false);
    setRuleName(rule.ruleName);
    setAgencyId(rule.agencyId);
    setStateCode(rule.state);
    setProgramName(rule.programName);
    setServiceName(rule.serviceName);
    setServiceCode(rule.serviceCode);
    setVisitCategory(rule.visitCategory);
    setVisitType(rule.visitType);
    setProfType(rule.professionalType);
    setInitialReq(rule.initialVisitRequired);
    setRecurrenceType(rule.recurrenceType);
    setIntervalDays(rule.recurrenceIntervalDays);
    setDeliveryMethod(rule.deliveryMethod);
    setDocRequired(rule.documentationRequired);
    setReviewRequired(rule.reviewRequired);
    setEffectiveDate(rule.effectiveDate);
    setEndDate(rule.endDate || "");
    setStatus(rule.status);
    setConfirmationStatus(rule.confirmationStatus);
    setNotes(rule.internalNotes);
    setChangeSummary("");
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rule) return;
    if (!ruleName.trim() || !serviceName.trim() || !visitType.trim()) {
      toast.error("Please fill in Rule Name, Service, and Visit Type.");
      return;
    }
    if (rule.status === "Active" && !confirmImpactChecked) {
      toast.error("Please acknowledge the forward-only effective rule warning.");
      return;
    }
    const agency =
      CLINICAL_AGENCIES.find((a) => a.id === agencyId) || CLINICAL_AGENCIES[0];
    const freqLabel =
      recurrenceType === "None"
        ? "None (Exception Only)"
        : `${recurrenceType} (${intervalDays}d)`;
    try {
      saveClinicalRule(
        {
          id: rule.id,
          ruleName: ruleName.trim(),
          agencyId: agency.id,
          agencyName: agency.name,
          state: stateCode.trim() || agency.state,
          programId: rule.programId || `PRG-${programName.slice(0, 6).toUpperCase()}`,
          programName,
          serviceId: rule.serviceId || "svc-custom",
          serviceName: serviceName.trim(),
          serviceCode: serviceCode.trim() || "T1019",
          visitCategory,
          visitType: visitType.trim(),
          professionalType: profType,
          eligibleProfessionalTypes:
            profType === "RN"
              ? ["RN"]
              : profType === "Clinical Supervisor"
                ? ["RN", "Clinical Supervisor", "Field Supervisor"]
                : [
                  "RN",
                  "Clinical Supervisor",
                  "Field Supervisor",
                  "Qualified Non-RN Supervisor",
                ],
          initialVisitRequired: initialReq,
          recurrenceType,
          recurrenceIntervalDays: Number(intervalDays) || 0,
          frequencyLabel: freqLabel,
          deliveryMethod,
          documentationRequired: docRequired,
          reviewRequired,
          effectiveDate,
          endDate: endDate || undefined,
          status,
          confirmationStatus,
          internalNotes: notes.trim(),
          changeSummary:
            changeSummary.trim() ||
            `Updated rule configuration effective ${effectiveDate}.`,
        },
        actor
      );
      toast.success("Rule updated with new version snapshot & audit event");
      setIsEditing(false);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save rule");
    }
  };

  if (!rule) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center space-y-3">
        <Sliders className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">
          Clinical Visit Rule Not Found
        </h2>
        <p className="text-xs text-slate-500">
          Rule &ldquo;{queryId || ruleId}&rdquo; could not be located.
        </p>
        <Link
          href="/admin/clinical/rules/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Visit Rules</span>
        </Link>
      </div>
    );
  }

  const showConfig = activeTab === "all" || activeTab === "config";
  const showGovernance = activeTab === "all" || activeTab === "governance";
  const showRequirements = activeTab === "all" || activeTab === "requirements";
  const showVersions = activeTab === "all" || activeTab === "versions";
  const showAudit = activeTab === "all" || activeTab === "audit";

  return (
    <div className="w-full max-w-7xl mx-auto min-w-0 space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/clinical/rules/"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Visit Rules</span>
        </Link>

        <span className="text-xs font-semibold text-slate-500">
          {rule.id} · Version v{rule.version}
        </span>
      </div>

      {/* Rule Header Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                {rule.id}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {rule.ruleName}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${rule.status === "Active"
                    ? "bg-emerald-50 text-[#3D6B22] border-emerald-200"
                    : rule.status === "Draft"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
              >
                {rule.status}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${rule.confirmationStatus === "Confirmed"
                    ? "bg-emerald-50 text-[#008f5a] border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
              >
                {rule.confirmationStatus}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{rule.serviceName}</span>
              <span className="text-slate-300">•</span>
              <span>{rule.agencyName}</span>
              <span className="text-slate-300">•</span>
              <span>{rule.programName}</span>
              <span className="text-slate-300">•</span>
              <span>
                Effective <strong className="font-mono text-slate-800">{rule.effectiveDate}</strong>
              </span>
            </div>
          </div>

          {canManageRules && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Rule</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const copy = duplicateClinicalRule(rule.id, actor);
                  toast.success(`Duplicated ${rule.id} as Draft (${copy.id})`);
                  router.push(getClinicalRuleDetailHref(copy.id));
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate as Draft</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleClinicalRuleStatus(rule.id, actor);
                  toast.success(
                    `Rule ${rule.id} ${rule.status === "Active" ? "deactivated" : "activated"}`
                  );
                  reload();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{rule.status === "Active" ? "Deactivate" : "Activate"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full-Page Inline Editor (No Long Content Modal) */}
      {isEditing && (
        <form
          onSubmit={handleSaveEdit}
          className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-[#3D6B22]/30 shadow-[0_6px_24px_rgba(0,0,0,0.06)] space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Edit Visit Rule ({rule.id})
              </h2>
              <p className="text-xs text-slate-500">
                Saving updates the rule version snapshot for future requirements without retroactively rewriting completed visits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <FormLabel required>Rule Name</FormLabel>
              <FormInput
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                required
              />
            </div>

            <div>
              <FormLabel required>Agency</FormLabel>
              <FormSelect
                value={agencyId}
                onChange={(e) => setAgencyId(e.target.value)}
              >
                {CLINICAL_AGENCIES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div>
              <FormLabel required>State</FormLabel>
              <FormInput
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                required
              />
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
              <FormLabel required>Service Type</FormLabel>
              <FormInput
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
              />
            </div>

            <div>
              <FormLabel required>Service Code</FormLabel>
              <FormInput
                value={serviceCode}
                onChange={(e) => setServiceCode(e.target.value)}
                required
              />
            </div>

            <div>
              <FormLabel required>Visit Category</FormLabel>
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
              <FormLabel required>Visit Type Label</FormLabel>
              <FormInput
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                required
              />
            </div>

            <div>
              <FormLabel required>Required Professional Type</FormLabel>
              <FormSelect
                value={profType}
                onChange={(e) =>
                  setProfType(e.target.value as ClinicalProfessionalType)
                }
              >
                <option value="RN">RN</option>
                <option value="Clinical Supervisor">Clinical Supervisor</option>
                <option value="Field Supervisor">Field Supervisor</option>
                <option value="Qualified Non-RN Supervisor">
                  Qualified Non-RN Supervisor
                </option>
              </FormSelect>
            </div>

            <div>
              <FormLabel required>Recurring Frequency</FormLabel>
              <FormSelect
                value={recurrenceType}
                onChange={(e) =>
                  setRecurrenceType(e.target.value as RecurrenceType)
                }
              >
                <option value="None">None</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annual">Semi-Annual</option>
                <option value="Annual">Annual</option>
                <option value="Custom Days">Custom Days</option>
              </FormSelect>
            </div>

            <div>
              <FormLabel>Interval Days</FormLabel>
              <FormInput
                type="number"
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value) || 0)}
              />
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
              <FormLabel>Expiry / End Date</FormLabel>
              <FormInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <FormLabel required>Status</FormLabel>
              <FormSelect
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "Active" | "Inactive" | "Draft")
                }
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Inactive">Inactive</option>
              </FormSelect>
            </div>

            <div>
              <FormLabel required>LiliSare Policy Confirmation</FormLabel>
              <FormSelect
                value={confirmationStatus}
                onChange={(e) =>
                  setConfirmationStatus(
                    e.target.value as "Confirmed" | "Pending LiliSare Confirmation"
                  )
                }
              >
                <option value="Pending LiliSare Confirmation">
                  Pending LiliSare Confirmation
                </option>
                <option value="Confirmed">Confirmed</option>
              </FormSelect>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2 text-xs font-medium text-slate-700">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={initialReq}
                onChange={(e) => setInitialReq(e.target.checked)}
                className="rounded border-slate-300 text-[#3D6B22]"
              />
              <span>Initial Visit Required</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={docRequired}
                onChange={(e) => setDocRequired(e.target.checked)}
                className="rounded border-slate-300 text-[#3D6B22]"
              />
              <span>Documentation Evidence Required</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reviewRequired}
                onChange={(e) => setReviewRequired(e.target.checked)}
                className="rounded border-slate-300 text-[#3D6B22]"
              />
              <span>Clinical Review / Sign-Off Required</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Internal Policy Notes</FormLabel>
              <FormTextarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div>
              <FormLabel required>Change Summary (Version Audit)</FormLabel>
              <FormTextarea
                rows={2}
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="Describe reason for updating this rule version..."
                required
              />
            </div>
          </div>

          {rule.status === "Active" && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs text-amber-950">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Rule Impact Warning (Non-Retroactive Enforcement)</span>
              </div>
              <p>
                Updating this active rule affects future requirements created after{" "}
                <strong>{effectiveDate}</strong>. Existing completed or active clinical records retain their original rule version snapshot.
              </p>
              <label className="inline-flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmImpactChecked}
                  onChange={(e) => setConfirmImpactChecked(e.target.checked)}
                  className="rounded border-amber-400 text-[#3D6B22]"
                />
                <span>I confirm forward-only versioning impact.</span>
              </label>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setIsEditing(false)} />
            <FormButtonPrimary type="submit">Save New Rule Version</FormButtonPrimary>
          </div>
        </form>
      )}

      {/* Space-Aware Section Tabs */}
      <ResponsiveDomainTabStrip
        tabs={detailTabs}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        ariaLabel="Visit rule detail sections"
        moreHeading="Rule Sections"
      />

      {/* Config & Policy Grid */}
      {(showConfig || showGovernance) && (
        <div
          className={`grid grid-cols-1 gap-6 ${showConfig && showGovernance ? "lg:grid-cols-2" : "lg:grid-cols-1"
            }`}
        >
          {showConfig && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3 min-w-0">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Service, Cadence &amp; Scope Configuration
              </h2>
              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Agency</dt>
                  <dd className="font-semibold text-slate-900 text-right">{rule.agencyName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">State / Jurisdiction</dt>
                  <dd className="font-mono font-semibold text-slate-800">{rule.state}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Program</dt>
                  <dd className="font-medium text-slate-800 text-right">{rule.programName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Service</dt>
                  <dd className="font-semibold text-slate-900 text-right">
                    {rule.serviceName} ({rule.serviceCode})
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Visit Category</dt>
                  <dd className="font-medium text-slate-800">{rule.visitCategory}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Visit Type</dt>
                  <dd className="font-semibold text-slate-900">{rule.visitType}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Required Professional</dt>
                  <dd className="font-semibold text-[#3D6B22]">{rule.professionalType}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Initial Visit Required</dt>
                  <dd className="font-semibold text-slate-800">
                    {rule.initialVisitRequired ? "Yes" : "No"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Frequency / Interval</dt>
                  <dd className="font-medium text-slate-800">
                    {rule.frequencyLabel} ({rule.recurrenceIntervalDays} days)
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Delivery Method</dt>
                  <dd className="font-semibold text-slate-800">{rule.deliveryMethod}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Effective / End Dates</dt>
                  <dd className="font-mono text-slate-700">
                    {rule.effectiveDate} → {rule.endDate || "Open-ended"}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {showGovernance && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 min-w-0">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Documentation, Sign-Off &amp; Governance Metadata
              </h2>
              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Documentation Requirement</dt>
                  <dd className="font-semibold text-slate-900">
                    {rule.documentationRequired ? "Mandatory Evidence" : "Optional"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Clinical Review / Sign-Off</dt>
                  <dd className="font-semibold text-slate-900">
                    {rule.reviewRequired
                      ? "Authorised Clinical Review Required"
                      : "No Routine Clinical Sign-Off"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Current Version</dt>
                  <dd className="font-mono font-bold text-slate-800">v{rule.version}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Policy Confirmation</dt>
                  <dd className="font-semibold text-slate-800">{rule.confirmationStatus}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Last Modified By</dt>
                  <dd className="font-medium text-slate-800">
                    {rule.updatedBy} ({rule.updatedAt.slice(0, 10)})
                  </dd>
                </div>
              </dl>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>Internal Policy Notes</span>
                </div>
                <p>{rule.internalNotes || "No internal notes recorded."}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Linked Requirements */}
      {showRequirements && (
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Active Client Requirements Governed by {rule.id} ({linkedRequirements.length})
            </h2>
          </div>
          {linkedRequirements.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No client requirements currently use this rule.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Visit Type</th>
                    <th className="py-3.5 px-4">Next Due Date</th>
                    <th className="py-3.5 px-4">Rule Snapshot</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
                  {linkedRequirements.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => router.push(getClinicalDetailHref(req.activeVisitId || req.id))}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClinicalAvatarName
                          name={req.clientName}
                          variant="client"
                          highlightHover
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{req.visitType}</td>
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">{req.nextDueDate}</td>
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        v{req.ruleVersion}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <RequirementStatusBadge status={req.status} />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={getClinicalDetailHref(req.activeVisitId || req.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#3D6B22]"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Version History & Audit Trail */}
      {(showVersions || showAudit) && (
        <div
          className={`grid grid-cols-1 gap-6 ${showVersions && showAudit ? "lg:grid-cols-2" : "lg:grid-cols-1"
            }`}
        >
          {showVersions && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#3D6B22]" />
                  <span>Immutable Rule Version History</span>
                </h2>
                <span className="text-[11px] font-semibold text-slate-400">
                  {rule.versionHistory.length} versions
                </span>
              </div>

              <div className="space-y-3">
                {rule.versionHistory.map((ver) => (
                  <div
                    key={ver.version}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#3D6B22] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        v{ver.version} ({ver.status})
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        Effective {ver.effectiveDate}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">{ver.changeSummary}</p>
                    <div className="text-[11px] text-slate-500">
                      {ver.professionalType} · {ver.recurrenceType} ({ver.recurrenceIntervalDays}d) · {ver.deliveryMethod} · Updated by {ver.updatedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showAudit && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 min-w-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#3D6B22]" />
                  <span>Rule Change Audit Events</span>
                </h2>
                <span className="text-[11px] font-semibold text-slate-400">
                  {ruleAuditEvents.length} events
                </span>
              </div>

              {ruleAuditEvents.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No rule audit events logged yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {ruleAuditEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[#3D6B22] text-[11px]">
                          {evt.action.replace(/_/g, " ")}
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
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
