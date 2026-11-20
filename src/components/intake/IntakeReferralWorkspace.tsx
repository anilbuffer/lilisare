"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  InquiryRecord,
  InquiryStage,
} from "@/types/intake";
import {
  INITIAL_INQUIRIES,
} from "@/lib/intake/mockIntakeData";
import {
  getIntakeInquiriesFromStorage,
  subscribeToIntakeSync,
} from "@/lib/intake/intakeSync";

import { IntakePageHeader } from "./IntakePageHeader";
import { IntakeKpiStrip } from "./IntakeKpiStrip";
import { InquiryManagementWorkspace } from "./InquiryManagementWorkspace";
import { toast } from "sonner";

export function IntakeReferralWorkspace() {
  const router = useRouter();

  // Main Data States
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(INITIAL_INQUIRIES);

  useEffect(() => {
    setInquiries(getIntakeInquiriesFromStorage());
    const unsubscribe = subscribeToIntakeSync(() => {
      setInquiries(getIntakeInquiriesFromStorage());
    });
    return unsubscribe;
  }, []);

  // Filter States
  const [selectedStage, setSelectedStage] = useState<InquiryStage | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30d");
  const [activeKpiKey, setActiveKpiKey] = useState<"ALL" | "NEW" | "ASSESSMENT" | "CONVERTED">("ALL");

  // Handlers for KPIs
  const handleSelectKpiFilter = (key: "ALL" | "NEW" | "ASSESSMENT" | "CONVERTED") => {
    setActiveKpiKey(key);
    if (key === "ALL") {
      setSelectedStage(null);
    } else if (key === "NEW") {
      setSelectedStage("New Inquiry");
    } else if (key === "ASSESSMENT") {
      setSelectedStage("Needs Discussion");
    } else if (key === "CONVERTED") {
      setSelectedStage("Converted");
    }
  };

  // Stage tab filter click in workspace
  const handleSelectStageFilter = (stage: InquiryStage | null) => {
    setSelectedStage(stage);
    if (stage === "New Inquiry" || stage === "New Lead") setActiveKpiKey("NEW");
    else if (stage === "Needs Discussion" || stage === "CMA Coordination" || stage === "In Assessment" || stage === "CM Coordination") setActiveKpiKey("ASSESSMENT");
    else if (stage === "Converted") setActiveKpiKey("CONVERTED");
    else if (!stage) setActiveKpiKey("ALL");
  };

  // Computed dynamic KPI metrics from live synced inquiries
  const kpiCounts = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.stage === "New Inquiry" || i.stage === "New Lead").length;
    const inAssessmentCount = inquiries.filter(
      (i) => i.stage === "Needs Discussion" || i.stage === "CMA Coordination" || i.stage === "In Assessment" || i.stage === "CM Coordination"
    ).length;
    const convertedCount = inquiries.filter((i) => i.stage === "Converted").length;

    return {
      total,
      newCount,
      inAssessmentCount,
      convertedCount,
    };
  }, [inquiries]);

  // Export Functionality
  const handleExport = (format: "csv" | "summary") => {
    if (format === "csv") {
      const headers = [
        "Inquiry ID",
        "Family Name",
        "Client Name",
        "Stage",
        "Source",
        "Branch",
        "Program",
        "Phone",
        "Hours/Week",
        "Date Received",
      ];
      const rows = inquiries.map((i) => [
        i.id,
        `"${i.familyName}"`,
        `"${i.familyInfo.clientInfo.name}"`,
        i.stage,
        i.source,
        `"${i.branch}"`,
        `"${i.careRequirements.programInterest}"`,
        i.familyInfo.phone,
        i.careRequirements.hoursPerWeek,
        i.dateReceived,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `LiliSare_Intake_Referrals_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 01. Page Header */}
      <IntakePageHeader
        newReferralHref="/intake/pipeline/new/"
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
      />

      {/* 02. KPI Overview (Four clean, dashboard-style cards) */}
      <IntakeKpiStrip
        totalInquiries={kpiCounts.total}
        newInquiries={kpiCounts.newCount}
        inAssessment={kpiCounts.inAssessmentCount}
        converted={kpiCounts.convertedCount}
        activeFilter={activeKpiKey}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* 03. Inquiry Management Workspace (Full-Width with Kanban & List View toggles and Stage filters) */}
      <InquiryManagementWorkspace
        inquiries={inquiries}
        selectedStageFilter={selectedStage}
        onSelectStageFilter={handleSelectStageFilter}
        baseDetailsPath="/intake/pipeline"
      />
    </div>
  );
}
