export type CaregiverType =
  | "Family Caregiver"
  | "Live-In Caregiver"
  | "Family Friend"
  | "Attendant Caregiver";

export type CaregiverStatus =
  | "Active"
  | "Onboarding"
  | "Pending"
  | "On Hold"
  | "Inactive";

export type CredentialStatus =
  | "Verified"
  | "Expiring Soon"
  | "Expired"
  | "Missing";

export type ScreeningStatus =
  | "Cleared"
  | "Pending Review"
  | "In Review"
  | "Flagged";

export type TrainingStatus =
  | "Complete"
  | "In Progress"
  | "Incomplete"
  | "Action Required";

export type AssignmentStatus = "Assigned" | "Unassigned";

export interface VerificationChecklist {
  identity: "Verified" | "Pending" | "Missing";
  screening: "Cleared" | "Pending" | "In Review";
  cprFirstAid: "Verified" | "Expiring" | "Missing";
  training: "Complete" | "In Progress" | "Incomplete";
}

export interface CaregiverCredentialItem {
  id: string;
  name: string;
  category: "Identity" | "Medical / Health" | "Certification" | "Compliance";
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  status: "Verified" | "Expiring Soon" | "Expired" | "Missing" | "Pending Review";
  documentUrl?: string;
  fileSize?: string;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface CaregiverTrainingCourse {
  id: string;
  title: string;
  category: string;
  hours: number;
  status: "Complete" | "In Progress" | "Incomplete" | "Action Required";
  completedDate?: string;
  score?: number;
  requiredForActivation: boolean;
  certificateId?: string;
}

export interface CaregiverVisitRecord {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  durationMinutes: number;
  gpsStatus: "Verified Geo-Fence" | "Manual Override" | "Exception Flagged";
  gpsCoordinates?: string;
  serviceType: string;
  hasCareNotes: boolean;
  supervisorApproved: boolean;
  exceptionReason?: string;
}

export interface CaregiverAuditItem {
  id: string;
  timestamp: string;
  relativeTime: string;
  title: string;
  description: string;
  actor: string;
  type: "approval" | "document" | "assignment" | "training" | "profile" | "evv";
}

export interface CaregiverAttentionItem {
  id: string;
  title: string;
  description: string;
  category: "expired_credentials" | "screening_pending" | "training_incomplete" | "missing_documents";
  severity: "overdue" | "pending" | "action_required" | "incomplete";
  affectedCount?: number;
  actionUrl?: string;
  actionLabel: string;
}

export interface CaregiverRecord {
  id: string; // e.g. "CG-102"
  name: string;
  avatarUrl?: string;
  type: CaregiverType;
  status: CaregiverStatus;
  branch: string; // e.g. "Mountain Lane", "North Metro", "Valley View"
  hireDate: string;
  employmentClassification: "W-2" | "1099" | "Family Paid Exempt";

  // Quick Inspector Checklist & Assignment
  verificationChecklist: VerificationChecklist;
  assignmentStatus: AssignmentStatus;

  // 01. Personal Information
  personalInfo: {
    preferredName?: string;
    dob: string;
    gender: string;
    languages: string[];
    phone: string;
    secondaryPhone?: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
    preferredCommunication: "SMS" | "Phone" | "Email";
    maskedIdentifiers: {
      ssnMasked: string; // e.g. "***-**-4819"
      driversLicenseMasked: string; // e.g. "DL-***-928"
      taxIdMasked: string; // e.g. "TIN-***-114"
    };
  };

  // 02. Caregiver Relationship
  relationship: {
    caregiverType: CaregiverType;
    relationshipToClient: string; // e.g. "Mother (Primary Guardian)", "Dedicated Live-In Aide"
    linkedHousehold: {
      id: string;
      code: string;
      name: string;
      address: string;
      phone: string;
      city?: string;
      state?: string;
    };
    relationshipVerificationStatus: "Verified" | "Pending Review" | "Not Required";
    relationshipVerifiedDate?: string;
    householdPermissions: string[];
    caregivingBoundaries: string;
  };

  // 03. Documents & Credentials
  documentsCredentials: {
    overallStatus: CredentialStatus;
    cprExpiryDate: string;
    tbTestExpiryDate: string;
    driversLicenseExpiry?: string;
    items: CaregiverCredentialItem[];
  };

  // 04. Screening & Training
  screeningTraining: {
    backgroundCheck: {
      status: ScreeningStatus;
      clearedDate?: string;
      referenceNumber: string;
      provider: string;
      renewalDate: string;
    };
    screenings: {
      name: string;
      status: "Cleared" | "Pending" | "Flagged";
      lastCheckedDate: string;
      notes?: string;
    }[];
    trainingCourses: CaregiverTrainingCourse[];
    overallTrainingStatus: TrainingStatus;
    trainingHoursCompleted: number;
    trainingHoursRequired: number;
    screeningReviewDecisions: {
      id: string;
      reviewerName: string;
      reviewerRole: string;
      date: string;
      decision: "Approved" | "Conditional Clearance" | "Pending More Info";
      notes: string;
    }[];
  };

  // 05. Availability & Assignments
  availabilityAssignments: {
    assignedClient?: {
      id: string; // e.g. "CL-1001"
      name: string;
      avatarUrl?: string;
      householdId: string;
      householdName: string;
      relationship: string;
      weeklyAuthorizedHours: number;
      scheduledWeeklyHours: number;
      startDate: string;
      status: "Active" | "Pending Setup";
    };
    backupCaregiver?: {
      id: string;
      name: string;
      phone: string;
      relationship: string;
    };
    weeklyCapacityHours: number;
    scheduledWeeklyHours: number;
    availabilitySchedule: {
      day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
      available: boolean;
      timeSlots: string;
    }[];
    assignmentHistory: {
      id: string;
      clientId: string;
      clientName: string;
      period: string;
      role: string;
      reasonForChange?: string;
    }[];
  };

  // 06. EVV & Visit History
  evvVisitHistory: {
    overallComplianceRate: number; // percentage, e.g. 98.4
    totalVisitsCompleted: number;
    gpsVerificationRate: number; // percentage, e.g. 99.1
    missedClockOutCount: number;
    isRestrictedEVV: boolean; // restricted to authorized roles
    recentVisits: CaregiverVisitRecord[];
  };

  // 07. Activity & History
  activityHistory: {
    recentUpdates: CaregiverAuditItem[];
  };

  // Active attention issues for this specific caregiver
  attentionFlags?: {
    id: string;
    title: string;
    severity: "overdue" | "pending" | "action_required" | "incomplete";
    category: "expired_credentials" | "screening_pending" | "training_incomplete" | "missing_documents";
    message: string;
  }[];
}
