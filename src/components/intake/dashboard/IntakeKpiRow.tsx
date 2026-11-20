"use client";

import React from "react";
import Link from "next/link";
import {
  UserCheck,
  Clock,
  Inbox,
  Home,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

interface IntakeKpiRowProps {
  metrics: {
    totalInquiries: number;
    urgentInquiries: number;
    newLeads: number;
    converted: number;
    totalClients: number;
    onboardingClients: number;
    totalHouseholds: number;
    bottlenecks: number;
    totalCaregivers: number;
    caregiverClearedPct: number;
  };
}

export function IntakeKpiRow({ metrics }: IntakeKpiRowProps) {
  const conversionRate = metrics.totalInquiries > 0
    ? Math.round((metrics.converted / metrics.totalInquiries) * 100)
    : 72;

  const kpis = [
    {
      id: "conversion-rate",
      label: "Referral-to-Admission",
      value: `${conversionRate}%`,
      subtitle: `${metrics.converted} converted to care`,
      icon: UserCheck,
      iconBg: "bg-emerald-50",
      iconColor: "text-[#3D6B22]",
      borderHover: "hover:border-[#3D6B22]/50",
      href: "/intake/pipeline",
    },
    {
      id: "response-sla",
      label: "Avg. Triage Response",
      value: "14.2 min",
      subtitle: "< 15m hospital SLA compliant",
      icon: Clock,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-700",
      borderHover: "hover:border-teal-500/50",
      href: "/intake/inquiries",
    },
    {
      id: "active-inquiries",
      label: "Active Inquiries & Leads",
      value: `${metrics.totalInquiries}`,
      subtitle: `${metrics.urgentInquiries} urgent SLA triage`,
      icon: Inbox,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-700",
      borderHover: "hover:border-sky-500/50",
      href: "/intake/inquiries",
    },
    {
      id: "connected-households",
      label: "Connected Households",
      value: `${metrics.totalHouseholds}`,
      subtitle: metrics.bottlenecks > 0 ? `${metrics.bottlenecks} need coordination` : "All tracks synced",
      icon: Home,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-700",
      borderHover: "hover:border-purple-500/50",
      href: "/households",
    },
    {
      id: "caregiver-clearance",
      label: "Caregiver Readiness",
      value: `${metrics.caregiverClearedPct}%`,
      subtitle: `${metrics.totalCaregivers} workforce synced`,
      icon: ShieldCheck,
      iconBg: "bg-emerald-50",
      iconColor: "text-[#3D6B22]",
      borderHover: "hover:border-[#3D6B22]/50",
      href: "/caregivers",
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
              className={`p-3 sm:p-4 h-full bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-slate-200 ${kpi.borderHover} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between gap-1 mb-2 sm:mb-3">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-tight truncate pr-1">
                  {kpi.label}
                </span>
                <div
                  className={`p-1 sm:p-1.5 rounded-lg shrink-0 ${kpi.iconBg} ${kpi.iconColor}`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {kpi.value}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">
                  {kpi.subtitle}
                </p>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
