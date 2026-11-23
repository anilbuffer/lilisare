"use client";

import React from "react";
import { NewReferralFullPage } from "@/components/intake/NewReferralFullPage";

export default function AdminNewReferralPage() {
  return (
    <NewReferralFullPage
      backHref="/admin/intake-referrals"
      onSuccessRedirectHref="/admin/intake-referrals"
    />
  );
}
