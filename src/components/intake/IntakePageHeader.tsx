"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, Calendar, ChevronDown, Check } from "lucide-react";

interface IntakePageHeaderProps {
  onNewReferral?: () => void;
  newReferralHref?: string;
  selectedDateRange: string;
  onDateRangeChange: (range: string) => void;
  onExport?: (format: "csv" | "summary") => void;
  totalCount?: number;
}

export function IntakePageHeader({
  onNewReferral,
  newReferralHref = "/intake/pipeline/new/",
  selectedDateRange,
  onDateRangeChange,
}: IntakePageHeaderProps) {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateOptions = [
    { id: "30d", label: "Last 30 Days" },
    { id: "7d", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "quarter", label: "Last 90 Days" },
    { id: "all", label: "All Active Records" },
  ];

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Intake & Referrals
        </h1>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Range Filter */}
        <div className="relative" ref={dateRef}>
          <button
            type="button"
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateOptions.find((d) => d.id === selectedDateRange)?.label || "Date Range"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {isDateOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {dateOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onDateRangeChange(opt.id);
                    setIsDateOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                  {selectedDateRange === opt.id && <Check className="w-3.5 h-3.5 text-[#3D6B22]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New Referral - Primary CTA (Opens dedicated page) */}
        {newReferralHref ? (
          <Link
            href={newReferralHref}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B3414] hover:bg-[#274C1D] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#1B3414]/25 hover:shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#93C573]" />
            <span>New Referral</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onNewReferral}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B3414] hover:bg-[#274C1D] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#1B3414]/25 hover:shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#93C573]" />
            <span>New Referral</span>
          </button>
        )}
      </div>
    </header>
  );
}
