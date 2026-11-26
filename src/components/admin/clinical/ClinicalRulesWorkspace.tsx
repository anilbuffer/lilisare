"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Copy,
  Edit3,
  Eye,
  History,
  Info,
  Plus,
  Power,
  Sliders,
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
  CLINICAL_AGENCIES,
  CLINICAL_PROGRAMS,
  DEMO_TODAY,
  duplicateClinicalRule,
  getClinicalRules,
  saveClinicalRule,
  subscribeToClinicalSync,
  toggleClinicalRuleStatus,
} from "@/lib/admin/clinicalSupervisoryStore";
import {
  ClinicalProfessionalType,
  ClinicalRule,
  ClinicalVisitCategory,
  RecurrenceType,
  VisitDeliveryMethod,
} from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";

export function ClinicalRulesWorkspace() {
  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);
  const canManageRules = checkClinicalPermission(actor, "MANAGE_RULES").allowed;

  const [rules, setRules] = useState<ClinicalRule[]>(() => getClinicalRules());
  const [viewRule, setViewRule] = useState<ClinicalRule | null>(null);
  const [historyRule, setHistoryRule] = useState<ClinicalRule | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ClinicalRule | null>(null);
  const [confirmImpactChecked, setConfirmImpactChecked] = useState(false);

  // Rule Editor Fields
  const [ruleName, setRuleName] = useState("");
  const [agencyId, setAgencyId] = useState(CLINICAL_AGENCIES[0].id);
  const [stateCode, setStateCode] = useState("OR");
  const [programName, setProgramName] = useState(CLINICAL_PROGRAMS[0]);
  const [serviceName, setServiceName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [visitCategory, setVisitCategory] = useState<ClinicalVisitCategory>("Recurring RN Visit");
  const [visitType, setVisitType] = useState("");
  const [profType, setProfType] = useState<ClinicalProfessionalType>("RN");
  const [initialReq, setInitialReq] = useState(true);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("Quarterly");
  const [intervalDays, setIntervalDays] = useState(90);
  const [deliveryMethod, setDeliveryMethod] = useState<VisitDeliveryMethod>("In-home");
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

  useEffect(() => {
    const load = () => setRules(getClinicalRules());
    load();
    return subscribeToClinicalSync(load);
  }, []);

  const openCreate = () => {
    setEditingRule(null);
    setConfirmImpactChecked(true);
    setRuleName("");
    setAgencyId(CLINICAL_AGENCIES[0].id);
    setStateCode("OR");
    setProgramName(CLINICAL_PROGRAMS[0]);
    setServiceName("");
    setServiceCode("T1019");
    setVisitCategory("Recurring RN Visit");
    setVisitType("Supervisory Visit");
    setProfType("RN");
    setInitialReq(true);
    setRecurrenceType("Quarterly");
    setIntervalDays(90);
    setDeliveryMethod("In-home");
    setDocRequired(true);
    setReviewRequired(true);
    setEffectiveDate(DEMO_TODAY);
    setEndDate("");
    setStatus("Draft");
    setConfirmationStatus("Pending LiliSare Confirmation");
    setNotes("");
    setChangeSummary("Created new configurable rule.");
    setEditorOpen(true);
  };

  const openEdit = (rule: ClinicalRule) => {
    setEditingRule(rule);
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
    setEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !serviceName.trim() || !visitType.trim()) {
      toast.error("Please fill in Rule Name, Service, and Visit Type.");
      return;
    }
    if (editingRule && editingRule.status === "Active" && !confirmImpactChecked) {
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
          id: editingRule?.id,
          ruleName: ruleName.trim(),
          agencyId: agency.id,
          agencyName: editingRule?.agencyName || agency.name,
          state: stateCode.trim() || agency.state,
          programId: `PRG-${programName.slice(0, 6).toUpperCase()}`,
          programName,
          serviceId: editingRule?.serviceId || "svc-custom",
          serviceName: serviceName.trim(),
          serviceCode: serviceCode.trim() || "CUSTOM",
          visitCategory,
          visitType: visitType.trim(),
          professionalType: profType,
          eligibleProfessionalTypes:
            profType === "RN"
              ? ["RN"]
              : profType === "Clinical Supervisor"
                ? ["RN", "Clinical Supervisor", "Field Supervisor"]
                : ["RN", "Clinical Supervisor", "Field Supervisor", "Qualified Non-RN Supervisor"],
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
      toast.success(
        editingRule
          ? "Rule updated with new version snapshot & audit event"
          : "New configurable rule saved"
      );
      setEditorOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save rule");
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto min-w-0 space-y-5 animate-in fade-in duration-300 pb-10">
      <ClinicalSubNav activeTab="rules" />

      {/* Regulatory & Configurability Notice */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-900 text-sm">
              Configurable Service-Based Reference Rules (Pending Confirmation Where Marked)
            </div>
            <p>
              Exact supervisory rules for CNA, IHSS, annual in-home visits, and service cadences remain configurable until LiliSare confirms jurisdictional policies. Existing completed records preserve the rule version snapshot active when created.
            </p>
          </div>
        </div>

        {canManageRules && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Visit Rule</span>
          </button>
        )}
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1180px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Rule Name</th>
                <th className="py-3.5 px-3">Agency</th>
                <th className="py-3.5 px-3">Program</th>
                <th className="py-3.5 px-3">Service</th>
                <th className="py-3.5 px-3">Visit Type</th>
                <th className="py-3.5 px-3">Required Professional</th>
                <th className="py-3.5 px-3">Frequency</th>
                <th className="py-3.5 px-3">Delivery</th>
                <th className="py-3.5 px-3">Effective Date</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Version</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap max-w-[230px] truncate">
                    {r.ruleName}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                    {r.agencyName}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap max-w-[155px] truncate">
                    {r.programName}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                    {r.serviceName}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                    {r.visitType}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    {r.professionalType}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                    {r.frequencyLabel}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                    {r.deliveryMethod}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {r.effectiveDate}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${r.status === "Active"
                        ? "bg-emerald-50 text-[#3D6B22] border-emerald-200"
                        : r.status === "Draft"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                    v{r.version}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewRule(r)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                        title="View Rule Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {canManageRules && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                            title="Edit Rule"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              duplicateClinicalRule(r.id, actor);
                              toast.success(`Duplicated ${r.id} as Draft`);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                            title="Duplicate Rule"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              toggleClinicalRuleStatus(r.id, actor);
                              toast.success(
                                `Rule ${r.id} ${r.status === "Active" ? "deactivated" : "activated"}`
                              );
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                            title={r.status === "Active" ? "Deactivate" : "Activate"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setHistoryRule(r)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                        title="View Version History"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Rule Details Modal */}
      <Modal
        isOpen={Boolean(viewRule)}
        onClose={() => setViewRule(null)}
        title={viewRule?.ruleName || "Rule Details"}
        description={
          viewRule
            ? `${viewRule.id} · v${viewRule.version} · ${viewRule.confirmationStatus}`
            : undefined
        }
        icon={<Sliders className="w-5 h-5" />}
        maxWidth="lg"
      >
        {viewRule && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Service / Code
                </span>
                <span className="font-semibold text-slate-900">
                  {viewRule.serviceName} ({viewRule.serviceCode})
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Required Professional
                </span>
                <span className="font-semibold text-slate-900">
                  {viewRule.professionalType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Initial / Recurrence
                </span>
                <span className="font-semibold text-slate-900">
                  {viewRule.initialVisitRequired ? "Initial + " : ""}
                  {viewRule.frequencyLabel}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Confirmation Status
                </span>
                <span className="font-semibold text-amber-800">
                  {viewRule.confirmationStatus}
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Internal Rule Notes
              </span>
              <p className="text-slate-700">{viewRule.internalNotes}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Version History Modal */}
      <Modal
        isOpen={Boolean(historyRule)}
        onClose={() => setHistoryRule(null)}
        title={`Version History — ${historyRule?.id}`}
        description="Historical snapshots are preserved immutably; existing clinical records retain their original rule version."
        icon={<History className="w-5 h-5" />}
        maxWidth="lg"
      >
        <div className="space-y-3">
          {historyRule?.versionHistory.map((snap, i) => (
            <div
              key={`${snap.version}-${i}`}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#3D6B22]">
                  v{snap.version} ({snap.status})
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {snap.updatedAt}
                </span>
              </div>
              <p className="text-slate-700 font-medium">{snap.changeSummary}</p>
              <div className="text-[11px] text-slate-500">
                Effective {snap.effectiveDate} · {snap.professionalType} ·{" "}
                {snap.recurrenceType} ({snap.deliveryMethod}) · By {snap.updatedBy}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Create / Edit Rule Modal */}
      <Modal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingRule ? `Edit Rule ${editingRule.id}` : "Create Visit Rule"}
        description="Configure service-based clinical and supervisory visit triggers."
        icon={<Sliders className="w-5 h-5" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {editingRule && editingRule.status === "Active" && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Active Rule Modification Safeguard</span>
              </div>
              <p>
                Modifying an active rule creates a new version forward from the Effective Date. Completed clinical visits and existing active requirements keep their original snapshot version and are NOT retroactively altered.
              </p>
              <label className="flex items-center gap-2 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmImpactChecked}
                  onChange={(e) => setConfirmImpactChecked(e.target.checked)}
                  className="rounded border-amber-400 text-[#3D6B22]"
                />
                <span>I confirm this change applies forward with version &amp; audit tracking.</span>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
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
              <FormLabel required>Service</FormLabel>
              <FormInput
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. HMA, IHSS, CNA"
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
              <FormLabel required>Recurrence Type</FormLabel>
              <FormSelect
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
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
              <FormLabel>Recurrence Interval (Days)</FormLabel>
              <FormInput
                type="number"
                min={0}
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value) || 0)}
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
              <FormLabel>End Date (Optional)</FormLabel>
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
              <FormLabel required>Confirmation Status</FormLabel>
              <FormSelect
                value={confirmationStatus}
                onChange={(e) =>
                  setConfirmationStatus(
                    e.target.value as "Confirmed" | "Pending LiliSare Confirmation"
                  )
                }
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending LiliSare Confirmation">
                  Pending LiliSare Confirmation
                </option>
              </FormSelect>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 pt-1 text-xs font-semibold text-slate-700">
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
              <span>Documentation Required</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reviewRequired}
                onChange={(e) => setReviewRequired(e.target.checked)}
                className="rounded border-slate-300 text-[#3D6B22]"
              />
              <span>Professional Review / Sign-off Required</span>
            </label>
          </div>

          <div>
            <FormLabel>Rule Notes &amp; Change Summary</FormLabel>
            <FormTextarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setEditorOpen(false)} />
            <FormButtonPrimary type="submit">Save Rule Version</FormButtonPrimary>
          </div>
        </form>
      </Modal>
    </div>
  );
}
