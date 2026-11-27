"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  AlertTriangle,
  ShieldCheck,
  SlidersHorizontal,
  Save,
  Users,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import {
  RealTimeVisit,
  OvertimeRuleConfig,
  EvvScheduleThresholdRule,
} from "@/types/scheduling";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";
import {
  getVisitsFromStorage,
  getSyncedSchedulingContext,
  subscribeToSchedulingSync,
  getOvertimeRules,
  saveOvertimeRules,
  getEvvThresholdRules,
  saveEvvThresholdRules,
  computeClientHoursInsights,
  computeCaregiverOvertimeInsights,
} from "@/lib/scheduling/schedulingStore";

const CARD_CLASS =
  "bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200";

export default function SchedulingInsightsPage() {
  const [visits, setVisits] = useState<RealTimeVisit[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverRecord[]>([]);
  const [otRules, setOtRules] = useState<OvertimeRuleConfig[]>([]);
  const [evvRules, setEvvRules] = useState<EvvScheduleThresholdRule[]>([]);

  useEffect(() => {
    const load = () => {
      setVisits(getVisitsFromStorage());
      const ctx = getSyncedSchedulingContext();
      setClients(ctx.clients);
      setCaregivers(ctx.caregivers);
      setOtRules(getOvertimeRules());
      setEvvRules(getEvvThresholdRules());
    };
    load();
    return subscribeToSchedulingSync(load);
  }, []);

  const clientInsights = useMemo(
    () => computeClientHoursInsights(visits, clients),
    [visits, clients]
  );

  const caregiverInsights = useMemo(
    () => computeCaregiverOvertimeInsights(visits, caregivers, otRules),
    [visits, caregivers, otRules]
  );

  const overAuthCount = clientInsights.filter((c) => c.status === "Over Auth").length;
  const otRiskCount = caregiverInsights.filter(
    (c) => c.status === "Overtime" || c.status === "Approaching OT"
  ).length;

  const handleSaveRules = () => {
    saveOvertimeRules(otRules);
    saveEvvThresholdRules(evvRules);
    toast.success("Overtime & Payer EVV threshold rules saved.");
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className={CARD_CLASS}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              href="/admin/scheduling"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3D6B22] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Real-Time Scheduling</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Scheduling Insights, Authorization &amp; Overtime Rules
            </h1>
            <p className="text-xs text-slate-500">
              Compare client authorized vs. scheduled vs. completed hours, track caregiver overtime against configurable employment rules, and tune EVV grace thresholds.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/scheduling/coverage"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200"
            >
              <CalendarClock className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>Open Shift Coverage</span>
            </Link>
            <button
              type="button"
              onClick={handleSaveRules}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={CARD_CLASS}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Clients Over Authorization
          </p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{overAuthCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Scheduled hours exceed auth cap</p>
        </div>
        <div className={CARD_CLASS}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Caregivers OT / Approaching
          </p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{otRiskCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Flagged by employment rules</p>
        </div>
        <div className={CARD_CLASS}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Scheduled Hours
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {Math.round(clientInsights.reduce((s, c) => s + c.scheduledWeeklyHours, 0) * 10) / 10}h
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Across active client plans</p>
        </div>
        <div className={CARD_CLASS}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Completed Service Hours
          </p>
          <p className="text-2xl font-extrabold text-[#3D6B22] mt-1">
            {Math.round(clientInsights.reduce((s, c) => s + c.completedHours, 0) * 10) / 10}h
          </p>
          <p className="text-xs text-slate-500 mt-0.5">EVV verified &amp; completed</p>
        </div>
      </div>

      {/* Section 1: Client Authorized vs Scheduled vs Completed Hours */}
      <div className={CARD_CLASS + " space-y-4"}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3D6B22]" />
              <span>Which Clients Are Increasing in Hours? (Auth vs. Scheduled vs. Completed)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Flags schedules exceeding payer authorization caps so coordinators can adjust or request auth increases.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 pr-4">Client</th>
                <th className="py-2.5 pr-4">Authorization</th>
                <th className="py-2.5 pr-4">Authorised</th>
                <th className="py-2.5 pr-4">Scheduled</th>
                <th className="py-2.5 pr-4">Completed</th>
                <th className="py-2.5 pr-4">Variance</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {clientInsights.map((row) => (
                <tr key={row.clientId} className="hover:bg-slate-50/70">
                  <td className="py-3 pr-4 font-bold text-slate-900">{row.clientName}</td>
                  <td className="py-3 pr-4 text-slate-600">{row.authorizationNumber}</td>
                  <td className="py-3 pr-4 font-semibold text-slate-700">{row.authorizedWeeklyHours}h</td>
                  <td className="py-3 pr-4 font-bold text-slate-900">{row.scheduledWeeklyHours}h</td>
                  <td className="py-3 pr-4 text-slate-600">{row.completedHours}h</td>
                  <td className="py-3 pr-4 font-extrabold">
                    <span className={row.varianceHours > 0 ? "text-rose-600" : "text-[#3D6B22]"}>
                      {row.varianceHours > 0 ? `+${row.varianceHours}h` : `${row.varianceHours}h`}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        row.status === "Over Auth"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : row.status === "Approaching Cap"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-[#E3F1D9] text-[#1E5622] border-[#93C573]"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Caregiver Overtime Insights */}
      <div className={CARD_CLASS + " space-y-4"}>
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3D6B22]" />
            <span>Where Is Overtime Coming From? (Caregiver Hours vs. Employment Rules)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated against configurable weekly thresholds per employment classification.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 pr-4">Caregiver</th>
                <th className="py-2.5 pr-4">Classification</th>
                <th className="py-2.5 pr-4">Scheduled</th>
                <th className="py-2.5 pr-4">Actual Worked</th>
                <th className="py-2.5 pr-4">OT Threshold</th>
                <th className="py-2.5 pr-4">Overtime</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {caregiverInsights.map((cg) => (
                <tr key={cg.caregiverId} className="hover:bg-slate-50/70">
                  <td className="py-3 pr-4 font-bold text-slate-900">{cg.caregiverName}</td>
                  <td className="py-3 pr-4 text-slate-600">{cg.employmentClassification}</td>
                  <td className="py-3 pr-4 font-bold text-slate-900">{cg.scheduledHours}h</td>
                  <td className="py-3 pr-4 text-slate-600">{cg.actualWorkedHours}h</td>
                  <td className="py-3 pr-4 text-slate-600">{cg.weeklyThresholdHours}h/wk</td>
                  <td className="py-3 pr-4 font-extrabold">
                    <span className={cg.overtimeHours > 0 ? "text-rose-600" : "text-slate-500"}>
                      {cg.overtimeHours > 0 ? `+${cg.overtimeHours}h OT` : "0h"}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        cg.status === "Overtime"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : cg.status === "Approaching OT"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-[#E3F1D9] text-[#1E5622] border-[#93C573]"
                      }`}
                    >
                      {cg.status} ({cg.utilizationPercent}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Configurable Overtime & Payer EVV Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD_CLASS + " space-y-3"}>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#3D6B22]" />
            <span>Configurable Overtime Rules</span>
          </h3>
          <div className="space-y-2.5">
            {otRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center text-xs"
              >
                <div className="font-bold text-slate-800">{rule.employmentType}</div>
                <label className="flex items-center justify-between gap-2 text-slate-600">
                  <span>Weekly OT (h):</span>
                  <input
                    type="number"
                    min={10}
                    max={80}
                    value={rule.weeklyOvertimeThresholdHours}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 40;
                      setOtRules((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, weeklyOvertimeThresholdHours: val } : r
                        )
                      );
                    }}
                    className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 text-center"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-slate-600">
                  <span>Warn %:</span>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={rule.warningThresholdPercent}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 85;
                      setOtRules((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, warningThresholdPercent: val } : r
                        )
                      );
                    }}
                    className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 text-center"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className={CARD_CLASS + " space-y-3"}>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#3D6B22]" />
            <span>Payer / Program EVV Tolerance Thresholds</span>
          </h3>
          <div className="space-y-2.5">
            {evvRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center text-xs"
              >
                <div className="font-bold text-slate-800">{rule.programName}</div>
                <label className="flex items-center justify-between gap-2 text-slate-600">
                  <span>Late Grace (m):</span>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={rule.lateGraceMinutes}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 15;
                      setEvvRules((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, lateGraceMinutes: val } : r))
                      );
                    }}
                    className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 text-center"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-slate-600">
                  <span>Missing Alert (m):</span>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={rule.missingStartAlertMinutes}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 30;
                      setEvvRules((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, missingStartAlertMinutes: val } : r
                        )
                      );
                    }}
                    className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 text-center"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
