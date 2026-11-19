"use client";

import React from "react";
import { Users, UserCheck, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";
import { ClientRecord } from "@/types/client";

interface ClientKpiStripProps {
  clients: ClientRecord[];
  activeStatusFilter: string;
  onSelectStatus: (status: string) => void;
  needsAttentionCount: number;
}

export function ClientKpiStrip({
  clients,
  activeStatusFilter,
  onSelectStatus,
  needsAttentionCount,
}: ClientKpiStripProps) {
  const totalCount = clients.length;
  const activeCount = clients.filter((c) => c.status === "Active").length;
  const onboardingCount = clients.filter((c) => c.status === "Onboarding").length;

  const kpis = [
    {
      id: "ALL",
      label: "Total Clients",
      value: totalCount.toLocaleString(),
      subtext: `${activeCount} receiving active care`,
      badge: "All Records",
      badgeClass: "bg-emerald-50 text-[#1E5622] border-emerald-200/70",
      icon: Users,
      iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
    },
    {
      id: "Active",
      label: "Active Clients",
      value: activeCount.toLocaleString(),
      subtext: "Currently receiving services",
      badge: "In Service",
      badgeClass: "bg-[#E3F1D9] text-[#1E5622] border-[#3D6B22]/20",
      icon: UserCheck,
      iconBg: "bg-[#E3F1D9] text-[#1E5622]",
    },
    {
      id: "Onboarding",
      label: "In Onboarding",
      value: onboardingCount.toLocaleString(),
      subtext: "Care plan & setup in progress",
      badge: "In Setup",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200/70",
      icon: Clock,
      iconBg: "bg-amber-100 text-amber-800",
    },
    {
      id: "ATTENTION",
      label: "Needs Attention",
      value: needsAttentionCount.toLocaleString(),
      subtext: "Actionable items requiring review",
      badge: "Action Due",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200/70",
      icon: AlertTriangle,
      iconBg: "bg-rose-100 text-rose-700",
    },
  ];

  return (
    <section
      aria-label="Client Key Performance Indicators"
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
            className={`group text-left focus:outline-none cursor-pointer w-full bg-white backdrop-blur-xl rounded-2xl p-4 sm:p-4.5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
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

            {/* Bottom Meta Row */}
            <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-slate-400 font-medium truncate pr-1">{kpi.subtext}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${kpi.badgeClass}`}
              >
                {kpi.badge}
              </span>
            </div>
          </button>
        );
      })}
    </section>
  );
}
