import React, { Suspense } from "react";
import { ClinicalScheduleWorkspace } from "@/components/admin/clinical/ClinicalScheduleWorkspace";

export const metadata = {
  title: "Clinical Visit Schedule | LiliSphere Admin",
  description:
    "Consolidated calendar and list of clinical and supervisory appointments linked to Scheduling.",
};

export default function AdminClinicalSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Clinical Visit Schedule...
          </p>
        </div>
      }
    >
      <ClinicalScheduleWorkspace />
    </Suspense>
  );
}
