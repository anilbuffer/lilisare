import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getHouseholdById, getAllHouseholdIds, MOCK_HOUSEHOLDS } from "@/lib/households/mockData";
import { HouseholdDetailView } from "@/components/households/HouseholdDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HouseholdDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const household =
    getHouseholdById(resolvedParams.id) ||
    MOCK_HOUSEHOLDS.find(
      (h) =>
        h.id.toLowerCase() === resolvedParams.id.toLowerCase() ||
        h.code.toLowerCase() === resolvedParams.id.toLowerCase()
    ) ||
    MOCK_HOUSEHOLDS[0];

  if (!household) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Household Profile...</p>
        </div>
      }
    >
      <HouseholdDetailView
        initialHousehold={household}
        backHref="/households"
        backLabel="Back to Households Hub"
      />
    </Suspense>
  );
}

export function generateStaticParams() {
  const allIds = Array.from(new Set(["[id]", "default", ...getAllHouseholdIds()]));
  return allIds.map((id) => ({ id }));
}
