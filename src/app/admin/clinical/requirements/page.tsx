import React, { Suspense } from "react";
import { ClinicalRequirementsWorkspace } from "@/components/admin/clinical/ClinicalRequirementsWorkspace";

export const metadata = {
  title: "All Clinical & Supervisory Requirements | LiliSphere Admin",
  description:
    "Central repository of clinical and supervisory visit requirements across clients and services.",
};

export default function AdminClinicalRequirementsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Clinical Requirements...
          </p>
        </div>
      }
    >
      <ClinicalRequirementsWorkspace />
    </Suspense>
  );
}
