export type ClientStatus = "Active" | "Hospitalized" | "On Hold" | "Discharged";

export type ClientRiskLevel = "High Risk" | "Medium Risk" | "Low Risk";

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
  type: "status_change" | "caregiver_assigned" | "document_updated" | "authorization" | "note" | "audit" | "call" | "email" | "assessment";
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

export interface ClientAttributeItem {
  id: string;
  name: string;
  description: string;
  options: ("Yes" | "No")[] | ("Yes" | "No" | "Preferred")[];
  selected: "Yes" | "No" | "Preferred";
  category?: "Clinical & Equipment" | "Home Environment" | "Caregiver Qualifications" | "Language & Lifestyle";
}

export interface ClientAttributesRecord {
  items: ClientAttributeItem[];
  tags?: string[];
  notes?: string;
  petInHome?: boolean;
  petDetails?: string;
  smokerInHome?: boolean;
  languagePreferences?: string[];
  caregiverGenderPreference?: "Female" | "Male" | "No Preference";
  mobilityEquipment?: string[];
  specialInstructions?: string;
}

export interface ClientRecord {
  id: string; // e.g. CL-1001
  originReferralId?: string; // e.g. REF-2026-1037
  name: string;
  preferredName?: string;
  avatarUrl?: string;
  dob: string;
  age: number;
  gender: string;
  primaryLanguage: string;
  status: ClientStatus;
  riskLevel?: ClientRiskLevel;
  primaryDiagnosis?: string;
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

  // 17-Domain Extended Enterprise Data Model
  title?: string;
  firstName?: string;
  lastName?: string;
  ssn?: string;
  agencyInfo?: {
    status: string;
    leadCreatedDate?: string;
    initialAssessmentDate?: string;
    conversionDate?: string;
    startDate?: string;
    effectiveEndDate?: string;
    administrator?: string;
    regionCode?: string;
    referredBy?: string;
    medicaidNumber?: string;
    preferredCaregiver?: string;
    adminAlerts?: {
      disableClockInAlert: boolean;
      disableClockOutAlert: boolean;
    };
    invoicingId?: string;
  };
  residentialAddress?: {
    name: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    verified?: boolean;
  };
  billingAddress?: {
    sameAsResidential: boolean;
    name: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
  };
  calendarVisits?: Array<{
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    caregiverName: string;
    caregiverId: string;
    serviceType: string;
    status: "Scheduled" | "In-Progress" | "Completed" | "Missed" | "Cancelled";
    evvVerified: boolean;
  }>;
  schedules?: Array<{
    id: string;
    dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    startTime: string;
    endTime: string;
    hours: number;
    serviceCode: string;
    caregiverName: string;
    caregiverId: string;
    status: "Active" | "Paused";
  }>;
  careNotes?: Array<{
    id: string;
    visitDate: string;
    caregiverName: string;
    caregiverId: string;
    service: string;
    clockIn: string;
    clockOut: string;
    adlsCompleted: string[];
    vitals?: { bp?: string; pulse?: number; temp?: string };
    notes: string;
    supervisorApproval: "Approved" | "Pending Review" | "Needs Attention";
    evvLocationStatus: "Verified GPS" | "Exception" | "Manual Sign-off";
  }>;
  notes?: Array<{
    id: string;
    timestamp: string;
    author: string;
    authorRole: string;
    category: "General" | "Family Communication" | "Coordination" | "Supervisory" | "Billing";
    title: string;
    content: string;
    isPinned?: boolean;
  }>;
  responsibleParties?: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address?: string;
    isPrimaryDecisionMaker: boolean;
    isBillingContact: boolean;
    isEmergencyContact: boolean;
    hipaaAuthorized: boolean;
    notes?: string;
  }>;
  wallet?: {
    balance: number;
    escrowBalance: number;
    monthlySpendCap: number;
    autoPayEnabled: boolean;
    paymentMethod: string;
  };
  transactions?: Array<{
    id: string;
    date: string;
    type: "Claim Payer" | "Private Pay Invoice" | "Wallet Credit" | "Copay Adjustment" | "Disbursement";
    referenceNo: string;
    description: string;
    amount: number;
    status: "Paid" | "Pending" | "Disputed" | "Reconciled";
  }>;
  healthcare?: {
    diagnoses: Array<{ code: string; description: string; type: "Primary" | "Secondary"; onsetDate: string }>;
    medications: Array<{ name: string; dosage: string; frequency: string; route: string; prescriber: string; purpose: string }>;
    allergies: Array<{ allergen: string; reaction: string; severity: "Mild" | "Moderate" | "Severe" }>;
    vitals: Array<{ recordedDate: string; bp: string; pulse: number; respRate: number; temp: string; recordedBy: string }>;
    physicians: Array<{ name: string; specialty: string; clinic: string; phone: string; fax: string }>;
  };
  incidents?: Array<{
    id: string;
    date: string;
    category: "Fall" | "Medication Error" | "Hospitalization" | "Skin Tear / Injury" | "Behavioral Exception";
    severity: "Low" | "Medium" | "High" | "Critical";
    reportedBy: string;
    description: string;
    actionTaken: string;
    stateReported: boolean;
    status: "Closed" | "Under Investigation" | "Review Required";
  }>;
  adls?: Array<{
    category: "ADL" | "IADL";
    name: string;
    level: "Independent" | "Supervision" | "Minimal Assist" | "Moderate Assist" | "Total Dependent";
    frequency: string;
    instructions: string;
  }>;
  planOfCareDetails?: {
    goals: Array<{ goal: string; targetDate: string; progress: "In Progress" | "Achieved" | "Needs Adjustment" }>;
    interventions: string[];
    riskFactors: string[];
    emergencyProtocol: string;
    physicianSignedDate: string;
    nextReviewDate: string;
    rnSupervisor: string;
  };
  attributes?: ClientAttributesRecord;
  forms?: Array<{
    id: string;
    title: string;
    type: "Waiver Assessment" | "Consent & Release" | "Clinical Assessment" | "Family Agreement";
    status: "Completed & Signed" | "Pending Signature" | "Draft" | "Annual Renewal Due";
    lastUpdated: string;
    signedBy?: string;
  }>;
}

// Convenience Type Aliases for 17 Modular Domains
export type CalendarVisit = NonNullable<ClientRecord["calendarVisits"]>[number];
export type ResponsibleParty = NonNullable<ClientRecord["responsibleParties"]>[number];
export type TransactionRecord = NonNullable<ClientRecord["transactions"]>[number];
export type IncidentReport = NonNullable<ClientRecord["incidents"]>[number];
export type AdlAssessmentItem = NonNullable<ClientRecord["adls"]>[number];
export type AssessmentFormItem = NonNullable<ClientRecord["forms"]>[number];
export type DocumentItem = ClientDocument;

