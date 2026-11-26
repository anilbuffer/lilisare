import React, { Suspense } from "react";
import { CareNotesOverviewWorkspace } from "@/components/admin/care-notes/CareNotesOverviewWorkspace";

export const metadata = {
  title: "CareNotes Overview | LiliSphere Admin",
  description: "Monitor care documentation, review submitted notes, and manage documentation quality across your agency.",
};

export default function AdminCareNotesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading CareNotes...</p>
        </div>
      }
    >
      <CareNotesOverviewWorkspace />
    </Suspense>
  );
}
