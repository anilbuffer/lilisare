"use client";

import React from "react";
import Link from "next/link";
import { CareNote } from "@/types/careNotes";
import {
  AlertTriangle,
  Clock,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Flame,
  Stethoscope,
} from "lucide-react";

interface CareNotesAttentionPanelProps {
  notes: CareNote[];
  onTabChange?: (tabId: string) => void;
}

export function CareNotesAttentionPanel({ notes, onTabChange }: CareNotesAttentionPanelProps) {
  // Aggregate attention items
  const awaitingReview = notes.filter((n) => n.reviewStatus === "pending_review" && !n.isMissing);
  const requiringCorrection = notes.filter(
    (n) => n.reviewStatus === "correction_requested" || n.correctionStatus === "awaiting_caregiver"
  );
  const overdueOrMissing = notes.filter((n) => n.isOverdue || n.isMissing);
  const qualityFlagged = notes.filter((n) => n.flags.some((f) => f.status === "open" && f.flagType !== "clinical"));
  const clinicalEscalated = notes.filter(
    (n) => n.reviewStatus === "escalated" || n.flags.some((f) => f.status === "open" && f.flagType === "clinical")
  );

  const getOldestDate = (list: CareNote[]): string => {
    if (list.length === 0) return "-";
    const dates = list
      .map((n) => n.submittedAt || n.serviceDate)
      .filter(Boolean)
      .sort();
    return dates[0] || "-";
  };

  const attentionItems = [
    {
      id: "clinical",
      title: "Clinical Supervisory Escalations",
      count: clinicalEscalated.length,
      oldestDate: getOldestDate(clinicalEscalated),
      icon: Stethoscope,
      description: "Vital sign variances or acute neurological flags routed for RN review",
      href: "/admin/care-notes/all?status=flagged&type=clinical",
      tab: "all",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200/80",
    },
    {
      id: "overdue",
      title: "Overdue / Missing Notes",
      count: overdueOrMissing.length,
      oldestDate: getOldestDate(overdueOrMissing),
      icon: AlertCircle,
      description: "EVV shifts completed without care documentation exceeding 24h SLA",
      href: "/admin/care-notes/all?status=missing",
      tab: "all",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200/80",
    },
    {
      id: "corrections",
      title: "Awaiting Caregiver Corrections",
      count: requiringCorrection.length,
      oldestDate: getOldestDate(requiringCorrection),
      icon: AlertTriangle,
      description: "Returned notes waiting on caregiver amendments and resubmissions",
      href: "/admin/care-notes/corrections",
      tab: "corrections",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200/80",
    },
    {
      id: "review",
      title: "Pending Agency Admin Review",
      count: awaitingReview.length,
      oldestDate: getOldestDate(awaitingReview),
      icon: Clock,
      description: "Caregiver-submitted notes awaiting first-pass documentation verification",
      href: "/admin/care-notes/review",
      tab: "review",
      badgeColor: "bg-[#3D6B22]/10 text-[#3D6B22] border-[#3D6B22]/20",
    },
    {
      id: "compliance",
      title: "Compliance & Time Variances",
      count: qualityFlagged.length,
      oldestDate: getOldestDate(qualityFlagged),
      icon: ShieldAlert,
      description: "Time duration discrepancies between note narrative and EVV GPS telemetry",
      href: "/admin/care-notes/all?status=flagged&type=compliance",
      tab: "all",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200/80",
    },
  ];

  const totalOutstanding =
    clinicalEscalated.length +
    overdueOrMissing.length +
    requiringCorrection.length +
    awaitingReview.length +
    qualityFlagged.length;

  return (
    <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff6900]/10 border border-[#ff6900]/20 flex items-center justify-center text-[#ff6900] shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Needs Attention</h2>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
          {totalOutstanding} action items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1 [scrollbar-width:thin]">
        {attentionItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.badgeColor}`}>
                    {item.count}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mb-3">{item.description}</p>
              </div>

              <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  Oldest: <span className="text-slate-700 font-semibold">{item.oldestDate}</span>
                </span>
                {onTabChange ? (
                  <button
                    type="button"
                    onClick={() => onTabChange(item.tab)}
                    className="inline-flex items-center gap-1 font-bold text-[#3D6B22] hover:text-[#345C1D] transition-colors cursor-pointer"
                  >
                    View Queue <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 font-bold text-[#3D6B22] hover:text-[#345C1D] transition-colors"
                  >
                    View Queue <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
