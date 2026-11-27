"use client";

import React from "react";
import { HRNavHeader } from "@/components/caregivers/HRNavHeader";
import { PipelineBoard } from "@/components/caregivers/recruiting/PipelineBoard";
import { Search, Filter, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AddApplicantModal } from "@/components/caregivers/recruiting/AddApplicantModal";

export default function RecruitingPage() {
  const [isAddApplicantModalOpen, setIsAddApplicantModalOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <HRNavHeader activeTab="recruiting" />

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search applicants by name, role, or skills..."
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all"
            />
          </div>
          <button
            onClick={() => toast.info("Filters functionality coming soon")}
            className="px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        <button
          onClick={() => setIsAddApplicantModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Applicant
        </button>
      </div>

      {/* Pipeline Board */}
      <PipelineBoard onAddApplicant={() => setIsAddApplicantModalOpen(true)} />

      <AddApplicantModal
        isOpen={isAddApplicantModalOpen}
        onClose={() => setIsAddApplicantModalOpen(false)}
      />
    </div>
  );
}
