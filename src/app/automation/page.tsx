"use client";

import React, { useState } from "react";
import { GitBranch, Plus, Zap, Bell, CheckCircle2, AlertCircle, Clock, ToggleLeft, ToggleRight, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  category: "Compliance" | "Authorizations" | "EVV" | "Billing";
  isActive: boolean;
  executionsThisMonth: number;
}

const MOCK_RULES: AutomationRule[] = [
  {
    id: "rule-1",
    name: "Expiring Credential Reminder (30-15-7 Days)",
    trigger: "When a caregiver credential (CPR, First Aid, TB) is within 30 days of expiry",
    action: "Send SMS & In-app reminder to Caregiver; notify Compliance Officer if unrenewed at 7 days",
    category: "Compliance",
    isActive: true,
    executionsThisMonth: 18,
  },
  {
    id: "rule-2",
    name: "Case Manager Authorization Renewal Trigger",
    trigger: "When authorized units reach 85% or expiry is within 21 days",
    action: "Draft re-authorization request to Case Manager Dana and alert Agency Admin",
    category: "Authorizations",
    isActive: true,
    executionsThisMonth: 6,
  },
  {
    id: "rule-3",
    name: "EVV Late Clock-In Dispatch Escalation",
    trigger: "When a scheduled shift is 15 minutes past start time with no clock-in punch",
    action: "Send automated push alert to caregiver; alert Scheduler dispatcher on duty",
    category: "EVV",
    isActive: true,
    executionsThisMonth: 12,
  },
  {
    id: "rule-4",
    name: "Pre-Billing QA Scrub Automated Lock",
    trigger: "When shift documentation is missing or note is unsigned after 24 hours",
    action: "Flag visit on QA scrub board and block claim batch submission until signed",
    category: "Billing",
    isActive: true,
    executionsThisMonth: 34,
  },
  {
    id: "rule-5",
    name: "Caregiver Activation Safety Gate",
    trigger: "When caregiver profile reaches 100% onboarding checklist",
    action: "Cross-check client service authorization status before granting schedule access",
    category: "Compliance",
    isActive: true,
    executionsThisMonth: 5,
  },
];

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>(MOCK_RULES);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#1B3414] text-[#93C573] rounded-xl">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Automation & Workflow Rules</h1>
            <p className="text-xs text-slate-500">
              Configure agency triggers, credential alerts, authorization renewals, and pre-billing validation rules.
            </p>
          </div>
        </div>

        <button 
          onClick={() => alert("Create rule modal opened")}
          className="flex items-center gap-2 bg-[#1B3414] text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#274C1D] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#93C573]" /> Create New Automation Rule
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="p-5 border-slate-200 bg-white hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rule.category === "Compliance" ? "bg-emerald-50 text-emerald-700" :
                    rule.category === "Authorizations" ? "bg-blue-50 text-blue-700" :
                    rule.category === "EVV" ? "bg-amber-50 text-amber-700" :
                    "bg-purple-50 text-purple-700"
                  }`}>
                    {rule.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{rule.name}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mb-0.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> When Triggered:
                    </span>
                    <p className="text-slate-600 text-[11px]">{rule.trigger}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mb-0.5">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500" /> Automated Action:
                    </span>
                    <p className="text-slate-600 text-[11px]">{rule.action}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Executed {rule.executionsThisMonth} times this month
                </div>
              </div>

              <div>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    rule.isActive 
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {rule.isActive ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-slate-400" /> Paused
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
