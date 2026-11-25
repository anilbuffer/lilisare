"use client";

import React from "react";
import { AlertCircle, Clock, MapPin, AlertTriangle, FileWarning, Timer } from "lucide-react";
import { EvvExceptionType, EvvVisitRecord } from "@/types/evvVisit";

interface EvvExceptionsBannerProps {
  visits: EvvVisitRecord[];
  activeExceptionType: EvvExceptionType | "ALL" | null;
  onSelectExceptionType: (type: EvvExceptionType | "ALL" | null) => void;
}

export function EvvExceptionsBanner({
  visits,
  activeExceptionType,
  onSelectExceptionType,
}: EvvExceptionsBannerProps) {
  const exceptionVisits = visits.filter(
    (v) =>
      v.verificationStatus === "Exception" ||
      v.verificationStatus === "Under Review" ||
      v.verificationStatus === "Correction Required"
  );

  const counts: Record<EvvExceptionType, number> = {
    MISSING_CLOCK_IN_OUT: 0,
    LATE_OR_EARLY: 0,
    LOCATION_VERIFICATION: 0,
    SCHEDULE_MISMATCH: 0,
    MISSING_VISIT_INFO: 0,
  };

  exceptionVisits.forEach((v) => {
    if (v.exceptionType && counts[v.exceptionType] !== undefined) {
      counts[v.exceptionType]++;
    }
  });

  const categories: {
    type: EvvExceptionType;
    label: string;
    count: number;
    icon: React.ElementType;
  }[] = [
    {
      type: "MISSING_CLOCK_IN_OUT",
      label: "Missing clock-in or clock-out",
      count: counts.MISSING_CLOCK_IN_OUT,
      icon: Clock,
    },
    {
      type: "LATE_OR_EARLY",
      label: "Late arrival or early departure",
      count: counts.LATE_OR_EARLY,
      icon: Timer,
    },
    {
      type: "LOCATION_VERIFICATION",
      label: "Location verification issue",
      count: counts.LOCATION_VERIFICATION,
      icon: MapPin,
    },
    {
      type: "SCHEDULE_MISMATCH",
      label: "Scheduled vs actual discrepancy",
      count: counts.SCHEDULE_MISMATCH,
      icon: AlertTriangle,
    },
    {
      type: "MISSING_VISIT_INFO",
      label: "Missing visit information",
      count: counts.MISSING_VISIT_INFO,
      icon: FileWarning,
    },
  ];

  return (
    <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Exception Monitoring
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                {exceptionVisits.length} items need attention
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Filter by specific EVV exception category to investigate or resolve compliance holds.
            </p>
          </div>
        </div>

        {activeExceptionType && (
          <button
            type="button"
            onClick={() => onSelectExceptionType(null)}
            className="text-xs font-semibold text-[#3D6B22] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Clear Exception Filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeExceptionType === cat.type;

          return (
            <button
              key={cat.type}
              type="button"
              onClick={() => onSelectExceptionType(isSelected ? null : cat.type)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[11px] font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
