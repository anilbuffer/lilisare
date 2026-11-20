"use client";

import React from "react";
import { Sparkles, X, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Clock, Users } from "lucide-react";
import Link from "next/link";

interface AiBriefingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiBriefingDrawer({ isOpen, onClose }: AiBriefingDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1B3414] to-[#2D5422] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl text-[#93C573]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">LiliSare AI Executive Briefing</h2>
              <p className="text-xs text-teal-100">Synthesized Daily Operational Summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Key Summary */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Agency Operations Status: Healthy (94.2%)
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Good morning Sarah. Today you have <strong>48 active shifts</strong> scheduled across 38 caregivers. EVV on-time clock-in rate is holding strong at <strong>98.5%</strong>.
            </p>
          </div>

          {/* Action Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Top 3 Critical Action Items Today
            </h4>

            {/* Item 1 */}
            <div className="p-3.5 bg-rose-50/80 rounded-xl border border-rose-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Case Manager Authorizations
                </span>
                <span className="text-[10px] bg-rose-200/70 text-rose-800 font-bold px-2 py-0.5 rounded">
                  4 Overdue
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Authorizations for <strong>Child A (Leo Miller)</strong> and 3 others have been awaiting State DHS approval for &gt;7 days.
              </p>
              <Link
                href="/billing/authorizations"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 hover:underline pt-1"
              >
                Send Nudge to Case Manager Dana <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Item 2 */}
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Credential Expirations
                </span>
                <span className="text-[10px] bg-amber-200/70 text-amber-800 font-bold px-2 py-0.5 rounded">
                  8 Expired
                </span>
              </div>
              <p className="text-xs text-slate-700">
                8 caregivers have expired CPR or TB tests. Automated renewal SMS was sent, but scheduling blocks are pending your review.
              </p>
              <Link
                href="/compliance"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline pt-1"
              >
                Review Compliance Roster <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Item 3 */}
            <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" /> Intake to Activation Velocity
                </span>
                <span className="text-[10px] bg-blue-200/70 text-blue-800 font-bold px-2 py-0.5 rounded">
                  11 Households
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Family-centred care onboarding is averaging 14 days. 11 households are currently delayed waiting for signed guardian consent forms.
              </p>
              <Link
                href="/households"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 hover:underline pt-1"
              >
                Inspect Delayed Households <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Updated 2 minutes ago</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1B3414] hover:bg-[#274C1D] text-white rounded-xl text-xs font-bold transition-colors"
          >
            Acknowledge Briefing
          </button>
        </div>
      </div>
    </div>
  );
}
