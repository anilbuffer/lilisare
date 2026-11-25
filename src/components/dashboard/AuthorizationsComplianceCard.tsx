"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ClipboardCheck, ShieldCheck, ArrowRight, AlertCircle, Clock, Send, Eye, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { computeDashboardMetrics, DashboardMetricsSummary } from "@/lib/dashboard/metricsEngine";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";

interface OverdueAuth {
  clientCode: string;
  caseManagerCode: string;
  delayDays: number;
}

interface ComplianceAlert {
  caregiverCode: string;
  credential: string;
  status: string;
  isExpired: boolean;
}

const OVERDUE_AUTHS: OverdueAuth[] = [
  { clientCode: "Client PT-101", caseManagerCode: "CM-01 (Dana)", delayDays: 14 },
  { clientCode: "Client PT-102", caseManagerCode: "CM-01 (Dana)", delayDays: 9 },
  { clientCode: "Client PT-103", caseManagerCode: "CM-02 (Robert)", delayDays: 7 },
];

const COMPLIANCE_ITEMS: ComplianceAlert[] = [
  { caregiverCode: "CG-101", credential: "CPR / First Aid", status: "Expired", isExpired: true },
  { caregiverCode: "CG-102", credential: "Driving Record", status: "Expired 21d", isExpired: true },
  { caregiverCode: "CG-103", credential: "TB Test", status: "12d left", isExpired: false },
];

interface AuthorizationsComplianceCardProps {
  metrics?: DashboardMetricsSummary;
}

export function AuthorizationsComplianceCard({ metrics: propMetrics }: AuthorizationsComplianceCardProps) {
  const [followupStatus, setFollowupStatus] = useState<string | null>(null);
  const [internalMetrics, setInternalMetrics] = useState<DashboardMetricsSummary>(() => computeDashboardMetrics(true));

  useEffect(() => {
    setInternalMetrics(computeDashboardMetrics());
    const unsubscribe = subscribeToIntakeSync(() => {
      setInternalMetrics(computeDashboardMetrics());
    });
    return unsubscribe;
  }, []);

  const metrics = propMetrics || internalMetrics;

  const handleSendFollowup = (clientCode: string, cmCode: string) => {
    setFollowupStatus(`Sent priority nudge to ${cmCode} regarding ${clientCode}`);
    setTimeout(() => setFollowupStatus(null), 3500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
      {/* Left: Authorizations Card */}
      <Card className="flex flex-col justify-between space-y-5">
        <div>
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 bg-amber-50 text-amber-700 rounded-xl shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-base">Authorizations</h3>
              </div>
            </div>

            <Link
              href="/billing/authorizations"
              className="text-xs font-semibold text-[#3D6B22] hover:text-[#274C1D] flex items-center gap-1 shrink-0 whitespace-nowrap transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Status Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 text-center">
            <div className="p-2 sm:p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-700 block truncate">Approved</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-950 mt-0.5 block">{metrics.authorizationsBreakdown.approved}</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-700 block truncate">Awaiting State</span>
              <span className="text-base sm:text-lg font-extrabold text-amber-950 mt-0.5 block">{metrics.authorizationsBreakdown.awaitingState}</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-rose-700 block truncate">Overdue</span>
              <span className="text-base sm:text-lg font-extrabold text-rose-950 mt-0.5 block">{metrics.authorizationsBreakdown.overdue}</span>
            </div>
          </div>

          {followupStatus && (
            <div className="mt-3 p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{followupStatus}</span>
            </div>
          )}

          {/* Overdue List */}
          <div className="mt-5 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Urgent Follow-ups Required
            </span>
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto thin-scrollbar pr-1.5">
              {OVERDUE_AUTHS.map((item) => (
                <div key={item.clientCode} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800">{item.clientCode}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-slate-500">{item.caseManagerCode}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded text-[11px] whitespace-nowrap">
                      {item.delayDays} days delay
                    </span>
                    <button
                      onClick={() => handleSendFollowup(item.clientCode, item.caseManagerCode)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-amber-700" /> Send Follow-up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>De-identified audit protection active</span>
          <span>Target resolution: &lt; 5 days</span>
        </div>
      </Card>

      {/* Right: Compliance Card */}
      <Card className="flex flex-col justify-between space-y-5">
        <div>
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 bg-rose-50 text-rose-700 rounded-xl shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-base">Documentation & Compliance</h3>
              </div>
            </div>

            <Link
              href="/compliance"
              className="text-xs font-semibold text-[#3D6B22] hover:text-[#274C1D] flex items-center gap-1 shrink-0 whitespace-nowrap transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Documentation & Compliance Triad Pills */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 text-center">
            <Link
              href="/clinical/visit-notes"
              className="p-2 sm:p-2.5 bg-amber-50 hover:bg-amber-100/80 rounded-xl border border-amber-200 transition-colors block"
            >
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-700 block truncate">Overdue Notes</span>
              <span className="text-base sm:text-lg font-extrabold text-amber-950 mt-0.5 block">12</span>
            </Link>
            <div className="p-2 sm:p-2.5 bg-amber-50/70 rounded-xl border border-amber-200">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-700 block truncate">Unsigned Orders</span>
              <span className="text-base sm:text-lg font-extrabold text-amber-950 mt-0.5 block">5</span>
            </div>
            <Link
              href="/compliance"
              className="p-2 sm:p-2.5 bg-rose-50 hover:bg-rose-100/80 rounded-xl border border-rose-200 transition-colors block"
            >
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-rose-700 block truncate">Staff Licenses</span>
              <span className="text-base sm:text-lg font-extrabold text-rose-950 mt-0.5 block">8</span>
            </Link>
          </div>

          <div className="mt-5 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Expiring & Overdue Roster
            </span>
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto thin-scrollbar pr-1.5">
              {COMPLIANCE_ITEMS.map((item) => (
                <div key={item.caregiverCode} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900">{item.caregiverCode}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="font-medium text-slate-700">{item.credential}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap ${item.isExpired
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                    >
                      {item.status}
                    </span>
                    <Link
                      href="/compliance"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-slate-500" /> View Credentials
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Automated reminders queued: <strong>14</strong></span>
          <span className="text-rose-700 font-bold">Action required for 8</span>
        </div>
      </Card>
    </div>
  );
}
