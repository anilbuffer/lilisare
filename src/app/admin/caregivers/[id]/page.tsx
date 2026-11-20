import React, { Suspense } from "react";
import { INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { CaregiverDetailView } from "@/components/caregivers/CaregiverDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCaregiverDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Caregiver Profile...</p>
        </div>
      }
    >
      <CaregiverDetailView caregiverId={resolvedParams.id} />
    </Suspense>
  );
}

export function generateStaticParams() {
  const initialIds = INITIAL_CAREGIVERS.map((c) => c.id);
  const legacyIds = [
    "1",
    "2",
    "3",
    "4",
    "cg-1",
    "cg-2",
    "cg-3",
    "cg-4",
    "cg-5",
    "cg-6",
    "cg-7",
    "cg-8",
    "cg-001",
    "pt-001",
    "c-1",
    "c-2",
    "c-3",
    "cg-dr-1",
    "cg-po-2",
  ];
  const allIds = Array.from(new Set([...initialIds, ...legacyIds]));
  return allIds.map((id) => ({ id }));
}
