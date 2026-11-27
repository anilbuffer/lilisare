"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Patient } from "@/lib/patients/mockData";
import { OverviewTab } from "@/components/patients/tabs/OverviewTab";
import { CarePlanTab } from "@/components/patients/tabs/CarePlanTab";
import { VisitsTab } from "@/components/patients/tabs/VisitsTab";
import { MedicationsTab } from "@/components/patients/tabs/MedicationsTab";
import { DocumentsTab } from "@/components/patients/tabs/DocumentsTab";
import { BillingTab } from "@/components/patients/tabs/BillingTab";
import { CommunicationTab } from "@/components/patients/tabs/CommunicationTab";
import { ChronologyTab } from "./tabs/ChronologyTab";
import { AssessmentsTab } from "@/components/patients/tabs/AssessmentsTab";
import { useAuth } from "@/hooks/useAuth";
import { ResponsiveDomainTabStrip } from "@/components/ui/ResponsiveDomainTabStrip";

const allTabs = [
  { id: "overview", label: "Overview" },
  { id: "careplan", label: "Care Plan" },
  { id: "visits", label: "Visits" },
  { id: "medications", label: "Medications" },
  { id: "documents", label: "Documents" },
  { id: "billing", label: "Billing" },
  { id: "communication", label: "Communication" },
  { id: "chronology", label: "Chronology" },
  { id: "assessments", label: "Assessments" },
];

function PatientTabsContent({ patient }: { patient: Patient }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const tabs = currentUser?.role === "INTAKE_COORDINATOR"
    ? allTabs.filter(t => ["overview", "documents", "billing", "communication"].includes(t.id))
    : currentUser?.role === "CLINICAL_SUPERVISOR_RN"
      ? allTabs.filter(t => t.id !== "billing")
      : allTabs;

  const tabFromUrl = searchParams.get("tab");
  const initialTab = tabFromUrl && tabs.some(t => t.id === tabFromUrl) ? tabFromUrl : "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (tabFromUrl && tabs.some(t => t.id === tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`${pathname}?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="mb-4">
        <ResponsiveDomainTabStrip
          tabs={tabs}
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          ariaLabel="Client record sections"
        />
      </div>

      {/* Tab Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <OverviewTab patient={patient} />}
            {activeTab === "careplan" && <CarePlanTab patient={patient} />}
            {activeTab === "visits" && <VisitsTab patient={patient} />}
            {activeTab === "medications" && <MedicationsTab patient={patient} />}
            {activeTab === "documents" && <DocumentsTab patient={patient} />}
            {activeTab === "billing" && <BillingTab patient={patient} />}
            {activeTab === "communication" && <CommunicationTab patient={patient} />}
            {activeTab === "chronology" && <ChronologyTab patient={patient} />}
            {activeTab === "assessments" && <AssessmentsTab patient={patient} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function PatientTabs({ patient }: { patient: Patient }) {
  return (
    <Suspense fallback={<div>Loading tabs...</div>}>
      <PatientTabsContent patient={patient} />
    </Suspense>
  );
}
