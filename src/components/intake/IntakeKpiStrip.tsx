"use client";

import React from "react";
import { Inbox, Sparkles, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface IntakeKpiStripProps {
  totalInquiries?: number;
  newInquiries?: number;
  inAssessment?: number;
  converted?: number;
  activeFilter?: string;
  onSelectKpiFilter?: (filterKey: "ALL" | "NEW" | "ASSESSMENT" | "CONVERTED") => void;
}

export function IntakeKpiStrip({
  totalInquiries = 79,
  newInquiries = 24,
  inAssessment = 21,
  converted = 16,
  activeFilter = "ALL",
  onSelectKpiFilter = () => {},
}: IntakeKpiStripProps) {
  const kpis = [
    {
      key: "ALL" as const,
      label: "Total Inquiries",
      value: totalInquiries.toLocaleString(),
      subtext: "Active inquiry pipeline",
      badge: "Pipeline",
      badgeClass: "bg-emerald-50 text-[#1E5622] border border-emerald-200/70",
      icon: Inbox,
      toneStyles: {
        cardBorder: "border-slate-200 hover:border-[#3D6B22]/50",
        iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
        valText: "text-slate-900",
      },
    },
    {
      key: "NEW" as const,
      label: "New Inquiries",
      value: newInquiries.toLocaleString(),
      subtext: "Awaiting first contact",
      badge: "Action Due",
      badgeClass: "bg-amber-50 text-amber-800 border border-amber-200/70",
      icon: Sparkles,
      toneStyles: {
        cardBorder: "border-amber-200 hover:border-amber-400",
        iconBg: "bg-amber-100 text-amber-800",
        valText: "text-amber-900",
      },
    },
    {
      key: "ASSESSMENT" as const,
      label: "In Assessment",
      value: inAssessment.toLocaleString(),
      subtext: "RN home & clinical eval",
      badge: "In Progress",
      badgeClass: "bg-sky-50 text-sky-800 border border-sky-200/70",
      icon: Clock,
      toneStyles: {
        cardBorder: "border-sky-200 hover:border-sky-400",
        iconBg: "bg-sky-100 text-sky-700",
        valText: "text-slate-900",
      },
    },
    {
      key: "CONVERTED" as const,
      label: "Converted Clients",
      value: converted.toLocaleString(),
      subtext: "Transferred to onboarding",
      badge: "Qualified",
      badgeClass: "bg-[#E3F1D9] text-[#1E5622] border border-[#1E5622]/20",
      icon: CheckCircle2,
      toneStyles: {
        cardBorder: "border-emerald-200 hover:border-emerald-400",
        iconBg: "bg-[#E3F1D9] text-[#1E5622]",
        valText: "text-slate-900",
      },
    },
  ];

  return (
    <section aria-label="Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isSelected = activeFilter === kpi.key;
        const { toneStyles } = kpi;

        return (
          <button
            key={kpi.key}
            type="button"
            onClick={() => onSelectKpiFilter(kpi.key)}
            className="group block text-left focus:outline-none cursor-pointer w-full transition-transform duration-200 hover:-translate-y-0.5"
          >
            <Card
              className={`p-4 h-full bg-white transition-all duration-200 rounded-2xl hover:shadow-md border ${
                isSelected
                  ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-[#F2F8EE]/30 shadow-xs"
                  : toneStyles.cardBorder
              }`}
            >
              {/* Top Row: Label on left, Semantic Icon on right (in line with Dashboard AdminKpiRow) */}
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
