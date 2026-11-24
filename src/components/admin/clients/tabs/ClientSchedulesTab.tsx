"use client";

import React from "react";
import {
  Clock,
  User,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileCheck,
  Edit2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { ClientRecord } from "@/types/client";

interface ClientSchedulesTabProps {
  client: ClientRecord;
  onOpenScheduleVisit?: () => void;
}

export function ClientSchedulesTab({ client, onOpenScheduleVisit }: ClientSchedulesTabProps) {
  const schedules = client.schedules || [];
  const totalWeeklyHours = schedules.reduce((acc, s) => acc + s.hours, 0);
  const authorizedHours = client.carePlan?.authorizedWeeklyHours || 40;
  const utilizationPct = Math.round((totalWeeklyHours / authorizedHours) * 100);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Master Recurring Shift Roster
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Weekly scheduled recurring shifts aligned with Medicaid authorized care plan hours
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenScheduleVisit}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Recurring Shift</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Authorized Weekly Hours
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {authorizedHours} hrs
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 px-2 py-0.5 rounded-full border border-[#3D6B22]/20">
              Medicaid Cap
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Service authorization active through Dec 2026
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Scheduled Weekly Hours
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#3D6B22]">
              {totalWeeklyHours} hrs
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {schedules.length} recurring shifts
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Assigned to primary caregiver
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Authorization Utilization
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {utilizationPct}%
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-[#3D6B22]" /> Optimal
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium">
            Zero overtime or unapproved hours
          </div>
        </div>
      </div>

      {/* Schedules Master Table Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Recurring Shifts
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Standard repeating weekly shifts dispatched automatically to the caregiver app
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[660px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3.5 pl-2">Day of Week</th>
                <th className="pb-3.5">Time Window</th>
                <th className="pb-3.5">Duration</th>
                <th className="pb-3.5">Service Code</th>
                <th className="pb-3.5">Assigned Caregiver</th>
                <th className="pb-3.5">Status</th>
                <th className="pb-3.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 pl-2 font-bold text-slate-900 text-sm">
                    {item.dayOfWeek}
                  </td>
                  <td className="py-4 font-semibold text-slate-700">
                    {item.startTime} – {item.endTime}
                  </td>
                  <td className="py-4 text-slate-600 font-medium">
                    <span className="bg-slate-100 px-2 py-0.5 rounded  font-semibold text-slate-700">
                      {item.hours} hrs
                    </span>
                  </td>
                  <td className="py-4  font-semibold text-slate-600">
                    {item.serviceCode}
                  </td>
                  <td className="py-4 font-semibold text-[#3D6B22]">
                    {item.caregiverName}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3D6B22]" />
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={onOpenScheduleVisit}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                        title="Edit Shift"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
