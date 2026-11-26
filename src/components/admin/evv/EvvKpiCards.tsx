"use client";

import React from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
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
      label: "Today's Visits",
      value: kpis.todaysVisits,
      subtext: "Scheduled for today",
      icon: Calendar,
      iconColor: "text-[#3D6B22]",
      iconBg: "bg-[#3D6B22]/10",
      activeRing: "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 shadow-md",
      accent: "text-slate-900",
    },
    {
      id: "IN_PROGRESS",
      label: "In Progress",
      value: kpis.inProgress,
      subtext: "Active shifts clock-in",
      icon: Clock,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      activeRing: "border-blue-500 ring-2 ring-blue-500/20 shadow-md",
      accent: "text-blue-700",
    },
    {
      id: "PENDING_VERIFICATION",
      label: "Pending Verification",
      value: kpis.pendingVerification,
      subtext: "Awaiting audit review",
      icon: CheckCircle2,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      activeRing: "border-amber-500 ring-2 ring-amber-500/20 shadow-md",
      accent: "text-amber-700",
    },
    {
      id: "EXCEPTIONS",
      label: "Exceptions",
      value: kpis.exceptions,
      subtext: "Action required",
      icon: AlertTriangle,
      iconColor: "text-[#ff6900]",
      iconBg: "bg-orange-50",
      activeRing: "border-[#ff6900] ring-2 ring-[#ff6900]/20 shadow-md",
      accent: "text-[#ff6900]",
    },
    {
      id: "CLEARED_BILLING",
      label: "Cleared for Billing",
      value: kpis.clearedForBilling,
      subtext: "Passed all EVV checks",
      icon: ShieldCheck,
      iconColor: "text-[#00d084]",
      iconBg: "bg-emerald-50",
      activeRing: "border-[#00d084] ring-2 ring-[#00d084]/20 shadow-md",
      accent: "text-emerald-700",
    },
    {
      id: "AGGREGATOR_REJECTED",
      label: "Aggregator Rejected",
      value: kpis.aggregatorRejected,
      subtext: "External sync errors",
      icon: AlertCircle,
      iconColor: "text-[#ff6b6b]",
      iconBg: "bg-rose-50",
      activeRing: "border-[#ff6b6b] ring-2 ring-[#ff6b6b]/20 shadow-md",
      accent: "text-rose-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={`text-left bg-white rounded-xl lg:rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 cursor-pointer overflow-hidden ${
              isActive ? `${card.activeRing} bg-slate-50/50` : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
                {card.label}
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor}`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-1">
              <span className={`text-xl sm:text-2xl font-bold tracking-tight ${card.accent}`}>
                {card.value}
              </span>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {card.subtext}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
