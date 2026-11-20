"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  PhoneCall,
  Calendar,
  Building2,
  Stethoscope,
  UserPlus,
  ArrowRight,
  Filter,
  Inbox,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { InquiryRecord } from "@/types/intake";

interface IntakeLiveActivityFeedProps {
  inquiries: InquiryRecord[];
  lastSyncTime: string;
  isSyncing: boolean;
  onRefreshSync: () => void;
}

type ActivityFilter = "all" | "inquiries" | "assessments" | "conversions";

interface FormattedActivityEvent {
  id: string;
  inquiryId: string;
  familyName: string;
  clientName: string;
  title: string;
  details: string;
  timestamp: string;
  author: string;
  type: string;
  statusBadge: string;
  statusColor: string;
  iconBg: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
  actionHref: string;
}

export function IntakeLiveActivityFeed({
  inquiries,
  lastSyncTime,
  isSyncing,
  onRefreshSync,
}: IntakeLiveActivityFeedProps) {
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>("all");

  // Transform inquiries and timeline events into unified, rich activity stream
  const allEvents = useMemo(() => {
    const list: FormattedActivityEvent[] = [];

    inquiries.forEach((inq) => {
      // 1. Inquiry creation event
      const isHospital = inq.source === "Hospital Discharge";
      list.push({
        id: `evt-inq-${inq.id}`,
        inquiryId: inq.id,
        familyName: inq.familyName,
        clientName: inq.familyInfo.clientInfo.name,
        title: isHospital
          ? `Hospital Discharge Referral Received`
          : `New Family Inquiry Logged`,
        details: `${inq.source} referral · ${inq.careRequirements.programInterest} (${inq.careRequirements.hoursPerWeek}h/wk)`,
        timestamp: "12m ago",
        author: inq.referralInfo?.assignedCoordinator?.name || "Intake Coordinator",
        type: "inquiry",
        statusBadge: isHospital ? "Hospital SLA" : inq.stage,
        statusColor: isHospital
          ? "bg-rose-50 text-rose-700 border-rose-200/80"
          : "bg-blue-50 text-blue-700 border-blue-200/80",
        iconBg: isHospital ? "bg-rose-50 text-rose-700 border-rose-200/60" : "bg-blue-50 text-blue-700 border-blue-200/60",
        iconColor: isHospital ? "text-rose-600" : "text-blue-600",
        icon: isHospital ? Building2 : Inbox,
        actionHref: `/intake/inquiries/${inq.id}`,
      });

      // 2. Timeline logged communications (calls, notes)
      (inq.timeline || []).forEach((t) => {
        if (t.type === "call" || t.type === "email" || t.type === "note") {
          list.push({
            id: `evt-tl-${t.id}`,
            inquiryId: inq.id,
            familyName: inq.familyName,
            clientName: inq.familyInfo.clientInfo.name,
            title: t.title,
            details: t.details || `Spoke with ${inq.familyInfo.primaryContact} (${inq.familyInfo.phone})`,
            timestamp: t.timestamp || "35m ago",
            author: t.author || "Intake Coordinator",
            type: "inquiry",
            statusBadge: "Contact Logged",
            statusColor: "bg-amber-50 text-amber-800 border-amber-200/80",
            iconBg: "bg-amber-50 text-amber-800 border-amber-200/60",
            iconColor: "text-amber-700",
            icon: PhoneCall,
            actionHref: `/intake/inquiries/${inq.id}`,
          });
        }

        // 3. Clinical assessment scheduled
        if (t.type === "assessment" || inq.assessmentStatus === "Scheduled") {
          list.push({
            id: `evt-assess-${inq.id}`,
            inquiryId: inq.id,
            familyName: inq.familyName,
            clientName: inq.familyInfo.clientInfo.name,
            title: `Clinical Assessment Booked`,
            details: `${inq.assessmentDetails?.type || "In-Home Clinical RN Assessment"} with ${inq.assessmentDetails?.assessor || "Sarah Connor, RN"}`,
            timestamp: inq.assessmentDetails?.scheduledDate ? `${inq.assessmentDetails.scheduledDate}` : "1h ago",
            author: inq.assessmentDetails?.assessor || "RN Evaluator",
            type: "assessment",
            statusBadge: "Assessment",
            statusColor: "bg-teal-50 text-teal-800 border-teal-200/80",
            iconBg: "bg-teal-50 text-teal-700 border-teal-200/60",
            iconColor: "text-teal-700",
            icon: Stethoscope,
            actionHref: `/intake/inquiries/${inq.id}`,
          });
        }
      });

      // 4. Converted admissions
      if (inq.stage === "Converted") {
        list.push({
          id: `evt-conv-${inq.id}`,
          inquiryId: inq.id,
          familyName: inq.familyName,
          clientName: inq.familyInfo.clientInfo.name,
          title: `Admitted & Converted to Active Care`,
          details: `Client registered, Household synchronized, Caregiver linked`,
          timestamp: "2h ago",
          author: "Intake Coordinator",
          type: "conversion",
          statusBadge: "Converted",
          statusColor: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          iconColor: "text-[#3D6B22]",
          icon: CheckCircle2,
          actionHref: `/intake/pipeline`,
        });
      }
    });

    // Deduplicate by id
    const seen = new Set();
    return list.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [inquiries]);

  // Filter based on selected tab
  const filteredEvents = useMemo(() => {
    if (activeFilter === "inquiries") {
      return allEvents.filter((e) => e.type === "inquiry");
    }
    if (activeFilter === "assessments") {
      return allEvents.filter((e) => e.type === "assessment");
    }
    if (activeFilter === "conversions") {
      return allEvents.filter((e) => e.type === "conversion");
    }
    return allEvents;
  }, [allEvents, activeFilter]);

  return (
    <Card className="p-4 sm:p-5 border border-slate-200 hover:border-[#3D6B22]/50 bg-white rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#1B3414] text-[#93C573] rounded-xl shrink-0 shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                Live Intake Activity
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Live Synced
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time audit log of referrals, family outreach, assessments, and conversions
            </p>
          </div>
        </div>

        {/* Filter Tabs & Refresh Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Events ({allEvents.length})
            </button>
            <button
              onClick={() => setActiveFilter("inquiries")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "inquiries"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Inquiries
            </button>
            <button
              onClick={() => setActiveFilter("assessments")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "assessments"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Assessments
            </button>
            <button
              onClick={() => setActiveFilter("conversions")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === "conversions"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Conversions
            </button>
          </div>

          <button
            onClick={onRefreshSync}
            title={`Force sync with Agency Admin (Last: ${lastSyncTime})`}
            className="p-1.5 rounded-xl border border-slate-200 hover:border-[#3D6B22] text-slate-600 hover:text-[#3D6B22] bg-white hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#3D6B22]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Activity List UI */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
            <Inbox className="w-6 h-6 text-slate-300" />
            <span>No activity events match this filter.</span>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const Icon = evt.icon;

            return (
              <div
                key={evt.id}
                className="py-3 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-all group border border-transparent hover:border-slate-200/60"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${evt.iconBg} transition-transform group-hover:scale-105`}
                  >
                    <Icon className={`w-4 h-4 ${evt.iconColor}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#3D6B22] transition-colors truncate">
                        {evt.title}
                      </h4>
                      <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                        {evt.inquiryId}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        • {evt.familyName}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                      {evt.details} · <span className="text-slate-400">{evt.author}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Status Pill & Timestamp & Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center">
                  <span
                    className={`w-24 text-center px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${evt.statusColor}`}
                  >
                    {evt.statusBadge}
                  </span>

                  <span className="w-16 text-right text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {evt.timestamp}
                  </span>

                  <Link
                    href={evt.actionHref}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#1B3414] text-slate-700 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs whitespace-nowrap active:scale-95"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#3D6B22] group-hover:text-white" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Synchronized with LiliSare Agency Admin: <strong className="text-slate-700">{lastSyncTime}</strong>
        </span>
        <Link
          href="/intake/reports"
          className="text-[#3D6B22] font-bold hover:underline flex items-center gap-1"
        >
          <span>View Reports & Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
