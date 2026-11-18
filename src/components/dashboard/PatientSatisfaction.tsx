"use client";

import React from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Heart, Star, ArrowRight } from "lucide-react";

export function PatientSatisfaction() {
  const score = 4.8;
  const maxScore = 5.0;
  const percentage = (score / maxScore) * 100;

  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ];

  return (
    <Card className="flex flex-col h-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <Heart className="w-5 h-5 fill-current text-rose-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Client & Family Satisfaction</h3>
            <p className="text-xs text-slate-500">Family-centred care sentiment score</p>
          </div>
        </div>

        <Link
          href="/reports-analytics"
          className="text-xs font-semibold text-[#3D6B22] hover:text-[#274C1D] flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Half-Circle Gauge */}
      <div className="relative h-[130px] flex items-end justify-center my-2">
        <div className="absolute inset-0 top-0">
          <ResponsiveContainer width="100%" height="200%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={72}
                outerRadius={90}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#3D6B22" />
                <Cell fill="#E2E8F0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center z-10 flex flex-col items-center translate-y-1">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {score.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 text-amber-500 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <div className="text-[11px] font-medium text-slate-400 mt-0.5">out of {maxScore.toFixed(1)}</div>
        </div>
      </div>

      {/* Sub-Metrics Progress Bars */}
      <div className="space-y-2.5 mt-auto pt-3 border-t border-slate-100">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600 font-medium">Caregiver Punctuality</span>
            <span className="font-bold text-slate-900">4.9 / 5.0</span>
          </div>
          <ProgressBar progress={98} color="bg-[#3D6B22]" height="h-1.5" />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600 font-medium">Care Quality & Empathy</span>
            <span className="font-bold text-slate-900">4.8 / 5.0</span>
          </div>
          <ProgressBar progress={96} color="bg-[#3D6B22]" height="h-1.5" />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600 font-medium">Agency & Family Communication</span>
            <span className="font-bold text-slate-900">4.6 / 5.0</span>
          </div>
          <ProgressBar progress={92} color="bg-[#D99B26]" height="h-1.5" />
        </div>
      </div>
    </Card>
  );
}
