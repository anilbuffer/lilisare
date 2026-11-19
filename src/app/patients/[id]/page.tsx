import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { mockPatients } from "@/lib/patients/mockData";
import { INITIAL_CLIENTS, getClientById } from "@/lib/clients/mockData";
import { PatientHeader } from "@/components/patients/PatientHeader";
import { PatientTabs } from "@/components/patients/PatientTabs";
import { ClientDetailView } from "@/components/clients/ClientDetailView";

export default async function PatientHubPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const clientId = resolvedParams.id;

  // Check if it's a LiliSare Client record (e.g. CL-1001, CL-1002, etc.)
  const lilisareClient = INITIAL_CLIENTS.find((c) => c.id === clientId) || getClientById(clientId);
  if (lilisareClient) {
    return (
      <Suspense
        fallback={
          <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
            <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
            <p className="font-semibold text-xs text-slate-600">Loading Client Profile...</p>
          </div>
        }
      >
        <ClientDetailView clientId={clientId} />
      </Suspense>
    );
  }

  // Fallback to legacy mock patient
  const patient = mockPatients[clientId];
  if (!patient) {
    notFound();
  }

  return (
    <div className="w-full">
      <PatientHeader patient={patient} />
      <PatientTabs patient={patient} />
    </div>
  );
}

export function generateStaticParams() {
  const patientKeys = Object.keys(mockPatients).map((id) => ({ id }));
  const clientKeys = INITIAL_CLIENTS.map((c) => ({ id: c.id }));
  return [...patientKeys, ...clientKeys];
}
