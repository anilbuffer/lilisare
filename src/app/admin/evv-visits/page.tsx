import React from "react";
import { EvvVisitsWorkspace } from "@/components/admin/evv/EvvVisitsWorkspace";

export const metadata = {
  title: "EVV Visits & Monitoring | LiliSare Admin",
  description: "Monitor visit activity, identify exceptions, and review EVV records.",
};

export default function AdminEvvVisitsPage() {
  return <EvvVisitsWorkspace />;
}
