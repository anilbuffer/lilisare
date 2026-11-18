"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  MapPin, 
  FileText, 
  Home, 
  UserCheck, 
  Check, 
  X
} from "lucide-react";
import { Card } from "@/components/ui/Card";

interface AttentionItem {
  id: string;
  issue: string;
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
    issue: "6 caregivers working without approval – payment at risk",
    status: "Immediate",
    actionLabel: "Send follow-ups",
    owner: "Ops / Dana Jenkins",
    nextAction: "Push Case Manager authorization approval",
    targetHref: "/billing/authorizations",
    severity: "critical",
  },
  {
    id: "att-2",
    issue: "3 screening results flagged for internal review",
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
    status: "Overdue",
    actionLabel: "Review",
    owner: "HR Staff / LMS",
    nextAction: "Suspend scheduling until CPR/TB renewed",
    targetHref: "/compliance",
    severity: "critical",
  },
  {
    id: "att-4",
    issue: "14 EVV visits at risk – missing clock-out or GPS",
    status: "At risk",
    actionLabel: "Review",
    owner: "Dispatch Supervisor",
    nextAction: "Verify manual punch before pre-billing scrub",
    targetHref: "/evv-monitoring",
    severity: "warning",
  },
  {
    id: "att-5",
    issue: "24 care notes awaiting audit – AI wording ready",
    status: "Pending",
    actionLabel: "Open queue",
    owner: "Clinical Supervisor (RN)",
    nextAction: "Approve AI-assisted shift notes",
    targetHref: "/clinical/visit-notes",
    severity: "warning",
  },
  {
    id: "att-6",
    issue: "11 households stuck in onboarding over 5 days",
    status: "Delayed",
    actionLabel: "View",
    owner: "Intake Coordinator",
    nextAction: "Reach out to guardian for missing intake docs",
    targetHref: "/households",
    severity: "info",
  },
];

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
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      case "Action required":
      case "At risk":
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
      case "Pending":
      case "Delayed":
      default:
        return "bg-slate-100 text-slate-700 border-slate-300 font-semibold";
    }
  };

  return (
    <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
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
          <div className="hidden sm:flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{actionNotice}</span>
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
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(item.targetHref)}
              className="py-3 px-2 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3 flex-1">
                <span
                  className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-md border shrink-0 mt-0.5 ${getStatusBadge(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>

                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                    {item.issue}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-700">Owner:</span> {item.owner}
                    <span>•</span>
                    <span className="font-medium text-slate-700">Next Action:</span> {item.nextAction}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={(e) => handleAction(e, item)}
                  className="px-3 py-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1"
                >
                  {item.actionLabel}
                  <ArrowRight className="w-3.5 h-3.5 text-[#93C573]" />
                </button>

                <button
                  onClick={(e) => handleResolve(e, item.id, item.issue)}
                  title="Mark as resolved"
                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
