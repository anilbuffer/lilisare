"use client";

import React from "react";
import { Users, UserCheck, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
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
  const onHoldCount = clients.filter((c) => c.status === "On Hold").length;
  const dischargedCount = clients.filter((c) => c.status === "Discharged").length;

  const kpis = [
    {
      id: "ALL",
      label: "Total Clients",
      value: totalCount.toLocaleString(),
      subtext: `${activeCount} receiving active care`,
      badge: "All Records",
      badgeClass: "bg-slate-100 text-slate-700 border border-slate-200/70",
      icon: Users,
      toneStyles: {
        cardBorder: "border-slate-200 hover:border-[#3D6B22]/50",
        iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
        valText: "text-slate-900",
      },
    },
    {
      id: "Active",
      label: "Active Clients",
      value: activeCount.toLocaleString(),
      subtext: "Currently receiving services",
      badge: "In Service",
      badgeClass: "bg-[#E3F1D9] text-[#1E5622] border border-[#1E5622]/20",
      icon: UserCheck,
      toneStyles: {
        cardBorder: "border-emerald-200 hover:border-emerald-400",
        iconBg: "bg-[#E3F1D9] text-[#1E5622]",
        valText: "text-slate-900",
      },
    },
    {
      id: "Onboarding",
      label: "Onboarding",
      value: onboardingCount.toLocaleString(),
      subtext: "Registration & setup progress",
      badge: "In Setup",
      badgeClass: "bg-amber-50 text-amber-800 border border-amber-200/70",
      icon: Clock,
      toneStyles: {
        cardBorder: "border-amber-200 hover:border-amber-400",
        iconBg: "bg-amber-100 text-amber-800",
        valText: "text-amber-900",
      },
    },
    {
      id: "ATTENTION",
      label: "Needs Attention",
      value: needsAttentionCount.toLocaleString(),
      subtext: "Actionable items requiring review",
      badge: "Action Required",
      badgeClass: "bg-rose-50 text-rose-700 border border-rose-200/70",
      icon: AlertTriangle,
      toneStyles: {
        cardBorder: "border-rose-200 hover:border-rose-400",
        iconBg: "bg-rose-100 text-rose-700",
        valText: "text-rose-900",
      },
    },
  ];

  return (
    <section aria-label="Client Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isSelected = activeStatusFilter === kpi.id;
        const { toneStyles } = kpi;

        return (
          <button
            key={kpi.id}
            type="button"
            onClick={() => onSelectStatus(kpi.id)}
            className="group block text-left focus:outline-none cursor-pointer w-full transition-transform duration-200 hover:-translate-y-0.5"
          >
            <Card
              className={`p-4 h-full bg-white transition-all duration-200 rounded-2xl hover:shadow-md border ${isSelected
                  ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-[#F2F8EE]/30 shadow-xs"
                  : toneStyles.cardBorder
                }`}
            >
              {/* Top Row: Label on left, Semantic Icon on right */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 tracking-tight truncate pr-1">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg shrink-0 ${toneStyles.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Main Metric Value Row */}
              <div className="flex items-baseline justify-between mt-1">
                <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${toneStyles.valText}`}>
                  {kpi.value}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Bottom Row: Context subtext and status badge */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">{kpi.subtext}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${kpi.badgeClass}`}>
                  {kpi.badge}
                </span>
              </div>
            </Card>
          </button>
        );
      })}
    </section>
  );
}
