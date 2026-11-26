import React, { Suspense } from "react";
import { EvvVisitsWorkspace } from "@/components/admin/evv/EvvVisitsWorkspace";

export const metadata = {
  title: "EVV Visits & Monitoring | LiliSare Admin",
  description: "Monitor visit activity, identify exceptions, and review EVV records.",
};

export default function AdminEvvVisitsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-9xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading EVV Visits...</p>
        </div>
      }
    >
      <EvvVisitsWorkspace />
    </Suspense>
  );
}
