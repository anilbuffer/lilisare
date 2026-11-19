"use client";

import React from "react";
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { CaregiverRecord } from "@/types/caregiver";

interface CaregiverKpiStripProps {
  caregivers: CaregiverRecord[];
  activeStatusFilter: string;
  onSelectStatus: (status: string) => void;
  needsAttentionCount: number;
}

export function CaregiverKpiStrip({
  caregivers,
  activeStatusFilter,
  onSelectStatus,
  needsAttentionCount,
}: CaregiverKpiStripProps) {
  const totalCount = caregivers.length;
  const activeCount = caregivers.filter((c) => c.status === "Active").length;
  const onboardingCount = caregivers.filter(
    (c) => c.status === "Onboarding" || c.status === "Pending"
  ).length;
  const expiringCount = caregivers.filter(
    (c) =>
      c.documentsCredentials?.overallStatus === "Expired" ||
      c.documentsCredentials?.overallStatus === "Missing" ||
      c.documentsCredentials?.items?.some(
        (i) => i.status === "Expired" || i.status === "Expiring Soon"
      )
  ).length;

  const kpis = [
    {
      id: "ALL",
      label: "Active Caregivers",
      value: activeCount.toLocaleString(),
      icon: Heart,
      tone: "forest" as const,
    },
    {
      id: "Active",
      label: "Ready & Approved",
      value: activeCount.toLocaleString(),
      icon: UserCheck,
      tone: "forest" as const,
    },
    {
      id: "Onboarding",
      label: "In Onboarding",
      value: onboardingCount.toLocaleString(),
      icon: Clock,
      tone: "amber" as const,
    },
    {
      id: "EXPIRING",
      label: "Credentials Expiring",
      value: expiringCount.toLocaleString(),
      icon: ShieldCheck,
      tone: "coral" as const,
    },
    {
      id: "ATTENTION",
      label: "Needs Attention",
      value: needsAttentionCount.toLocaleString(),
      icon: AlertTriangle,
      tone: "coral" as const,
    },
  ];

  return (
    <section
      aria-label="Caregiver Key Performance Indicators"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5"
    >
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isSelected = activeStatusFilter === kpi.id;

        const toneStyles = {
          forest: {
            cardBorder: "border-slate-200 hover:border-[#3D6B22]/50",
            iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
            valText: "text-slate-900",
            selected:
              "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 shadow-md bg-gradient-to-b from-[#F2F8EE]/70 via-white to-white -translate-y-0.5",
          },
          amber: {
            cardBorder: "border-amber-300 hover:border-amber-400 bg-white",
            iconBg: "bg-amber-100 text-amber-800",
            valText: "text-amber-900",
            selected:
              "border-amber-400 ring-2 ring-amber-400/20 shadow-md bg-gradient-to-b from-amber-50/70 via-white to-white -translate-y-0.5",
          },
          coral: {
            cardBorder: "border-rose-300 hover:border-rose-400 bg-white",
            iconBg: "bg-rose-100 text-rose-700",
            valText: "text-rose-900",
            selected:
              "border-rose-400 ring-2 ring-rose-400/20 shadow-md bg-gradient-to-b from-rose-50/70 via-white to-white -translate-y-0.5",
          },
        }[kpi.tone];

        return (
          <button
            key={kpi.id}
            type="button"
            onClick={() => onSelectStatus(kpi.id)}
            className={`group text-left focus:outline-none cursor-pointer w-full bg-white rounded-2xl p-4 sm:p-4.5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
              isSelected
                ? toneStyles.selected
                : `${toneStyles.cardBorder} shadow-sm hover:shadow-md hover:-translate-y-0.5`
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 tracking-tight truncate pr-1">
                {kpi.label}
              </span>
              <div
                className={`p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-105 ${toneStyles.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <span
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${toneStyles.valText}`}
              >
                {kpi.value}
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-slate-500 transition-opacity" />
            </div>
          </button>
        );
      })}
    </section>
  );
}
