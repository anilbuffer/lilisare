"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Target,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  Plus,
  Lock,
  FileCheck,
  Sparkles,
  Edit2,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { PortalRole } from "../AdminClientDetailView";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientPlanOfCareTabProps {
  client: ClientRecord;
  userRole?: PortalRole;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientPlanOfCareTab({
  client,
  userRole = "admin",
  onUpdateClient,
}: ClientPlanOfCareTabProps) {
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const plan = client.planOfCareDetails || {
    goals: [],
    interventions: [],
    riskFactors: [],
    emergencyProtocol: "",
    physicianSignedDate: "",
    nextReviewDate: "",
    rnSupervisor: "",
  };

  const [newGoal, setNewGoal] = useState({
    goal: "",
    targetDate: "Dec 31, 2026",
    progress: "In Progress" as "Achieved" | "In Progress" | "Needs Adjustment",
  });
  const [newIntervention, setNewIntervention] = useState("");

  const canRevisePlan = userRole === "admin" || userRole === "clinical";

  const handleSavePlanRevision = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedGoals = [...plan.goals];
    if (newGoal.goal.trim()) {
      updatedGoals.push({
        goal: newGoal.goal.trim(),
        targetDate: newGoal.targetDate,
        progress: newGoal.progress,
      });
    }

    let updatedInterventions = [...plan.interventions];
    if (newIntervention.trim()) {
      updatedInterventions.push(newIntervention.trim());
    }

    const updatedPlan = {
      ...plan,
      goals: updatedGoals,
      interventions: updatedInterventions,
    };

    const updated: ClientRecord = {
      ...client,
      planOfCareDetails: updatedPlan,
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsReviseModalOpen(false);
    setNewGoal({
      goal: "",
      targetDate: "Dec 31, 2026",
      progress: "In Progress",
    });
    setNewIntervention("");
    toast.success("Plan of Care updated with new clinical orders.");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Role Notice Banner for Non-Clinical roles */}
      {!canRevisePlan && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-700 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Clinical Plan Oversight:</strong> Care plan goals and interventions are authored by the Supervising Nurse RN. Displayed for operational alignment.
            </span>
          </div>
          <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px] bg-slate-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto shrink-0">
            {userRole.toUpperCase()} VIEW
          </span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Person-Centered Plan of Care (POC)
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <FileCheck className="w-3 h-3 text-[#3D6B22]" /> Active Order
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Clinical milestones, nursing interventions, physician signed orders, and safety protocols
            </p>
          </div>
        </div>

        {canRevisePlan && (
          <button
            type="button"
            onClick={() => setIsReviseModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Revise Care Plan</span>
          </button>
        )}
      </div>

      {/* Overview Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Physician Signed Date
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {plan.physicianSignedDate || "Oct 24, 2026"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 px-2 py-0.5 rounded-full">
              Signed (MD)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            CMS 485 Compliance Approved
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Next 60-Day Recertification
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {plan.nextReviewDate || "Dec 24, 2026"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              In 30 Days
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Supervising RN visit scheduled
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Supervising Clinical Nurse
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold text-[#3D6B22]">
              {plan.rnSupervisor || "Sarah Jenkins, RN BSN"}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            License #RN-89421 • Clinical Lead
          </div>
        </div>
      </div>

      {/* Clinical Goals & Milestones */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#3D6B22]" />
              <span>Clinical Goals & Measurable Milestones</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Progressive benchmarks evaluated during monthly nurse assessments
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 border border-[#3D6B22]/20 px-3 py-1 rounded-full">
            Active Care Cycle
          </span>
        </div>

        <div className="space-y-3.5">
          {plan.goals.map((g, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900">{g.goal}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Target: {g.targetDate}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${g.progress === "Achieved"
                      ? "bg-emerald-50 text-[#3D6B22] border border-emerald-200"
                      : g.progress === "In Progress"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                  >
                    {g.progress}
                  </span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Progress Status</span>
                  <span className="font-bold text-slate-700">{g.progress}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${g.progress === "Achieved"
                      ? "bg-[#3D6B22] w-full"
                      : g.progress === "In Progress"
                        ? "bg-[#3D6B22] w-2/3"
                        : "bg-amber-500 w-1/3"
                      }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interventions and Emergency Protocols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Interventions */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-3">
          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Nursing Interventions
          </h4>
          <ul className="space-y-2.5">
            {plan.interventions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-700"
              >
                <CheckCircle2 className="w-4 h-4 text-[#3D6B22] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Emergency Protocol */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-3">
          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Emergency Protocols & Risk Factors</span>
          </h4>
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              Emergency Action Directive
            </span>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              {plan.emergencyProtocol || "Call 911 immediately upon fall, sudden paralysis, or chest pain. Contact Primary Caregiver and Healthcare POA within 15 minutes."}
            </p>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Identified Risk Factors
            </span>
            <div className="flex flex-wrap gap-2">
              {plan.riskFactors.map((r, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revise Care Plan Modal */}
      <Modal
        isOpen={isReviseModalOpen}
        onClose={() => setIsReviseModalOpen(false)}
        title="Revise Clinical Plan of Care"
        icon={<Target className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleSavePlanRevision} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Add Measurable Clinical Goal
            </label>
            <input
              type="text"
              value={newGoal.goal}
              onChange={(e) => setNewGoal({ ...newGoal, goal: e.target.value })}
              placeholder="e.g. Independent bedside transfer using grab bar with supervision"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Target Evaluation Date
              </label>
              <input
                type="text"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                placeholder="e.g. Dec 31, 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Initial Progress Status
              </label>
              <select
                value={newGoal.progress}
                onChange={(e) => setNewGoal({ ...newGoal, progress: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
              >
                <option value="In Progress">In Progress</option>
                <option value="Achieved">Achieved</option>
                <option value="Needs Adjustment">Needs Adjustment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Add Nursing Intervention
            </label>
            <input
              type="text"
              value={newIntervention}
              onChange={(e) => setNewIntervention(e.target.value)}
              placeholder="e.g. Daily range of motion exercises 15 mins twice per shift"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsReviseModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Care Plan Updates</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
