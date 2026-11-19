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
      subtext: "Active inquiries across pipeline",
      icon: Inbox,
      tone: "forest" as const,
      toneStyles: {
        cardBorder: "border-slate-200 hover:border-[#3D6B22]/50",
        activeBorder: "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-emerald-50/15",
        iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
        valText: "text-slate-900",
      },
    },
    {
      key: "NEW" as const,
      label: "New Inquiries",
      value: newInquiries.toLocaleString(),
      subtext: "Awaiting first contact",
      icon: Sparkles,
      tone: "coral" as const,
      toneStyles: {
        cardBorder: "border-rose-200 hover:border-rose-400",
        activeBorder: "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20",
        iconBg: "bg-rose-100 text-rose-700",
        valText: "text-slate-900",
      },
    },
    {
      key: "ASSESSMENT" as const,
      label: "In Assessment",
      value: inAssessment.toLocaleString(),
      subtext: "Assessment & CM coordination",
      icon: Clock,
      tone: "amber" as const,
      toneStyles: {
        cardBorder: "border-amber-200 hover:border-amber-400",
        activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20",
        iconBg: "bg-amber-100 text-amber-800",
        valText: "text-slate-900",
      },
    },
    {
      key: "CONVERTED" as const,
      label: "Converted",
      value: converted.toLocaleString(),
      subtext: "Moved to active onboarding",
      icon: CheckCircle2,
      tone: "forest" as const,
      toneStyles: {
        cardBorder: "border-slate-200 hover:border-[#3D6B22]/50",
        activeBorder: "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-emerald-50/15",
        iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
        valText: "text-slate-900",
      },
    },
  ];

  return (
    <section aria-label="Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isSelected = activeFilter === kpi.key;
        const styles = kpi.toneStyles;

        return (
          <button
            key={kpi.key}
            type="button"
            onClick={() => onSelectKpiFilter(kpi.key)}
            className="group block text-left focus:outline-none cursor-pointer w-full"
          >
            <Card
              className={`p-4 h-full bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border rounded-2xl ${
                isSelected ? styles.activeBorder : styles.cardBorder
              }`}
            >
              {/* Top row: Label + Icon (identical to dashboardPage / AdminKpiRow) */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 tracking-tight truncate pr-1">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg shrink-0 ${styles.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Middle row: Big Metric Value + Active indicator / Hover arrow */}
              <div className="flex items-baseline justify-between mt-1">
                <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${styles.valText}`}>
                  {kpi.value}
                </span>
                {isSelected ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D6B22] bg-[#3D6B22]/10 px-2 py-0.5 rounded-full shrink-0">
                    Active Filter
                  </span>
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>

              {/* Bottom row: Subtext description */}
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {kpi.subtext}
              </p>
            </Card>
          </button>
        );
      })}
    </section>
  );
}
