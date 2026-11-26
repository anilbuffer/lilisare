import React from "react";
import { EvvExceptionsWorkspace } from "@/components/admin/evv/EvvExceptionsWorkspace";

export const metadata = {
  title: "EVV Exceptions Work Queue | LiliSare Admin",
  description: "Investigate and resolve open EVV visit exceptions, location mismatches, and compliance flags.",
};

export default function AdminEvvExceptionsPage() {
  return <EvvExceptionsWorkspace />;
}
