"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  RefreshCw,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { InquiryRecord } from "@/types/intake";

interface IntakeLiveActivityFeedProps {
  inquiries: InquiryRecord[];
  lastSyncTime: string;
  isSyncing: boolean;
  onRefreshSync: () => void;
}

interface SimpleActivityItem {
  id: string;
  subject: string;
  action: string;
  time: string;
  dotColor: string;
  href: string;
}

export function IntakeLiveActivityFeed({
  inquiries,
  lastSyncTime,
  isSyncing,
  onRefreshSync,
}: IntakeLiveActivityFeedProps) {
  // Aggregate recent high-signal events in clean human language
  const activities: SimpleActivityItem[] = useMemo(() => {
    const list: SimpleActivityItem[] = [];

    inquiries.forEach((inq) => {
      // 1. Converted event
      if (inq.stage === "Converted") {
        list.push({
          id: `act-conv-${inq.id}`,
          subject: inq.familyName,
          action: `admitted and converted to active care`,
          time: "25m ago",
          dotColor: "bg-emerald-500",
          href: `/intake/inquiries/${inq.id}`,
        });
      }

      // 2. Scheduled assessment
      if (inq.assessmentStatus === "Scheduled" || inq.stage === "Needs Discussion") {
        list.push({
          id: `act-assess-${inq.id}`,
          subject: inq.familyInfo.clientInfo.name,
          action: `clinical assessment booked with ${inq.assessmentDetails?.assessor || "RN Evaluator"}`,
          time: inq.assessmentDetails?.scheduledDate ? `${inq.assessmentDetails.scheduledDate}` : "1h ago",
          dotColor: "bg-teal-500",
          href: `/intake/inquiries/${inq.id}`,
        });
      }

      // 3. New hospital discharge or urgent referral
      if (inq.source === "Hospital Discharge" || inq.urgency === "Immediate") {
        list.push({
          id: `act-hosp-${inq.id}`,
          subject: inq.familyName,
          action: `hospital discharge referral triaged (${inq.familyInfo.clientInfo.name})`,
          time: "12m ago",
          dotColor: "bg-rose-500",
          href: `/intake/inquiries/${inq.id}`,
        });
      } else {
        // Standard inquiry
        list.push({
          id: `act-inq-${inq.id}`,
          subject: inq.familyName,
          action: `new inquiry received from ${inq.source}`,
          time: "45m ago",
          dotColor: "bg-sky-500",
          href: `/intake/inquiries/${inq.id}`,
        });
      }
    });

    // Deduplicate and cap at top 5 most recent
    const seen = new Set();
    return list.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }).slice(0, 5);
  }, [inquiries]);

  return (
    <Card>
      {/* Clean Minimal Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Recent Intake Activity
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Synced {lastSyncTime}</span>
          <button
            onClick={onRefreshSync}
            title="Refresh sync"
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#3D6B22]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Simplified, Minimal List */}
      <div className="divide-y divide-slate-100/80 mt-1">
        {activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No recent activity recorded.
          </div>
        ) : (
          activities.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group py-2.5 px-2 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/70 -mx-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.dotColor}`} />
                <p className="text-slate-700 truncate">
                  <strong className="text-slate-900 font-semibold group-hover:text-[#3D6B22] transition-colors">
                    {item.subject}
                  </strong>{" "}
                  <span className="text-slate-500">{item.action}</span>
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors text-[11px]">
                <span>{item.time}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#3D6B22]" />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Clean Minimal Footer */}
      <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px] text-slate-400">Live intake audit stream</span>
        <Link
          href="/intake/reports"
          className="text-[#3D6B22] font-semibold hover:underline flex items-center gap-1"
        >
          <span>View Reports & Analytics</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </Card>
  );
}
