"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Calendar } from "lucide-react";

import { AdminKpiRow } from "@/components/dashboard/AdminKpiRow";
import { NeedsYourAttentionCard } from "@/components/dashboard/NeedsYourAttentionCard";
import { VisitsChart } from "@/components/dashboard/VisitsChart";
import { EvvCompliance } from "@/components/dashboard/EvvCompliance";
import { OnboardingIntakePipes } from "@/components/dashboard/OnboardingIntakePipes";
import { AuthorizationsComplianceCard } from "@/components/dashboard/AuthorizationsComplianceCard";
import { CaregiverOvertime } from "@/components/dashboard/CaregiverOvertime";
import { FinancialHealth } from "@/components/dashboard/FinancialHealth";
import { PatientSatisfaction } from "@/components/dashboard/PatientSatisfaction";
import { InsightsLiveActivityFeed } from "@/components/dashboard/InsightsLiveActivityFeed";
import { AiBriefingDrawer } from "@/components/dashboard/AiBriefingDrawer";
import { computeDashboardMetrics, DashboardMetricsSummary } from "@/lib/dashboard/metricsEngine";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";

export default function DashboardPage() {
  const [isAiBriefingOpen, setIsAiBriefingOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetricsSummary>(() => computeDashboardMetrics(true));

  useEffect(() => {
    setMetrics(computeDashboardMetrics());
    const unsubscribe = subscribeToIntakeSync(() => {
      setMetrics(computeDashboardMetrics());
    });
    return unsubscribe;
  }, []);

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-14 animate-in fade-in duration-300">
      {/* 01 & 02. Page Header: Greeting • Date • AI Briefing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Good morning, Sarah!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span suppressHydrationWarning className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {today}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/caregivers-tracker"
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-[0_6px_32px_rgba(0,0,0,0.06)]"
          >
            <MapPin className="w-3.5 h-3.5 text-[#3D6B22]" />
            Track Caregivers
          </Link>

          <button
            onClick={() => setIsAiBriefingOpen(true)}
            className="flex items-center gap-2 bg-[#1B3414] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#274C1D] transition-colors shadow-sm shadow-[#1B3414]/20 whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#93C573]" />
            AI Briefing
          </button>
        </div>
      </div>

      {/* 03. KPI Cards Strip */}
      <section aria-label="Key Performance Indicators">
        <AdminKpiRow metrics={metrics} />
      </section>

      {/* 04. Needs Your Attention (High-Priority Action Queue) */}
      <section aria-label="Needs Your Attention">
        <NeedsYourAttentionCard />
      </section>

      {/* 05. Care Delivery & EVV Operations (Visits & EVV Verification) */}
      <section aria-label="Care Delivery and EVV Compliance" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <VisitsChart />
        <EvvCompliance />
      </section>

      {/* 06. Onboarding Funnel & Intake Pipeline */}
      <section aria-label="Onboarding & Intake Pipeline">
        <OnboardingIntakePipes metrics={metrics} />
      </section>

      {/* 07. Authorizations & Compliance Cards in one full row */}
      <section aria-label="Authorizations and Compliance">
        <AuthorizationsComplianceCard metrics={metrics} />
      </section>

      {/* 08. Caregiver Overtime Cards: Full one row */}
      <section aria-label="Caregiver Overtime and Utilization">
        <CaregiverOvertime />
      </section>

      {/* 09. Revenue Cycle & Client/Family Sentiment */}
      <section aria-label="Financial Health and Family Satisfaction" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <FinancialHealth />
        <PatientSatisfaction />
      </section>

      {/* 10. Operational Intelligence & Live Activity Feed */}
      <section aria-label="Operational Insights and Live Activity">
        <InsightsLiveActivityFeed />
      </section>

      {/* AI Briefing Drawer */}
      <AiBriefingDrawer
        isOpen={isAiBriefingOpen}
        onClose={() => setIsAiBriefingOpen(false)}
      />
    </div>
  );
}
