export type EvvVisitStatus = "Scheduled" | "In Progress" | "Completed" | "Missed" | "Cancelled";

export type EvvVerificationStatus =
  | "Pending"
  | "Verified"
  | "Exception"
  | "Under Review"
  | "Correction Required";

export type EvvAggregatorStatus =
  | "Not Submitted"
  | "Queued"
  | "Submitted"
  | "Accepted"
  | "Rejected"
  | "Acknowledgement Pending"
  | "Retry Required";

export type EvvBillingReadiness =
  | "Not Evaluated"
  | "Blocked"
  | "Ready for Review"
  | "Cleared for Billing";

export type EvvPayrollReadiness =
  | "Not Evaluated"
  | "Blocked"
  | "Ready for Review"
  | "Cleared for Payroll";

export type EvvCaptureMethod =
  | "Mobile GPS"
  | "Telephony / IVR"
  | "Fixed Device"
  | "Manual Entry";

export type EvvExceptionType =
  | "MISSING_CLOCK_IN_OUT"
  | "LATE_OR_EARLY"
  | "LOCATION_VERIFICATION"
  | "SCHEDULE_MISMATCH"
  | "MISSING_VISIT_INFO"
  | "AGGREGATOR_REJECTED"
  | "SERVICE_DISCIPLINE_UNCONFIRMED"
  | "DURATION_MISMATCH";

export interface EvvLocationDetail {
  address: string;
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  withinGeofence: boolean;
  distanceFeet?: number;
  timestamp: string;
  method: EvvCaptureMethod;
  coordinatesAvailable: boolean;
  approvedAddress?: string;
}

export interface EvvPatientVerification {
  signatureCaptured: "Yes" | "No" | "Not applicable" | "Unknown";
  voiceVerificationCaptured: "Yes" | "No" | "Not applicable" | "Unknown";
  patientConfirmedService: "Yes" | "No" | "Not captured";
  patientConfirmedTime: "Yes" | "No" | "Not captured";
  verificationTimestamp?: string;
  signatureType?: "Digital Signature" | "Voice Attestation" | "Paper Exception Form" | "Declined" | "None";
  evidenceRef?: string;
  notes?: string;
}

export interface EvvSixElements {
  serviceType: { verified: boolean; value: string; notes?: string };
  individualReceiving: { verified: boolean; value: string; notes?: string };
  dateOfService: { verified: boolean; value: string; notes?: string };
  locationOfService: { verified: boolean; value: string; notes?: string };
  individualProviding: { verified: boolean; value: string; notes?: string };
  timeBeginsAndEnds: { verified: boolean; value: string; notes?: string };
}

export interface EvvCorrection {
  id: string;
  visitId: string;
  fieldChanged: string;
  originalValue: string;
  correctedValue: string;
  reason: string;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: "Pending Approval" | "Approved" | "Rejected";
}

export interface EvvReviewNote {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  timestamp: string;
  note: string;
  action:
  | "NOTE_ADDED"
  | "INVESTIGATION_STARTED"
  | "CORRECTION_REQUESTED"
  | "EXCEPTION_RESOLVED"
  | "OVERRIDDEN_WITH_JUSTIFICATION"
  | "VARIANCE_APPROVED"
  | "REVIEWER_ASSIGNED";
  reasonCode?: string;
  reasonDescription?: string;
  resolutionCode?: string;
}

export interface EvvTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  event: string;
  details: string;
  badgeType?: "info" | "success" | "warning" | "error";
}

export interface EvvVisitRecord {
  id: string; // e.g. "EVV-2026-001" or "VIS-1001"
  visitNumber: string; // "#401"
  date: string; // "2026-11-25"
  schedulingVisitId?: string; // Linked ID in /admin/scheduling/[id]

  // Client info
  clientId: string; // "CL-1001"
  clientName: string; // "Leo Miller"
  clientPhone: string;
  clientAddress: string;
  clientMedicaidId: string;
  householdId?: string; // "hh-1001"
  householdName?: string; // "Miller Household"

  // Caregiver info
  caregiverId: string; // "CG-102"
  caregiverName: string; // "Sarah Miller"
  caregiverPhone: string;
  caregiverRole: string; // "Family Caregiver (W-2)"
  caregiverClassification: string; // "W-2" | "1099" | "Direct Care Worker"

  // Service & Payer info
  serviceName: string; // "CES Waiver (Children’s Extensive Support)"
  serviceCode: string; // "CES-WVR"
  payerName: string; // "Colorado Medicaid / Health First Colorado"
  program: string; // "HCBS-EBD" or "IHSS" or "CES"
  authorizationNumber: string; // "AUTH-2026-9812"
  authorizedHours: number;
  billRate: number;
  payRate: number;

  // Scheduled details
  scheduledStartTime: string; // "08:00"
  scheduledEndTime: string; // "16:00"
  scheduledDurationHours: number; // 8.0

  // Actual EVV details
  actualClockInTime?: string; // "08:02"
  actualClockOutTime?: string; // "16:01"
  actualDurationHours?: number; // 8.0
  varianceMinutes?: number;
  varianceDisplay?: string; // e.g. "+1m / +2m (Within tol.)"
  varianceStatus?: "Within Tolerance" | "Outside Tolerance" | "On Schedule" | "Missing Events";

  // Capture method
  captureMethod: EvvCaptureMethod;

  // Geofence & Location
  geofenceRadiusFeet: number; // e.g. 250
  clockInLocation?: EvvLocationDetail;
  clockOutLocation?: EvvLocationDetail;
  locationVerificationStatus: "Verified" | "Outside Geofence" | "Accuracy Low" | "Unavailable";

  // Patient Verification Evidence
  patientVerification: EvvPatientVerification;

  // Statuses (STRICTLY SEPARATED)
  visitStatus: EvvVisitStatus;
  verificationStatus: EvvVerificationStatus;
  aggregator?: string;
  aggregatorStatus: EvvAggregatorStatus;
  aggregatorProvider: string;
  aggregatorRejectionReason?: string;
  aggregatorSubmissionId?: string;

  // Downstream readiness
  billingReadiness: EvvBillingReadiness;
  payrollReadiness: EvvPayrollReadiness;

  // Exception details (if any)
  exceptionType?: EvvExceptionType;
  exceptionTitle?: string;
  exceptionDescription?: string;
  exceptionReason?: string; // Exact human-readable reason
  exceptionReasons?: string[]; // All exceptions if multiple
  exceptionDateFlagged?: string;
  assignedReviewer?: string;
  resolutionCode?: string;
  resolutionLabel?: string;
  resolutionNotes?: string;
  resolutionTimestamp?: string;

  // Six federal mandatory EVV elements
  sixElements: EvvSixElements;

  // Clinical / Service Delivery
  tasksCompleted: string[];
  careNotes: string;
  clientSignatureCaptured: boolean;
  clientSignatureTimestamp?: string;
  signatureType?: "Digital Signature" | "Voice Attestation" | "Paper Exception Form" | "Declined";

  // Corrections & Audits
  corrections?: EvvCorrection[];
  reviewNotes: EvvReviewNote[];
  timeline: EvvTimelineEvent[];

  // Display helpers for standardized front lists
  displayId?: string;
  visitStatusBadge?: string;
  timeDisplay?: string;
  timeScheduledDisplay?: string;
  caregiverInitials?: string;
  clientInitials?: string;
  issueBadge?: string;
  complianceStatus?: "Exception" | "Verified" | "Resolved";
  billingStatusBadge?: "Hold" | "Cleared" | "Billed" | "Pending Review";
  payrollStatusBadge?: "Pending Review" | "Approved" | "Hold" | "Processed";
  aggregatorStatusBadge?: "Pending" | "Accepted" | "Not Submitted" | "Rejected" | "Submitted";
}

export interface EvvBatchRecord {
  id: string; // e.g. "SUB-8921"
  aggregator: string; // e.g. "NY HHAeXchange"
  state: string;
  aggregatorName: string;
  timestamp: string; // e.g. "Today, 10:15 AM"
  visitsIncluded: number;
  status: "Accepted" | "Partial Rejection (3)" | "Pending";
  payloadJson?: string;
}

export interface EvvExceptionRecord {
  id: string; // "EXC-101"
  visitId: string;
  serviceDate: string;
  caregiverName: string;
  caregiverId: string;
  clientName: string;
  clientId: string;
  serviceName: string;
  serviceCode: string;
  payerName: string;
  exceptionType: EvvExceptionType;
  reasonCode: string;
  reasonLabel: string;
  resolutionCode?: string;
  resolutionLabel?: string;
  status: "Unresolved" | "Under Review" | "Resolved";
  severity: "High" | "Medium" | "Low";
  detectedAt: string;
  ageDisplay: string;
  assignedReviewer?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface EvvSubmissionRecord {
  id: string; // e.g. "SUB-2026-9810"
  visitId: string;
  clientName: string;
  caregiverName: string;
  serviceName: string;
  serviceDate: string;
  submissionTimestamp: string;
  providerName: string; // e.g. "EVV Aggregator (State Interface)"
  status: EvvAggregatorStatus;
  responseCode?: string;
  responseReason?: string;
  retryCount: number;
  lastAttemptAt: string;
  nextRetryState?: string;
  payloadSummary?: Record<string, string | number | boolean | null>;
  reconciliationStatus: "Reconciled" | "Unreconciled" | "Pending Response";
}

export interface EvvToleranceRule {
  id: string;
  ruleName: string;
  payer: string;
  program: string;
  serviceCode: string;
  serviceName: string;
  clockInToleranceMinutes: number;
  clockOutToleranceMinutes: number;
  earlyArrivalHandling: "Allow" | "Allow within Grace" | "Flag for Review" | "Round to Schedule";
  lateArrivalHandling: "Allow within Grace" | "Require Reason" | "Flag Exception";
  earlyDepartureHandling: "Flag Exception" | "Allow within Grace" | "Require Supervisor Approval";
  lateDepartureHandling: "Allow within Grace" | "Require Overtime Approval" | "Flag Exception";
  reviewRequired: boolean;
  approvalRequired: boolean;
  effectiveDate: string;
  isActive: boolean;
  description?: string;

  // State connector & Payer tolerance rule fields (Screenshot 6)
  stateCode?: string;
  statePayerName?: string;
  aggregatorName?: string;
  timeToleranceMinutes?: number;
  geofenceRadiusFeet?: number;
  gpsRequirement?: "Required" | "Optional" | "Not Applicable";
  signatureRequirement?: "Required" | "Optional" | "Not Applicable";
  voiceRequirement?: "Required" | "Optional" | "Not Applicable";
}

export interface EvvReviewer {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarInitials: string;
}

export interface EvvKpiSummary {
  todaysVisits: number;
  inProgress: number;
  pendingVerification: number;
  exceptions: number;
  clearedForBilling: number;
  aggregatorRejected: number;
  totalVisits: number;
}
