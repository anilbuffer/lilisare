"use client";

import React from "react";
import { NewReferralFullPage } from "@/components/intake/NewReferralFullPage";

export default function NewPipelineReferralPage() {
  return (
    <NewReferralFullPage
      backHref="/intake/pipeline"
      onSuccessRedirectHref="/intake/pipeline"
    />
  );
}
