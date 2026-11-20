"use client";

import React from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { DollarSign, ArrowRight, TrendingUp } from "lucide-react";

const payerData = [
  { name: "Medicare", value: 65, color: "#3D6B22" },
  { name: "Medicaid Waiver", value: 20, color: "#2563EB" },
  { name: "Private Pay", value: 10, color: "#8B5CF6" },
  { name: "Commercial", value: 5, color: "#F59E0B" },
];

export function FinancialHealth() {
  return (
    <Card className="flex flex-col h-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-[#3D6B22] rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Revenue Cycle Health</h3>
              <span className="px-2 py-0.5 bg-[#E8F2E4] text-[#1E5622] border border-[#93C573]/30 text-[11px] font-bold rounded-full">
                3.2% Denials · 28.4d A/R
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/billing/workspace"
          className="text-xs font-semibold text-[#3D6B22] hover:text-[#274C1D] flex items-center gap-1 transition-colors"
        >
          Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-4 my-4">
        {/* Donut Chart: Total Revenue */}
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={payerData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={66}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {payerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-semibold text-slate-400">Total Rev</span>
            <span className="text-lg font-extrabold text-slate-900">$1.2M</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 text-xs">
          {payerData.map((item) => (
            <div key={item.name} className="flex justify-between items-center text-slate-600">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-800">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unbilled & Denied Claims Strip */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <div className="text-[11px] font-medium text-slate-500 mb-0.5">Unbilled Care</div>
          <div className="font-bold text-base text-slate-900">$42,500</div>
          <div className="text-[10px] text-slate-400 mt-0.5">84 notes awaiting sign-off</div>
        </div>
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-medium text-rose-700">Denied Claims</span>
            <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">3.2% rate</span>
          </div>
          <div className="font-bold text-base text-rose-700">$8,240</div>
          <div className="text-[10px] text-rose-600 mt-0.5">3 claims flagged for review</div>
        </div>
      </div>

      {/* AR Aging Bar */}
      <div className="mt-auto pt-2 border-t border-slate-100">
        <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
          <span>AR Aging (DSO: 28.4 Days)</span>
          <span className="text-[#3D6B22] font-semibold">60% current (0-30d)</span>
        </div>
        <div className="w-full h-2.5 flex rounded-full overflow-hidden bg-slate-100">
          <div className="bg-[#3D6B22] w-[60%]" title="0-30 Days: 60%" />
          <div className="bg-amber-400 w-[25%]" title="31-60 Days: 25%" />
          <div className="bg-orange-500 w-[10%]" title="61-90 Days: 10%" />
          <div className="bg-rose-600 w-[5%]" title="90+ Days: 5%" />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>0-30 Days</span>
          <span>31-60d</span>
          <span>61-90d</span>
          <span>90+ Days</span>
        </div>
      </div>
    </Card>
  );
}
