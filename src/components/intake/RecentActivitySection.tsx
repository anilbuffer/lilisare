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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              Recent Activity
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
            const config = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.referral_received;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                onClick={() => onSelectInquiryById(item.inquiryId)}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all text-xs flex items-center justify-between gap-3 cursor-pointer group"
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
                      <span className=" text-slate-600 font-medium">{item.inquiryId}</span>
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
