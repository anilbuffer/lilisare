"use client";

import React, { useState } from "react";
import {
  Sparkles,
  UserCheck,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface RecentClientActivity {
  id: string;
  clientId: string;
  title: string;
  actor: string;
  timestamp: string;
  type: "consent" | "auth" | "caregiver" | "schedule" | "onboarding";
}

interface ClientRecentActivitySectionProps {
  onSelectClient: (clientId: string) => void;
}

const ACTIVITY_ICONS: Record<
  RecentClientActivity["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  consent: { icon: FileCheck2, color: "text-amber-800", bg: "bg-amber-100" },
  auth: { icon: ShieldCheck, color: "text-[#1E5622]", bg: "bg-emerald-100" },
  caregiver: { icon: UserCheck, color: "text-sky-800", bg: "bg-sky-100" },
  schedule: { icon: Calendar, color: "text-indigo-800", bg: "bg-indigo-100" },
  onboarding: { icon: Sparkles, color: "text-purple-800", bg: "bg-purple-100" },
};

export function ClientRecentActivitySection({
  onSelectClient,
}: ClientRecentActivitySectionProps) {
  const [showAll, setShowAll] = useState(false);

  const activities: RecentClientActivity[] = [
    {
      id: "act-1",
      clientId: "CL-1001",
      title: "COPPA & HIPAA parental consent uploaded",
      actor: "Dev Patel (Parent)",
      timestamp: "2 hours ago",
      type: "consent",
    },
    {
      id: "act-2",
      clientId: "CL-1003",
      title: "Medicaid waiver authorization verified",
      actor: "State Case Manager",
      timestamp: "Yesterday",
      type: "auth",
    },
    {
      id: "act-3",
      clientId: "CL-1005",
      title: "Caregiver shift schedule approved (32 hrs/wk)",
      actor: "Sarah Jenkins (Supervisor)",
      timestamp: "Yesterday",
      type: "schedule",
    },
    {
      id: "act-4",
      clientId: "CL-1008",
      title: "Inquiry converted to client onboarding",
      actor: "Intake Coordinator",
      timestamp: "2 days ago",
      type: "onboarding",
    },
    {
      id: "act-5",
      clientId: "CL-1002",
      title: "Primary caregiver assigned (Elena Whitfield)",
      actor: "HR Coordinator",
      timestamp: "3 days ago",
      type: "caregiver",
    },
    {
      id: "act-6",
      clientId: "CL-1007",
      title: "Annual care readiness audit verified",
      actor: "Quality Assurance Lead",
      timestamp: "4 days ago",
      type: "auth",
    },
  ];

  const displayedActivities = showAll ? activities : activities.slice(0, 4);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_6px_32px_rgba(0,0,0,0.06)] flex flex-col justify-between">
      <div>
        {/* Header matching RecentActivitySection */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm leading-tight">
              Recent Client Activity
            </h3>
            <span className="w-1.5 h-1.5 rounded-full bg-[#3D6B22] animate-pulse" title="Live Sync" />
          </div>

          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-[#3D6B22] hover:text-[#1B3414] transition-colors cursor-pointer"
          >
            {showAll ? "Show Less" : `View All (${activities.length})`}
          </button>
        </div>

        {/* Clean Activity Feed */}
        <div className="mt-3.5 space-y-2">
          {displayedActivities.map((item) => {
            const config = ACTIVITY_ICONS[item.type];
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                onClick={() => onSelectClient(item.clientId)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all text-xs flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${config.bg} ${config.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      <span className="font-mono text-slate-600 font-medium">{item.clientId}</span>
                      <span> · </span>
                      <span>{item.actor}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                  {item.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}