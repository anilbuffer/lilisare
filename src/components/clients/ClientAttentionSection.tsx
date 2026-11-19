"use client";

import React, { useState } from "react";
import {
  FileWarning,
  Clock,
  UserX,
  ClipboardList,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { ClientRecord } from "@/types/client";

interface ActionableCareItem {
  id: string;
  clientId: string;
  clientName: string;
  householdName: string;
  title: string;
  subtitle: string;
  category: "missing_consent" | "auth_expiring" | "no_caregiver" | "care_plan_review";
  isUrgent: boolean;
  dueDate: string;
  actionLabel: string;
}

interface ClientAttentionSectionProps {
  clients: ClientRecord[];
  onSelectClient: (clientId: string) => void;
}

const CATEGORY_CONFIG: Record<
  ActionableCareItem["category"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  missing_consent: { icon: FileWarning, color: "text-amber-800", bg: "bg-amber-100" },
  auth_expiring: { icon: Clock, color: "text-sky-800", bg: "bg-sky-100" },
  no_caregiver: { icon: UserX, color: "text-rose-700", bg: "bg-rose-100" },
  care_plan_review: { icon: ClipboardList, color: "text-indigo-800", bg: "bg-indigo-100" },
};

export function ClientAttentionSection({
  clients,
  onSelectClient,
}: ClientAttentionSectionProps) {
  const [showAll, setShowAll] = useState(false);

  // 5 genuine actionable issues matching LiliSare operations
  const items: ActionableCareItem[] = [
    {
      id: "att-1",
      clientId: "CL-1004",
      clientName: "Jackson Vance",
      householdName: "Vance Household",
      title: "Caregiver not assigned",
      subtitle: "Jackson Vance · Vance Household",
      category: "no_caregiver",
      isUrgent: true,
      dueDate: "Urgent",
      actionLabel: "Assign Staff",
    },
    {
      id: "att-2",
      clientId: "CL-1002",
      clientName: "Marcus Whitfield",
      householdName: "Whitfield Household",
      title: "Medicaid waiver auth expiring",
      subtitle: "Marcus Whitfield · Expires in 11 days",
      category: "auth_expiring",
      isUrgent: true,
      dueDate: "Nov 30, 2026",
      actionLabel: "Renew Auth",
    },
    {
      id: "att-3",
      clientId: "CL-1001",
      clientName: "Leo Miller",
      householdName: "Miller Household",
      title: "Missing annual consent review",
      subtitle: "Leo Miller · COPPA/HIPAA sign-off due",
      category: "missing_consent",
      isUrgent: false,
      dueDate: "Action required",
      actionLabel: "Review Consent",
    },
    {
      id: "att-4",
      clientId: "CL-1005",
      clientName: "Hannah Morales",
      householdName: "Morales Household",
      title: "Routine care plan reassessment",
      subtitle: "Hannah Morales · 6-mo RN check",
      category: "care_plan_review",
      isUrgent: false,
      dueDate: "Pending",
      actionLabel: "Schedule RN",
    },
    {
      id: "att-5",
      clientId: "CL-1006",
      clientName: "Lucas Bennett",
      householdName: "Bennett Household",
      title: "Payer auth letter confirmation",
      subtitle: "Lucas Bennett · Dec 1 activation",
      category: "auth_expiring",
      isUrgent: false,
      dueDate: "Upcoming",
      actionLabel: "Confirm Payer",
    },
  ];

  const displayedItems = showAll ? items : items.slice(0, 4);
  const urgentCount = items.filter((i) => i.isUrgent).length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between">
      <div>
        {/* Header matching FollowUpTasksSection */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              Actionable Care Items
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

        {/* Clean, Scannable Task List */}
        <div className="mt-3.5 space-y-2">
          {displayedItems.map((item) => {
            const config = CATEGORY_CONFIG[item.category];
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                  item.isUrgent
                    ? "bg-rose-50/40 border-rose-200 hover:border-rose-300"
                    : "bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
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
                      onClick={() => onSelectClient(item.clientId)}
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
                  onClick={() => onSelectClient(item.clientId)}
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