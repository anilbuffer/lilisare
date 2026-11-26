"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Info,
  X,
  Edit2,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { EvvToleranceRule } from "@/types/evvVisit";
import {
  getEvvRulesFromStorage,
  saveEvvRule,
  toggleEvvRule,
  EVV_SYNC_EVENT,
} from "@/lib/admin/evvVisitsStore";
import { EvvSubNav } from "./EvvSubNav";

export function EvvRulesWorkspace() {
  const [rules, setRules] = useState<EvvToleranceRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EvvToleranceRule | null>(null);

  // Form fields
  const [ruleName, setRuleName] = useState("");
  const [payer, setPayer] = useState("Health First Colorado (Medicaid)");
  const [program, setProgram] = useState("HCBS-EBD");
  const [serviceCode, setServiceCode] = useState("ALL");
  const [serviceName, setServiceName] = useState("All Covered Services");
  const [clockInTolerance, setClockInTolerance] = useState(10);
  const [clockOutTolerance, setClockOutTolerance] = useState(10);
  const [earlyArrival, setEarlyArrival] = useState<"Allow" | "Allow within Grace" | "Flag for Review" | "Round to Schedule">("Allow within Grace");
  const [lateArrival, setLateArrival] = useState<"Allow within Grace" | "Require Reason" | "Flag Exception">("Allow within Grace");
  const [earlyDeparture, setEarlyDeparture] = useState<"Flag Exception" | "Allow within Grace" | "Require Supervisor Approval">("Require Supervisor Approval");
  const [lateDeparture, setLateDeparture] = useState<"Allow within Grace" | "Require Overtime Approval" | "Flag Exception">("Allow within Grace");
  const [reviewRequired, setReviewRequired] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [description, setDescription] = useState("");

  const loadRules = () => {
    setRules(getEvvRulesFromStorage());
  };

  useEffect(() => {
    loadRules();
    if (typeof window !== "undefined") {
      window.addEventListener(EVV_SYNC_EVENT, loadRules);
      window.addEventListener("storage", loadRules);
      return () => {
        window.removeEventListener(EVV_SYNC_EVENT, loadRules);
        window.removeEventListener("storage", loadRules);
      };
    }
  }, []);

  const openAddModal = () => {
    setEditingRule(null);
    setRuleName("");
    setPayer("Health First Colorado (Medicaid)");
    setProgram("HCBS-EBD");
    setServiceCode("ALL");
    setServiceName("All Covered Services");
    setClockInTolerance(10);
    setClockOutTolerance(10);
    setEarlyArrival("Allow within Grace" as any);
    setLateArrival("Allow within Grace");
    setEarlyDeparture("Require Supervisor Approval");
    setLateDeparture("Allow within Grace");
    setReviewRequired(false);
    setApprovalRequired(false);
    setDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (r: EvvToleranceRule) => {
    setEditingRule(r);
    setRuleName(r.ruleName);
    setPayer(r.payer);
    setProgram(r.program);
    setServiceCode(r.serviceCode);
    setServiceName(r.serviceName);
    setClockInTolerance(r.clockInToleranceMinutes);
    setClockOutTolerance(r.clockOutToleranceMinutes);
    setEarlyArrival(r.earlyArrivalHandling);
    setLateArrival(r.lateArrivalHandling);
    setEarlyDeparture(r.earlyDepartureHandling);
    setLateDeparture(r.lateDepartureHandling);
    setReviewRequired(r.reviewRequired);
    setApprovalRequired(r.approvalRequired);
    setDescription(r.description || "");
    setIsModalOpen(true);
  };

  const handleToggle = (id: string) => {
    toggleEvvRule(id);
    toast.success("Rule Status Updated");
    loadRules();
  };

  const handleSaveRule = () => {
    if (!ruleName.trim()) {
      toast.error("Rule name required");
      return;
    }

    const newRule: EvvToleranceRule = {
      id: editingRule ? editingRule.id : `RULE-${Date.now().toString().slice(-4)}`,
      ruleName: ruleName.trim(),
      payer,
      program,
      serviceCode,
      serviceName,
      clockInToleranceMinutes: Number(clockInTolerance),
      clockOutToleranceMinutes: Number(clockOutTolerance),
      earlyArrivalHandling: earlyArrival,
      lateArrivalHandling: lateArrival,
      earlyDepartureHandling: earlyDeparture,
      lateDepartureHandling: lateDeparture,
      reviewRequired,
      approvalRequired,
      effectiveDate: editingRule ? editingRule.effectiveDate : "2026-01-01",
      isActive: editingRule ? editingRule.isActive : true,
      description: description.trim(),
    };

    saveEvvRule(newRule);
    toast.success(editingRule ? "Rule Updated" : "New EVV Rule Added", {
      description: `Tolerance rule ${newRule.ruleName} saved.`,
    });
    setIsModalOpen(false);
    loadRules();
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            EVV Rules &amp; Tolerances
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3e6b2b] hover:bg-[#345c1d] rounded-xl shadow-md shadow-[#3e6b2b]/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tolerance Rule</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <EvvSubNav />

      {/* Explanatory Banner: Deterministic Consistency Guarantee */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl lg:rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs">
        <Info className="w-5 h-5 text-[#3e6b2b] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-sm">
            Deterministic Grace Window Matching Policy
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Visits are evaluated deterministically against these rules by matching Payer, Program, and Service Code. If a shift variance falls within the configured tolerance (e.g. Rahul Sharma&apos;s +1m clock-in / +2m clock-out against the 10-minute Medicaid rule), it is automatically marked <strong>Verified</strong> and will not generate an artificial exception.
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Fallback Policy: Unmatched visits default to Agency Fallback Rule (10m grace, supervisor review on negative variance).
          </p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-20">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Rule Name</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Payer</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Service Code</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Tolerance Window</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-900 block">{rule.ruleName}</span>
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-700">
                    {rule.payer}
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono font-bold text-slate-700 text-[10px]">
                      {rule.serviceCode}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-semibold text-[#3e6b2b]">
                      ±{rule.clockInToleranceMinutes} mins
                    </span>
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggle(rule.id)}
                      className="inline-flex items-center gap-1.5 cursor-pointer"
                      title="Toggle active status"
                    >
                      {rule.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEditModal(rule)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Rule</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#3e6b2b]/10 text-[#3e6b2b] flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingRule ? "Edit EVV Tolerance Rule" : "Create EVV Tolerance Rule"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define grace windows and review requirements by payer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Rule Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g., CES Waiver Strict 7-Minute Window"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payer</label>
                  <select
                    value={payer}
                    onChange={(e) => setPayer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Health First Colorado (Medicaid)">Health First Colorado (Medicaid)</option>
                    <option value="Commercial / Private Insurance">Commercial / Private Insurance</option>
                    <option value="Veterans Care Coordination">Veterans Care Coordination</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Program</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="HCBS-EBD">HCBS-EBD</option>
                    <option value="CES">CES Waiver</option>
                    <option value="IHSS">IHSS</option>
                    <option value="Private Duty">Private Duty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service Code</label>
                  <input
                    type="text"
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value)}
                    placeholder="e.g., T1019 or ALL"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service Label</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g., Personal Care"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Clock-in Tolerance (Minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={clockInTolerance}
                    onChange={(e) => setClockInTolerance(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Clock-out Tolerance (Minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={clockOutTolerance}
                    onChange={(e) => setClockOutTolerance(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Early Arrival</label>
                  <select
                    value={earlyArrival}
                    onChange={(e) => setEarlyArrival(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Allow within Grace">Allow within Grace</option>
                    <option value="Flag for Review">Flag for Review</option>
                    <option value="Round to Schedule">Round to Schedule</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Late Departure</label>
                  <select
                    value={lateDeparture}
                    onChange={(e) => setLateDeparture(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Allow within Grace">Allow within Grace</option>
                    <option value="Require Overtime Approval">Require Overtime Approval</option>
                    <option value="Flag Exception">Flag Exception</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rule Policy Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain policy justification or contract basis..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewRequired}
                    onChange={(e) => setReviewRequired(e.target.checked)}
                    className="rounded text-[#3e6b2b] h-4 w-4"
                  />
                  <span className="font-semibold text-slate-700">Require supervisor review on variance</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="px-4 py-2 text-xs font-bold text-white bg-[#3e6b2b] hover:bg-[#345c1d] rounded-xl shadow-md shadow-[#3e6b2b]/20"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
