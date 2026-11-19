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
  const kpiItems = [
    {
      key: "ALL" as const,
      label: "Total Inquiries",
      value: totalInquiries,
      subtext: "Active inquiries across pipeline",
      icon: Inbox,
      tone: "forest" as const,
      toneStyles: {
        cardBorder: "border-slate-200/90 hover:border-[#3D6B22]/60",
        activeBorder: "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-emerald-50/20",
        iconBg: "bg-emerald-50 text-[#3D6B22] border border-emerald-200/60",
        valText: "text-slate-900",
      },
    },
    {
      key: "NEW" as const,
      label: "New Inquiries",
      value: newInquiries,
      subtext: "Awaiting first contact",
      icon: Sparkles,
      tone: "coral" as const,
      toneStyles: {
        cardBorder: "border-rose-200/80 hover:border-rose-400",
        activeBorder: "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20",
        iconBg: "bg-rose-50 text-rose-700 border border-rose-200",
        valText: "text-slate-900",
      },
    },
    {
      key: "ASSESSMENT" as const,
      label: "In Assessment",
      value: inAssessment,
      subtext: "Assessment & CM coordination",
      icon: Clock,
      tone: "amber" as const,
      toneStyles: {
        cardBorder: "border-amber-200/80 hover:border-amber-400",
        activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20",
        iconBg: "bg-amber-50 text-amber-800 border border-amber-200",
        valText: "text-slate-900",
      },
    },
    {
      key: "CONVERTED" as const,
      label: "Converted",
      value: converted,
      subtext: "Moved to active onboarding",
      icon: CheckCircle2,
      tone: "forest" as const,
      toneStyles: {
        cardBorder: "border-slate-200/90 hover:border-[#3D6B22]/60",
        activeBorder: "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-emerald-50/20",
        iconBg: "bg-emerald-50 text-[#1E5622] border border-emerald-200/60",
        valText: "text-slate-900",
      },
    },
  ];

  return (
    <section aria-label="Intake KPI Overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {kpiItems.map((item) => {
        const Icon = item.icon;
        const isSelected = activeFilter === item.key;
        const styles = item.toneStyles;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelectKpiFilter(item.key)}
            className={`group text-left p-4 sm:p-4.5 rounded-2xl bg-white border transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer relative overflow-hidden ${
              isSelected ? styles.activeBorder : styles.cardBorder
            }`}
          >
            {/* Top row: Label + Icon (identical to dashboardPage / AdminKpiRow) */}
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-600 group-hover:text-slate-900 tracking-tight truncate">
                {item.label}
              </span>
              <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${styles.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Middle row: Big Metric Number + Active Filter Indicator */}
            <div className="flex items-baseline justify-between mt-1 gap-2">
              <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${styles.valText}`}>
                {item.value}
              </span>
              {isSelected ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D6B22] bg-[#3D6B22]/10 px-2 py-0.5 rounded-full shrink-0">
                  Active
                </span>
              ) : (
                <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </div>

            {/* Bottom row: Subtext description */}
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {item.subtext}
            </p>
          </button>
        );
      })}
    </section>
  );
}
