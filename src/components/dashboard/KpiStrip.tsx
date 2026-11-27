"use client";

import React from "react";
import { Users, UserCircle2, CalendarCheck, ShieldAlert, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/Card";

const kpiData = [
  { label: "Active Patients", value: "247", trend: "+ 12 this month", icon: Users, color: "text-[#3D6B22]", bg: "bg-[#3D6B22]/10 border-[#3D6B22]/20", trendColor: "text-[#3D6B22]" },
  { label: "Active Caregivers", value: "84", trend: "5 onboarding", icon: UserCircle2, color: "text-purple-700", bg: "bg-purple-50 border-purple-200/80", trendColor: "text-purple-700" },
  { label: "Today's Visits", value: "142", trend: "98 completed · 44 upcoming", icon: CalendarCheck, color: "text-blue-700", bg: "bg-blue-50 border-blue-200/80", trendColor: "text-text-secondary" },
  { label: "EVV Compliance", value: "96.4%", trend: "9 exceptions today", icon: CheckCircle2, color: "text-[#3D6B22]", bg: "bg-[#3D6B22]/10 border-[#3D6B22]/20", trendColor: "text-accent-orange" },
  { label: "Open Unfilled Shifts", value: "8", trend: "5 urgent (within 4 hrs)", icon: Clock, color: "text-amber-700", bg: "bg-amber-50 border-amber-200/80", trendColor: "text-accent-red" },
  { label: "Open Incidents", value: "3", trend: "1 in compliance review", icon: ShieldAlert, color: "text-rose-700", bg: "bg-rose-50 border-rose-200/80", trendColor: "text-text-secondary" },
  { label: "Monthly Revenue", value: "$486k", trend: "+ 4.4% vs last month", icon: DollarSign, color: "text-[#3D6B22]", bg: "bg-[#3D6B22]/10 border-[#3D6B22]/20", trendColor: "text-[#3D6B22]" },
];

export function KpiStrip() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {kpiData.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="bg-white backdrop-blur-xl rounded-2xl px-4 py-3 border border-slate-200 shadow-[0_6px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] hover:border-brand-teal/60 transition-all duration-300 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[12px] font-medium text-text-secondary leading-tight pr-2">{kpi.label}</span>
              <div className={cn("w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0", kpi.bg, kpi.color)}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-xl font-bold text-slate-800 tracking-tight mb-1">
                {kpi.value}
              </div>
              <div className={cn("text-[11px] font-medium", kpi.trendColor)}>
                {kpi.trend}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
