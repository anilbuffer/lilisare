import React, { Suspense } from "react";
import { INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { CaregiverEditView } from "@/components/caregivers/CaregiverEditView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CaregiverEditPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-4xl mx-auto py-16 text-center text-slate-500">
          <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Caregiver Editor...</p>
        </div>
      }
    >
      <CaregiverEditView caregiverId={resolvedParams.id} />
    </Suspense>
  );
}

export function generateStaticParams() {
  const initialIds = INITIAL_CAREGIVERS.map((c) => c.id);
  const lowerInitial = initialIds.map((id) => id.toLowerCase());
  const upperInitial = initialIds.map((id) => id.toUpperCase());
  const legacyIds = [
    "[id]",
    "default",
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
    "cg-102",
    "cg-103",
    "cg-104",
    "cg-105",
    "cg-106",
    "cg-107",
    "cg-108",
    "cg-115",
    "cg-120",
    "cg-122",
    "cg-130",
    "cg-135",
  ];
  const allIds = Array.from(
    new Set([...initialIds, ...lowerInitial, ...upperInitial, ...legacyIds])
  );
  return allIds.map((id) => ({ id }));
}
