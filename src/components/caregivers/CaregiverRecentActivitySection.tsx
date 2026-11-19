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
  FileText,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { CaregiverAuditItem } from "@/types/caregiver";

interface CaregiverRecentActivitySectionProps {
  activities: CaregiverAuditItem[];
  onSelectCaregiverId: (caregiverId: string) => void;
}

const ACTIVITY_ICONS: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  approval: { icon: CheckCircle2, color: "text-[#1E5622]", bg: "bg-emerald-100" },
  document: { icon: FileCheck2, color: "text-amber-800", bg: "bg-amber-100" },
  assignment: { icon: UserCheck, color: "text-indigo-800", bg: "bg-indigo-100" },
  training: { icon: GraduationCap, color: "text-purple-800", bg: "bg-purple-100" },
  evv: { icon: MapPin, color: "text-sky-800", bg: "bg-sky-100" },
  default: { icon: Sparkles, color: "text-slate-700", bg: "bg-slate-100" },
};

export function CaregiverRecentActivitySection({
  activities,
  onSelectCaregiverId,
}: CaregiverRecentActivitySectionProps) {
  const [showAll, setShowAll] = useState(false);

  const extractCaregiverId = (desc: string): string | null => {
    const match = desc.match(/CG-\d+/i);
    return match ? match[0].toUpperCase() : null;
  };

  const displayedActivities = showAll ? activities : activities.slice(0, 4);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Header matching /clients Recent Activity */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              Recent Caregiver Activity
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

        {/* Clean Activity Feed identical to /clients */}
        <div className="mt-3.5 space-y-2">
          {displayedActivities.map((item) => {
            const config = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.default;
            const Icon = config.icon;
            const cgId = extractCaregiverId(item.description);

            return (
              <div
                key={item.id}
                onClick={() => cgId && onSelectCaregiverId(cgId)}
                className={`p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all text-xs flex items-center justify-between gap-3 ${
                  cgId ? "cursor-pointer group" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${config.bg} ${config.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {cgId && (
                        <>
                          <span className="font-mono text-slate-600 font-medium">{cgId}</span>
                          <span> · </span>
                        </>
                      )}
                      <span>{item.actor}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                  {item.relativeTime || "Recently"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
