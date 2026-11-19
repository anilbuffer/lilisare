"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  InquiryRecord,
  InquiryStage,
  FollowUpTask,
  RecentActivityItem,
} from "@/types/intake";
import {
  INITIAL_INQUIRIES,
  INITIAL_FOLLOW_UP_TASKS,
  INITIAL_RECENT_ACTIVITIES,
} from "@/lib/intake/mockIntakeData";

import { IntakePageHeader } from "./IntakePageHeader";
import { IntakeKpiStrip } from "./IntakeKpiStrip";
import { InquiryManagementWorkspace } from "./InquiryManagementWorkspace";
import { FollowUpTasksSection } from "./FollowUpTasksSection";
import { RecentActivitySection } from "./RecentActivitySection";
import { toast } from "sonner";

export function IntakeReferralWorkspace() {
  const router = useRouter();

  // Main Data States
  const [inquiries] = useState<InquiryRecord[]>(INITIAL_INQUIRIES);
  const [tasks] = useState<FollowUpTask[]>(INITIAL_FOLLOW_UP_TASKS);
  const [activities] = useState<RecentActivityItem[]>(INITIAL_RECENT_ACTIVITIES);

  // Filter States
  const [selectedStage, setSelectedStage] = useState<InquiryStage | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("All Branches");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30d");
  const [activeKpiKey, setActiveKpiKey] = useState<"ALL" | "NEW" | "ASSESSMENT" | "CONVERTED">("ALL");

  // Filter by branch if selected
  const branchFilteredInquiries = useMemo(() => {
    if (selectedBranch === "All Branches") return inquiries;
    return inquiries.filter((i) => i.branch === selectedBranch);
  }, [inquiries, selectedBranch]);

  // Handlers for KPIs
  const handleSelectKpiFilter = (key: "ALL" | "NEW" | "ASSESSMENT" | "CONVERTED") => {
    setActiveKpiKey(key);
    if (key === "ALL") {
      setSelectedStage(null);
    } else if (key === "NEW") {
      setSelectedStage("New Lead");
    } else if (key === "ASSESSMENT") {
      setSelectedStage("In Assessment");
    } else if (key === "CONVERTED") {
      setSelectedStage("Converted");
    }
  };

  // Stage tab filter click in workspace
  const handleSelectStageFilter = (stage: InquiryStage | null) => {
    setSelectedStage(stage);
    if (stage === "New Lead") setActiveKpiKey("NEW");
    else if (stage === "In Assessment" || stage === "CM Coordination") setActiveKpiKey("ASSESSMENT");
    else if (stage === "Converted") setActiveKpiKey("CONVERTED");
    else if (!stage) setActiveKpiKey("ALL");
  };

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

  const handleSelectInquiryById = (id: string) => {
    router.push(`/intake/pipeline/${id}`);
  };

  const handleTaskAction = (task: FollowUpTask) => {
    router.push(`/intake/pipeline/${task.inquiryId}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-12 animate-in fade-in duration-200">
      {/* 01. Page Header */}
      <IntakePageHeader
        newReferralHref="/intake/pipeline/new"
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
        onExport={handleExport}
        totalCount={79}
      />

      {/* 02. KPI Overview (Four clean, dashboard-style cards) */}
      <IntakeKpiStrip
        totalInquiries={79}
        newInquiries={24}
        inAssessment={21}
        converted={16}
        activeFilter={activeKpiKey}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* 03. Inquiry Management Workspace (Full-Width with Grid & List View toggles and Stage filters) */}
      <InquiryManagementWorkspace
        inquiries={branchFilteredInquiries}
        selectedStageFilter={selectedStage}
        onSelectStageFilter={handleSelectStageFilter}
        baseDetailsPath="/intake/pipeline"
      />

      {/* 04. Secondary Sections: Follow-up & Tasks | Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FollowUpTasksSection
          tasks={tasks}
          onTaskAction={handleTaskAction}
          onSelectInquiryById={handleSelectInquiryById}
        />
        <RecentActivitySection
          activities={activities}
          onSelectInquiryById={handleSelectInquiryById}
        />
      </div>
    </div>
  );
}
