"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Users, Heart, ClipboardCheck, ShieldCheck, Home, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { computeDashboardMetrics } from "@/lib/dashboard/metricsEngine";

interface KpiData {
  id: string;
  label: string;
  value: string;
  supporting: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "forest" | "amber" | "coral";
  href: string;
}

export function AdminKpiRow() {
  const metrics = useMemo(() => computeDashboardMetrics(), []);

  const kpis: KpiData[] = [
    {
      id: "clients",
      label: "Active Clients",
      value: metrics.activeClients.count.toLocaleString(),
      supporting: metrics.activeClients.deltaText,
      icon: Users,
      tone: metrics.activeClients.tone,
      href: "/patients?status=active",
    },
    {
      id: "caregivers",
      label: "Active Caregivers",
      value: metrics.activeCaregivers.count.toLocaleString(),
      supporting: `${metrics.activeCaregivers.onboardingCount} in onboarding`,
      icon: Heart,
      tone: metrics.activeCaregivers.tone,
      href: "/caregivers?status=active",
    },
    {
      id: "authorizations",
      label: "Pending Authorisations",
      value: metrics.pendingAuthorisations.count.toLocaleString(),
      supporting: `${metrics.pendingAuthorisations.overdueCount} overdue`,
      icon: ClipboardCheck,
      tone: metrics.pendingAuthorisations.tone,
      href: "/billing/authorizations?tab=pending",
    },
    {
      id: "credentials",
      label: "Credentials Expiring",
      value: metrics.credentialsExpiring.count.toLocaleString(),
      supporting: `${metrics.credentialsExpiring.expiredCount} expired`,
      icon: ShieldCheck,
      tone: metrics.credentialsExpiring.tone,
      href: "/compliance?status=expiring",
    },
    {
      id: "households",
      label: "Households Stuck",
      value: metrics.householdsStuck.count.toLocaleString(),
      supporting: "More than 5 days delayed",
      icon: Home,
      tone: metrics.householdsStuck.tone,
      href: "/households?status=delayed",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        // Semantic Colors
        // Forest Green for normal, Amber for pending, Coral for urgent
        const toneStyles = {
          forest: {
            cardBorder: "border-slate-200 hover:border-[#3D6B22]/50",
            iconBg: "bg-[#3D6B22]/10 text-[#3D6B22]",
            supportingBadge: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
            valText: "text-slate-900",
          },
          amber: {
            cardBorder: "border-amber-200 hover:border-amber-400",
            iconBg: "bg-amber-100 text-amber-800",
            supportingBadge: "bg-amber-50 text-amber-800 border-amber-200/80 font-bold",
            valText: "text-amber-900",
          },
          coral: {
            cardBorder: "border-rose-200 hover:border-rose-400",
            iconBg: "bg-rose-100 text-rose-700",
            supportingBadge: "bg-rose-50 text-rose-700 border-rose-200/80 font-bold",
            valText: "text-rose-900",
          },
        }[kpi.tone];

        return (
          <Link key={kpi.id} href={kpi.href} className="group block focus:outline-none">
            <Card
              className={`p-4 h-full bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border ${toneStyles.cardBorder} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 tracking-tight truncate pr-1">
                    {kpi.label}
                  </span>
                  <div className={`p-1.5 rounded-lg shrink-0 ${toneStyles.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${toneStyles.valText}`}>
                    {kpi.value}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="mt-3">
                <span
                  className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full border ${toneStyles.supportingBadge}`}
                >
                  {kpi.supporting}
                </span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
