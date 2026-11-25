import React, { Suspense } from "react";
import { getAllInquiryIds } from "@/lib/intake/mockIntakeData";
import { InquiryEditView } from "@/components/intake/InquiryEditView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IntakeInquiryEditPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Inquiry Editor...</p>
        </div>
      }
    >
      <InquiryEditView
        inquiryId={resolvedParams.id}
        baseBackPath="/intake/inquiries"
      />
    </Suspense>
  );
}

export function generateStaticParams() {
  const allIds = Array.from(new Set(["[id]", "default", ...getAllInquiryIds()]));
  return allIds.map((id) => ({ id }));
}
