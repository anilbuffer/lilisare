import React, { Suspense } from "react";
import { ClinicalAuditWorkspace } from "@/components/admin/clinical/ClinicalAuditWorkspace";

export const metadata = {
  title: "Clinical Audit History | LiliSphere Admin",
  description:
    "Read-only immutable audit trail for clinical and supervisory operational events and rule changes.",
};

export default function AdminClinicalAuditPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Clinical Audit History...
          </p>
        </div>
      }
    >
      <ClinicalAuditWorkspace />
    </Suspense>
  );
}
