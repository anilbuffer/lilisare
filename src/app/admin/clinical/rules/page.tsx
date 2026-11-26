import React, { Suspense } from "react";
import { ClinicalRulesWorkspace } from "@/components/admin/clinical/ClinicalRulesWorkspace";

export const metadata = {
  title: "Clinical & Supervisory Rules | LiliSphere Admin",
  description:
    "Configure service-based clinical and supervisory visit rules with versioning and audit safeguards.",
};

export default function AdminClinicalRulesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Clinical &amp; Supervisory Rules...
          </p>
        </div>
      }
    >
      <ClinicalRulesWorkspace />
    </Suspense>
  );
}
