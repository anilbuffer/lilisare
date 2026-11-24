"use client";

import React from "react";
import { AdminClientDetailView } from "@/components/admin/clients/AdminClientDetailView";

interface ClientDetailViewProps {
  clientId: string;
  baseBackPath?: string;
}

export function ClientDetailView({ clientId, baseBackPath = "/clients" }: ClientDetailViewProps) {
  return <AdminClientDetailView clientId={clientId} baseBackPath={baseBackPath} />;
}
