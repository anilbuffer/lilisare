"use client";

import React from "react";
import Link from "next/link";
import { Users, UserPlus, FileText, Calendar } from "lucide-react";

interface AdminCaregiverTopTabsProps {
  activeTab: "roster" | "recruiting" | "onboarding" | "time-off";
}

export function AdminCaregiverTopTabs({ activeTab }: AdminCaregiverTopTabsProps) {
  const tabs = [
    {
      id: "roster" as const,
      label: "Caregiver Roster",
      href: "/admin/caregivers",
      icon: Users,
    },
    {
      id: "recruiting" as const,
      label: "Recruiting Pipeline",
      href: "/admin/caregivers/recruiting",
      icon: UserPlus,
    },
    {
      id: "onboarding" as const,
      label: "Onboarding & Docs",
      href: "/admin/caregivers/onboarding",
      icon: FileText,
    },
    {
      id: "time-off" as const,
      label: "Time-Off Requests",
      href: "/admin/caregivers/time-off",
      icon: Calendar,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-xl sm:rounded-2xl  gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer ${isActive
                ? "bg-[#E8F2E4] text-[#1E5622] border border-[#3D6B22]/30 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-[#1E5622]" : "text-slate-400"
                  }`}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
