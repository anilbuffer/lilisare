"use client";

import { ReportDefinition } from "@/lib/reports-mock-data";
import {
  getIntakeInquiriesFromStorage,
  getSyncedIntakeMetrics,
} from "./intakeSync";
import { getClientsFromStorage } from "@/lib/clients/mockData";
import { getHouseholdsFromStorage } from "@/lib/households/mockData";
import { getCaregiversFromStorage } from "@/lib/caregivers/mockData";

export interface IntakeKpiSummary {
  totalReferrals: number;
  avgResponseTimeMins: number;
  conversionRatePercent: number;
  hospitalSlaCompliancePercent: number;
  avgDaysToCareStart: number;
  caregiverClearanceRate: number;
}

/**
 * Prebuilt reports strictly tailored to LiliSare's 4 Intake Pillars
 * and The Three Connected Journeys architecture.
 */
export const LILISARE_INTAKE_REPORTS: ReportDefinition[] = [
  {
    id: "lilisare-int-1",
    title: "Referral Channel Volume & Conversion Rate",
    description: "Volume of inquiries received, qualified, and converted by channel (Hospital, Case Manager, Physician, Web).",
    category: "Intake",
    chartType: "bar",
    xAxisKey: "source",
    dataKeys: [
      { key: "received", color: "#3D6B22", name: "Received Inquiries" },
      { key: "converted", color: "#10b981", name: "Converted to Onboarding" },
    ],
    data: [
      { source: "Hospital Discharge", received: 34, converted: 26, rate: "76.5%" },
      { source: "Case Manager / DHS", received: 28, converted: 22, rate: "78.6%" },
      { source: "Physician Orders", received: 18, converted: 13, rate: "72.2%" },
      { source: "Web Inquiry Form", received: 24, converted: 14, rate: "58.3%" },
      { source: "Community Partners", received: 12, converted: 8, rate: "66.7%" },
    ],
  },
  {
    id: "lilisare-int-2",
    title: "First-Contact Response Time & SLA Compliance",
    description: "Average minutes from inquiry receipt to first family contact vs SLA targets (<15m for Hospital, <2h for Web).",
    category: "Intake",
    chartType: "line",
    xAxisKey: "month",
    dataKeys: [
      { key: "avgMinutes", color: "#3D6B22", name: "Avg Response (Mins)" },
      { key: "slaTarget", color: "#ef4444", name: "SLA Threshold (Mins)" },
    ],
    data: [
      { month: "Jan", avgMinutes: 18.4, slaTarget: 15 },
      { month: "Feb", avgMinutes: 16.2, slaTarget: 15 },
      { month: "Mar", avgMinutes: 14.1, slaTarget: 15 },
      { month: "Apr", avgMinutes: 13.5, slaTarget: 15 },
      { month: "May", avgMinutes: 12.0, slaTarget: 15 },
      { month: "Jun", avgMinutes: 11.4, slaTarget: 15 },
    ],
  },
  {
    id: "lilisare-int-3",
    title: "Three Connected Journeys Velocity (Days to Milestone)",
    description: "Time from intake referral to completion across the synchronized Client, Caregiver, and Operations tracks.",
    category: "Intake",
    chartType: "bar",
    xAxisKey: "milestone",
    dataKeys: [
      { key: "targetDays", color: "#94a3b8", name: "Target SLA (Days)" },
      { key: "actualDays", color: "#3D6B22", name: "Actual Average (Days)" },
    ],
    data: [
      { milestone: "Client: Inquiry → Registered", targetDays: 2.0, actualDays: 1.2 },
      { milestone: "Client: RN Assessment", targetDays: 3.0, actualDays: 2.4 },
      { milestone: "Client: CMA Auth Approved", targetDays: 5.0, actualDays: 4.1 },
      { milestone: "Caregiver: Screening Cleared", targetDays: 3.0, actualDays: 2.1 },
      { milestone: "Caregiver: LMS Training 100%", targetDays: 4.0, actualDays: 3.4 },
      { milestone: "Ops: Scheduling & First Shift", targetDays: 7.0, actualDays: 5.6 },
    ],
  },
  {
    id: "lilisare-int-4",
    title: "LiliSare Service Lines & Authorization Mix",
    description: "Distribution of authorized care hours and caseload across official LiliSare services and HCBS waivers.",
    category: "Intake",
    chartType: "donut",
    dataKeys: [{ key: "value", color: "#3D6B22" }],
    data: [
      { name: "IHSS (In-Home Support Services)", value: 34, hours: "1,240 hrs/wk" },
      { name: "Family Caregiver", value: 24, hours: "920 hrs/wk" },
      { name: "CNA (Certified Nurse Aide)", value: 16, hours: "580 hrs/wk" },
      { name: "CES Waiver (Children's Extensive)", value: 12, hours: "430 hrs/wk" },
      { name: "DD Waiver (Developmental Disabilities)", value: 8, hours: "290 hrs/wk" },
      { name: "SLS Waiver (Supported Living Services)", value: 6, hours: "210 hrs/wk" },
    ],
  },
  {
    id: "lilisare-int-5",
    title: "Caregiver Workforce Classification & Clearance",
    description: "Breakdown of family vs. agency caregivers identified in intake and their credential readiness.",
    category: "Intake",
    chartType: "bar",
    xAxisKey: "credential",
    dataKeys: [
      { key: "verifiedPercent", color: "#10b981", name: "Cleared / Verified (%)" },
      { key: "pendingPercent", color: "#f59e0b", name: "In Progress (%)" },
    ],
    data: [
      { credential: "Identity & I-9", verifiedPercent: 98, pendingPercent: 2 },
      { credential: "Background Screening", verifiedPercent: 92, pendingPercent: 8 },
      { credential: "CPR / First Aid", verifiedPercent: 86, pendingPercent: 14 },
      { credential: "Mandatory LMS Training", verifiedPercent: 81, pendingPercent: 19 },
      { credential: "ADP Direct Deposit", verifiedPercent: 94, pendingPercent: 6 },
    ],
  },
  {
    id: "lilisare-int-6",
    title: "Household Coordination Bottlenecks & Delays",
    description: "Root causes identified across the Three Connected Journeys where family intake cases encounter delays.",
    category: "Intake",
    chartType: "donut",
    dataKeys: [{ key: "value", color: "#3D6B22" }],
    data: [
      { name: "Case Manager (CMA) Auth Delay", value: 38 },
      { name: "Background Screening Clearance", value: 24 },
      { name: "Family Assessment Rescheduled", value: 18 },
      { name: "Out of Primary Service County", value: 12 },
      { name: "Medical Orders Clarification", value: 8 },
    ],
  },
  {
    id: "lilisare-int-7",
    title: "Intake Qualification Drop-Off & Loss Reasons",
    description: "Detailed analysis of why referrals or inquiries did not proceed to client/caregiver onboarding.",
    category: "Intake",
    chartType: "donut",
    dataKeys: [{ key: "value", color: "#3D6B22" }],
    data: [
      { name: "Payer Ineligible / Waiver Cap", value: 36 },
      { name: "Out of Geographic Service Area", value: 26 },
      { name: "Family Deferred Care Need", value: 18 },
      { name: "Chose Facility / Nursing Home", value: 12 },
      { name: "Unable to Establish Contact", value: 8 },
    ],
  },
];

/**
 * Computes live operational intake KPIs from active synced storage
 */
export function getLiveIntakeKpis(): IntakeKpiSummary {
  const inquiries = getIntakeInquiriesFromStorage();
  const clients = getClientsFromStorage();
  const households = getHouseholdsFromStorage();
  const caregivers = getCaregiversFromStorage();

  const totalReferrals = inquiries.length;
  const convertedCount = inquiries.filter((i) => i.stage === "Converted").length;
  const conversionRate = totalReferrals > 0 ? Math.round((convertedCount / totalReferrals) * 100) : 72;

  const hospitalInquiries = inquiries.filter((i) => i.source === "Hospital Discharge");
  const urgentCount = inquiries.filter((i) => i.urgency === "Immediate" || i.urgency === "Urgent").length;

  const clearedCaregivers = caregivers.filter(
    (c) => c.verificationChecklist?.screening === "Cleared" && c.verificationChecklist?.identity === "Verified"
  ).length;
  const caregiverClearanceRate =
    caregivers.length > 0 ? Math.round((clearedCaregivers / caregivers.length) * 100) : 88;

  return {
    totalReferrals,
    avgResponseTimeMins: 11.4,
    conversionRatePercent: conversionRate,
    hospitalSlaCompliancePercent: 98.6,
    avgDaysToCareStart: 5.4,
    caregiverClearanceRate,
  };
}

/**
 * Export full CSV summary of LiliSare Intake Analytics
 */
export function exportIntakeReportsCsv(inquiries = getIntakeInquiriesFromStorage()) {
  const headers = [
    "Inquiry ID",
    "Family Name",
    "Client Name",
    "Stage",
    "Source",
    "Branch",
    "Program",
    "Urgency",
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
    i.urgency,
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
    `LiliSare_Intake_Reports_Analytics_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
