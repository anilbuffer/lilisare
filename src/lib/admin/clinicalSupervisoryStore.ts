import {
  ClinicalAuditEvent,
  ClinicalDocumentation,
  ClinicalFollowUp,
  ClinicalKpiSummary,
  ClinicalMockNotification,
  ClinicalProfessional,
  ClinicalProfessionalType,
  ClinicalRequirement,
  ClinicalReview,
  ClinicalReviewStatus,
  ClinicalRule,
  ClinicalVisit,
  ClinicalVisitCategory,
  ClinicalVisitStatus,
  DocumentationStatus,
  PriorityLevel,
  RequirementStatus,
  VisitDeliveryMethod,
} from "@/types/clinicalSupervisory";
import { RealTimeVisit } from "@/types/scheduling";
import { INITIAL_CLIENTS, getClientsFromStorage } from "@/lib/clients/mockData";
import { getVisitsFromStorage, saveVisitsToStorage } from "@/lib/scheduling/schedulingStore";
import {
  ClinicalActorContext,
  assertClinicalPermission,
  isProfessionalEligibleForType,
} from "./clinicalAuthGuard";

export const CLINICAL_REQ_STORAGE_KEY = "lilisare_clinical_requirements_v1";
export const CLINICAL_VISIT_STORAGE_KEY = "lilisare_clinical_visits_v1";
export const CLINICAL_DOC_STORAGE_KEY = "lilisare_clinical_docs_v1";
export const CLINICAL_REVIEW_STORAGE_KEY = "lilisare_clinical_reviews_v1";
export const CLINICAL_FOLLOWUP_STORAGE_KEY = "lilisare_clinical_followups_v1";
export const CLINICAL_RULE_STORAGE_KEY = "lilisare_clinical_rules_v1";
export const CLINICAL_AUDIT_STORAGE_KEY = "lilisare_clinical_audit_v1";
export const CLINICAL_NOTIF_STORAGE_KEY = "lilisare_clinical_mock_notifs_v1";
export const CLINICAL_SYNC_EVENT = "lilisare_clinical_sync";

export const DEMO_TODAY = "2026-11-26";

export const CLINICAL_AGENCIES = [
  { id: "AGY-OR-SPR", name: "LiliSare Oregon — Springfield", state: "OR" },
  { id: "AGY-OR-PDX", name: "LiliSare Oregon — Portland", state: "OR" },
  { id: "AGY-IA-CF", name: "LiliSare Midwest — Cedar Falls", state: "IA" },
  { id: "AGY-GA-ATL", name: "LiliSare Southeast — Atlanta", state: "GA" },
];

export const CLINICAL_PROGRAMS = [
  "Pediatric In-Home Care",
  "IHSS (In-Home Support Services)",
  "CNA (Certified Nurse Aide)",
  "EBD Waiver (Elderly, Blind, and Disabled)",
  "DD Waiver (Developmental Disabilities)",
  "CHCBS Waiver (Children’s Home and Community-Based Services)",
  "CHRP Waiver (Children’s Habilitation Residential Program)",
  "SLS Waiver (Supported Living Services)",
  "Family Caregiver",
  "PDN (Private Duty Nursing)",
  "HMA (Health Maintenance Activities)",
];

export const CLINICAL_PROFESSIONALS: ClinicalProfessional[] = [
  {
    id: "PROF-RN-01",
    name: "Rachel Miller, RN",
    roleTitle: "Clinical Supervisor / RN",
    qualificationType: "RN",
    licenseNumber: "RN-OR-88412",
    licenseExpiry: "2027-09-30",
    agencies: ["AGY-OR-SPR", "AGY-OR-PDX", "AGY-IA-CF"],
    programs: CLINICAL_PROGRAMS,
    canPerformRnVisits: true,
    canPerformClinicalSignOff: true,
    activeCaseloadCount: 14,
    avatarInitials: "RM",
    email: "rachel.m@lilisare.com",
    phone: "(541) 555-3102",
    status: "Active",
  },
  {
    id: "PROF-RN-02",
    name: "Carlos Mendez, RN",
    roleTitle: "Clinical Supervisor / RN",
    qualificationType: "RN",
    licenseNumber: "RN-OR-77290",
    licenseExpiry: "2027-06-15",
    agencies: ["AGY-OR-SPR", "AGY-OR-PDX", "AGY-GA-ATL"],
    programs: CLINICAL_PROGRAMS,
    canPerformRnVisits: true,
    canPerformClinicalSignOff: true,
    activeCaseloadCount: 16,
    avatarInitials: "CM",
    email: "carlos.mendez@lilisare.com",
    phone: "(503) 555-2219",
    status: "Active",
  },
  {
    id: "PROF-RN-03",
    name: "Evelyn Vance, RN",
    roleTitle: "Supervising Nurse RN",
    qualificationType: "RN",
    licenseNumber: "RN-OR-64108",
    licenseExpiry: "2027-12-31",
    agencies: ["AGY-OR-SPR", "AGY-OR-PDX"],
    programs: CLINICAL_PROGRAMS,
    canPerformRnVisits: true,
    canPerformClinicalSignOff: true,
    activeCaseloadCount: 11,
    avatarInitials: "EV",
    email: "evelyn.vance@lilisare.com",
    phone: "(541) 555-7740",
    status: "Active",
  },
  {
    id: "PROF-RN-04",
    name: "Brenda Larson, RN",
    roleTitle: "Case & Clinical Supervisor RN",
    qualificationType: "RN",
    licenseNumber: "RN-IA-55210",
    licenseExpiry: "2027-04-30",
    agencies: ["AGY-OR-SPR", "AGY-IA-CF"],
    programs: CLINICAL_PROGRAMS,
    canPerformRnVisits: true,
    canPerformClinicalSignOff: true,
    activeCaseloadCount: 9,
    avatarInitials: "BL",
    email: "brenda.larson@lilisare.com",
    phone: "(319) 555-8812",
    status: "Active",
  },
  {
    id: "PROF-FS-01",
    name: "Marcus Vance",
    roleTitle: "Field Supervisor (Non-RN)",
    qualificationType: "Field Supervisor",
    licenseNumber: "SUP-OR-310",
    licenseExpiry: "2027-08-01",
    agencies: ["AGY-OR-SPR", "AGY-OR-PDX", "AGY-IA-CF"],
    programs: [
      "IHSS (In-Home Support Services)",
      "Family Caregiver",
      "EBD Waiver (Elderly, Blind, and Disabled)",
    ],
    canPerformRnVisits: false,
    canPerformClinicalSignOff: false,
    activeCaseloadCount: 12,
    avatarInitials: "MV",
    email: "marcus.vance@lilisare.com",
    phone: "(541) 555-8822",
    status: "Active",
  },
  {
    id: "PROF-NRN-01",
    name: "Anita Roy, MSW",
    roleTitle: "Qualified Non-RN Supervisor",
    qualificationType: "Qualified Non-RN Supervisor",
    licenseNumber: "MSW-4490",
    licenseExpiry: "2027-11-15",
    agencies: ["AGY-OR-SPR", "AGY-OR-PDX", "AGY-GA-ATL"],
    programs: [
      "IHSS (In-Home Support Services)",
      "Family Caregiver",
      "DD Waiver (Developmental Disabilities)",
    ],
    canPerformRnVisits: false,
    canPerformClinicalSignOff: false,
    activeCaseloadCount: 10,
    avatarInitials: "AR",
    email: "anita.roy@lilisare.com",
    phone: "(503) 555-9914",
    status: "Active",
  },
];

export const INTERNAL_OWNERS = [
  { id: "usr-001", name: "Sarah Jenkins", role: "Agency Admin" },
  { id: "OC-12", name: "Dana Jenkins, MSW", role: "Operations Admin" },
  { id: "OC-15", name: "Chloe Martin", role: "Care Coordinator" },
  { id: "usr-004", name: "David Chen", role: "QA / Compliance Officer" },
];

export const INITIAL_CLINICAL_RULES: ClinicalRule[] = [
  {
    id: "CRULE-01",
    ruleName: "HMA — Initial In-Home & Quarterly Virtual RN Supervision",
    agencyId: "AGY-OR-SPR",
    agencyName: "All LiliSare Agencies",
    state: "OR",
    programId: "PRG-HMA",
    programName: "HMA (Health Maintenance Activities)",
    serviceId: "svc-hma",
    serviceName: "HMA (Health Maintenance Activities)",
    serviceCode: "HMA-001",
    visitCategory: "Recurring RN Visit",
    visitType: "HMA Quarterly Virtual RN Visit",
    professionalType: "RN",
    eligibleProfessionalTypes: ["RN"],
    initialVisitRequired: true,
    recurrenceType: "Quarterly",
    recurrenceIntervalDays: 90,
    frequencyLabel: "Initial + Quarterly (90d)",
    deliveryMethod: "Virtual",
    documentationRequired: true,
    reviewRequired: true,
    effectiveDate: "2026-01-01",
    status: "Active",
    version: "1.2",
    confirmationStatus: "Confirmed",
    internalNotes:
      "Creates an Initial RN visit at service start followed by recurring quarterly virtual RN supervisory visits. Existing records retain rule snapshot version.",
    updatedBy: "Sarah Jenkins",
    updatedAt: "2026-10-12 09:30",
    versionHistory: [
      {
        version: "1.0",
        updatedAt: "2026-01-01 08:00",
        updatedBy: "Sarah Jenkins",
        changeSummary: "Initial baseline rule created for HMA RN supervision.",
        effectiveDate: "2026-01-01",
        professionalType: "RN",
        recurrenceType: "Quarterly",
        recurrenceIntervalDays: 90,
        deliveryMethod: "In-home",
        status: "Active",
      },
      {
        version: "1.2",
        updatedAt: "2026-10-12 09:30",
        updatedBy: "Sarah Jenkins",
        changeSummary: "Updated recurring quarterly follow-up delivery method to Virtual while keeping Initial visit In-home.",
        effectiveDate: "2026-10-15",
        professionalType: "RN",
        recurrenceType: "Quarterly",
        recurrenceIntervalDays: 90,
        deliveryMethod: "Virtual",
        status: "Active",
      },
    ],
  },
  {
    id: "CRULE-02",
    ruleName: "Personal Care / Homemaker — Annual In-Home Supervisory Visit",
    agencyId: "AGY-OR-SPR",
    agencyName: "All LiliSare Agencies",
    state: "OR",
    programId: "PRG-PC-HM",
    programName: "Family Caregiver",
    serviceId: "svc-family-caregiver",
    serviceName: "Personal Care / Homemaker",
    serviceCode: "S5125",
    visitCategory: "Annual In-home Visit",
    visitType: "Annual In-Home Supervisory Visit",
    professionalType: "Clinical Supervisor",
    eligibleProfessionalTypes: ["RN", "Clinical Supervisor", "Field Supervisor"],
    initialVisitRequired: false,
    recurrenceType: "Annual",
    recurrenceIntervalDays: 365,
    frequencyLabel: "Annual (365d)",
    deliveryMethod: "In-home",
    documentationRequired: true,
    reviewRequired: true,
    effectiveDate: "2026-01-01",
    status: "Active",
    version: "1.0",
    confirmationStatus: "Pending LiliSare Confirmation",
    internalNotes:
      "Initial reference rule for Personal Care & Homemaker services. Annual cadence remains configurable pending final LiliSare program confirmation.",
    updatedBy: "Sarah Jenkins",
    updatedAt: "2026-01-10 10:15",
    versionHistory: [
      {
        version: "1.0",
        updatedAt: "2026-01-10 10:15",
        updatedBy: "Sarah Jenkins",
        changeSummary: "Initial annual in-home supervisory reference rule published.",
        effectiveDate: "2026-01-01",
        professionalType: "Clinical Supervisor",
        recurrenceType: "Annual",
        recurrenceIntervalDays: 365,
        deliveryMethod: "In-home",
        status: "Active",
      },
    ],
  },
  {
    id: "CRULE-03",
    ruleName: "IHSS — Supervisory Visit (RN or Eligible Non-RN Supervisor)",
    agencyId: "AGY-OR-PDX",
    agencyName: "LiliSare Oregon — Portland",
    state: "OR",
    programId: "PRG-IHSS",
    programName: "IHSS (In-Home Support Services)",
    serviceId: "svc-ihss",
    serviceName: "IHSS (In-Home Support Services)",
    serviceCode: "S5130",
    visitCategory: "IHSS Required Visit",
    visitType: "IHSS Supervisory Visit",
    professionalType: "Qualified Non-RN Supervisor",
    eligibleProfessionalTypes: [
      "RN",
      "Clinical Supervisor",
      "Field Supervisor",
      "Qualified Non-RN Supervisor",
    ],
    initialVisitRequired: true,
    recurrenceType: "Semi-Annual",
    recurrenceIntervalDays: 180,
    frequencyLabel: "Semi-Annual (180d)",
    deliveryMethod: "In-home",
    documentationRequired: true,
    reviewRequired: false,
    effectiveDate: "2026-02-01",
    status: "Active",
    version: "1.1",
    confirmationStatus: "Pending LiliSare Confirmation",
    internalNotes:
      "Visit required; does not necessarily require an RN when validated rule allows an eligible non-RN supervisor. Exact cadence pending LiliSare confirmation.",
    updatedBy: "Sarah Jenkins",
    updatedAt: "2026-05-14 14:20",
    versionHistory: [
      {
        version: "1.0",
        updatedAt: "2026-02-01 09:00",
        updatedBy: "Sarah Jenkins",
        changeSummary: "Created initial IHSS supervisory rule.",
        effectiveDate: "2026-02-01",
        professionalType: "Qualified Non-RN Supervisor",
        recurrenceType: "Semi-Annual",
        recurrenceIntervalDays: 180,
        deliveryMethod: "In-home",
        status: "Active",
      },
      {
        version: "1.1",
        updatedAt: "2026-05-14 14:20",
        updatedBy: "Sarah Jenkins",
        changeSummary: "Expanded eligible non-RN supervisor pool to include MSW qualified coordinators.",
        effectiveDate: "2026-05-15",
        professionalType: "Qualified Non-RN Supervisor",
        recurrenceType: "Semi-Annual",
        recurrenceIntervalDays: 180,
        deliveryMethod: "In-home",
        status: "Active",
      },
    ],
  },
  {
    id: "CRULE-04",
    ruleName: "CNA — RN Supervision & Clinical Involvement",
    agencyId: "AGY-OR-SPR",
    agencyName: "All LiliSare Agencies",
    state: "OR",
    programId: "PRG-CNA",
    programName: "CNA (Certified Nurse Aide)",
    serviceId: "svc-cna",
    serviceName: "CNA (Certified Nurse Aide)",
    serviceCode: "T1019",
    visitCategory: "Recurring RN Visit",
    visitType: "CNA RN Supervisory Visit",
    professionalType: "RN",
    eligibleProfessionalTypes: ["RN"],
    initialVisitRequired: true,
    recurrenceType: "Quarterly",
    recurrenceIntervalDays: 90,
    frequencyLabel: "Quarterly (90d · Configurable)",
    deliveryMethod: "In-home",
    documentationRequired: true,
    reviewRequired: true,
    effectiveDate: "2026-01-01",
    status: "Active",
    version: "1.0",
    confirmationStatus: "Pending LiliSare Confirmation",
    internalNotes:
      "RN involvement required for CNA delegation and supervisory monitoring. Exact visit interval (60 vs 90 days) remains configurable pending LiliSare confirmation.",
    updatedBy: "Sarah Jenkins",
    updatedAt: "2026-01-15 11:00",
    versionHistory: [
      {
        version: "1.0",
        updatedAt: "2026-01-15 11:00",
        updatedBy: "Sarah Jenkins",
        changeSummary: "Initial CNA RN supervisory reference rule published.",
        effectiveDate: "2026-01-01",
        professionalType: "RN",
        recurrenceType: "Quarterly",
        recurrenceIntervalDays: 90,
        deliveryMethod: "In-home",
        status: "Active",
      },
    ],
  },
  {
    id: "CRULE-05",
    ruleName: "Unskilled Contractor — Exception-Only Supervision Policy",
    agencyId: "AGY-OR-SPR",
    agencyName: "All LiliSare Agencies",
    state: "OR",
    programId: "PRG-UNSKILLED",
    programName: "Other / Independent Contractor",
    serviceId: "svc-other",
    serviceName: "Unskilled Contractor",
    serviceCode: "SVC-OTHER",
    visitCategory: "Other Configured Visit",
    visitType: "Exception-Only Supervisory Check",
    professionalType: "Field Supervisor",
    eligibleProfessionalTypes: ["RN", "Clinical Supervisor", "Field Supervisor"],
    initialVisitRequired: false,
    recurrenceType: "None",
    recurrenceIntervalDays: 0,
    frequencyLabel: "None (Exception Only)",
    deliveryMethod: "Other approved method",
    documentationRequired: false,
    reviewRequired: false,
    effectiveDate: "2026-01-01",
    status: "Active",
    version: "1.0",
    confirmationStatus: "Confirmed",
    internalNotes:
      "System must NOT automatically create routine supervisory visit requirements for Unskilled Contractor services unless an explicit authorized exception exists.",
    updatedBy: "Sarah Jenkins",
    updatedAt: "2026-01-15 11:30",
    versionHistory: [
      {
        version: "1.0",
        updatedAt: "2026-01-15 11:30",
        updatedBy: "Sarah Jenkins",
        changeSummary: "Configured exception-only behavior for unskilled contractor arrangements.",
        effectiveDate: "2026-01-01",
        professionalType: "Field Supervisor",
        recurrenceType: "None",
        recurrenceIntervalDays: 0,
        deliveryMethod: "Other approved method",
        status: "Active",
      },
    ],
  },
  {
    id: "CRULE-06",
    ruleName: "HCBS Waivers (CES / EBD / DD / CHCBS / CHRP / SLS) — Quarterly RN Review",
    agencyId: "AGY-OR-SPR",
    agencyName: "All LiliSare Agencies",
    state: "OR",
    programId: "PRG-WAIVER",
    programName: "CES Waiver / EBD Waiver / DD Waiver",
    serviceId: "svc-ces-waiver",
    serviceName: "HCBS Waiver Care & Supervisory Review",
    serviceCode: "CES-WVR",
    visitCategory: "Recurring RN Visit",
    visitType: "Quarterly RN Supervisory Visit",
    professionalType: "RN",
    eligibleProfessionalTypes: ["RN"],
    initialVisitRequired: true,
    recurrenceType: "Quarterly",
    recurrenceIntervalDays: 90,
    frequencyLabel: "Initial + Quarterly (90d)",
    deliveryMethod: "In-home",
    documentationRequired: true,
    reviewRequired: true,
    effectiveDate: "2026-01-01",
    status: "Active",
    version: "1.1",
    confirmationStatus: "Confirmed",
    internalNotes:
      "Applies to pediatric and adult HCBS waiver arrangements requiring quarterly RN clinical oversight and care plan alignment.",
    updatedBy: "Sarah Jenkins",
    updatedAt: "2026-06-01 09:00",
    versionHistory: [
      {
        version: "1.1",
        updatedAt: "2026-06-01 09:00",
        updatedBy: "Sarah Jenkins",
        changeSummary: "Included CHRP and SLS waivers in quarterly RN oversight scope.",
        effectiveDate: "2026-06-01",
        professionalType: "RN",
        recurrenceType: "Quarterly",
        recurrenceIntervalDays: 90,
        deliveryMethod: "In-home",
        status: "Active",
      },
    ],
  },
];

export const INITIAL_CLINICAL_REQUIREMENTS: ClinicalRequirement[] = [
  {
    id: "REQ-2026-101",
    requirementName: "Leo Miller — Quarterly RN Supervisory Visit",
    clientId: "CL-1001",
    clientName: "Leo Miller",
    householdId: "hh-1001",
    householdName: "Miller Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programId: "PRG-WAIVER",
    programName: "Pediatric In-Home Care",
    serviceId: "svc-ces-waiver",
    serviceName: "CES Waiver (Children’s Extensive Support)",
    serviceCode: "CES-WVR",
    serviceStartDate: "2026-01-01",
    authorizationId: "AUTH-2026-9812",
    ruleId: "CRULE-06",
    ruleName: "HCBS Waivers — Quarterly RN Review",
    ruleVersion: "1.1",
    visitCategory: "Recurring RN Visit",
    visitType: "Quarterly RN Supervisory Visit",
    professionalType: "RN",
    isInitial: false,
    isRecurring: true,
    frequency: "Quarterly (90d)",
    recurrenceIntervalDays: 90,
    deliveryMethod: "In-home",
    effectiveDate: "2026-01-01",
    firstDueDate: "2026-02-28",
    nextDueDate: "2026-11-28",
    lastCompletedDate: "2026-08-28",
    assignedProfessionalId: "PROF-RN-03",
    assignedProfessionalName: "Evelyn Vance, RN",
    internalOwnerId: "OC-12",
    internalOwnerName: "Dana Jenkins, MSW",
    priority: "Medium",
    status: "Scheduled",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    activeVisitId: "CLV-2026-101",
    internalNotes: "Confirm rescue inhaler protocol and sensory transition logs with Sarah Miller during visit.",
    createdAt: "2026-01-02T09:00:00Z",
    updatedAt: "2026-11-20T14:15:00Z",
  },
  {
    id: "REQ-2026-102",
    requirementName: "Marcus Whitfield — Quarterly RN Supervisory Visit",
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    agencyId: "AGY-IA-CF",
    agencyName: "LiliSare Midwest — Cedar Falls",
    programId: "PRG-WAIVER",
    programName: "EBD Waiver (Elderly, Blind, and Disabled)",
    serviceId: "svc-ebd-waiver",
    serviceName: "EBD Waiver (Elderly, Blind, and Disabled)",
    serviceCode: "EBD-WVR",
    serviceStartDate: "2025-12-01",
    authorizationId: "AUTH-2025-4421",
    ruleId: "CRULE-06",
    ruleName: "HCBS Waivers — Quarterly RN Review",
    ruleVersion: "1.0",
    visitCategory: "Recurring RN Visit",
    visitType: "Quarterly RN Supervisory Visit",
    professionalType: "RN",
    isInitial: false,
    isRecurring: true,
    frequency: "Quarterly (90d)",
    recurrenceIntervalDays: 90,
    deliveryMethod: "In-home",
    effectiveDate: "2025-12-01",
    firstDueDate: "2026-02-20",
    nextDueDate: "2026-11-21",
    lastCompletedDate: "2026-08-22",
    assignedProfessionalId: "PROF-RN-01",
    assignedProfessionalName: "Rachel Miller, RN",
    internalOwnerId: "usr-001",
    internalOwnerName: "Sarah Jenkins",
    priority: "Critical",
    status: "Overdue",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    activeVisitId: "CLV-2026-102",
    internalNotes: "5 days past due date; prior visit rescheduled due to client PT appointment. High fall risk post hip ORIF.",
    createdAt: "2025-12-02T10:00:00Z",
    updatedAt: "2026-11-22T09:10:00Z",
  },
  {
    id: "REQ-2026-103",
    requirementName: "Sophia Bennett — Quarterly RN Assessment & Supervision",
    clientId: "CL-1003",
    clientName: "Sophia Bennett",
    householdId: "hh-1003",
    householdName: "Bennett Family Unit",
    agencyId: "AGY-GA-ATL",
    agencyName: "LiliSare Southeast — Atlanta",
    programId: "PRG-WAIVER",
    programName: "DD Waiver (Developmental Disabilities)",
    serviceId: "svc-dd-waiver",
    serviceName: "DD Waiver (Developmental Disabilities)",
    serviceCode: "DD-WVR",
    serviceStartDate: "2026-03-01",
    authorizationId: "AUTH-2026-3390",
    ruleId: "CRULE-06",
    ruleName: "HCBS Waivers — Quarterly RN Review",
    ruleVersion: "1.1",
    visitCategory: "Recurring RN Visit",
    visitType: "Quarterly RN Assessment",
    professionalType: "RN",
    isInitial: false,
    isRecurring: true,
    frequency: "Quarterly (90d)",
    recurrenceIntervalDays: 90,
    deliveryMethod: "In-home",
    effectiveDate: "2026-03-01",
    firstDueDate: "2026-05-25",
    nextDueDate: "2027-02-22",
    lastCompletedDate: "2026-11-24",
    assignedProfessionalId: "PROF-RN-02",
    assignedProfessionalName: "Carlos Mendez, RN",
    internalOwnerId: "OC-12",
    internalOwnerName: "Dana Jenkins, MSW",
    priority: "High",
    status: "Active",
    documentationStatus: "Submitted",
    reviewStatus: "Pending Review",
    activeVisitId: "CLV-2026-103",
    internalNotes: "Visit completed 2026-11-24; RN assessment note submitted and awaiting clinical review sign-off.",
    createdAt: "2026-03-01T11:00:00Z",
    updatedAt: "2026-11-24T17:45:00Z",
  },
  {
    id: "REQ-2026-104",
    requirementName: "Jackson Vance — Initial RN Intake Visit",
    clientId: "CL-1004",
    clientName: "Jackson Vance",
    householdId: "hh-1004",
    householdName: "Vance Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programId: "PRG-WAIVER",
    programName: "CHCBS Waiver (Children’s Home and Community-Based Services)",
    serviceId: "svc-chcbs-waiver",
    serviceName: "CHCBS Waiver (Children’s Home and Community-Based Services)",
    serviceCode: "CHCBS-WVR",
    serviceStartDate: "2026-11-10",
    authorizationId: "AUTH-2026-8801",
    ruleId: "CRULE-06",
    ruleName: "HCBS Waivers — Quarterly RN Review",
    ruleVersion: "1.1",
    visitCategory: "Initial RN Visit",
    visitType: "Initial RN Assessment Visit",
    professionalType: "RN",
    isInitial: true,
    isRecurring: true,
    frequency: "Initial + Quarterly (90d)",
    recurrenceIntervalDays: 90,
    deliveryMethod: "In-home",
    effectiveDate: "2026-11-10",
    firstDueDate: "2026-11-27",
    nextDueDate: "2026-11-27",
    lastCompletedDate: null,
    assignedProfessionalId: null,
    assignedProfessionalName: null,
    internalOwnerId: "OC-15",
    internalOwnerName: "Chloe Martin",
    priority: "Critical",
    status: "Pending Assignment",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    activeVisitId: "CLV-2026-104",
    internalNotes: "New onboarding client with no RN assigned yet. Must assign eligible RN before caregiver shift activation.",
    createdAt: "2026-11-10T10:30:00Z",
    updatedAt: "2026-11-25T16:00:00Z",
  },
  {
    id: "REQ-2026-105",
    requirementName: "Hannah Morales — IHSS Supervisory Visit",
    clientId: "CL-1005",
    clientName: "Hannah Morales",
    householdId: "hh-1005",
    householdName: "Morales Household",
    agencyId: "AGY-OR-PDX",
    agencyName: "LiliSare Oregon — Portland",
    programId: "PRG-IHSS",
    programName: "IHSS (In-Home Support Services)",
    serviceId: "svc-ihss",
    serviceName: "IHSS (In-Home Support Services)",
    serviceCode: "S5130",
    serviceStartDate: "2025-11-20",
    authorizationId: "AUTH-2025-7762",
    ruleId: "CRULE-03",
    ruleName: "IHSS — Supervisory Visit (RN or Eligible Non-RN Supervisor)",
    ruleVersion: "1.1",
    visitCategory: "IHSS Required Visit",
    visitType: "IHSS Supervisory Visit",
    professionalType: "Qualified Non-RN Supervisor",
    isInitial: false,
    isRecurring: true,
    frequency: "Semi-Annual (180d)",
    recurrenceIntervalDays: 180,
    deliveryMethod: "In-home",
    effectiveDate: "2025-11-20",
    firstDueDate: "2026-05-20",
    nextDueDate: "2026-11-25",
    lastCompletedDate: "2026-05-19",
    assignedProfessionalId: "PROF-NRN-01",
    assignedProfessionalName: "Anita Roy, MSW",
    internalOwnerId: "OC-12",
    internalOwnerName: "Dana Jenkins, MSW",
    priority: "High",
    status: "Active",
    documentationStatus: "Incomplete",
    reviewStatus: "Follow-up Required",
    activeVisitId: "CLV-2026-105",
    internalNotes: "Visit performed by qualified non-RN supervisor (Anita Roy, MSW); missing client/guardian attestation attachment.",
    createdAt: "2025-11-21T08:00:00Z",
    updatedAt: "2026-11-24T11:20:00Z",
  },
  {
    id: "REQ-2026-106",
    requirementName: "Lucas Bennett — Initial RN Intake Supervision",
    clientId: "CL-1006",
    clientName: "Lucas Bennett",
    householdId: "hh-1006",
    householdName: "Bennett Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programId: "PRG-WAIVER",
    programName: "CHRP Waiver (Children’s Habilitation Residential Program)",
    serviceId: "svc-chrp-waiver",
    serviceName: "CHRP Waiver (Children’s Habilitation Residential Program)",
    serviceCode: "CHRP-WVR",
    serviceStartDate: "2026-12-01",
    authorizationId: "AUTH-PENDING-99",
    ruleId: "CRULE-06",
    ruleName: "HCBS Waivers — Quarterly RN Review",
    ruleVersion: "1.1",
    visitCategory: "Initial RN Visit",
    visitType: "Initial RN Assessment Visit",
    professionalType: "RN",
    isInitial: true,
    isRecurring: true,
    frequency: "Initial + Quarterly (90d)",
    recurrenceIntervalDays: 90,
    deliveryMethod: "In-home",
    effectiveDate: "2026-11-15",
    firstDueDate: "2026-11-30",
    nextDueDate: "2026-11-30",
    lastCompletedDate: null,
    assignedProfessionalId: "PROF-RN-01",
    assignedProfessionalName: "Rachel Miller, RN",
    internalOwnerId: "OC-12",
    internalOwnerName: "Dana Jenkins, MSW",
    priority: "Medium",
    status: "Scheduled",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    activeVisitId: "CLV-2026-106",
    internalNotes: "Scheduled prior to Dec 1 waiver start; physician orders uploaded and pending verification.",
    createdAt: "2026-11-15T12:00:00Z",
    updatedAt: "2026-11-23T09:40:00Z",
  },
  {
    id: "REQ-2026-107",
    requirementName: "Raymond Chen — Annual In-Home Supervisory Visit",
    clientId: "CL-1007",
    clientName: "Raymond Chen",
    householdId: "hh-1007",
    householdName: "Chen Household",
    agencyId: "AGY-OR-PDX",
    agencyName: "LiliSare Oregon — Portland",
    programId: "PRG-PC-HM",
    programName: "Family Caregiver",
    serviceId: "svc-family-caregiver",
    serviceName: "Personal Care / Homemaker",
    serviceCode: "S5125",
    serviceStartDate: "2025-08-01",
    authorizationId: "AUTH-2025-1102",
    ruleId: "CRULE-02",
    ruleName: "Personal Care / Homemaker — Annual In-Home Supervisory Visit",
    ruleVersion: "1.0",
    visitCategory: "Annual In-home Visit",
    visitType: "Annual In-Home Supervisory Visit",
    professionalType: "Clinical Supervisor",
    isInitial: false,
    isRecurring: true,
    frequency: "Annual (365d)",
    recurrenceIntervalDays: 365,
    deliveryMethod: "In-home",
    effectiveDate: "2025-08-01",
    firstDueDate: "2026-12-10",
    nextDueDate: "2026-12-10",
    lastCompletedDate: "2025-12-12",
    assignedProfessionalId: "PROF-FS-01",
    assignedProfessionalName: "Marcus Vance",
    internalOwnerId: "usr-001",
    internalOwnerName: "Sarah Jenkins",
    priority: "Low",
    status: "On Hold",
    documentationStatus: "Not Started",
    reviewStatus: "Not Required",
    activeVisitId: "CLV-2026-107",
    internalNotes: "Client temporarily in 14-day physical therapy rehab stay. Resume supervisory visit upon discharge.",
    createdAt: "2025-12-12T15:00:00Z",
    updatedAt: "2026-11-14T16:00:00Z",
  },
  {
    id: "REQ-2026-108",
    requirementName: "Maya Lin — Initial RN Supervisory Visit",
    clientId: "CL-1008",
    clientName: "Maya Lin",
    householdId: "hh-1008",
    householdName: "Lin Household",
    agencyId: "AGY-OR-PDX",
    agencyName: "LiliSare Oregon — Portland",
    programId: "PRG-WAIVER",
    programName: "SLS Waiver (Supported Living Services)",
    serviceId: "svc-sls-waiver",
    serviceName: "SLS Waiver (Supported Living Services)",
    serviceCode: "SLS-WVR",
    serviceStartDate: "2026-11-15",
    authorizationId: "AUTH-2026-7719",
    ruleId: "CRULE-06",
    ruleName: "HCBS Waivers — Quarterly RN Review",
    ruleVersion: "1.1",
    visitCategory: "Initial RN Visit",
    visitType: "Initial RN Assessment Visit",
    professionalType: "RN",
    isInitial: true,
    isRecurring: true,
    frequency: "Initial + Quarterly (90d)",
    recurrenceIntervalDays: 90,
    deliveryMethod: "In-home",
    effectiveDate: "2026-11-15",
    firstDueDate: "2026-11-29",
    nextDueDate: "2026-11-29",
    lastCompletedDate: null,
    assignedProfessionalId: "PROF-RN-02",
    assignedProfessionalName: "Carlos Mendez, RN",
    internalOwnerId: "OC-12",
    internalOwnerName: "Dana Jenkins, MSW",
    priority: "High",
    status: "Due Soon",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    activeVisitId: "CLV-2026-108",
    internalNotes: "Assigned to Carlos Mendez, RN; awaiting appointment slot confirmation in Scheduling.",
    createdAt: "2026-11-15T10:00:00Z",
    updatedAt: "2026-11-25T09:15:00Z",
  },
  {
    id: "REQ-2026-109",
    requirementName: "Robert Davis — CNA RN Supervisory Visit",
    clientId: "CL-1009",
    clientName: "Robert Davis",
    householdId: "hh-1009",
    householdName: "Davis Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programId: "PRG-CNA",
    programName: "CNA (Certified Nurse Aide)",
    serviceId: "svc-cna",
    serviceName: "CNA (Certified Nurse Aide)",
    serviceCode: "T1019",
    serviceStartDate: "2026-01-01",
    authorizationId: "AUTH-2024-1188",
    ruleId: "CRULE-04",
    ruleName: "CNA — RN Supervision & Clinical Involvement",
    ruleVersion: "1.0",
    visitCategory: "Recurring RN Visit",
    visitType: "CNA RN Supervisory Visit",
    professionalType: "RN",
    isInitial: false,
    isRecurring: true,
    frequency: "Quarterly (90d · Configurable)",
    recurrenceIntervalDays: 90,
    deliveryMethod: "In-home",
    effectiveDate: "2026-01-01",
    firstDueDate: "2026-03-01",
    nextDueDate: "2026-11-18",
    lastCompletedDate: "2026-08-18",
    assignedProfessionalId: "PROF-RN-04",
    assignedProfessionalName: "Brenda Larson, RN",
    internalOwnerId: "usr-004",
    internalOwnerName: "David Chen",
    priority: "Critical",
    status: "Overdue",
    documentationStatus: "Correction Requested",
    reviewStatus: "Returned for Correction",
    activeVisitId: "CLV-2026-109",
    internalNotes: "Returned for correction: missing updated discharge status reconciliation & skin integrity sign-off.",
    createdAt: "2026-01-05T09:00:00Z",
    updatedAt: "2026-11-22T15:00:00Z",
  },
  {
    id: "REQ-2026-110",
    requirementName: "Thomas Callahan — HMA Quarterly Virtual RN Visit",
    clientId: "CL-1010",
    clientName: "Thomas Callahan",
    householdId: "hh-1010",
    householdName: "Callahan Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programId: "PRG-HMA",
    programName: "HMA (Health Maintenance Activities)",
    serviceId: "svc-hma",
    serviceName: "HMA (Health Maintenance Activities)",
    serviceCode: "HMA-001",
    serviceStartDate: "2026-08-26",
    authorizationId: "AUTH-2026-6621",
    ruleId: "CRULE-01",
    ruleName: "HMA — Initial In-Home & Quarterly Virtual RN Supervision",
    ruleVersion: "1.2",
    visitCategory: "Recurring RN Visit",
    visitType: "HMA Quarterly Virtual RN Visit",
    professionalType: "RN",
    isInitial: false,
    isRecurring: true,
    frequency: "Quarterly (90d)",
    recurrenceIntervalDays: 90,
    deliveryMethod: "Virtual",
    effectiveDate: "2026-08-26",
    firstDueDate: "2026-08-26",
    nextDueDate: "2026-11-26",
    lastCompletedDate: "2026-08-26",
    assignedProfessionalId: "PROF-RN-03",
    assignedProfessionalName: "Evelyn Vance, RN",
    internalOwnerId: "usr-001",
    internalOwnerName: "Sarah Jenkins",
    priority: "Medium",
    status: "Scheduled",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    activeVisitId: "CLV-2026-110",
    internalNotes: "Quarterly HMA telehealth check scheduled today with Thomas Callahan & primary caregiver.",
    createdAt: "2026-08-26T10:00:00Z",
    updatedAt: "2026-11-25T11:30:00Z",
  },
  {
    id: "REQ-2026-111",
    requirementName: "Marcus Whitfield — CNA RN Skin & Mobility Supervision",
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    agencyId: "AGY-IA-CF",
    agencyName: "LiliSare Midwest — Cedar Falls",
    programId: "PRG-CNA",
    programName: "CNA (Certified Nurse Aide)",
    serviceId: "svc-cna",
    serviceName: "CNA (Certified Nurse Aide)",
    serviceCode: "T1019",
    serviceStartDate: "2026-01-15",
    authorizationId: "AUTH-2026-7714",
    ruleId: "CRULE-04",
    ruleName: "CNA — RN Supervision & Clinical Involvement",
    ruleVersion: "1.0",
    visitCategory: "Recurring RN Visit",
    visitType: "CNA RN Supervisory Visit",
    professionalType: "RN",
    isInitial: false,
    isRecurring: true,
    frequency: "Quarterly (90d · Configurable)",
    recurrenceIntervalDays: 90,
    deliveryMethod: "In-home",
    effectiveDate: "2026-01-15",
    firstDueDate: "2026-02-25",
    nextDueDate: "2027-02-23",
    lastCompletedDate: "2026-11-25",
    assignedProfessionalId: "PROF-RN-02",
    assignedProfessionalName: "Carlos Mendez, RN",
    internalOwnerId: "usr-001",
    internalOwnerName: "Sarah Jenkins",
    priority: "High",
    status: "Active",
    documentationStatus: "Pending",
    reviewStatus: "Pending Review",
    activeVisitId: "CLV-2026-113",
    internalNotes: "RN performed in-home visit on 2026-11-25; clinical assessment form not yet submitted (24h SLA).",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-11-25T16:40:00Z",
  },
  {
    id: "REQ-2026-112",
    requirementName: "Hannah Morales — Annual Personal Care Supervisory Visit",
    clientId: "CL-1005",
    clientName: "Hannah Morales",
    householdId: "hh-1005",
    householdName: "Morales Household",
    agencyId: "AGY-OR-PDX",
    agencyName: "LiliSare Oregon — Portland",
    programId: "PRG-PC-HM",
    programName: "Family Caregiver",
    serviceId: "svc-family-caregiver",
    serviceName: "Personal Care / Homemaker",
    serviceCode: "S5125",
    serviceStartDate: "2025-11-20",
    authorizationId: "AUTH-2025-7762",
    ruleId: "CRULE-02",
    ruleName: "Personal Care / Homemaker — Annual In-Home Supervisory Visit",
    ruleVersion: "1.0",
    visitCategory: "Annual In-home Visit",
    visitType: "Annual In-Home Supervisory Visit",
    professionalType: "Clinical Supervisor",
    isInitial: false,
    isRecurring: true,
    frequency: "Annual (365d)",
    recurrenceIntervalDays: 365,
    deliveryMethod: "In-home",
    effectiveDate: "2025-11-20",
    firstDueDate: "2026-11-20",
    nextDueDate: "2027-11-20",
    lastCompletedDate: "2026-11-20",
    assignedProfessionalId: "PROF-RN-01",
    assignedProfessionalName: "Rachel Miller, RN",
    internalOwnerId: "OC-12",
    internalOwnerName: "Dana Jenkins, MSW",
    priority: "High",
    status: "Active",
    documentationStatus: "Submitted",
    reviewStatus: "Under Review",
    activeVisitId: "CLV-2026-114",
    internalNotes: "Annual visit completed 2026-11-20. Clinical documentation under secondary review for 6 days.",
    createdAt: "2025-11-21T08:00:00Z",
    updatedAt: "2026-11-20T17:00:00Z",
  },
];

export const INITIAL_CLINICAL_VISITS: ClinicalVisit[] = [
  {
    id: "CLV-2026-101",
    requirementId: "REQ-2026-101",
    clientId: "CL-1001",
    clientName: "Leo Miller",
    householdId: "hh-1001",
    householdName: "Miller Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programName: "Pediatric In-Home Care",
    serviceName: "CES Waiver (Children’s Extensive Support)",
    serviceCode: "CES-WVR",
    scheduledVisitId: "VIS-1091",
    professionalId: "PROF-RN-03",
    professionalName: "Evelyn Vance, RN",
    professionalQualification: "RN",
    visitType: "Quarterly RN Supervisory Visit",
    visitCategory: "Recurring RN Visit",
    dueDate: "2026-11-28",
    scheduledDate: "2026-11-27",
    scheduledStartTime: "10:00",
    scheduledEndTime: "11:00",
    scheduledAt: "2026-11-27 10:00",
    completedAt: null,
    deliveryMethod: "In-home",
    locationDetails: "742 Evergreen Terrace, Springfield, OR 97477",
    visitStatus: "Scheduled",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    followUpRequired: false,
    priority: "Medium",
    ruleId: "CRULE-06",
    ruleVersion: "1.1",
    daysPendingReview: 0,
    lastReminderAt: null,
    operationalNotes: "Confirmed with Sarah Miller for Friday morning in-home supervisory evaluation.",
    createdAt: "2026-11-10T09:00:00Z",
    updatedAt: "2026-11-20T14:15:00Z",
  },
  {
    id: "CLV-2026-102",
    requirementId: "REQ-2026-102",
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    agencyId: "AGY-IA-CF",
    agencyName: "LiliSare Midwest — Cedar Falls",
    programName: "EBD Waiver (Elderly, Blind, and Disabled)",
    serviceName: "EBD Waiver (Elderly, Blind, and Disabled)",
    serviceCode: "EBD-WVR",
    scheduledVisitId: null,
    professionalId: "PROF-RN-01",
    professionalName: "Rachel Miller, RN",
    professionalQualification: "RN",
    visitType: "Quarterly RN Supervisory Visit",
    visitCategory: "Recurring RN Visit",
    dueDate: "2026-11-21",
    scheduledDate: null,
    scheduledStartTime: null,
    scheduledEndTime: null,
    scheduledAt: null,
    completedAt: null,
    deliveryMethod: "In-home",
    locationDetails: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    visitStatus: "Missed",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    followUpRequired: true,
    priority: "Critical",
    ruleId: "CRULE-06",
    ruleVersion: "1.0",
    daysPendingReview: 5,
    lastReminderAt: "2026-11-24 09:15 AM",
    operationalNotes: "Original Nov 21 appointment missed due to client hospitalization PT overlap; urgent reschedule needed.",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-22T09:10:00Z",
  },
  {
    id: "CLV-2026-103",
    requirementId: "REQ-2026-103",
    clientId: "CL-1003",
    clientName: "Sophia Bennett",
    householdId: "hh-1003",
    householdName: "Bennett Family Unit",
    agencyId: "AGY-GA-ATL",
    agencyName: "LiliSare Southeast — Atlanta",
    programName: "DD Waiver (Developmental Disabilities)",
    serviceName: "DD Waiver (Developmental Disabilities)",
    serviceCode: "DD-WVR",
    scheduledVisitId: "VIS-1094",
    professionalId: "PROF-RN-02",
    professionalName: "Carlos Mendez, RN",
    professionalQualification: "RN",
    visitType: "Quarterly RN Assessment",
    visitCategory: "Recurring RN Visit",
    dueDate: "2026-11-25",
    scheduledDate: "2026-11-24",
    scheduledStartTime: "13:00",
    scheduledEndTime: "14:00",
    scheduledAt: "2026-11-24 13:00",
    completedAt: "2026-11-24 14:05",
    deliveryMethod: "In-home",
    locationDetails: "3501 Northview Terrace, Atlanta, GA 30327",
    visitStatus: "Completed",
    documentationStatus: "Submitted",
    reviewStatus: "Pending Review",
    followUpRequired: false,
    priority: "High",
    ruleId: "CRULE-06",
    ruleVersion: "1.1",
    daysPendingReview: 2,
    lastReminderAt: null,
    operationalNotes: "Visit completed on schedule. Clinical assessment submitted and queued for RN peer review/sign-off.",
    createdAt: "2026-11-05T11:00:00Z",
    updatedAt: "2026-11-24T17:45:00Z",
  },
  {
    id: "CLV-2026-104",
    requirementId: "REQ-2026-104",
    clientId: "CL-1004",
    clientName: "Jackson Vance",
    householdId: "hh-1004",
    householdName: "Vance Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programName: "CHCBS Waiver (Children’s Home and Community-Based Services)",
    serviceName: "CHCBS Waiver (Children’s Home and Community-Based Services)",
    serviceCode: "CHCBS-WVR",
    scheduledVisitId: null,
    professionalId: null,
    professionalName: null,
    professionalQualification: "RN",
    visitType: "Initial RN Assessment Visit",
    visitCategory: "Initial RN Visit",
    dueDate: "2026-11-27",
    scheduledDate: null,
    scheduledStartTime: null,
    scheduledEndTime: null,
    scheduledAt: null,
    completedAt: null,
    deliveryMethod: "In-home",
    locationDetails: "889 Silverleaf Road, Eugene, OR 97401",
    visitStatus: "Unscheduled",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    followUpRequired: true,
    priority: "Critical",
    ruleId: "CRULE-06",
    ruleVersion: "1.1",
    daysPendingReview: 0,
    lastReminderAt: null,
    operationalNotes: "Requires eligible RN assignment immediately so initial intake visit can be scheduled.",
    createdAt: "2026-11-10T10:30:00Z",
    updatedAt: "2026-11-25T16:00:00Z",
  },
  {
    id: "CLV-2026-105",
    requirementId: "REQ-2026-105",
    clientId: "CL-1005",
    clientName: "Hannah Morales",
    householdId: "hh-1005",
    householdName: "Morales Household",
    agencyId: "AGY-OR-PDX",
    agencyName: "LiliSare Oregon — Portland",
    programName: "IHSS (In-Home Support Services)",
    serviceName: "IHSS (In-Home Support Services)",
    serviceCode: "S5130",
    scheduledVisitId: "VIS-1095",
    professionalId: "PROF-NRN-01",
    professionalName: "Anita Roy, MSW",
    professionalQualification: "Qualified Non-RN Supervisor",
    visitType: "IHSS Supervisory Visit",
    visitCategory: "IHSS Required Visit",
    dueDate: "2026-11-25",
    scheduledDate: "2026-11-23",
    scheduledStartTime: "10:30",
    scheduledEndTime: "11:30",
    scheduledAt: "2026-11-23 10:30",
    completedAt: "2026-11-23 11:25",
    deliveryMethod: "In-home",
    locationDetails: "320 Laurel Canyon Blvd, Beaverton, OR 97005",
    visitStatus: "Completed",
    documentationStatus: "Incomplete",
    reviewStatus: "Follow-up Required",
    followUpRequired: true,
    priority: "High",
    ruleId: "CRULE-03",
    ruleVersion: "1.1",
    daysPendingReview: 3,
    lastReminderAt: "2026-11-25 02:30 PM",
    operationalNotes: "IHSS supervisory visit conducted by qualified non-RN supervisor; guardian attestation page missing.",
    createdAt: "2026-11-01T08:00:00Z",
    updatedAt: "2026-11-24T11:20:00Z",
  },
  {
    id: "CLV-2026-106",
    requirementId: "REQ-2026-106",
    clientId: "CL-1006",
    clientName: "Lucas Bennett",
    householdId: "hh-1006",
    householdName: "Bennett Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programName: "CHRP Waiver (Children’s Habilitation Residential Program)",
    serviceName: "CHRP Waiver (Children’s Habilitation Residential Program)",
    serviceCode: "CHRP-WVR",
    scheduledVisitId: "VIS-1092",
    professionalId: "PROF-RN-01",
    professionalName: "Rachel Miller, RN",
    professionalQualification: "RN",
    visitType: "Initial RN Assessment Visit",
    visitCategory: "Initial RN Visit",
    dueDate: "2026-11-30",
    scheduledDate: "2026-11-29",
    scheduledStartTime: "14:00",
    scheduledEndTime: "15:00",
    scheduledAt: "2026-11-29 14:00",
    completedAt: null,
    deliveryMethod: "In-home",
    locationDetails: "1402 Crestview Terrace, Bend, OR 97701",
    visitStatus: "Scheduled",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    followUpRequired: false,
    priority: "Medium",
    ruleId: "CRULE-06",
    ruleVersion: "1.1",
    daysPendingReview: 0,
    lastReminderAt: null,
    operationalNotes: "Scheduled ahead of Dec 1 start date.",
    createdAt: "2026-11-15T12:00:00Z",
    updatedAt: "2026-11-23T09:40:00Z",
  },
  {
    id: "CLV-2026-107",
    requirementId: "REQ-2026-107",
    clientId: "CL-1007",
    clientName: "Raymond Chen",
    householdId: "hh-1007",
    householdName: "Chen Household",
    agencyId: "AGY-OR-PDX",
    agencyName: "LiliSare Oregon — Portland",
    programName: "Family Caregiver",
    serviceName: "Personal Care / Homemaker",
    serviceCode: "S5125",
    scheduledVisitId: null,
    professionalId: "PROF-FS-01",
    professionalName: "Marcus Vance",
    professionalQualification: "Clinical Supervisor",
    visitType: "Annual In-Home Supervisory Visit",
    visitCategory: "Annual In-home Visit",
    dueDate: "2026-12-10",
    scheduledDate: null,
    scheduledStartTime: null,
    scheduledEndTime: null,
    scheduledAt: null,
    completedAt: null,
    deliveryMethod: "In-home",
    locationDetails: "2410 Skyline Heights, Portland, OR 97201",
    visitStatus: "Unscheduled",
    documentationStatus: "Not Started",
    reviewStatus: "Not Required",
    followUpRequired: false,
    priority: "Low",
    ruleId: "CRULE-02",
    ruleVersion: "1.0",
    daysPendingReview: 0,
    lastReminderAt: null,
    operationalNotes: "On hold until client returns from short-term rehab.",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-14T16:00:00Z",
  },
  {
    id: "CLV-2026-108",
    requirementId: "REQ-2026-108",
    clientId: "CL-1008",
    clientName: "Maya Lin",
    householdId: "hh-1008",
    householdName: "Lin Household",
    agencyId: "AGY-OR-PDX",
    agencyName: "LiliSare Oregon — Portland",
    programName: "SLS Waiver (Supported Living Services)",
    serviceName: "SLS Waiver (Supported Living Services)",
    serviceCode: "SLS-WVR",
    scheduledVisitId: null,
    professionalId: "PROF-RN-02",
    professionalName: "Carlos Mendez, RN",
    professionalQualification: "RN",
    visitType: "Initial RN Assessment Visit",
    visitCategory: "Initial RN Visit",
    dueDate: "2026-11-29",
    scheduledDate: null,
    scheduledStartTime: null,
    scheduledEndTime: null,
    scheduledAt: null,
    completedAt: null,
    deliveryMethod: "In-home",
    locationDetails: "655 Willow Creek Lane, Tigard, OR 97223",
    visitStatus: "Unscheduled",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    followUpRequired: false,
    priority: "High",
    ruleId: "CRULE-06",
    ruleVersion: "1.1",
    daysPendingReview: 0,
    lastReminderAt: null,
    operationalNotes: "Due in 3 days; coordinate calendar slot with Carlos Mendez, RN.",
    createdAt: "2026-11-15T10:00:00Z",
    updatedAt: "2026-11-25T09:15:00Z",
  },
  {
    id: "CLV-2026-109",
    requirementId: "REQ-2026-109",
    clientId: "CL-1009",
    clientName: "Robert Davis",
    householdId: "hh-1009",
    householdName: "Davis Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programName: "CNA (Certified Nurse Aide)",
    serviceName: "CNA (Certified Nurse Aide)",
    serviceCode: "T1019",
    scheduledVisitId: null,
    professionalId: "PROF-RN-04",
    professionalName: "Brenda Larson, RN",
    professionalQualification: "RN",
    visitType: "CNA RN Supervisory Visit",
    visitCategory: "Recurring RN Visit",
    dueDate: "2026-11-18",
    scheduledDate: "2026-11-18",
    scheduledStartTime: "09:30",
    scheduledEndTime: "10:30",
    scheduledAt: "2026-11-18 09:30",
    completedAt: "2026-11-18 10:25",
    deliveryMethod: "In-home",
    locationDetails: "904 Pinehurst Ave, Salem, OR 97301",
    visitStatus: "Completed",
    documentationStatus: "Correction Requested",
    reviewStatus: "Returned for Correction",
    followUpRequired: true,
    priority: "Critical",
    ruleId: "CRULE-04",
    ruleVersion: "1.0",
    daysPendingReview: 8,
    lastReminderAt: "2026-11-24 03:00 PM",
    operationalNotes: "Returned for correction: incomplete CNA delegation verification section.",
    createdAt: "2026-11-01T09:00:00Z",
    updatedAt: "2026-11-22T15:00:00Z",
  },
  {
    id: "CLV-2026-110",
    requirementId: "REQ-2026-110",
    clientId: "CL-1010",
    clientName: "Thomas Callahan",
    householdId: "hh-1010",
    householdName: "Callahan Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programName: "HMA (Health Maintenance Activities)",
    serviceName: "HMA (Health Maintenance Activities)",
    serviceCode: "HMA-001",
    scheduledVisitId: "VIS-1093",
    professionalId: "PROF-RN-03",
    professionalName: "Evelyn Vance, RN",
    professionalQualification: "RN",
    visitType: "HMA Quarterly Virtual RN Visit",
    visitCategory: "Recurring RN Visit",
    dueDate: "2026-11-26",
    scheduledDate: "2026-11-26",
    scheduledStartTime: "11:00",
    scheduledEndTime: "11:45",
    scheduledAt: "2026-11-26 11:00",
    completedAt: null,
    deliveryMethod: "Virtual",
    locationDetails: "HIPAA Telehealth Video Session — Callahan Household",
    visitStatus: "Scheduled",
    documentationStatus: "Not Started",
    reviewStatus: "Pending Review",
    followUpRequired: false,
    priority: "Medium",
    ruleId: "CRULE-01",
    ruleVersion: "1.2",
    daysPendingReview: 0,
    lastReminderAt: null,
    operationalNotes: "Scheduled today at 11:00 AM via Virtual telehealth.",
    createdAt: "2026-11-12T10:00:00Z",
    updatedAt: "2026-11-25T11:30:00Z",
  },
  {
    id: "CLV-2026-111",
    requirementId: "REQ-2026-110",
    clientId: "CL-1010",
    clientName: "Thomas Callahan",
    householdId: "hh-1010",
    householdName: "Callahan Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programName: "HMA (Health Maintenance Activities)",
    serviceName: "HMA (Health Maintenance Activities)",
    serviceCode: "HMA-001",
    scheduledVisitId: null,
    professionalId: "PROF-RN-03",
    professionalName: "Evelyn Vance, RN",
    professionalQualification: "RN",
    visitType: "Initial RN Assessment Visit",
    visitCategory: "Initial RN Visit",
    dueDate: "2026-08-26",
    scheduledDate: "2026-08-26",
    scheduledStartTime: "10:00",
    scheduledEndTime: "11:15",
    scheduledAt: "2026-08-26 10:00",
    completedAt: "2026-08-26 11:10",
    deliveryMethod: "In-home",
    locationDetails: "913 Proprietors Pl, Murfreesboro, TN 37128",
    visitStatus: "Completed",
    documentationStatus: "Complete",
    reviewStatus: "Approved",
    followUpRequired: false,
    priority: "Low",
    ruleId: "CRULE-01",
    ruleVersion: "1.0",
    daysPendingReview: 0,
    lastReminderAt: null,
    operationalNotes: "Initial HMA RN delegation visit completed and approved.",
    createdAt: "2026-08-18T10:00:00Z",
    updatedAt: "2026-08-27T09:00:00Z",
  },
  {
    id: "CLV-2026-112",
    requirementId: "REQ-2026-101",
    clientId: "CL-1001",
    clientName: "Leo Miller",
    householdId: "hh-1001",
    householdName: "Miller Household",
    agencyId: "AGY-OR-SPR",
    agencyName: "LiliSare Oregon — Springfield",
    programName: "Pediatric In-Home Care",
    serviceName: "CES Waiver (Children’s Extensive Support)",
    serviceCode: "CES-WVR",
    scheduledVisitId: null,
    professionalId: "PROF-RN-01",
    professionalName: "Rachel Miller, RN",
    professionalQualification: "RN",
    visitType: "Quarterly RN Supervisory Visit",
    visitCategory: "Recurring RN Visit",
    dueDate: "2026-08-30",
    scheduledDate: "2026-08-28",
    scheduledStartTime: "09:00",
    scheduledEndTime: "10:00",
    scheduledAt: "2026-08-28 09:00",
    completedAt: "2026-08-28 09:58",
    deliveryMethod: "In-home",
    locationDetails: "742 Evergreen Terrace, Springfield, OR 97477",
    visitStatus: "Completed",
    documentationStatus: "Complete",
    reviewStatus: "Approved",
    followUpRequired: false,
    priority: "Low",
    ruleId: "CRULE-06",
    ruleVersion: "1.1",
    daysPendingReview: 0,
    lastReminderAt: null,
    operationalNotes: "Q3 supervisory visit completed and signed off by RN.",
    createdAt: "2026-08-15T09:00:00Z",
    updatedAt: "2026-08-29T13:00:00Z",
  },
  {
    id: "CLV-2026-113",
    requirementId: "REQ-2026-111",
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    agencyId: "AGY-IA-CF",
    agencyName: "LiliSare Midwest — Cedar Falls",
    programName: "CNA (Certified Nurse Aide)",
    serviceName: "CNA (Certified Nurse Aide)",
    serviceCode: "T1019",
    scheduledVisitId: "VIS-1096",
    professionalId: "PROF-RN-02",
    professionalName: "Carlos Mendez, RN",
    professionalQualification: "RN",
    visitType: "CNA RN Supervisory Visit",
    visitCategory: "Recurring RN Visit",
    dueDate: "2026-11-25",
    scheduledDate: "2026-11-25",
    scheduledStartTime: "15:00",
    scheduledEndTime: "16:00",
    scheduledAt: "2026-11-25 15:00",
    completedAt: "2026-11-25 15:52",
    deliveryMethod: "In-home",
    locationDetails: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    visitStatus: "Completed",
    documentationStatus: "Pending",
    reviewStatus: "Pending Review",
    followUpRequired: false,
    priority: "High",
    ruleId: "CRULE-04",
    ruleVersion: "1.0",
    daysPendingReview: 1,
    lastReminderAt: null,
    operationalNotes: "Visit completed yesterday; awaiting RN supervisory note upload.",
    createdAt: "2026-11-10T10:00:00Z",
    updatedAt: "2026-11-25T16:40:00Z",
  },
  {
    id: "CLV-2026-114",
    requirementId: "REQ-2026-112",
    clientId: "CL-1005",
    clientName: "Hannah Morales",
    householdId: "hh-1005",
    householdName: "Morales Household",
    agencyId: "AGY-OR-PDX",
    agencyName: "LiliSare Oregon — Portland",
    programName: "Family Caregiver",
    serviceName: "Personal Care / Homemaker",
    serviceCode: "S5125",
    scheduledVisitId: null,
    professionalId: "PROF-RN-01",
    professionalName: "Rachel Miller, RN",
    professionalQualification: "Clinical Supervisor",
    visitType: "Annual In-Home Supervisory Visit",
    visitCategory: "Annual In-home Visit",
    dueDate: "2026-11-20",
    scheduledDate: "2026-11-20",
    scheduledStartTime: "11:00",
    scheduledEndTime: "12:00",
    scheduledAt: "2026-11-20 11:00",
    completedAt: "2026-11-20 11:55",
    deliveryMethod: "In-home",
    locationDetails: "320 Laurel Canyon Blvd, Beaverton, OR 97005",
    visitStatus: "Completed",
    documentationStatus: "Submitted",
    reviewStatus: "Under Review",
    followUpRequired: true,
    priority: "High",
    ruleId: "CRULE-02",
    ruleVersion: "1.0",
    daysPendingReview: 6,
    lastReminderAt: "2026-11-24 10:00 AM",
    operationalNotes: "Long-pending clinical review (> 5 days); assigned reviewer Carlos Mendez, RN.",
    createdAt: "2026-11-02T09:00:00Z",
    updatedAt: "2026-11-20T17:00:00Z",
  },
];

export const INITIAL_CLINICAL_DOCUMENTATION: ClinicalDocumentation[] = [
  {
    id: "CDOC-103",
    visitId: "CLV-2026-103",
    requirementId: "REQ-2026-103",
    submittedBy: "Carlos Mendez, RN",
    submittedByRole: "Clinical Supervisor / RN",
    submittedAt: "2026-11-24 17:45",
    documentType: "Quarterly RN Clinical & Supervisory Evaluation",
    completenessStatus: "Submitted",
    missingItems: [],
    version: 1,
    reviewStatus: "Pending Review",
    sections: [
      {
        key: "client_assessment",
        title: "Clinical Status & Care Plan Alignment",
        status: "Complete",
        contentReadOnly:
          "Client Sophia Bennett (CL-1003) evaluated in home with primary caregiver David Bennett present. Sensory regulation plan and ISP goals reviewed; stable baseline maintained.",
      },
      {
        key: "caregiver_observation",
        title: "Caregiver Competency & Medication Safety Check",
        status: "Complete",
        contentReadOnly:
          "Observed transfer technique and structured routine adherence. Medication storage and emergency contact card verified current.",
      },
      {
        key: "recommendations",
        title: "RN Recommendations & Follow-Up Plan",
        status: "Complete",
        contentReadOnly:
          "Continue current DD Waiver hours (30 hrs/wk). Next routine RN supervisory evaluation due in 90 days.",
      },
    ],
    attachments: [
      {
        id: "ATT-DOC-103A",
        name: "RN_Supervisory_Checklist_CL1003_Q4.pdf",
        fileSize: "1.4 MB",
        uploadedAt: "2026-11-24 17:42",
        uploadedBy: "Carlos Mendez, RN",
      },
    ],
  },
  {
    id: "CDOC-105",
    visitId: "CLV-2026-105",
    requirementId: "REQ-2026-105",
    submittedBy: "Anita Roy, MSW",
    submittedByRole: "Qualified Non-RN Supervisor",
    submittedAt: "2026-11-23 16:10",
    documentType: "IHSS Semi-Annual Supervisory Check",
    completenessStatus: "Incomplete",
    missingItems: [
      "Client / Legal Guardian Signed Attestation Page",
      "Updated Home Hazard Mitigation Sign-off",
    ],
    version: 1,
    reviewStatus: "Follow-up Required",
    correctionRequestedNote:
      "Please upload the signed guardian attestation form from Sofia Morales to complete the supervisory packet.",
    sections: [
      {
        key: "ihss_review",
        title: "IHSS Service Delivery & Caregiver Coordination",
        status: "Complete",
        contentReadOnly:
          "In-home check completed with Hannah Morales and Sofia Morales. Vocational transit goals and diabetic-friendly meal prep routines on track.",
      },
      {
        key: "guardian_attestation",
        title: "Guardian Attestation & Safety Verification",
        status: "Missing",
        contentReadOnly: "Pending upload of signed physical attestation page.",
      },
    ],
    attachments: [],
  },
  {
    id: "CDOC-109",
    visitId: "CLV-2026-109",
    requirementId: "REQ-2026-109",
    submittedBy: "Brenda Larson, RN",
    submittedByRole: "Clinical Supervisor / RN",
    submittedAt: "2026-11-19 14:20",
    documentType: "CNA RN Supervisory & Delegation Record",
    completenessStatus: "Correction Requested",
    missingItems: [
      "Updated Peripheral Neuropathy Skin Assessment Log",
      "Caregiver Delegation Competency Sign-Off",
    ],
    version: 1,
    reviewStatus: "Returned for Correction",
    correctionRequestedNote:
      "Returned by Carlos Mendez, RN: Confirm whether client relocation/discharge hold affects active CNA delegation record.",
    sections: [
      {
        key: "cna_delegation",
        title: "CNA Task Delegation Observation",
        status: "Incomplete",
        contentReadOnly:
          "Observed mobility and diabetic foot care safety checks; awaiting finalized discharge transfer reconciliation.",
      },
    ],
    attachments: [
      {
        id: "ATT-DOC-109A",
        name: "CNA_Delegation_Draft_CL1009.pdf",
        fileSize: "920 KB",
        uploadedAt: "2026-11-19 14:18",
        uploadedBy: "Brenda Larson, RN",
      },
    ],
  },
  {
    id: "CDOC-111",
    visitId: "CLV-2026-111",
    requirementId: "REQ-2026-110",
    submittedBy: "Evelyn Vance, RN",
    submittedByRole: "Supervising Nurse RN",
    submittedAt: "2026-08-26 15:30",
    documentType: "Initial HMA RN Assessment & Delegation Packet",
    completenessStatus: "Complete",
    missingItems: [],
    version: 1,
    reviewStatus: "Approved",
    sections: [
      {
        key: "hma_assessment",
        title: "Initial In-Home HMA Nursing Evaluation",
        status: "Complete",
        contentReadOnly:
          "Completed comprehensive baseline assessment for Thomas Callahan. HMA tasks reviewed with primary support; quarterly virtual RN check schedule established.",
      },
    ],
    attachments: [
      {
        id: "ATT-DOC-111A",
        name: "Initial_HMA_RN_SignOff_CL1010.pdf",
        fileSize: "2.1 MB",
        uploadedAt: "2026-08-26 15:25",
        uploadedBy: "Evelyn Vance, RN",
      },
    ],
  },
  {
    id: "CDOC-112",
    visitId: "CLV-2026-112",
    requirementId: "REQ-2026-101",
    submittedBy: "Rachel Miller, RN",
    submittedByRole: "Clinical Supervisor / RN",
    submittedAt: "2026-08-28 16:45",
    documentType: "Quarterly Pediatric RN Supervisory Report",
    completenessStatus: "Complete",
    missingItems: [],
    version: 1,
    reviewStatus: "Approved",
    sections: [
      {
        key: "pediatric_review",
        title: "Pediatric ADL & Asthma Protocol Review",
        status: "Complete",
        contentReadOnly:
          "Verified emergency inhaler availability, sensory environment safety, and family caregiver Sarah Miller competency.",
      },
    ],
    attachments: [
      {
        id: "ATT-DOC-112A",
        name: "Q3_RN_Supervision_CL1001.pdf",
        fileSize: "1.8 MB",
        uploadedAt: "2026-08-28 16:40",
        uploadedBy: "Rachel Miller, RN",
      },
    ],
  },
  {
    id: "CDOC-113",
    visitId: "CLV-2026-113",
    requirementId: "REQ-2026-111",
    submittedBy: null,
    submittedByRole: null,
    submittedAt: null,
    documentType: "CNA RN Supervisory & Skin Integrity Record",
    completenessStatus: "Pending",
    missingItems: [
      "RN Visit Assessment Narrative",
      "Vital Signs & Mobility Verification",
      "Caregiver Supervision Checklist",
    ],
    version: 0,
    reviewStatus: "Pending Review",
    sections: [],
    attachments: [],
  },
  {
    id: "CDOC-114",
    visitId: "CLV-2026-114",
    requirementId: "REQ-2026-112",
    submittedBy: "Rachel Miller, RN",
    submittedByRole: "Clinical Supervisor / RN",
    submittedAt: "2026-11-20 17:00",
    documentType: "Annual Personal Care Supervisory Evaluation",
    completenessStatus: "Submitted",
    missingItems: [],
    version: 1,
    reviewStatus: "Under Review",
    sections: [
      {
        key: "annual_review",
        title: "Annual Household & ADL Supervision Summary",
        status: "Complete",
        contentReadOnly:
          "Evaluated home environment, personal care hygiene outcomes, and care plan progress with Sofia Morales and Hannah Morales.",
      },
    ],
    attachments: [
      {
        id: "ATT-DOC-114A",
        name: "Annual_Supervisory_Eval_CL1005.pdf",
        fileSize: "1.6 MB",
        uploadedAt: "2026-11-20 16:58",
        uploadedBy: "Rachel Miller, RN",
      },
    ],
  },
];

export const INITIAL_CLINICAL_REVIEWS: ClinicalReview[] = [
  {
    id: "CREV-103",
    visitId: "CLV-2026-103",
    reviewerId: "PROF-RN-01",
    reviewerName: "Rachel Miller, RN",
    reviewerRole: "Clinical Supervisor / RN",
    reviewStatus: "Pending Review",
    reviewedAt: null,
    signOffTimestamp: null,
    comments: "Assigned to Rachel Miller, RN for clinical quality verification and sign-off.",
    outstandingIssues: [],
    followUpRequired: false,
  },
  {
    id: "CREV-105",
    visitId: "CLV-2026-105",
    reviewerId: "PROF-RN-02",
    reviewerName: "Carlos Mendez, RN",
    reviewerRole: "Clinical Supervisor / RN",
    reviewStatus: "Follow-up Required",
    reviewedAt: "2026-11-24 11:20",
    signOffTimestamp: null,
    comments: "Supervisory check documented, but guardian attestation signature is missing from packet.",
    outstandingIssues: ["Missing guardian attestation upload"],
    followUpRequired: true,
  },
  {
    id: "CREV-109",
    visitId: "CLV-2026-109",
    reviewerId: "PROF-RN-02",
    reviewerName: "Carlos Mendez, RN",
    reviewerRole: "Clinical Supervisor / RN",
    reviewStatus: "Returned for Correction",
    reviewedAt: "2026-11-22 15:00",
    signOffTimestamp: null,
    comments: "Returned to performing RN for clarification on active vs discharged CNA care plan alignment.",
    outstandingIssues: [
      "Missing peripheral neuropathy skin assessment log",
      "Clarify authorization status",
    ],
    followUpRequired: true,
  },
  {
    id: "CREV-111",
    visitId: "CLV-2026-111",
    reviewerId: "PROF-RN-01",
    reviewerName: "Rachel Miller, RN",
    reviewerRole: "Clinical Supervisor / RN",
    reviewStatus: "Approved",
    reviewedAt: "2026-08-27 09:00",
    signOffTimestamp: "2026-08-27 09:00:14",
    comments: "Initial HMA assessment meets clinical oversight standards.",
    outstandingIssues: [],
    followUpRequired: false,
  },
  {
    id: "CREV-112",
    visitId: "CLV-2026-112",
    reviewerId: "PROF-RN-03",
    reviewerName: "Evelyn Vance, RN",
    reviewerRole: "Supervising Nurse RN",
    reviewStatus: "Approved",
    reviewedAt: "2026-08-29 13:00",
    signOffTimestamp: "2026-08-29 13:00:42",
    comments: "Q3 pediatric supervisory evaluation approved.",
    outstandingIssues: [],
    followUpRequired: false,
  },
  {
    id: "CREV-113",
    visitId: "CLV-2026-113",
    reviewerId: "PROF-RN-01",
    reviewerName: "Rachel Miller, RN",
    reviewerRole: "Clinical Supervisor / RN",
    reviewStatus: "Pending Review",
    reviewedAt: null,
    signOffTimestamp: null,
    comments: "Awaiting visit documentation submission from Carlos Mendez, RN.",
    outstandingIssues: ["Visit documentation not yet submitted"],
    followUpRequired: false,
  },
  {
    id: "CREV-114",
    visitId: "CLV-2026-114",
    reviewerId: "PROF-RN-02",
    reviewerName: "Carlos Mendez, RN",
    reviewerRole: "Clinical Supervisor / RN",
    reviewStatus: "Under Review",
    reviewedAt: "2026-11-22 10:15",
    signOffTimestamp: null,
    comments: "Under secondary RN review; pending final sign-off confirmation.",
    outstandingIssues: ["Confirm 6-month care plan reassessment schedule alignment"],
    followUpRequired: true,
  },
];

export const INITIAL_CLINICAL_FOLLOWUPS: ClinicalFollowUp[] = [
  {
    id: "CFU-2026-01",
    visitId: "CLV-2026-102",
    requirementId: "REQ-2026-102",
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    assignedToId: "usr-001",
    assignedToName: "Sarah Jenkins",
    followUpType: "Overdue Visit",
    priority: "Critical",
    description: "Reschedule overdue Q4 RN Supervisory Visit with Elena Whitfield and Rachel Miller, RN.",
    internalNotes: "Client finished outpatient PT eval on Nov 23; call daughter Elena to confirm Nov 28 slot.",
    dueDate: "2026-11-27",
    status: "Open",
    createdBy: "Sarah Jenkins",
    createdAt: "2026-11-22 09:15",
    completedAt: null,
    completedBy: null,
  },
  {
    id: "CFU-2026-02",
    visitId: "CLV-2026-104",
    requirementId: "REQ-2026-104",
    clientId: "CL-1004",
    clientName: "Jackson Vance",
    assignedToId: "OC-15",
    assignedToName: "Chloe Martin",
    followUpType: "Unassigned Requirement",
    priority: "Critical",
    description: "Assign eligible Oregon RN for Initial CHCBS Waiver Assessment prior to Dec care start.",
    internalNotes: "Evelyn Vance, RN has bandwidth on Nov 28 afternoon.",
    dueDate: "2026-11-27",
    status: "Open",
    createdBy: "Sarah Jenkins",
    createdAt: "2026-11-25 16:05",
    completedAt: null,
    completedBy: null,
  },
  {
    id: "CFU-2026-03",
    visitId: "CLV-2026-105",
    requirementId: "REQ-2026-105",
    clientId: "CL-1005",
    clientName: "Hannah Morales",
    assignedToId: "OC-12",
    assignedToName: "Dana Jenkins, MSW",
    followUpType: "Missing Documentation",
    priority: "High",
    description: "Obtain signed guardian attestation form from Sofia Morales and attach to IHSS supervisory record.",
    internalNotes: "Mock reminder sent to Anita Roy, MSW on Nov 25.",
    dueDate: "2026-11-28",
    status: "In Progress",
    createdBy: "Dana Jenkins, MSW",
    createdAt: "2026-11-24 11:30",
    completedAt: null,
    completedBy: null,
  },
  {
    id: "CFU-2026-04",
    visitId: "CLV-2026-109",
    requirementId: "REQ-2026-109",
    clientId: "CL-1009",
    clientName: "Robert Davis",
    assignedToId: "usr-004",
    assignedToName: "David Chen",
    followUpType: "Clinical Escalation",
    priority: "Critical",
    description: "Resolve returned CNA supervisory record and confirm client authorization/discharge standing.",
    internalNotes: "Escalated to QA & Clinical Supervisor RN for authorization reconciliation.",
    dueDate: "2026-11-26",
    status: "Escalated",
    createdBy: "Sarah Jenkins",
    createdAt: "2026-11-22 15:15",
    completedAt: null,
    completedBy: null,
  },
];

export const INITIAL_CLINICAL_AUDIT: ClinicalAuditEvent[] = [
  {
    id: "CAUD-9010",
    entityType: "Visit",
    entityId: "CLV-2026-113",
    relatedClientId: "CL-1002",
    relatedClientName: "Marcus Whitfield",
    relatedVisitId: "CLV-2026-113",
    action: "VISIT_COMPLETED_DOC_PENDING",
    performedBy: "Carlos Mendez, RN",
    performedByRole: "Clinical Supervisor / RN",
    previousValue: "Scheduled",
    newValue: "Visit Completed / Doc Pending",
    reason: "In-home CNA supervisory visit completed; documentation timer started (24h SLA).",
    timestamp: "2026-11-25 16:40",
  },
  {
    id: "CAUD-9009",
    entityType: "Notification",
    entityId: "CLV-2026-105",
    relatedClientId: "CL-1005",
    relatedClientName: "Hannah Morales",
    relatedVisitId: "CLV-2026-105",
    action: "MOCK_REMINDER_LOGGED",
    performedBy: "Sarah Jenkins",
    performedByRole: "Agency Administrator",
    previousValue: "Incomplete Documentation",
    newValue: "Reminder Logged",
    reason: "Simulated reminder logged for Anita Roy, MSW regarding missing guardian attestation.",
    timestamp: "2026-11-25 14:30",
  },
  {
    id: "CAUD-9008",
    entityType: "Schedule",
    entityId: "CLV-2026-110",
    relatedClientId: "CL-1010",
    relatedClientName: "Thomas Callahan",
    relatedVisitId: "CLV-2026-110",
    action: "VISIT_SCHEDULED",
    performedBy: "Sarah Jenkins",
    performedByRole: "Agency Administrator",
    previousValue: "Unscheduled",
    newValue: "2026-11-26 11:00 (Virtual)",
    reason: "Linked to Real-Time Scheduling visit VIS-1093 under HMA Rule v1.2.",
    timestamp: "2026-11-25 11:30",
  },
  {
    id: "CAUD-9007",
    entityType: "Documentation",
    entityId: "CLV-2026-103",
    relatedClientId: "CL-1003",
    relatedClientName: "Sophia Bennett",
    relatedVisitId: "CLV-2026-103",
    action: "DOCUMENTATION_SUBMITTED",
    performedBy: "Carlos Mendez, RN",
    performedByRole: "Clinical Supervisor / RN",
    previousValue: "Pending",
    newValue: "Submitted (v1)",
    reason: "Quarterly RN assessment uploaded and routed to clinical review queue.",
    timestamp: "2026-11-24 17:45",
  },
  {
    id: "CAUD-9006",
    entityType: "Review",
    entityId: "CLV-2026-109",
    relatedClientId: "CL-1009",
    relatedClientName: "Robert Davis",
    relatedVisitId: "CLV-2026-109",
    action: "RETURNED_FOR_CORRECTION",
    performedBy: "Carlos Mendez, RN",
    performedByRole: "Clinical Supervisor / RN",
    previousValue: "Pending Review",
    newValue: "Returned for Correction",
    reason: "Missing skin assessment log and CNA delegation reconciliation.",
    timestamp: "2026-11-22 15:00",
  },
  {
    id: "CAUD-9005",
    entityType: "FollowUp",
    entityId: "CFU-2026-01",
    relatedClientId: "CL-1002",
    relatedClientName: "Marcus Whitfield",
    relatedVisitId: "CLV-2026-102",
    action: "FOLLOWUP_CREATED",
    performedBy: "Sarah Jenkins",
    performedByRole: "Agency Administrator",
    previousValue: "None",
    newValue: "Open (Critical)",
    reason: "Overdue RN visit alert triggered follow-up workflow.",
    timestamp: "2026-11-22 09:15",
  },
  {
    id: "CAUD-9004",
    entityType: "Schedule",
    entityId: "CLV-2026-101",
    relatedClientId: "CL-1001",
    relatedClientName: "Leo Miller",
    relatedVisitId: "CLV-2026-101",
    action: "VISIT_SCHEDULED",
    performedBy: "Sarah Jenkins",
    performedByRole: "Agency Administrator",
    previousValue: "Unscheduled",
    newValue: "2026-11-27 10:00 (In-home)",
    reason: "Scheduled Quarterly RN Supervisory Visit linked to VIS-1091.",
    timestamp: "2026-11-20 14:15",
  },
  {
    id: "CAUD-9003",
    entityType: "Requirement",
    entityId: "REQ-2026-104",
    relatedClientId: "CL-1004",
    relatedClientName: "Jackson Vance",
    relatedVisitId: "CLV-2026-104",
    action: "REQUIREMENT_CREATED",
    performedBy: "Sarah Jenkins",
    performedByRole: "Agency Administrator",
    previousValue: "None",
    newValue: "Pending Assignment (Rule CRULE-06 v1.1)",
    reason: "CHCBS Waiver authorization approved; Initial RN assessment required.",
    timestamp: "2026-11-10 10:30",
  },
  {
    id: "CAUD-9002",
    entityType: "Rule",
    entityId: "CRULE-01",
    relatedClientId: "SYSTEM",
    relatedClientName: "Agency Rules Engine",
    relatedVisitId: null,
    action: "RULE_UPDATED",
    performedBy: "Sarah Jenkins",
    performedByRole: "Agency Administrator",
    previousValue: "v1.0 (In-home)",
    newValue: "v1.2 (Virtual recurring)",
    reason: "Updated recurring HMA quarterly supervision to Virtual delivery forward from 2026-10-15.",
    timestamp: "2026-10-12 09:30",
  },
  {
    id: "CAUD-9001",
    entityType: "Review",
    entityId: "CLV-2026-112",
    relatedClientId: "CL-1001",
    relatedClientName: "Leo Miller",
    relatedVisitId: "CLV-2026-112",
    action: "CLINICAL_SIGN_OFF_COMPLETED",
    performedBy: "Evelyn Vance, RN",
    performedByRole: "Supervising Nurse RN",
    previousValue: "Pending Review",
    newValue: "Approved",
    reason: "Q3 pediatric supervisory assessment reviewed and electronically signed by RN.",
    timestamp: "2026-08-29 13:00",
  },
];

// =========================================================================
// STORAGE HELPERS & CROSS-MODULE SYNC
// =========================================================================

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save clinical store key:", key, err);
  }
}

export function emitClinicalSync(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CLINICAL_SYNC_EVENT, { detail: { timestamp: Date.now() } })
  );
}

export function getClinicalRequirements(): ClinicalRequirement[] {
  return readJson<ClinicalRequirement[]>(
    CLINICAL_REQ_STORAGE_KEY,
    INITIAL_CLINICAL_REQUIREMENTS
  );
}

export function getClinicalVisits(): ClinicalVisit[] {
  return readJson<ClinicalVisit[]>(
    CLINICAL_VISIT_STORAGE_KEY,
    INITIAL_CLINICAL_VISITS
  );
}

export function getClinicalDocumentationList(): ClinicalDocumentation[] {
  return readJson<ClinicalDocumentation[]>(
    CLINICAL_DOC_STORAGE_KEY,
    INITIAL_CLINICAL_DOCUMENTATION
  );
}

export function getClinicalReviews(): ClinicalReview[] {
  return readJson<ClinicalReview[]>(
    CLINICAL_REVIEW_STORAGE_KEY,
    INITIAL_CLINICAL_REVIEWS
  );
}

export function getClinicalFollowUps(): ClinicalFollowUp[] {
  return readJson<ClinicalFollowUp[]>(
    CLINICAL_FOLLOWUP_STORAGE_KEY,
    INITIAL_CLINICAL_FOLLOWUPS
  );
}

export function getClinicalRules(): ClinicalRule[] {
  return readJson<ClinicalRule[]>(
    CLINICAL_RULE_STORAGE_KEY,
    INITIAL_CLINICAL_RULES
  );
}

export function getClinicalAuditEvents(): ClinicalAuditEvent[] {
  return readJson<ClinicalAuditEvent[]>(
    CLINICAL_AUDIT_STORAGE_KEY,
    INITIAL_CLINICAL_AUDIT
  );
}

export function getMockNotifications(): ClinicalMockNotification[] {
  return readJson<ClinicalMockNotification[]>(CLINICAL_NOTIF_STORAGE_KEY, []);
}

export function appendClinicalAuditEvent(
  event: Omit<ClinicalAuditEvent, "id" | "timestamp">
): ClinicalAuditEvent {
  const list = getClinicalAuditEvents();
  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16);
  const fullEvent: ClinicalAuditEvent = {
    ...event,
    id: `CAUD-${9011 + list.length}`,
    timestamp: nowStr,
  };
  const updated = [fullEvent, ...list];
  writeJson(CLINICAL_AUDIT_STORAGE_KEY, updated);
  return fullEvent;
}

export function subscribeToClinicalSync(cb: () => void): () => void {
  if (typeof window === "undefined") return () => { };
  const handler = () => cb();
  window.addEventListener(CLINICAL_SYNC_EVENT, handler);
  window.addEventListener("lilisare_scheduling_sync", handler);
  window.addEventListener("lilisare_intake_sync", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CLINICAL_SYNC_EVENT, handler);
    window.removeEventListener("lilisare_scheduling_sync", handler);
    window.removeEventListener("lilisare_intake_sync", handler);
    window.removeEventListener("storage", handler);
  };
}

/**
 * Resolves static-export safe detail href for seeded or runtime-created IDs.
 */
const SEEDED_DETAIL_IDS = new Set([
  ...INITIAL_CLINICAL_VISITS.map((v) => v.id),
  ...INITIAL_CLINICAL_REQUIREMENTS.map((r) => r.id),
]);

const SEEDED_RULE_IDS = new Set(INITIAL_CLINICAL_RULES.map((r) => r.id));
const SEEDED_AUDIT_IDS = new Set(INITIAL_CLINICAL_AUDIT.map((e) => e.id));

export function getClinicalDetailHref(
  id: string,
  options?: { tab?: string; eventId?: string }
): string {
  const base = SEEDED_DETAIL_IDS.has(id)
    ? `/admin/clinical/${encodeURIComponent(id)}/`
    : `/admin/clinical/default/?id=${encodeURIComponent(id)}`;
  const extra = new URLSearchParams();
  if (options?.tab) extra.set("tab", options.tab);
  if (options?.eventId) extra.set("eventId", options.eventId);
  const qs = extra.toString();
  if (!qs) return base;
  return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
}

export function getClinicalRuleDetailHref(ruleId: string): string {
  if (SEEDED_RULE_IDS.has(ruleId)) {
    return `/admin/clinical/rules/${encodeURIComponent(ruleId)}/`;
  }
  return `/admin/clinical/rules/default/?id=${encodeURIComponent(ruleId)}`;
}

export function getClinicalAuditEventDetailHref(evt: ClinicalAuditEvent): string {
  if (evt.relatedVisitId) {
    return getClinicalDetailHref(evt.relatedVisitId, {
      tab: "audit",
      eventId: evt.id,
    });
  }
  if (SEEDED_AUDIT_IDS.has(evt.id)) {
    return `/admin/clinical/audit/${encodeURIComponent(evt.id)}/`;
  }
  return `/admin/clinical/audit/default/?id=${encodeURIComponent(evt.id)}`;
}

export function resolveClinicalRuleByParam(
  paramId: string,
  queryId?: string | null
): ClinicalRule | null {
  const targetId = (queryId && queryId.trim()) || paramId;
  const rules = getClinicalRules();
  const match = rules.find((r) => r.id.toLowerCase() === targetId.toLowerCase()) || null;
  if (!match && (targetId === "default" || targetId === "[ruleId]")) {
    return rules[0] || null;
  }
  return match;
}

export function resolveClinicalAuditEventByParam(
  paramId: string,
  queryId?: string | null
): ClinicalAuditEvent | null {
  const targetId = (queryId && queryId.trim()) || paramId;
  const events = getClinicalAuditEvents();
  const match = events.find((e) => e.id.toLowerCase() === targetId.toLowerCase()) || null;
  if (!match && (targetId === "default" || targetId === "[eventId]")) {
    return events[0] || null;
  }
  return match;
}

export function resolveClinicalRecordByParam(paramId: string, queryId?: string | null): {
  visit: ClinicalVisit | null;
  requirement: ClinicalRequirement | null;
  documentation: ClinicalDocumentation | null;
  review: ClinicalReview | null;
} {
  const targetId = (queryId && queryId.trim()) || paramId;
  const visits = getClinicalVisits();
  const reqs = getClinicalRequirements();
  const docs = getClinicalDocumentationList();
  const reviews = getClinicalReviews();

  let visit =
    visits.find((v) => v.id.toLowerCase() === targetId.toLowerCase()) ||
    visits.find((v) => v.requirementId.toLowerCase() === targetId.toLowerCase()) ||
    null;

  if (!visit && (targetId === "default" || targetId === "[visitId]")) {
    visit = visits[0] || null;
  }

  const requirement = visit
    ? reqs.find((r) => r.id === visit!.requirementId) || null
    : reqs.find((r) => r.id.toLowerCase() === targetId.toLowerCase()) || null;

  const documentation = visit
    ? docs.find((d) => d.visitId === visit!.id) || null
    : null;

  const review = visit
    ? reviews.find((rev) => rev.visitId === visit!.id) || null
    : null;

  return { visit, requirement, documentation, review };
}

/**
 * KPI Summary derived directly from live store records
 */
export function getClinicalKpiSummary(
  reqs?: ClinicalRequirement[],
  visits?: ClinicalVisit[]
): ClinicalKpiSummary {
  const rList = reqs || getClinicalRequirements();
  const vList = visits || getClinicalVisits();

  const activeReqs = rList.filter(
    (r) => r.status !== "Cancelled" && r.status !== "Not Required" && r.status !== "Draft"
  );

  const upcomingVisits = vList.filter(
    (v) =>
      v.visitStatus === "Scheduled" ||
      v.visitStatus === "Rescheduled" ||
      v.visitStatus === "In Progress"
  ).length;

  const dueThisMonth = activeReqs.filter(
    (r) => r.nextDueDate >= "2026-11-01" && r.nextDueDate <= "2026-11-30"
  ).length;

  const overdueVisits = activeReqs.filter(
    (r) =>
      r.status === "Overdue" ||
      (r.nextDueDate < DEMO_TODAY &&
        r.status !== "Completed" &&
        r.status !== "On Hold")
  ).length;

  const pendingDocumentation = vList.filter(
    (v) =>
      (v.visitStatus === "Completed" &&
        (v.documentationStatus === "Pending" ||
          v.documentationStatus === "Incomplete" ||
          v.documentationStatus === "Correction Requested" ||
          v.documentationStatus === "Not Started")) ||
      v.documentationStatus === "Correction Requested" ||
      v.documentationStatus === "Incomplete"
  ).length;

  const pendingClinicalReview = vList.filter(
    (v) =>
      v.reviewStatus === "Pending Review" ||
      v.reviewStatus === "Under Review" ||
      v.reviewStatus === "Returned for Correction" ||
      v.reviewStatus === "Follow-up Required"
  ).length;

  const unassignedCount = activeReqs.filter((r) => !r.assignedProfessionalId).length;
  const followUpRequiredCount = vList.filter((v) => v.followUpRequired).length;

  return {
    totalActiveRequirements: activeReqs.length,
    upcomingVisits,
    dueThisMonth,
    overdueVisits,
    pendingDocumentation,
    pendingClinicalReview,
    unassignedCount,
    followUpRequiredCount,
  };
}

// =========================================================================
// MUTATION WORKFLOWS (RBAC GUARDED + AUDITED + SCHEDULING SYNCED)
// =========================================================================

export function createClinicalRequirement(
  payload: {
    requirementName: string;
    clientId: string;
    agencyId: string;
    agencyName: string;
    programName: string;
    serviceId: string;
    serviceName: string;
    serviceCode: string;
    serviceStartDate: string;
    authorizationId: string;
    ruleId: string;
    visitCategory: ClinicalVisitCategory;
    visitType: string;
    professionalType: ClinicalProfessionalType;
    isInitial: boolean;
    isRecurring: boolean;
    frequency: string;
    recurrenceIntervalDays: number;
    deliveryMethod: VisitDeliveryMethod;
    effectiveDate: string;
    endDate?: string;
    firstDueDate: string;
    nextDueDate: string;
    assignedProfessionalId: string | null;
    internalOwnerId: string;
    internalOwnerName: string;
    priority: PriorityLevel;
    internalNotes: string;
    asDraft?: boolean;
    exceptionConfirmed?: boolean;
  },
  actor: ClinicalActorContext
): { requirement: ClinicalRequirement; visit: ClinicalVisit } {
  assertClinicalPermission(actor, "CREATE_REQUIREMENT");

  const reqs = getClinicalRequirements();
  const visits = getClinicalVisits();
  const rules = getClinicalRules();
  const clients = typeof window !== "undefined" ? getClientsFromStorage() : INITIAL_CLIENTS;
  const client = clients.find((c) => c.id === payload.clientId);

  if (!client) {
    throw new Error("Selected client was not found in Client Management.");
  }

  // Duplicate active requirement check unless authorized exception is confirmed
  const duplicate = reqs.find(
    (r) =>
      r.clientId === payload.clientId &&
      r.ruleId === payload.ruleId &&
      r.status !== "Cancelled" &&
      r.status !== "Completed" &&
      r.status !== "Not Required"
  );
  if (duplicate && !payload.exceptionConfirmed && !payload.asDraft) {
    throw new Error(
      `An active requirement (${duplicate.id}) already exists for ${client.name} under this rule. Confirm an exception override to create another.`
    );
  }

  const rule = rules.find((r) => r.id === payload.ruleId);
  const prof = payload.assignedProfessionalId
    ? CLINICAL_PROFESSIONALS.find((p) => p.id === payload.assignedProfessionalId) || null
    : null;

  if (prof && !isProfessionalEligibleForType(prof, payload.professionalType)) {
    throw new Error(
      `${prof.name} (${prof.qualificationType}) is not eligible for required professional type "${payload.professionalType}".`
    );
  }

  const nowIso = new Date().toISOString();
  const suffix = String(113 + reqs.length);
  const reqId = `REQ-2026-${suffix}`;
  const visitId = `CLV-2026-${suffix}`;

  const initialReqStatus: RequirementStatus = payload.asDraft
    ? "Draft"
    : !prof
      ? "Pending Assignment"
      : payload.firstDueDate < DEMO_TODAY
        ? "Overdue"
        : "Active";

  const newReq: ClinicalRequirement = {
    id: reqId,
    requirementName: payload.requirementName,
    clientId: client.id,
    clientName: client.name,
    householdId: client.household?.id || "hh-1001",
    householdName: client.household?.name || `${client.name} Household`,
    agencyId: payload.agencyId,
    agencyName: payload.agencyName,
    programId: rule?.programId || "PRG-CUSTOM",
    programName: payload.programName,
    serviceId: payload.serviceId,
    serviceName: payload.serviceName,
    serviceCode: payload.serviceCode,
    serviceStartDate: payload.serviceStartDate,
    authorizationId: payload.authorizationId || client.authorization?.authNumber || "AUTH-PENDING",
    ruleId: payload.ruleId,
    ruleName: rule?.ruleName || "Custom Clinical Rule",
    ruleVersion: rule?.version || "1.0",
    visitCategory: payload.visitCategory,
    visitType: payload.visitType,
    professionalType: payload.professionalType,
    isInitial: payload.isInitial,
    isRecurring: payload.isRecurring,
    frequency: payload.frequency,
    recurrenceIntervalDays: payload.recurrenceIntervalDays,
    deliveryMethod: payload.deliveryMethod,
    effectiveDate: payload.effectiveDate,
    endDate: payload.endDate || undefined,
    firstDueDate: payload.firstDueDate,
    nextDueDate: payload.nextDueDate || payload.firstDueDate,
    lastCompletedDate: null,
    assignedProfessionalId: prof?.id || null,
    assignedProfessionalName: prof?.name || null,
    internalOwnerId: payload.internalOwnerId,
    internalOwnerName: payload.internalOwnerName,
    priority: payload.priority,
    status: initialReqStatus,
    documentationStatus: "Not Started",
    reviewStatus: rule?.reviewRequired === false ? "Not Required" : "Pending Review",
    activeVisitId: visitId,
    internalNotes: payload.internalNotes,
    exceptionConfirmed: payload.exceptionConfirmed,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const newVisit: ClinicalVisit = {
    id: visitId,
    requirementId: reqId,
    clientId: client.id,
    clientName: client.name,
    householdId: client.household?.id || "hh-1001",
    householdName: client.household?.name || `${client.name} Household`,
    agencyId: payload.agencyId,
    agencyName: payload.agencyName,
    programName: payload.programName,
    serviceName: payload.serviceName,
    serviceCode: payload.serviceCode,
    scheduledVisitId: null,
    professionalId: prof?.id || null,
    professionalName: prof?.name || null,
    professionalQualification: payload.professionalType,
    visitType: payload.visitType,
    visitCategory: payload.visitCategory,
    dueDate: payload.firstDueDate,
    scheduledDate: null,
    scheduledStartTime: null,
    scheduledEndTime: null,
    scheduledAt: null,
    completedAt: null,
    deliveryMethod: payload.deliveryMethod,
    locationDetails:
      payload.deliveryMethod === "Virtual"
        ? `HIPAA Telehealth Video — ${client.household?.name || client.name}`
        : `${client.household?.address || ""}, ${client.household?.city || ""}, ${client.household?.state || ""} ${client.household?.zip || ""}`.trim(),
    visitStatus: "Unscheduled",
    documentationStatus: "Not Started",
    reviewStatus: rule?.reviewRequired === false ? "Not Required" : "Pending Review",
    followUpRequired: !prof,
    priority: payload.priority,
    ruleId: payload.ruleId,
    ruleVersion: rule?.version || "1.0",
    daysPendingReview: 0,
    lastReminderAt: null,
    operationalNotes: payload.internalNotes,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  writeJson(CLINICAL_REQ_STORAGE_KEY, [newReq, ...reqs]);
  writeJson(CLINICAL_VISIT_STORAGE_KEY, [newVisit, ...visits]);

  appendClinicalAuditEvent({
    entityType: "Requirement",
    entityId: reqId,
    relatedClientId: client.id,
    relatedClientName: client.name,
    relatedVisitId: visitId,
    action: payload.asDraft ? "REQUIREMENT_DRAFT_SAVED" : "REQUIREMENT_CREATED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: "None",
    newValue: `${newReq.visitType} (${newReq.status})`,
    reason: payload.exceptionConfirmed
      ? `Authorized exception override under ${newReq.ruleName} v${newReq.ruleVersion}`
      : `Created under ${newReq.ruleName} v${newReq.ruleVersion}`,
  });

  emitClinicalSync();
  return { requirement: newReq, visit: newVisit };
}

export function assignClinicalProfessional(
  visitId: string,
  professionalId: string,
  actor: ClinicalActorContext,
  reason = "Assigned via Agency Admin operational oversight"
): ClinicalVisit {
  assertClinicalPermission(actor, "ASSIGN_PROFESSIONAL");

  const visits = getClinicalVisits();
  const reqs = getClinicalRequirements();
  const visit = visits.find((v) => v.id === visitId);
  if (!visit) throw new Error(`Clinical visit ${visitId} not found.`);

  const prof = CLINICAL_PROFESSIONALS.find((p) => p.id === professionalId);
  if (!prof) throw new Error("Selected professional not found.");

  if (!isProfessionalEligibleForType(prof, visit.professionalQualification)) {
    throw new Error(
      `${prof.name} (${prof.qualificationType}) does not satisfy required qualification "${visit.professionalQualification}".`
    );
  }

  const prevProf = visit.professionalName || "Unassigned";
  const nowIso = new Date().toISOString();

  const updatedVisits = visits.map((v) =>
    v.id === visitId
      ? {
        ...v,
        professionalId: prof.id,
        professionalName: prof.name,
        updatedAt: nowIso,
      }
      : v
  );

  const updatedReqs = reqs.map((r) =>
    r.id === visit.requirementId
      ? {
        ...r,
        assignedProfessionalId: prof.id,
        assignedProfessionalName: prof.name,
        status:
          r.status === "Pending Assignment"
            ? visit.scheduledDate
              ? ("Scheduled" as RequirementStatus)
              : ("Active" as RequirementStatus)
            : r.status,
        updatedAt: nowIso,
      }
      : r
  );

  writeJson(CLINICAL_VISIT_STORAGE_KEY, updatedVisits);
  writeJson(CLINICAL_REQ_STORAGE_KEY, updatedReqs);

  // Sync linked Scheduling record if present
  if (visit.scheduledVisitId) {
    const schedVisits = getVisitsFromStorage();
    const updatedSched = schedVisits.map((sv) =>
      sv.id === visit.scheduledVisitId
        ? {
          ...sv,
          caregiverId: prof.id,
          caregiverName: prof.name,
          caregiverClass: `${prof.roleTitle} (Clinical)`,
          isModifiedFromSchedule: true,
          modificationReason: "Clinical Professional Reassigned",
          auditTrail: [
            {
              id: `aud-${Date.now()}`,
              timestamp: new Date().toLocaleString(),
              actor: actor.name,
              actorRole: actor.roleLabel,
              action: "Clinical Professional Reassigned",
              details: `Assigned to ${prof.name} (${prof.qualificationType})`,
            },
            ...(sv.auditTrail || []),
          ],
        }
        : sv
    );
    saveVisitsToStorage(updatedSched);
  }

  appendClinicalAuditEvent({
    entityType: "Visit",
    entityId: visit.id,
    relatedClientId: visit.clientId,
    relatedClientName: visit.clientName,
    relatedVisitId: visit.id,
    action: prevProf === "Unassigned" ? "PROFESSIONAL_ASSIGNED" : "PROFESSIONAL_REASSIGNED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: prevProf,
    newValue: `${prof.name} (${prof.qualificationType})`,
    reason,
  });

  emitClinicalSync();
  return updatedVisits.find((v) => v.id === visitId)!;
}

/**
 * Schedules or Reschedules a clinical/supervisory visit AND writes/updates a linked
 * RealTimeVisit inside the master Scheduling store (`schedulingStore.ts`) so there is
 * zero duplicated scheduling system.
 */
export function scheduleOrRescheduleClinicalVisit(
  visitId: string,
  params: {
    date: string;
    startTime: string;
    endTime: string;
    deliveryMethod: VisitDeliveryMethod;
    professionalId?: string | null;
    notes?: string;
  },
  actor: ClinicalActorContext
): { visit: ClinicalVisit; scheduledVisitId: string } {
  const visits = getClinicalVisits();
  const reqs = getClinicalRequirements();
  const existing = visits.find((v) => v.id === visitId);
  if (!existing) throw new Error(`Clinical visit ${visitId} not found.`);

  const isReschedule = Boolean(existing.scheduledDate);
  assertClinicalPermission(actor, isReschedule ? "RESCHEDULE_VISIT" : "SCHEDULE_VISIT");

  const targetProfId =
    params.professionalId !== undefined ? params.professionalId : existing.professionalId;
  const prof = targetProfId
    ? CLINICAL_PROFESSIONALS.find((p) => p.id === targetProfId) || null
    : null;

  if (prof && !isProfessionalEligibleForType(prof, existing.professionalQualification)) {
    throw new Error(
      `${prof.name} is not eligible for required qualification "${existing.professionalQualification}".`
    );
  }

  const clients = typeof window !== "undefined" ? getClientsFromStorage() : INITIAL_CLIENTS;
  const client = clients.find((c) => c.id === existing.clientId);
  const schedVisits = getVisitsFromStorage();
  const linkedSchedId =
    existing.scheduledVisitId || `VIS-CL-${existing.id.replace("CLV-2026-", "")}`;

  const [sh, sm] = params.startTime.split(":").map(Number);
  const [eh, em] = params.endTime.split(":").map(Number);
  const duration = Math.max(0.5, Math.round((((eh * 60 + em) - (sh * 60 + sm)) / 60) * 100) / 100);

  const schedPayload: RealTimeVisit = {
    id: linkedSchedId,
    shiftNumber: `#CL-${existing.id.slice(-3)}`,
    date: params.date,
    startTime: params.startTime,
    endTime: params.endTime,
    status: prof ? "Scheduled" : "Unassigned",
    isModifiedFromSchedule: isReschedule,
    modificationReason: isReschedule ? "Clinical Visit Rescheduled" : "None / Original Schedule",
    clientId: existing.clientId,
    clientName: existing.clientName,
    clientAdmin: client?.agencyInfo?.administrator || "Dana Jenkins, MSW",
    clientClass: client?.careType || "Clinical Oversight",
    clientRegion: client?.household?.city || "Springfield",
    householdId: existing.householdId,
    householdName: existing.householdName,
    address: existing.locationDetails,
    caregiverId: prof?.id || null,
    caregiverName: prof?.name || null,
    caregiverAdmin: actor.name,
    caregiverClass: prof ? `${prof.roleTitle} (Clinical)` : undefined,
    caregiverRegion: "Clinical Supervision",
    serviceId: existing.programName.includes("IHSS") ? "svc-ihss" : "svc-home-care-assessment",
    serviceCode: existing.serviceCode,
    serviceName: existing.visitType,
    unitType: "Per Assessment",
    billRate: 0,
    payRate: 0,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: duration,
    authorizationNumber: client?.authorization?.authNumber || "SUP-OVERSIGHT",
    authorizedWeeklyCap: client?.carePlan?.authorizedWeeklyHours || 40,
    clockInLocation:
      params.deliveryMethod === "Virtual"
        ? "Any profile address"
        : "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: [existing.professionalQualification, "Clinical Supervision"],
    travelMinutes: params.deliveryMethod === "Virtual" ? 0 : 18,
    distanceMiles: params.deliveryMethod === "Virtual" ? 0 : 6.4,
    conflicts: [],
    memo: `[Clinical & Supervisory] ${existing.visitType} (${params.deliveryMethod}). ${params.notes || ""}`.trim(),
    internalNotes: `Linked to Clinical Visit ${existing.id} / Requirement ${existing.requirementId}`,
    broadcasts: [],
    auditTrail: [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        actor: actor.name,
        actorRole: actor.roleLabel,
        action: isReschedule ? "Clinical Visit Rescheduled" : "Clinical Visit Scheduled",
        details: `${params.date} ${params.startTime}–${params.endTime} (${params.deliveryMethod}) with ${prof?.name || "Unassigned"}`,
      },
    ],
    visitCategory: "Clinical & Supervisory",
    clinicalVisitId: existing.id,
    clinicalVisitType: existing.visitType,
    clinicalDeliveryMethod: params.deliveryMethod,
  };

  const existsInSched = schedVisits.some((s) => s.id === linkedSchedId);
  const nextSchedVisits = existsInSched
    ? schedVisits.map((s) => (s.id === linkedSchedId ? { ...s, ...schedPayload } : s))
    : [schedPayload, ...schedVisits];
  saveVisitsToStorage(nextSchedVisits);

  const prevVal = existing.scheduledAt || "Unscheduled";
  const newVal = `${params.date} ${params.startTime}–${params.endTime} (${params.deliveryMethod})`;
  const nowIso = new Date().toISOString();

  const nextVisitStatus: ClinicalVisitStatus = isReschedule ? "Rescheduled" : "Scheduled";
  const updatedVisits = visits.map((v) =>
    v.id === visitId
      ? {
        ...v,
        scheduledVisitId: linkedSchedId,
        professionalId: prof?.id || null,
        professionalName: prof?.name || null,
        scheduledDate: params.date,
        scheduledStartTime: params.startTime,
        scheduledEndTime: params.endTime,
        scheduledAt: `${params.date} ${params.startTime}`,
        deliveryMethod: params.deliveryMethod,
        visitStatus: nextVisitStatus,
        operationalNotes: params.notes || v.operationalNotes,
        updatedAt: nowIso,
      }
      : v
  );

  const updatedReqs = reqs.map((r) =>
    r.id === existing.requirementId
      ? {
        ...r,
        assignedProfessionalId: prof?.id || null,
        assignedProfessionalName: prof?.name || null,
        deliveryMethod: params.deliveryMethod,
        status: (prof ? "Scheduled" : "Pending Assignment") as RequirementStatus,
        updatedAt: nowIso,
      }
      : r
  );

  writeJson(CLINICAL_VISIT_STORAGE_KEY, updatedVisits);
  writeJson(CLINICAL_REQ_STORAGE_KEY, updatedReqs);

  appendClinicalAuditEvent({
    entityType: "Schedule",
    entityId: existing.id,
    relatedClientId: existing.clientId,
    relatedClientName: existing.clientName,
    relatedVisitId: existing.id,
    action: isReschedule ? "VISIT_RESCHEDULED" : "VISIT_SCHEDULED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: prevVal,
    newValue: `${newVal} [${linkedSchedId}]`,
    reason: params.notes || "Synchronized with master Scheduling module.",
  });

  emitClinicalSync();
  return {
    visit: updatedVisits.find((v) => v.id === visitId)!,
    scheduledVisitId: linkedSchedId,
  };
}

export function cancelClinicalVisit(
  visitId: string,
  reason: string,
  actor: ClinicalActorContext
): ClinicalVisit {
  assertClinicalPermission(actor, "CANCEL_VISIT");
  if (!reason.trim()) throw new Error("Cancellation reason is required for audit trail.");

  const visits = getClinicalVisits();
  const reqs = getClinicalRequirements();
  const target = visits.find((v) => v.id === visitId);
  if (!target) throw new Error(`Visit ${visitId} not found.`);

  const nowIso = new Date().toISOString();
  const updatedVisits = visits.map((v) =>
    v.id === visitId
      ? { ...v, visitStatus: "Cancelled" as ClinicalVisitStatus, updatedAt: nowIso }
      : v
  );
  const updatedReqs = reqs.map((r) =>
    r.id === target.requirementId
      ? { ...r, status: "Cancelled" as RequirementStatus, updatedAt: nowIso }
      : r
  );

  if (target.scheduledVisitId) {
    const schedVisits = getVisitsFromStorage();
    saveVisitsToStorage(
      schedVisits.map((sv) =>
        sv.id === target.scheduledVisitId
          ? { ...sv, isRemoved: true, modificationReason: `Cancelled: ${reason}` }
          : sv
      )
    );
  }

  writeJson(CLINICAL_VISIT_STORAGE_KEY, updatedVisits);
  writeJson(CLINICAL_REQ_STORAGE_KEY, updatedReqs);

  appendClinicalAuditEvent({
    entityType: "Visit",
    entityId: target.id,
    relatedClientId: target.clientId,
    relatedClientName: target.clientName,
    relatedVisitId: target.id,
    action: "VISIT_CANCELLED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: target.visitStatus,
    newValue: "Cancelled",
    reason,
  });

  emitClinicalSync();
  return updatedVisits.find((v) => v.id === visitId)!;
}

export function requestMissingDocumentation(
  visitId: string,
  note: string,
  actor: ClinicalActorContext
): void {
  assertClinicalPermission(actor, "REQUEST_DOCUMENTATION");

  const visits = getClinicalVisits();
  const docs = getClinicalDocumentationList();
  const reqs = getClinicalRequirements();
  const target = visits.find((v) => v.id === visitId);
  if (!target) throw new Error(`Visit ${visitId} not found.`);

  const nowIso = new Date().toISOString();
  writeJson(
    CLINICAL_VISIT_STORAGE_KEY,
    visits.map((v) =>
      v.id === visitId
        ? {
          ...v,
          documentationStatus: "Correction Requested" as DocumentationStatus,
          followUpRequired: true,
          updatedAt: nowIso,
        }
        : v
    )
  );
  writeJson(
    CLINICAL_REQ_STORAGE_KEY,
    reqs.map((r) =>
      r.id === target.requirementId
        ? {
          ...r,
          documentationStatus: "Correction Requested" as DocumentationStatus,
          updatedAt: nowIso,
        }
        : r
    )
  );

  const existingDoc = docs.find((d) => d.visitId === visitId);
  if (existingDoc) {
    writeJson(
      CLINICAL_DOC_STORAGE_KEY,
      docs.map((d) =>
        d.visitId === visitId
          ? {
            ...d,
            completenessStatus: "Correction Requested" as DocumentationStatus,
            correctionRequestedNote: note,
          }
          : d
      )
    );
  }

  appendClinicalAuditEvent({
    entityType: "Documentation",
    entityId: visitId,
    relatedClientId: target.clientId,
    relatedClientName: target.clientName,
    relatedVisitId: visitId,
    action: "MISSING_DOCUMENTATION_REQUESTED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: target.documentationStatus,
    newValue: "Correction Requested",
    reason: note,
  });

  emitClinicalSync();
}

export function assignClinicalReviewer(
  visitId: string,
  reviewerId: string,
  actor: ClinicalActorContext
): void {
  assertClinicalPermission(actor, "ASSIGN_CLINICAL_REVIEWER");
  const prof = CLINICAL_PROFESSIONALS.find((p) => p.id === reviewerId);
  if (!prof || !prof.canPerformClinicalSignOff) {
    throw new Error("Only an active RN or Clinical Supervisor with sign-off credentials can be assigned as clinical reviewer.");
  }

  const visits = getClinicalVisits();
  const target = visits.find((v) => v.id === visitId);
  if (!target) throw new Error("Visit not found.");

  const reviews = getClinicalReviews();
  const existing = reviews.find((r) => r.visitId === visitId);
  const prevReviewer = existing?.reviewerName || "Unassigned";

  const nextReviews = existing
    ? reviews.map((r) =>
      r.visitId === visitId
        ? {
          ...r,
          reviewerId: prof.id,
          reviewerName: prof.name,
          reviewerRole: prof.roleTitle,
          reviewStatus:
            r.reviewStatus === "Not Required"
              ? ("Pending Review" as ClinicalReviewStatus)
              : r.reviewStatus,
        }
        : r
    )
    : [
      {
        id: `CREV-${Date.now().toString().slice(-4)}`,
        visitId,
        reviewerId: prof.id,
        reviewerName: prof.name,
        reviewerRole: prof.roleTitle,
        reviewStatus: "Pending Review" as ClinicalReviewStatus,
        reviewedAt: null,
        signOffTimestamp: null,
        comments: "Assigned for clinical review.",
        outstandingIssues: [],
        followUpRequired: false,
      },
      ...reviews,
    ];

  writeJson(CLINICAL_REVIEW_STORAGE_KEY, nextReviews);

  appendClinicalAuditEvent({
    entityType: "Review",
    entityId: visitId,
    relatedClientId: target.clientId,
    relatedClientName: target.clientName,
    relatedVisitId: visitId,
    action: "REVIEWER_ASSIGNED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: prevReviewer,
    newValue: prof.name,
    reason: "Assigned clinical reviewer in Review Queue.",
  });

  emitClinicalSync();
}

/**
 * STRICTLY PROTECTED: Only authorized RN / Clinical Supervisor roles can sign off.
 * Calling this as Agency Admin throws an authorization error.
 */
export function completeClinicalSignOff(
  visitId: string,
  comments: string,
  actor: ClinicalActorContext
): void {
  assertClinicalPermission(actor, "CLINICAL_SIGN_OFF");

  const visits = getClinicalVisits();
  const reqs = getClinicalRequirements();
  const reviews = getClinicalReviews();
  const docs = getClinicalDocumentationList();
  const target = visits.find((v) => v.id === visitId);
  if (!target) throw new Error("Visit not found.");

  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16);
  writeJson(
    CLINICAL_VISIT_STORAGE_KEY,
    visits.map((v) =>
      v.id === visitId
        ? {
          ...v,
          documentationStatus: "Complete" as DocumentationStatus,
          reviewStatus: "Approved" as ClinicalReviewStatus,
          followUpRequired: false,
          updatedAt: new Date().toISOString(),
        }
        : v
    )
  );
  writeJson(
    CLINICAL_DOC_STORAGE_KEY,
    docs.map((d) =>
      d.visitId === visitId
        ? {
          ...d,
          completenessStatus: "Complete" as DocumentationStatus,
          reviewStatus: "Approved" as ClinicalReviewStatus,
        }
        : d
    )
  );
  writeJson(
    CLINICAL_REVIEW_STORAGE_KEY,
    reviews.map((r) =>
      r.visitId === visitId
        ? {
          ...r,
          reviewerName: actor.name,
          reviewerRole: actor.roleLabel,
          reviewStatus: "Approved" as ClinicalReviewStatus,
          reviewedAt: nowStr,
          signOffTimestamp: nowStr,
          comments: comments || "Clinical documentation reviewed and signed off.",
          followUpRequired: false,
        }
        : r
    )
  );

  // Recalculate next due date for recurring requirements
  const targetReq = reqs.find((r) => r.id === target.requirementId);
  if (targetReq) {
    const baseDate = new Date(`${DEMO_TODAY}T12:00:00`);
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + (targetReq.recurrenceIntervalDays || 90));
    const nextIso = nextDate.toISOString().slice(0, 10);

    writeJson(
      CLINICAL_REQ_STORAGE_KEY,
      reqs.map((r) =>
        r.id === targetReq.id
          ? {
            ...r,
            lastCompletedDate: target.completedAt?.slice(0, 10) || DEMO_TODAY,
            nextDueDate: r.isRecurring ? nextIso : r.nextDueDate,
            status: (r.isRecurring ? "Active" : "Completed") as RequirementStatus,
            documentationStatus: "Complete" as DocumentationStatus,
            reviewStatus: "Approved" as ClinicalReviewStatus,
            updatedAt: new Date().toISOString(),
          }
          : r
      )
    );
  }

  appendClinicalAuditEvent({
    entityType: "Review",
    entityId: visitId,
    relatedClientId: target.clientId,
    relatedClientName: target.clientName,
    relatedVisitId: visitId,
    action: "CLINICAL_SIGN_OFF_COMPLETED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: target.reviewStatus,
    newValue: "Approved",
    reason: comments || "Professional clinical sign-off recorded.",
  });

  emitClinicalSync();
}

export function createClinicalFollowUp(
  payload: {
    visitId: string;
    requirementId: string;
    clientId: string;
    clientName: string;
    assignedToId: string;
    assignedToName: string;
    followUpType: ClinicalFollowUp["followUpType"];
    priority: PriorityLevel;
    description: string;
    internalNotes: string;
    dueDate: string;
    escalate?: boolean;
  },
  actor: ClinicalActorContext
): ClinicalFollowUp {
  assertClinicalPermission(
    actor,
    payload.escalate ? "ESCALATE_ISSUE" : "CREATE_FOLLOWUP"
  );

  const followUps = getClinicalFollowUps();
  const visits = getClinicalVisits();
  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16);

  const newFollowUp: ClinicalFollowUp = {
    id: `CFU-2026-${String(followUps.length + 1).padStart(2, "0")}`,
    visitId: payload.visitId,
    requirementId: payload.requirementId,
    clientId: payload.clientId,
    clientName: payload.clientName,
    assignedToId: payload.assignedToId,
    assignedToName: payload.assignedToName,
    followUpType: payload.followUpType,
    priority: payload.priority,
    description: payload.description,
    internalNotes: payload.internalNotes,
    dueDate: payload.dueDate,
    status: payload.escalate ? "Escalated" : "Open",
    createdBy: actor.name,
    createdAt: nowStr,
    completedAt: null,
    completedBy: null,
  };

  writeJson(CLINICAL_FOLLOWUP_STORAGE_KEY, [newFollowUp, ...followUps]);
  writeJson(
    CLINICAL_VISIT_STORAGE_KEY,
    visits.map((v) =>
      v.id === payload.visitId ? { ...v, followUpRequired: true } : v
    )
  );

  appendClinicalAuditEvent({
    entityType: "FollowUp",
    entityId: newFollowUp.id,
    relatedClientId: payload.clientId,
    relatedClientName: payload.clientName,
    relatedVisitId: payload.visitId,
    action: payload.escalate ? "ESCALATION_RAISED" : "FOLLOWUP_CREATED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: "None",
    newValue: `${newFollowUp.status} (${newFollowUp.priority})`,
    reason: payload.description,
  });

  emitClinicalSync();
  return newFollowUp;
}

export function completeClinicalFollowUp(
  followUpId: string,
  actor: ClinicalActorContext
): void {
  assertClinicalPermission(actor, "COMPLETE_FOLLOWUP");
  const followUps = getClinicalFollowUps();
  const target = followUps.find((f) => f.id === followUpId);
  if (!target) return;

  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16);
  const updated = followUps.map((f) =>
    f.id === followUpId
      ? {
        ...f,
        status: "Completed" as const,
        completedAt: nowStr,
        completedBy: actor.name,
      }
      : f
  );
  writeJson(CLINICAL_FOLLOWUP_STORAGE_KEY, updated);

  // Clear visit followUpRequired if no other open follow-ups remain
  const stillOpen = updated.some(
    (f) => f.visitId === target.visitId && f.status !== "Completed"
  );
  if (!stillOpen) {
    const visits = getClinicalVisits();
    writeJson(
      CLINICAL_VISIT_STORAGE_KEY,
      visits.map((v) =>
        v.id === target.visitId ? { ...v, followUpRequired: false } : v
      )
    );
  }

  appendClinicalAuditEvent({
    entityType: "FollowUp",
    entityId: followUpId,
    relatedClientId: target.clientId,
    relatedClientName: target.clientName,
    relatedVisitId: target.visitId,
    action: "FOLLOWUP_COMPLETED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: target.status,
    newValue: "Completed",
    reason: `Operational follow-up resolved by ${actor.name}.`,
  });

  emitClinicalSync();
}

export function sendMockClinicalReminder(
  visitId: string,
  message: string,
  actor: ClinicalActorContext
): ClinicalMockNotification {
  assertClinicalPermission(actor, "SEND_MOCK_REMINDER");
  const visits = getClinicalVisits();
  const target = visits.find((v) => v.id === visitId);
  if (!target) throw new Error("Visit not found.");

  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16);
  const notif: ClinicalMockNotification = {
    id: `MNOTIF-${Date.now().toString().slice(-5)}`,
    visitId: target.id,
    requirementId: target.requirementId,
    clientName: target.clientName,
    recipientName: target.professionalName || "Unassigned Clinical Pool",
    recipientRole: target.professionalQualification,
    channel: "Simulated Reminder Log",
    message,
    sentBy: actor.name,
    sentAt: nowStr,
  };

  const existing = getMockNotifications();
  writeJson(CLINICAL_NOTIF_STORAGE_KEY, [notif, ...existing]);
  writeJson(
    CLINICAL_VISIT_STORAGE_KEY,
    visits.map((v) => (v.id === visitId ? { ...v, lastReminderAt: nowStr } : v))
  );

  appendClinicalAuditEvent({
    entityType: "Notification",
    entityId: target.id,
    relatedClientId: target.clientId,
    relatedClientName: target.clientName,
    relatedVisitId: target.id,
    action: "MOCK_REMINDER_LOGGED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: target.lastReminderAt || "None",
    newValue: nowStr,
    reason: `[Simulated Mock Alert — no live email/SMS sent] ${message}`,
  });

  emitClinicalSync();
  return notif;
}

export function saveClinicalRule(
  ruleInput: Omit<ClinicalRule, "id" | "version" | "updatedBy" | "updatedAt" | "versionHistory"> & {
    id?: string;
    changeSummary?: string;
  },
  actor: ClinicalActorContext
): ClinicalRule {
  assertClinicalPermission(actor, "MANAGE_RULES");

  const rules = getClinicalRules();
  const existing = ruleInput.id ? rules.find((r) => r.id === ruleInput.id) : undefined;
  const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16);

  if (existing) {
    const [maj, min] = existing.version.split(".").map(Number);
    const nextVersion = `${maj || 1}.${(min || 0) + 1}`;
    const snapshot = {
      version: nextVersion,
      updatedAt: nowStr,
      updatedBy: actor.name,
      changeSummary:
        ruleInput.changeSummary ||
        `Updated rule configuration (effective ${ruleInput.effectiveDate}). Existing records retain prior version.`,
      effectiveDate: ruleInput.effectiveDate,
      professionalType: ruleInput.professionalType,
      recurrenceType: ruleInput.recurrenceType,
      recurrenceIntervalDays: ruleInput.recurrenceIntervalDays,
      deliveryMethod: ruleInput.deliveryMethod,
      status: ruleInput.status,
    };

    const updatedRule: ClinicalRule = {
      ...existing,
      ...ruleInput,
      id: existing.id,
      version: nextVersion,
      updatedBy: actor.name,
      updatedAt: nowStr,
      versionHistory: [snapshot, ...existing.versionHistory],
    };

    writeJson(
      CLINICAL_RULE_STORAGE_KEY,
      rules.map((r) => (r.id === existing.id ? updatedRule : r))
    );

    appendClinicalAuditEvent({
      entityType: "Rule",
      entityId: existing.id,
      relatedClientId: "SYSTEM",
      relatedClientName: "Agency Rules Engine",
      relatedVisitId: null,
      action: "RULE_UPDATED",
      performedBy: actor.name,
      performedByRole: actor.roleLabel,
      previousValue: `v${existing.version} (${existing.status})`,
      newValue: `v${nextVersion} (${updatedRule.status})`,
      reason: snapshot.changeSummary,
    });

    emitClinicalSync();
    return updatedRule;
  }

  const newId = `CRULE-${String(rules.length + 1).padStart(2, "0")}`;
  const createdRule: ClinicalRule = {
    ...ruleInput,
    id: newId,
    version: "1.0",
    updatedBy: actor.name,
    updatedAt: nowStr,
    versionHistory: [
      {
        version: "1.0",
        updatedAt: nowStr,
        updatedBy: actor.name,
        changeSummary: ruleInput.changeSummary || "Created new configurable clinical/supervisory rule.",
        effectiveDate: ruleInput.effectiveDate,
        professionalType: ruleInput.professionalType,
        recurrenceType: ruleInput.recurrenceType,
        recurrenceIntervalDays: ruleInput.recurrenceIntervalDays,
        deliveryMethod: ruleInput.deliveryMethod,
        status: ruleInput.status,
      },
    ],
  };

  writeJson(CLINICAL_RULE_STORAGE_KEY, [createdRule, ...rules]);

  appendClinicalAuditEvent({
    entityType: "Rule",
    entityId: newId,
    relatedClientId: "SYSTEM",
    relatedClientName: "Agency Rules Engine",
    relatedVisitId: null,
    action: "RULE_CREATED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: "None",
    newValue: `${createdRule.ruleName} (v1.0)`,
    reason: createdRule.internalNotes || "New service-based clinical rule added.",
  });

  emitClinicalSync();
  return createdRule;
}

export function toggleClinicalRuleStatus(
  ruleId: string,
  actor: ClinicalActorContext
): ClinicalRule {
  assertClinicalPermission(actor, "MANAGE_RULES");
  const rules = getClinicalRules();
  const target = rules.find((r) => r.id === ruleId);
  if (!target) throw new Error("Rule not found.");

  const nextStatus: ClinicalRule["status"] =
    target.status === "Active" ? "Inactive" : "Active";
  return saveClinicalRule(
    {
      ...target,
      status: nextStatus,
      changeSummary: `Rule ${nextStatus === "Active" ? "activated" : "deactivated"} by ${actor.name}.`,
    },
    actor
  );
}

export function duplicateClinicalRule(
  ruleId: string,
  actor: ClinicalActorContext
): ClinicalRule {
  assertClinicalPermission(actor, "MANAGE_RULES");
  const rules = getClinicalRules();
  const target = rules.find((r) => r.id === ruleId);
  if (!target) throw new Error("Rule not found.");

  return saveClinicalRule(
    {
      ...target,
      id: undefined,
      ruleName: `${target.ruleName} (Copy)`,
      status: "Draft",
      confirmationStatus: "Pending LiliSare Confirmation",
      changeSummary: `Duplicated from ${target.id} (v${target.version}).`,
    },
    actor
  );
}

export function editClinicalRequirement(
  reqId: string,
  patch: Partial<
    Pick<
      ClinicalRequirement,
      | "requirementName"
      | "nextDueDate"
      | "frequency"
      | "deliveryMethod"
      | "priority"
      | "internalNotes"
      | "status"
      | "internalOwnerId"
      | "internalOwnerName"
    >
  >,
  actor: ClinicalActorContext
): ClinicalRequirement {
  assertClinicalPermission(actor, "EDIT_REQUIREMENT");
  const reqs = getClinicalRequirements();
  const visits = getClinicalVisits();
  const target = reqs.find((r) => r.id === reqId);
  if (!target) throw new Error("Requirement not found.");

  const nowIso = new Date().toISOString();
  const updatedReq: ClinicalRequirement = {
    ...target,
    ...patch,
    updatedAt: nowIso,
  };
  writeJson(
    CLINICAL_REQ_STORAGE_KEY,
    reqs.map((r) => (r.id === reqId ? updatedReq : r))
  );

  // Sync key fields to active visit
  writeJson(
    CLINICAL_VISIT_STORAGE_KEY,
    visits.map((v) =>
      v.requirementId === reqId
        ? {
          ...v,
          dueDate: patch.nextDueDate || v.dueDate,
          deliveryMethod: patch.deliveryMethod || v.deliveryMethod,
          priority: patch.priority || v.priority,
          updatedAt: nowIso,
        }
        : v
    )
  );

  appendClinicalAuditEvent({
    entityType: "Requirement",
    entityId: reqId,
    relatedClientId: target.clientId,
    relatedClientName: target.clientName,
    relatedVisitId: target.activeVisitId,
    action: "REQUIREMENT_EDITED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: `${target.status} · Due ${target.nextDueDate}`,
    newValue: `${updatedReq.status} · Due ${updatedReq.nextDueDate}`,
    reason: patch.internalNotes || "Requirement details updated by Agency Admin.",
  });

  emitClinicalSync();
  return updatedReq;
}

export function cancelClinicalRequirement(
  reqId: string,
  reason: string,
  actor: ClinicalActorContext
): void {
  assertClinicalPermission(actor, "CANCEL_REQUIREMENT");
  const reqs = getClinicalRequirements();
  const visits = getClinicalVisits();
  const target = reqs.find((r) => r.id === reqId);
  if (!target) return;

  const nowIso = new Date().toISOString();
  writeJson(
    CLINICAL_REQ_STORAGE_KEY,
    reqs.map((r) =>
      r.id === reqId ? { ...r, status: "Cancelled", updatedAt: nowIso } : r
    )
  );
  writeJson(
    CLINICAL_VISIT_STORAGE_KEY,
    visits.map((v) =>
      v.requirementId === reqId && v.visitStatus !== "Completed"
        ? { ...v, visitStatus: "Cancelled", updatedAt: nowIso }
        : v
    )
  );

  appendClinicalAuditEvent({
    entityType: "Requirement",
    entityId: reqId,
    relatedClientId: target.clientId,
    relatedClientName: target.clientName,
    relatedVisitId: target.activeVisitId,
    action: "REQUIREMENT_CANCELLED",
    performedBy: actor.name,
    performedByRole: actor.roleLabel,
    previousValue: target.status,
    newValue: "Cancelled",
    reason,
  });

  emitClinicalSync();
}

export function exportClinicalCsv(rows: Record<string, string | number | null | undefined>[], filename: string): void {
  if (typeof window === "undefined" || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
