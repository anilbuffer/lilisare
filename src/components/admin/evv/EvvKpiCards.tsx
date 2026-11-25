"use client";

import React from "react";
import { Calendar, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { EvvKpiSummary } from "@/types/evvVisit";

interface EvvKpiCardsProps {
  kpis: EvvKpiSummary;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export function EvvKpiCards({ kpis, activeFilter, onSelectFilter }: EvvKpiCardsProps) {
  const cards = [
    {
      id: "ALL",
      label: "Total Visits",
      value: kpis.totalVisits,
      subtext: "Scheduled today",
      icon: Calendar,
      iconColor: "text-[#3D6B22]",
      iconBg: "bg-[#E8F2E4]",
      activeRing: "border-[#3D6B22] ring-1 ring-[#3D6B22]/20 shadow-md",
      accent: "text-slate-900",
    },
    {
      id: "IN_PROGRESS",
      label: "In Progress",
      value: kpis.inProgress,
      subtext: "Currently active",
      icon: Clock,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      activeRing: "border-blue-500 ring-1 ring-blue-500/20 shadow-md",
      accent: "text-blue-700",
    },
    {
      id: "COMPLETED",
      label: "Completed",
      value: kpis.completed,
      subtext: "Clock-out recorded",
      icon: CheckCircle2,
      iconColor: "text-[#1E5622]",
      iconBg: "bg-[#E3F1D9]",
      activeRing: "border-[#3D6B22] ring-1 ring-[#3D6B22]/20 shadow-md",
      accent: "text-[#1E5622]",
    },
    {
      id: "EXCEPTIONS",
      label: "Exceptions",
      value: kpis.exceptions,
      subtext: "Need attention",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      activeRing: "border-amber-500 ring-1 ring-amber-500/20 shadow-md",
      accent: "text-amber-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={`text-left bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 cursor-pointer overflow-hidden ${isActive ? `${card.activeRing} bg-slate-50/40` : ""
              }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block">
                  {card.label}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-lg sm:text-xl font-bold tracking-tight ${card.accent}`}>
                    {card.value}
                  </span>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
