"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Check 
} from "lucide-react";
import { Card } from "@/components/ui/Card";

interface AttentionItem {
  id: string;
  issue: string;
  impact?: string;
  status: "Immediate" | "Action required" | "Overdue" | "At risk" | "Pending" | "Delayed";
  actionLabel: string;
  owner: string;
  nextAction: string;
  targetHref: string;
  severity: "critical" | "warning" | "info";
}

const INITIAL_ITEMS: AttentionItem[] = [
  {
    id: "att-1",
    issue: "6 caregivers working without approval",
    impact: "Payment at risk",
    status: "Immediate",
    actionLabel: "Send follow-ups",
    owner: "Dana Jenkins (Ops)",
    nextAction: "Push Case Manager authorization approval",
    targetHref: "/billing/authorizations",
    severity: "critical",
  },
  {
    id: "att-2",
    issue: "3 screening results flagged for internal review",
    impact: "Background check",
    status: "Action required",
    actionLabel: "Review",
    owner: "Compliance Officer",
    nextAction: "Adjudicate background screening results",
    targetHref: "/compliance",
    severity: "critical",
  },
  {
    id: "att-3",
    issue: "8 caregiver credentials expired",
    impact: "CPR / TB renewal",
    status: "Overdue",
    actionLabel: "Review",
    owner: "HR Staff / LMS",
    nextAction: "Suspend scheduling until CPR/TB renewed",
    targetHref: "/compliance",
    severity: "critical",
  },
  {
    id: "att-4",
    issue: "14 EVV visits at risk",
    impact: "Missing clock-out / GPS",
    status: "At risk",
    actionLabel: "Review",
    owner: "Dispatch Supervisor",
    nextAction: "Verify manual punch before pre-billing scrub",
    targetHref: "/evv-monitoring",
    severity: "warning",
  },
  {
    id: "att-5",
    issue: "24 care notes awaiting audit",
    impact: "AI wording ready",
    status: "Pending",
    actionLabel: "Open queue",
    owner: "Clinical Supervisor (RN)",
    nextAction: "Approve AI-assisted shift notes",
    targetHref: "/clinical/visit-notes",
    severity: "warning",
  },
  {
    id: "att-6",
    issue: "11 households stuck in onboarding",
    impact: "Over 5 days delayed",
    status: "Delayed",
    actionLabel: "View",
    owner: "Intake Coordinator",
    nextAction: "Reach out to guardian for missing intake docs",
    targetHref: "/households",
    severity: "info",
  },
];

const getInitials = (name: string) => {
  if (name.includes("Dana Jenkins")) return "DJ";
  const words = name.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export function NeedsYourAttentionCard() {
  const router = useRouter();
  const [items, setItems] = useState<AttentionItem[]>(INITIAL_ITEMS);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleResolve = (e: React.MouseEvent, id: string, label: string) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((item) => item.id !== id));
    setActionNotice(`Resolved: "${label}" moved to completed tasks.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAction = (e: React.MouseEvent, item: AttentionItem) => {
    e.stopPropagation();
    if (item.actionLabel === "Send follow-ups") {
      setActionNotice(`Triggered automated outreach to Case Managers for item: ${item.issue}`);
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      router.push(item.targetHref);
    }
  };

  const getStatusBadge = (status: AttentionItem["status"]) => {
    switch (status) {
      case "Immediate":
      case "Overdue":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "Action required":
      case "At risk":
        return "bg-amber-50 text-amber-800 border-amber-200/80";
      case "Pending":
        return "bg-sky-50 text-sky-700 border-sky-200/80";
      case "Delayed":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200/80";
    }
  };

  return (
    <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Needs Your Attention</h3>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                {items.length} priority {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              High-priority operational bottlenecks requiring immediate administrative action.
            </p>
          </div>
        </div>

        {actionNotice && (
          <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{actionNotice}</span>
          </div>
        )}
      </div>

      {/* Priority List */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-slate-700">All priority items resolved!</p>
          <p className="text-xs text-slate-500 mt-0.5">The agency is running smoothly with no active blockers.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Column Headers (Desktop) */}
          <div className="hidden lg:flex items-center justify-between gap-4 px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <div className="w-32 shrink-0">Priority</div>
            <div className="flex-1 min-w-0 pr-4">Operational Bottleneck</div>
            <div className="w-44 shrink-0">Assignee</div>
            <div className="shrink-0 w-44 text-right pr-9">Action</div>
          </div>

          <div className="divide-y divide-slate-100/70 max-h-96 overflow-y-auto thin-scrollbar pr-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(item.targetHref)}
                className="py-3 px-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-all cursor-pointer group"
              >
                {/* Priority Badge */}
                <div className="w-32 shrink-0 flex items-center">
                  <span
                    className={`w-full text-center px-2 py-1 text-[10px] font-bold rounded-lg border tracking-wider uppercase ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Bottleneck / Issue & Next Action */}
                <div className="flex-1 min-w-0 pr-0 lg:pr-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                    {item.issue}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
                    {item.impact && (
                      <>
                        <span className="text-slate-600 font-medium shrink-0">{item.impact}</span>
                        <span className="text-slate-300">•</span>
                      </>
                    )}
                    <span className="truncate">{item.nextAction}</span>
                  </p>
                  {/* Mobile / Tablet Assignee */}
                  <div className="flex lg:hidden items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="font-medium text-slate-700">{item.owner}</span>
                  </div>
                </div>

                {/* Assignee (Desktop) */}
                <div className="hidden lg:flex items-center gap-2.5 w-44 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 text-[10px] font-bold shrink-0">
                    {getInitials(item.owner)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{item.owner}</p>
                    <p className="text-[10px] text-slate-400 truncate">Assignee</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 w-auto lg:w-44 self-end lg:self-center">
                  <button
                    onClick={(e) => handleAction(e, item)}
                    className="px-3.5 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer"
                  >
                    {item.actionLabel}
                    <ArrowRight className="w-3.5 h-3.5 text-[#93C573]" />
                  </button>

                  <button
                    onClick={(e) => handleResolve(e, item.id, item.issue)}
                    title="Mark as resolved"
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
