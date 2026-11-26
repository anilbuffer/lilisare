export type CareNoteSubmissionStatus = "draft" | "submitted" | "resubmitted";

export type CareNoteReviewStatus =
  | "pending_review"
  | "in_review"
  | "correction_requested"
  | "reviewed"
  | "approved"
  | "escalated";

export type CareNoteQualityStatus =
  | "complete"
  | "incomplete"
  | "missing_required"
  | "review_required"
  | "flagged";

export type CareNoteCorrectionStatus =
  | "not_required"
  | "open"
  | "awaiting_caregiver"
  | "resubmitted"
  | "resolved";

export type CareNotePriority = "low" | "medium" | "high" | "urgent";

export interface CareNoteSection {
  id: string;
  sectionKey: string;
  sectionTitle: string;
  content: string;
  required: boolean;
  completionStatus: "complete" | "incomplete" | "missing";
  validationMessages?: string[];
  aiDrafted?: boolean;
  aiSuggestions?: string[];
}

export interface CareNoteVersion {
  id: string;
  noteId: string;
  versionNumber: number;
  contentSnapshot: CareNoteSection[];
  submittedBy: string;
  submittedByRole: string;
  submittedAt: string;
  changeReason?: string;
  correctionRequestId?: string;
  createdAt: string;
}

export interface CareNoteReview {
  id: string;
  noteId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  reviewStatus: CareNoteReviewStatus;
  reviewNotes?: string;
  reviewedAt: string;
}

export interface CareNoteCorrection {
  id: string;
  noteId: string;
  requestedBy: string;
  requestedByRole: string;
  requestedAt: string;
  reason: string;
  affectedSections: string[];
  caregiverInstructions: string;
  dueDate?: string;
  status: "open" | "awaiting_caregiver" | "resubmitted" | "resolved";
  resubmittedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface CareNoteFlag {
  id: string;
  noteId: string;
  flagType: "clinical" | "compliance" | "billing" | "general";
  flaggedBy: string;
  flaggedAt: string;
  reason: string;
  notes?: string;
  status: "open" | "resolved";
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface CareNoteRule {
  id: string;
  agencyId: string;
  programId: string;
  programName: string;
  serviceCategory: string;
  serviceCode: string;
  requirementName: string;
  requirementDescription: string;
  requirementType: "required" | "conditional" | "not_required";
  requiredSections: string[];
  conditionalRequirements?: string;
  validationInstructions?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: "active" | "pending_review" | "upcoming" | "inactive";
  updatedBy: string;
  updatedAt: string;
}

export interface CareNoteTemplateSection {
  key: string;
  title: string;
  description: string;
  required: boolean;
  placeholder: string;
  guidance?: string;
}

export interface CareNoteTemplate {
  id: string;
  templateName: string;
  description: string;
  programId: string;
  programName: string;
  serviceCategory: string;
  serviceCode: string;
  sections: CareNoteTemplateSection[];
  version: string;
  status: "active" | "draft" | "archived";
  effectiveDate: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface CareNoteAuditEvent {
  id: string;
  timestamp: string;
  noteId: string;
  clientId: string;
  clientName: string;
  caregiverId: string;
  caregiverName: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  user: string;
  role: string;
  reason?: string;
}

export interface CareNoteReviewer {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarInitials: string;
}

export interface CareNote {
  id: string;
  clientId: string;
  clientName: string;
  caregiverId: string;
  caregiverName: string;
  caregiverClassification: string;
  visitId: string;
  serviceId: string;
  serviceType: string;
  serviceCode: string;
  programId: string;
  programName: string;
  agencyId: string;
  agencyName?: string;
  serviceDate: string;
  submittedAt: string | null;
  scheduledTime?: string;
  actualVisitTime?: string;
  evvStatus?: "verified" | "unverified" | "exception" | "manual" | "no_record";
  submissionStatus: CareNoteSubmissionStatus;
  reviewStatus: CareNoteReviewStatus;
  qualityStatus: CareNoteQualityStatus;
  correctionStatus: CareNoteCorrectionStatus;
  priority: CareNotePriority;
  currentVersion: number;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  sections: CareNoteSection[];
  versions: CareNoteVersion[];
  corrections: CareNoteCorrection[];
  flags: CareNoteFlag[];
  reviews: CareNoteReview[];
  isOverdue?: boolean;
  isMissing?: boolean;
  qualityIssues?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CareNotesKpiSummary {
  totalNotes: number;
  submittedCount: number;
  pendingReviewCount: number;
  needsCorrectionCount: number;
  overdueMissingCount: number;
  reviewedApprovedCount: number;
  highPriorityCount: number;
  assignedToMeCount: number;
  unassignedCount: number;
  clinicalEscalatedCount: number;
  complianceFlaggedCount: number;
}
