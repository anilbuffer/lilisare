import React, { Suspense } from "react";
import { ClinicalReportsWorkspace } from "@/components/admin/clinical/ClinicalReportsWorkspace";

export const metadata = {
  title: "Clinical Reports | LiliSphere Admin",
  description:
    "Operational reports, charts, and CSV exports for clinical and supervisory visit management.",
};

export default function AdminClinicalReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Clinical Reports...
          </p>
        </div>
      }
    >
      <ClinicalReportsWorkspace />
    </Suspense>
  );
}
