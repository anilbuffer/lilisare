"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Copy, Info, Plus, Power, RotateCcw, Search, Sliders } from "lucide-react";
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
  getClinicalRuleDetailHref,
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
import { Pagination } from "@/components/ui/Pagination";

export function ClinicalRulesWorkspace() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);
  const canManageRules = checkClinicalPermission(actor, "MANAGE_RULES").allowed;

  const [rules, setRules] = useState<ClinicalRule[]>(() => getClinicalRules());
  const [createOpen, setCreateOpen] = useState(false);

  // Column-aligned filters
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [profTypeFilter, setProfTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, serviceFilter, profTypeFilter, statusFilter]);

  // Create New Rule Form State
  const [ruleName, setRuleName] = useState("");
  const [agencyId, setAgencyId] = useState(CLINICAL_AGENCIES[0].id);
  const [stateCode, setStateCode] = useState("OR");
  const [programName, setProgramName] = useState(CLINICAL_PROGRAMS[0]);
  const [serviceName, setServiceName] = useState("");
  const [serviceCode, setServiceCode] = useState("T1019");
  const [visitCategory, setVisitCategory] =
    useState<ClinicalVisitCategory>("Recurring RN Visit");
  const [visitType, setVisitType] = useState("Supervisory Visit");
  const [profType, setProfType] = useState<ClinicalProfessionalType>("RN");
  const [initialReq, setInitialReq] = useState(true);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("Quarterly");
  const [intervalDays, setIntervalDays] = useState(90);
  const [deliveryMethod, setDeliveryMethod] = useState<VisitDeliveryMethod>("In-home");
  const [docRequired, setDocRequired] = useState(true);
  const [reviewRequired, setReviewRequired] = useState(true);
  const [effectiveDate, setEffectiveDate] = useState(DEMO_TODAY);
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Draft">("Draft");
  const [confirmationStatus, setConfirmationStatus] = useState<
    "Confirmed" | "Pending LiliSare Confirmation"
  >("Pending LiliSare Confirmation");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const load = () => setRules(getClinicalRules());
    const timer = window.setTimeout(load, 0);
    const unsub = subscribeToClinicalSync(load);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);

  const uniqueServices = useMemo(
    () => Array.from(new Set(rules.map((r) => r.serviceName))).sort(),
    [rules]
  );

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (serviceFilter !== "all" && r.serviceName !== serviceFilter) return false;
      if (profTypeFilter !== "all" && r.professionalType !== profTypeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const hay = `${r.id} ${r.ruleName} ${r.serviceName} ${r.professionalType} ${r.frequencyLabel}`.toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }, [rules, serviceFilter, profTypeFilter, statusFilter, searchTerm]);

  const handleToggleRuleStatus = (ruleId: string) => {
    try {
      const updated = toggleClinicalRuleStatus(ruleId, actor);
      toast.success(`Rule ${updated.id} is now ${updated.status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update rule status");
    }
  };

  const handleDuplicateRule = (ruleId: string) => {
    try {
      const copy = duplicateClinicalRule(ruleId, actor);
      toast.success(`Duplicated rule as ${copy.id} (Draft)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to duplicate rule");
    }
  };

  const openCreate = () => {
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
    setCreateOpen(true);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !serviceName.trim() || !visitType.trim()) {
      toast.error("Please fill in Rule Name, Service, and Visit Type.");
      return;
    }

    const agency =
      CLINICAL_AGENCIES.find((a) => a.id === agencyId) || CLINICAL_AGENCIES[0];
    const freqLabel =
      recurrenceType === "None"
        ? "None (Exception Only)"
        : `${recurrenceType} (${intervalDays}d)`;

    try {
      const created = saveClinicalRule(
        {
          ruleName: ruleName.trim(),
          agencyId: agency.id,
          agencyName: agency.name,
          state: stateCode.trim() || agency.state,
          programId: `PRG-${programName.slice(0, 6).toUpperCase()}`,
          programName,
          serviceId: "svc-custom",
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
          changeSummary: "Created new configurable rule.",
        },
        actor
      );
      toast.success(`New rule ${created.id} created`);
      setCreateOpen(false);
      router.push(getClinicalRuleDetailHref(created.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create rule");
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto min-w-0 space-y-5 animate-in fade-in duration-300 pb-10">
      <ClinicalSubNav activeTab="rules" />

      {/* Regulatory & Configurability Notice */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-900 text-sm">
              Configurable Service-Based Reference Rules (Pending Confirmation Where Marked)
            </div>
            <p>
              Exact supervisory rules for CNA, IHSS, annual in-home visits, and service cadences remain configurable until LiliSare confirms jurisdictional policies. Select any rule to view or edit full configuration, delivery policies, and version history.
            </p>
          </div>
        </div>

        {canManageRules && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Visit Rule</span>
          </button>
        )}
      </div>

      {/* Column-Aligned Filter Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rule name, service, frequency..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter by Service"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Services</option>
            {uniqueServices.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by Required Professional"
            value={profTypeFilter}
            onChange={(e) => setProfTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Professionals</option>
            <option value="RN">RN</option>
            <option value="Clinical Supervisor">Clinical Supervisor</option>
            <option value="Field Supervisor">Field Supervisor</option>
            <option value="Qualified Non-RN Supervisor">Qualified Non-RN Supervisor</option>
          </select>
          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setServiceFilter("all");
              setProfTypeFilter("all");
              setStatusFilter("all");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Standardized Clean Rules Table (6 Concise Columns, Zero Horizontal Scroll) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Rule Name</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Required Professional</th>
                <th className="py-3.5 px-4">Frequency</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No visit rules match the active filters.
                  </td>
                </tr>
              ) : (
                filteredRules
                  .slice(
                    (Math.min(currentPage, Math.max(1, Math.ceil(filteredRules.length / pageSize))) - 1) * pageSize,
                    Math.min(currentPage, Math.max(1, Math.ceil(filteredRules.length / pageSize))) * pageSize
                  )
                  .map((r) => {
                  const detailHref = getClinicalRuleDetailHref(r.id);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => router.push(detailHref)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap max-w-[230px] truncate group-hover:text-[#3D6B22]">
                        {r.ruleName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap truncate max-w-[170px]">
                        {r.serviceName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {r.professionalType}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {r.frequencyLabel}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {canManageRules && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleRuleStatus(r.id)}
                                title={r.status === "Active" ? "Deactivate rule" : "Activate rule"}
                                aria-label={r.status === "Active" ? `Deactivate ${r.id}` : `Activate ${r.id}`}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors cursor-pointer"
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateRule(r.id)}
                                title="Duplicate rule"
                                aria-label={`Duplicate ${r.id}`}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <Link
                            href={detailHref}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={Math.min(currentPage, Math.max(1, Math.ceil(filteredRules.length / pageSize)))}
          totalPages={Math.max(1, Math.ceil(filteredRules.length / pageSize))}
          totalItems={filteredRules.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          entryLabel="rules"
        />
      </div>

      {/* Create Visit Rule Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Visit Rule"
        description="Configure a new service-based clinical or supervisory visit rule."
        icon={<Sliders className="w-5 h-5" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveNew} className="space-y-4">
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
            <FormLabel>Rule Notes</FormLabel>
            <FormTextarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setCreateOpen(false)} />
            <FormButtonPrimary type="submit">Create Rule</FormButtonPrimary>
          </div>
        </form>
      </Modal>
    </div>
  );
}
