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
  normalizePipelineStage,
  computeDaysInPipeline,
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
  const [activeKpiKey, setActiveKpiKey] = useState<"ALL" | "URGENT" | "CONVERTED">("ALL");

  // Handlers for KPIs
  const handleSelectKpiFilter = (key: "ALL" | "URGENT" | "CONVERTED") => {
    setActiveKpiKey(key);
    if (key === "ALL") {
      setSelectedStage(null);
    } else if (key === "URGENT") {
      setSelectedStage(null);
    } else if (key === "CONVERTED") {
      setSelectedStage("Enrolled");
    }
  };

  // Stage tab filter click in workspace
  const handleSelectStageFilter = (stage: InquiryStage | null) => {
    setSelectedStage(stage);
    if (stage && normalizePipelineStage(stage) === "Enrolled") setActiveKpiKey("CONVERTED");
    else if (!stage) setActiveKpiKey("ALL");
  };

  // Computed dynamic KPI metrics from live synced inquiries
  const kpiCounts = useMemo(() => {
    const total = inquiries.length;
    const openInquiries = inquiries.filter((i) => {
      const s = normalizePipelineStage(i.stage);
      return s !== "Enrolled" && s !== "Archived";
    });
    const openCount = openInquiries.length;
    const urgentTriageCount = openInquiries.filter(
      (i) => i.urgency === "Urgent" || i.urgency === "Immediate"
    ).length;
    const convertedCount = inquiries.filter(
      (i) => normalizePipelineStage(i.stage) === "Enrolled"
    ).length;
    const conversionRate =
      total > 0 ? `${((convertedCount / total) * 100).toFixed(1)}%` : "0.0%";
    const avgDaysVal =
      total > 0
        ? (
            inquiries.reduce(
              (sum, i) => sum + computeDaysInPipeline(i.dateReceivedRaw, i.dateReceived),
              0
            ) / total
          ).toFixed(1)
        : "0.0";

    return {
      total,
      openCount,
      urgentTriageCount,
      convertedCount,
      conversionRate,
      intakeVelocity: `${avgDaysVal} days`,
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
        openInquiries={kpiCounts.openCount}
        totalInquiries={kpiCounts.total}
        urgentTriage={kpiCounts.urgentTriageCount}
        converted={kpiCounts.convertedCount}
        conversionRate={kpiCounts.conversionRate}
        intakeVelocity={kpiCounts.intakeVelocity}
        activeFilter={activeKpiKey}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* 03. Inquiry Management Workspace (Full-Width with Kanban & List View toggles and Stage filters) */}
      <InquiryManagementWorkspace
        inquiries={inquiries}
        selectedStageFilter={selectedStage}
        onSelectStageFilter={handleSelectStageFilter}
        urgentOnly={activeKpiKey === "URGENT"}
        baseDetailsPath="/intake/pipeline"
      />
    </div>
  );
}
