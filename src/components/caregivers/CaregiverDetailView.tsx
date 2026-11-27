"use client";

import React from "react";
import { AdminCaregiverDetailView } from "@/components/admin/caregivers/AdminCaregiverDetailView";

interface CaregiverDetailViewProps {
  caregiverId: string;
  baseBackPath?: string;
  initialEditMode?: boolean;
}

export function CaregiverDetailView({
  caregiverId,
  baseBackPath = "/caregivers",
  initialEditMode = false,
}: CaregiverDetailViewProps) {
  return (
    <AdminCaregiverDetailView
      caregiverId={caregiverId}
      baseBackPath={baseBackPath}
      initialEditMode={initialEditMode}
    />
  );
}
