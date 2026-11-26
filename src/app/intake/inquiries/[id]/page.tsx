import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getInquiryById, getAllInquiryIds, INITIAL_INQUIRIES } from "@/lib/intake/mockIntakeData";
import { InquiryDetailsPage } from "@/components/intake/InquiryDetailsPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailsHubPage({ params }: PageProps) {
  const resolvedParams = await params;
  const inquiry =
    getInquiryById(resolvedParams.id) ||
    INITIAL_INQUIRIES.find((i) => i.id.toLowerCase() === resolvedParams.id.toLowerCase()) ||
    INITIAL_INQUIRIES[0];

  if (!inquiry) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Inquiry Profile...</p>
        </div>
      }
    >
      <InquiryDetailsPage
        initialInquiry={inquiry}
        backHref="/intake/pipeline/"
        backLabel="Back to Pipeline & Inquiries"
      />
    </Suspense>
  );
}

export function generateStaticParams() {
  const allIds = Array.from(new Set(["[id]", "default", ...getAllInquiryIds()]));
  return allIds.map((id) => ({ id }));
}
