"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, MapPin, Filter, Calendar } from "lucide-react";

import { AdminKpiRow } from "@/components/dashboard/AdminKpiRow";
import { NeedsYourAttentionCard } from "@/components/dashboard/NeedsYourAttentionCard";
import { OnboardingIntakePipes } from "@/components/dashboard/OnboardingIntakePipes";
import { AuthorizationsComplianceCard } from "@/components/dashboard/AuthorizationsComplianceCard";
import { InsightsLiveActivityFeed } from "@/components/dashboard/InsightsLiveActivityFeed";
import { AutomationSummaryCard } from "@/components/dashboard/AutomationSummaryCard";
import { AiBriefingDrawer } from "@/components/dashboard/AiBriefingDrawer";

type Perspective = "Executive" | "Onboarding" | "Compliance" | "Billing" | "Scheduler";

const PERSPECTIVES: { id: Perspective; label: string; description: string }[] = [
  { id: "Executive", label: "Executive", description: "Overall agency status and cross-role synchronization" },
  { id: "Onboarding", label: "Onboarding", description: "Family intake pipeline and caregiver onboarding funnel" },
  { id: "Compliance", label: "Compliance", description: "Expiring credentials, screening audits and regulatory safety" },
  { id: "Billing", label: "Billing", description: "Claims status, authorizations and revenue cycle risks" },
  { id: "Scheduler", label: "Scheduler", description: "Staffing coverage, EVV live activity and visit verification" },
];

export default function DashboardPage() {
  const [currentPerspective, setCurrentPerspective] = useState<Perspective>("Executive");
  const [isAiBriefingOpen, setIsAiBriefingOpen] = useState(false);

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 02. Page Header: Greeting • Date • AI Briefing + Perspective Switcher */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good morning, Sarah!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {today} • <span className="font-medium text-[#3D6B22]">Central Agency Operations</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/caregivers-tracker"
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-[#3D6B22]" />
              Track Caregivers
            </Link>

            <button
              onClick={() => setIsAiBriefingOpen(true)}
              className="flex items-center gap-2 bg-[#1B3414] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#274C1D] transition-colors shadow-sm shadow-[#1B3414]/20 whitespace-nowrap active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#93C573]" />
              AI Briefing
            </button>
          </div>
        </div>

        {/* Perspective Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
            Perspective:
          </span>
          {PERSPECTIVES.map((p) => (
            <button
              key={p.id}
              onClick={() => setCurrentPerspective(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentPerspective === p.id
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
              title={p.description}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 03. KPI Cards Strip */}
      <section aria-label="Key Performance Indicators">
        <AdminKpiRow />
      </section>

      {/* 04. Needs Your Attention (High-Priority Section) */}
      <section aria-label="Needs Your Attention">
        <NeedsYourAttentionCard />
      </section>

      {/* 05 & 06. Onboarding Funnel & Intake Pipeline */}
      {(currentPerspective === "Executive" || currentPerspective === "Onboarding") && (
        <section aria-label="Onboarding & Intake Pipeline">
          <OnboardingIntakePipes />
        </section>
      )}

      {/* 07 & 08. Authorizations & Compliance */}
      {(currentPerspective === "Executive" ||
        currentPerspective === "Compliance" ||
        currentPerspective === "Billing") && (
        <section aria-label="Authorizations & Compliance">
          <AuthorizationsComplianceCard />
        </section>
      )}

      {/* 09. Insights & Live Activity */}
      {(currentPerspective === "Executive" || currentPerspective === "Scheduler") && (
        <section aria-label="Operational Insights and Live Activity">
          <InsightsLiveActivityFeed />
        </section>
      )}

      {/* 10. Bottom Automation Summary */}
      <section aria-label="Automation Summary">
        <AutomationSummaryCard />
      </section>

      {/* AI Briefing Drawer */}
      <AiBriefingDrawer
        isOpen={isAiBriefingOpen}
        onClose={() => setIsAiBriefingOpen(false)}
      />
    </div>
  );
}
