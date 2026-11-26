import React, { Suspense } from "react";
import { ClinicalRuleDetailWorkspace } from "@/components/admin/clinical/ClinicalRuleDetailWorkspace";
import { INITIAL_CLINICAL_RULES } from "@/lib/admin/clinicalSupervisoryStore";

interface PageProps {
  params: Promise<{ ruleId: string }>;
}

export const metadata = {
  title: "Clinical Visit Rule Detail | LiliSphere Admin",
  description:
    "Inspect and configure service-based clinical and supervisory visit rules, effective dates, and immutable version history.",
};

export function generateStaticParams() {
  const ruleIds = INITIAL_CLINICAL_RULES.map((r) => r.id);
  const allIds = Array.from(new Set(["default", "[ruleId]", ...ruleIds]));
  return allIds.map((ruleId) => ({ ruleId }));
}

export default async function AdminClinicalRuleDetailPage({ params }: PageProps) {
  const resolved = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">
            Loading Visit Rule Detail...
          </p>
        </div>
      }
    >
      <ClinicalRuleDetailWorkspace ruleId={resolved.ruleId} />
    </Suspense>
  );
}
