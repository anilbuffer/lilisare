import React, { Suspense } from "react";
import { CareNotesMainWorkspace } from "@/components/admin/care-notes/CareNotesMainWorkspace";

export const metadata = {
  title: "CareNotes Correction Requests | LiliSphere Admin",
  description: "Track and review care notes returned to caregivers for amendment and resubmission.",
};

export default function AdminCareNotesCorrectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Correction Requests...</p>
        </div>
      }
    >
      <CareNotesMainWorkspace initialTab="corrections" />
    </Suspense>
  );
}
