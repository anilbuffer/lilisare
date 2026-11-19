"use client";

import React from "react";
import { InquiryStage } from "@/types/intake";
import { ChevronRight, FilterX, Sparkles, PhoneCall, Stethoscope, FileText, CheckCircle2 } from "lucide-react";

interface IntakePipelineBarProps {
  stages: {
    stage: InquiryStage;
    count: number;
    percentageOfMax: number;
    description: string;
  }[];
  selectedStage: InquiryStage | null;
  onSelectStage: (stage: InquiryStage | null) => void;
  totalActive: number;
}

const STAGE_ICONS: Record<InquiryStage, React.ElementType> = {
  "New Lead": Sparkles,
  "Contacted": PhoneCall,
  "In Assessment": Stethoscope,
  "CM Coordination": FileText,
  "Converted": CheckCircle2,
};

const STAGE_COLORS: Record<InquiryStage, { bar: string; badge: string; text: string }> = {
  "New Lead": {
    bar: "bg-[#FF6E61]",
    badge: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
    text: "text-[#B91C1C]",
  },
  "Contacted": {
    bar: "bg-[#F59E0B]",
    badge: "bg-[#FEF3C7] text-[#9A5B00] border-[#FDE68A]",
    text: "text-[#9A5B00]",
  },
  "In Assessment": {
    bar: "bg-[#0284C7]",
    badge: "bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]",
    text: "text-[#0369A1]",
  },
  "CM Coordination": {
    bar: "bg-[#6366F1]",
    badge: "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]",
    text: "text-[#4338CA]",
  },
  "Converted": {
    bar: "bg-[#3D6B22]",
    badge: "bg-[#E3F1D9] text-[#1E5622] border-[#C7E4B3]",
    text: "text-[#1E5622]",
  },
};

export function IntakePipelineBar({
  stages,
  selectedStage,
  onSelectStage,
  totalActive = 79,
}: IntakePipelineBarProps) {
  return (
    <section aria-label="Inquiry Pipeline" className="bg-[#FFFFFF] border border-[#D5DFDA] rounded-2xl p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#D5DFDA]/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#111C16] tracking-tight">
              Inquiry Pipeline
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F7F9F8] text-[#4A5D52] border border-[#D5DFDA]">
              {totalActive} active inquiries
            </span>
          </div>
          <p className="text-xs text-[#4A5D52] mt-0.5">
            Click any stage to filter the workspace records below
          </p>
        </div>

        {selectedStage && (
          <button
            type="button"
            onClick={() => onSelectStage(null)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#3D6B22] hover:text-[#2C5217] bg-[#E3F1D9]/60 hover:bg-[#E3F1D9] rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset stage filter ({selectedStage})</span>
          </button>
        )}
      </div>

      {/* Horizontal Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((item, idx) => {
          const isSelected = selectedStage === item.stage;
          const colors = STAGE_COLORS[item.stage];
          const Icon = STAGE_ICONS[item.stage];

          return (
            <div key={item.stage} className="relative group">
              <button
                type="button"
                onClick={() => onSelectStage(isSelected ? null : item.stage)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between h-full ${
                  isSelected
                    ? "bg-[#F2F8EE] border-[#3D6B22] shadow-sm ring-2 ring-[#3D6B22]/20"
                    : "bg-[#F7F9F8] hover:bg-[#FFFFFF] border-[#D5DFDA] hover:border-[#93C573]"
                }`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#3D6B22]" : "text-[#4A5D52]"}`} />
                    <span className="text-xs font-semibold text-[#111C16] truncate">
                      {item.stage}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}
                  >
                    {item.count}
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-[11px] text-[#4A5D52] line-clamp-1 mb-3">
                  {item.description}
                </p>

                {/* Relative Bar Visualization */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#74877C] mb-1">
                    <span>Volume</span>
                    <span>{Math.round(item.percentageOfMax)}% of peak</span>
                  </div>
                  <div className="h-2 w-full bg-[#E5EAE7] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isSelected ? "bg-[#3D6B22]" : colors.bar
                      }`}
                      style={{ width: `${item.percentageOfMax}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Connecting Chevron on desktop between stages (except last) */}
              {idx < stages.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-[#FFFFFF] border border-[#D5DFDA] items-center justify-center text-[#74877C] pointer-events-none shadow-xs">
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
