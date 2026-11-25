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
