"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Send,
  Sliders,
  CheckCircle2,
} from "lucide-react";

interface EvvSubNavProps {
  exceptionCount?: number;
  rejectedCount?: number;
}

export function EvvSubNav({ exceptionCount, rejectedCount }: EvvSubNavProps) {
  const pathname = usePathname();

  const isExact = (path: string) => pathname === path || pathname === `${path}/`;
  const isWorkspace = isExact("/admin/evv-visits");
  const isExceptions = pathname.startsWith("/admin/evv-visits/exceptions");
  const isSubmissions = pathname.startsWith("/admin/evv-visits/submissions");
  const isRules = pathname.startsWith("/admin/evv-visits/rules");

  const navItems = [
    {
      label: "Operational Workspace",
      href: "/admin/evv-visits",
      icon: Activity,
      isActive: isWorkspace,
      badge: null,
    },
    {
      label: "Exceptions Queue",
      href: "/admin/evv-visits/exceptions",
      icon: AlertTriangle,
      isActive: isExceptions,
      badge: exceptionCount !== undefined && exceptionCount > 0 ? exceptionCount : null,
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    },
    {
      label: "Aggregator Submissions",
      href: "/admin/evv-visits/submissions",
      icon: Send,
      isActive: isSubmissions,
      badge: rejectedCount !== undefined && rejectedCount > 0 ? `${rejectedCount} err` : null,
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    },
    {
      label: "Rules & Tolerances",
      href: "/admin/evv-visits/rules",
      icon: Sliders,
      isActive: isRules,
      badge: null,
    },
  ];

  return (
    <div className="bg-white p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-1.5 overflow-x-auto scrollbar-none mb-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              item.isActive
                ? "bg-[#3e6b2b] text-white font-bold shadow-sm shadow-[#3e6b2b]/25 border border-[#3e6b2b]"
                : "bg-slate-50/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/70 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 transition-colors ${
                item.isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
            <span>{item.label}</span>
            {item.badge !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border transition-colors ${
                  item.isActive
                    ? "bg-white/20 text-white border-white/30"
                    : item.badgeColor
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
