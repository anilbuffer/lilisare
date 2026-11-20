"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Calendar,
  Download,
  Users,
  Clock,
  TrendingUp,
  ShieldCheck,
  Home,
  Heart,
  RefreshCw,
  ArrowRight,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/Card";

import { ReportDefinition } from "@/lib/reports-mock-data";
import { ReportView } from "@/components/reports/ReportView";
import { ChartRenderer } from "@/components/reports/ChartRenderer";

import {
  LILISARE_INTAKE_REPORTS,
  getLiveIntakeKpis,
  exportIntakeReportsCsv,
  IntakeKpiSummary,
} from "@/lib/intake/intakeReportsData";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";

export default function IntakeReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("last30");
  const [kpis, setKpis] = useState<IntakeKpiSummary>(getLiveIntakeKpis());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  const refreshLiveKpis = () => {
    setIsSyncing(true);
    setKpis(getLiveIntakeKpis());
    setLastSyncTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Intake analytics refreshed from live data");
    }, 300);
  };

  useEffect(() => {
    refreshLiveKpis();
    const unsubscribe = subscribeToIntakeSync(() => {
      refreshLiveKpis();
    });
    return unsubscribe;
  }, []);

  // Filter reports by search keyword
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return LILISARE_INTAKE_REPORTS;
    const q = searchQuery.toLowerCase();
    return LILISARE_INTAKE_REPORTS.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.chartType.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Handle Full CSV Export
  const handleExportCsv = () => {
    exportIntakeReportsCsv();
    toast.success("Intake analytics exported to CSV");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-14 animate-in fade-in duration-200">
      {/* ---------------------------------------------------- */}
      {/* 01. Clean Header & Controls */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Intake Reports & Analytics
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Filter report by date range"
              className="bg-transparent border-none text-slate-700 text-xs font-semibold focus:ring-0 cursor-pointer outline-none"
            >
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="ytd">Year to Date (YTD)</option>
            </select>
          </div>

          {/* Sync Button */}
          <button
            onClick={refreshLiveKpis}
            title={`Last synced: ${lastSyncTime}`}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#3D6B22] text-slate-700 hover:text-[#3D6B22] px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-[#3D6B22]", isSyncing && "animate-spin")} />
            <span>Sync</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 02. Six Core KPI Metrics (Consistent Minimal Style) */}
      {/* ---------------------------------------------------- */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Referrals */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Total Referrals</span>
            <div className="w-7 h-7 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.totalReferrals}
          </div>
        </div>

        {/* KPI 2: First Contact SLA */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">First Contact SLA</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.avgResponseTimeMins}m
          </div>
        </div>

        {/* KPI 3: Conversion Rate */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Conversion Rate</span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.conversionRatePercent}%
          </div>
        </div>

        {/* KPI 4: Discharge SLA */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Discharge SLA</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.hospitalSlaCompliancePercent}%
          </div>
        </div>

        {/* KPI 5: Time to Care Start */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Time to Care Start</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Home className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.avgDaysToCareStart}d
          </div>
        </div>

        {/* KPI 6: Caregiver Clearance */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Caregiver Clearance</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.caregiverClearanceRate}%
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 03. Section Header & Quick Search (No Tab Styles) */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Performance Reports
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {filteredReports.length}
          </span>
        </div>

        {/* Minimal Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3D6B22] transition-colors"
          />
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 04. Minimal Reports Grid (Consistent Card Styling) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors line-clamp-1">
                  {report.title}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0 uppercase">
                  {report.chartType}
                </span>
              </div>
            </div>

            {/* Chart Preview */}
            <div className="h-40 my-3 pointer-events-none relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 opacity-30 pointer-events-none" />
              <ChartRenderer
                type={report.chartType}
                data={report.data}
                xAxisKey={report.xAxisKey}
                dataKeys={report.dataKeys}
                height={160}
              />
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-slate-100 mt-auto">
              <button
                type="button"
                onClick={() => setActiveReport(report)}
                className="w-full py-2 bg-[#3D6B22]/10 hover:bg-[#3D6B22] text-[#3D6B22] hover:text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Full Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            No reports matching your search.
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 05. Interactive Report Drill-Down Modal */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {activeReport && (
          <ReportView
            report={activeReport}
            onClose={() => setActiveReport(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
