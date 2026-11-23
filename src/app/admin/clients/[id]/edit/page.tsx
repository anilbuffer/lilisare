import React, { Suspense } from "react";
import { INITIAL_CLIENTS } from "@/lib/clients/mockData";
import { ClientEditView } from "@/components/clients/ClientEditView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminClientEditPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-4xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Client Edit Workspace...</p>
        </div>
      }
    >
      <ClientEditView clientId={resolvedParams.id} baseBackPath="/admin/clients" />
    </Suspense>
  );
}

export function generateStaticParams() {
  const ids = INITIAL_CLIENTS.map((client) => client.id);
  const allIds = Array.from(new Set(["[id]", "default", ...ids]));
  return allIds.map((id) => ({ id }));
}
