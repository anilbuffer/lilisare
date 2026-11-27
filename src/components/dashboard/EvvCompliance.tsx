"use client";

import React from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { AlertCircle, ArrowRight, ShieldCheck, MapPin, Clock, FileSignature } from "lucide-react";

export function EvvCompliance() {
  const compliance = 98.2;
  const data = [
    { name: "Compliant", value: compliance },
    { name: "Non-Compliant", value: +(100 - compliance).toFixed(1) },
  ];

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">EVV Compliance</h3>
          </div>
        </div>

        <Link
          href="/admin/evv-visits/exceptions"
          className="text-xs font-semibold text-[#3D6B22] hover:text-[#274C1D] flex items-center gap-1 transition-colors"
        >
          Exceptions Queue <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-6 my-4">
        {/* Compliance Donut Gauge */}
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={62}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#3D6B22" />
                <Cell fill="#E2E8F0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-900">{compliance}%</span>
            <span className="text-[10px] font-medium text-slate-400">verified</span>
          </div>
        </div>

        {/* 14 Visits at Risk Banner (Directly matches Needs Your Attention item #4) */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 flex-1 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-amber-900">14 Visits at Risk</div>
            <div className="text-[11px] text-amber-800/90 mt-0.5 leading-snug">
              Missing EVV GPS or clock-out data may block Medicaid claims.
            </div>
            <Link
              href="/admin/evv-visits/exceptions"
              className="text-[11px] font-bold text-amber-900 underline mt-1.5 inline-block hover:text-amber-950"
            >
              Resolve exceptions now →
            </Link>
          </div>
        </div>
      </div>

      {/* Top Exceptions breakdown */}
      <div className="space-y-2 mt-auto pt-2 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Top Exceptions Breakdown
        </div>

        <div className="flex justify-between items-center bg-slate-50/80 border border-slate-100 rounded-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-medium">Missing GPS Location</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
            8
          </span>
        </div>

        <div className="flex justify-between items-center bg-slate-50/80 border border-slate-100 rounded-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-medium">Late Clock-out (&gt;30m)</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
            4
          </span>
        </div>

        <div className="flex justify-between items-center bg-slate-50/80 border border-slate-100 rounded-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <FileSignature className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium">Missing Client/Guardian Signature</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
            2
          </span>
        </div>
      </div>
    </Card>
  );
}
