export type ClientStatus = "Active" | "Onboarding" | "On Hold" | "Discharged";

export type CareArrangementType =
  | "Family Care"
  | "Live-In Care"
  | "Family Friend Care"
  | "Attendant Care";

export type ReadinessState = "Complete" | "Review needed" | "Verified" | "Pending" | "Missing" | "Expiring";

export interface ConnectedHouseholdInfo {
  id: string; // e.g. hh-1001
  code: string; // e.g. HH-1001
  name: string; // e.g. Miller Household
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  totalMembersCount?: number;
}

export interface ClientPrimaryContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  preferredMethod: "Phone" | "Email" | "SMS";
  bestTimeToReach?: string;
}

export interface ClientEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface AssignedCaregiverSummary {
  id: string; // e.g. CG-102
  name: string;
  relationship: string; // e.g. Mother (Paid W-2 Family Caregiver)
  classification: "W-2" | "1099" | "Family Paid" | "Third-Party";
  status: "Active" | "Pending Screening" | "Onboarding";
  phone: string;
  email: string;
  hireDate?: string;
  attendanceReliability?: number; // e.g. 98.5%
  evvCompliance?: number;
}

export interface AssignedCareTeam {
  primaryCaregiver: AssignedCaregiverSummary | null;
  backupCaregiver?: AssignedCaregiverSummary | null;
  familyContact: {
    id: string; // e.g. FC-201
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  onboardingCoordinator?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  caseManager?: {
    name: string;
    agency: string;
    email: string;
    phone: string;
  };
}

export interface ClientCareReadiness {
  clientProfile: "Complete" | "Review needed" | "Incomplete";
  careArrangement: "Complete" | "Pending" | "Draft";
  documents: "Verified" | "Review needed" | "Missing";
  authorization: "Verified" | "Expiring" | "Pending" | "Missing";
  overallScore?: number; // 0-100
}

export interface ClientCarePlan {
  program: string; // e.g. Pediatric In-Home Care (Medicaid EPSDT)
  approvedServices: string[];
  authorizedWeeklyHours: number;
  scheduledWeeklyHours: number;
  hoursUsedThisWeek: number;
  effectiveDate: string;
  reviewDate: string;
  needsReview: boolean;
  frequency: string; // e.g. "Monday – Friday, 8:00 AM – 4:00 PM"
  careNeeds: string[];
  specialInstructions: string;
  mobilityNotes: string;
  dietaryRestrictions: string;
  allergies: string[];
  adlSupportNeeds: string[];
}

export interface ClientAuthorization {
  authNumber: string; // e.g. AUTH-2026-9812
  payer: string; // e.g. State Medicaid Waiver (DHS)
  status: "Verified" | "Expiring Soon" | "Pending Renewal" | "Expired";
  startDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  totalUnitsApproved: number;
  unitsUsed: number;
  unitsRemaining: number;
  weeklyHourCap: number;
  caseManagerName: string;
  caseManagerAgency: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  category: "Consent" | "Authorization" | "Assessment" | "Identification" | "Medical / Clinical";
  status: "Verified" | "Review needed" | "Missing" | "Expiring Soon";
  uploadedDate?: string;
  expiryDate?: string;
  signedBy?: string;
  fileSize?: string;
  isRestrictedClinical?: boolean;
}

export interface ClientHouseholdMember {
  id: string;
  name: string;
  relationship: string;
  role: "Parent / Legal Guardian" | "Family Caregiver" | "Family Friend Caregiver" | "Care Recipient" | "Sibling" | "Other";
  phone: string;
  email: string;
  permissions: string[];
  isPrimaryDecisionMaker: boolean;
}

export interface ClientActivityLog {
  id: string;
  timestamp: string;
  type: "status_change" | "caregiver_assigned" | "document_updated" | "authorization" | "note" | "audit";
  author: string;
  authorRole: string;
  title: string;
  details: string;
}

export interface ClientAttentionItem {
  id: string;
  type: "missing_consent" | "auth_expiring" | "no_caregiver" | "care_plan_review";
  severity: "urgent" | "action_required" | "upcoming" | "pending";
  title: string;
  description: string;
  actionLabel: string;
  linkTab?: string;
}

export interface ClientTriJourney {
  clientJourney: {
    stage: "Inquiry" | "Client Registration" | "Assessment" | "Service Authorisation" | "Care Received";
    isComplete: boolean;
    note?: string;
  };
  caregiverJourney: {
    stage: "Registration" | "Documents" | "Screening" | "Training" | "Approval" | "Active";
    isComplete: boolean;
    assignedName?: string;
    note?: string;
  };
  agencyJourney: {
    stage: "Intake" | "Coordination" | "Compliance" | "Scheduling" | "Monitoring" | "Billing";
    isComplete: boolean;
    note?: string;
  };
}

export interface ClientRecord {
  id: string; // e.g. CL-1001
  name: string;
  preferredName?: string;
  avatarUrl?: string;
  dob: string;
  age: number;
  gender: string;
  primaryLanguage: string;
  status: ClientStatus;
  careType: CareArrangementType;
  household: ConnectedHouseholdInfo;
  primaryContact: ClientPrimaryContact;
  emergencyContact: ClientEmergencyContact;
  assignedCareTeam: AssignedCareTeam;
  readiness: ClientCareReadiness;
  carePlan: ClientCarePlan;
  authorization: ClientAuthorization;
  documents: ClientDocument[];
  householdMembers: ClientHouseholdMember[];
  activity: ClientActivityLog[];
  attentionItems: ClientAttentionItem[];
  updatedAt: string;
  updatedAtRelative: string;
  convertedFromInquiryId?: string;
}
