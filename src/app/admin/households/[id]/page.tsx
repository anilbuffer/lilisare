import React from "react";
import { notFound } from "next/navigation";
import { getHouseholdById, getAllHouseholdIds, MOCK_HOUSEHOLDS } from "@/lib/households/mockData";
import { HouseholdDetailView } from "@/components/households/HouseholdDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminHouseholdDetailPage({ params }: PageProps) {
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
    <HouseholdDetailView
      initialHousehold={household}
      backHref="/admin/households"
      backLabel="Back to Households Hub"
    />
  );
}

export function generateStaticParams() {
  return getAllHouseholdIds().map((id) => ({ id }));
}
