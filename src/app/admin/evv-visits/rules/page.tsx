import React from "react";
import { EvvRulesWorkspace } from "@/components/admin/evv/EvvRulesWorkspace";

export const metadata = {
  title: "EVV Tolerance & Verification Rules | LiliSare Admin",
  description: "Configure EVV grace windows, arrival and departure tolerances, and review thresholds by payer and program.",
};

export default function AdminEvvRulesPage() {
  return <EvvRulesWorkspace />;
}
