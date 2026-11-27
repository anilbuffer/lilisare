"use client";

import React, { useMemo, useState } from "react";
import {
  HeartHandshake,
  AlertCircle,
  Lock,
  FileCheck,
  Target,
  FileSpreadsheet,
  ShieldAlert,
} from "lucide-react";
import {
  CarePlanChallenge,
  ClientRecord,
  PocReportEntry,
} from "@/types/client";
import { PortalRole } from "../AdminClientDetailView";
import {
  saveClientsToStorage,
  getClientsFromStorage,
} from "@/lib/clients/mockData";
import { CarePlanChallengesView } from "./plan-of-care/CarePlanChallengesView";
import { PocReportView } from "./plan-of-care/PocReportView";

interface ClientPlanOfCareTabProps {
  client: ClientRecord;
  userRole?: PortalRole;
  onUpdateClient?: (updated: ClientRecord) => void;
}

type PocSubTab = "care-plan" | "poc-report" | "emergency";

export function ClientPlanOfCareTab({
  client,
  userRole = "admin",
  onUpdateClient,
}: ClientPlanOfCareTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<PocSubTab>("care-plan");
  const canRevisePlan = userRole === "admin" || userRole === "clinical";

  const plan = client.planOfCareDetails || {
    goals: [],
    interventions: [],
    riskFactors: [],
    emergencyProtocol: "",
    physicianSignedDate: "Oct 24, 2026",
    nextReviewDate: "Dec 24, 2026",
    rnSupervisor: "Sarah Jenkins, RN BSN",
  };

  // Fallback mapping if a client only has legacy goals/interventions without challenges
  const resolvedChallenges: CarePlanChallenge[] = useMemo(() => {
    if (plan.challenges && plan.challenges.length > 0) {
      return plan.challenges;
    }
    if (plan.goals.length === 0 && plan.interventions.length === 0) {
      return [];
    }
    return [
      {
        id: `CHG-${client.id}-DEFAULT`,
        title: "Primary Clinical Care & ADL Support",
        status: "In Progress",
        isActive: true,
        outcomes: [
          {
            id: `OUT-${client.id}-1`,
            description: `${client.preferredName || client.name} will maintain safe daily living routines with scheduled nursing and caregiver support.`,
            status: "In Progress",
            effectiveDate: plan.physicianSignedDate || "10/24/2026",
            isActive: true,
          },
        ],
        goals: plan.goals.map((g, i) => ({
          id: `GOL-${client.id}-${i}`,
          description: g.goal,
          currentProgress: g.progress === "Achieved" ? "5 / 5" : "3 / 5",
          baseline: "2. Minimal",
          target: "4. Supervised",
          targetDate: g.targetDate,
          status: g.progress === "Achieved" ? "Achieved" : "In Progress",
          effectiveDate: plan.physicianSignedDate || "10/24/2026",
          isActive: true,
        })),
        interventions: plan.interventions.map((intv, i) => ({
          id: `INT-${client.id}-${i}`,
          description: intv,
          frequency: "Daily",
          instructions: "Document in daily shift care notes.",
          status: "In Progress",
          effectiveDate: plan.physicianSignedDate || "10/24/2026",
          isActive: true,
        })),
        evaluations: [],
      },
    ];
  }, [plan, client.id, client.name, client.preferredName]);

  const resolvedReports: PocReportEntry[] = useMemo(() => {
    if (plan.pocReports && plan.pocReports.length > 0) {
      return plan.pocReports;
    }
    return [
      {
        id: `POC-${client.id}-1`,
        clientName: client.name,
        practitioner: "Dr. Gregory House, MD",
        practitionerFax: "1-541-555-8821",
        certStart: plan.physicianSignedDate || "10/24/2026",
        certEnd: plan.nextReviewDate || "12/24/2026",
        clinician: plan.rnSupervisor || "Evelyn Vance, RN",
        status: "Reviewer Accepted",
        note: "Active 60-day certification period.",
        modifiedBy: plan.rnSupervisor || "Evelyn Vance, RN",
        modifiedDate: plan.physicianSignedDate || "10/24/2026",
        sentDate: plan.physicianSignedDate || "10/24/2026",
      },
    ];
  }, [plan, client.id, client.name]);

  const persistPlanUpdate = (partialPlan: Partial<NonNullable<ClientRecord["planOfCareDetails"]>>) => {
    const updatedPlan = {
      ...plan,
      ...partialPlan,
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
  };

  const cardOutlineClass =
    "bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Role Notice Banner for Non-Clinical roles */}
      {!canRevisePlan && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-700 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Clinical Plan Oversight:</strong> Care plan goals and interventions are
              authored by the Supervising Nurse RN. Displayed for operational alignment.
            </span>
          </div>
          <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px] bg-slate-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto shrink-0">
            {userRole.toUpperCase()} VIEW
          </span>
        </div>
      )}

      {/* Top Banner */}
      <div className={`${cardOutlineClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Person-Centered Plan of Care (POC)
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <FileCheck className="w-3 h-3 text-[#3D6B22]" /> Active Order
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Challenges, outcomes, measurable goals, interventions, and CMS 485 certification tracking
            </p>
          </div>
        </div>
      </div>

      {/* Overview Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={cardOutlineClass}>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Physician Signed Date
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {plan.physicianSignedDate || "Oct 24, 2026"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 px-2 py-0.5 rounded-full shrink-0">
              Signed (MD)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            CMS 485 Compliance Approved
          </div>
        </div>

        <div className={cardOutlineClass}>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Next 60-Day Recertification
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {plan.nextReviewDate || "Dec 24, 2026"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full shrink-0">
              In 30 Days
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Supervising RN visit scheduled
          </div>
        </div>

        <div className={cardOutlineClass}>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Supervising Clinical Nurse
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-base sm:text-lg font-bold text-[#3D6B22]">
              {plan.rnSupervisor || "Evelyn Vance, RN BSN"}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            License #RN-89421 • Clinical Lead
          </div>
        </div>
      </div>

      {/* Responsive Sub-Tab Navigation */}
      <div
        role="tablist"
        aria-label="Plan of Care sections"
        className="bg-white rounded-xl lg:rounded-2xl p-1.5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-wrap sm:inline-flex gap-1.5 w-full sm:w-auto"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === "care-plan"}
          onClick={() => setActiveSubTab("care-plan")}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "care-plan"
              ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Target className="w-3.5 h-3.5 shrink-0" />
          <span>Care Plan</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              activeSubTab === "care-plan"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {resolvedChallenges.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === "poc-report"}
          onClick={() => setActiveSubTab("poc-report")}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "poc-report"
              ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
          <span>Plan of Care Report</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              activeSubTab === "poc-report"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {resolvedReports.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === "emergency"}
          onClick={() => setActiveSubTab("emergency")}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "emergency"
              ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Emergency & Risks</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeSubTab === "care-plan" && (
        <CarePlanChallengesView
          challenges={resolvedChallenges}
          canEdit={canRevisePlan}
          onUpdateChallenges={(updatedChallenges) =>
            persistPlanUpdate({ challenges: updatedChallenges })
          }
        />
      )}

      {activeSubTab === "poc-report" && (
        <PocReportView
          reports={resolvedReports}
          clientName={client.name}
          canEdit={canRevisePlan}
          onUpdateReports={(updatedReports) =>
            persistPlanUpdate({ pocReports: updatedReports })
          }
        />
      )}

      {activeSubTab === "emergency" && (
        <div className={`${cardOutlineClass} space-y-4`}>
          <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Emergency Protocols & Risk Factors</span>
          </h4>
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              Emergency Action Directive
            </span>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
              {plan.emergencyProtocol ||
                "Call 911 immediately upon fall, sudden paralysis, or chest pain. Contact Primary Caregiver and Healthcare POA within 15 minutes."}
            </p>
          </div>

          <div className="pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              Identified Risk Factors
            </span>
            <div className="flex flex-wrap gap-2">
              {plan.riskFactors.map((r, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
