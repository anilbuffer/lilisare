"use client";

import React from "react";
import Link from "next/link";
import { Home, Users, Heart, Briefcase, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Household } from "@/lib/households/mockData";

interface IntakeTriJourneyCardProps {
  households: Household[];
}

export function IntakeTriJourneyCard({ households }: IntakeTriJourneyCardProps) {
  const bottleneckCount = households.filter((h) => Boolean(h.triJourneyStatus?.bottleneckMessage)).length;

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Three Connected Journeys
                </h3>
                {bottleneckCount > 0 && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {bottleneckCount} Bottleneck{bottleneckCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Household synchronization: Client ↔ Caregiver ↔ Operations
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
            {households.length} Households
          </span>
        </div>

        {/* Household List */}
        <div className="space-y-3">
          {households.slice(0, 3).map((hh) => {
            const tj = hh.triJourneyStatus;
            const hasBottleneck = Boolean(tj?.bottleneckMessage);

            return (
              <div
                key={hh.id}
                className={`p-3 rounded-xl border transition-all text-xs ${
                  hasBottleneck
                    ? "border-amber-200 bg-amber-50/20"
                    : "border-slate-100 bg-slate-50/60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{hh.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {hh.code}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      hh.authStatus === "Approved"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    Auth: {hh.authStatus}
                  </span>
                </div>

                {/* 3 Tracks */}
                <div className="grid grid-cols-3 gap-1.5 text-[11px] mb-2">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Users className="w-2.5 h-2.5 text-sky-500" /> Client
                    </div>
                    <div className="font-semibold text-slate-800 truncate mt-0.5">
                      {tj?.clientStage || "Intake"}
                    </div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5 text-rose-500" /> Caregiver
                    </div>
                    <div className="font-semibold text-slate-800 truncate mt-0.5">
                      {tj?.caregiverStage || "Matched"}
                    </div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                    <div className="text-slate-400 text-[10px] flex items-center gap-1">
                      <Briefcase className="w-2.5 h-2.5 text-[#3D6B22]" /> Ops Track
                    </div>
                    <div className="font-semibold text-slate-800 truncate mt-0.5">
                      {tj?.opsStage || "Coordination"}
                    </div>
                  </div>
                </div>

                {/* Bottleneck Callout if any */}
                {hasBottleneck && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-100/60 px-2 py-1 rounded-md">
                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">{tj?.bottleneckMessage}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
        <Link
          href="/intake/households"
          className="text-xs font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-1"
        >
          <span>Manage Family Households</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
