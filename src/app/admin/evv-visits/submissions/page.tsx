import React, { Suspense } from "react";
import { EvvSubmissionsWorkspace } from "@/components/admin/evv/EvvSubmissionsWorkspace";

export const metadata = {
  title: "EVV Aggregator Submissions | LiliSare Admin",
  description: "Monitor external aggregator submissions, acknowledgements, batch reconciliations, and retry rejected records.",
};

export default function AdminEvvSubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-9xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Aggregator Submissions...</p>
        </div>
      }
    >
      <EvvSubmissionsWorkspace />
    </Suspense>
  );
}
