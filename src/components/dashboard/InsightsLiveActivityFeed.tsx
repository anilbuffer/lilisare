"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Activity, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Send
} from "lucide-react";
import { Card } from "@/components/ui/Card";

interface InsightItem {
  id: string;
  category: "Staffing" | "Compliance" | "Revenue" | "Onboarding";
  insight: string;
  actionLabel: string;
  actionHref: string;
}

interface ActivityEvent {
  id: string;
  type: string;
  timestamp: string;
  recordId: string;
  userOrSystem: string;
  status: string;
  statusColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const INSIGHTS: InsightItem[] = [
  {
    id: "ins-1",
    category: "Staffing",
    insight: "3 caregivers needed in Douglas County by Thursday, 4 intakes pending.",
    actionLabel: "Find Cover",
    actionHref: "/scheduling",
  },
  {
    id: "ins-2",
    category: "Compliance",
    insight: "2 CPR certifications expire in 14 days, auto-reminders queued.",
    actionLabel: "View Credentials",
    actionHref: "/compliance",
  },
  {
    id: "ins-3",
    category: "Revenue",
    insight: "An authorisation has been pending for 14 days, payment at risk.",
    actionLabel: "Nudge CM",
    actionHref: "/billing/authorizations",
  },
  {
    id: "ins-4",
    category: "Onboarding",
    insight: "Document packet missing for 4 households, reminder #2 sent.",
    actionLabel: "View Households",
    actionHref: "/households",
  },
];

const ACTIVITIES: ActivityEvent[] = [
  {
    id: "act-1",
    type: "New family inquiry received",
    timestamp: "10m ago",
    recordId: "INQ-1048 (Miller Family)",
    userOrSystem: "Intake Coordinator",
    status: "New Lead",
    statusColor: "bg-blue-100 text-blue-800",
    icon: Users,
  },
  {
    id: "act-2",
    type: "Caregiver document uploaded",
    timestamp: "25m ago",
    recordId: "CG-204 (Mother A / Sarah Miller)",
    userOrSystem: "Automated OCR Verification",
    status: "Verified",
    statusColor: "bg-emerald-100 text-emerald-800",
    icon: FileText,
  },
  {
    id: "act-3",
    type: "Case manager follow-up sent",
    timestamp: "45m ago",
    recordId: "PT-101 / CM-01 (Dana Jenkins)",
    userOrSystem: "Sarah Jenkins (Admin)",
    status: "Outbound",
    statusColor: "bg-amber-100 text-amber-800",
    icon: Send,
  },
  {
    id: "act-4",
    type: "Credential verified",
    timestamp: "1h ago",
    recordId: "CG-188 - BLS/CPR Card",
    userOrSystem: "Compliance Officer",
    status: "Active",
    statusColor: "bg-emerald-100 text-emerald-800",
    icon: ShieldCheck,
  },
  {
    id: "act-5",
    type: "EVV visit clocked in",
    timestamp: "1h 15m ago",
    recordId: "VST-9921 (Child A / Mother A)",
    userOrSystem: "Mobile GPS Verification",
    status: "On Schedule",
    statusColor: "bg-teal-100 text-teal-800",
    icon: MapPin,
  },
  {
    id: "act-6",
    type: "Care note submitted",
    timestamp: "2h ago",
    recordId: "NOT-4029 (Maria Santos, CNA)",
    userOrSystem: "AI Documentation Assistant",
    status: "Awaiting RN Co-sign",
    statusColor: "bg-purple-100 text-purple-800",
    icon: FileText,
  },
  {
    id: "act-7",
    type: "Claim moved to review",
    timestamp: "2h 30m ago",
    recordId: "CLM-8812 (Cedar Falls Regional)",
    userOrSystem: "Pre-Billing QA Scrub",
    status: "Clean Batch",
    statusColor: "bg-emerald-100 text-emerald-800",
    icon: DollarSign,
  },
];

export function InsightsLiveActivityFeed() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"insights" | "activity">("insights");

  return (
    <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#1B3414] text-[#93C573] rounded-xl">
            {activeTab === "insights" ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <Activity className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {activeTab === "insights" ? "Operational Intelligence" : "Live Care & Audit Activity"}
            </h3>
            <p className="text-xs text-slate-500">
              {activeTab === "insights" 
                ? "Real-time AI recommendations and proactive resource balancing." 
                : "Continuous chronological feed of operational events across all roles."}
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "insights"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Insights (4)
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "activity"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Live Activity
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "insights" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {INSIGHTS.map((item) => {
            const badgeStyles = {
              Staffing: "bg-indigo-50 text-indigo-700 border-indigo-200",
              Compliance: "bg-emerald-50 text-emerald-700 border-emerald-200",
              Revenue: "bg-rose-50 text-rose-700 border-rose-200",
              Onboarding: "bg-teal-50 text-teal-700 border-teal-200",
            }[item.category];

            return (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-3 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeStyles}`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400">AI Suggested</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {item.insight}
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <Link
                    href={item.actionHref}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    {item.actionLabel}
                    <ArrowRight className="w-3.5 h-3.5 text-[#3D6B22]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar pr-1">
          {ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{act.type}</div>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-mono text-slate-700 font-medium">{act.recordId}</span>
                      <span className="mx-1">•</span>
                      <span>{act.userOrSystem}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${act.statusColor}`}>
                    {act.status}
                  </span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{act.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
