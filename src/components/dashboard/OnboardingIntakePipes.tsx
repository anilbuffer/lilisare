"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Inbox, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { computeDashboardMetrics, DashboardMetricsSummary } from "@/lib/dashboard/metricsEngine";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";

interface FunnelStage {
  name: string;
  count: number;
  pctOfTop: number;
  color: string;
  href: string;
}

interface OnboardingIntakePipesProps {
  metrics?: DashboardMetricsSummary;
}

export function OnboardingIntakePipes({ metrics: propMetrics }: OnboardingIntakePipesProps) {
  const router = useRouter();
  const [internalMetrics, setInternalMetrics] = useState<DashboardMetricsSummary>(computeDashboardMetrics);

  useEffect(() => {
    setInternalMetrics(computeDashboardMetrics());
    const unsubscribe = subscribeToIntakeSync(() => {
      setInternalMetrics(computeDashboardMetrics());
    });
    return unsubscribe;
  }, []);

  const metrics = propMetrics || internalMetrics;

  // LiliSare Brand Palette Progression (Soft Sage Mist -> Sage -> Foliage -> Deep Forest)
  const caregiverFunnel: FunnelStage[] = [
    {
      name: "Applied",
      count: metrics.caregiverFunnel.applied,
      pctOfTop: 100,
      color: "bg-[#C2D9C8]",
      href: "/caregivers?tab=applied",
    },
    {
      name: "Documents",
      count: metrics.caregiverFunnel.documents,
      pctOfTop: Math.round((metrics.caregiverFunnel.documents / metrics.caregiverFunnel.applied) * 100),
      color: "bg-[#93C573]",
      href: "/caregivers/onboarding?step=docs",
    },
    {
      name: "Screening & Training",
      count: metrics.caregiverFunnel.screeningAndTraining,
      pctOfTop: Math.round((metrics.caregiverFunnel.screeningAndTraining / metrics.caregiverFunnel.applied) * 100),
      color: "bg-[#5B8E32]",
      href: "/caregivers/onboarding?step=screening",
    },
    {
      name: "Authorised",
      count: metrics.caregiverFunnel.authorised,
      pctOfTop: Math.round((metrics.caregiverFunnel.authorised / metrics.caregiverFunnel.applied) * 100),
      color: "bg-[#3D6B22]",
      href: "/caregivers?status=authorized",
    },
    {
      name: "Active",
      count: metrics.caregiverFunnel.active,
      pctOfTop: Math.round((metrics.caregiverFunnel.active / metrics.caregiverFunnel.applied) * 100),
      color: "bg-[#1B3414]",
      href: "/caregivers?status=active",
    },
  ];

  // LiliSare Family Intake Pipeline (Sage Mist -> Light Sage -> Honey Amber -> Foliage -> Deep Forest)
  const familyPipeline: FunnelStage[] = [
    {
      name: "New Lead",
      count: metrics.familyPipeline.newLead,
      pctOfTop: 100,
      color: "bg-[#C2D9C8]",
      href: "/intake/pipeline?stage=new",
    },
    {
      name: "Contacted",
      count: metrics.familyPipeline.contacted,
      pctOfTop: Math.round((metrics.familyPipeline.contacted / metrics.familyPipeline.newLead) * 100),
      color: "bg-[#93C573]",
      href: "/intake/pipeline?stage=contacted",
    },
    {
      name: "In Assessment",
      count: metrics.familyPipeline.inAssessment,
      pctOfTop: Math.round((metrics.familyPipeline.inAssessment / metrics.familyPipeline.newLead) * 100),
      color: "bg-[#D99B26]",
      href: "/intake/pipeline?stage=assessment",
    },
    {
      name: "CM Coordination",
      count: metrics.familyPipeline.cmCoordination,
      pctOfTop: Math.round((metrics.familyPipeline.cmCoordination / metrics.familyPipeline.newLead) * 100),
      color: "bg-[#3D6B22]",
      href: "/intake/pipeline?stage=coordination",
    },
    {
      name: "Converted",
      count: metrics.familyPipeline.converted,
      pctOfTop: Math.round((metrics.familyPipeline.converted / metrics.familyPipeline.newLead) * 100),
      color: "bg-[#1B3414]",
      href: "/clients?status=Onboarding",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
      {/* Left Column: Onboarding Funnel (Caregiver Progression) */}
      <Card className="p-5 border border-slate-200 hover:border-[#3D6B22]/50 bg-white rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-[#3D6B22] rounded-xl shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">Onboarding Funnel</h3>
              </div>
            </div>

            <Link
              href="/caregivers/onboarding"
              className="text-xs font-semibold text-[#3D6B22] hover:text-[#1B3414] flex items-center gap-1 transition-colors"
            >
              Roster <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Thin, Sleek Progressive Visual Bars with LiliSare Brand Colors */}
          <div className="space-y-1">
            {caregiverFunnel.map((stage) => (
              <div
                key={stage.name}
                onClick={() => router.push(stage.href)}
                className="group cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 group-hover:text-[#3D6B22] transition-colors">
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{stage.count}</span>
                    <span className="text-[10px] text-slate-400">caregivers</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${stage.pctOfTop}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Target conversion: <strong>25%</strong></span>
          <span className="text-[#3D6B22] font-bold">Current: 23.9% (Healthy)</span>
        </div>
      </Card>

      {/* Right Column: Intake Pipeline (Family Progression) */}
      <Card className="p-5 border border-slate-200 hover:border-[#3D6B22]/50 bg-white rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-[#3D6B22] rounded-xl shrink-0">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">Intake Pipeline</h3>
              </div>
            </div>

            <Link
              href="/intake/pipeline"
              className="text-xs font-semibold text-[#3D6B22] hover:text-[#1B3414] flex items-center gap-1 transition-colors"
            >
              Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Thin, Sleek Progressive Visual Bars with LiliSare Brand Colors */}
          <div className="space-y-1">
            {familyPipeline.map((stage) => (
              <div
                key={stage.name}
                onClick={() => router.push(stage.href)}
                className="group cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 group-hover:text-[#3D6B22] transition-colors">
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{stage.count}</span>
                    <span className="text-[10px] text-slate-400">families</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${stage.pctOfTop}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Average Days to Admission: <strong>9.2 Days</strong></span>
          <span className="text-[#3D6B22] font-bold">20% Conversion</span>
        </div>
      </Card>
    </div>
  );
}
