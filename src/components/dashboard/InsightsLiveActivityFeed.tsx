"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Activity, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  MapPin, 
  Send
} from "lucide-react";
import { Card } from "@/components/ui/Card";

interface InsightItem {
  id: string;
  category: "Staffing" | "Compliance" | "Revenue" | "Onboarding";
  title: string;
  detail: string;
  actionLabel: string;
  actionHref: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ActivityEvent {
  id: string;
  type: string;
  timestamp: string;
  recordId: string;
  subtitle: string;
  status: string;
  statusColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const INSIGHTS: InsightItem[] = [
  {
    id: "ins-1",
    category: "Staffing",
    title: "3 caregivers needed in Douglas County",
    detail: "4 intakes pending by Thursday • Proactive shift dispatch recommended",
    actionLabel: "Find Cover",
    actionHref: "/scheduling",
    icon: Users,
  },
  {
    id: "ins-2",
    category: "Compliance",
    title: "2 CPR certifications expiring soon",
    detail: "Expiring within 14 days • Auto-reminders sent to staff",
    actionLabel: "Credentials",
    actionHref: "/compliance",
    icon: ShieldCheck,
  },
  {
    id: "ins-3",
    category: "Revenue",
    title: "Authorization pending for 14 days",
    detail: "Claim reimbursement at risk • Case Manager nudge queued",
    actionLabel: "Nudge CM",
    actionHref: "/billing/authorizations",
    icon: DollarSign,
  },
  {
    id: "ins-4",
    category: "Onboarding",
    title: "Document packet missing for 4 households",
    detail: "Stalled in onboarding > 5 days • Follow-up sent to guardians",
    actionLabel: "Households",
    actionHref: "/households",
    icon: FileText,
  },
];

const ACTIVITIES: ActivityEvent[] = [
  {
    id: "act-1",
    type: "New family inquiry received",
    timestamp: "10m ago",
    recordId: "INQ-1048",
    subtitle: "Miller Family • Intake Coordinator",
    status: "New Lead",
    statusColor: "bg-blue-50 text-blue-700 border-blue-200/80",
    icon: Users,
  },
  {
    id: "act-2",
    type: "Caregiver document uploaded",
    timestamp: "25m ago",
    recordId: "CG-204",
    subtitle: "Sarah Miller • OCR Verified",
    status: "Verified",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    icon: FileText,
  },
  {
    id: "act-3",
    type: "Case manager follow-up sent",
    timestamp: "45m ago",
    recordId: "PT-101",
    subtitle: "Dana Jenkins • Admin Outreach",
    status: "Outbound",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200/80",
    icon: Send,
  },
  {
    id: "act-4",
    type: "Credential verified",
    timestamp: "1h ago",
    recordId: "CG-188",
    subtitle: "BLS/CPR Card • Compliance Officer",
    status: "Active",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    icon: ShieldCheck,
  },
  {
    id: "act-5",
    type: "EVV visit clocked in",
    timestamp: "1h 15m ago",
    recordId: "VST-9921",
    subtitle: "Mother A • GPS Verified",
    status: "On Schedule",
    statusColor: "bg-teal-50 text-teal-700 border-teal-200/80",
    icon: MapPin,
  },
  {
    id: "act-6",
    type: "Care note submitted",
    timestamp: "2h ago",
    recordId: "NOT-4029",
    subtitle: "Maria Santos • Clinical Assistant",
    status: "Review",
    statusColor: "bg-purple-50 text-purple-700 border-purple-200/80",
    icon: FileText,
  },
  {
    id: "act-7",
    type: "Claim moved to review",
    timestamp: "2h 30m ago",
    recordId: "CLM-8812",
    subtitle: "Cedar Falls • Billing QA Scrub",
    status: "Clean Batch",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    icon: DollarSign,
  },
];

export function InsightsLiveActivityFeed() {
  const [activeTab, setActiveTab] = useState<"insights" | "activity">("insights");

  const getCategoryBadge = (category: InsightItem["category"]) => {
    switch (category) {
      case "Staffing":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "Compliance":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "Revenue":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "Onboarding":
      default:
        return "bg-teal-50 text-teal-700 border-teal-200/80";
    }
  };

  return (
    <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
      {/* Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#1B3414] text-[#93C573] rounded-xl shrink-0">
            {activeTab === "insights" ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <Activity className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {activeTab === "insights" ? "Insights List" : "Live Activity List"}
            </h3>
            <p className="text-xs text-slate-500">
              {activeTab === "insights" 
                ? "Proactive operational recommendations and resource balancing alerts." 
                : "Continuous chronological feed of operational and care events."}
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "insights"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Insights List (4)
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "activity"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Live Activity List
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "insights" ? (
        <div className="divide-y divide-slate-100 max-h-84 overflow-y-auto thin-scrollbar pr-1.5">
          {INSIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="py-3 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-[#1B3414]/10 group-hover:text-[#1B3414] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span
                    className={`w-24 text-center px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${getCategoryBadge(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>

                  <Link
                    href={item.actionHref}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-[#1B3414] text-slate-800 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs whitespace-nowrap active:scale-95"
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
        <div className="divide-y divide-slate-100 max-h-84 overflow-y-auto thin-scrollbar pr-1.5">
          {ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="py-3 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-[#1B3414]/10 group-hover:text-[#1B3414] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                        {act.type}
                      </h4>
                      <span className="font-mono text-[11px] text-slate-500 font-medium">
                        ({act.recordId})
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                      {act.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span
                    className={`w-24 text-center px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${act.statusColor}`}
                  >
                    {act.status}
                  </span>
                  <span className="w-18 text-right text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {act.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
