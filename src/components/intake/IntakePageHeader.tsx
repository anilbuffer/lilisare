"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, Download, Calendar, MapPin, ChevronDown, Check, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

interface IntakePageHeaderProps {
  onNewReferral?: () => void;
  newReferralHref?: string;
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (range: string) => void;
  onExport: (format: "csv" | "summary") => void;
  totalCount: number;
}

export function IntakePageHeader({
  onNewReferral,
  newReferralHref = "/intake/pipeline/new/",
  selectedBranch,
  onBranchChange,
  selectedDateRange,
  onDateRangeChange,
  onExport,
  totalCount,
}: IntakePageHeaderProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setIsBranchOpen(false);
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

  const branchOptions = [
    { id: "All Branches", label: "All Branches" },
    { id: "North Metro Branch", label: "North Metro Branch" },
    { id: "South County Branch", label: "South County Branch" },
  ];

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Intake & Referrals
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#1E5622] border border-emerald-200">
            {totalCount} Active
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage family inquiries, care coordination, and admissions
        </p>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Range Filter */}
        <div className="relative" ref={dateRef}>
          <button
            type="button"
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
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

        {/* Branch Filter */}
        <div className="relative" ref={branchRef}>
          <button
            type="button"
            onClick={() => setIsBranchOpen(!isBranchOpen)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedBranch}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {isBranchOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {branchOptions.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => {
                    onBranchChange(branch.id);
                    setIsBranchOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>{branch.label}</span>
                  {selectedBranch === branch.id && <Check className="w-3.5 h-3.5 text-[#3D6B22]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Option */}
        <div className="relative" ref={exportRef}>
          <button
            type="button"
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {isExportOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onExport("csv");
                  setIsExportOpen(false);
                  toast.success("Inquiries exported as CSV");
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#3D6B22]" />
                <span>Export as CSV (.csv)</span>
              </button>
              <button
                onClick={() => {
                  onExport("summary");
                  setIsExportOpen(false);
                  toast.success("Pipeline report generated");
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Pipeline Summary</span>
              </button>
            </div>
          )}
        </div>

        {/* New Referral - Primary CTA (Opens dedicated page) */}
        {newReferralHref ? (
          <Link
            href={newReferralHref}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] active:scale-[0.98] transition-all rounded-xl shadow-sm shadow-[#3D6B22]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Referral</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onNewReferral}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] active:scale-[0.98] transition-all rounded-xl shadow-sm shadow-[#3D6B22]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Referral</span>
          </button>
        )}
      </div>
    </header>
  );
}
