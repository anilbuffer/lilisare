"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Zap, Clock, Bell, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { computeDashboardMetrics } from "@/lib/dashboard/metricsEngine";

export function AutomationSummaryCard() {
  const metrics = useMemo(() => computeDashboardMetrics(), []);

  return (
    <Card className="p-5 border-slate-200 bg-gradient-to-r from-[#1B3414] via-[#24461B] to-[#1B3414] text-white shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-[#93C573]/20 text-[#93C573] text-[10px] uppercase font-bold tracking-wider rounded-md border border-[#93C573]/30">
              LiliSphere Automation Engine
            </span>
            <span className="text-xs text-teal-200/80">• This week</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            Autonomous Care Operations
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Auto-nudge case managers for expirations, verify EVV GPS timestamps, scrub pre-billing batches, and dispatch training refreshers without manual intervention.
          </p>
        </div>

        {/* 3 Metric Stats */}
        <div className="flex items-center gap-4 sm:gap-8 shrink-0">
          <div className="text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#93C573] block leading-none">
              {metrics.automationSummary.tasksAutomatedThisWeek.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-300 mt-1 block">Tasks automated</span>
          </div>

          <div className="h-8 w-px bg-white/20 hidden sm:block" />

          <div className="text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 block leading-none">
              {metrics.automationSummary.remindersSentThisWeek.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-300 mt-1 block">Reminders sent</span>
          </div>

          <div className="h-8 w-px bg-white/20 hidden sm:block" />

          <div className="text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 block leading-none">
              {metrics.automationSummary.staffHoursSavedThisWeek}h
            </span>
            <span className="text-[11px] text-slate-300 mt-1 block">Staff hours saved</span>
          </div>
        </div>

        {/* Action Link */}
        <div className="shrink-0 flex items-center">
          <Link
            href="/automation"
            className="w-full md:w-auto px-4 py-2.5 bg-white text-[#1B3414] hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            View automation rules
            <ArrowRight className="w-4 h-4 text-[#3D6B22]" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
