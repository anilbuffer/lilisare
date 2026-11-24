import React, { Suspense } from "react";
import { INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { SEED_ADMIN_CAREGIVERS } from "@/lib/caregivers/adminCaregiversData";
import { AdminCaregiverDetailView } from "@/components/admin/caregivers/AdminCaregiverDetailView";

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
      <AdminCaregiverDetailView caregiverId={resolvedParams.id} />
    </Suspense>
  );
}

export function generateStaticParams() {
  const caregiverIds = [
    ...INITIAL_CAREGIVERS.map((c) => c.id),
    ...SEED_ADMIN_CAREGIVERS.map((c) => c.id),
    ...SEED_ADMIN_CAREGIVERS.map((c) => c.numericId || ""),
  ].filter(Boolean);

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
    "232",
    "36",
    "19",
    "462",
    "76",
    "67",
    "32",
    "123",
    "100",
    "197",
    "255",
    "14",
    "60",
    "52",
    "249",
    "50",
    "99",
    "127",
  ];

  const allIds = Array.from(
    new Set([
      "[id]",
      "default",
      ...caregiverIds,
      ...caregiverIds.map((id) => id.toLowerCase()),
      ...caregiverIds.map((id) => id.toUpperCase()),
      ...legacyIds,
      ...legacyIds.map((id) => id.toLowerCase()),
      ...legacyIds.map((id) => id.toUpperCase()),
    ])
  );

  return allIds.map((id) => ({ id }));
}
