import React, { Suspense } from "react";
import { ClinicalAuditDetailWorkspace } from "@/components/admin/clinical/ClinicalAuditDetailWorkspace";
import { INITIAL_CLINICAL_AUDIT } from "@/lib/admin/clinicalSupervisoryStore";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export const metadata = {
  title: "Clinical Audit Event Detail | LiliSphere Admin",
  description:
    "Inspect full immutable audit record metadata, before/after state values, actor role, and operational justification.",
};

export function generateStaticParams() {
  const eventIds = INITIAL_CLINICAL_AUDIT.map((e) => e.id);
  const allIds = Array.from(new Set(["default", "[eventId]", ...eventIds]));
  return allIds.map((eventId) => ({ eventId }));
}

export default async function AdminClinicalAuditDetailPage({ params }: PageProps) {
  const resolved = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Audit Event Detail...
          </p>
        </div>
      }
    >
      <ClinicalAuditDetailWorkspace eventId={resolved.eventId} />
    </Suspense>
  );
}
