"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AuthorizationRecord, getAuthorizationById } from "@/lib/admin/authorizationsData";
import { AdminAuthorizationForm } from "./AdminAuthorizationForm";

interface AdminAuthorizationEditClientProps {
  authId: string;
}

export function AdminAuthorizationEditClient({ authId }: AdminAuthorizationEditClientProps) {
  const [record, setRecord] = useState<AuthorizationRecord | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const item = getAuthorizationById(authId);
    if (item) {
      setRecord(item);
    }
    setIsLoaded(true);
  }, [authId]);

  if (!isLoaded) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Authorization for Edit...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Authorization Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Could not locate authorization ID "{authId}" to edit.
        </p>
        <Link
          href="/admin/authorizations"
          className="inline-flex items-center gap-2 px-4 py-2 mt-5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl transition-all shadow-md shadow-[#3D6B22]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorizations Directory</span>
        </Link>
      </div>
    );
  }

  return <AdminAuthorizationForm initialRecord={record} mode="edit" />;
}
