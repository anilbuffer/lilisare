import React, { Suspense } from "react";
import { ClinicalOverviewWorkspace } from "@/components/admin/clinical/ClinicalOverviewWorkspace";

export const metadata = {
  title: "Clinical & Supervisory | LiliSphere Admin",
};

export default function AdminClinicalOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Clinical &amp; Supervisory...
          </p>
        </div>
      }
    >
      <ClinicalOverviewWorkspace />
    </Suspense>
  );
}
