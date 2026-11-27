"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Caregiver } from "@/lib/caregivers/mockData";
import { ResponsiveDomainTabStrip } from "@/components/ui/ResponsiveDomainTabStrip";

// Placeholders for tabs
import { OverviewTab } from "@/components/caregivers/tabs/OverviewTab";
import { CertificationsTab } from "@/components/caregivers/tabs/CertificationsTab";
import { AvailabilityTab } from "@/components/caregivers/tabs/AvailabilityTab";
import { PerformanceTab } from "@/components/caregivers/tabs/PerformanceTab";
import { AssignedPatientsTab } from "@/components/caregivers/tabs/AssignedPatientsTab";
import { DocumentsTab } from "@/components/caregivers/tabs/DocumentsTab";
import { PayrollTab } from "@/components/caregivers/tabs/PayrollTab";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "certifications", label: "Certifications" },
  { id: "availability", label: "Availability" },
  { id: "performance", label: "Performance" },
  { id: "assigned-patients", label: "Assigned Patients" },
  { id: "documents", label: "Documents" },
  { id: "payroll", label: "Payroll" },
];

interface CaregiverTabsProps {
  caregiver: Caregiver;
  onRunChecks?: () => void;
  onViewScreeningDetails?: () => void;
  onViewDocument?: (title: string, category?: string, date?: string) => void;
  onViewCertificate?: (cert: { name: string; issuer: string; issueDate: string; expiryDate: string; status: string }) => void;
  onTriggerToast?: (msg: string) => void;
  onEditAvailability?: () => void;
  onAddRegion?: () => void;
  onScheduleShift?: () => void;
  regions?: string[];
  onViewFeedback?: () => void;
  onAssignPatient?: () => void;
  onUploadDocument?: () => void;
  onDownloadDocument?: (title: string) => void;
  extraDocuments?: Array<{ name: string; category: string; date: string; size: string }>;
  onViewPayStubs?: () => void;
  onDownloadPayStub?: (period: string) => void;
}

export function CaregiverTabs({
  caregiver,
  onRunChecks,
  onViewScreeningDetails,
  onViewDocument,
  onViewCertificate,
  onTriggerToast,
  onEditAvailability,
  onAddRegion,
  onScheduleShift,
  regions,
  onViewFeedback,
  onAssignPatient,
  onUploadDocument,
  onDownloadDocument,
  extraDocuments,
  onViewPayStubs,
  onDownloadPayStub,
}: CaregiverTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="mb-4">
        <ResponsiveDomainTabStrip
          tabs={tabs}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          ariaLabel="Caregiver profile sections"
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
            {activeTab === "overview" && (
              <OverviewTab
                caregiver={caregiver}
                onRunChecks={onRunChecks}
                onViewScreeningDetails={onViewScreeningDetails}
              />
            )}
            {activeTab === "certifications" && (
              <CertificationsTab
                caregiver={caregiver}
                onViewDocument={onViewDocument}
                onViewCertificate={onViewCertificate}
                onTriggerToast={onTriggerToast}
              />
            )}
            {activeTab === "availability" && (
              <AvailabilityTab
                caregiver={caregiver}
                onEditAvailability={onEditAvailability}
                onAddRegion={onAddRegion}
                onScheduleShift={onScheduleShift}
                regions={regions}
              />
            )}
            {activeTab === "performance" && (
              <PerformanceTab
                caregiver={caregiver}
                onViewFeedback={onViewFeedback}
              />
            )}
            {activeTab === "assigned-patients" && (
              <AssignedPatientsTab
                caregiver={caregiver}
                onAssignPatient={onAssignPatient}
              />
            )}
            {activeTab === "documents" && (
              <DocumentsTab
                caregiver={caregiver}
                onUploadDocument={onUploadDocument}
                onViewDocument={onViewDocument}
                onDownloadDocument={onDownloadDocument}
                extraDocuments={extraDocuments}
              />
            )}
            {activeTab === "payroll" && (
              <PayrollTab
                caregiver={caregiver}
                onViewPayStubs={onViewPayStubs}
                onDownloadPayStub={onDownloadPayStub}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
