"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, Stethoscope, ArrowRight, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { InquiryRecord } from "@/types/intake";

interface IntakeAssessmentsCardProps {
  inquiries: InquiryRecord[];
  onScheduleAssessment: (inquiry: InquiryRecord) => void;
}

export function IntakeAssessmentsCard({
  inquiries,
  onScheduleAssessment,
}: IntakeAssessmentsCardProps) {
  // Find inquiries with scheduled or pending clinical assessments
  const scheduledList = inquiries.filter(
    (i) => i.assessmentStatus === "Scheduled" || i.stage === "Needs Discussion"
  );

  return (
    <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-sky-700 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Clinical RN Assessments
              </h3>
              <p className="text-xs text-slate-500">
                In-home evaluations and functional care readiness
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
            {scheduledList.length} Scheduled
          </span>
        </div>

        {/* Schedule List */}
        <div className="space-y-2.5">
          {scheduledList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No clinical assessments currently pending schedule.
            </div>
          ) : (
            scheduledList.slice(0, 4).map((inq) => {
              const details = inq.assessmentDetails;

              return (
                <div
                  key={inq.id}
                  className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {inq.familyInfo.clientInfo.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{details?.scheduledDate || "Tomorrow"}</span>
                        <span>•</span>
                        <span>{details?.scheduledTime || "10:00 AM"}</span>
                        <span>•</span>
                        <span className="text-sky-700 font-semibold">{details?.assessor || "Sarah Connor, RN"}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-50 text-sky-800 border border-sky-200 shrink-0">
                    {inq.assessmentStatus || "Pending RN"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
        <Link
          href="/intake/pipeline"
          className="text-xs font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
        >
          <span>View Assessment Schedule</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
