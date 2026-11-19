"use client";

import React, { useState } from "react";
import {
  FileWarning,
  Clock,
  UserX,
  ClipboardList,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  BadgeAlert,
  FileText,
} from "lucide-react";
import { CaregiverRecord } from "@/types/caregiver";

export interface ActionableCaregiverItem {
  id: string;
  caregiverId: string;
  caregiverName: string;
  householdName?: string;
  title: string;
  subtitle: string;
  category: "credentials" | "screening" | "training" | "documents";
  isUrgent: boolean;
  dueDate: string;
  actionLabel: string;
}

interface CaregiverAttentionSectionProps {
  caregivers: CaregiverRecord[];
  onSelectCategoryFilter?: (category: string) => void;
  onSelectCaregiverId: (id: string) => void;
  activeAttentionCategory?: string | null;
}

const CATEGORY_CONFIG: Record<
  ActionableCaregiverItem["category"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  credentials: { icon: BadgeAlert, color: "text-rose-700", bg: "bg-rose-100" },
  screening: { icon: Clock, color: "text-sky-800", bg: "bg-sky-100" },
  training: { icon: GraduationCap, color: "text-amber-800", bg: "bg-amber-100" },
  documents: { icon: FileWarning, color: "text-indigo-800", bg: "bg-indigo-100" },
};

export function CaregiverAttentionSection({
  caregivers,
  onSelectCategoryFilter,
  onSelectCaregiverId,
  activeAttentionCategory,
}: CaregiverAttentionSectionProps) {
  const [showAll, setShowAll] = useState(false);

  // 5 actionable caregiver items matching LiliSare workforce operations
  const items: ActionableCaregiverItem[] = [
    {
      id: "att-cg-1",
      caregiverId: "CG-102",
      caregiverName: "Sarah Miller",
      householdName: "Miller Household",
      title: "Expired CPR & First Aid credential",
      subtitle: "Sarah Miller · Miller Household",
      category: "credentials",
      isUrgent: true,
      dueDate: "Overdue",
      actionLabel: "Renew CPR",
    },
    {
      id: "att-cg-2",
      caregiverId: "CG-103",
      caregiverName: "Marcus Chen",
      householdName: "Chen Family",
      title: "State background check expiring",
      subtitle: "Marcus Chen · Expires in 9 days",
      category: "screening",
      isUrgent: true,
      dueDate: "Nov 28, 2026",
      actionLabel: "Review Check",
    },
    {
      id: "att-cg-3",
      caregiverId: "CG-104",
      caregiverName: "Elena Whitfield",
      householdName: "Whitfield Household",
      title: "Mandatory annual HIPAA training incomplete",
      subtitle: "Elena Whitfield · 2 modules pending",
      category: "training",
      isUrgent: false,
      dueDate: "Action required",
      actionLabel: "Send Reminder",
    },
    {
      id: "att-cg-4",
      caregiverId: "CG-105",
      caregiverName: "David Brooks",
      householdName: "Brooks Household",
      title: "TB screening & immunization review",
      subtitle: "David Brooks · Document verification",
      category: "documents",
      isUrgent: false,
      dueDate: "Pending",
      actionLabel: "Verify TB",
    },
    {
      id: "att-cg-5",
      caregiverId: "CG-106",
      caregiverName: "Rachel Torres",
      householdName: "Torres Household",
      title: "W-4 & direct deposit authorization pending",
      subtitle: "Rachel Torres · Payroll onboarding",
      category: "documents",
      isUrgent: false,
      dueDate: "Upcoming",
      actionLabel: "Review W-4",
    },
  ];

  const displayedItems = showAll ? items : items.slice(0, 4);
  const urgentCount = items.filter((i) => i.isUrgent).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Header matching /clients Actionable Items */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              Actionable Caregiver Items
            </h3>
            {urgentCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {urgentCount} Urgent
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-[#3D6B22] hover:text-[#1B3414] transition-colors cursor-pointer"
          >
            {showAll ? "Show Less" : `View All (${items.length})`}
          </button>
        </div>

        {/* Clean, Scannable Item List identical to /clients */}
        <div className="mt-3.5 space-y-2">
          {displayedItems.map((item) => {
            const config = CATEGORY_CONFIG[item.category];
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                  item.isUrgent
                    ? "bg-rose-50/30 border-rose-300 hover:border-rose-400 hover:shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${config.bg} ${config.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectCaregiverId(item.caregiverId)}
                      className="font-bold text-slate-900 hover:text-[#3D6B22] text-left truncate block cursor-pointer transition-colors leading-tight"
                    >
                      {item.title}
                    </button>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                      <span className={item.isUrgent ? "text-rose-600 font-semibold" : ""}>
                        {item.dueDate}
                      </span>
                      <span>·</span>
                      <span className="truncate">{item.subtitle}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCaregiverId(item.caregiverId)}
                  className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                    item.isUrgent
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                      : "bg-white hover:bg-emerald-50 text-slate-800 hover:text-[#3D6B22] border border-slate-200 shadow-xs"
                  }`}
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
