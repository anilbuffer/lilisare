"use client";

import React, { useState } from "react";
import {
  FileWarning,
  Clock,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  FileText,
  BadgeAlert,
} from "lucide-react";
import { CaregiverAttentionItem, CaregiverRecord } from "@/types/caregiver";

interface CaregiverAttentionSectionProps {
  caregivers: CaregiverRecord[];
  onSelectCategoryFilter: (category: string) => void;
  onSelectCaregiverId: (id: string) => void;
  activeAttentionCategory: string | null;
}

export function CaregiverAttentionSection({
  caregivers,
  onSelectCategoryFilter,
  onSelectCaregiverId,
  activeAttentionCategory,
}: CaregiverAttentionSectionProps) {
  // 4 items matching prompt requirements
  const issues = [
    {
      id: "expired_credentials",
      title: "Expired credentials",
      description: "4 caregivers need credential renewal",
      badgeText: "Overdue",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
      icon: BadgeAlert,
      iconBg: "bg-rose-100 text-rose-700",
      affectedSample: ["CG-106", "CG-135"],
      actionLabel: "Filter 4 Caregivers",
    },
    {
      id: "screening_pending",
      title: "Screening pending",
      description: "3 background checks need review",
      badgeText: "Pending",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
      icon: ShieldAlert,
      iconBg: "bg-amber-100 text-amber-800",
      affectedSample: ["CG-104", "CG-105", "CG-115"],
      actionLabel: "Filter 3 Caregivers",
    },
    {
      id: "training_incomplete",
      title: "Training incomplete",
      description: "2 caregivers have outstanding training",
      badgeText: "Action required",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      icon: GraduationCap,
      iconBg: "bg-indigo-100 text-indigo-700",
      affectedSample: ["CG-104", "CG-122"],
      actionLabel: "Filter 2 Caregivers",
    },
    {
      id: "missing_documents",
      title: "Missing documents",
      description: "3 caregiver profiles are incomplete",
      badgeText: "Incomplete",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
      icon: FileWarning,
      iconBg: "bg-purple-100 text-purple-700",
      affectedSample: ["CG-135", "CG-104"],
      actionLabel: "Filter 3 Caregivers",
    },
  ];

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Needs Attention</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                12 items
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Workforce compliance, screening verifications, and licensing renewals requiring administrative action
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectCategoryFilter("ALL_ATTENTION")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3D6B22] hover:text-[#2d5019] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>View all issues</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of 4 Actionable Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {issues.map((issue) => {
          const Icon = issue.icon;
          const isSelected = activeAttentionCategory === issue.id;

          const cardBorderByIssue = {
            expired_credentials: "border-rose-300 hover:border-rose-400",
            screening_pending: "border-amber-300 hover:border-amber-400",
            training_incomplete: "border-indigo-200 hover:border-indigo-300",
            missing_documents: "border-purple-200 hover:border-purple-300",
          }[issue.id] || "border-slate-200 hover:border-slate-300";

          return (
            <div
              key={issue.id}
              onClick={() => onSelectCategoryFilter(issue.id)}
              className={`p-4 rounded-xl border bg-white transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                isSelected
                  ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-gradient-to-b from-[#F2F8EE]/70 via-white to-white shadow-md -translate-y-0.5"
                  : `${cardBorderByIssue} shadow-sm hover:shadow-md hover:-translate-y-0.5`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 ${issue.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border tracking-wide ${issue.badgeClass}`}
                  >
                    ({issue.badgeText})
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors leading-snug">
                  {issue.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {issue.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#3D6B22]">
                <span>{issue.actionLabel}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
