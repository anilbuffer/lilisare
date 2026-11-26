export type RequirementStatus =
  | "Active"
  | "Pending Assignment"
  | "Scheduled"
  | "Due Soon"
  | "Overdue"
  | "Completed"
  | "On Hold"
  | "Not Required"
  | "Cancelled"
  | "Draft";

export type ClinicalVisitStatus =
  | "Unscheduled"
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Missed"
  | "Cancelled"
  | "Rescheduled";

export type DocumentationStatus =
  | "Not Started"
  | "Pending"
  | "Submitted"
  | "Incomplete"
  | "Correction Requested"
  | "Complete";

export type ClinicalReviewStatus =
  | "Not Required"
  | "Pending Review"
  | "Under Review"
  | "Approved"
  | "Follow-up Required"
  | "Returned for Correction";

export type ClinicalProfessionalType =
  | "RN"
  | "Clinical Supervisor"
  | "Field Supervisor"
  | "Qualified Non-RN Supervisor";

export type VisitDeliveryMethod =
  | "In-home"
  | "Virtual"
  | "Other approved method";

export type ClinicalVisitCategory =
  | "Initial RN Visit"
  | "Recurring RN Visit"
  | "Supervisory Visit"
  | "Annual In-home Visit"
  | "IHSS Required Visit"
  | "Other Configured Visit";

export type RecurrenceType =
  | "None"
  | "Monthly"
  | "Quarterly"
  | "Semi-Annual"
  | "Annual"
  | "Custom Days";

export type PriorityLevel = "Critical" | "High" | "Medium" | "Low";

export interface ClinicalProfessional {
  id: string;
  name: string;
  roleTitle: string;
  qualificationType: ClinicalProfessionalType;
  licenseNumber: string;
  licenseExpiry: string;
  agencies: string[];
  programs: string[];
  canPerformRnVisits: boolean;
  canPerformClinicalSignOff: boolean;
  activeCaseloadCount: number;
  avatarInitials: string;
  email: string;
  phone: string;
  status: "Active" | "On Leave" | "Inactive";
}

export interface ClinicalRuleVersionSnapshot {
  version: string;
  updatedAt: string;
  updatedBy: string;
  changeSummary: string;
  effectiveDate: string;
  professionalType: ClinicalProfessionalType;
  recurrenceType: RecurrenceType;
  recurrenceIntervalDays: number;
  deliveryMethod: VisitDeliveryMethod;
  status: "Active" | "Inactive" | "Draft";
}

export interface ClinicalRule {
  id: string;
  ruleName: string;
  agencyId: string;
  agencyName: string;
  state: string;
  programId: string;
  programName: string;
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  visitCategory: ClinicalVisitCategory;
  visitType: string;
  professionalType: ClinicalProfessionalType;
  eligibleProfessionalTypes: ClinicalProfessionalType[];
  initialVisitRequired: boolean;
  recurrenceType: RecurrenceType;
  recurrenceIntervalDays: number;
  frequencyLabel: string;
  deliveryMethod: VisitDeliveryMethod;
  documentationRequired: boolean;
  reviewRequired: boolean;
  effectiveDate: string;
  endDate?: string;
  status: "Active" | "Inactive" | "Draft";
  version: string;
  confirmationStatus: "Confirmed" | "Pending LiliSare Confirmation";
  internalNotes: string;
  updatedBy: string;
  updatedAt: string;
  versionHistory: ClinicalRuleVersionSnapshot[];
}

export interface ClinicalRequirement {
  id: string;
  requirementName: string;
  clientId: string;
  clientName: string;
  householdId: string;
  householdName: string;
  agencyId: string;
  agencyName: string;
  programId: string;
  programName: string;
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  serviceStartDate: string;
  authorizationId: string;
  ruleId: string;
  ruleName: string;
  ruleVersion: string;
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
  lastCompletedDate: string | null;
  assignedProfessionalId: string | null;
  assignedProfessionalName: string | null;
  internalOwnerId: string;
  internalOwnerName: string;
  priority: PriorityLevel;
  status: RequirementStatus;
  documentationStatus: DocumentationStatus;
  reviewStatus: ClinicalReviewStatus;
  activeVisitId: string;
  internalNotes: string;
  exceptionConfirmed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalVisit {
  id: string;
  requirementId: string;
  clientId: string;
  clientName: string;
  householdId: string;
  householdName: string;
  agencyId: string;
  agencyName: string;
  programName: string;
  serviceName: string;
  serviceCode: string;
  scheduledVisitId: string | null; // Links to RealTimeVisit.id in schedulingStore
  careNoteId?: string | null; // Links to CareNote.id if applicable
  professionalId: string | null;
  professionalName: string | null;
  professionalQualification: ClinicalProfessionalType;
  visitType: string;
  visitCategory: ClinicalVisitCategory;
  dueDate: string;
  scheduledDate: string | null;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  deliveryMethod: VisitDeliveryMethod;
  locationDetails: string;
  visitStatus: ClinicalVisitStatus;
  documentationStatus: DocumentationStatus;
  reviewStatus: ClinicalReviewStatus;
  followUpRequired: boolean;
  priority: PriorityLevel;
  ruleId: string;
  ruleVersion: string;
  daysPendingReview: number;
  lastReminderAt: string | null;
  operationalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalDocumentationSection {
  key: string;
  title: string;
  status: "Complete" | "Missing" | "Incomplete";
  contentReadOnly: string;
}

export interface ClinicalDocumentationAttachment {
  id: string;
  name: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ClinicalDocumentation {
  id: string;
  visitId: string;
  requirementId: string;
  submittedBy: string | null;
  submittedByRole: string | null;
  submittedAt: string | null;
  documentType: string;
  sections: ClinicalDocumentationSection[];
  attachments: ClinicalDocumentationAttachment[];
  completenessStatus: DocumentationStatus;
  missingItems: string[];
  version: number;
  reviewStatus: ClinicalReviewStatus;
  correctionRequestedNote?: string;
}

export interface ClinicalReview {
  id: string;
  visitId: string;
  reviewerId: string | null;
  reviewerName: string | null;
  reviewerRole: string | null;
  reviewStatus: ClinicalReviewStatus;
  reviewedAt: string | null;
  signOffTimestamp: string | null;
  comments: string;
  outstandingIssues: string[];
  followUpRequired: boolean;
}

export interface ClinicalFollowUp {
  id: string;
  visitId: string;
  requirementId: string;
  clientId: string;
  clientName: string;
  assignedToId: string;
  assignedToName: string;
  followUpType:
    | "Missing Documentation"
    | "Overdue Visit"
    | "Unassigned Requirement"
    | "Pending Clinical Sign-Off"
    | "Clinical Escalation"
    | "Rule Exception";
  priority: PriorityLevel;
  description: string;
  internalNotes: string;
  dueDate: string;
  status: "Open" | "In Progress" | "Escalated" | "Completed";
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
  completedBy: string | null;
}

export interface ClinicalAuditEvent {
  id: string;
  entityType:
    | "Requirement"
    | "Visit"
    | "Documentation"
    | "Review"
    | "FollowUp"
    | "Rule"
    | "Schedule"
    | "Notification";
  entityId: string;
  relatedClientId: string;
  relatedClientName: string;
  relatedVisitId: string | null;
  action: string;
  performedBy: string;
  performedByRole: string;
  previousValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
}

export interface ClinicalMockNotification {
  id: string;
  visitId: string;
  requirementId: string;
  clientName: string;
  recipientName: string;
  recipientRole: string;
  channel: "Mock In-App Alert" | "Simulated Reminder Log";
  message: string;
  sentBy: string;
  sentAt: string;
}

export interface ClinicalKpiSummary {
  totalActiveRequirements: number;
  upcomingVisits: number;
  dueThisMonth: number;
  overdueVisits: number;
  pendingDocumentation: number;
  pendingClinicalReview: number;
  unassignedCount: number;
  followUpRequiredCount: number;
}
