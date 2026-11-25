import React, { Suspense } from "react";
import { getAllHouseholdIds } from "@/lib/households/mockData";
import { HouseholdEditView } from "@/components/households/HouseholdEditView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IntakeHouseholdEditPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Household Editor...</p>
        </div>
      }
    >
      <HouseholdEditView
        householdId={resolvedParams.id}
        baseBackPath="/intake/households"
      />
    </Suspense>
  );
}

export function generateStaticParams() {
  const allIds = Array.from(new Set(["[id]", "default", ...getAllHouseholdIds()]));
  return allIds.map((id) => ({ id }));
}
