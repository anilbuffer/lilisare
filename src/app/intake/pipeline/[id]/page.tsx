import React from "react";
import { notFound } from "next/navigation";
import { getInquiryById, getAllInquiryIds, INITIAL_INQUIRIES } from "@/lib/intake/mockIntakeData";
import { InquiryDetailsPage } from "@/components/intake/InquiryDetailsPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const inquiry = getInquiryById(resolvedParams.id) || INITIAL_INQUIRIES.find((i) => i.id.toLowerCase() === resolvedParams.id.toLowerCase()) || INITIAL_INQUIRIES[0];

  if (!inquiry) {
    notFound();
  }

  return (
    <InquiryDetailsPage
      initialInquiry={inquiry}
      backHref="/intake/pipeline/"
      backLabel="Back to Pipeline & Inquiries"
    />
  );
}

export function generateStaticParams() {
  return getAllInquiryIds().map((id) => ({ id }));
}
