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
      label: "Total Caregivers",
      value: totalCount.toLocaleString(),
      icon: Heart,
      iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
    },
    {
      id: "Active",
      label: "Active Caregivers",
      value: activeCount.toLocaleString(),
      icon: UserCheck,
      iconBg: "bg-[#E3F1D9] text-[#1E5622]",
    },
    {
      id: "Onboarding",
      label: "In Onboarding",
      value: onboardingCount.toLocaleString(),
      icon: Clock,
      iconBg: "bg-amber-100 text-amber-800",
    },
    {
      id: "ATTENTION",
      label: "Needs Attention",
      value: needsAttentionCount.toLocaleString(),
      icon: AlertTriangle,
      iconBg: "bg-rose-100 text-rose-700",
    },
  ];

  return (
    <section
      aria-label="Caregiver Key Performance Indicators"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
    >
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isSelected = activeStatusFilter === kpi.id;

        return (
          <button
            key={kpi.id}
            type="button"
            onClick={() => onSelectStatus(kpi.id)}
            className={`group text-left focus:outline-none cursor-pointer w-full bg-white backdrop-blur-xl rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              isSelected
                ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-gradient-to-b from-[#F2F8EE]/70 via-white to-white shadow-[0_8px_30px_rgba(61,107,34,0.12)] -translate-y-0.5"
                : "border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:border-[#3D6B22]/60"
            }`}
          >
            {/* Top row: Label & Animated Icon Container */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 tracking-tight truncate pr-1">
                {kpi.label}
              </span>
              <div
                className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0 ${kpi.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Metric Value & Hover Glow Arrow */}
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                {kpi.value}
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </button>
        );
      })}
    </section>
  );
}
