import React, { Suspense } from "react";
import { ClinicalOverdueWorkspace } from "@/components/admin/clinical/ClinicalOverdueWorkspace";

export const metadata = {
  title: "Overdue & Follow-up | LiliSphere Admin",
  description:
    "Resolve overdue clinical visits, unassigned requirements, missing documentation, and follow-up actions.",
};

export default function AdminClinicalOverduePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Overdue &amp; Follow-up Queue...
          </p>
        </div>
      }
    >
      <ClinicalOverdueWorkspace />
    </Suspense>
  );
}
