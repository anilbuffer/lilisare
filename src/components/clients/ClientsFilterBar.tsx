"use client";

import React from "react";
import { Search, Filter, LayoutGrid, List, X } from "lucide-react";
import { CareArrangementType, ClientStatus } from "@/types/client";

interface ClientsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCareType: string;
  onCareTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  totalFilteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export function ClientsFilterBar({
  searchQuery,
  onSearchChange,
  selectedCareType,
  onCareTypeChange,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  totalCount,
  onClearFilters,
  isFiltered,
}: ClientsFilterBarProps) {
  const careTypes: { label: string; value: string }[] = [
    { label: "All Care Types", value: "ALL" },
    { label: "Family Care", value: "Family Care" },
    { label: "Live-In Care", value: "Live-In Care" },
    { label: "Family Friend Care", value: "Family Friend Care" },
    { label: "Attendant Care", value: "Attendant Care" },
  ];

  const statuses: { label: string; value: string }[] = [
    { label: "All Statuses", value: "ALL" },
    { label: "Active", value: "Active" },
    { label: "Hospitalized", value: "Hospitalized" },
    { label: "On Hold", value: "On Hold" },
    { label: "Discharged", value: "Discharged" },
  ];

  return (
    <div className="relative bg-white rounded-xl lg:rounded-2xl border border-[#D5DFDA] p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[260px]">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by client name, ID (e.g. CL-1001), household, or caregiver..."
          className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] focus:bg-white transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Selects & View Mode Toggles */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Care Type Dropdown */}
        <div className="relative">
          <select
            value={selectedCareType}
            onChange={(e) => onCareTypeChange(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
          >
            {careTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
            title="Reset all active filters"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}

        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* View Mode Toggle */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => onViewModeChange("table")}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "table"
              ? "bg-white text-slate-900 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-800"
              }`}
            title="Table View"
            aria-label="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "grid"
              ? "bg-white text-slate-900 shadow-xs font-bold"
              : "text-slate-500 hover:text-slate-800"
              }`}
            title="Card Grid View"
            aria-label="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium pl-1 hidden lg:inline">
          Showing <strong className="text-slate-800">{totalFilteredCount}</strong> of{" "}
          <strong className="text-slate-800">{totalCount}</strong>
        </span>
      </div>
    </div>
  );
}
