import React, { Suspense } from "react";
import { SEED_ADMIN_REFERRALS } from "@/lib/intake-referrals/adminIntakeReferralsData";
import { AdminIntakeReferralDetailView } from "@/components/admin/intake-referrals/AdminIntakeReferralDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminIntakeReferralDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Referral Profile...</p>
        </div>
      }
    >
      <AdminIntakeReferralDetailView referralId={resolvedParams.id} />
    </Suspense>
  );
}

export function generateStaticParams() {
  const ids = SEED_ADMIN_REFERRALS.map((ref) => ref.id);
  const allIds = Array.from(new Set(["[id]", "default", ...ids]));
  return allIds.map((id) => ({ id }));
}
