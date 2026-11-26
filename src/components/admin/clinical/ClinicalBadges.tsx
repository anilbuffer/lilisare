"use client";

import React from "react";
import {
  ClinicalReviewStatus,
  ClinicalVisitStatus,
  DocumentationStatus,
  PriorityLevel,
  RequirementStatus,
  VisitDeliveryMethod,
} from "@/types/clinicalSupervisory";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  PauseCircle,
  RefreshCw,
  ShieldAlert,
  Video,
  Home,
  Globe,
  XCircle,
  FileEdit,
} from "lucide-react";

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function RequirementStatusBadge({ status }: { status: RequirementStatus }) {
  const styles: Record<RequirementStatus, { cls: string; icon: React.ReactNode }> = {
    Active: {
      cls: "bg-emerald-50 text-[#3D6B22] border-emerald-200/90",
      icon: <CheckCircle2 className="w-3 h-3 text-[#3D6B22]" />,
    },
    "Pending Assignment": {
      cls: "bg-amber-50 text-amber-800 border-amber-200/90",
      icon: <AlertTriangle className="w-3 h-3 text-[#fcb900]" />,
    },
    Scheduled: {
      cls: "bg-sky-50 text-sky-800 border-sky-200/90",
      icon: <Calendar className="w-3 h-3 text-sky-600" />,
    },
    "Due Soon": {
      cls: "bg-amber-50 text-amber-800 border-amber-200/90",
      icon: <Clock className="w-3 h-3 text-[#F2B632]" />,
    },
    Overdue: {
      cls: "bg-orange-50 text-[#c2410c] border-orange-200/90",
      icon: <AlertCircle className="w-3 h-3 text-[#ff6900]" />,
    },
    Completed: {
      cls: "bg-emerald-50 text-[#008f5a] border-emerald-200/90",
      icon: <CheckCircle2 className="w-3 h-3 text-[#00d084]" />,
    },
    "On Hold": {
      cls: "bg-slate-100 text-slate-700 border-slate-200/90",
      icon: <PauseCircle className="w-3 h-3 text-slate-500" />,
    },
    "Not Required": {
      cls: "bg-slate-50 text-slate-600 border-slate-200/90",
      icon: <Clock className="w-3 h-3 text-slate-400" />,
    },
    Cancelled: {
      cls: "bg-rose-50 text-rose-700 border-rose-200/90",
      icon: <XCircle className="w-3 h-3 text-rose-500" />,
    },
    Draft: {
      cls: "bg-slate-100 text-slate-600 border-slate-200/90",
      icon: <FileEdit className="w-3 h-3 text-slate-500" />,
    },
  };
  const cfg = styles[status] || styles.Active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${cfg.cls}`}>
      {cfg.icon}
      <span>{status}</span>
    </span>
  );
}

export function ClinicalVisitStatusBadge({ status }: { status: ClinicalVisitStatus }) {
  const styles: Record<ClinicalVisitStatus, string> = {
    Scheduled: "bg-sky-50 text-sky-800 border-sky-200/90",
    "In Progress": "bg-indigo-50 text-indigo-800 border-indigo-200/90",
    Completed: "bg-emerald-50 text-[#008f5a] border-emerald-200/90",
    Missed: "bg-orange-50 text-[#c2410c] border-orange-200/90",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200/90",
    Rescheduled: "bg-amber-50 text-amber-800 border-amber-200/90",
    Unscheduled: "bg-slate-100 text-slate-700 border-slate-200/90",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${styles[status] || styles.Unscheduled}`}>
      {status === "Completed" && <CheckCircle2 className="w-3 h-3 text-[#00d084]" />}
      {status === "Missed" && <AlertCircle className="w-3 h-3 text-[#ff6900]" />}
      {status === "Scheduled" && <Calendar className="w-3 h-3 text-sky-600" />}
      {status === "Rescheduled" && <RefreshCw className="w-3 h-3 text-amber-600" />}
      <span>{status}</span>
    </span>
  );
}

export function DocumentationStatusBadge({ status }: { status: DocumentationStatus }) {
  const styles: Record<DocumentationStatus, { cls: string; dot: string }> = {
    "Not Started": { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" },
    Pending: { cls: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-[#fcb900]" },
    Submitted: { cls: "bg-sky-50 text-sky-800 border-sky-200", dot: "bg-sky-500" },
    Incomplete: { cls: "bg-orange-50 text-[#c2410c] border-orange-200", dot: "bg-[#ff6900]" },
    "Correction Requested": { cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
    Complete: { cls: "bg-emerald-50 text-[#008f5a] border-emerald-200", dot: "bg-[#00d084]" },
  };
  const cfg = styles[status] || styles["Not Started"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold whitespace-nowrap ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <span>{status}</span>
    </span>
  );
}

export function ClinicalReviewStatusBadge({ status }: { status: ClinicalReviewStatus }) {
  const styles: Record<ClinicalReviewStatus, { cls: string; icon: React.ReactNode }> = {
    "Not Required": {
      cls: "bg-slate-50 text-slate-600 border-slate-200",
      icon: null,
    },
    "Pending Review": {
      cls: "bg-amber-50 text-amber-800 border-amber-200",
      icon: <Clock className="w-3 h-3 text-[#fcb900]" />,
    },
    "Under Review": {
      cls: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <RefreshCw className="w-3 h-3 text-blue-600" />,
    },
    Approved: {
      cls: "bg-emerald-50 text-[#008f5a] border-emerald-200",
      icon: <CheckCircle2 className="w-3 h-3 text-[#00d084]" />,
    },
    "Follow-up Required": {
      cls: "bg-orange-50 text-[#c2410c] border-orange-200",
      icon: <AlertTriangle className="w-3 h-3 text-[#ff6900]" />,
    },
    "Returned for Correction": {
      cls: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <ShieldAlert className="w-3 h-3 text-rose-600" />,
    },
  };
  const cfg = styles[status] || styles["Pending Review"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${cfg.cls}`}>
      {cfg.icon}
      <span>{status}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const styles: Record<PriorityLevel, string> = {
    Critical: "bg-orange-50 text-[#c2410c] border-orange-200",
    High: "bg-amber-50 text-amber-800 border-amber-200",
    Medium: "bg-slate-100 text-slate-700 border-slate-200",
    Low: "bg-slate-50 text-slate-500 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${styles[priority]}`}>
      {priority}
    </span>
  );
}

export function DeliveryMethodBadge({ method }: { method: VisitDeliveryMethod }) {
  const icon =
    method === "Virtual" ? (
      <Video className="w-3 h-3 text-indigo-600" />
    ) : method === "In-home" ? (
      <Home className="w-3 h-3 text-[#3D6B22]" />
    ) : (
      <Globe className="w-3 h-3 text-slate-600" />
    );

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap">
      {icon}
      <span>{method}</span>
    </span>
  );
}

export function ClinicalAvatarName({
  name,
  variant = "client",
  highlightHover = false,
  fallbackText = "Unassigned",
  fallbackVariant = "warning",
}: {
  name?: string | null;
  variant?: "client" | "staff";
  highlightHover?: boolean;
  fallbackText?: string;
  fallbackVariant?: "warning" | "muted";
}) {
  if (!name || name === "Unassigned") {
    return (
      <span
        className={
          fallbackVariant === "warning"
            ? "font-bold text-[#ff6900]"
            : "font-semibold text-slate-400"
        }
      >
        {fallbackText}
      </span>
    );
  }

  const avatarCls =
    variant === "client"
      ? "bg-emerald-100/80 border-emerald-200/60 text-[#3D6B22]"
      : "bg-slate-100 border-slate-200/80 text-slate-600";

  const textCls =
    variant === "client"
      ? `font-semibold text-slate-900 ${highlightHover ? "group-hover:text-[#3D6B22] transition-colors" : ""}`
      : `font-medium text-slate-700 ${highlightHover ? "group-hover:text-[#3D6B22] transition-colors" : ""}`;

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 ${avatarCls}`}
      >
        {getInitials(name)}
      </div>
      <span className={`${textCls} truncate`}>{name}</span>
    </div>
  );
}
