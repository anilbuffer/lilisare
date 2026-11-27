import {
  CaregiverRecord,
  CaregiverAttentionItem,
  CaregiverAuditItem,
} from "@/types/caregiver";

// Legacy type aliases for backward compatibility with old component files
export type CaregiverStatus = "Active" | "Onboarding" | "Inactive" | "On Leave" | "Leave of Absence" | "Terminated";
export type EmploymentType = "W2" | "1099";

export interface Certification {
  id: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired";
  issuer: string;
}

export interface Shift {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "Completed" | "Upcoming" | "Missed";
}

export interface CaregiverPolicyAck {
  id: string;
  policyName: string;
  category: string;
  version: string;
  status: "Signed" | "Pending" | "Overdue";
  signedDate?: string;
  dueDate?: string;
}

export interface Caregiver {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  status: CaregiverStatus;
  rating: number;
  yearsWithAgency: number;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  languages: string[];
  skills: string[];
  hireDate: string;
  employmentType: EmploymentType;
  payRate: number;
  complianceScore: number;
  assignedPatientsCount: number;
  lastActiveDate: string;
  certifications: Certification[];
  recentShifts: Shift[];
  policyAcknowledgments?: CaregiverPolicyAck[];
}

export interface ConvertableApplication {
  id: string; // e.g. "APP-209"
  applicantName: string;
  appliedDate: string;
  caregiverType: "Family Caregiver" | "Live-In Caregiver" | "Family Friend";
  relationshipToClient: string;
  intendedClientName: string;
  intendedClientId: string;
  householdName: string;
  householdId: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  currentPipelineStage: "Application Received" | "Background Screening" | "Interview Cleared" | "Training In Progress";
  documentsReady: string[];
  notes: string;
}

export const CONVERTABLE_APPLICATIONS: ConvertableApplication[] = [
  {
    id: "APP-301",
    applicantName: "Brianna Jenkins",
    appliedDate: "2026-11-12",
    caregiverType: "Family Caregiver",
    relationshipToClient: "Sister & Secondary Guardian",
    intendedClientName: "Leo Miller",
    intendedClientId: "CL-1001",
    householdName: "Miller Household",
    householdId: "hh-1001",
    phone: "(541) 555-0812",
    email: "brianna.jenkins@example.com",
    city: "Springfield",
    state: "OR",
    currentPipelineStage: "Background Screening",
    documentsReady: ["State Driver's License", "SSN Verification", "CPR Card"],
    notes: "Applying to serve as relief respite family caregiver for Leo Miller. Live-scan fingerprints submitted.",
  },
  {
    id: "APP-302",
    applicantName: "Carlos Mendoza",
    appliedDate: "2026-11-08",
    caregiverType: "Live-In Caregiver",
    relationshipToClient: "Dedicated Live-In Attendant",
    intendedClientName: "Marcus Whitfield",
    intendedClientId: "CL-1002",
    householdName: "Whitfield Household",
    householdId: "hh-1002",
    phone: "(503) 555-4819",
    email: "carlos.mendoza@example.com",
    city: "Portland",
    state: "OR",
    currentPipelineStage: "Training In Progress",
    documentsReady: ["Passport", "CPR/First Aid BLS", "TB 2-Step Test", "Driving Record"],
    notes: "Experienced CNA moving to full-time live-in role. Completed 12 of 16 training hours.",
  },
  {
    id: "APP-303",
    applicantName: "Denise Fletcher",
    appliedDate: "2026-11-15",
    caregiverType: "Family Friend",
    relationshipToClient: "Close Family Friend / Community Aide",
    intendedClientName: "Hannah Morales",
    intendedClientId: "CL-1005",
    householdName: "Morales Household",
    householdId: "hh-1005",
    phone: "(541) 555-9022",
    email: "denise.fletcher@example.com",
    city: "Eugene",
    state: "OR",
    currentPipelineStage: "Interview Cleared",
    documentsReady: ["State ID", "Direct Deposit Form", "Background Authorization"],
    notes: "Family endorsed friend providing sensory and after-school transport care.",
  },
];

export const CAREGIVER_ATTENTION_ITEMS: CaregiverAttentionItem[] = [
  {
    id: "att-cg-1",
    title: "Expired credentials",
    description: "4 caregivers need credential renewal",
    category: "expired_credentials",
    severity: "overdue",
    affectedCount: 4,
    actionUrl: "/caregivers?filter=expired_credentials",
    actionLabel: "Renew Credentials",
  },
  {
    id: "att-cg-2",
    title: "Screening pending",
    description: "3 background checks need review",
    category: "screening_pending",
    severity: "pending",
    affectedCount: 3,
    actionUrl: "/caregivers?filter=screening_pending",
    actionLabel: "Review Backgrounds",
  },
  {
    id: "att-cg-3",
    title: "Training incomplete",
    description: "2 caregivers have outstanding training",
    category: "training_incomplete",
    severity: "action_required",
    affectedCount: 2,
    actionUrl: "/caregivers?filter=training_incomplete",
    actionLabel: "Assign Modules",
  },
  {
    id: "att-cg-4",
    title: "Missing documents",
    description: "3 caregiver profiles are incomplete",
    category: "missing_documents",
    severity: "incomplete",
    affectedCount: 3,
    actionUrl: "/caregivers?filter=missing_documents",
    actionLabel: "Request Files",
  },
];

export const CAREGIVER_RECENT_ACTIVITIES: CaregiverAuditItem[] = [
  {
    id: "act-1",
    timestamp: "2026-11-19T16:00:00Z",
    relativeTime: "10 minutes ago",
    title: "Caregiver approved",
    description: "CG-102 · Background screening cleared",
    actor: "Dana Jenkins, MSW (Intake Officer)",
    type: "approval",
  },
  {
    id: "act-2",
    timestamp: "2026-11-19T15:35:00Z",
    relativeTime: "35 minutes ago",
    title: "Document uploaded",
    description: "CG-103 · CPR certification submitted",
    actor: "Marcus Chen (Caregiver Mobile)",
    type: "document",
  },
  {
    id: "act-3",
    timestamp: "2026-11-19T15:10:00Z",
    relativeTime: "1 hour ago",
    title: "Client assignment updated",
    description: "CG-104 · Assignment changed",
    actor: "Evelyn Vance, RN (Clinical Supervisor)",
    type: "assignment",
  },
  {
    id: "act-4",
    timestamp: "2026-11-19T14:10:00Z",
    relativeTime: "2 hours ago",
    title: "Training completed",
    description: "CG-105 · Required training completed",
    actor: "Training Automation System",
    type: "training",
  },
  {
    id: "act-5",
    timestamp: "2026-11-19T12:00:00Z",
    relativeTime: "4 hours ago",
    title: "EVV Geo-Fence verified",
    description: "CG-102 · Shift at Miller Household verified",
    actor: "Sandata EVV Engine",
    type: "evv",
  },
  {
    id: "act-6",
    timestamp: "2026-11-18T10:00:00Z",
    relativeTime: "Yesterday",
    title: "Annual performance review approved",
    description: "CG-106 · Care coordinator evaluation completed",
    actor: "Elena Vance, RN (Clinical Supervisor)",
    type: "approval",
  },
];

export const INITIAL_CAREGIVERS: CaregiverRecord[] = [
  {
    id: "CG-102",
    name: "Sarah Miller",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    type: "Family Caregiver",
    status: "Active",
    pipelineStage: "Hired & Onboarding",
    branch: "Mountain Lane",
    hireDate: "2024-03-15",
    employmentClassification: "W-2",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Cleared",
      cprFirstAid: "Verified",
      training: "Complete",
    },
    personalInfo: {
      preferredName: "Sarah",
      dob: "1988-08-22",
      gender: "Female",
      languages: ["English"],
      phone: "(541) 555-0199",
      secondaryPhone: "(541) 555-0211",
      email: "sarah.miller@example.com",
      address: {
        street: "742 Evergreen Terrace",
        city: "Springfield",
        state: "OR",
        zip: "97477",
      },
      emergencyContact: {
        name: "David Miller",
        relationship: "Spouse",
        phone: "(541) 555-0211",
      },
      preferredCommunication: "Phone",
      maskedIdentifiers: {
        ssnMasked: "***-**-4819",
        driversLicenseMasked: "DL-***-9284",
        taxIdMasked: "TIN-***-1149",
      },
    },
    relationship: {
      caregiverType: "Family Caregiver",
      relationshipToClient: "Mother & Primary Legal Guardian",
      linkedHousehold: {
        id: "hh-1001",
        code: "HH-1001",
        name: "Miller Household",
        address: "742 Evergreen Terrace, Springfield, OR 97477",
        phone: "(541) 555-0199",
        city: "Springfield",
        state: "OR",
      },
      relationshipVerificationStatus: "Verified",
      relationshipVerifiedDate: "2024-03-18",
      householdPermissions: [
        "Medical Decisions",
        "Sign Consents",
        "View Care Notes",
        "Manage EVV Shifts",
      ],
      caregivingBoundaries: "Sole authorized family caregiver for Leo Miller. Approved for authorized Medicaid EPSDT personal care hours.",
    },
    documentsCredentials: {
      overallStatus: "Verified",
      cprExpiryDate: "2027-04-15",
      tbTestExpiryDate: "2027-02-10",
      driversLicenseExpiry: "2028-09-30",
      items: [
        {
          id: "cred-1",
          name: "State Driver's License",
          category: "Identity",
          issuer: "Oregon DMV",
          issueDate: "2022-09-30",
          expiryDate: "2028-09-30",
          status: "Verified",
          documentUrl: "/docs/dl_miller.pdf",
          fileSize: "1.2 MB",
          verifiedBy: "Dana Jenkins, MSW",
          verifiedAt: "2024-03-16",
        },
        {
          id: "cred-2",
          name: "CPR & Pediatric First Aid BLS",
          category: "Certification",
          issuer: "American Heart Association",
          issueDate: "2025-04-15",
          expiryDate: "2027-04-15",
          status: "Verified",
          documentUrl: "/docs/cpr_miller.pdf",
          fileSize: "840 KB",
          verifiedBy: "Evelyn Vance, RN",
          verifiedAt: "2025-04-18",
        },
        {
          id: "cred-3",
          name: "TB Risk Assessment & Symptom Screen",
          category: "Medical / Health",
          issuer: "Springfield Community Health",
          issueDate: "2026-02-10",
          expiryDate: "2027-02-10",
          status: "Verified",
          documentUrl: "/docs/tb_miller.pdf",
          fileSize: "620 KB",
          verifiedBy: "Evelyn Vance, RN",
          verifiedAt: "2026-02-12",
        },
        {
          id: "cred-4",
          name: "Form I-9 & W-4 Withholding",
          category: "Compliance",
          issuer: "LiliSare Payroll & HR",
          issueDate: "2024-03-15",
          status: "Verified",
          fileSize: "950 KB",
          verifiedBy: "HR Compliance Officer",
          verifiedAt: "2024-03-16",
        },
      ],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Cleared",
        clearedDate: "2024-03-20",
        referenceNumber: "BKG-2024-91823",
        provider: "Oregon DHS Background Check Unit (BCU)",
        renewalDate: "2027-03-20",
      },
      screenings: [
        { name: "OIG / SAM Exclusion List", status: "Cleared", lastCheckedDate: "2026-11-01" },
        { name: "State Child Abuse Registry (CAN)", status: "Cleared", lastCheckedDate: "2024-03-19" },
        { name: "National Sex Offender Registry (NSOPW)", status: "Cleared", lastCheckedDate: "2026-11-01" },
      ],
      trainingCourses: [
        {
          id: "tr-1",
          title: "Mandatory Child Abuse Reporting & Safeguarding",
          category: "State Compliance",
          hours: 2,
          status: "Complete",
          completedDate: "2024-03-22",
          score: 100,
          requiredForActivation: true,
          certificateId: "CERT-OR-9081",
        },
        {
          id: "tr-2",
          title: "HIPAA & Patient Privacy Fundamentals",
          category: "Healthcare Regulations",
          hours: 2,
          status: "Complete",
          completedDate: "2024-03-22",
          score: 96,
          requiredForActivation: true,
          certificateId: "CERT-HIPAA-221",
        },
        {
          id: "tr-3",
          title: "Person-Centered Pediatric In-Home Care",
          category: "Clinical Care",
          hours: 4,
          status: "Complete",
          completedDate: "2024-03-24",
          score: 98,
          requiredForActivation: true,
          certificateId: "CERT-PC-441",
        },
        {
          id: "tr-4",
          title: "EVV Mobile Clock-In & Location Protocol",
          category: "Operations",
          hours: 1,
          status: "Complete",
          completedDate: "2024-03-25",
          score: 100,
          requiredForActivation: true,
        },
      ],
      overallTrainingStatus: "Complete",
      trainingHoursCompleted: 9,
      trainingHoursRequired: 9,
      screeningReviewDecisions: [
        {
          id: "dec-1",
          reviewerName: "Dana Jenkins, MSW",
          reviewerRole: "Intake & Eligibility Specialist",
          date: "2024-03-25",
          decision: "Approved",
          notes: "Family caregiver enrollment verified. BCU cleared without restrictions. Authorized for 40 hrs/wk under Medicaid EPSDT.",
        },
      ],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1001",
        name: "Leo Miller",
        avatarUrl: "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&q=80&w=200",
        householdId: "hh-1001",
        householdName: "Miller Household",
        relationship: "Son (Pediatric Patient)",
        weeklyAuthorizedHours: 40,
        scheduledWeeklyHours: 40,
        startDate: "2024-04-01",
        status: "Active",
      },
      backupCaregiver: {
        id: "CG-204",
        name: "Clara Jenkins",
        phone: "(541) 555-0245",
        relationship: "Grandmother (Approved Backup)",
      },
      weeklyCapacityHours: 40,
      scheduledWeeklyHours: 40,
      availabilitySchedule: [
        { day: "Monday", available: true, timeSlots: "8:00 AM – 4:00 PM (8h)" },
        { day: "Tuesday", available: true, timeSlots: "8:00 AM – 4:00 PM (8h)" },
        { day: "Wednesday", available: true, timeSlots: "8:00 AM – 4:00 PM (8h)" },
        { day: "Thursday", available: true, timeSlots: "8:00 AM – 4:00 PM (8h)" },
        { day: "Friday", available: true, timeSlots: "8:00 AM – 4:00 PM (8h)" },
        { day: "Saturday", available: false, timeSlots: "Off duty" },
        { day: "Sunday", available: false, timeSlots: "Off duty" },
      ],
      assignmentHistory: [
        {
          id: "ash-1",
          clientId: "CL-1001",
          clientName: "Leo Miller",
          period: "Apr 2024 – Present",
          role: "Primary Paid Family Caregiver",
        },
      ],
    },
    evvVisitHistory: {
      overallComplianceRate: 99.1,
      totalVisitsCompleted: 486,
      gpsVerificationRate: 99.4,
      missedClockOutCount: 0,
      isRestrictedEVV: true,
      recentVisits: [
        {
          id: "vst-1",
          clientId: "CL-1001",
          clientName: "Leo Miller",
          date: "2026-11-19",
          clockIn: "08:00 AM",
          clockOut: "04:00 PM",
          durationMinutes: 480,
          gpsStatus: "Verified Geo-Fence",
          gpsCoordinates: "44.0462° N, 123.0220° W (Match: 12m)",
          serviceType: "T1019 Personal Care (EPSDT)",
          hasCareNotes: true,
          supervisorApproved: true,
        },
        {
          id: "vst-2",
          clientId: "CL-1001",
          clientName: "Leo Miller",
          date: "2026-11-18",
          clockIn: "08:02 AM",
          clockOut: "04:01 PM",
          durationMinutes: 479,
          gpsStatus: "Verified Geo-Fence",
          serviceType: "T1019 Personal Care (EPSDT)",
          hasCareNotes: true,
          supervisorApproved: true,
        },
        {
          id: "vst-3",
          clientId: "CL-1001",
          clientName: "Leo Miller",
          date: "2026-11-17",
          clockIn: "07:58 AM",
          clockOut: "04:00 PM",
          durationMinutes: 482,
          gpsStatus: "Verified Geo-Fence",
          serviceType: "T1019 Personal Care (EPSDT)",
          hasCareNotes: true,
          supervisorApproved: true,
        },
      ],
    },
    activityHistory: {
      recentUpdates: [
        {
          id: "act-101",
          timestamp: "2026-11-19T16:00:00Z",
          relativeTime: "10 minutes ago",
          title: "Caregiver approved",
          description: "Background screening cleared & credential re-verified",
          actor: "Dana Jenkins, MSW",
          type: "approval",
        },
        {
          id: "act-102",
          timestamp: "2026-11-10T11:20:00Z",
          relativeTime: "9 days ago",
          title: "EVV Shift Logged",
          description: "Clock-in verified at 742 Evergreen Terrace (08:00 AM)",
          actor: "Sandata Mobile App",
          type: "evv",
        },
        {
          id: "act-103",
          timestamp: "2026-10-15T09:00:00Z",
          relativeTime: "1 month ago",
          title: "Annual Training Recertification",
          description: "Completed Child Safeguarding Refresh Course (100% Score)",
          actor: "LiliSare Academy",
          type: "training",
        },
      ],
    },
  },
  {
    id: "CG-103",
    name: "Marcus Chen",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    type: "Live-In Caregiver",
    status: "Active",
    pipelineStage: "Hired & Onboarding",
    branch: "Valley View",
    hireDate: "2023-11-10",
    employmentClassification: "W-2",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Cleared",
      cprFirstAid: "Verified",
      training: "Complete",
    },
    personalInfo: {
      preferredName: "Marcus",
      dob: "1984-12-05",
      gender: "Male",
      languages: ["English", "Mandarin"],
      phone: "(541) 555-8812",
      email: "marcus.chen@example.com",
      address: {
        street: "112 Orchard View Rd",
        city: "Eugene",
        state: "OR",
        zip: "97401",
      },
      emergencyContact: {
        name: "Lillian Chen",
        relationship: "Sister",
        phone: "(541) 555-8899",
      },
      preferredCommunication: "SMS",
      maskedIdentifiers: {
        ssnMasked: "***-**-6312",
        driversLicenseMasked: "DL-***-4019",
        taxIdMasked: "TIN-***-9021",
      },
    },
    relationship: {
      caregiverType: "Live-In Caregiver",
      relationshipToClient: "Dedicated Live-In Attendant",
      linkedHousehold: {
        id: "hh-1006",
        code: "HH-1006",
        name: "Chen Household",
        address: "112 Orchard View Rd, Eugene, OR 97401",
        phone: "(541) 555-8812",
        city: "Eugene",
        state: "OR",
      },
      relationshipVerificationStatus: "Verified",
      householdPermissions: ["Daily Living Support", "ADL Assistance", "Emergency Response"],
      caregivingBoundaries: "Full live-in arrangement with overnight standby sleep periods in separate room.",
    },
    documentsCredentials: {
      overallStatus: "Verified",
      cprExpiryDate: "2027-11-10",
      tbTestExpiryDate: "2027-01-15",
      items: [
        {
          id: "cred-chen-1",
          name: "CPR / First Aid Recertification",
          category: "Certification",
          issuer: "American Red Cross",
          issueDate: "2026-11-19",
          expiryDate: "2028-11-19",
          status: "Verified",
          verifiedBy: "Evelyn Vance, RN",
          verifiedAt: "2026-11-19",
        },
        {
          id: "cred-chen-2",
          name: "Annual TB Screening (Negative)",
          category: "Medical / Health",
          issuer: "Valley Health",
          issueDate: "2026-01-15",
          expiryDate: "2027-01-15",
          status: "Verified",
        },
      ],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Cleared",
        referenceNumber: "BKG-2023-88210",
        provider: "Oregon DHS BCU",
        renewalDate: "2026-12-15",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-01" },
        { name: "State Abuse Registry", status: "Cleared", lastCheckedDate: "2026-11-01" },
      ],
      trainingCourses: [
        {
          id: "tr-chen-1",
          title: "Live-In Care Regulations & Hours Rest Protocol",
          category: "Compliance",
          hours: 3,
          status: "Complete",
          requiredForActivation: true,
        },
      ],
      overallTrainingStatus: "Complete",
      trainingHoursCompleted: 14,
      trainingHoursRequired: 14,
      screeningReviewDecisions: [
        {
          id: "dec-chen-1",
          reviewerName: "Evelyn Vance, RN",
          reviewerRole: "Clinical Supervisor",
          date: "2023-11-12",
          decision: "Approved",
          notes: "Live-in agreement signed and on file.",
        },
      ],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1007",
        name: "Henry Chen",
        householdId: "hh-1006",
        householdName: "Chen Household",
        relationship: "Father",
        weeklyAuthorizedHours: 44,
        scheduledWeeklyHours: 44,
        startDate: "2023-12-01",
        status: "Active",
      },
      weeklyCapacityHours: 44,
      scheduledWeeklyHours: 44,
      availabilitySchedule: [
        { day: "Monday", available: true, timeSlots: "Live-In Service" },
        { day: "Tuesday", available: true, timeSlots: "Live-In Service" },
        { day: "Wednesday", available: true, timeSlots: "Live-In Service" },
        { day: "Thursday", available: true, timeSlots: "Live-In Service" },
        { day: "Friday", available: true, timeSlots: "Live-In Service" },
        { day: "Saturday", available: false, timeSlots: "Relief Caregiver Scheduled" },
        { day: "Sunday", available: false, timeSlots: "Relief Caregiver Scheduled" },
      ],
      assignmentHistory: [
        {
          id: "ash-chen-1",
          clientId: "CL-1007",
          clientName: "Henry Chen",
          period: "Dec 2023 – Present",
          role: "Dedicated Live-In Aide",
        },
      ],
    },
    evvVisitHistory: {
      overallComplianceRate: 98.8,
      totalVisitsCompleted: 312,
      gpsVerificationRate: 99.0,
      missedClockOutCount: 1,
      isRestrictedEVV: true,
      recentVisits: [
        {
          id: "vst-chen-1",
          clientId: "CL-1007",
          clientName: "Henry Chen",
          date: "2026-11-19",
          clockIn: "07:00 AM",
          clockOut: "09:00 PM",
          durationMinutes: 840,
          gpsStatus: "Verified Geo-Fence",
          serviceType: "Live-In Attendant Care",
          hasCareNotes: true,
          supervisorApproved: true,
        },
      ],
    },
    activityHistory: {
      recentUpdates: [
        {
          id: "act-chen-1",
          timestamp: "2026-11-19T15:35:00Z",
          relativeTime: "35 minutes ago",
          title: "Document uploaded",
          description: "CG-103 · CPR certification submitted",
          actor: "Marcus Chen",
          type: "document",
        },
      ],
    },
  },
  {
    id: "CG-104",
    name: "Elena Vance",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    type: "Family Friend",
    status: "Onboarding",
    pipelineStage: "Training",
    branch: "Mountain Lane",
    hireDate: "2026-11-01",
    employmentClassification: "1099",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "In Review",
      cprFirstAid: "Verified",
      training: "In Progress",
    },
    personalInfo: {
      preferredName: "Elena",
      dob: "1994-06-18",
      gender: "Female",
      languages: ["English", "Spanish"],
      phone: "(541) 555-3341",
      email: "elena.vance@example.com",
      address: {
        street: "480 Cedar Crest Way",
        city: "Springfield",
        state: "OR",
        zip: "97477",
      },
      emergencyContact: {
        name: "Robert Vance",
        relationship: "Brother",
        phone: "(541) 555-3390",
      },
      preferredCommunication: "SMS",
      maskedIdentifiers: {
        ssnMasked: "***-**-9912",
        driversLicenseMasked: "DL-***-1102",
        taxIdMasked: "TIN-***-4091",
      },
    },
    relationship: {
      caregiverType: "Family Friend",
      relationshipToClient: "Long-Time Family Friend & Respite Provider",
      linkedHousehold: {
        id: "hh-1003",
        code: "HH-1003",
        name: "Lin Household",
        address: "312 Willow Creek Rd, Springfield, OR 97477",
        phone: "(541) 555-3301",
        city: "Springfield",
        state: "OR",
      },
      relationshipVerificationStatus: "Pending Review",
      householdPermissions: ["Respite Care", "After-School Mobility Assistance"],
      caregivingBoundaries: "Respite care support up to 15 hours per week.",
    },
    documentsCredentials: {
      overallStatus: "Verified",
      cprExpiryDate: "2027-10-01",
      tbTestExpiryDate: "2027-04-12",
      items: [
        {
          id: "cred-vance-1",
          name: "CPR & First Aid Adult/Pediatric",
          category: "Certification",
          issuer: "AHA",
          issueDate: "2025-10-01",
          expiryDate: "2027-10-01",
          status: "Verified",
        },
      ],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "In Review",
        referenceNumber: "BKG-2026-10492",
        provider: "Oregon DHS BCU",
        renewalDate: "2027-11-01",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-02" },
        { name: "State Abuse Registry", status: "Pending", lastCheckedDate: "2026-11-02" },
      ],
      trainingCourses: [
        {
          id: "tr-vance-1",
          title: "HIPAA & Patient Privacy",
          category: "Healthcare Regulations",
          hours: 2,
          status: "Complete",
          requiredForActivation: true,
        },
        {
          id: "tr-vance-2",
          title: "Person-Centered Care & Cultural Competency",
          category: "Clinical Care",
          hours: 4,
          status: "In Progress",
          requiredForActivation: true,
        },
      ],
      overallTrainingStatus: "In Progress",
      trainingHoursCompleted: 2,
      trainingHoursRequired: 6,
      screeningReviewDecisions: [],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1003",
        name: "Maya Lin",
        householdId: "hh-1003",
        householdName: "Lin Household",
        relationship: "Family Friend",
        weeklyAuthorizedHours: 15,
        scheduledWeeklyHours: 0,
        startDate: "2026-12-01",
        status: "Pending Setup",
      },
      weeklyCapacityHours: 20,
      scheduledWeeklyHours: 0,
      availabilitySchedule: [
        { day: "Monday", available: true, timeSlots: "3:00 PM – 7:00 PM (4h)" },
        { day: "Wednesday", available: true, timeSlots: "3:00 PM – 7:00 PM (4h)" },
        { day: "Friday", available: true, timeSlots: "3:00 PM – 7:00 PM (4h)" },
        { day: "Saturday", available: true, timeSlots: "10:00 AM – 2:00 PM (4h)" },
      ],
      assignmentHistory: [],
    },
    evvVisitHistory: {
      overallComplianceRate: 100,
      totalVisitsCompleted: 0,
      gpsVerificationRate: 100,
      missedClockOutCount: 0,
      isRestrictedEVV: true,
      recentVisits: [],
    },
    activityHistory: {
      recentUpdates: [
        {
          id: "act-vance-1",
          timestamp: "2026-11-19T15:10:00Z",
          relativeTime: "1 hour ago",
          title: "Client assignment updated",
          description: "CG-104 · Assignment changed to Maya Lin (Pending Activation)",
          actor: "Evelyn Vance, RN",
          type: "assignment",
        },
      ],
    },
    attentionFlags: [
      {
        id: "flg-vance-1",
        title: "Training incomplete",
        severity: "action_required",
        category: "training_incomplete",
        message: "2 of 6 training hours remaining before activation.",
      },
      {
        id: "flg-vance-2",
        title: "Screening pending",
        severity: "pending",
        category: "screening_pending",
        message: "State Abuse Registry check pending return from DHS.",
      },
    ],
  },
  {
    id: "CG-105",
    name: "Devontae Washington",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    type: "Live-In Caregiver",
    status: "Pending",
    pipelineStage: "Phone Screened",
    branch: "North Metro",
    hireDate: "2026-11-14",
    employmentClassification: "W-2",
    assignmentStatus: "Unassigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Pending",
      cprFirstAid: "Verified",
      training: "Complete",
    },
    personalInfo: {
      preferredName: "Devon",
      dob: "1991-03-14",
      gender: "Male",
      languages: ["English"],
      phone: "(503) 555-7182",
      email: "devontae.w@example.com",
      address: {
        street: "820 NE Martin Luther King Jr Blvd",
        city: "Portland",
        state: "OR",
        zip: "97232",
      },
      emergencyContact: {
        name: "Angela Washington",
        relationship: "Mother",
        phone: "(503) 555-7190",
      },
      preferredCommunication: "Phone",
      maskedIdentifiers: {
        ssnMasked: "***-**-5219",
        driversLicenseMasked: "DL-***-7712",
        taxIdMasked: "TIN-***-0092",
      },
    },
    relationship: {
      caregiverType: "Live-In Caregiver",
      relationshipToClient: "Prospective Live-In Attendant",
      linkedHousehold: {
        id: "hh-pending",
        code: "HH-PENDING",
        name: "Pending Assignment",
        address: "Under review",
        phone: "-",
      },
      relationshipVerificationStatus: "Not Required",
      householdPermissions: [],
      caregivingBoundaries: "Seeking live-in or overnight shifts in North Metro area.",
    },
    documentsCredentials: {
      overallStatus: "Verified",
      cprExpiryDate: "2027-08-14",
      tbTestExpiryDate: "2027-03-01",
      items: [
        {
          id: "cred-wash-1",
          name: "CPR & First Aid BLS",
          category: "Certification",
          issuer: "American Heart Association",
          issueDate: "2025-08-14",
          expiryDate: "2027-08-14",
          status: "Verified",
        },
      ],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Pending Review",
        referenceNumber: "BKG-2026-99211",
        provider: "Oregon DHS BCU",
        renewalDate: "2027-11-14",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-15" },
        { name: "Fingerprint Background Check", status: "Pending", lastCheckedDate: "2026-11-15" },
      ],
      trainingCourses: [
        {
          id: "tr-wash-1",
          title: "All Required Onboarding Modules",
          category: "Compliance & Safety",
          hours: 10,
          status: "Complete",
          completedDate: "2026-11-19",
          score: 95,
          requiredForActivation: true,
        },
      ],
      overallTrainingStatus: "Complete",
      trainingHoursCompleted: 10,
      trainingHoursRequired: 10,
      screeningReviewDecisions: [],
    },
    availabilityAssignments: {
      weeklyCapacityHours: 40,
      scheduledWeeklyHours: 0,
      availabilitySchedule: [
        { day: "Monday", available: true, timeSlots: "Full Day / Live-In" },
        { day: "Tuesday", available: true, timeSlots: "Full Day / Live-In" },
        { day: "Wednesday", available: true, timeSlots: "Full Day / Live-In" },
        { day: "Thursday", available: true, timeSlots: "Full Day / Live-In" },
        { day: "Friday", available: true, timeSlots: "Full Day / Live-In" },
      ],
      assignmentHistory: [],
    },
    evvVisitHistory: {
      overallComplianceRate: 100,
      totalVisitsCompleted: 0,
      gpsVerificationRate: 100,
      missedClockOutCount: 0,
      isRestrictedEVV: true,
      recentVisits: [],
    },
    activityHistory: {
      recentUpdates: [
        {
          id: "act-wash-1",
          timestamp: "2026-11-19T14:10:00Z",
          relativeTime: "2 hours ago",
          title: "Training completed",
          description: "CG-105 · Required training completed (10 hours)",
          actor: "Training Automation System",
          type: "training",
        },
      ],
    },
    attentionFlags: [
      {
        id: "flg-wash-1",
        title: "Screening pending",
        severity: "pending",
        category: "screening_pending",
        message: "Fingerprint live-scan review awaiting state DHS approval.",
      },
    ],
  },
  {
    id: "CG-106",
    name: "Maria Rodriguez",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    type: "Family Caregiver",
    status: "On Hold",
    pipelineStage: "Hiring Decision",
    branch: "Westside",
    hireDate: "2023-05-10",
    employmentClassification: "W-2",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Cleared",
      cprFirstAid: "Expiring",
      training: "Complete",
    },
    personalInfo: {
      preferredName: "Maria",
      dob: "1979-11-14",
      gender: "Female",
      languages: ["Spanish", "English"],
      phone: "(541) 555-6671",
      email: "maria.rodriguez@example.com",
      address: {
        street: "904 SW Elm St",
        city: "Beaverton",
        state: "OR",
        zip: "97005",
      },
      emergencyContact: {
        name: "Mateo Rodriguez",
        relationship: "Son",
        phone: "(541) 555-6688",
      },
      preferredCommunication: "Phone",
      maskedIdentifiers: {
        ssnMasked: "***-**-1092",
        driversLicenseMasked: "DL-***-3920",
        taxIdMasked: "TIN-***-5521",
      },
    },
    relationship: {
      caregiverType: "Family Caregiver",
      relationshipToClient: "Mother & Legal Guardian",
      linkedHousehold: {
        id: "hh-1005",
        code: "HH-1005",
        name: "Rodriguez Household",
        address: "904 SW Elm St, Beaverton, OR 97005",
        phone: "(541) 555-6671",
        city: "Beaverton",
        state: "OR",
      },
      relationshipVerificationStatus: "Verified",
      householdPermissions: ["Medical Consent", "Scheduling", "Care Notes"],
      caregivingBoundaries: "Temporarily on hold pending annual CPR/First Aid credential renewal.",
    },
    documentsCredentials: {
      overallStatus: "Expired",
      cprExpiryDate: "2026-11-01",
      tbTestExpiryDate: "2027-05-10",
      items: [
        {
          id: "cred-rod-1",
          name: "CPR & First Aid BLS",
          category: "Certification",
          issuer: "AHA",
          issueDate: "2024-10-30",
          expiryDate: "2026-11-01",
          status: "Expired",
          verificationNotes: "Certification lapsed Nov 1, 2026. Recertification class booked for Nov 22.",
        },
      ],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Cleared",
        referenceNumber: "BKG-2023-77192",
        provider: "Oregon DHS BCU",
        renewalDate: "2026-12-01",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-01" },
      ],
      trainingCourses: [
        {
          id: "tr-rod-1",
          title: "Annual Regulatory Updates",
          category: "Compliance",
          hours: 4,
          status: "Complete",
          requiredForActivation: true,
        },
      ],
      overallTrainingStatus: "Complete",
      trainingHoursCompleted: 12,
      trainingHoursRequired: 12,
      screeningReviewDecisions: [],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1005",
        name: "Hannah Morales",
        householdId: "hh-1005",
        householdName: "Rodriguez Household",
        relationship: "Daughter",
        weeklyAuthorizedHours: 35,
        scheduledWeeklyHours: 0,
        startDate: "2023-06-01",
        status: "Pending Setup",
      },
      weeklyCapacityHours: 35,
      scheduledWeeklyHours: 0,
      availabilitySchedule: [
        { day: "Monday", available: true, timeSlots: "On Hold (Credential Renewal)" },
      ],
      assignmentHistory: [],
    },
    evvVisitHistory: {
      overallComplianceRate: 97.4,
      totalVisitsCompleted: 240,
      gpsVerificationRate: 98.1,
      missedClockOutCount: 2,
      isRestrictedEVV: true,
      recentVisits: [],
    },
    activityHistory: {
      recentUpdates: [
        {
          id: "act-rod-1",
          timestamp: "2026-11-02T09:00:00Z",
          relativeTime: "17 days ago",
          title: "Status changed to On Hold",
          description: "Caregiver placed on hold due to expired CPR credential",
          actor: "Compliance Alert System",
          type: "approval",
        },
      ],
    },
    attentionFlags: [
      {
        id: "flg-rod-1",
        title: "Expired credentials",
        severity: "overdue",
        category: "expired_credentials",
        message: "CPR certification expired 18 days ago. Recertification proof required.",
      },
    ],
  },
  {
    id: "CG-107",
    name: "Clara Jenkins",
    avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200",
    type: "Family Friend",
    status: "Active",
    pipelineStage: "Hired & Onboarding",
    branch: "Mountain Lane",
    hireDate: "2024-05-15",
    employmentClassification: "1099",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Cleared",
      cprFirstAid: "Verified",
      training: "Complete",
    },
    personalInfo: {
      preferredName: "Clara",
      dob: "1965-04-12",
      gender: "Female",
      languages: ["English"],
      phone: "(541) 555-0245",
      email: "clara.jenkins@example.com",
      address: {
        street: "710 Evergreen Terrace",
        city: "Springfield",
        state: "OR",
        zip: "97477",
      },
      emergencyContact: {
        name: "Samuel Jenkins",
        relationship: "Spouse",
        phone: "(541) 555-0248",
      },
      preferredCommunication: "Phone",
      maskedIdentifiers: {
        ssnMasked: "***-**-8120",
        driversLicenseMasked: "DL-***-9021",
        taxIdMasked: "TIN-***-3329",
      },
    },
    relationship: {
      caregiverType: "Family Friend",
      relationshipToClient: "Grandmother & Approved Backup Caregiver",
      linkedHousehold: {
        id: "hh-1001",
        code: "HH-1001",
        name: "Miller Household",
        address: "742 Evergreen Terrace, Springfield, OR 97477",
        phone: "(541) 555-0199",
        city: "Springfield",
        state: "OR",
      },
      relationshipVerificationStatus: "Verified",
      householdPermissions: ["Respite Care", "Backup Coverage"],
      caregivingBoundaries: "Approved secondary caregiver for Leo Miller when Sarah Miller is unavailable.",
    },
    documentsCredentials: {
      overallStatus: "Verified",
      cprExpiryDate: "2027-05-15",
      tbTestExpiryDate: "2027-05-15",
      items: [
        {
          id: "cred-clara-1",
          name: "CPR & First Aid AHA BLS",
          category: "Certification",
          issuer: "AHA",
          issueDate: "2025-05-15",
          expiryDate: "2027-05-15",
          status: "Verified",
        },
      ],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Cleared",
        referenceNumber: "BKG-2024-55192",
        provider: "Oregon DHS BCU",
        renewalDate: "2027-05-15",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-01" },
      ],
      trainingCourses: [
        {
          id: "tr-clara-1",
          title: "Backup & Respite Protocol",
          category: "Care Management",
          hours: 4,
          status: "Complete",
          requiredForActivation: true,
        },
      ],
      overallTrainingStatus: "Complete",
      trainingHoursCompleted: 8,
      trainingHoursRequired: 8,
      screeningReviewDecisions: [],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1001",
        name: "Leo Miller",
        householdId: "hh-1001",
        householdName: "Miller Household",
        relationship: "Grandmother (Backup)",
        weeklyAuthorizedHours: 10,
        scheduledWeeklyHours: 0,
        startDate: "2024-06-01",
        status: "Active",
      },
      weeklyCapacityHours: 15,
      scheduledWeeklyHours: 0,
      availabilitySchedule: [
        { day: "Saturday", available: true, timeSlots: "On Call / Respite" },
        { day: "Sunday", available: true, timeSlots: "On Call / Respite" },
      ],
      assignmentHistory: [],
    },
    evvVisitHistory: {
      overallComplianceRate: 98.9,
      totalVisitsCompleted: 42,
      gpsVerificationRate: 99.2,
      missedClockOutCount: 0,
      isRestrictedEVV: true,
      recentVisits: [],
    },
    activityHistory: {
      recentUpdates: [],
    },
  },
  {
    id: "CG-108",
    name: "Elena Whitfield",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    type: "Live-In Caregiver",
    status: "Active",
    pipelineStage: "Archived",
    branch: "North Metro",
    hireDate: "2023-08-01",
    employmentClassification: "W-2",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Cleared",
      cprFirstAid: "Verified",
      training: "Complete",
    },
    personalInfo: {
      preferredName: "Elena",
      dob: "1986-07-19",
      gender: "Female",
      languages: ["English"],
      phone: "(503) 555-9921",
      email: "elena.whitfield@example.com",
      address: {
        street: "1428 NW 23rd Ave",
        city: "Portland",
        state: "OR",
        zip: "97210",
      },
      emergencyContact: {
        name: "Robert Whitfield",
        relationship: "Brother",
        phone: "(503) 555-9930",
      },
      preferredCommunication: "Phone",
      maskedIdentifiers: {
        ssnMasked: "***-**-7182",
        driversLicenseMasked: "DL-***-2291",
        taxIdMasked: "TIN-***-8821",
      },
    },
    relationship: {
      caregiverType: "Live-In Caregiver",
      relationshipToClient: "Daughter (Paid W-2 Live-In Caregiver)",
      linkedHousehold: {
        id: "hh-1002",
        code: "HH-1002",
        name: "Whitfield Household",
        address: "1428 NW 23rd Ave, Portland, OR 97210",
        phone: "(503) 555-9921",
        city: "Portland",
        state: "OR",
      },
      relationshipVerificationStatus: "Verified",
      householdPermissions: ["Full Care Management", "ADL Assistance", "Medication Setup"],
      caregivingBoundaries: "Full live-in arrangement with defined sleep and personal rest periods.",
    },
    documentsCredentials: {
      overallStatus: "Verified",
      cprExpiryDate: "2027-08-15",
      tbTestExpiryDate: "2027-08-15",
      items: [],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Cleared",
        referenceNumber: "BKG-2023-44102",
        provider: "Oregon DHS BCU",
        renewalDate: "2026-12-01",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-01" },
      ],
      trainingCourses: [],
      overallTrainingStatus: "Complete",
      trainingHoursCompleted: 16,
      trainingHoursRequired: 16,
      screeningReviewDecisions: [],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1002",
        name: "Marcus Whitfield",
        householdId: "hh-1002",
        householdName: "Whitfield Household",
        relationship: "Father",
        weeklyAuthorizedHours: 42,
        scheduledWeeklyHours: 42,
        startDate: "2023-08-15",
        status: "Active",
      },
      weeklyCapacityHours: 42,
      scheduledWeeklyHours: 42,
      availabilitySchedule: [
        { day: "Monday", available: true, timeSlots: "Live-In Shift" },
        { day: "Tuesday", available: true, timeSlots: "Live-In Shift" },
        { day: "Wednesday", available: true, timeSlots: "Live-In Shift" },
        { day: "Thursday", available: true, timeSlots: "Live-In Shift" },
        { day: "Friday", available: true, timeSlots: "Live-In Shift" },
      ],
      assignmentHistory: [],
    },
    evvVisitHistory: {
      overallComplianceRate: 99.3,
      totalVisitsCompleted: 512,
      gpsVerificationRate: 99.6,
      missedClockOutCount: 0,
      isRestrictedEVV: true,
      recentVisits: [],
    },
    activityHistory: {
      recentUpdates: [],
    },
  },
  {
    id: "CG-115",
    name: "David Bennett",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    type: "Family Caregiver",
    status: "Pending",
    pipelineStage: "Offer Extended",
    branch: "Mountain Lane",
    hireDate: "2026-11-10",
    employmentClassification: "W-2",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Pending",
      cprFirstAid: "Verified",
      training: "In Progress",
    },
    personalInfo: {
      preferredName: "Dev",
      dob: "1985-02-14",
      gender: "Male",
      languages: ["English", "Gujarati"],
      phone: "(541) 555-7788",
      email: "david.bennett@example.com",
      address: {
        street: "312 Willow Creek Rd",
        city: "Springfield",
        state: "OR",
        zip: "97477",
      },
      emergencyContact: {
        name: "Paula Bennett",
        relationship: "Spouse",
        phone: "(541) 555-7799",
      },
      preferredCommunication: "Email",
      maskedIdentifiers: {
        ssnMasked: "***-**-3382",
        driversLicenseMasked: "DL-***-6612",
        taxIdMasked: "TIN-***-4421",
      },
    },
    relationship: {
      caregiverType: "Family Caregiver",
      relationshipToClient: "Father (Enrolled Family Caregiver)",
      linkedHousehold: {
        id: "hh-1003",
        code: "HH-1003",
        name: "Bennett / Lin Household",
        address: "312 Willow Creek Rd, Springfield, OR 97477",
        phone: "(541) 555-7788",
        city: "Springfield",
        state: "OR",
      },
      relationshipVerificationStatus: "Verified",
      householdPermissions: ["Legal Guardian", "Medical Directives"],
      caregivingBoundaries: "Enrolling for state-paid pediatric waiver hours.",
    },
    documentsCredentials: {
      overallStatus: "Verified",
      cprExpiryDate: "2027-10-15",
      tbTestExpiryDate: "2027-10-15",
      items: [],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Pending Review",
        referenceNumber: "BKG-2026-33921",
        provider: "Oregon DHS BCU",
        renewalDate: "2027-11-10",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-12" },
      ],
      trainingCourses: [],
      overallTrainingStatus: "In Progress",
      trainingHoursCompleted: 4,
      trainingHoursRequired: 8,
      screeningReviewDecisions: [],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1003",
        name: "Maya Lin",
        householdId: "hh-1003",
        householdName: "Bennett / Lin Household",
        relationship: "Daughter",
        weeklyAuthorizedHours: 32,
        scheduledWeeklyHours: 0,
        startDate: "2026-12-01",
        status: "Pending Setup",
      },
      weeklyCapacityHours: 35,
      scheduledWeeklyHours: 0,
      availabilitySchedule: [
        { day: "Monday", available: true, timeSlots: "8:00 AM – 3:00 PM" },
      ],
      assignmentHistory: [],
    },
    evvVisitHistory: {
      overallComplianceRate: 100,
      totalVisitsCompleted: 0,
      gpsVerificationRate: 100,
      missedClockOutCount: 0,
      isRestrictedEVV: true,
      recentVisits: [],
    },
    activityHistory: {
      recentUpdates: [],
    },
    attentionFlags: [
      {
        id: "flg-bennett-1",
        title: "Screening pending",
        severity: "pending",
        category: "screening_pending",
        message: "State background review pending final clearance.",
      },
      {
        id: "flg-bennett-2",
        title: "Training incomplete",
        severity: "action_required",
        category: "training_incomplete",
        message: "4 hours of orientation training pending.",
      },
    ],
  },
  {
    id: "CG-120",
    name: "Sofia Morales",
    avatarUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=200",
    type: "Family Caregiver",
    status: "Active",
    pipelineStage: "Hired & Onboarding",
    branch: "Valley View",
    hireDate: "2024-02-18",
    employmentClassification: "W-2",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Cleared",
      cprFirstAid: "Verified",
      training: "Complete",
    },
    personalInfo: {
      preferredName: "Sofia",
      dob: "1993-09-02",
      gender: "Female",
      languages: ["English", "Spanish"],
      phone: "(541) 555-4491",
      email: "sofia.morales@example.com",
      address: {
        street: "882 High Street",
        city: "Eugene",
        state: "OR",
        zip: "97401",
      },
      emergencyContact: {
        name: "Camila Morales",
        relationship: "Mother",
        phone: "(541) 555-4499",
      },
      preferredCommunication: "SMS",
      maskedIdentifiers: {
        ssnMasked: "***-**-9018",
        driversLicenseMasked: "DL-***-5120",
        taxIdMasked: "TIN-***-1120",
      },
    },
    relationship: {
      caregiverType: "Family Caregiver",
      relationshipToClient: "Sister (Paid W-2 Family Caregiver)",
      linkedHousehold: {
        id: "hh-1005",
        code: "HH-1005",
        name: "Morales Household",
        address: "882 High Street, Eugene, OR 97401",
        phone: "(541) 555-4491",
        city: "Eugene",
        state: "OR",
      },
      relationshipVerificationStatus: "Verified",
      householdPermissions: ["ADL Support", "Transportation", "Care Notes"],
      caregivingBoundaries: "Sister providing assistance with daily routines and mobility support.",
    },
    documentsCredentials: {
      overallStatus: "Verified",
      cprExpiryDate: "2027-02-18",
      tbTestExpiryDate: "2027-02-18",
      items: [],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Cleared",
        referenceNumber: "BKG-2024-22019",
        provider: "Oregon DHS BCU",
        renewalDate: "2027-02-18",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-01" },
      ],
      trainingCourses: [],
      overallTrainingStatus: "Complete",
      trainingHoursCompleted: 10,
      trainingHoursRequired: 10,
      screeningReviewDecisions: [],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1005",
        name: "Hannah Morales",
        householdId: "hh-1005",
        householdName: "Morales Household",
        relationship: "Sister",
        weeklyAuthorizedHours: 35,
        scheduledWeeklyHours: 35,
        startDate: "2024-03-01",
        status: "Active",
      },
      weeklyCapacityHours: 35,
      scheduledWeeklyHours: 35,
      availabilitySchedule: [
        { day: "Monday", available: true, timeSlots: "8:00 AM – 3:00 PM" },
        { day: "Tuesday", available: true, timeSlots: "8:00 AM – 3:00 PM" },
        { day: "Wednesday", available: true, timeSlots: "8:00 AM – 3:00 PM" },
        { day: "Thursday", available: true, timeSlots: "8:00 AM – 3:00 PM" },
        { day: "Friday", available: true, timeSlots: "8:00 AM – 3:00 PM" },
      ],
      assignmentHistory: [],
    },
    evvVisitHistory: {
      overallComplianceRate: 98.6,
      totalVisitsCompleted: 380,
      gpsVerificationRate: 99.1,
      missedClockOutCount: 1,
      isRestrictedEVV: true,
      recentVisits: [],
    },
    activityHistory: {
      recentUpdates: [],
    },
  },
  {
    id: "CG-122",
    name: "Rachel Bennett",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    type: "Family Caregiver",
    status: "Onboarding",
    pipelineStage: "Interview Scheduled",
    branch: "Mountain Lane",
    hireDate: "2026-11-05",
    employmentClassification: "W-2",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Cleared",
      cprFirstAid: "Verified",
      training: "In Progress",
    },
    personalInfo: {
      preferredName: "Rachel",
      dob: "1982-01-28",
      gender: "Female",
      languages: ["English"],
      phone: "(541) 555-9192",
      email: "rachel.bennett@example.com",
      address: {
        street: "502 Timberline Way",
        city: "Springfield",
        state: "OR",
        zip: "97477",
      },
      emergencyContact: {
        name: "Kevin Bennett",
        relationship: "Brother",
        phone: "(541) 555-9199",
      },
      preferredCommunication: "Phone",
      maskedIdentifiers: {
        ssnMasked: "***-**-4418",
        driversLicenseMasked: "DL-***-8821",
        taxIdMasked: "TIN-***-7712",
      },
    },
    relationship: {
      caregiverType: "Family Caregiver",
      relationshipToClient: "Aunt (Paid W-2 Family Caregiver)",
      linkedHousehold: {
        id: "hh-1006",
        code: "HH-1006",
        name: "Bennett Household",
        address: "502 Timberline Way, Springfield, OR 97477",
        phone: "(541) 555-9192",
        city: "Springfield",
        state: "OR",
      },
      relationshipVerificationStatus: "Verified",
      householdPermissions: ["Care Routine", "ADL Supervision"],
      caregivingBoundaries: "Enrolled to provide 20 hours/week of assistance for Noah Bennett.",
    },
    documentsCredentials: {
      overallStatus: "Verified",
      cprExpiryDate: "2027-11-05",
      tbTestExpiryDate: "2027-11-05",
      items: [],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Cleared",
        referenceNumber: "BKG-2026-90182",
        provider: "Oregon DHS BCU",
        renewalDate: "2027-11-05",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-06" },
      ],
      trainingCourses: [],
      overallTrainingStatus: "In Progress",
      trainingHoursCompleted: 5,
      trainingHoursRequired: 8,
      screeningReviewDecisions: [],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1006",
        name: "Noah Bennett",
        householdId: "hh-1006",
        householdName: "Bennett Household",
        relationship: "Nephew",
        weeklyAuthorizedHours: 20,
        scheduledWeeklyHours: 0,
        startDate: "2026-12-01",
        status: "Pending Setup",
      },
      weeklyCapacityHours: 25,
      scheduledWeeklyHours: 0,
      availabilitySchedule: [
        { day: "Tuesday", available: true, timeSlots: "9:00 AM – 2:00 PM" },
        { day: "Thursday", available: true, timeSlots: "9:00 AM – 2:00 PM" },
      ],
      assignmentHistory: [],
    },
    evvVisitHistory: {
      overallComplianceRate: 100,
      totalVisitsCompleted: 0,
      gpsVerificationRate: 100,
      missedClockOutCount: 0,
      isRestrictedEVV: true,
      recentVisits: [],
    },
    activityHistory: {
      recentUpdates: [],
    },
    attentionFlags: [
      {
        id: "flg-bennett-1",
        title: "Training incomplete",
        severity: "action_required",
        category: "training_incomplete",
        message: "3 hours of pediatric safe handling training remaining.",
      },
    ],
  },
  {
    id: "CG-130",
    name: "David Chen",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    type: "Family Caregiver",
    status: "Active",
    pipelineStage: "Archived",
    branch: "Valley View",
    hireDate: "2024-04-10",
    employmentClassification: "W-2",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Cleared",
      cprFirstAid: "Verified",
      training: "Complete",
    },
    personalInfo: {
      preferredName: "David",
      dob: "1989-10-10",
      gender: "Male",
      languages: ["English", "Mandarin"],
      phone: "(541) 555-2234",
      email: "david.chen@example.com",
      address: {
        street: "112 Orchard View Rd",
        city: "Eugene",
        state: "OR",
        zip: "97401",
      },
      emergencyContact: {
        name: "Lillian Chen",
        relationship: "Sister",
        phone: "(541) 555-8899",
      },
      preferredCommunication: "SMS",
      maskedIdentifiers: {
        ssnMasked: "***-**-5512",
        driversLicenseMasked: "DL-***-1144",
        taxIdMasked: "TIN-***-9921",
      },
    },
    relationship: {
      caregiverType: "Family Caregiver",
      relationshipToClient: "Son (Paid Family Caregiver)",
      linkedHousehold: {
        id: "hh-1006",
        code: "HH-1006",
        name: "Chen Household",
        address: "112 Orchard View Rd, Eugene, OR 97401",
        phone: "(541) 555-8812",
        city: "Eugene",
        state: "OR",
      },
      relationshipVerificationStatus: "Verified",
      householdPermissions: ["Legal Proxy", "ADL Support"],
      caregivingBoundaries: "Providing companion and mobility care for Henry Chen.",
    },
    documentsCredentials: {
      overallStatus: "Verified",
      cprExpiryDate: "2027-04-10",
      tbTestExpiryDate: "2027-04-10",
      items: [],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Cleared",
        referenceNumber: "BKG-2024-11029",
        provider: "Oregon DHS BCU",
        renewalDate: "2027-04-10",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-01" },
      ],
      trainingCourses: [],
      overallTrainingStatus: "Complete",
      trainingHoursCompleted: 12,
      trainingHoursRequired: 12,
      screeningReviewDecisions: [],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1007",
        name: "Henry Chen",
        householdId: "hh-1006",
        householdName: "Chen Household",
        relationship: "Father",
        weeklyAuthorizedHours: 20,
        scheduledWeeklyHours: 20,
        startDate: "2024-05-01",
        status: "Active",
      },
      weeklyCapacityHours: 25,
      scheduledWeeklyHours: 20,
      availabilitySchedule: [
        { day: "Saturday", available: true, timeSlots: "9:00 AM – 7:00 PM" },
        { day: "Sunday", available: true, timeSlots: "9:00 AM – 7:00 PM" },
      ],
      assignmentHistory: [],
    },
    evvVisitHistory: {
      overallComplianceRate: 99.0,
      totalVisitsCompleted: 154,
      gpsVerificationRate: 99.4,
      missedClockOutCount: 0,
      isRestrictedEVV: true,
      recentVisits: [],
    },
    activityHistory: {
      recentUpdates: [],
    },
  },
  {
    id: "CG-135",
    name: "Jennifer Lin",
    avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200",
    type: "Family Caregiver",
    status: "Onboarding",
    pipelineStage: "New Application",
    branch: "Mountain Lane",
    hireDate: "2026-11-08",
    employmentClassification: "W-2",
    assignmentStatus: "Assigned",
    verificationChecklist: {
      identity: "Verified",
      screening: "Cleared",
      cprFirstAid: "Missing",
      training: "In Progress",
    },
    personalInfo: {
      preferredName: "Jennifer",
      dob: "1983-05-24",
      gender: "Female",
      languages: ["English", "Mandarin"],
      phone: "(541) 555-5512",
      email: "jennifer.lin@example.com",
      address: {
        street: "312 Willow Creek Rd",
        city: "Springfield",
        state: "OR",
        zip: "97477",
      },
      emergencyContact: {
        name: "David Bennett",
        relationship: "Spouse",
        phone: "(541) 555-7788",
      },
      preferredCommunication: "Email",
      maskedIdentifiers: {
        ssnMasked: "***-**-9214",
        driversLicenseMasked: "DL-***-4402",
        taxIdMasked: "TIN-***-7711",
      },
    },
    relationship: {
      caregiverType: "Family Caregiver",
      relationshipToClient: "Mother (Paid W-2 Family Caregiver)",
      linkedHousehold: {
        id: "hh-1003",
        code: "HH-1003",
        name: "Lin Household",
        address: "312 Willow Creek Rd, Springfield, OR 97477",
        phone: "(541) 555-5512",
        city: "Springfield",
        state: "OR",
      },
      relationshipVerificationStatus: "Verified",
      householdPermissions: ["Legal Guardian", "Primary Decision Maker"],
      caregivingBoundaries: "Enrolling as primary paid caregiver for Maya Lin under EPSDT.",
    },
    documentsCredentials: {
      overallStatus: "Missing",
      cprExpiryDate: "Pending Upload",
      tbTestExpiryDate: "2027-11-08",
      items: [
        {
          id: "cred-lin-1",
          name: "CPR & First Aid Certificate",
          category: "Certification",
          issuer: "Pending",
          issueDate: "-",
          status: "Missing",
          verificationNotes: "CPR card upload required prior to service authorization.",
        },
      ],
    },
    screeningTraining: {
      backgroundCheck: {
        status: "Cleared",
        referenceNumber: "BKG-2026-88129",
        provider: "Oregon DHS BCU",
        renewalDate: "2027-11-08",
      },
      screenings: [
        { name: "OIG / SAM Exclusion", status: "Cleared", lastCheckedDate: "2026-11-09" },
      ],
      trainingCourses: [],
      overallTrainingStatus: "In Progress",
      trainingHoursCompleted: 3,
      trainingHoursRequired: 8,
      screeningReviewDecisions: [],
    },
    availabilityAssignments: {
      assignedClient: {
        id: "CL-1003",
        name: "Maya Lin",
        householdId: "hh-1003",
        householdName: "Lin Household",
        relationship: "Mother",
        weeklyAuthorizedHours: 35,
        scheduledWeeklyHours: 0,
        startDate: "2026-12-01",
        status: "Pending Setup",
      },
      weeklyCapacityHours: 35,
      scheduledWeeklyHours: 0,
      availabilitySchedule: [
        { day: "Monday", available: true, timeSlots: "8:00 AM – 3:30 PM" },
      ],
      assignmentHistory: [],
    },
    evvVisitHistory: {
      overallComplianceRate: 100,
      totalVisitsCompleted: 0,
      gpsVerificationRate: 100,
      missedClockOutCount: 0,
      isRestrictedEVV: true,
      recentVisits: [],
    },
    activityHistory: {
      recentUpdates: [],
    },
    attentionFlags: [
      {
        id: "flg-lin-1",
        title: "Missing documents",
        severity: "incomplete",
        category: "missing_documents",
        message: "CPR & First Aid certificate upload missing from profile.",
      },
    ],
  },
];

// Backward-compatible dictionary matching the old template for any legacy components
export const mockCaregivers: Record<string, Caregiver> = INITIAL_CAREGIVERS.reduce(
  (acc, cg) => {
    acc[cg.id] = {
      id: cg.id,
      name: cg.name,
      avatarUrl: cg.avatarUrl || "",
      role: `${cg.type} (${cg.employmentClassification})`,
      status: cg.status === "Active" ? "Active" : cg.status === "Onboarding" ? "Onboarding" : "Inactive",
      rating: 4.9,
      yearsWithAgency: 1,
      phone: cg.personalInfo.phone,
      email: cg.personalInfo.email,
      address: `${cg.personalInfo.address.street}, ${cg.personalInfo.address.city}, ${cg.personalInfo.address.state} ${cg.personalInfo.address.zip}`,
      emergencyContact: `${cg.personalInfo.emergencyContact.name} (${cg.personalInfo.emergencyContact.relationship}) - ${cg.personalInfo.emergencyContact.phone}`,
      languages: cg.personalInfo.languages,
      skills: ["ADL Support", "Patient Transfers", "Medication Prompting", "Pediatric Care"],
      hireDate: cg.hireDate,
      employmentType: cg.employmentClassification === "1099" ? "1099" : "W2",
      payRate: 24.5,
      complianceScore: cg.verificationChecklist.training === "Complete" ? 98 : 78,
      assignedPatientsCount: cg.assignmentStatus === "Assigned" ? 1 : 0,
      lastActiveDate: "Today",
      certifications: cg.documentsCredentials.items.map((it) => ({
        id: it.id,
        name: it.name,
        issueDate: it.issueDate,
        expiryDate: it.expiryDate || "2027-12-31",
        status: it.status === "Verified" ? "Active" : it.status === "Expired" ? "Expired" : "Expiring Soon",
        issuer: it.issuer,
      })),
      recentShifts: cg.evvVisitHistory.recentVisits.map((v) => ({
        id: v.id,
        patientId: v.clientId,
        patientName: v.clientName,
        date: v.date,
        startTime: v.clockIn,
        endTime: v.clockOut,
        status: "Completed",
      })),
    };
    return acc;
  },
  {} as Record<string, Caregiver>
);

const CAREGIVERS_STORAGE_KEY = "lilisare_caregivers_v1";

export function getCaregiversFromStorage(): CaregiverRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_CAREGIVERS;
  }
  try {
    const raw = localStorage.getItem(CAREGIVERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CAREGIVERS_STORAGE_KEY, JSON.stringify(INITIAL_CAREGIVERS));
      return INITIAL_CAREGIVERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CAREGIVERS;
  } catch (err) {
    console.error("Failed to read caregivers from localStorage", err);
    return INITIAL_CAREGIVERS;
  }
}

export function saveCaregiversToStorage(caregivers: CaregiverRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAREGIVERS_STORAGE_KEY, JSON.stringify(caregivers));
    window.dispatchEvent(
      new CustomEvent("lilisare_intake_sync", {
        detail: { type: "caregivers", count: caregivers.length, timestamp: Date.now() },
      })
    );
  } catch (err) {
    console.error("Failed to save caregivers to localStorage", err);
  }
}
