"use client";

import React, { useState } from "react";
import { IntakeReferralWorkspace } from "@/components/intake/IntakeReferralWorkspace";
import { ListFilter, Kanban, CheckSquare, LayoutGrid } from "lucide-react";

import { KpiCardsRow } from "@/components/referrals/KpiCardsRow";
import { PipelineBoard } from "@/components/referrals/PipelineBoard";
import { SourcePerformanceChart } from "@/components/referrals/SourcePerformanceChart";
import { OnlineReferralQueue } from "@/components/referrals/OnlineReferralQueue";
import { RecentlyDeclinedList } from "@/components/referrals/RecentlyDeclinedList";
import { initialReferrals } from "@/components/referrals/MockData";
import { Referral } from "@/components/referrals/types";

type ViewMode = "unified" | "pipeline" | "list" | "tasks";

export default function IntakeReferralsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("unified");
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);

  return (
    <div className="w-full mx-auto space-y-4">
      {/* View Switcher Pill Bar */}
      <div className="flex items-center justify-between pb-1 border-b border-[#D5DFDA]/40">
        <div className="text-xs text-[#4A5D52]">
          Intake Portal Mode: <strong className="text-[#111C16]">{viewMode === "unified" ? "Unified Intake Workspace" : "Legacy Pipeline Board"}</strong>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-[#FFFFFF] p-1 rounded-xl border border-[#D5DFDA] shadow-xs text-xs">
          <button
            type="button"
            onClick={() => setViewMode("unified")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === "unified"
                ? "bg-[#3D6B22] text-white shadow-xs"
                : "text-[#4A5D52] hover:text-[#111C16]"
            }`}
          >
            Unified Workspace
          </button>
          <button
            type="button"
            onClick={() => setViewMode("pipeline")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === "pipeline"
                ? "bg-[#3D6B22] text-white shadow-xs"
                : "text-[#4A5D52] hover:text-[#111C16]"
            }`}
          >
            Kanban Board
          </button>
        </div>
      </div>

      {viewMode === "unified" ? (
        <IntakeReferralWorkspace />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#111C16]">Referral Pipeline Board</h2>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setViewMode("pipeline")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "pipeline" ? "bg-[#3D6B22] text-white" : "text-slate-500 hover:text-slate-700"}`}
                title="Pipeline View"
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#3D6B22] text-white" : "text-slate-500 hover:text-slate-700"}`}
                title="List View"
              >
                <ListFilter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("tasks")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "tasks" ? "bg-[#3D6B22] text-white" : "text-slate-500 hover:text-slate-700"}`}
                title="My Tasks"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          <KpiCardsRow />
          <PipelineBoard viewMode={viewMode} referrals={referrals} setReferrals={setReferrals} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <SourcePerformanceChart />
            </div>
            <div className="xl:col-span-1 flex flex-col gap-4">
              <OnlineReferralQueue />
              <RecentlyDeclinedList />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
