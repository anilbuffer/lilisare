import React, { Suspense } from "react";
import { INITIAL_REALTIME_VISITS } from "@/lib/scheduling/schedulingStore";
import { VisitEditView } from "@/components/scheduling/realtime/VisitEditView";

interface PageProps {
  params: Promise<{ visitId: string }>;
}

export default async function IntakeVisitEditPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Visit Editor...
          </p>
        </div>
      }
    >
      <VisitEditView portal="intake" visitId={resolvedParams.visitId} />
    </Suspense>
  );
}

export function generateStaticParams() {
  const ids = INITIAL_REALTIME_VISITS.map((v) => v.id);
  const allIds = Array.from(new Set(["[visitId]", "default", ...ids]));
  return allIds.map((visitId) => ({ visitId }));
}
