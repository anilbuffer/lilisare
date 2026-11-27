"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Users,
  DollarSign,
  ShieldCheck,
  Calendar,
  Check,
} from "lucide-react";

interface OvertimeCaregiver {
  id: string;
  name: string;
  initials: string;
  totalHours: number;
  otHours: number;
  client: string;
  role: string;
  reassigned?: boolean;
}

interface WatchlistCaregiver {
  id: string;
  name: string;
  initials: string;
  currentHours: number;
  remainingHours: number;
  upcomingShift: string;
  client: string;
}

const INITIAL_OT_CAREGIVERS: OvertimeCaregiver[] = [
  {
    id: "cg-ot-1",
    name: "Jessica Miller",
    initials: "JM",
    totalHours: 42.5,
    otHours: 2.5,
    client: "Eleanor Vance (PT-101)",
    role: "HHA • Live-in",
    reassigned: false,
  },
  {
    id: "cg-ot-2",
    name: "Thomas Wright",
    initials: "TW",
    totalHours: 41.0,
    otHours: 1.0,
    client: "Arthur Davis (PT-104)",
    role: "CNA • Family Caregiver",
    reassigned: false,
  },
];

const WATCHLIST_CAREGIVERS: WatchlistCaregiver[] = [
  {
    id: "cg-wl-1",
    name: "Sarah Jenkins",
    initials: "SJ",
    currentHours: 38.5,
    remainingHours: 1.5,
    upcomingShift: "Friday shift (4h)",
    client: "Maya Lin (PT-102)",
  },
  {
    id: "cg-wl-2",
    name: "Marcus Turner",
    initials: "MT",
    currentHours: 37.5,
    remainingHours: 2.5,
    upcomingShift: "Saturday shift (5h)",
    client: "David Kim (PT-105)",
  },
  {
    id: "cg-wl-3",
    name: "Emily Rodriguez",
    initials: "ER",
    currentHours: 36.0,
    remainingHours: 4.0,
    upcomingShift: "Sunday shift (6h)",
    client: "Grace Hopper (PT-106)",
  },
];

export function CaregiverOvertime() {
  const [otList, setOtList] = useState<OvertimeCaregiver[]>(INITIAL_OT_CAREGIVERS);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleReassign = (caregiver: OvertimeCaregiver) => {
    setOtList((prev) =>
      prev.map((c) =>
        c.id === caregiver.id ? { ...c, reassigned: true, otHours: 0, totalHours: 40.0 } : c
      )
    );
    setActionNotice(
      `Shift reallocated for ${caregiver.name}: 2.5h reassigned to PRN pool. 0h overtime pending.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const activeOtCount = otList.filter((c) => !c.reassigned).length;
  const currentOtHours = otList
    .filter((c) => !c.reassigned)
    .reduce((acc, c) => acc + c.otHours, 0) + (activeOtCount === 0 ? 0 : 11.0); // 14.5 total agency pool
  const currentOtCost = (currentOtHours * 37.5).toFixed(2); // 1.5x average wage premium

  return (
    <Card className="flex flex-col w-full space-y-6">
      {/* 01. Full-Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Caregiver Overtime & Utilization
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/scheduling"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Open Scheduling Board
          </Link>

          <Link
            href="/admin/payroll"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#3D6B22] hover:text-[#274C1D] transition-colors"
          >
            Overtime Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 02. Four-Metric KPI Bar across full width */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total OT Hours</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight">{currentOtHours} hrs</div>
        </div>

        <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200/80">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold mb-2">
            <span>Est. Overtime Cost</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-700 tracking-tight">${currentOtCost}</div>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-2">
            <span>Exceeding 40h Limit</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-900 tracking-tight">{activeOtCount} caregivers</div>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-2">
            <span>Approaching (36-40h)</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-950 tracking-tight">5 staff</div>
        </div>
      </div>

      {/* 03. Two-Column Operational Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
        {/* Left Column: Active Breaches (Requires Immediate Reassignment) */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Active Overtime Breaches ({activeOtCount})
              </span>
              <span className="text-[11px] text-slate-400">Reassign to PRN pool</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto thin-scrollbar pr-1.5">
              {otList.map((caregiver) => (
                <div
                  key={caregiver.id}
                  className={`p-3.5 rounded-xl border transition-all ${caregiver.reassigned
                    ? "bg-slate-50/60 border-slate-200 opacity-60"
                    : "bg-rose-50/50 border-rose-200/80 hover:border-rose-300"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar fallback={caregiver.initials} name={caregiver.name} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900">{caregiver.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{caregiver.role}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {caregiver.client}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {caregiver.reassigned ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" /> Reassigned
                        </span>
                      ) : (
                        <>
                          <div className="text-right">
                            <span className="text-xs font-bold text-rose-700 block">
                              {caregiver.totalHours} hrs
                            </span>
                            <span className="text-[10px] font-semibold text-rose-600 block">
                              +{caregiver.otHours}h OT
                            </span>
                          </div>
                          <button
                            onClick={() => handleReassign(caregiver)}
                            className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer active:scale-95"
                          >
                            Reassign
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>884 of 902 caregivers (98%) fully compliant within 40h weekly limit.</span>
          </div>
        </div>

        {/* Right Column: Approaching Limit Watchlist (36-40 Hours) */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Approaching 40h Limit (36–40h)
              </span>
              <span className="text-[11px] text-slate-400">Preventative management</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto thin-scrollbar pr-1.5">
              {WATCHLIST_CAREGIVERS.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar fallback={item.initials} name={item.name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 truncate">{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">
                          {item.currentHours}h
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.upcomingShift} • {item.client}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-[11px] font-bold text-amber-800 block">
                      {item.remainingHours}h remaining
                    </span>
                    <Link
                      href="/admin/scheduling"
                      className="text-[10px] text-[#3D6B22] font-semibold hover:underline inline-flex items-center gap-0.5 mt-0.5"
                    >
                      Adjust shift <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Overtime premiums are non-reimbursable under Medicaid waiver guidelines.</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
