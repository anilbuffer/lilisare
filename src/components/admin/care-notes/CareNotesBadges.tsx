"use client";

import React from "react";
import {
  CareNoteReviewStatus,
  CareNoteSubmissionStatus,
  CareNoteQualityStatus,
  CareNoteCorrectionStatus,
} from "@/types/careNotes";
import { CheckCircle2, Clock, AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";

interface StatusBadgeProps {
  status: CareNoteReviewStatus | CareNoteSubmissionStatus | CareNoteCorrectionStatus | string;
  type?: "review" | "submission" | "correction";
  size?: "sm" | "md";
}

export function CareNoteStatusBadge({ status, type = "review", size = "sm" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-[11px] font-semibold" : "px-3 py-1 text-xs font-semibold";

  // Review Statuses
  if (status === "approved") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-[#008f5a] border border-emerald-200/80 ${sizeClasses}`}>
        <CheckCircle2 className="w-3 h-3 text-[#00d084]" />
        Approved
      </span>
    );
  }
  if (status === "reviewed") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 ${sizeClasses}`}>
        <CheckCircle2 className="w-3 h-3 text-[#3D6B22]" />
        Reviewed
      </span>
    );
  }
  if (status === "pending_review") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses}`}>
        <Clock className="w-3 h-3 text-amber-600" />
        Pending Review
      </span>
    );
  }
  if (status === "in_review") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}>
        <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
        In Review
      </span>
    );
  }
  if (status === "correction_requested") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}>
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        Correction Requested
      </span>
    );
  }
  if (status === "escalated") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 ${sizeClasses}`}>
        <ShieldAlert className="w-3 h-3 text-purple-600" />
        Escalated (RN)
      </span>
    );
  }

  // Submission Statuses
  if (status === "resubmitted") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 ${sizeClasses}`}>
        <RefreshCw className="w-3 h-3 text-teal-600" />
        Resubmitted
      </span>
    );
  }
  if (status === "submitted") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 ${sizeClasses}`}>
        Submitted
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}>
        Draft / Missing
      </span>
    );
  }

  // Correction Statuses
  if (status === "awaiting_caregiver" || status === "open") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses}`}>
        <Clock className="w-3 h-3 text-amber-600" />
        Awaiting Caregiver
      </span>
    );
  }
  if (status === "resolved") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-[#008f5a] border border-emerald-200/80 ${sizeClasses}`}>
        <CheckCircle2 className="w-3 h-3 text-[#00d084]" />
        Resolved
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 ${sizeClasses}`}>
      {status}
    </span>
  );
}

interface QualityIndicatorProps {
  status: CareNoteQualityStatus;
  issueCount?: number;
}

export function CareNoteQualityIndicator({ status, issueCount = 0 }: QualityIndicatorProps) {
  switch (status) {
    case "complete":
      return (
        <span
          title="Documentation Quality Check"
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-[#008f5a] border border-emerald-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d084] shrink-0" />
          Complete
        </span>
      );
    case "missing_required":
      return (
        <span
          title="Documentation Quality Check"
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-rose-700 border border-rose-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          Missing Required
        </span>
      );
    case "incomplete":
      return (
        <span
          title="Documentation Quality Check"
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-amber-700 border border-amber-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          Incomplete
        </span>
      );
    case "review_required":
      return (
        <span
          title="Documentation Quality Check"
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-blue-700 border border-blue-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          Review Required
        </span>
      );
    case "flagged":
      return (
        <span
          title="Documentation Quality Check"
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-rose-700 border border-rose-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse shrink-0" />
          Flagged {issueCount > 0 ? `(${issueCount})` : ""}
        </span>
      );
    default:
      return (
        <span
          title="Documentation Quality Check"
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white text-slate-700 border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          {status}
        </span>
      );
  }
}
