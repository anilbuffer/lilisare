export type VisitStatus =
  | "Unassigned"
  | "Scheduled"
  | "Verified"
  | "In-Progress"
  | "Completed"
  | "Missed"
  | "Standalone";

export type CareNoteStatus = "Completed" | "Pending" | "Missing";

export type ConflictType =
  | "None"
  | "Overlapping Shift"
  | "Overtime Risk"
  | "Auth Hours Exceeded"
  | "Credential Expiring"
  | "Travel Gap";

export type ClockLocationType =
  | "Client Residential Address"
  | "Any profile address"
  | "Same as clock in"
  | "Household Primary Address"
  | "Community Outing (Approved)";

export interface VisitAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  reason?: string;
  details: string;
}

export interface VisitBroadcastRecord {
  id: string;
  sentAt: string;
  sentBy: string;
  caregiverIds: string[];
  caregiverNames: string[];
  channel: "Mobile Push + SMS" | "Mobile App Push" | "SMS Alert";
  urgency: "Standard" | "Urgent";
  message: string;
  status: "Sent" | "Viewed" | "Accepted";
}

export interface RealTimeVisit {
  id: string;
  shiftNumber: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h, e.g. "08:00")
  endTime: string; // HH:mm (24h, e.g. "16:00")
  status: VisitStatus;
  isRemoved?: boolean;
  isModifiedFromSchedule?: boolean;
  modificationReason?: string;

  // Client & Household
  clientId: string;
  clientName: string;
  clientAdmin: string;
  clientClass: string;
  clientRegion: string;
  householdId: string;
  householdName: string;
  address: string;

  // Caregiver
  caregiverId: string | null;
  caregiverName: string | null;
  caregiverAdmin?: string;
  caregiverClass?: string;
  caregiverRegion?: string;

  // Service & Financial
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  unitType: string;
  billRate: number;
  payRate: number;
  billableHours: number;
  payableHours: number;
  scheduledHours: number;
  authorizationNumber: string;
  authorizedWeeklyCap: number;

  // EVV & Clinical
  clockInLocation: ClockLocationType;
  clockOutLocation: ClockLocationType;
  evvStatus: "Verified" | "Pending" | "Exception" | "Not Started";
  clockInActual?: string;
  clockOutActual?: string;
  careNoteStatus: CareNoteStatus;
  careNoteSummary?: string;
  requiredSkills: string[];

  // Logistics & Matching
  travelMinutes: number;
  distanceMiles: number;
  conflicts: ConflictType[];

  // Notes & History
  memo: string;
  internalNotes: string;
  broadcasts: VisitBroadcastRecord[];
  auditTrail: VisitAuditEntry[];

  // Clinical & Supervisory Linkage (distinguishes clinical visits from routine caregiver shifts)
  visitCategory?: "Caregiver Shift" | "Clinical & Supervisory";
  clinicalVisitId?: string;
  clinicalVisitType?: string;
  clinicalDeliveryMethod?: "In-home" | "Virtual" | "Other approved method";

  // Recurring Visit Rules & Special Instructions
  seriesId?: string;
  recurrencePattern?: RecurrencePattern;
  recurrenceWeekdays?: number[]; // 0=Sun..6=Sat
  recurrenceStartDate?: string;
  recurrenceEndDate?: string;
  recurrenceExceptionDates?: string[];
  isSeriesException?: boolean;
  clientInstructions?: string;
  visitInstructions?: string;

  // Split Shifts & Edge Cases
  splitGroupId?: string;
  splitLabel?: string; // e.g. "Split 1 of 2 (Morning)"
  partialCompletion?: boolean;
  partialReason?: string;
  publishedAt?: string;
  evvCaptureMethod?: "GPS" | "Telephony IVR" | "FVV" | "Manual";
  offlineSynced?: boolean;
}

export type RecurrencePattern = "one-time" | "daily" | "weekly" | "custom";
export type RecurringEditScope = "this_visit" | "this_and_future" | "entire_series";

export type CallOutStatus = "Open" | "Candidates Reviewed" | "Assigned" | "Resolved";

export interface CallOutAssignmentHistoryItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  caregiverId?: string | null;
  caregiverName?: string | null;
  details: string;
}

export interface CallOutRecord {
  id: string;
  visitId: string;
  shiftNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  clientId: string;
  clientName: string;
  householdName: string;
  address: string;
  serviceName: string;
  requiredSkills: string[];
  originalCaregiverId: string | null;
  originalCaregiverName: string;
  reportedBy: "Caregiver" | "Agency Staff";
  reportedAt: string;
  reason: string;
  notes?: string;
  status: CallOutStatus;
  replacementCaregiverId?: string | null;
  replacementCaregiverName?: string | null;
  assignedAt?: string;
  assignedBy?: string;
  assignmentHistory: CallOutAssignmentHistoryItem[];
}

export type EvvOperationalAlertType =
  | "On Time"
  | "Potentially Late"
  | "Late Clock-In"
  | "Missing-Start Alert"
  | "Early Departure Review"
  | "Incomplete / Missed Visit"
  | "Verification Pending";

export interface EvvScheduleThresholdRule {
  id: string;
  programName: string;
  lateGraceMinutes: number;
  missingStartAlertMinutes: number;
  earlyDepartureThresholdMinutes: number;
  requireGpsOrIvr: boolean;
}

export interface OperationalEvvEvaluation {
  alertType: EvvOperationalAlertType;
  severity: "ok" | "warning" | "critical" | "info";
  varianceMinutes: number;
  message: string;
  ruleApplied: string;
}

export interface OvertimeRuleConfig {
  id: string;
  employmentType: string;
  weeklyOvertimeThresholdHours: number;
  dailyOvertimeThresholdHours: number;
  warningThresholdPercent: number;
  enabled: boolean;
}

export interface ClientHoursInsight {
  clientId: string;
  clientName: string;
  householdName: string;
  authorizationNumber: string;
  authorizedWeeklyHours: number;
  scheduledWeeklyHours: number;
  completedHours: number;
  varianceHours: number;
  status: "Over Auth" | "Approaching Cap" | "Within Auth";
  visitCount: number;
}

export interface CaregiverOvertimeInsight {
  caregiverId: string;
  caregiverName: string;
  employmentClassification: string;
  scheduledHours: number;
  actualWorkedHours: number;
  weeklyThresholdHours: number;
  overtimeHours: number;
  utilizationPercent: number;
  status: "Overtime" | "Approaching OT" | "Normal";
  visitCount: number;
}

export interface CaregiverMatchScore {
  caregiverId: string;
  caregiverName: string;
  avatarUrl?: string;
  type: string;
  employmentClassification: string;
  status: string;
  isActivated: boolean;
  overallScore: number; // 0 - 100
  availabilityScore: number;
  distanceScore: number;
  skillMatchScore: number;
  distanceMiles: number;
  travelMinutes: number;
  matchedSkills: string[];
  missingSkills: string[];
  scheduledHoursThisWeek: number;
  weeklyCapacityHours: number;
  hasConflict: boolean;
  conflictReason?: string;
  phone: string;
  region: string;
  isHouseholdLinked: boolean;
}

export interface SchedulingGridSettings {
  density: "comfortable" | "compact";
  timeFormat: "12h" | "24h";
  showConflictBadges: boolean;
  showTravelMetrics: boolean;
  highlightToday: boolean;
  showFinancialSummary: boolean;
}
