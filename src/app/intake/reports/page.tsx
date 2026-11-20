"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Clock,
  ShieldCheck,
  Users,
  Home,
  Heart,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/Card";

import { ReportDefinition } from "@/lib/reports-mock-data";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportView } from "@/components/reports/ReportView";

import {
  LILISARE_INTAKE_REPORTS,
  getLiveIntakeKpis,
  exportIntakeReportsCsv,
  IntakeKpiSummary,
} from "@/lib/intake/intakeReportsData";
import {
  getIntakeInquiriesFromStorage,
  subscribeToIntakeSync,
} from "@/lib/intake/intakeSync";

type PillarReportCategory = "ALL" | "PILLAR1" | "PILLAR2" | "PILLAR3" | "PILLAR4" | "BOTTLENECK";

export default function IntakeReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportDefinition | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<PillarReportCategory>("ALL");
  const [dateRange, setDateRange] = useState<string>("last30");
  const [kpis, setKpis] = useState<IntakeKpiSummary>(getLiveIntakeKpis());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  const refreshLiveKpis = () => {
    setIsSyncing(true);
    setKpis(getLiveIntakeKpis());
    setLastSyncTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );
    setTimeout(() => setIsSyncing(false), 300);
  };

  useEffect(() => {
    refreshLiveKpis();
    const unsubscribe = subscribeToIntakeSync(() => {
      refreshLiveKpis();
    });
    return unsubscribe;
  }, []);

  // Filter reports by selected pillar
  const filteredReports = useMemo(() => {
    if (selectedPillar === "ALL") return LILISARE_INTAKE_REPORTS;
    if (selectedPillar === "PILLAR1") {
      return LILISARE_INTAKE_REPORTS.filter(
        (r) => r.id === "lilisare-int-1" || r.id === "lilisare-int-2"
      );
    }
    if (selectedPillar === "PILLAR2") {
      return LILISARE_INTAKE_REPORTS.filter((r) => r.id === "lilisare-int-4");
    }
    if (selectedPillar === "PILLAR3") {
      return LILISARE_INTAKE_REPORTS.filter(
        (r) => r.id === "lilisare-int-3" || r.id === "lilisare-int-6"
      );
    }
    if (selectedPillar === "PILLAR4") {
      return LILISARE_INTAKE_REPORTS.filter((r) => r.id === "lilisare-int-5");
    }
    if (selectedPillar === "BOTTLENECK") {
      return LILISARE_INTAKE_REPORTS.filter(
        (r) => r.id === "lilisare-int-6" || r.id === "lilisare-int-7"
      );
    }
    return LILISARE_INTAKE_REPORTS;
  }, [selectedPillar]);

  // Handle Full CSV Export
  const handleExportCsv = () => {
    exportIntakeReportsCsv();
    toast.success("LiliSare Intake Analytics exported to CSV successfully!");
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ---------------------------------------------------- */}
      {/* 01. Page Header & Actions */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
              Role: Intake Coordinator Portal
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Synced Engine · {lastSyncTime}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Intake Reports & Operational Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time analytics across <strong>Intake & Referrals</strong>, <strong>Clients</strong>,{" "}
            <strong>The Three Connected Journeys</strong>, and <strong>Caregiver Workforce</strong>.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none text-slate-700 text-xs font-semibold focus:ring-0 cursor-pointer outline-none"
            >
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="ytd">Year to Date (YTD)</option>
            </select>
          </div>

          {/* Sync Trigger */}
          <button
            onClick={refreshLiveKpis}
            title="Refresh analytics from synced storage"
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
      {/* 02. Six Core LiliSare Intake KPI Cards */}
      {/* ---------------------------------------------------- */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Total Referrals</span>
            <div className="w-7 h-7 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {kpis.totalReferrals}
            </div>
            <div className="text-[10px] text-[#3D6B22] font-semibold mt-0.5">
              +14% vs last period
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">First Contact SLA</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {kpis.avgResponseTimeMins}m
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              Target: &lt; 15 mins (In SLA)
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Conversion Rate</span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {kpis.conversionRatePercent}%
            </div>
            <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
              Inquiry → Onboarding
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Discharge SLA</span>
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {kpis.hospitalSlaCompliancePercent}%
            </div>
            <div className="text-[10px] text-red-700 font-semibold mt-0.5">
              0 breaches this month
            </div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Tri-Journey Velocity</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Home className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {kpis.avgDaysToCareStart}d
            </div>
            <div className="text-[10px] text-purple-700 font-semibold mt-0.5">
              Referral → First Shift
            </div>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Caregiver Clearance</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {kpis.caregiverClearanceRate}%
            </div>
            <div className="text-[10px] text-rose-700 font-semibold mt-0.5">
              Screening & LMS Ready
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 03. Pillar Filter Tabs Bar */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setSelectedPillar("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer",
              selectedPillar === "ALL"
                ? "bg-[#3D6B22] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            All Intake Reports ({LILISARE_INTAKE_REPORTS.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedPillar("PILLAR1")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer",
              selectedPillar === "PILLAR1"
                ? "bg-[#3D6B22] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Pillar 1: Referrals & SLAs
          </button>
          <button
            type="button"
            onClick={() => setSelectedPillar("PILLAR2")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer",
              selectedPillar === "PILLAR2"
                ? "bg-[#3D6B22] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Pillar 2: Clients & Payers
          </button>
          <button
            type="button"
            onClick={() => setSelectedPillar("PILLAR3")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer",
              selectedPillar === "PILLAR3"
                ? "bg-[#3D6B22] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Pillar 3: Three Connected Journeys
          </button>
          <button
            type="button"
            onClick={() => setSelectedPillar("PILLAR4")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer",
              selectedPillar === "PILLAR4"
                ? "bg-[#3D6B22] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Pillar 4: Caregiver Workforce
          </button>
          <button
            type="button"
            onClick={() => setSelectedPillar("BOTTLENECK")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer",
              selectedPillar === "BOTTLENECK"
                ? "bg-[#3D6B22] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Bottlenecks & Losses
          </button>
        </div>

        <Link
          href="/intake/dashboard"
          className="hidden sm:inline-flex items-center gap-1 text-xs text-[#3D6B22] font-bold hover:underline"
        >
          <span>Return to Intake Control Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 04. Reports Grid */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onView={(r) => setActiveReport(r)}
          />
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 05. Three Connected Journeys Operational Matrix */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3D6B22]"></span>
              <h3 className="text-sm font-bold text-slate-900">
                The Three Connected Journeys: Intake Progression Benchmark
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Section 8 Architectural Model: Synchronous cross-journey milestone tracking within households.
            </p>
          </div>
          <Link
            href="/households"
            className="text-xs font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
          >
            Open Households Matrix
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Journey 1: Client */}
          <div className="bg-sky-50/60 rounded-xl p-4 border border-sky-100 space-y-2">
            <div className="flex items-center justify-between font-bold text-sky-950">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                1. Client Journey
              </span>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                7.7 Days Total
              </span>
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              Inquiry received $\rightarrow$ Client registered (1.2d) $\rightarrow$ In-home RN assessment (2.4d) $\rightarrow$ Case manager authorization approval (4.1d).
            </p>
            <div className="pt-2 border-t border-sky-200/60 text-[11px] text-sky-900 flex justify-between">
              <span>Auth Approval Rate:</span>
              <strong>94.2%</strong>
            </div>
          </div>

          {/* Journey 2: Caregiver */}
          <div className="bg-rose-50/60 rounded-xl p-4 border border-rose-100 space-y-2">
            <div className="flex items-center justify-between font-bold text-rose-950">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600" />
                2. Caregiver Journey
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                8.3 Days Total
              </span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              Family/Agency Registration (1.0d) $\rightarrow$ Identity & background screening (2.1d) $\rightarrow$ CPR & LMS modules completed (3.4d) $\rightarrow$ Activation ready.
            </p>
            <div className="pt-2 border-t border-rose-200/60 text-[11px] text-rose-900 flex justify-between">
              <span>First-Time Clearance:</span>
              <strong>89.6%</strong>
            </div>
          </div>

          {/* Journey 3: Operations */}
          <div className="bg-[#E3F1D9]/50 rounded-xl p-4 border border-[#3D6B22]/20 space-y-2">
            <div className="flex items-center justify-between font-bold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-[#3D6B22]" />
                3. Agency Operations Journey
              </span>
              <span className="text-[10px] bg-[#3D6B22]/15 text-[#3D6B22] px-2 py-0.5 rounded-full">
                5.6 Days to Care
              </span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Triage & SLA coordination (11.4m) $\rightarrow$ Authorization review & payer setup $\rightarrow$ Care schedule built $\rightarrow$ First EVV verified clock-in.
            </p>
            <div className="pt-2 border-t border-[#3D6B22]/20 text-[11px] text-emerald-950 flex justify-between">
              <span>Time-to-Start Compliance:</span>
              <strong>98.1%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 06. Interactive Report Drill-Down Modal */}
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
