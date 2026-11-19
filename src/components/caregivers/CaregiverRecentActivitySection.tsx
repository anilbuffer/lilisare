"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  Upload,
  UserCheck,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  FileText,
  MapPin,
} from "lucide-react";
import { CaregiverAuditItem } from "@/types/caregiver";

interface CaregiverRecentActivitySectionProps {
  activities: CaregiverAuditItem[];
  onSelectCaregiverId: (caregiverId: string) => void;
}

export function CaregiverRecentActivitySection({
  activities,
  onSelectCaregiverId,
}: CaregiverRecentActivitySectionProps) {
  const getIconForType = (type: CaregiverAuditItem["type"]) => {
    switch (type) {
      case "approval":
        return { icon: CheckCircle2, color: "text-[#1E5622]", bg: "bg-[#E3F1D9]" };
      case "document":
        return { icon: Upload, color: "text-sky-700", bg: "bg-sky-100" };
      case "assignment":
        return { icon: UserCheck, color: "text-purple-700", bg: "bg-purple-100" };
      case "training":
        return { icon: GraduationCap, color: "text-amber-700", bg: "bg-amber-100" };
      case "evv":
        return { icon: MapPin, color: "text-teal-700", bg: "bg-teal-100" };
      default:
        return { icon: FileText, color: "text-slate-600", bg: "bg-slate-100" };
    }
  };

  const extractCaregiverId = (desc: string): string | null => {
    const match = desc.match(/CG-\d+/i);
    return match ? match[0].toUpperCase() : null;
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
            <p className="text-xs text-slate-500">Latest caregiver updates across onboarding, training, and assignments</p>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-400">Real-time sync</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {activities.slice(0, 4).map((activity) => {
          const { icon: Icon, color, bg } = getIconForType(activity.type);
          const cgId = extractCaregiverId(activity.description);

          return (
            <div
              key={activity.id}
              onClick={() => cgId && onSelectCaregiverId(cgId)}
              className={`p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#3D6B22]/40 hover:shadow-sm transition-all flex flex-col justify-between ${
                cgId ? "cursor-pointer group" : ""
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${bg} ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#3D6B22] transition-colors">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 font-medium">
                    {activity.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{activity.relativeTime}</span>
                  </p>
                </div>
              </div>

              {cgId && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#3D6B22] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Inspect {cgId}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
