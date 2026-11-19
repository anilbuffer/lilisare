"use client";

import React from "react";
import { Inbox, Sparkles, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";

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
  activeFilter,
  onSelectKpiFilter = () => {},
}: IntakeKpiStripProps) {
  const kpiItems = [
    {
      key: "ALL" as const,
      tag: "All",
      value: totalInquiries,
      label: "Total Inquiries",
      subtext: "Active inquiries",
      icon: Inbox,
      badgeColor: "bg-[#F7F9F8] text-[#4A5D52] border-[#D5DFDA]",
      iconColor: "text-[#3D6B22] bg-[#E3F1D9]",
      highlightBorder: "border-[#3D6B22] ring-2 ring-[#3D6B22]/15",
    },
    {
      key: "NEW" as const,
      tag: "New",
      value: newInquiries,
      label: "New Inquiries",
      subtext: "Awaiting first contact",
      icon: Sparkles,
      badgeColor: "bg-[#FEF3C7] text-[#9A5B00] border-[#FDE68A]",
      iconColor: "text-[#9A5B00] bg-[#FEF3C7]",
      highlightBorder: "border-[#9A5B00] ring-2 ring-[#9A5B00]/15",
    },
    {
      key: "ASSESSMENT" as const,
      tag: "In progress",
      value: inAssessment,
      label: "In Assessment",
      subtext: "Assessment and coordination",
      icon: Clock,
      badgeColor: "bg-[#E0F2F5] text-[#0F5E6E] border-[#BAE6FD]",
      iconColor: "text-[#0F5E6E] bg-[#E0F2F5]",
      highlightBorder: "border-[#0F5E6E] ring-2 ring-[#0F5E6E]/15",
    },
    {
      key: "CONVERTED" as const,
      tag: "Converted",
      value: converted,
      label: "Converted",
      subtext: "Moved to onboarding",
      icon: CheckCircle2,
      badgeColor: "bg-[#E3F1D9] text-[#1E5622] border-[#C7E4B3]",
      iconColor: "text-[#1E5622] bg-[#E3F1D9]",
      highlightBorder: "border-[#1E5622] ring-2 ring-[#1E5622]/15",
    },
  ];

  return (
    <section aria-label="Intake KPI Overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {kpiItems.map((item) => {
        const Icon = item.icon;
        const isSelected = activeFilter === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelectKpiFilter(item.key)}
            className={`text-left p-4 bg-[#FFFFFF] rounded-2xl border transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer group relative ${
              isSelected ? item.highlightBorder : "border-[#D5DFDA] hover:border-[#93C573]"
            }`}
          >
            {/* Top row: Pill & Icon */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.badgeColor}`}
              >
                {item.tag}
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${item.iconColor}`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            {/* Metric Value */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#111C16] tracking-tight">
                {item.value}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#74877C] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Title & Subtext */}
            <div className="mt-1">
              <h3 className="text-sm font-semibold text-[#111C16]">
                {item.label}
              </h3>
              <p className="text-xs text-[#4A5D52] mt-0.5">
                {item.subtext}
              </p>
            </div>
          </button>
        );
      })}
    </section>
  );
}
