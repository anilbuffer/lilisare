"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { CalendarCheck, ArrowRight } from "lucide-react";

const data = [
  { day: "Mon", Scheduled: 120, Completed: 118 },
  { day: "Tue", Scheduled: 132, Completed: 128 },
  { day: "Wed", Scheduled: 141, Completed: 135 },
  { day: "Thu", Scheduled: 138, Completed: 138 },
  { day: "Fri", Scheduled: 145, Completed: 140 },
  { day: "Sat", Scheduled: 85, Completed: 80 },
  { day: "Sun", Scheduled: 75, Completed: 75 },
];

export function VisitsChart() {
  return (
    <Card className="flex flex-col h-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-[#3D6B22] rounded-xl">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Visits this week</h3>
              <span className="px-2.5 py-0.5 bg-[#E3F1D9] text-[#1E5622] border border-[#93C573]/30 text-xs font-bold rounded-full">
                96% Completion
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/scheduling"
          className="text-xs font-semibold text-[#3D6B22] hover:text-[#274C1D] flex items-center gap-1 transition-colors"
        >
          View shifts <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 min-h-[240px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748B" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748B" }}
            />
            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                fontSize: "12px",
              }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", color: "#64748B", paddingTop: "14px" }}
            />
            <Bar dataKey="Scheduled" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Scheduled" />
            <Bar dataKey="Completed" fill="#3D6B22" radius={[4, 4, 0, 0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-emerald-800">836 Completed (96.0%)</span>
          <span className="text-slate-300">•</span>
          <span className="text-amber-800 font-medium">21 Rescheduled (2.4%)</span>
          <span className="text-slate-300">•</span>
          <span className="text-rose-700 font-bold">14 Missed (1.6%)</span>
        </div>
        <span className="text-slate-400 font-medium">871 total scheduled shifts</span>
      </div>
    </Card>
  );
}
