import React, { Suspense } from "react";
import { AdminAuthorizationForm } from "@/components/admin/authorizations/AdminAuthorizationForm";

export default function AdminNewAuthorizationPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
          <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Initializing New Authorization Form...</p>
        </div>
      }
    >
      <AdminAuthorizationForm mode="create" />
    </Suspense>
  );
}
