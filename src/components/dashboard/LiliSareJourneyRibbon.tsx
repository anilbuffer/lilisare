"use client";

import React from "react";
import Link from "next/link";
import {
  Inbox,
  Home,
  Users,
  Heart,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface JourneyMilestone {
  stageNumber: string;
  title: string;
  journeyType: "Intake & Referral" | "Family Households" | "Client Care" | "Caregiver Workforce" | "Authorizations & Ops";
  countLabel: string;
  statusBadge: string;
  badgeClass: string;
  href: string;
  icon: React.ElementType;
}

export function LiliSareJourneyRibbon() {
  const milestones: JourneyMilestone[] = [
    {
      stageNumber: "01",
      title: "Intake & Pipeline",
      journeyType: "Intake & Referral",
      countLabel: "79 Active Inquiries",
      statusBadge: "Stage 1: Intake",
      badgeClass: "bg-emerald-50 text-[#1E5622] border-emerald-200/80",
      href: "/intake/pipeline",
      icon: Inbox,
    },
    {
      stageNumber: "02",
      title: "Households Hub",
      journeyType: "Family Households",
      countLabel: "11 Connected Units",
      statusBadge: "Stage 2: Household",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200/80",
      href: "/households",
      icon: Home,
    },
    {
      stageNumber: "03",
      title: "Clients Workspace",
      journeyType: "Client Care",
      countLabel: "9 Active Records",
      statusBadge: "Stage 3: Clients",
      badgeClass: "bg-teal-50 text-teal-800 border-teal-200/80",
      href: "/clients",
      icon: Users,
    },
    {
      stageNumber: "04",
      title: "Caregiver Workforce",
      journeyType: "Caregiver Workforce",
      countLabel: "14 W-2 & Family Staff",
      statusBadge: "Stage 4: Caregivers",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
      href: "/caregivers",
      icon: Heart,
    },
    {
      stageNumber: "05",
      title: "Authorizations & Ops",
      journeyType: "Authorizations & Ops",
      countLabel: "122 Hrs/Wk Verified",
      statusBadge: "Stage 5: Authorizations",
      badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200/80",
      href: "/billing/authorizations",
      icon: ShieldCheck,
    },
  ];

  return (
    <section aria-label="LiliSare Three Connected Journeys" className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            LiliSare Operational Journey Sync
          </span>
          <span className="text-[10px] font-semibold text-[#1E5622] bg-[#E3F1D9] px-2 py-0.5 rounded-full border border-[#1E5622]/20">
            Tri-Journey Live Sync
          </span>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">
          Seamless progression: Intake Inquiries → Family Households → Client Care → Caregiver EVV
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {milestones.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.stageNumber}
              href={m.href}
              className="group block bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 focus:outline-none"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px]  font-bold text-slate-400 group-hover:text-[#3D6B22] transition-colors">
                  {m.stageNumber}
                </span>
                <div className="p-1 rounded-md bg-slate-100 text-slate-600 group-hover:bg-[#3D6B22]/10 group-hover:text-[#3D6B22] transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-xs group-hover:text-[#3D6B22] transition-colors truncate">
                {m.title}
              </h4>

              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {m.countLabel}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className={`font-semibold px-1.5 py-0.5 rounded-md border ${m.badgeClass}`}>
                  {m.statusBadge}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}