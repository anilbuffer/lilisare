import React, { Suspense } from "react";
import { EvvExceptionsWorkspace } from "@/components/admin/evv/EvvExceptionsWorkspace";

export const metadata = {
  title: "EVV Exceptions Work Queue | LiliSare Admin",
  description: "Investigate and resolve open EVV visit exceptions, location mismatches, and compliance flags.",
};

export default function AdminEvvExceptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-9xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Exceptions Queue...</p>
        </div>
      }
    >
      <EvvExceptionsWorkspace />
    </Suspense>
  );
}
