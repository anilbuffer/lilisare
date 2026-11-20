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

const KPIS: SimpleKpi[] = [
  {
    id: "referral-admission",
    label: "Referral-to-Admission",
    value: "72.4%",
    icon: UserCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-[#3D6B22]",
    borderHover: "hover:border-[#3D6B22]/50",
    href: "/intake/pipeline",
  },
  {
    id: "time-to-soc",
    label: "Time to Start of Care",
    value: "38.5 hrs",
    icon: Clock,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-700",
    borderHover: "hover:border-teal-500/50",
    href: "/intake/dashboard",
  },
  {
    id: "visit-completion",
    label: "Visit Completion Rate",
    value: "96.0%",
    icon: CalendarCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-[#3D6B22]",
    borderHover: "hover:border-[#3D6B22]/50",
    href: "/scheduling",
  },
  {
    id: "doc-compliance",
    label: "Doc & Compliance Status",
    value: "94.8%",
    icon: FileCheck2,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    borderHover: "hover:border-amber-400",
    href: "/compliance",
  },
  {
    id: "revenue-health",
    label: "Revenue Health",
    value: "3.2%",
    icon: CircleDollarSign,
    iconBg: "bg-emerald-50",
    iconColor: "text-[#3D6B22]",
    borderHover: "hover:border-[#3D6B22]/50",
    href: "/billing/workspace",
  },
];

export function AdminKpiRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {KPIS.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <Link
            key={kpi.id}
            href={kpi.href}
            className="group block focus:outline-none"
          >
            <Card
              className={`p-4 h-full bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-slate-200 ${kpi.borderHover} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 tracking-tight truncate pr-1">
                  {kpi.label}
                </span>
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${kpi.iconBg} ${kpi.iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {kpi.value}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-[#3D6B22] transition-opacity" />
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
