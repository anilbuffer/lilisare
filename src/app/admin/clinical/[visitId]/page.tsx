import React, { Suspense } from "react";
import { ClinicalVisitDetailWorkspace } from "@/components/admin/clinical/ClinicalVisitDetailWorkspace";
import {
  INITIAL_CLINICAL_REQUIREMENTS,
  INITIAL_CLINICAL_VISITS,
} from "@/lib/admin/clinicalSupervisoryStore";

interface PageProps {
  params: Promise<{ visitId: string }>;
}

export const metadata = {
  title: "Clinical Requirement & Visit Detail | LiliSphere Admin",
  description:
    "Inspect clinical requirement metadata, scheduling links, read-only documentation, review sign-off, and audit timeline.",
};

export function generateStaticParams() {
  const visitIds = INITIAL_CLINICAL_VISITS.map((v) => v.id);
  const reqIds = INITIAL_CLINICAL_REQUIREMENTS.map((r) => r.id);
  const allIds = Array.from(new Set(["default", "[visitId]", ...visitIds, ...reqIds]));
  return allIds.map((visitId) => ({ visitId }));
}

export default async function AdminClinicalVisitDetailPage({ params }: PageProps) {
  const resolved = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Clinical Visit Detail...
          </p>
        </div>
      }
    >
      <ClinicalVisitDetailWorkspace visitId={resolved.visitId} />
    </Suspense>
  );
}
