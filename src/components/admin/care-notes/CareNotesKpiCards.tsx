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
  ChevronRight,
} from "lucide-react";

interface CareNotesKpiCardsProps {
  kpi: CareNotesKpiSummary;
}

export function CareNotesKpiCards({ kpi }: CareNotesKpiCardsProps) {
  const cards = [
    {
      id: "total",
      label: "Total Notes",
      value: kpi.totalNotes,
      subtext: "Logged care records",
      icon: FileText,
      color: "text-slate-700 bg-slate-100 border-slate-200/80",
      accent: "hover:border-slate-300",
      href: "/admin/care-notes/all",
    },
    {
      id: "submitted",
      label: "Submitted",
      value: kpi.submittedCount,
      subtext: "Active caregiver filings",
      icon: Send,
      color: "text-[#3D6B22] bg-[#3D6B22]/10 border-[#3D6B22]/20",
      accent: "hover:border-[#3D6B22]/40",
      href: "/admin/care-notes/all?status=submitted",
    },
    {
      id: "pending_review",
      label: "Pending Review",
      value: kpi.pendingReviewCount,
      subtext: "Awaiting Admin audit",
      icon: Clock,
      color: "text-amber-800 bg-amber-50 border-amber-200/80",
      accent: "hover:border-amber-300",
      href: "/admin/care-notes/review",
    },
    {
      id: "needs_correction",
      label: "Needs Correction",
      value: kpi.needsCorrectionCount,
      subtext: "Returned to caregiver",
      icon: AlertTriangle,
      color: "text-rose-700 bg-rose-50 border-rose-200/80",
      accent: "hover:border-rose-300",
      href: "/admin/care-notes/corrections",
    },
    {
      id: "overdue_missing",
      label: "Overdue / Missing",
      value: kpi.overdueMissingCount,
      subtext: "Breached 24h filing SLA",
      icon: AlertCircle,
      color: "text-red-700 bg-red-50 border-red-200/80",
      accent: "hover:border-red-300",
      href: "/admin/care-notes/all?status=missing",
    },
    {
      id: "reviewed_approved",
      label: "Reviewed / Approved",
      value: kpi.reviewedApprovedCount,
      subtext: "Compliant & verified",
      icon: CheckCircle2,
      color: "text-[#008f5a] bg-emerald-50 border-emerald-200/80",
      accent: "hover:border-emerald-300",
      href: "/admin/care-notes/all?status=approved",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.id}
            href={card.href}
            className={`group bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between ${card.accent}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="truncate">{card.subtext}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
