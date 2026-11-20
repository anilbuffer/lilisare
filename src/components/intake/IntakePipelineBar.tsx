"use client";

import React from "react";
import { InquiryStage } from "@/types/intake";
import {
  Inbox,
  FilterX,
  Sparkles,
  PhoneCall,
  Stethoscope,
  FileText,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

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
  "New Inquiry": Sparkles,
  "Contacted": PhoneCall,
  "Needs Discussion": Stethoscope,
  "CMA Coordination": FileText,
  "Family Decision": CheckCircle2,
  "Converted": CheckCircle2,
  "Closed": Inbox,
  "New Lead": Sparkles,
  "In Assessment": Stethoscope,
  "CM Coordination": FileText,
};

const STAGE_BAR_COLORS: Record<InquiryStage, { bar: string; badge: string }> = {
  "New Inquiry": {
    bar: "bg-[#FF6E61]",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  "Contacted": {
    bar: "bg-[#F59E0B]",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  "Needs Discussion": {
    bar: "bg-[#A855F7]",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  "CMA Coordination": {
    bar: "bg-[#0284C7]",
    badge: "bg-sky-50 text-sky-800 border-sky-200",
  },
  "Family Decision": {
    bar: "bg-[#0D9488]",
    badge: "bg-teal-50 text-teal-800 border-teal-200",
  },
  "Converted": {
    bar: "bg-[#3D6B22]",
    badge: "bg-emerald-50 text-[#1E5622] border-emerald-200",
  },
  "Closed": {
    bar: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
  "New Lead": {
    bar: "bg-[#FF6E61]",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  "In Assessment": {
    bar: "bg-[#0284C7]",
    badge: "bg-sky-50 text-sky-800 border-sky-200",
  },
  "CM Coordination": {
    bar: "bg-[#6366F1]",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
};

export function IntakePipelineBar({
  stages,
  selectedStage,
  onSelectStage,
  totalActive = 79,
}: IntakePipelineBarProps) {
  return (
    <section
      aria-label="Inquiry Pipeline"
      className="bg-white border border-slate-200/80 rounded-xl lg:rounded-2xl p-4 sm:p-5 shadow-xs"
    >
      {/* Header matching dashboardPage section headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-[#3D6B22] rounded-xl shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Inquiry Pipeline
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {totalActive} active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any stage to filter the inquiry records below
            </p>
          </div>
        </div>

        {selectedStage && (
          <button
            type="button"
            onClick={() => onSelectStage(null)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#3D6B22] hover:text-[#1B3414] bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset filter ({selectedStage})</span>
          </button>
        )}
      </div>

      {/* Horizontal Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 relative">
        {stages.map((item, idx) => {
          const isSelected = selectedStage === item.stage;
          const config = STAGE_BAR_COLORS[item.stage];
          const Icon = STAGE_ICONS[item.stage];

          return (
            <div key={item.stage} className="relative group">
              <button
                type="button"
                onClick={() => onSelectStage(isSelected ? null : item.stage)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-full ${isSelected
                  ? "bg-emerald-50/30 border-[#3D6B22] shadow-xs ring-2 ring-[#3D6B22]/15"
                  : "bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                  }`}
              >
                {/* Stage Title + Count Badge */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#3D6B22]" : "text-slate-500"
                        }`}
                    />
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {item.stage}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${config.badge}`}
                  >
                    {item.count}
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-[11px] text-slate-400 line-clamp-1 mb-2.5">
                  {item.description}
                </p>

                {/* Sleek Progress Bar (like OnboardingIntakePipes on dashboard) */}
                <div>
                  <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isSelected ? "bg-[#3D6B22]" : config.bar
                        }`}
                      style={{ width: `${item.percentageOfMax}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Connecting Chevron on desktop */}
              {idx < stages.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 pointer-events-none shadow-2xs">
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
