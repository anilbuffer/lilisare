export type EvvVisitStatus = "Scheduled" | "In Progress" | "Completed" | "Missed" | "Cancelled";

export type EvvVerificationStatus =
  | "Pending"
  | "Verified"
  | "Exception"
  | "Under Review"
  | "Correction Required";

export type EvvExceptionType =
  | "MISSING_CLOCK_IN_OUT"
  | "LATE_OR_EARLY"
  | "LOCATION_VERIFICATION"
  | "SCHEDULE_MISMATCH"
  | "MISSING_VISIT_INFO";

export interface EvvLocationDetail {
  address: string;
  lat: number;
  lng: number;
  accuracyMeters: number;
  withinGeofence: boolean;
  distanceFeet: number;
  timestamp: string;
  method: "Mobile App GPS" | "IVR / Telephony" | "Fixed FOB" | "Manual Entry";
}

export interface EvvSixElements {
  serviceType: { verified: boolean; value: string; notes?: string };
  individualReceiving: { verified: boolean; value: string; notes?: string };
  dateOfService: { verified: boolean; value: string; notes?: string };
  locationOfService: { verified: boolean; value: string; notes?: string };
  individualProviding: { verified: boolean; value: string; notes?: string };
  timeBeginsAndEnds: { verified: boolean; value: string; notes?: string };
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
    | "OVERRIDDEN_WITH_JUSTIFICATION";
  reasonCode?: string;
  reasonDescription?: string;
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

  // Service & Payer info (Single Source of Truth from LILISARE_SERVICES)
  serviceName: string; // "CES Waiver (Children’s Extensive Support)"
  serviceCode: string; // "CES-WVR"
  payerName: string; // "Colorado Medicaid / Health First Colorado"
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

  // Statuses (STRICTLY SEPARATED)
  visitStatus: EvvVisitStatus;
  verificationStatus: EvvVerificationStatus;

  // Exception details (if any)
  exceptionType?: EvvExceptionType;
  exceptionTitle?: string;
  exceptionDescription?: string;
  exceptionDateFlagged?: string;

  // Geofence & Location
  geofenceRadiusFeet: number; // e.g. 250
  clockInLocation?: EvvLocationDetail;
  clockOutLocation?: EvvLocationDetail;

  // Six federal mandatory EVV elements
  sixElements: EvvSixElements;

  // Clinical / Service Delivery
  tasksCompleted: string[];
  careNotes: string;
  clientSignatureCaptured: boolean;
  clientSignatureTimestamp?: string;
  signatureType?: "Digital Signature" | "Voice Attestation" | "Paper Exception Form";

  // Downstream status
  billingReadiness: "Awaiting Verification" | "Ready for Billing" | "Hold (Exception)" | "Exported";
  payrollReadiness: "Awaiting Verification" | "Ready for Payroll" | "Hold (Exception)" | "Batched";

  // History & Audit
  reviewNotes: EvvReviewNote[];
  timeline: EvvTimelineEvent[];

  // Aggregator sync
  aggregator: "Sandata" | "HHAeXchange" | "Colorado State Aggregator";
  aggregatorStatus: "Pending Submission" | "Submitted" | "Accepted" | "Rejected";
  aggregatorSubmissionId?: string;
}

export interface EvvKpiSummary {
  totalVisits: number;
  inProgress: number;
  completed: number;
  exceptions: number;
  scheduled: number;
}
