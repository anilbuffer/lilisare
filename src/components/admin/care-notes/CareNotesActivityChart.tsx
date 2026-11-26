"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

interface ActivityChartProps {
  className?: string;
}

export function CareNotesActivityChart({ className }: ActivityChartProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  // Sample data points aligned with mock store
  const data7d = [
    { date: "Nov 20", submitted: 18, reviewed: 16, corrections: 2 },
    { date: "Nov 21", submitted: 22, reviewed: 19, corrections: 3 },
    { date: "Nov 22", submitted: 20, reviewed: 18, corrections: 2 },
    { date: "Nov 23", submitted: 25, reviewed: 23, corrections: 1 },
    { date: "Nov 24", submitted: 28, reviewed: 22, corrections: 4 },
    { date: "Nov 25", submitted: 31, reviewed: 26, corrections: 3 },
    { date: "Nov 26", submitted: 29, reviewed: 24, corrections: 2 },
  ];

  const data30d = [
    { date: "Oct 28", submitted: 14, reviewed: 13, corrections: 1 },
    { date: "Nov 02", submitted: 19, reviewed: 17, corrections: 2 },
    { date: "Nov 07", submitted: 23, reviewed: 21, corrections: 3 },
    { date: "Nov 12", submitted: 26, reviewed: 24, corrections: 2 },
    { date: "Nov 17", submitted: 28, reviewed: 25, corrections: 4 },
    { date: "Nov 22", submitted: 30, reviewed: 27, corrections: 3 },
    { date: "Nov 26", submitted: 32, reviewed: 28, corrections: 2 },
  ];

  const data90d = [
    { date: "Sep 01", submitted: 120, reviewed: 110, corrections: 12 },
    { date: "Sep 15", submitted: 145, reviewed: 138, corrections: 15 },
    { date: "Oct 01", submitted: 170, reviewed: 160, corrections: 18 },
    { date: "Oct 15", submitted: 195, reviewed: 184, corrections: 16 },
    { date: "Nov 01", submitted: 220, reviewed: 208, corrections: 21 },
    { date: "Nov 15", submitted: 245, reviewed: 230, corrections: 19 },
    { date: "Nov 26", submitted: 265, reviewed: 248, corrections: 17 },
  ];

  const activeData = period === "7d" ? data7d : period === "30d" ? data30d : data90d;

  return (
    <div className={`bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#3e6b2b]/10 border border-[#3e6b2b]/20 flex items-center justify-center text-[#3e6b2b]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Documentation Activity Trends</h3>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setPeriod("7d")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${period === "7d" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${period === "30d" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setPeriod("90d")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${period === "90d" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3e6b2b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3e6b2b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorReviewed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d084" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00d084" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCorrections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6900" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ff6900" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                fontSize: "12px",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
            />
            <Area
              type="monotone"
              dataKey="submitted"
              name="Submitted Notes"
              stroke="#3e6b2b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSubmitted)"
            />
            <Area
              type="monotone"
              dataKey="reviewed"
              name="Reviewed / Approved"
              stroke="#00d084"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorReviewed)"
            />
            <Area
              type="monotone"
              dataKey="corrections"
              name="Returned for Correction"
              stroke="#ff6900"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCorrections)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
