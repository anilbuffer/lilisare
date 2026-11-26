"use client";

import React, { useState, useEffect } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div
      className={`bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between ${className || ""}`}
    >
      {/* Card Header matching AI Protocol card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 min-h-[52px]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] shrink-0">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Documentation Activity Trends</h3>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setPeriod("7d")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              period === "7d" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              period === "30d" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setPeriod("90d")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              period === "90d" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 w-full min-h-[300px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3D6B22" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3D6B22" stopOpacity={0.0} />
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
                stroke="#3D6B22"
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
        ) : (
          <div className="w-full h-full min-h-[300px] rounded-xl bg-slate-50/60 animate-pulse" />
        )}
      </div>

      {/* Card Footer matching AI Protocol card */}
      <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between min-h-[44px]">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>Real-time documentation audit stream</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          Target SLA: &lt; 24h Review
        </span>
      </div>
    </div>
  );
}
