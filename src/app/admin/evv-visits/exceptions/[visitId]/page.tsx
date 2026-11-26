import React, { Suspense } from "react";
import { INITIAL_EVV_VISITS } from "@/lib/admin/evvVisitsStore";
import { INITIAL_REALTIME_VISITS } from "@/lib/scheduling/schedulingStore";
import { EvvVisitDetailView } from "@/components/admin/evv/EvvVisitDetailView";

interface PageProps {
  params: Promise<{ visitId: string }>;
}

export const metadata = {
  title: "EVV Exception Investigation | LiliSare Admin",
  description: "Investigate and resolve EVV visit exceptions, verify evidence, and log resolution sign-offs.",
};

export default async function AdminEvvExceptionDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-9xl mx-auto py-16 text-center text-slate-500">
          <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Exception Workspace...</p>
        </div>
      }
    >
      <EvvVisitDetailView
        visitId={resolvedParams.visitId}
        defaultTab="investigation"
        backHref="/admin/evv-visits/exceptions/"
        backLabel="Back to Exceptions Queue"
      />
    </Suspense>
  );
}

export function generateStaticParams() {
  const evvIds = INITIAL_EVV_VISITS.map((v) => v.id);
  const realtimeIds = INITIAL_REALTIME_VISITS.map((v) => v.id);
  const allIds = Array.from(new Set(["[visitId]", "default", ...evvIds, ...realtimeIds]));
  return allIds.map((visitId) => ({ visitId }));
}
