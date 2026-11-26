import React, { Suspense } from "react";
import { EvvRulesWorkspace } from "@/components/admin/evv/EvvRulesWorkspace";

export const metadata = {
  title: "EVV Tolerance & Verification Rules | LiliSare Admin",
  description: "Configure EVV grace windows, arrival and departure tolerances, and review thresholds by payer and program.",
};

export default function AdminEvvRulesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-9xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Tolerance Rules...</p>
        </div>
      }
    >
      <EvvRulesWorkspace />
    </Suspense>
  );
}
