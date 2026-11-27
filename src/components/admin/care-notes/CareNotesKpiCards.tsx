"use client";

import React from "react";
import Link from "next/link";
import { CareNotesKpiSummary } from "@/types/careNotes";
import {
  FileText,
  Send,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface CareNotesKpiCardsProps {
  kpi: CareNotesKpiSummary;
  onTabChange?: (tabId: string) => void;
}

export function CareNotesKpiCards({ kpi, onTabChange }: CareNotesKpiCardsProps) {
  const cards = [
    {
      id: "total",
      label: "Total Notes",
      value: kpi.totalNotes,
      icon: FileText,
      color: "text-slate-700 bg-slate-100 border-slate-200/80",
      accent: "hover:border-slate-300",
      href: "/admin/care-notes/all",
      tab: "all",
    },
    {
      id: "submitted",
      label: "Submitted",
      value: kpi.submittedCount,
      icon: Send,
      color: "text-[#3D6B22] bg-[#3D6B22]/10 border-[#3D6B22]/20",
      accent: "hover:border-[#3D6B22]/40",
      href: "/admin/care-notes/all?status=submitted",
      tab: "all",
    },
    {
      id: "pending_review",
      label: "Pending Review",
      value: kpi.pendingReviewCount,
      icon: Clock,
      color: "text-amber-800 bg-amber-50 border-amber-200/80",
      accent: "hover:border-amber-300",
      href: "/admin/care-notes/review",
      tab: "review",
    },
    {
      id: "needs_correction",
      label: "Needs Correction",
      value: kpi.needsCorrectionCount,
      icon: AlertTriangle,
      color: "text-rose-700 bg-rose-50 border-rose-200/80",
      accent: "hover:border-rose-300",
      href: "/admin/care-notes/corrections",
      tab: "corrections",
    },
    {
      id: "overdue_missing",
      label: "Overdue / Missing",
      value: kpi.overdueMissingCount,
      icon: AlertCircle,
      color: "text-red-700 bg-red-50 border-red-200/80",
      accent: "hover:border-red-300",
      href: "/admin/care-notes/all?status=missing",
      tab: "all",
    },
    {
      id: "reviewed_approved",
      label: "Reviewed / Approved",
      value: kpi.reviewedApprovedCount,
      icon: CheckCircle2,
      color: "text-[#008f5a] bg-emerald-50 border-emerald-200/80",
      accent: "hover:border-emerald-300",
      href: "/admin/care-notes/all?status=approved",
      tab: "all",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const cardContent = (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-left">
              {card.value}
            </div>
          </div>
        );

        if (onTabChange) {
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onTabChange(card.tab)}
              className={`group bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between text-left cursor-pointer ${card.accent}`}
            >
              {cardContent}
            </button>
          );
        }

        return (
          <Link
            key={card.id}
            href={card.href}
            className={`group bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between ${card.accent}`}
          >
            {cardContent}
          </Link>
        );
      })}
    </div>
  );
}
