"use client";

import React, { useState } from "react";
import { RecentActivityItem } from "@/types/intake";
import {
  Sparkles,
  UserCheck,
  PhoneCall,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

interface RecentActivitySectionProps {
  activities: RecentActivityItem[];
  onSelectInquiryById: (inquiryId: string) => void;
}

const ACTIVITY_ICONS: Record<RecentActivityItem["type"], { icon: React.ElementType; color: string; bg: string }> = {
  referral_received: { icon: Sparkles, color: "text-[#B91C1C]", bg: "bg-[#FEE2E2]" },
  inquiry_assigned: { icon: UserCheck, color: "text-[#0F5E6E]", bg: "bg-[#E0F2F5]" },
  family_contacted: { icon: PhoneCall, color: "text-[#9A5B00]", bg: "bg-[#FEF3C7]" },
  assessment_scheduled: { icon: Calendar, color: "text-[#0369A1]", bg: "bg-[#E0F2FE]" },
  referral_converted: { icon: CheckCircle2, color: "text-[#1E5622]", bg: "bg-[#E3F1D9]" },
};

export function RecentActivitySection({
  activities,
  onSelectInquiryById,
}: RecentActivitySectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedActivities = showAll ? activities : activities.slice(0, 4);

  return (
    <div className="bg-[#FFFFFF] border border-[#D5DFDA] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#D5DFDA]/60">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#111C16] tracking-tight">
              Recent Activity
            </h3>
            <span className="text-[11px] font-medium text-[#74877C]">
              Live updates
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-[#3D6B22] hover:text-[#2C5217] transition-colors cursor-pointer"
          >
            {showAll ? "Show Less" : `View All (${activities.length})`}
          </button>
        </div>

        {/* Activity List */}
        <div className="mt-3 space-y-2.5">
          {displayedActivities.map((item) => {
            const config = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.referral_received;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-[#D5DFDA] bg-[#F7F9F8] hover:bg-[#FFFFFF] hover:border-[#93C573] transition-colors text-xs flex items-start gap-2.5"
              >
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${config.bg} ${config.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#111C16] truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-[#74877C] shrink-0">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#4A5D52] mt-0.5 line-clamp-1">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-[#74877C]">
                      By <strong className="text-[#111C16] font-medium">{item.actor}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectInquiryById(item.inquiryId)}
                      className="text-[#3D6B22] hover:underline font-medium cursor-pointer"
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

      <div className="mt-3 pt-2 text-[11px] text-[#74877C] flex items-center justify-between">
        <span>Audited in compliance with HIPAA & LiliSphere logs</span>
        <span className="font-medium text-[#3D6B22] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3D6B22] animate-pulse" />
          Active Sync
        </span>
      </div>
    </div>
  );
}
