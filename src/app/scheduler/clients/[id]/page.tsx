import React, { Suspense } from "react";
import { INITIAL_CLIENTS } from "@/lib/clients/mockData";
import { AdminClientDetailView } from "@/components/admin/clients/AdminClientDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SchedulerClientDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Scheduling Client Profile...</p>
        </div>
      }
    >
      <AdminClientDetailView
        clientId={resolvedParams.id}
        baseBackPath="/scheduler/clients"
        userRole="scheduler"
      />
    </Suspense>
  );
}

export function generateStaticParams() {
  const ids = INITIAL_CLIENTS.map((client) => client.id);
  const allIds = Array.from(new Set(["[id]", "default", ...ids]));
  return allIds.map((id) => ({ id }));
}
