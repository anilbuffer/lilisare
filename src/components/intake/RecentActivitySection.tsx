"use client";

import React, { useState } from "react";
import { RecentActivityItem } from "@/types/intake";
import {
  Sparkles,
  UserCheck,
  PhoneCall,
  Calendar,
  CheckCircle2,
  Activity,
  ArrowRight,
} from "lucide-react";

interface RecentActivitySectionProps {
  activities: RecentActivityItem[];
  onSelectInquiryById: (inquiryId: string) => void;
}

const ACTIVITY_ICONS: Record<
  RecentActivityItem["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  referral_received: { icon: Sparkles, color: "text-rose-700", bg: "bg-rose-100" },
  inquiry_assigned: { icon: UserCheck, color: "text-sky-800", bg: "bg-sky-100" },
  family_contacted: { icon: PhoneCall, color: "text-amber-800", bg: "bg-amber-100" },
  assessment_scheduled: { icon: Calendar, color: "text-indigo-800", bg: "bg-indigo-100" },
  referral_converted: { icon: CheckCircle2, color: "text-[#1E5622]", bg: "bg-emerald-100" },
};

export function RecentActivitySection({
  activities,
  onSelectInquiryById,
}: RecentActivitySectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedActivities = showAll ? activities : activities.slice(0, 4);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-50 text-[#3D6B22] rounded-xl shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                Recent Activity
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time referral updates and communication
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-[#3D6B22] hover:text-[#1B3414] transition-colors cursor-pointer"
          >
            {showAll ? "Show Less" : `View All (${activities.length})`}
          </button>
        </div>

        {/* Activity List */}
        <div className="mt-3 space-y-2">
          {displayedActivities.map((item) => {
            const config = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.referral_received;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-2xs transition-all text-xs flex items-start gap-2.5"
              >
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${config.bg} ${config.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-slate-400">
                      By <strong className="text-slate-700 font-medium">{item.actor}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectInquiryById(item.inquiryId)}
                      className="text-[#3D6B22] hover:underline font-semibold cursor-pointer"
                    >
                      {item.inquiryId}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Audited under HIPAA & compliance logs</span>
        <span className="font-medium text-[#3D6B22] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3D6B22] animate-pulse" />
          Live Sync
        </span>
      </div>
    </div>
  );
}
