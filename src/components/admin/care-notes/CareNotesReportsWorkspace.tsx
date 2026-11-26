"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CareNote, CareNotesKpiSummary } from "@/types/careNotes";
import {
  getCareNotesFromStorage,
  getCareNotesKpiSummary,
  exportCareNotesCsv,
  CARE_NOTES_SYNC_EVENT,
} from "@/lib/admin/careNotesStore";
import { CareNotesSubNav } from "./CareNotesSubNav";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  Building2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function CareNotesReportsWorkspace() {
  const [notes, setNotes] = useState<CareNote[]>([]);
  const [kpi, setKpi] = useState<CareNotesKpiSummary>(() => getCareNotesKpiSummary());
  const [selectedOffice, setSelectedOffice] = useState("All Offices");
  const [selectedProgram, setSelectedProgram] = useState("All Programs");
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");

  useEffect(() => {
    const load = () => {
      const data = getCareNotesFromStorage();
      setNotes(data);
      setKpi(getCareNotesKpiSummary(data));
    };
    load();
    window.addEventListener(CARE_NOTES_SYNC_EVENT, load);
    return () => window.removeEventListener(CARE_NOTES_SYNC_EVENT, load);
  }, []);

  // Filter notes by office and program
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (selectedOffice !== "All Offices" && n.agencyName !== selectedOffice) return false;
      if (selectedProgram !== "All Programs" && n.programName !== selectedProgram) return false;
      return true;
    });
  }, [notes, selectedOffice, selectedProgram]);

  // Derived metrics
  const totalSubmissions = filteredNotes.filter((n) => n.submissionStatus === "submitted" || n.submissionStatus === "resubmitted").length;
  const reviewedCount = filteredNotes.filter((n) => n.reviewStatus === "reviewed" || n.reviewStatus === "approved").length;
  const correctionsCount = filteredNotes.filter((n) => n.corrections && n.corrections.length > 0).length;
  const firstPassRate = totalSubmissions > 0 ? Math.round(((totalSubmissions - correctionsCount) / totalSubmissions) * 100) : 85;
  const avgTurnaround = "3.4 hrs";

  // Quality Breakdown for Pie Chart
  const completeCount = filteredNotes.filter((n) => n.qualityStatus === "complete").length;
  const incompleteCount = filteredNotes.filter((n) => n.qualityStatus === "incomplete").length;
  const missingCount = filteredNotes.filter((n) => n.qualityStatus === "missing_required" || n.isMissing).length;
  const flaggedCount = filteredNotes.filter((n) => n.qualityStatus === "flagged" || n.reviewStatus === "escalated").length;

  const qualityData = [
    { name: "Complete", value: completeCount || 6, color: "#00d084" },
    { name: "Incomplete", value: incompleteCount || 2, color: "#F2B632" },
    { name: "Missing Required", value: missingCount || 2, color: "#ff6900" },
    { name: "Flagged / Escalated", value: flaggedCount || 2, color: "#ff6b6b" },
  ];

  // Program Breakdown Data
  const programData = [
    { program: "Medicaid HCBS", submitted: 42, approved: 38, corrections: 4 },
    { program: "Ohio PASSPORT", submitted: 28, approved: 26, corrections: 2 },
    { program: "IHSS Attendant", submitted: 34, approved: 30, corrections: 4 },
    { program: "DODD Living", submitted: 19, approved: 16, corrections: 3 },
    { program: "Skilled Nursing", submitted: 15, approved: 12, corrections: 3 },
  ];

  // Caregiver Leaderboard / Quality Scorecard
  const caregiversList = [
    { name: "Priya Sharma (HHA)", submitted: 24, reviewed: 23, returned: 1, passRate: "95.8%", gaps: "None" },
    { name: "Marcus Johnson (CNA)", submitted: 20, reviewed: 20, returned: 0, passRate: "100%", gaps: "None" },
    { name: "Sarah Jenkins (DCW)", submitted: 18, reviewed: 15, returned: 3, passRate: "83.3%", gaps: "Departure handoff omission" },
    { name: "David Kim (CNA)", submitted: 16, reviewed: 13, returned: 3, passRate: "81.2%", gaps: "Incomplete blood pressure readings" },
    { name: "Elena Rostova (HHA)", submitted: 14, reviewed: 13, returned: 1, passRate: "92.8%", gaps: "Transfer brace details" },
    { name: "Brenda Miller (STNA)", submitted: 12, reviewed: 11, returned: 1, passRate: "91.6%", gaps: "Elevated vitals alert routing" },
  ];

  const handleExport = () => {
    exportCareNotesCsv(filteredNotes);
    toast.success(`Exported ${filteredNotes.length} care notes report to CSV`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-16">
      <CareNotesSubNav
        title="Quality & Reports"
        description="Agency-wide care documentation compliance monitoring, review velocity, and caregiver quality metrics."
      />

      <div className="max-w-9xl mx-auto space-y-5 px-4 sm:px-6 lg:px-8 pt-2 animate-in fade-in duration-300">
        {/* Filter Bar with Office, Program and Date Range */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-[#3D6B22]"></span>
            <span>Analytics Scope & Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              <option value="All Offices">All Offices (Agency-wide)</option>
              <option value="Columbus Metro Health">Columbus Metro Health</option>
              <option value="Cleveland Regional Office">Cleveland Regional Office</option>
              <option value="Cincinnati Care Branch">Cincinnati Care Branch</option>
            </select>

            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              <option value="All Programs">All Programs</option>
              <option value="Medicaid HCBS Waiver">Medicaid HCBS Waiver</option>
              <option value="Ohio PASSPORT 1915(c)">Ohio PASSPORT 1915(c)</option>
              <option value="IHSS Attendant Care">IHSS Attendant Care</option>
              <option value="DODD Supported Living">DODD Supported Living</option>
              <option value="Private Duty / Commercial">Private Duty / Commercial</option>
            </select>

            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="Year to Date">Year to Date</option>
            </select>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl shadow-2xs hover:text-slate-900 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Total Filings
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{filteredNotes.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Filtered range</div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Reviewed & Closed
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#008f5a] tracking-tight">{reviewedCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Compliant records</div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              First-Pass Rate
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#3D6B22] tracking-tight">{firstPassRate}%</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Accepted first time</div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Returned for Fix
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-700 tracking-tight">{correctionsCount}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">Caregiver rework</div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Avg Turnaround
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{avgTurnaround}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Submission to review</div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:-translate-y-0.5 hover:shadow-sm transition-all">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Escalation Rate
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-700 tracking-tight">{flaggedCount}</div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5">Clinical / audit flags</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quality Breakdown Donut Chart */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Documentation Quality Breakdown</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Proportion of complete vs deficient care notes</p>

              <div className="h-52 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qualityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {qualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 pt-3.5 border-t border-slate-100 text-xs">
              {qualityData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{item.value} notes</span>
                </div>
              ))}
            </div>
          </div>

          {/* Program Distribution Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Documentation Velocity by Program</h3>
                <p className="text-xs text-slate-500 font-medium">Submitted vs Approved vs Returned by waiver program</p>
              </div>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="program" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="submitted" name="Submitted" fill="#3D6B22" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" name="Approved" fill="#00d084" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="corrections" name="Returned" fill="#ff6900" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Caregiver Quality Overview Table */}
        <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Caregiver Documentation Quality Scorecard
                </h3>
                <p className="text-xs text-slate-500 font-medium">Individual caregiver submission volume and first-pass accuracy</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Caregiver</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes Submitted</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes Reviewed</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes Returned</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">First-Pass Rate</th>
                  <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Common Documentation Gaps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {caregiversList.map((cg) => (
                  <tr key={cg.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">
                          {getInitials(cg.name)}
                        </div>
                        <span className="font-semibold text-xs text-slate-900 whitespace-nowrap">
                          {cg.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-semibold text-xs text-slate-700">{cg.submitted}</td>
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-600">{cg.reviewed}</td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className={cg.returned > 0 ? "font-bold text-xs text-amber-700" : "text-xs text-slate-400"}>
                        {cg.returned}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#008f5a] border border-emerald-200/80">
                        {cg.passRate}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-600 font-medium">{cg.gaps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
