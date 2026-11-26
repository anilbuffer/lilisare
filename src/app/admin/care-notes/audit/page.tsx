import React, { Suspense } from "react";
import { CareNotesMainWorkspace } from "@/components/admin/care-notes/CareNotesMainWorkspace";

export const metadata = {
  title: "CareNotes Audit History | LiliSphere Admin",
  description: "Immutable ledger tracking care documentation actions, reviews, correction cycles, and compliance edits.",
};

export default function AdminCareNotesAuditPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Audit History...</p>
        </div>
      }
    >
      <CareNotesMainWorkspace initialTab="audit" />
    </Suspense>
  );
}
