"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { AlertTriangle, CheckCircle2, ArrowRight, UserX, Clock } from "lucide-react";

export function CaregiverOvertime() {
  return (
    <Card className="flex flex-col h-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Caregiver Overtime</h3>
            <p className="text-xs text-slate-500">40-Hour Medicaid cap & payroll protection</p>
          </div>
        </div>

        <Link
          href="/scheduling"
          className="text-xs font-semibold text-[#3D6B22] hover:text-[#274C1D] flex items-center gap-1 transition-colors"
        >
          Schedule <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5 my-3.5 flex-1">
        {/* Caregiver Alert 1 */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar fallback="JM" name="Jessica Miller" size="sm" />
            <div className="truncate">
              <div className="font-semibold text-xs text-slate-900">Jessica Miller</div>
              <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 42.5 hrs (+2.5 hrs OT)
              </div>
            </div>
          </div>
          <Link
            href="/scheduling"
            className="text-[11px] font-bold text-rose-700 hover:underline bg-white px-2 py-1 rounded-lg border border-rose-200 shadow-2xs shrink-0"
          >
            Reassign
          </Link>
        </div>

        {/* Caregiver Alert 2 */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar fallback="TW" name="Thomas Wright" size="sm" />
            <div className="truncate">
              <div className="font-semibold text-xs text-slate-900">Thomas Wright</div>
              <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 41.0 hrs (+1.0 hr OT)
              </div>
            </div>
          </div>
          <Link
            href="/scheduling"
            className="text-[11px] font-bold text-rose-700 hover:underline bg-white px-2 py-1 rounded-lg border border-rose-200 shadow-2xs shrink-0"
          >
            Reassign
          </Link>
        </div>

        {/* Healthy Indicator */}
        <div className="bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>98% of active caregivers under 40 hours</span>
        </div>
      </div>

      {/* Metrics footer */}
      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>Total Overtime Hours</span>
          <span className="font-bold text-slate-900">14.5 hrs</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Estimated Overtime Cost</span>
          <span className="font-bold text-rose-600">$543.75</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Approaching Limit (36-40 hrs)</span>
          <span className="font-bold text-amber-700">5 caregivers</span>
        </div>
      </div>
    </Card>
  );
}
