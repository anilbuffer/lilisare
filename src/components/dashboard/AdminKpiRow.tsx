"use client";

import React from "react";
import Link from "next/link";
import {
  UserCheck,
  Clock,
  CalendarCheck,
  FileCheck2,
  CircleDollarSign,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DashboardMetricsSummary } from "@/lib/dashboard/metricsEngine";

interface SimpleKpi {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  borderHover: string;
  href: string;
}

interface AdminKpiRowProps {
  metrics?: DashboardMetricsSummary;
}

export function AdminKpiRow({ metrics }: AdminKpiRowProps) {
  const kpis: SimpleKpi[] = [
    {
      id: "referral-admission",
      label: "Referral-to-Admission",
      value: metrics?.strategicKpis?.referralToAdmissionRate?.rateFormatted || "72.4%",
      icon: UserCheck,
      iconBg: "bg-[#3D6B22]/10 border-[#3D6B22]/20",
      iconColor: "text-[#3D6B22]",
      borderHover: "hover:border-[#3D6B22]/50",
      href: "/admin/intake-referrals",
    },
    {
      id: "time-to-soc",
      label: "Time to Start of Care",
      value: metrics?.strategicKpis?.timeToStartOfCare?.averageFormatted || "38.5 hrs",
      icon: Clock,
      iconBg: "bg-teal-50 border-teal-200/80",
      iconColor: "text-teal-700",
      borderHover: "hover:border-teal-500/50",
      href: "/admin/dashboard",
    },
    {
      id: "visit-completion",
      label: "Visit Completion Rate",
      value: metrics?.strategicKpis?.visitCompletionRate?.rateFormatted || "96.0%",
      icon: CalendarCheck,
      iconBg: "bg-[#3D6B22]/10 border-[#3D6B22]/20",
      iconColor: "text-[#3D6B22]",
      borderHover: "hover:border-[#3D6B22]/50",
      href: "/admin/scheduling",
    },
    {
      id: "doc-compliance",
      label: "Doc & Compliance Status",
      value: metrics?.strategicKpis?.documentationAndCompliance?.scoreFormatted || "94.8%",
      icon: FileCheck2,
      iconBg: "bg-amber-50 border-amber-200/80",
      iconColor: "text-amber-700",
      borderHover: "hover:border-amber-400",
      href: "/admin/compliance",
    },
    {
      id: "revenue-health",
      label: "Revenue Health",
      value: metrics?.strategicKpis?.revenueHealth?.denialRateFormatted || "3.2%",
      icon: CircleDollarSign,
      iconBg: "bg-[#3D6B22]/10 border-[#3D6B22]/20",
      iconColor: "text-[#3D6B22]",
      borderHover: "hover:border-[#3D6B22]/50",
      href: "/admin/billing",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <Link
            key={kpi.id}
            href={kpi.href}
            className="group block focus:outline-none"
          >
            <Card
              className="h-full flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-2 sm:mb-3">
                <span className="text-xs font-medium text-slate-500 tracking-tight truncate pr-1">
                  {kpi.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${kpi.iconBg} ${kpi.iconColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <span
                    suppressHydrationWarning
                    className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 truncate"
                  >
                    {kpi.value}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-[#3D6B22] transition-opacity shrink-0 ml-1" />
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
