import React from "react";
import { EvvSubmissionsWorkspace } from "@/components/admin/evv/EvvSubmissionsWorkspace";

export const metadata = {
  title: "EVV Aggregator Submissions | LiliSare Admin",
  description: "Monitor external aggregator submissions, acknowledgements, batch reconciliations, and retry rejected records.",
};

export default function AdminEvvSubmissionsPage() {
  return <EvvSubmissionsWorkspace />;
}
