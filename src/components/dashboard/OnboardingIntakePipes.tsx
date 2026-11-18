"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Inbox, ArrowRight, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { computeDashboardMetrics } from "@/lib/dashboard/metricsEngine";

interface FunnelStage {
  name: string;
  count: number;
  pctOfTop: number;
  color: string;
  href: string;
}

export function OnboardingIntakePipes() {
  const router = useRouter();
  const metrics = useMemo(() => computeDashboardMetrics(), []);

  const caregiverFunnel: FunnelStage[] = [
    { name: "Applied", count: metrics.caregiverFunnel.applied, pctOfTop: 100, color: "bg-slate-300", href: "/caregivers?tab=applied" },
    { name: "Documents", count: metrics.caregiverFunnel.documents, pctOfTop: Math.round((metrics.caregiverFunnel.documents / metrics.caregiverFunnel.applied) * 100), color: "bg-blue-300", href: "/caregivers/onboarding?step=docs" },
    { name: "Screening & Training", count: metrics.caregiverFunnel.screeningAndTraining, pctOfTop: Math.round((metrics.caregiverFunnel.screeningAndTraining / metrics.caregiverFunnel.applied) * 100), color: "bg-teal-400", href: "/caregivers/onboarding?step=screening" },
    { name: "Authorised", count: metrics.caregiverFunnel.authorised, pctOfTop: Math.round((metrics.caregiverFunnel.authorised / metrics.caregiverFunnel.applied) * 100), color: "bg-emerald-500", href: "/caregivers?status=authorized" },
    { name: "Active", count: metrics.caregiverFunnel.active, pctOfTop: Math.round((metrics.caregiverFunnel.active / metrics.caregiverFunnel.applied) * 100), color: "bg-[#3D6B22]", href: "/caregivers?status=active" },
  ];

  const familyPipeline: FunnelStage[] = [
    { name: "New Lead", count: metrics.familyPipeline.newLead, pctOfTop: 100, color: "bg-indigo-300", href: "/intake/pipeline?stage=new" },
    { name: "Contacted", count: metrics.familyPipeline.contacted, pctOfTop: Math.round((metrics.familyPipeline.contacted / metrics.familyPipeline.newLead) * 100), color: "bg-blue-400", href: "/intake/pipeline?stage=contacted" },
    { name: "In Assessment", count: metrics.familyPipeline.inAssessment, pctOfTop: Math.round((metrics.familyPipeline.inAssessment / metrics.familyPipeline.newLead) * 100), color: "bg-amber-400", href: "/intake/pipeline?stage=assessment" },
    { name: "CM Coordination", count: metrics.familyPipeline.cmCoordination, pctOfTop: Math.round((metrics.familyPipeline.cmCoordination / metrics.familyPipeline.newLead) * 100), color: "bg-emerald-400", href: "/intake/pipeline?stage=coordination" },
    { name: "Converted", count: metrics.familyPipeline.converted, pctOfTop: Math.round((metrics.familyPipeline.converted / metrics.familyPipeline.newLead) * 100), color: "bg-[#1B3414]", href: "/patients?status=admitted" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Onboarding Funnel (Caregiver Progression) */}
      <Card className="p-5 border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Onboarding Funnel</h3>
                <p className="text-xs text-slate-500">
                  Average <strong className="text-slate-800">14 days</strong> to activate (target: 11 days).
                </p>
              </div>
            </div>

            <Link
              href="/caregivers/onboarding"
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              Roster <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-[11px] text-slate-400 italic mt-2">
            Tracks caregiver recruitment, credentials, and activation velocity.
          </p>

          {/* Progressive Visual Bars */}
          <div className="space-y-3 mt-4">
            {caregiverFunnel.map((stage) => (
              <div
                key={stage.name}
                onClick={() => router.push(stage.href)}
                className="group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{stage.count}</span>
                    <span className="text-[10px] text-slate-400">caregivers</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${stage.pctOfTop}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Target conversion: <strong>25%</strong></span>
          <span className="text-emerald-700 font-bold">Current: 23.9% (Healthy)</span>
        </div>
      </Card>

      {/* Right Column: Intake Pipeline (Family Progression) */}
      <Card className="p-5 border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Intake Pipeline</h3>
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-800">79 active inquiries</strong> • 16 converted (20% conversion rate).
                </p>
              </div>
            </div>

            <Link
              href="/intake/pipeline"
              className="text-xs font-semibold text-[#3D6B22] hover:underline flex items-center gap-1"
            >
              Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-[11px] text-slate-400 italic mt-2">
            Tracks family inquiries, assessments, and case manager authorization.
          </p>

          {/* Progressive Visual Bars */}
          <div className="space-y-3 mt-4">
            {familyPipeline.map((stage) => (
              <div
                key={stage.name}
                onClick={() => router.push(stage.href)}
                className="group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 group-hover:text-[#3D6B22] transition-colors">
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{stage.count}</span>
                    <span className="text-[10px] text-slate-400">families</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${stage.pctOfTop}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Average Days to Admission: <strong>9.2 Days</strong></span>
          <span className="text-[#3D6B22] font-bold">20% Conversion</span>
        </div>
      </Card>
    </div>
  );
}
