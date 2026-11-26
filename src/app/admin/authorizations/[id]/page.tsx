import React, { Suspense } from "react";
import { INITIAL_AUTHORIZATIONS } from "@/lib/admin/authorizationsData";
import { AdminAuthorizationDetailView } from "@/components/admin/authorizations/AdminAuthorizationDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminAuthorizationDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Authorization Workspace...</p>
        </div>
      }
    >
      <AdminAuthorizationDetailView authId={resolvedParams.id} />
    </Suspense>
  );
}

export function generateStaticParams() {
  const ids = INITIAL_AUTHORIZATIONS.map((a) => a.id);
  const internalIds = INITIAL_AUTHORIZATIONS.map((a) => a.internalId);
  const allIds = Array.from(new Set(["[id]", "default", ...ids, ...internalIds]));
  return allIds.map((id) => ({ id }));
}
