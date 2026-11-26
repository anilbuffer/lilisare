"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  Layers,
  Sliders,
  ChevronDown,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Save,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { EvvToleranceRule } from "@/types/evvVisit";
import {
  getEvvRulesFromStorage,
  saveEvvRule,
  deleteEvvRule,
  EVV_SYNC_EVENT,
} from "@/lib/admin/evvVisitsStore";
import { EvvSubNav } from "./EvvSubNav";
import { EvvToleranceRuleModal } from "./EvvToleranceRuleModal";

export function EvvRulesWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedJurisdiction, setSelectedJurisdiction] = useState(
    searchParams.get("jurisdiction") || "All Jurisdictions"
  );
  const [selectedDateFilter, setSelectedDateFilter] = useState(
    searchParams.get("dateRange") || "Today & Recent"
  );

  useEffect(() => {
    const j = searchParams.get("jurisdiction") || "All Jurisdictions";
    const d = searchParams.get("dateRange") || "Today & Recent";
    setSelectedJurisdiction(j);
    setSelectedDateFilter(d);
  }, [searchParams]);

  const [rules, setRules] = useState<EvvToleranceRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<EvvToleranceRule | null>(null);

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

  const filteredRules = useMemo(() => {
    if (selectedJurisdiction === "All Jurisdictions") return rules;
    return rules.filter((r) => {
      if (selectedJurisdiction === "Ohio Medicaid (ODM)") {
        return r.stateCode === "OH" || r.payer?.includes("Ohio") || r.aggregatorName === "Sandata";
      }
      if (selectedJurisdiction === "NJ FamilyCare") {
        return r.stateCode === "NJ" || r.payer?.includes("NJ") || r.aggregatorName === "HHAeXchange";
      }
      if (selectedJurisdiction === "Florida AHCA") {
        return r.stateCode === "FL" || r.payer?.includes("Florida") || r.aggregatorName === "Netsmart";
      }
      if (selectedJurisdiction === "Private Pay / Commercial") {
        return r.payer?.includes("Private") || r.payer?.includes("Commercial") || r.aggregatorName === "CareBridge";
      }
      return true;
    });
  }, [rules, selectedJurisdiction]);

  const handleToleranceChange = (ruleId: string, minutes: number) => {
    const updated = rules.map((r) =>
      r.id === ruleId
        ? {
            ...r,
            timeToleranceMinutes: minutes,
            clockInToleranceMinutes: minutes,
            clockOutToleranceMinutes: minutes,
          }
        : r
    );
    setRules(updated);
    const target = updated.find((r) => r.id === ruleId);
    if (target) {
      saveEvvRule(target);
      toast.success("Tolerance Window Updated", {
        description: `${target.statePayerName || target.ruleName} tolerance set to ±${minutes} min.`,
      });
    }
  };

  const handleOpenCreateModal = () => {
    setRuleToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: EvvToleranceRule, e: React.MouseEvent) => {
    e.stopPropagation();
    setRuleToEdit(rule);
    setIsModalOpen(true);
  };

  const handleSaveRule = (updatedRule: EvvToleranceRule) => {
    saveEvvRule(updatedRule);
    loadRules();
    toast.success(
      ruleToEdit ? "EVV Tolerance Rule Updated" : "EVV Tolerance Rule Created",
      {
        description: `${updatedRule.ruleName} configured successfully for ${updatedRule.payer}.`,
      }
    );
  };

  const handleDeleteRule = (ruleId: string, ruleName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteEvvRule(ruleId);
    loadRules();
    toast.success("EVV Rule Removed", {
      description: `${ruleName} has been deleted.`,
    });
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Shared SubNav Header */}
      <EvvSubNav
        activeTabOverride="submissions"
        exceptionCount={6}
        totalVisitsCount={11}
        selectedJurisdiction={selectedJurisdiction}
        onJurisdictionChange={(j) => setSelectedJurisdiction(j)}
        selectedDateFilter={selectedDateFilter}
        onDateFilterChange={(d) => setSelectedDateFilter(d)}
      />

      {/* Sub-Navigation Pills (Screenshot 4, 5, 6) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <Link
          href="/admin/evv-visits/submissions?tab=readiness"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Visit Readiness & Holds</span>
        </Link>

        <Link
          href="/admin/evv-visits/submissions?tab=batch"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Batch Submissions</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#3D6B22] text-white border border-[#3D6B22] shadow-sm transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Payer Tolerance & State Connectors</span>
        </button>
      </div>

      {/* Main Rules Card (Screenshot 6) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header inside Card */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Configurable Agency, Payer & State EVV Tolerance Rules
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed max-w-4xl">
              Small clock-in/out variances (1–2 min) within configured tolerance do not create exceptions. Evidence requirements adapt by jurisdiction and payer.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create EVV Rule</span>
          </button>
        </div>

        {/* Clean Front List Table */}
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-3">STATE / PAYER</th>
                <th className="py-3.5 px-3">AGGREGATOR</th>
                <th className="py-3.5 px-3">TIME TOLERANCE</th>
                <th className="py-3.5 px-3">GEOFENCE RADIUS</th>
                <th className="py-3.5 px-3">GPS</th>
                <th className="py-3.5 px-3">SIGNATURE</th>
                <th className="py-3.5 px-3">VOICE (IVR)</th>
                <th className="py-3.5 pr-6 pl-3 text-right w-32">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRules.map((rule) => {
                const tol = rule.timeToleranceMinutes || rule.clockInToleranceMinutes || 7;
                return (
                  <tr
                    key={rule.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* STATE / PAYER */}
                    <td className="py-4 pl-6 pr-3">
                      <div className="font-bold text-slate-900">
                        {rule.stateCode || "OH"}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {rule.statePayerName || rule.payer}
                      </div>
                    </td>

                    {/* AGGREGATOR */}
                    <td className="py-4 px-3 font-semibold text-slate-800">
                      {rule.aggregatorName || "Sandata"}
                    </td>

                    {/* TIME TOLERANCE (Interactive dropdown) */}
                    <td className="py-4 px-3">
                      <div className="relative inline-block">
                        <select
                          value={tol}
                          onChange={(e) =>
                            handleToleranceChange(rule.id, parseInt(e.target.value, 10))
                          }
                          className="appearance-none pl-3 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 shadow-2xs cursor-pointer"
                        >
                          <option value={5}>±5 min</option>
                          <option value={7}>±7 min</option>
                          <option value={10}>±10 min</option>
                          <option value={15}>±15 min</option>
                          <option value={20}>±20 min</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>

                    {/* GEOFENCE RADIUS */}
                    <td className="py-4 px-3 font-semibold text-slate-800">
                      {rule.geofenceRadiusFeet || 150} ft
                    </td>

                    {/* GPS */}
                    <td className="py-4 px-3">
                      {rule.gpsRequirement === "Required" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-500">
                          Optional
                        </span>
                      )}
                    </td>

                    {/* SIGNATURE */}
                    <td className="py-4 px-3">
                      {rule.signatureRequirement === "Required" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-500">
                          Optional
                        </span>
                      )}
                    </td>

                    {/* VOICE (IVR) */}
                    <td className="py-4 px-3">
                      {rule.voiceRequirement === "Required" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          Required
                        </span>
                      ) : rule.voiceRequirement === "Not Applicable" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-400">
                          Not Applicable
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-500">
                          Optional
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 pr-6 pl-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(rule, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                          title="Edit EVV Rule"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteRule(rule.id, rule.ruleName, e)}
                          className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Tolerance Rule Modal */}
      <EvvToleranceRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ruleToEdit={ruleToEdit}
        onSave={handleSaveRule}
      />
    </div>
  );
}
