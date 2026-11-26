import React, { Suspense } from "react";
import { ClinicalRequirementCreateForm } from "@/components/admin/clinical/ClinicalRequirementCreateForm";

export const metadata = {
  title: "Create Visit Requirement | LiliSphere Admin",
  description:
    "Create an initial or recurring clinical or supervisory visit requirement.",
};

export default function AdminClinicalRequirementNewPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Requirement Wizard...
          </p>
        </div>
      }
    >
      <ClinicalRequirementCreateForm />
    </Suspense>
  );
}
