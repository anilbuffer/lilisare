"use client";

import React from "react";
import { Inbox, Sparkles, Clock, CheckCircle2 } from "lucide-react";

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
      badge: "ALL",
      badgeClass: "bg-emerald-50 text-emerald-800 border border-emerald-200/70",
      label: "Total Inquiries",
      value: totalInquiries.toLocaleString(),
      subtext: "Active inquiries",
      icon: Inbox,
      iconBg: "bg-[#E7F3E5] text-[#3D6B22]",
    },
    {
      key: "NEW" as const,
      badge: "NEW",
      badgeClass: "bg-[#FEF3C7] text-[#92400E] border border-amber-200/70",
      label: "New Inquiries",
      value: newInquiries.toLocaleString(),
      subtext: "Awaiting first contact",
      icon: Sparkles,
      iconBg: "bg-[#FEF3C7] text-[#D97706]",
    },
    {
      key: "ASSESSMENT" as const,
      badge: "IN PROGRESS",
      badgeClass: "bg-[#E0F2FE] text-[#0369A1] border border-sky-200/70",
      label: "In Assessment",
      value: inAssessment.toLocaleString(),
      subtext: "Assessment and coordination",
      icon: Clock,
      iconBg: "bg-[#E0F2FE] text-[#0284C7]",
    },
    {
      key: "CONVERTED" as const,
      badge: "CONVERTED",
      badgeClass: "bg-[#DCFCE7] text-[#15803D] border border-emerald-200/70",
      label: "Converted",
      value: converted.toLocaleString(),
      subtext: "Moved to onboarding",
      icon: CheckCircle2,
      iconBg: "bg-[#DCFCE7] text-[#16A34A]",
    },
  ];

  return (
    <section aria-label="Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isSelected = activeFilter === kpi.key;

        return (
          <button
            key={kpi.key}
            type="button"
            onClick={() => onSelectKpiFilter(kpi.key)}
            className="group block text-left focus:outline-none cursor-pointer w-full transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div
              className={`p-4 sm:p-5 h-full bg-white rounded-2xl shadow-[0_6px_32px_rgba(0,0,0,0.05)] transition-all duration-200 ${
                isSelected
                  ? "border-2 border-[#3D6B22] ring-1 ring-[#3D6B22]/30 shadow-[0_8px_32px_rgba(61,107,34,0.12)]"
                  : "border border-slate-200/80 hover:border-slate-300"
              }`}
            >
              {/* Top row: Badge on left + Circle Icon on right */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${kpi.badgeClass}`}>
                  {kpi.badge}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${kpi.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Big Metric Value */}
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-none mb-2">
                {kpi.value}
              </div>

              {/* Bottom row: Title & Subtext */}
              <div className="text-sm font-bold text-slate-900 leading-tight">
                {kpi.label}
              </div>
              <p className="text-xs text-slate-400 font-normal mt-0.5 leading-snug">
                {kpi.subtext}
              </p>
            </div>
          </button>
        );
      })}
    </section>
  );
}
