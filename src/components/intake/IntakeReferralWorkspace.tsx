"use client";

import React, { useState, useMemo } from "react";
import {
  InquiryRecord,
  InquiryStage,
  FollowUpTask,
  RecentActivityItem,
  PipelineStageCount,
  DocumentItem,
} from "@/types/intake";
import {
  INITIAL_INQUIRIES,
  PIPELINE_STAGE_DATA,
  INITIAL_FOLLOW_UP_TASKS,
  INITIAL_RECENT_ACTIVITIES,
} from "@/lib/intake/mockIntakeData";

import { IntakePageHeader } from "./IntakePageHeader";
import { IntakeKpiStrip } from "./IntakeKpiStrip";
import { IntakePipelineBar } from "./IntakePipelineBar";
import { InquiryManagementWorkspace } from "./InquiryManagementWorkspace";
import { FollowUpTasksSection } from "./FollowUpTasksSection";
import { RecentActivitySection } from "./RecentActivitySection";

import { NewReferralDrawer } from "./modals/NewReferralDrawer";
import { ConvertToOnboardingModal } from "./modals/ConvertToOnboardingModal";
import { ContactFamilyModal } from "./modals/ContactFamilyModal";
import { ScheduleAssessmentModal } from "./modals/ScheduleAssessmentModal";
import { AssignCoordinatorModal } from "./modals/AssignCoordinatorModal";
import { toast } from "sonner";

export function IntakeReferralWorkspace() {
  // Main Data States
  const [inquiries, setInquiries] = useState<InquiryRecord[]>(INITIAL_INQUIRIES);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(INITIAL_INQUIRIES[0]?.id || "");
  const [tasks, setTasks] = useState<FollowUpTask[]>(INITIAL_FOLLOW_UP_TASKS);
  const [activities, setActivities] = useState<RecentActivityItem[]>(INITIAL_RECENT_ACTIVITIES);

  // Filter States
  const [selectedStage, setSelectedStage] = useState<InquiryStage | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("All Branches");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30d");
  const [activeKpiKey, setActiveKpiKey] = useState<"ALL" | "NEW" | "ASSESSMENT" | "CONVERTED">("ALL");

  // Modal Dialog States
  const [isNewReferralOpen, setIsNewReferralOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Active Inquiry Reference
  const selectedInquiry = useMemo(() => {
    return inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0] || null;
  }, [inquiries, selectedInquiryId]);

  // Dynamic Pipeline Stage Counts based on active records
  const pipelineStages = useMemo(() => {
    const counts: Record<InquiryStage, number> = {
      "New Lead": 24,
      "Contacted": 18,
      "In Assessment": 12,
      "CM Coordination": 9,
      "Converted": 16,
    };

    // Reflect any runtime updates
    const currentCounts = { ...counts };
    inquiries.forEach((item) => {
      // Keep pipeline base counts in sync with live additions
    });

    const maxCount = Math.max(...Object.values(currentCounts), 24);

    return PIPELINE_STAGE_DATA.map((s) => ({
      ...s,
      count: currentCounts[s.stage] ?? s.count,
      percentageOfMax: ((currentCounts[s.stage] ?? s.count) / maxCount) * 100,
    }));
  }, [inquiries]);

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

  // Pipeline stage click
  const handleSelectPipelineStage = (stage: InquiryStage | null) => {
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

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `LiliSare_Intake_Referrals_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  // Create New Referral
  const handleCreateReferral = (newInquiry: InquiryRecord) => {
    setInquiries((prev) => [newInquiry, ...prev]);
    setSelectedInquiryId(newInquiry.id);

    // Add to recent activity
    const newActivity: RecentActivityItem = {
      id: `act-${Date.now()}`,
      type: "referral_received",
      inquiryId: newInquiry.id,
      title: "New referral received",
      description: `${newInquiry.familyInfo.clientInfo.name} via ${newInquiry.source}`,
      timestamp: "Just now",
      actor: "Admin User",
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Convert to Onboarding
  const handleConfirmConversion = (inquiryId: string) => {
    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id === inquiryId) {
          const clientProfId = `CLI-${Math.floor(9100 + Math.random() * 50)}`;
          const caregiverProfId = i.familyInfo.potentialCaregiver?.name ? `CG-${Math.floor(4500 + Math.random() * 50)}` : undefined;

          return {
            ...i,
            stage: "Converted",
            onboardingStatus: {
              converted: true,
              convertedAt: "Just now",
              clientProfileId: clientProfId,
              caregiverProfileId: caregiverProfId,
            },
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "status_change",
                author: "Admin User",
                timestamp: "Just now",
                title: "Inquiry Converted to Onboarding",
                details: `Transferred to Client Registration (${clientProfId}) and Caregiver Onboarding (${caregiverProfId || "Agency Pool"}).`,
              },
              ...i.timeline,
            ],
          };
        }
        return i;
      })
    );

    // Add activity
    const convertedItem = inquiries.find((i) => i.id === inquiryId);
    if (convertedItem) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: "referral_converted",
          inquiryId: inquiryId,
          title: "Referral converted",
          description: `${convertedItem.familyInfo.clientInfo.name} moved to Client & Caregiver Onboarding`,
          timestamp: "Just now",
          actor: "Admin User",
        },
        ...prev,
      ]);
    }

    setIsConvertModalOpen(false);
  };

  // Add Note to Inquiry
  const handleAddTimelineNote = (inquiryId: string, noteText: string) => {
    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id === inquiryId) {
          return {
            ...i,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "note",
                author: "Intake Coordinator",
                authorRole: "Staff",
                timestamp: "Just now",
                title: "Coordinator Note Added",
                details: noteText,
              },
              ...i.timeline,
            ],
          };
        }
        return i;
      })
    );
  };

  // Log Communication
  const handleLogCommunication = (inquiryId: string, type: "call" | "email" | "note", note: string) => {
    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id === inquiryId) {
          return {
            ...i,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: type,
                author: "Intake Staff",
                authorRole: "Care Coordinator",
                timestamp: "Just now",
                title: type === "call" ? "Phone Call Completed" : type === "email" ? "Email Message Sent" : "Note Recorded",
                details: note,
              },
              ...i.timeline,
            ],
          };
        }
        return i;
      })
    );
  };

  // Schedule Assessment
  const handleScheduleAssessment = (
    inquiryId: string,
    details: {
      scheduledDate: string;
      scheduledTime: string;
      assessor: string;
      type: string;
      notes: string;
    }
  ) => {
    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id === inquiryId) {
          return {
            ...i,
            stage: "In Assessment",
            assessmentStatus: "Scheduled",
            assessmentDetails: details,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "assessment",
                author: details.assessor,
                timestamp: "Just now",
                title: `RN Assessment Scheduled (${details.scheduledDate} ${details.scheduledTime})`,
                details: `${details.type}. Special Instructions: ${details.notes}`,
              },
              ...i.timeline,
            ],
          };
        }
        return i;
      })
    );
  };

  // Assign Coordinator
  const handleAssignCoordinator = (inquiryId: string, coordinatorName: string, role: string) => {
    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id === inquiryId) {
          return {
            ...i,
            referralInfo: {
              ...i.referralInfo,
              assignedCoordinator: {
                ...i.referralInfo.assignedCoordinator,
                name: coordinatorName,
                role: role,
              },
            },
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "assignment",
                author: "Admin User",
                timestamp: "Just now",
                title: `Coordinator Reassigned to ${coordinatorName}`,
                details: `Role updated to ${role}.`,
              },
              ...i.timeline,
            ],
          };
        }
        return i;
      })
    );
  };

  // Update Status Stage
  const handleUpdateStatus = (inquiry: InquiryRecord, newStage: InquiryStage) => {
    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id === inquiry.id) {
          return {
            ...i,
            stage: newStage,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "status_change",
                author: "Admin User",
                timestamp: "Just now",
                title: `Stage Updated to ${newStage}`,
                details: `Inquiry status changed from ${i.stage} to ${newStage}.`,
              },
              ...i.timeline,
            ],
          };
        }
        return i;
      })
    );
    toast.success(`Stage updated to ${newStage}`);
  };

  // Toggle Document Status
  const handleToggleDocumentStatus = (inquiryId: string, docId: string) => {
    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id === inquiryId) {
          const updatedDocs: DocumentItem[] = i.documents.map((d) => {
            if (d.id === docId) {
              const nextStatus: DocumentItem["status"] =
                d.status === "Received"
                  ? "Missing"
                  : d.status === "Missing"
                  ? "Pending Review"
                  : "Received";
              return { ...d, status: nextStatus };
            }
            return d;
          });
          return { ...i, documents: updatedDocs };
        }
        return i;
      })
    );
    toast.info("Document verification updated");
  };

  // Task Action Quick Router
  const handleTaskAction = (task: FollowUpTask) => {
    setSelectedInquiryId(task.inquiryId);
    if (task.type === "first_contact" || task.type === "family_response") {
      setIsContactModalOpen(true);
    } else if (task.type === "assessment_scheduling") {
      setIsScheduleModalOpen(true);
    } else {
      toast.info(`Reviewing documentation for ${task.familyName}`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 01. Page Header */}
      <IntakePageHeader
        onNewReferral={() => setIsNewReferralOpen(true)}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
        onExport={handleExport}
        totalCount={79}
      />

      {/* 02. KPI Overview (Four meaningful cards) */}
      <IntakeKpiStrip
        totalInquiries={79}
        newInquiries={24}
        inAssessment={21}
        converted={16}
        activeFilter={activeKpiKey}
        onSelectKpiFilter={handleSelectKpiFilter}
      />

      {/* 03. Intake Pipeline (Horizontal visual heart of the page) */}
      <IntakePipelineBar
        stages={pipelineStages}
        selectedStage={selectedStage}
        onSelectStage={handleSelectPipelineStage}
        totalActive={79}
      />

      {/* 04. Inquiry Management Workspace (Split-pane experience) */}
      <InquiryManagementWorkspace
        inquiries={branchFilteredInquiries}
        selectedInquiry={selectedInquiry}
        onSelectInquiry={(inq) => setSelectedInquiryId(inq.id)}
        selectedStageFilter={selectedStage}
        onSelectStageFilter={handleSelectPipelineStage}
        onContactFamily={(inq) => {
          setSelectedInquiryId(inq.id);
          setIsContactModalOpen(true);
        }}
        onAssignCoordinator={(inq) => {
          setSelectedInquiryId(inq.id);
          setIsAssignModalOpen(true);
        }}
        onScheduleAssessment={(inq) => {
          setSelectedInquiryId(inq.id);
          setIsScheduleModalOpen(true);
        }}
        onUpdateStatus={handleUpdateStatus}
        onConvertToOnboarding={(inq) => {
          setSelectedInquiryId(inq.id);
          setIsConvertModalOpen(true);
        }}
        onAddTimelineNote={handleAddTimelineNote}
        onToggleDocumentStatus={handleToggleDocumentStatus}
      />

      {/* 05 & 06. Secondary Sections: Follow-up & Tasks | Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FollowUpTasksSection
          tasks={tasks}
          onTaskAction={handleTaskAction}
          onSelectInquiryById={(id) => setSelectedInquiryId(id)}
        />
        <RecentActivitySection
          activities={activities}
          onSelectInquiryById={(id) => setSelectedInquiryId(id)}
        />
      </div>

      {/* Modals & Guided Experience */}
      <NewReferralDrawer
        isOpen={isNewReferralOpen}
        onClose={() => setIsNewReferralOpen(false)}
        onSubmit={handleCreateReferral}
      />

      {selectedInquiry && (
        <>
          <ConvertToOnboardingModal
            isOpen={isConvertModalOpen}
            onClose={() => setIsConvertModalOpen(false)}
            inquiry={selectedInquiry}
            onConfirmConversion={handleConfirmConversion}
          />

          <ContactFamilyModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            inquiry={selectedInquiry}
            onLogCommunication={handleLogCommunication}
          />

          <ScheduleAssessmentModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            inquiry={selectedInquiry}
            onConfirmSchedule={handleScheduleAssessment}
          />

          <AssignCoordinatorModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            inquiry={selectedInquiry}
            onConfirmAssignment={handleAssignCoordinator}
          />
        </>
      )}
    </div>
  );
}
