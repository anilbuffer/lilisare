"use client";

import React from "react";
import Link from "next/link";
import { Filter, Building2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { InquiryRecord } from "@/types/intake";

interface IntakePipelineFunnelCardProps {
  inquiries: InquiryRecord[];
}

export function IntakePipelineFunnelCard({ inquiries }: IntakePipelineFunnelCardProps) {
  const total = inquiries.length || 1;

  const stages = [
    { name: "New Inquiries", stage: "New Inquiry", color: "bg-[#C2D9C8]" },
    { name: "Contacted", stage: "Contacted", color: "bg-[#93C573]" },
    { name: "In Assessment", stage: "Needs Discussion", color: "bg-[#5B8E32]" },
    { name: "CMA Coordination", stage: "CMA Coordination", color: "bg-[#3D6B22]" },
    { name: "Converted to Care", stage: "Converted", color: "bg-[#1B3414]" },
  ];

  const hospitalCount = inquiries.filter((i) => i.source === "Hospital Discharge").length;
  const cmaCount = inquiries.filter((i) => i.source === "Case Manager").length;
  const physicianCount = inquiries.filter((i) => i.source === "Physician").length;
  const directCount = inquiries.filter((i) => i.source === "Website" || i.source === "Phone").length;

  return (
    <Card className="p-4 sm:p-5 bg-white rounded-xl lg:rounded-2xl border border-slate-200 hover:border-[#3D6B22]/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-[#3D6B22] rounded-xl">
              <Filter className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Intake Pipeline & Conversion
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            {inquiries.length} Inquiries
          </span>
        </div>

        {/* Funnel Bars */}
        <div className="space-y-2.5">
          {stages.map((st) => {
            const count = inquiries.filter((i) => i.stage === st.stage).length;
            const pct = Math.max(14, Math.round((count / total) * 100));

            return (
              <div key={st.stage} className="flex items-center gap-3 text-xs">
                <span className="w-28 text-slate-600 font-medium truncate text-right shrink-0">
                  {st.name}
                </span>
                <div className="flex-1 bg-slate-100 rounded-md h-5 relative overflow-hidden">
                  <div
                    className={`h-full rounded-md transition-all duration-500 ${st.color}`}
                    style={{ width: `${pct}%` }}
                  />
                  <span className="absolute left-2.5 top-0.5 text-[10px] font-extrabold text-white drop-shadow-xs">
                    {count}
                  </span>
                </div>
                <span className="w-10 text-[11px] text-slate-400 font-semibold text-right shrink-0">
                  {Math.round((count / total) * 100)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Referral Channels Distribution */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Referral Channels
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-slate-600">Hospital Discharge</span>
              <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                {hospitalCount}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-slate-600">Case Managers</span>
              <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                {cmaCount}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-slate-600">Physicians</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                {physicianCount}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-slate-600">Direct / Web</span>
              <span className="font-bold text-[#3D6B22] bg-emerald-50 px-1.5 py-0.5 rounded">
                {directCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
        <Link
          href="/intake/pipeline"
          className="text-xs font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
        >
          <span>Open Full Pipeline Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
