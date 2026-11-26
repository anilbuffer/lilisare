import React, { Suspense } from "react";
import { ClinicalReviewQueueWorkspace } from "@/components/admin/clinical/ClinicalReviewQueueWorkspace";

export const metadata = {
  title: "Clinical Review Queue | LiliSphere Admin",
  description:
    "Monitor clinical visits waiting for documentation, review, or authorised RN sign-off.",
};

export default function AdminClinicalReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Clinical Review Queue...
          </p>
        </div>
      }
    >
      <ClinicalReviewQueueWorkspace />
    </Suspense>
  );
}
