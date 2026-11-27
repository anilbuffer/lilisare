import {
  RealTimeVisit,
  VisitStatus,
  CaregiverMatchScore,
  VisitBroadcastRecord,
  ConflictType,
  RecurrencePattern,
  RecurringEditScope,
  CallOutRecord,
  EvvScheduleThresholdRule,
  OperationalEvvEvaluation,
  OvertimeRuleConfig,
  ClientHoursInsight,
  CaregiverOvertimeInsight,
} from "@/types/scheduling";
import { getClientsFromStorage, INITIAL_CLIENTS } from "@/lib/clients/mockData";
import { getCaregiversFromStorage, INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { getHouseholdsFromStorage, MOCK_HOUSEHOLDS } from "@/lib/households/mockData";
import { LILISARE_SERVICES } from "@/lib/services";
import { ClientRecord } from "@/types/client";
import { CaregiverRecord } from "@/types/caregiver";

export const SCHEDULING_STORAGE_KEY = "lilisare_scheduling_visits_v1";
export const SCHEDULING_SYNC_EVENT = "lilisare_scheduling_sync";

/**
 * Calculate decimal hours between two HH:mm strings (handles overnight shifts)
 */
export function calculateDurationHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) {
    return 0;
  }
  const startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins <= startMins) {
    endMins += 24 * 60;
  }
  return Math.round(((endMins - startMins) / 60) * 100) / 100;
}

/**
 * Format HH:mm (24h) into compact 12h pill format like "8a" or "11:30a" or 24h
 */
export function formatCompactTime(time24: string, format: "12h" | "24h" = "12h"): string {
  if (!time24) return "";
  if (format === "24h") return time24;
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;
  const suffix = h >= 12 ? "p" : "a";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

/**
 * Format duration number into concise readable string, e.g. 7 -> "7h", 4.5 -> "4.5h"
 */
export function formatHoursShort(hours: number): string {
  const rounded = Math.round(hours * 100) / 100;
  return `${rounded}h`;
}

/**
 * Initial Seed Visits anchored to the active week Mon Nov 23, 2026 – Sun Nov 29, 2026
 * plus adjacent week entries so date navigation works seamlessly.
 * Linked directly to real LiliSare clients, caregivers, households, and services.
 */
export const INITIAL_REALTIME_VISITS: RealTimeVisit[] = [
  // CL-1001: Leo Miller (Miller Household, Springfield, OR) - Sarah Miller (CG-102) & Clara Jenkins (CG-107)
  {
    id: "VIS-1001",
    shiftNumber: "#401",
    date: "2026-11-23",
    startTime: "08:00",
    endTime: "16:00",
    status: "Completed",
    isModifiedFromSchedule: false,
    clientId: "CL-1001",
    clientName: "Leo Miller",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1001",
    householdName: "Miller Household",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    caregiverId: "CG-102",
    caregiverName: "Sarah Miller",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Springfield",
    serviceId: "svc-ces-waiver",
    serviceCode: "CES-WVR",
    serviceName: "CES Waiver (Children’s Extensive Support)",
    unitType: "Hourly",
    billRate: 34.0,
    payRate: 22.5,
    billableHours: 8,
    payableHours: 8,
    scheduledHours: 8,
    authorizationNumber: "AUTH-2026-9812",
    authorizedWeeklyCap: 40,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    clockInActual: "08:02",
    clockOutActual: "16:01",
    careNoteStatus: "Completed",
    careNoteSummary: "Sensory regulation exercises and afternoon ADL hygiene completed calmly.",
    requiredSkills: ["Pediatric Care", "Sensory Support", "CPR & First Aid"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Ensure labeled inhaler pouch stays accessible during sensory transition.",
    internalNotes: "Authorized EPSDT family caregiver shift verified via EVV.",
    broadcasts: [],
    auditTrail: [
      {
        id: "aud-1001-1",
        timestamp: "2026-11-23 04:01 PM",
        actor: "Sandata EVV Engine",
        actorRole: "Automated EVV",
        action: "Visit Completed & EVV Verified",
        details: "Clock-in 08:02 AM, Clock-out 04:01 PM inside household geo-fence.",
      },
    ],
  },
  {
    id: "VIS-1002",
    shiftNumber: "#402",
    date: "2026-11-24",
    startTime: "08:00",
    endTime: "16:00",
    status: "Verified",
    isModifiedFromSchedule: false,
    clientId: "CL-1001",
    clientName: "Leo Miller",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1001",
    householdName: "Miller Household",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    caregiverId: "CG-102",
    caregiverName: "Sarah Miller",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Springfield",
    serviceId: "svc-ces-waiver",
    serviceCode: "CES-WVR",
    serviceName: "CES Waiver (Children’s Extensive Support)",
    unitType: "Hourly",
    billRate: 34.0,
    payRate: 22.5,
    billableHours: 8,
    payableHours: 8,
    scheduledHours: 8,
    authorizationNumber: "AUTH-2026-9812",
    authorizedWeeklyCap: 40,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    clockInActual: "08:00",
    clockOutActual: "16:00",
    careNoteStatus: "Completed",
    requiredSkills: ["Pediatric Care", "Sensory Support"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Routine daytime personal care & nutritional meal prep.",
    internalNotes: "Ready for billing batch.",
    broadcasts: [],
    auditTrail: [
      {
        id: "aud-1002-1",
        timestamp: "2026-11-24 04:05 PM",
        actor: "Sarah Miller",
        actorRole: "Family Caregiver",
        action: "EVV Verified",
        details: "Care note signed and submitted.",
      },
    ],
  },
  {
    id: "VIS-1003",
    shiftNumber: "#403",
    date: "2026-11-25",
    startTime: "08:00",
    endTime: "16:00",
    status: "In-Progress",
    isModifiedFromSchedule: false,
    clientId: "CL-1001",
    clientName: "Leo Miller",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1001",
    householdName: "Miller Household",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    caregiverId: "CG-102",
    caregiverName: "Sarah Miller",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Springfield",
    serviceId: "svc-ces-waiver",
    serviceCode: "CES-WVR",
    serviceName: "CES Waiver (Children’s Extensive Support)",
    unitType: "Hourly",
    billRate: 34.0,
    payRate: 22.5,
    billableHours: 8,
    payableHours: 8,
    scheduledHours: 8,
    authorizationNumber: "AUTH-2026-9812",
    authorizedWeeklyCap: 40,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    clockInActual: "08:01",
    careNoteStatus: "Pending",
    requiredSkills: ["Pediatric Care", "Sensory Support"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Active shift in progress.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [
      {
        id: "aud-1003-1",
        timestamp: "2026-11-25 08:01 AM",
        actor: "Sarah Miller",
        actorRole: "Family Caregiver",
        action: "Clocked In via Mobile App",
        details: "GPS verified at 742 Evergreen Terrace.",
      },
    ],
  },
  {
    id: "VIS-1004",
    shiftNumber: "#404",
    date: "2026-11-26",
    startTime: "08:00",
    endTime: "16:00",
    status: "Scheduled",
    isModifiedFromSchedule: false,
    clientId: "CL-1001",
    clientName: "Leo Miller",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1001",
    householdName: "Miller Household",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    caregiverId: "CG-102",
    caregiverName: "Sarah Miller",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Springfield",
    serviceId: "svc-ces-waiver",
    serviceCode: "CES-WVR",
    serviceName: "CES Waiver (Children’s Extensive Support)",
    unitType: "Hourly",
    billRate: 34.0,
    payRate: 22.5,
    billableHours: 8,
    payableHours: 8,
    scheduledHours: 8,
    authorizationNumber: "AUTH-2026-9812",
    authorizedWeeklyCap: 40,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Pediatric Care", "Sensory Support"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Holiday respite routine; follow visual schedule.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1005",
    shiftNumber: "#405",
    date: "2026-11-27",
    startTime: "08:00",
    endTime: "16:00",
    status: "Scheduled",
    isModifiedFromSchedule: false,
    clientId: "CL-1001",
    clientName: "Leo Miller",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1001",
    householdName: "Miller Household",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    caregiverId: "CG-107",
    caregiverName: "Clara Jenkins",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Backup Caregiver (1099)",
    caregiverRegion: "Springfield",
    serviceId: "svc-family-caregiver",
    serviceCode: "S5125",
    serviceName: "Family Caregiver",
    unitType: "Hourly",
    billRate: 28.5,
    payRate: 19.5,
    billableHours: 8,
    payableHours: 8,
    scheduledHours: 8,
    authorizationNumber: "AUTH-2026-9812",
    authorizedWeeklyCap: 40,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Pediatric Care", "CPR & First Aid"],
    travelMinutes: 12,
    distanceMiles: 4.1,
    conflicts: [],
    memo: "Approved grandmother backup respite coverage.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },

  // CL-1002: Marcus Whitfield (Whitfield Household, Cedar Falls, IA)
  {
    id: "VIS-1006",
    shiftNumber: "#406",
    date: "2026-11-23",
    startTime: "09:00",
    endTime: "15:00",
    status: "Completed",
    isModifiedFromSchedule: false,
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    clientAdmin: "Rachel Green, LSW",
    clientClass: "Adult EBD",
    clientRegion: "Cedar Falls",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    address: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    caregiverId: "CG-108",
    caregiverName: "Elena Whitfield",
    caregiverAdmin: "Rachel Green, LSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Cedar Falls",
    serviceId: "svc-ebd-waiver",
    serviceCode: "EBD-WVR",
    serviceName: "EBD Waiver (Elderly, Blind, and Disabled)",
    unitType: "Hourly",
    billRate: 30.0,
    payRate: 20.0,
    billableHours: 6,
    payableHours: 6,
    scheduledHours: 6,
    authorizationNumber: "AUTH-2026-7714",
    authorizedWeeklyCap: 32,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    clockInActual: "09:00",
    clockOutActual: "15:04",
    careNoteStatus: "Completed",
    requiredSkills: ["Mobility Assistance", "Dementia Care"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Walker ambulation and afternoon vitals log.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1007",
    shiftNumber: "#407",
    date: "2026-11-24",
    startTime: "09:00",
    endTime: "15:00",
    status: "Missed",
    isModifiedFromSchedule: true,
    modificationReason: "Caregiver Late / Missed Clock-In",
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    clientAdmin: "Rachel Green, LSW",
    clientClass: "Adult EBD",
    clientRegion: "Cedar Falls",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    address: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    caregiverId: "CG-108",
    caregiverName: "Elena Whitfield",
    caregiverAdmin: "Rachel Green, LSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Cedar Falls",
    serviceId: "svc-ebd-waiver",
    serviceCode: "EBD-WVR",
    serviceName: "EBD Waiver (Elderly, Blind, and Disabled)",
    unitType: "Hourly",
    billRate: 30.0,
    payRate: 20.0,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: 6,
    authorizationNumber: "AUTH-2026-7714",
    authorizedWeeklyCap: 32,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Exception",
    careNoteStatus: "Missing",
    requiredSkills: ["Mobility Assistance", "Dementia Care"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: ["Credential Expiring"],
    memo: "Follow-up call scheduled with Elena Whitfield regarding missed EVV clock-in.",
    internalNotes: "Annual training refresher due in 15 days.",
    broadcasts: [],
    auditTrail: [
      {
        id: "aud-1007-1",
        timestamp: "2026-11-24 09:30 AM",
        actor: "EVV Alert Monitor",
        actorRole: "System",
        action: "Marked Missed Visit",
        reason: "No EVV clock-in within 30 minutes of scheduled start",
        details: "Flagged for coordinator follow-up.",
      },
    ],
  },
  {
    id: "VIS-1008",
    shiftNumber: "#408",
    date: "2026-11-25",
    startTime: "09:00",
    endTime: "15:00",
    status: "Unassigned",
    isModifiedFromSchedule: true,
    modificationReason: "Last Minute Coverage Needed",
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    clientAdmin: "Rachel Green, LSW",
    clientClass: "Adult EBD",
    clientRegion: "Cedar Falls",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    address: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    caregiverId: null,
    caregiverName: null,
    serviceId: "svc-cna",
    serviceCode: "T1019",
    serviceName: "CNA (Certified Nurse Aide)",
    unitType: "Hourly",
    billRate: 36.0,
    payRate: 23.5,
    billableHours: 6,
    payableHours: 6,
    scheduledHours: 6,
    authorizationNumber: "AUTH-2026-7714",
    authorizedWeeklyCap: 32,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["CNA", "Mobility Assistance", "Dementia Care"],
    travelMinutes: 18,
    distanceMiles: 6.4,
    conflicts: [],
    memo: "Urgent relief CNA needed while family caregiver completes annual training.",
    internalNotes: "High priority open visit.",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1009",
    shiftNumber: "#409",
    date: "2026-11-26",
    startTime: "09:00",
    endTime: "15:00",
    status: "Scheduled",
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    clientAdmin: "Rachel Green, LSW",
    clientClass: "Adult EBD",
    clientRegion: "Cedar Falls",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    address: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    caregiverId: "CG-108",
    caregiverName: "Elena Whitfield",
    caregiverAdmin: "Rachel Green, LSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Cedar Falls",
    serviceId: "svc-ebd-waiver",
    serviceCode: "EBD-WVR",
    serviceName: "EBD Waiver (Elderly, Blind, and Disabled)",
    unitType: "Hourly",
    billRate: 30.0,
    payRate: 20.0,
    billableHours: 6,
    payableHours: 6,
    scheduledHours: 6,
    authorizationNumber: "AUTH-2026-7714",
    authorizedWeeklyCap: 32,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Mobility Assistance"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Standard daily ADL care.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1010",
    shiftNumber: "#410",
    date: "2026-11-27",
    startTime: "09:00",
    endTime: "15:00",
    status: "Scheduled",
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    clientAdmin: "Rachel Green, LSW",
    clientClass: "Adult EBD",
    clientRegion: "Cedar Falls",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    address: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    caregiverId: "CG-108",
    caregiverName: "Elena Whitfield",
    caregiverAdmin: "Rachel Green, LSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Cedar Falls",
    serviceId: "svc-ebd-waiver",
    serviceCode: "EBD-WVR",
    serviceName: "EBD Waiver (Elderly, Blind, and Disabled)",
    unitType: "Hourly",
    billRate: 30.0,
    payRate: 20.0,
    billableHours: 6,
    payableHours: 6,
    scheduledHours: 6,
    authorizationNumber: "AUTH-2026-7714",
    authorizedWeeklyCap: 32,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Mobility Assistance"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Friday morning personal care.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },

  // CL-1010: Thomas Callahan (Callahan Household, Murfreesboro / Brentwood) - matches Johnny Cash reference card style!
  {
    id: "VIS-1011",
    shiftNumber: "#411",
    date: "2026-11-23",
    startTime: "04:00",
    endTime: "11:00",
    status: "Unassigned",
    isModifiedFromSchedule: true,
    modificationReason: "Last Minute Coverage by CG",
    clientId: "CL-1010",
    clientName: "Thomas Callahan",
    clientAdmin: "Will Martin",
    clientClass: "Family Care",
    clientRegion: "Brentwood",
    householdId: "hh-1010",
    householdName: "Callahan Household",
    address: "913 Proprietors Pl, Murfreesboro, TN 37128",
    caregiverId: null,
    caregiverName: null,
    serviceId: "svc-family-caregiver",
    serviceCode: "S5125",
    serviceName: "Family Caregiver",
    unitType: "Hourly",
    billRate: 75.0,
    payRate: 24.5,
    billableHours: 7,
    payableHours: 7,
    scheduledHours: 7,
    authorizationNumber: "AUTH-2026-9331",
    authorizedWeeklyCap: 28,
    clockInLocation: "Any profile address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Missing",
    requiredSkills: ["Personal Care", "Catheter Care", "CPR & First Aid"],
    travelMinutes: 30,
    distanceMiles: 14.2,
    conflicts: [],
    memo: "Early morning catheter check and personal care support.",
    internalNotes: "Client prefers Spanish or English-speaking CNA with catheter experience.",
    broadcasts: [],
    auditTrail: [
      {
        id: "aud-1011-1",
        timestamp: "2026-11-22 06:40 PM",
        actor: "Will Martin",
        actorRole: "Agency Administrator",
        action: "Visit Unassigned",
        reason: "Last Minute Coverage by CG",
        details: "Previous caregiver reported emergency absence; opened for broadcast.",
      },
    ],
  },
  {
    id: "VIS-1012",
    shiftNumber: "#412",
    date: "2026-11-25",
    startTime: "04:00",
    endTime: "11:00",
    status: "Unassigned",
    isModifiedFromSchedule: true,
    modificationReason: "Last Minute Coverage by CG",
    clientId: "CL-1010",
    clientName: "Thomas Callahan",
    clientAdmin: "Will Martin",
    clientClass: "Family Care",
    clientRegion: "Brentwood",
    householdId: "hh-1010",
    householdName: "Callahan Household",
    address: "913 Proprietors Pl, Murfreesboro, TN 37128",
    caregiverId: null,
    caregiverName: null,
    serviceId: "svc-family-caregiver",
    serviceCode: "S5125",
    serviceName: "Family Caregiver",
    unitType: "Hourly",
    billRate: 75.0,
    payRate: 24.5,
    billableHours: 7,
    payableHours: 7,
    scheduledHours: 7,
    authorizationNumber: "AUTH-2026-9331",
    authorizedWeeklyCap: 28,
    clockInLocation: "Any profile address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Personal Care", "Catheter Care", "CPR & First Aid"],
    travelMinutes: 30,
    distanceMiles: 16.9,
    conflicts: [],
    memo: "Morning personal care, breakfast prep, and mobility standby.",
    internalNotes: "Eligible for Recommend + Send to Caregivers broadcast.",
    broadcasts: [],
    auditTrail: [
      {
        id: "aud-1012-1",
        timestamp: "2026-11-25 05:15 AM",
        actor: "Agency Scheduler",
        actorRole: "Operations",
        action: "Visit Modified",
        reason: "Last Minute Coverage by CG",
        details: "Shift flagged for immediate caregiver matching.",
      },
    ],
  },

  // CL-1003: Sophia Bennett (Bennett Household)
  {
    id: "VIS-1013",
    shiftNumber: "#413",
    date: "2026-11-23",
    startTime: "10:00",
    endTime: "14:00",
    status: "Completed",
    clientId: "CL-1003",
    clientName: "Sophia Bennett",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1003",
    householdName: "Bennett Household",
    address: "892 Sunset Boulevard, Des Moines, IA 50309",
    caregiverId: "CG-115",
    caregiverName: "David Bennett",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Springfield",
    serviceId: "svc-ihss",
    serviceCode: "S5130",
    serviceName: "IHSS (In-Home Support Services)",
    unitType: "Hourly",
    billRate: 31.5,
    payRate: 21.0,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-6620",
    authorizedWeeklyCap: 24,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    clockInActual: "10:00",
    clockOutActual: "14:02",
    careNoteStatus: "Completed",
    requiredSkills: ["Pediatric Care", "ADL Support"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Afternoon therapy support.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1014",
    shiftNumber: "#414",
    date: "2026-11-24",
    startTime: "10:00",
    endTime: "14:00",
    status: "Missed",
    isModifiedFromSchedule: true,
    modificationReason: "Client Therapy Rescheduled",
    clientId: "CL-1003",
    clientName: "Sophia Bennett",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1003",
    householdName: "Bennett Household",
    address: "892 Sunset Boulevard, Des Moines, IA 50309",
    caregiverId: "CG-115",
    caregiverName: "David Bennett",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Springfield",
    serviceId: "svc-ihss",
    serviceCode: "S5130",
    serviceName: "IHSS (In-Home Support Services)",
    unitType: "Hourly",
    billRate: 31.5,
    payRate: 21.0,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-6620",
    authorizedWeeklyCap: 24,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Exception",
    careNoteStatus: "Missing",
    requiredSkills: ["Pediatric Care"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Reschedule makeup visit on Saturday.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1015",
    shiftNumber: "#415",
    date: "2026-11-25",
    startTime: "10:00",
    endTime: "14:00",
    status: "Scheduled",
    clientId: "CL-1003",
    clientName: "Sophia Bennett",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1003",
    householdName: "Bennett Household",
    address: "892 Sunset Boulevard, Des Moines, IA 50309",
    caregiverId: "CG-115",
    caregiverName: "David Bennett",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Springfield",
    serviceId: "svc-ihss",
    serviceCode: "S5130",
    serviceName: "IHSS (In-Home Support Services)",
    unitType: "Hourly",
    billRate: 31.5,
    payRate: 21.0,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-6620",
    authorizedWeeklyCap: 24,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Pediatric Care"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Daily IHSS personal support.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1016",
    shiftNumber: "#416",
    date: "2026-11-27",
    startTime: "10:00",
    endTime: "14:00",
    status: "Scheduled",
    clientId: "CL-1003",
    clientName: "Sophia Bennett",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1003",
    householdName: "Bennett Household",
    address: "892 Sunset Boulevard, Des Moines, IA 50309",
    caregiverId: "CG-115",
    caregiverName: "David Bennett",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Springfield",
    serviceId: "svc-ihss",
    serviceCode: "S5130",
    serviceName: "IHSS (In-Home Support Services)",
    unitType: "Hourly",
    billRate: 31.5,
    payRate: 21.0,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-6620",
    authorizedWeeklyCap: 24,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Pediatric Care"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Standard afternoon IHSS visit.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },

  // CL-1004: Jackson Vance (Vance Household)
  {
    id: "VIS-1017",
    shiftNumber: "#417",
    date: "2026-11-23",
    startTime: "07:00",
    endTime: "13:00",
    status: "Verified",
    clientId: "CL-1004",
    clientName: "Jackson Vance",
    clientAdmin: "Evelyn Vance, RN",
    clientClass: "Skilled PDN",
    clientRegion: "North Metro",
    householdId: "hh-1004",
    householdName: "Vance Household",
    address: "418 Pinehurst Dr, North Metro, OR 97209",
    caregiverId: "CG-104",
    caregiverName: "Elena Vance",
    caregiverAdmin: "Evelyn Vance, RN",
    caregiverClass: "Skilled RN/CNA",
    caregiverRegion: "North Metro",
    serviceId: "svc-pdn",
    serviceCode: "T1000",
    serviceName: "PDN (Private Duty Nursing)",
    unitType: "Hourly",
    billRate: 88.0,
    payRate: 58.0,
    billableHours: 6,
    payableHours: 6,
    scheduledHours: 6,
    authorizationNumber: "AUTH-2026-5501",
    authorizedWeeklyCap: 36,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    clockInActual: "07:00",
    clockOutActual: "13:00",
    careNoteStatus: "Completed",
    requiredSkills: ["Skilled Nursing", "PDN", "G-Tube / Airway"],
    travelMinutes: 14,
    distanceMiles: 5.2,
    conflicts: [],
    memo: "Skilled tracheostomy & feeding tube protocol.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1018",
    shiftNumber: "#418",
    date: "2026-11-24",
    startTime: "07:00",
    endTime: "13:00",
    status: "Completed",
    clientId: "CL-1004",
    clientName: "Jackson Vance",
    clientAdmin: "Evelyn Vance, RN",
    clientClass: "Skilled PDN",
    clientRegion: "North Metro",
    householdId: "hh-1004",
    householdName: "Vance Household",
    address: "418 Pinehurst Dr, North Metro, OR 97209",
    caregiverId: "CG-104",
    caregiverName: "Elena Vance",
    caregiverAdmin: "Evelyn Vance, RN",
    caregiverClass: "Skilled RN/CNA",
    caregiverRegion: "North Metro",
    serviceId: "svc-pdn",
    serviceCode: "T1000",
    serviceName: "PDN (Private Duty Nursing)",
    unitType: "Hourly",
    billRate: 88.0,
    payRate: 58.0,
    billableHours: 6,
    payableHours: 6,
    scheduledHours: 6,
    authorizationNumber: "AUTH-2026-5501",
    authorizedWeeklyCap: 36,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    clockInActual: "06:58",
    clockOutActual: "13:02",
    careNoteStatus: "Completed",
    requiredSkills: ["Skilled Nursing", "PDN"],
    travelMinutes: 14,
    distanceMiles: 5.2,
    conflicts: [],
    memo: "Morning skilled nursing vitals and medication administration.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1019",
    shiftNumber: "#419",
    date: "2026-11-25",
    startTime: "14:00",
    endTime: "18:00",
    status: "Standalone",
    isModifiedFromSchedule: false,
    clientId: "CL-1004",
    clientName: "Jackson Vance",
    clientAdmin: "Evelyn Vance, RN",
    clientClass: "Skilled PDN",
    clientRegion: "North Metro",
    householdId: "hh-1004",
    householdName: "Vance Household",
    address: "418 Pinehurst Dr, North Metro, OR 97209",
    caregiverId: "CG-103",
    caregiverName: "Marcus Chen",
    caregiverAdmin: "Evelyn Vance, RN",
    caregiverClass: "CNA / Field Aide",
    caregiverRegion: "North Metro",
    serviceId: "svc-home-care-assessment",
    serviceCode: "T1001",
    serviceName: "Home Care Assessment",
    unitType: "Per Assessment",
    billRate: 37.5,
    payRate: 24.5,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-5501",
    authorizedWeeklyCap: 36,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    careNoteStatus: "Pending",
    requiredSkills: ["CNA", "Assessment Support"],
    travelMinutes: 19,
    distanceMiles: 7.8,
    conflicts: [],
    memo: "Standalone quarterly equipment & safety re-evaluation support.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1020",
    shiftNumber: "#420",
    date: "2026-11-28",
    startTime: "08:00",
    endTime: "14:00",
    status: "Unassigned",
    isModifiedFromSchedule: true,
    modificationReason: "Weekend Respite Gap",
    clientId: "CL-1004",
    clientName: "Jackson Vance",
    clientAdmin: "Evelyn Vance, RN",
    clientClass: "Skilled PDN",
    clientRegion: "North Metro",
    householdId: "hh-1004",
    householdName: "Vance Household",
    address: "418 Pinehurst Dr, North Metro, OR 97209",
    caregiverId: null,
    caregiverName: null,
    serviceId: "svc-cna",
    serviceCode: "T1019",
    serviceName: "CNA (Certified Nurse Aide)",
    unitType: "Hourly",
    billRate: 36.0,
    payRate: 23.5,
    billableHours: 6,
    payableHours: 6,
    scheduledHours: 6,
    authorizationNumber: "AUTH-2026-5501",
    authorizedWeeklyCap: 36,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["CNA", "Patient Transfers", "CPR & First Aid"],
    travelMinutes: 15,
    distanceMiles: 5.5,
    conflicts: [],
    memo: "Saturday morning skilled aide coverage.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },

  // CL-1005: Hannah Morales (Morales Household)
  {
    id: "VIS-1021",
    shiftNumber: "#421",
    date: "2026-11-23",
    startTime: "15:00",
    endTime: "19:00",
    status: "Missed",
    isModifiedFromSchedule: true,
    modificationReason: "Late Arrival Beyond 30m Window",
    clientId: "CL-1005",
    clientName: "Hannah Morales",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Eugene",
    householdId: "hh-1005",
    householdName: "Morales Household",
    address: "312 Oak Meadow Ln, Eugene, OR 97401",
    caregiverId: "CG-120",
    caregiverName: "Sofia Morales",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Eugene",
    serviceId: "svc-chcbs-waiver",
    serviceCode: "CHCBS-WVR",
    serviceName: "CHCBS Waiver (Children’s Home and Community-Based Services)",
    unitType: "Hourly",
    billRate: 35.0,
    payRate: 23.0,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-3410",
    authorizedWeeklyCap: 25,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Exception",
    careNoteStatus: "Missing",
    requiredSkills: ["Pediatric Care", "Bilingual Spanish"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "After-school sensory transition care.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1022",
    shiftNumber: "#422",
    date: "2026-11-24",
    startTime: "15:00",
    endTime: "19:00",
    status: "Scheduled",
    clientId: "CL-1005",
    clientName: "Hannah Morales",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Eugene",
    householdId: "hh-1005",
    householdName: "Morales Household",
    address: "312 Oak Meadow Ln, Eugene, OR 97401",
    caregiverId: "CG-120",
    caregiverName: "Sofia Morales",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Eugene",
    serviceId: "svc-chcbs-waiver",
    serviceCode: "CHCBS-WVR",
    serviceName: "CHCBS Waiver (Children’s Home and Community-Based Services)",
    unitType: "Hourly",
    billRate: 35.0,
    payRate: 23.0,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-3410",
    authorizedWeeklyCap: 25,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    careNoteStatus: "Completed",
    requiredSkills: ["Pediatric Care", "Bilingual Spanish"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Afternoon ADL and meal setup.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1023",
    shiftNumber: "#423",
    date: "2026-11-25",
    startTime: "15:00",
    endTime: "19:00",
    status: "Scheduled",
    clientId: "CL-1005",
    clientName: "Hannah Morales",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Eugene",
    householdId: "hh-1005",
    householdName: "Morales Household",
    address: "312 Oak Meadow Ln, Eugene, OR 97401",
    caregiverId: "CG-120",
    caregiverName: "Sofia Morales",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Eugene",
    serviceId: "svc-chcbs-waiver",
    serviceCode: "CHCBS-WVR",
    serviceName: "CHCBS Waiver (Children’s Home and Community-Based Services)",
    unitType: "Hourly",
    billRate: 35.0,
    payRate: 23.0,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-3410",
    authorizedWeeklyCap: 25,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Pediatric Care", "Bilingual Spanish"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "After-school community integration.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1024",
    shiftNumber: "#424",
    date: "2026-11-29",
    startTime: "11:00",
    endTime: "15:00",
    status: "Unassigned",
    isModifiedFromSchedule: true,
    modificationReason: "Sunday Coverage Requested",
    clientId: "CL-1005",
    clientName: "Hannah Morales",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Eugene",
    householdId: "hh-1005",
    householdName: "Morales Household",
    address: "312 Oak Meadow Ln, Eugene, OR 97401",
    caregiverId: null,
    caregiverName: null,
    serviceId: "svc-wego-events",
    serviceCode: "WEGO-COMM",
    serviceName: "WeGo Community Events",
    unitType: "Hourly",
    billRate: 25.0,
    payRate: 18.0,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-3410",
    authorizedWeeklyCap: 25,
    clockInLocation: "Community Outing (Approved)",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Pediatric Care", "Community Outings"],
    travelMinutes: 20,
    distanceMiles: 8.5,
    conflicts: [],
    memo: "Adaptive weekend community outing.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },

  // CL-1006: Lucas Bennett (Bennett Household)
  {
    id: "VIS-1025",
    shiftNumber: "#425",
    date: "2026-11-23",
    startTime: "09:00",
    endTime: "14:00",
    status: "Completed",
    clientId: "CL-1006",
    clientName: "Lucas Bennett",
    clientAdmin: "Sarah Jenkins",
    clientClass: "Adult DD",
    clientRegion: "North Metro",
    householdId: "hh-1006",
    householdName: "Bennett Household",
    address: "552 Riverbend Way, North Metro, OR 97214",
    caregiverId: "CG-122",
    caregiverName: "Rachel Bennett",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "North Metro",
    serviceId: "svc-dd-waiver",
    serviceCode: "DD-WVR",
    serviceName: "DD Waiver (Developmental Disabilities)",
    unitType: "Hourly",
    billRate: 36.0,
    payRate: 24.0,
    billableHours: 5,
    payableHours: 5,
    scheduledHours: 5,
    authorizationNumber: "AUTH-2026-4418",
    authorizedWeeklyCap: 30,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    clockInActual: "09:00",
    clockOutActual: "14:00",
    careNoteStatus: "Completed",
    requiredSkills: ["Behavioral Support", "ADL Support"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Daily life skills coaching.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1026",
    shiftNumber: "#426",
    date: "2026-11-24",
    startTime: "09:00",
    endTime: "14:00",
    status: "Scheduled",
    clientId: "CL-1006",
    clientName: "Lucas Bennett",
    clientAdmin: "Sarah Jenkins",
    clientClass: "Adult DD",
    clientRegion: "North Metro",
    householdId: "hh-1006",
    householdName: "Bennett Household",
    address: "552 Riverbend Way, North Metro, OR 97214",
    caregiverId: "CG-122",
    caregiverName: "Rachel Bennett",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "North Metro",
    serviceId: "svc-dd-waiver",
    serviceCode: "DD-WVR",
    serviceName: "DD Waiver (Developmental Disabilities)",
    unitType: "Hourly",
    billRate: 36.0,
    payRate: 24.0,
    billableHours: 5,
    payableHours: 5,
    scheduledHours: 5,
    authorizationNumber: "AUTH-2026-4418",
    authorizedWeeklyCap: 30,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    careNoteStatus: "Completed",
    requiredSkills: ["Behavioral Support"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Standard habilitation shift.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1027",
    shiftNumber: "#427",
    date: "2026-11-25",
    startTime: "09:00",
    endTime: "14:00",
    status: "In-Progress",
    clientId: "CL-1006",
    clientName: "Lucas Bennett",
    clientAdmin: "Sarah Jenkins",
    clientClass: "Adult DD",
    clientRegion: "North Metro",
    householdId: "hh-1006",
    householdName: "Bennett Household",
    address: "552 Riverbend Way, North Metro, OR 97214",
    caregiverId: "CG-122",
    caregiverName: "Rachel Bennett",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "North Metro",
    serviceId: "svc-dd-waiver",
    serviceCode: "DD-WVR",
    serviceName: "DD Waiver (Developmental Disabilities)",
    unitType: "Hourly",
    billRate: 36.0,
    payRate: 24.0,
    billableHours: 5,
    payableHours: 5,
    scheduledHours: 5,
    authorizationNumber: "AUTH-2026-4418",
    authorizedWeeklyCap: 30,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    clockInActual: "09:02",
    careNoteStatus: "Pending",
    requiredSkills: ["Behavioral Support"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Shift currently active.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1028",
    shiftNumber: "#428",
    date: "2026-11-26",
    startTime: "09:00",
    endTime: "14:00",
    status: "Scheduled",
    clientId: "CL-1006",
    clientName: "Lucas Bennett",
    clientAdmin: "Sarah Jenkins",
    clientClass: "Adult DD",
    clientRegion: "North Metro",
    householdId: "hh-1006",
    householdName: "Bennett Household",
    address: "552 Riverbend Way, North Metro, OR 97214",
    caregiverId: "CG-122",
    caregiverName: "Rachel Bennett",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "North Metro",
    serviceId: "svc-dd-waiver",
    serviceCode: "DD-WVR",
    serviceName: "DD Waiver (Developmental Disabilities)",
    unitType: "Hourly",
    billRate: 36.0,
    payRate: 24.0,
    billableHours: 5,
    payableHours: 5,
    scheduledHours: 5,
    authorizationNumber: "AUTH-2026-4418",
    authorizedWeeklyCap: 30,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Behavioral Support"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },

  // CL-1007: Raymond Chen (Chen Household)
  {
    id: "VIS-1029",
    shiftNumber: "#429",
    date: "2026-11-23",
    startTime: "13:00",
    endTime: "17:00",
    status: "Scheduled",
    clientId: "CL-1007",
    clientName: "Raymond Chen",
    clientAdmin: "Will Martin",
    clientClass: "Adult EBD",
    clientRegion: "North Metro",
    householdId: "hh-1007",
    householdName: "Chen Household",
    address: "810 Alderbrook Ct, North Metro, OR 97210",
    caregiverId: "CG-130",
    caregiverName: "David Chen",
    caregiverAdmin: "Will Martin",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "North Metro",
    serviceId: "svc-sls-waiver",
    serviceCode: "SLS-WVR",
    serviceName: "SLS Waiver (Supported Living Services)",
    unitType: "Hourly",
    billRate: 32.0,
    payRate: 21.5,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-2291",
    authorizedWeeklyCap: 20,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    careNoteStatus: "Completed",
    requiredSkills: ["ADL Support", "Medication Prompting"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Afternoon hydration & physical therapy exercises.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1030",
    shiftNumber: "#430",
    date: "2026-11-25",
    startTime: "13:00",
    endTime: "17:00",
    status: "Scheduled",
    clientId: "CL-1007",
    clientName: "Raymond Chen",
    clientAdmin: "Will Martin",
    clientClass: "Adult EBD",
    clientRegion: "North Metro",
    householdId: "hh-1007",
    householdName: "Chen Household",
    address: "810 Alderbrook Ct, North Metro, OR 97210",
    caregiverId: "CG-105",
    caregiverName: "Devontae Washington",
    caregiverAdmin: "Will Martin",
    caregiverClass: "CNA / Field Aide",
    caregiverRegion: "North Metro",
    serviceId: "svc-cna",
    serviceCode: "T1019",
    serviceName: "CNA (Certified Nurse Aide)",
    unitType: "Hourly",
    billRate: 36.0,
    payRate: 23.5,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-2291",
    authorizedWeeklyCap: 20,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["CNA", "Medication Prompting"],
    travelMinutes: 16,
    distanceMiles: 4.8,
    conflicts: [],
    memo: "CNA relief shift.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1031",
    shiftNumber: "#431",
    date: "2026-11-27",
    startTime: "13:00",
    endTime: "17:00",
    status: "Unassigned",
    isModifiedFromSchedule: true,
    modificationReason: "Caregiver Requested Swap",
    clientId: "CL-1007",
    clientName: "Raymond Chen",
    clientAdmin: "Will Martin",
    clientClass: "Adult EBD",
    clientRegion: "North Metro",
    householdId: "hh-1007",
    householdName: "Chen Household",
    address: "810 Alderbrook Ct, North Metro, OR 97210",
    caregiverId: null,
    caregiverName: null,
    serviceId: "svc-sls-waiver",
    serviceCode: "SLS-WVR",
    serviceName: "SLS Waiver (Supported Living Services)",
    unitType: "Hourly",
    billRate: 32.0,
    payRate: 21.5,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-2291",
    authorizedWeeklyCap: 20,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["ADL Support", "Medication Prompting"],
    travelMinutes: 12,
    distanceMiles: 3.9,
    conflicts: [],
    memo: "Friday afternoon coverage needed.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },

  // CL-1009: Robert Davis (Davis Household, Dunwoody, GA)
  {
    id: "VIS-1032",
    shiftNumber: "#432",
    date: "2026-11-23",
    startTime: "11:00",
    endTime: "15:00",
    status: "Verified",
    clientId: "CL-1009",
    clientName: "Robert Davis",
    clientAdmin: "Sarah Jenkins",
    clientClass: "Host Home",
    clientRegion: "Dunwoody",
    householdId: "hh-1010",
    householdName: "Davis Household",
    address: "4410 Ashford Dunwoody Rd, Dunwoody, GA 30338",
    caregiverId: "CG-106",
    caregiverName: "Maria Rodriguez",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Designated Caregiver",
    caregiverRegion: "Dunwoody",
    serviceId: "svc-host-home",
    serviceCode: "S5140",
    serviceName: "Host Home",
    unitType: "Hourly",
    billRate: 38.0,
    payRate: 25.0,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-8822",
    authorizedWeeklyCap: 24,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    clockInActual: "11:00",
    clockOutActual: "15:00",
    careNoteStatus: "Completed",
    requiredSkills: ["Dementia Care", "Bilingual Spanish"],
    travelMinutes: 10,
    distanceMiles: 3.1,
    conflicts: [],
    memo: "Midday meal & blood pressure monitoring.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1033",
    shiftNumber: "#433",
    date: "2026-11-24",
    startTime: "11:00",
    endTime: "15:00",
    status: "Scheduled",
    clientId: "CL-1009",
    clientName: "Robert Davis",
    clientAdmin: "Sarah Jenkins",
    clientClass: "Host Home",
    clientRegion: "Dunwoody",
    householdId: "hh-1010",
    householdName: "Davis Household",
    address: "4410 Ashford Dunwoody Rd, Dunwoody, GA 30338",
    caregiverId: "CG-106",
    caregiverName: "Maria Rodriguez",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Designated Caregiver",
    caregiverRegion: "Dunwoody",
    serviceId: "svc-host-home",
    serviceCode: "S5140",
    serviceName: "Host Home",
    unitType: "Hourly",
    billRate: 38.0,
    payRate: 25.0,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-8822",
    authorizedWeeklyCap: 24,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    careNoteStatus: "Completed",
    requiredSkills: ["Dementia Care"],
    travelMinutes: 10,
    distanceMiles: 3.1,
    conflicts: [],
    memo: "Standard midday check-in.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1034",
    shiftNumber: "#434",
    date: "2026-11-26",
    startTime: "11:00",
    endTime: "15:00",
    status: "Scheduled",
    clientId: "CL-1009",
    clientName: "Robert Davis",
    clientAdmin: "Sarah Jenkins",
    clientClass: "Host Home",
    clientRegion: "Dunwoody",
    householdId: "hh-1010",
    householdName: "Davis Household",
    address: "4410 Ashford Dunwoody Rd, Dunwoody, GA 30338",
    caregiverId: "CG-106",
    caregiverName: "Maria Rodriguez",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Designated Caregiver",
    caregiverRegion: "Dunwoody",
    serviceId: "svc-host-home",
    serviceCode: "S5140",
    serviceName: "Host Home",
    unitType: "Hourly",
    billRate: 38.0,
    payRate: 25.0,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-8822",
    authorizedWeeklyCap: 24,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Dementia Care"],
    travelMinutes: 10,
    distanceMiles: 3.1,
    conflicts: [],
    memo: "Thanksgiving afternoon support.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1035",
    shiftNumber: "#435",
    date: "2026-11-28",
    startTime: "09:00",
    endTime: "13:00",
    status: "Unassigned",
    isModifiedFromSchedule: true,
    modificationReason: "Weekend Respite Coverage",
    clientId: "CL-1009",
    clientName: "Robert Davis",
    clientAdmin: "Sarah Jenkins",
    clientClass: "Host Home",
    clientRegion: "Dunwoody",
    householdId: "hh-1010",
    householdName: "Davis Household",
    address: "4410 Ashford Dunwoody Rd, Dunwoody, GA 30338",
    caregiverId: null,
    caregiverName: null,
    serviceId: "svc-cfc",
    serviceCode: "CFC-101",
    serviceName: "Community First Choice (CFC)",
    unitType: "Hourly",
    billRate: 30.0,
    payRate: 20.0,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-8822",
    authorizedWeeklyCap: 24,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Dementia Care", "ADL Support"],
    travelMinutes: 15,
    distanceMiles: 5.0,
    conflicts: [],
    memo: "Saturday morning care support.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },

  // CL-1008: Maya Lin (Lin Household) - Compliance Hold / Onboarding notice
  {
    id: "VIS-1036",
    shiftNumber: "#436",
    date: "2026-11-25",
    startTime: "08:30",
    endTime: "12:30",
    status: "Unassigned",
    isModifiedFromSchedule: true,
    modificationReason: "Caregiver Pending CPR Clearance",
    clientId: "CL-1008",
    clientName: "Maya Lin",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Portland",
    householdId: "hh-1008",
    householdName: "Lin Household",
    address: "219 NW Skyline Blvd, Portland, OR 97229",
    caregiverId: null,
    caregiverName: null,
    serviceId: "svc-ces-waiver",
    serviceCode: "CES-WVR",
    serviceName: "CES Waiver (Children’s Extensive Support)",
    unitType: "Hourly",
    billRate: 34.0,
    payRate: 22.5,
    billableHours: 4,
    payableHours: 4,
    scheduledHours: 4,
    authorizationNumber: "AUTH-2026-1190",
    authorizedWeeklyCap: 36,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Pediatric Care", "CPR & First Aid"],
    travelMinutes: 22,
    distanceMiles: 9.4,
    conflicts: ["Credential Expiring"],
    memo: "Temporary active caregiver needed until Jennifer Lin's CPR certificate is verified.",
    internalNotes: "RULES.md Stage 6 gate: Onboarding caregiver cannot be scheduled until Active.",
    broadcasts: [],
    auditTrail: [],
  },

  // Overlapping / Removed sample visit for INCLUDE REMOVED toggle
  {
    id: "VIS-1037",
    shiftNumber: "#437",
    date: "2026-11-25",
    startTime: "17:00",
    endTime: "20:00",
    status: "Scheduled",
    isRemoved: true,
    isModifiedFromSchedule: true,
    modificationReason: "Cancelled by Family (Holiday Travel)",
    clientId: "CL-1001",
    clientName: "Leo Miller",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1001",
    householdName: "Miller Household",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    caregiverId: "CG-107",
    caregiverName: "Clara Jenkins",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Backup Caregiver (1099)",
    caregiverRegion: "Springfield",
    serviceId: "svc-family-caregiver",
    serviceCode: "S5125",
    serviceName: "Family Caregiver",
    unitType: "Hourly",
    billRate: 28.5,
    payRate: 19.5,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: 3,
    authorizationNumber: "AUTH-2026-9812",
    authorizedWeeklyCap: 40,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Pediatric Care"],
    travelMinutes: 12,
    distanceMiles: 4.1,
    conflicts: [],
    memo: "Evening respite cancelled prior to holiday.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },

  // Next Week (Nov 30 - Dec 6) sample visits so week navigation > shows populated shifts
  {
    id: "VIS-1038",
    shiftNumber: "#438",
    date: "2026-11-30",
    startTime: "08:00",
    endTime: "16:00",
    status: "Scheduled",
    clientId: "CL-1001",
    clientName: "Leo Miller",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1001",
    householdName: "Miller Household",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    caregiverId: "CG-102",
    caregiverName: "Sarah Miller",
    caregiverAdmin: "Dana Jenkins, MSW",
    caregiverClass: "Family Caregiver (W-2)",
    caregiverRegion: "Springfield",
    serviceId: "svc-ces-waiver",
    serviceCode: "CES-WVR",
    serviceName: "CES Waiver (Children’s Extensive Support)",
    unitType: "Hourly",
    billRate: 34.0,
    payRate: 22.5,
    billableHours: 8,
    payableHours: 8,
    scheduledHours: 8,
    authorizationNumber: "AUTH-2026-9812",
    authorizedWeeklyCap: 40,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["Pediatric Care"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "Monday recurring shift.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  {
    id: "VIS-1039",
    shiftNumber: "#439",
    date: "2026-12-01",
    startTime: "09:00",
    endTime: "15:00",
    status: "Unassigned",
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    clientAdmin: "Rachel Green, LSW",
    clientClass: "Adult EBD",
    clientRegion: "Cedar Falls",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    address: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    caregiverId: null,
    caregiverName: null,
    serviceId: "svc-cna",
    serviceCode: "T1019",
    serviceName: "CNA (Certified Nurse Aide)",
    unitType: "Hourly",
    billRate: 36.0,
    payRate: 23.5,
    billableHours: 6,
    payableHours: 6,
    scheduledHours: 6,
    authorizationNumber: "AUTH-2026-7714",
    authorizedWeeklyCap: 32,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["CNA", "Mobility Assistance"],
    travelMinutes: 14,
    distanceMiles: 4.5,
    conflicts: [],
    memo: "Tuesday coverage needed.",
    internalNotes: "",
    broadcasts: [],
    auditTrail: [],
  },
  // Linked Clinical & Supervisory Visits (distinguishable from ordinary caregiver service shifts)
  {
    id: "VIS-1091",
    shiftNumber: "#CL-101",
    date: "2026-11-27",
    startTime: "10:00",
    endTime: "11:00",
    status: "Scheduled",
    isModifiedFromSchedule: false,
    clientId: "CL-1001",
    clientName: "Leo Miller",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Springfield",
    householdId: "hh-1001",
    householdName: "Miller Household",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    caregiverId: "PROF-RN-03",
    caregiverName: "Evelyn Vance, RN",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Supervising Nurse RN (Clinical)",
    caregiverRegion: "Springfield",
    serviceId: "svc-home-care-assessment",
    serviceCode: "CES-WVR",
    serviceName: "Quarterly RN Supervisory Visit",
    unitType: "Per Assessment",
    billRate: 0,
    payRate: 0,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: 1,
    authorizationNumber: "AUTH-2026-9812",
    authorizedWeeklyCap: 40,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["RN", "Clinical Supervision"],
    travelMinutes: 16,
    distanceMiles: 5.4,
    conflicts: [],
    memo: "[Clinical & Supervisory] Quarterly RN Supervisory Visit (In-home). Confirm rescue inhaler protocol.",
    internalNotes: "Linked to Clinical Visit CLV-2026-101 / Requirement REQ-2026-101",
    broadcasts: [],
    auditTrail: [
      {
        id: "aud-1091-1",
        timestamp: "2026-11-20 02:15 PM",
        actor: "Sarah Jenkins",
        actorRole: "Agency Administrator",
        action: "Clinical Visit Scheduled",
        details: "Quarterly RN Supervisory Visit assigned to Evelyn Vance, RN.",
      },
    ],
    visitCategory: "Clinical & Supervisory",
    clinicalVisitId: "CLV-2026-101",
    clinicalVisitType: "Quarterly RN Supervisory Visit",
    clinicalDeliveryMethod: "In-home",
  },
  {
    id: "VIS-1092",
    shiftNumber: "#CL-106",
    date: "2026-11-29",
    startTime: "14:00",
    endTime: "15:00",
    status: "Scheduled",
    isModifiedFromSchedule: false,
    clientId: "CL-1006",
    clientName: "Lucas Bennett",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Bend",
    householdId: "hh-1006",
    householdName: "Bennett Household",
    address: "1402 Crestview Terrace, Bend, OR 97701",
    caregiverId: "PROF-RN-01",
    caregiverName: "Rachel Miller, RN",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Clinical Supervisor / RN (Clinical)",
    caregiverRegion: "Springfield",
    serviceId: "svc-home-care-assessment",
    serviceCode: "CHRP-WVR",
    serviceName: "Initial RN Assessment Visit",
    unitType: "Per Assessment",
    billRate: 0,
    payRate: 0,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: 1,
    authorizationNumber: "AUTH-PENDING-99",
    authorizedWeeklyCap: 30,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["RN", "Clinical Supervision"],
    travelMinutes: 22,
    distanceMiles: 9.2,
    conflicts: [],
    memo: "[Clinical & Supervisory] Initial RN Assessment Visit (In-home) prior to Dec 1 waiver start.",
    internalNotes: "Linked to Clinical Visit CLV-2026-106 / Requirement REQ-2026-106",
    broadcasts: [],
    auditTrail: [
      {
        id: "aud-1092-1",
        timestamp: "2026-11-23 09:40 AM",
        actor: "Sarah Jenkins",
        actorRole: "Agency Administrator",
        action: "Clinical Visit Scheduled",
        details: "Initial RN Assessment Visit assigned to Rachel Miller, RN.",
      },
    ],
    visitCategory: "Clinical & Supervisory",
    clinicalVisitId: "CLV-2026-106",
    clinicalVisitType: "Initial RN Assessment Visit",
    clinicalDeliveryMethod: "In-home",
  },
  {
    id: "VIS-1093",
    shiftNumber: "#CL-110",
    date: "2026-11-26",
    startTime: "11:00",
    endTime: "11:45",
    status: "Scheduled",
    isModifiedFromSchedule: false,
    clientId: "CL-1010",
    clientName: "Thomas Callahan",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Family Care",
    clientRegion: "Murfreesboro",
    householdId: "hh-1010",
    householdName: "Callahan Household",
    address: "913 Proprietors Pl, Murfreesboro, TN 37128",
    caregiverId: "PROF-RN-03",
    caregiverName: "Evelyn Vance, RN",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Supervising Nurse RN (Clinical)",
    caregiverRegion: "Virtual",
    serviceId: "svc-home-care-assessment",
    serviceCode: "HMA-001",
    serviceName: "HMA Quarterly Virtual RN Visit",
    unitType: "Per Assessment",
    billRate: 0,
    payRate: 0,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: 0.75,
    authorizationNumber: "AUTH-2026-6621",
    authorizedWeeklyCap: 35,
    clockInLocation: "Any profile address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Not Started",
    careNoteStatus: "Pending",
    requiredSkills: ["RN", "Clinical Supervision"],
    travelMinutes: 0,
    distanceMiles: 0,
    conflicts: [],
    memo: "[Clinical & Supervisory] HMA Quarterly Virtual RN Visit via HIPAA telehealth.",
    internalNotes: "Linked to Clinical Visit CLV-2026-110 / Requirement REQ-2026-110",
    broadcasts: [],
    auditTrail: [
      {
        id: "aud-1093-1",
        timestamp: "2026-11-25 11:30 AM",
        actor: "Sarah Jenkins",
        actorRole: "Agency Administrator",
        action: "Clinical Visit Scheduled",
        details: "HMA Quarterly Virtual RN Visit assigned to Evelyn Vance, RN.",
      },
    ],
    visitCategory: "Clinical & Supervisory",
    clinicalVisitId: "CLV-2026-110",
    clinicalVisitType: "HMA Quarterly Virtual RN Visit",
    clinicalDeliveryMethod: "Virtual",
  },
  {
    id: "VIS-1094",
    shiftNumber: "#CL-103",
    date: "2026-11-24",
    startTime: "13:00",
    endTime: "14:00",
    status: "Completed",
    isModifiedFromSchedule: false,
    clientId: "CL-1003",
    clientName: "Sophia Bennett",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Pediatric Care",
    clientRegion: "Atlanta",
    householdId: "hh-1003",
    householdName: "Bennett Family Unit",
    address: "3501 Northview Terrace, Atlanta, GA 30327",
    caregiverId: "PROF-RN-02",
    caregiverName: "Carlos Mendez, RN",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Clinical Supervisor / RN (Clinical)",
    caregiverRegion: "Atlanta",
    serviceId: "svc-home-care-assessment",
    serviceCode: "DD-WVR",
    serviceName: "Quarterly RN Assessment",
    unitType: "Per Assessment",
    billRate: 0,
    payRate: 0,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: 1,
    authorizationNumber: "AUTH-2026-3390",
    authorizedWeeklyCap: 30,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    careNoteStatus: "Completed",
    requiredSkills: ["RN", "Clinical Supervision"],
    travelMinutes: 15,
    distanceMiles: 4.8,
    conflicts: [],
    memo: "[Clinical & Supervisory] Quarterly RN Assessment completed Nov 24; pending RN peer sign-off.",
    internalNotes: "Linked to Clinical Visit CLV-2026-103 / Requirement REQ-2026-103",
    broadcasts: [],
    auditTrail: [],
    visitCategory: "Clinical & Supervisory",
    clinicalVisitId: "CLV-2026-103",
    clinicalVisitType: "Quarterly RN Assessment",
    clinicalDeliveryMethod: "In-home",
  },
  {
    id: "VIS-1095",
    shiftNumber: "#CL-105",
    date: "2026-11-23",
    startTime: "10:30",
    endTime: "11:30",
    status: "Completed",
    isModifiedFromSchedule: false,
    clientId: "CL-1005",
    clientName: "Hannah Morales",
    clientAdmin: "Dana Jenkins, MSW",
    clientClass: "Adult Care",
    clientRegion: "Beaverton",
    householdId: "hh-1005",
    householdName: "Morales Household",
    address: "320 Laurel Canyon Blvd, Beaverton, OR 97005",
    caregiverId: "PROF-NRN-01",
    caregiverName: "Anita Roy, MSW",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Qualified Non-RN Supervisor (Clinical)",
    caregiverRegion: "Portland",
    serviceId: "svc-ihss",
    serviceCode: "S5130",
    serviceName: "IHSS Supervisory Visit",
    unitType: "Per Assessment",
    billRate: 0,
    payRate: 0,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: 1,
    authorizationNumber: "AUTH-2025-7762",
    authorizedWeeklyCap: 32,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    careNoteStatus: "Pending",
    requiredSkills: ["Qualified Non-RN Supervisor"],
    travelMinutes: 18,
    distanceMiles: 6.1,
    conflicts: [],
    memo: "[Clinical & Supervisory] IHSS Supervisory Visit (non-RN qualified). Missing guardian attestation.",
    internalNotes: "Linked to Clinical Visit CLV-2026-105 / Requirement REQ-2026-105",
    broadcasts: [],
    auditTrail: [],
    visitCategory: "Clinical & Supervisory",
    clinicalVisitId: "CLV-2026-105",
    clinicalVisitType: "IHSS Supervisory Visit",
    clinicalDeliveryMethod: "In-home",
  },
  {
    id: "VIS-1096",
    shiftNumber: "#CL-113",
    date: "2026-11-25",
    startTime: "15:00",
    endTime: "16:00",
    status: "Completed",
    isModifiedFromSchedule: false,
    clientId: "CL-1002",
    clientName: "Marcus Whitfield",
    clientAdmin: "Rachel Green, LSW",
    clientClass: "Adult EBD",
    clientRegion: "Cedar Falls",
    householdId: "hh-1002",
    householdName: "Whitfield Household",
    address: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    caregiverId: "PROF-RN-02",
    caregiverName: "Carlos Mendez, RN",
    caregiverAdmin: "Sarah Jenkins",
    caregiverClass: "Clinical Supervisor / RN (Clinical)",
    caregiverRegion: "Cedar Falls",
    serviceId: "svc-cna",
    serviceCode: "T1019",
    serviceName: "CNA RN Supervisory Visit",
    unitType: "Per Assessment",
    billRate: 0,
    payRate: 0,
    billableHours: 0,
    payableHours: 0,
    scheduledHours: 1,
    authorizationNumber: "AUTH-2026-7714",
    authorizedWeeklyCap: 32,
    clockInLocation: "Client Residential Address",
    clockOutLocation: "Same as clock in",
    evvStatus: "Verified",
    careNoteStatus: "Missing",
    requiredSkills: ["RN", "Clinical Supervision"],
    travelMinutes: 14,
    distanceMiles: 4.2,
    conflicts: [],
    memo: "[Clinical & Supervisory] CNA RN Supervisory Visit completed Nov 25; documentation pending.",
    internalNotes: "Linked to Clinical Visit CLV-2026-113 / Requirement REQ-2026-111",
    broadcasts: [],
    auditTrail: [],
    visitCategory: "Clinical & Supervisory",
    clinicalVisitId: "CLV-2026-113",
    clinicalVisitType: "CNA RN Supervisory Visit",
    clinicalDeliveryMethod: "In-home",
  },
];

export function getVisitsFromStorage(): RealTimeVisit[] {
  if (typeof window === "undefined") return INITIAL_REALTIME_VISITS;
  try {
    const raw = localStorage.getItem(SCHEDULING_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SCHEDULING_STORAGE_KEY, JSON.stringify(INITIAL_REALTIME_VISITS));
      return INITIAL_REALTIME_VISITS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure linked clinical/supervisory seed visits exist for cross-module sync
      const existingIds = new Set(parsed.map((v: RealTimeVisit) => v.id));
      const missingClinical = INITIAL_REALTIME_VISITS.filter(
        (v) => v.visitCategory === "Clinical & Supervisory" && !existingIds.has(v.id)
      );
      if (missingClinical.length > 0) {
        return [...parsed, ...missingClinical];
      }
      return parsed;
    }
    return INITIAL_REALTIME_VISITS;
  } catch (err) {
    console.error("Failed to read scheduling visits from storage", err);
    return INITIAL_REALTIME_VISITS;
  }
}

export function saveVisitsToStorage(visits: RealTimeVisit[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SCHEDULING_STORAGE_KEY, JSON.stringify(visits));
    window.dispatchEvent(
      new CustomEvent(SCHEDULING_SYNC_EVENT, { detail: { timestamp: Date.now(), count: visits.length } })
    );
    window.dispatchEvent(
      new CustomEvent("lilisare_intake_sync", { detail: { type: "scheduling", timestamp: Date.now() } })
    );
  } catch (err) {
    console.error("Failed to save scheduling visits", err);
  }
}

export function getVisitById(visitId: string): RealTimeVisit | undefined {
  const visits = getVisitsFromStorage();
  const clean = visitId.toLowerCase();
  const found = visits.find((v) => v.id.toLowerCase() === clean);
  if (found) return found;
  if (clean === "default" || clean === "[visitid]") return visits[0];
  return INITIAL_REALTIME_VISITS.find((v) => v.id.toLowerCase() === clean);
}

export function subscribeToSchedulingSync(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleSync = () => callback();
  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === SCHEDULING_STORAGE_KEY ||
      e.key === "lilisare_clients_records" ||
      e.key === "lilisare_caregivers_v1" ||
      e.key === "lilisare_households_data"
    ) {
      callback();
    }
  };

  window.addEventListener(SCHEDULING_SYNC_EVENT, handleSync);
  window.addEventListener("lilisare_intake_sync", handleSync);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(SCHEDULING_SYNC_EVENT, handleSync);
    window.removeEventListener("lilisare_intake_sync", handleSync);
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * Compute dynamic conflicts for a visit given all active visits
 */
export function computeVisitConflicts(
  visit: RealTimeVisit,
  allVisits: RealTimeVisit[]
): ConflictType[] {
  const conflicts: ConflictType[] = [];
  if (visit.isRemoved || !visit.caregiverId) return conflicts;

  const sameCaregiverSameDay = allVisits.filter(
    (other) =>
      other.id !== visit.id &&
      !other.isRemoved &&
      other.caregiverId === visit.caregiverId &&
      other.date === visit.date
  );

  const [s1h, s1m] = visit.startTime.split(":").map(Number);
  const [e1h, e1m] = visit.endTime.split(":").map(Number);
  const start1 = s1h * 60 + s1m;
  let end1 = e1h * 60 + e1m;
  if (end1 <= start1) end1 += 1440;

  for (const other of sameCaregiverSameDay) {
    const [s2h, s2m] = other.startTime.split(":").map(Number);
    const [e2h, e2m] = other.endTime.split(":").map(Number);
    const start2 = s2h * 60 + s2m;
    let end2 = e2h * 60 + e2m;
    if (end2 <= start2) end2 += 1440;

    if (start1 < end2 && start2 < end1) {
      conflicts.push("Overlapping Shift");
      break;
    }
  }

  // Weekly hours check
  const weeklyHours = allVisits
    .filter((v) => !v.isRemoved && v.caregiverId === visit.caregiverId)
    .reduce((acc, v) => acc + v.scheduledHours, 0);
  if (weeklyHours > 40) {
    conflicts.push("Overtime Risk");
  }

  // Client auth cap check
  const clientWeeklyHours = allVisits
    .filter((v) => !v.isRemoved && v.clientId === visit.clientId)
    .reduce((acc, v) => acc + v.scheduledHours, 0);
  if (visit.authorizedWeeklyCap > 0 && clientWeeklyHours > visit.authorizedWeeklyCap) {
    conflicts.push("Auth Hours Exceeded");
  }

  return Array.from(new Set([...(visit.conflicts || []).filter((c) => c === "Credential Expiring"), ...conflicts]));
}

/**
 * Ranked Caregiver Matcher (RECOMMEND workflow)
 * Ranks caregivers by Availability, Distance, Skill Match, Compliance/Activation, and Household link.
 */
export function getRecommendedCaregivers(
  visit: RealTimeVisit,
  caregivers: CaregiverRecord[],
  allVisits: RealTimeVisit[],
  clients: ClientRecord[]
): CaregiverMatchScore[] {
  const targetClient = clients.find((c) => c.id === visit.clientId);
  const visitDayName = new Date(`${visit.date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
  });

  const [vsH, vsM] = visit.startTime.split(":").map(Number);
  const [veH, veM] = visit.endTime.split(":").map(Number);
  const visitStartMin = vsH * 60 + vsM;
  const visitEndMin = veH * 60 + veM <= visitStartMin ? veH * 60 + veM + 1440 : veH * 60 + veM;

  return caregivers
    .map((cg) => {
      const isActivated =
        cg.status === "Active" &&
        cg.verificationChecklist.screening === "Cleared" &&
        cg.verificationChecklist.cprFirstAid === "Verified";

      // Check overlapping shifts on that day
      const dayShifts = allVisits.filter(
        (v) =>
          v.id !== visit.id &&
          !v.isRemoved &&
          v.caregiverId === cg.id &&
          v.date === visit.date
      );

      let hasOverlap = false;
      for (const s of dayShifts) {
        const [sh, sm] = s.startTime.split(":").map(Number);
        const [eh, em] = s.endTime.split(":").map(Number);
        const sMin = sh * 60 + sm;
        const eMin = eh * 60 + em <= sMin ? eh * 60 + em + 1440 : eh * 60 + em;
        if (visitStartMin < eMin && sMin < visitEndMin) {
          hasOverlap = true;
          break;
        }
      }

      const scheduledHoursThisWeek = allVisits
        .filter((v) => !v.isRemoved && v.caregiverId === cg.id)
        .reduce((acc, v) => acc + v.scheduledHours, 0);

      const weeklyCapacityHours = cg.availabilityAssignments?.weeklyCapacityHours || 40;
      const hasCapacity = scheduledHoursThisWeek + visit.scheduledHours <= weeklyCapacityHours;

      const dayAvail = cg.availabilityAssignments?.availabilitySchedule?.find(
        (a) => a.day.toLowerCase() === visitDayName.toLowerCase()
      );
      const isDayAvailable = dayAvail ? dayAvail.available : true;

      let availabilityScore = 95;
      let conflictReason: string | undefined;
      if (hasOverlap) {
        availabilityScore = 15;
        conflictReason = "Overlapping shift on " + visit.date;
      } else if (!isDayAvailable) {
        availabilityScore = 40;
        conflictReason = `Marked unavailable on ${visitDayName}`;
      } else if (!hasCapacity) {
        availabilityScore = 55;
        conflictReason = `Exceeds ${weeklyCapacityHours}h weekly capacity`;
      } else if (!isActivated) {
        availabilityScore = 25;
        conflictReason = `Onboarding / Pending clearance (${cg.status})`;
      }

      // Deterministic distance based on city/region match
      const sameCity =
        cg.personalInfo?.address?.city?.toLowerCase() ===
        targetClient?.household?.city?.toLowerCase();
      const isHouseholdLinked =
        cg.relationship?.linkedHousehold?.id === visit.householdId ||
        cg.availabilityAssignments?.assignedClient?.id === visit.clientId;

      const hashSeed = cg.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const distanceMiles = isHouseholdLinked
        ? 0.0
        : sameCity
          ? Math.round((1.4 + (hashSeed % 40) / 10) * 10) / 10
          : Math.round((5.2 + (hashSeed % 140) / 10) * 10) / 10;
      const travelMinutes = distanceMiles === 0 ? 0 : Math.round(distanceMiles * 2.4 + 4);
      const distanceScore = Math.max(20, Math.round(100 - distanceMiles * 3.5));

      // Skill match
      const cgSkills = new Set<string>([
        cg.type,
        cg.employmentClassification,
        ...(cg.personalInfo?.languages || []).map((l) => `Bilingual ${l}`),
        ...(cg.screeningTraining?.trainingCourses?.map((t) => t.category) || []),
        "Personal Care",
        "ADL Support",
        "Mobility Assistance",
        "Medication Prompting",
        ...(cg.verificationChecklist.cprFirstAid === "Verified" ? ["CPR & First Aid"] : []),
        ...(cg.type.includes("Skilled") || cg.name.includes("RN") ? ["Skilled Nursing", "PDN", "CNA"] : []),
        ...(cg.type.includes("Family") ? ["Pediatric Care", "Dementia Care", "Sensory Support"] : []),
      ]);

      const reqSkills = visit.requiredSkills.length > 0 ? visit.requiredSkills : ["Personal Care"];
      const matchedSkills = reqSkills.filter((req) =>
        Array.from(cgSkills).some((s) => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))
      );
      const missingSkills = reqSkills.filter((req) => !matchedSkills.includes(req));
      const skillMatchScore = Math.round((matchedSkills.length / reqSkills.length) * 100);

      const overallScore = Math.min(
        99,
        Math.max(
          12,
          Math.round(
            availabilityScore * 0.4 +
              distanceScore * 0.25 +
              skillMatchScore * 0.25 +
              (isActivated ? 10 : -20) +
              (isHouseholdLinked ? 8 : 0)
          )
        )
      );

      return {
        caregiverId: cg.id,
        caregiverName: cg.name,
        avatarUrl: cg.avatarUrl,
        type: cg.type,
        employmentClassification: cg.employmentClassification,
        status: cg.status,
        isActivated,
        overallScore,
        availabilityScore,
        distanceScore,
        skillMatchScore,
        distanceMiles,
        travelMinutes,
        matchedSkills,
        missingSkills,
        scheduledHoursThisWeek,
        weeklyCapacityHours,
        hasConflict: Boolean(conflictReason),
        conflictReason,
        phone: cg.personalInfo?.phone || "(555) 000-0000",
        region: cg.personalInfo?.address?.city || cg.branch || "Springfield",
        isHouseholdLinked,
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Helper to fetch live synced reference lists across portals
 */
export function getSyncedSchedulingContext() {
  const clients = typeof window !== "undefined" ? getClientsFromStorage() : INITIAL_CLIENTS;
  const caregivers = typeof window !== "undefined" ? getCaregiversFromStorage() : INITIAL_CAREGIVERS;
  const households = typeof window !== "undefined" ? getHouseholdsFromStorage() : MOCK_HOUSEHOLDS;
  const services = LILISARE_SERVICES;
  return { clients, caregivers, households, services };
}

export function createBroadcastRecord(
  caregiverIds: string[],
  caregiverNames: string[],
  sentBy: string,
  channel: VisitBroadcastRecord["channel"],
  urgency: VisitBroadcastRecord["urgency"],
  message: string
): VisitBroadcastRecord {
  return {
    id: `BRC-${Date.now()}`,
    sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    sentBy,
    caregiverIds,
    caregiverNames,
    channel,
    urgency,
    message,
    status: "Sent",
  };
}

export const ALL_VISIT_STATUSES: VisitStatus[] = [
  "Unassigned",
  "Scheduled",
  "Verified",
  "Standalone",
  "Completed",
  "In-Progress",
  "Missed",
];

export const MODIFICATION_REASONS: string[] = [
  "None / Original Schedule",
  "Last Minute Coverage by CG",
  "Client Requested Time Change",
  "Caregiver Call-Off",
  "Caregiver Requested Swap",
  "Hospital Discharge Adjustment",
  "Authorization Hours Update",
  "Caregiver Late / Missed Clock-In",
  "Weekend Respite Coverage",
];

// ============================================================================
// A. RECURRING VISITS & SPLIT SHIFTS ENGINE
// ============================================================================

export interface RecurringGenerationOptions {
  baseVisit: Omit<
    RealTimeVisit,
    "id" | "shiftNumber" | "date" | "startTime" | "endTime" | "billableHours" | "payableHours" | "scheduledHours"
  >;
  pattern: RecurrencePattern;
  startDate: string;
  endDate: string;
  weekdays: number[]; // 0=Sun..6=Sat
  intervalWeeks?: number;
  exceptionDates?: string[];
  segments: Array<{ startTime: string; endTime: string; splitLabel?: string }>;
}

/**
 * Expands a recurring pattern (and optional split-shift segments) into individual RealTimeVisit records.
 * Preserves each split shift as an independent record so EVV, care notes, and billing track separately.
 */
export function generateRecurringVisitInstances(
  options: RecurringGenerationOptions
): RealTimeVisit[] {
  const {
    baseVisit,
    pattern,
    startDate,
    endDate,
    weekdays,
    intervalWeeks = 1,
    exceptionDates = [],
    segments,
  } = options;

  const exceptionSet = new Set(exceptionDates.map((d) => d.trim()).filter(Boolean));
  const targetDates: string[] = [];

  if (pattern === "one-time") {
    if (!exceptionSet.has(startDate)) {
      targetDates.push(startDate);
    }
  } else {
    const start = new Date(`${startDate}T12:00:00`);
    const end = new Date(`${endDate || startDate}T12:00:00`);
    const maxDays = 90; // safety cap for client-side generation
    let dayCount = 0;

    for (let cur = new Date(start); cur <= end && dayCount < maxDays; cur.setDate(cur.getDate() + 1)) {
      dayCount++;
      const iso = cur.toISOString().split("T")[0];
      if (exceptionSet.has(iso)) continue;

      if (pattern === "daily") {
        targetDates.push(iso);
      } else {
        // weekly or custom
        const diffDays = Math.floor((cur.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);
        if (weekIndex % Math.max(1, intervalWeeks) === 0 && weekdays.includes(cur.getDay())) {
          targetDates.push(iso);
        }
      }
    }
  }

  const seriesId = pattern !== "one-time" ? `SER-${Date.now()}` : undefined;
  const results: RealTimeVisit[] = [];
  let seq = Math.floor(450 + Math.random() * 400);

  for (const dateIso of targetDates) {
    const splitGroupId = segments.length > 1 ? `SPL-${dateIso}-${seq}` : undefined;
    segments.forEach((seg, idx) => {
      const dur = calculateDurationHours(seg.startTime, seg.endTime);
      if (dur <= 0) return;
      seq++;
      const splitLabel =
        segments.length > 1
          ? seg.splitLabel || `Split ${idx + 1} of ${segments.length}`
          : undefined;

      results.push({
        ...baseVisit,
        id: `VIS-${Date.now().toString().slice(-5)}-${seq}`,
        shiftNumber: `#${seq}`,
        date: dateIso,
        startTime: seg.startTime,
        endTime: seg.endTime,
        billableHours: dur,
        payableHours: dur,
        scheduledHours: dur,
        seriesId,
        recurrencePattern: pattern,
        recurrenceWeekdays: pattern !== "one-time" ? weekdays : undefined,
        recurrenceStartDate: pattern !== "one-time" ? startDate : undefined,
        recurrenceEndDate: pattern !== "one-time" ? endDate : undefined,
        recurrenceExceptionDates: exceptionDates.length > 0 ? exceptionDates : undefined,
        splitGroupId,
        splitLabel,
      });
    });
  }

  return results;
}

/**
 * Applies an edit to a single visit, this-and-future visits in a series, or the entire series.
 */
export function applyRecurringVisitEdit(
  allVisits: RealTimeVisit[],
  targetVisit: RealTimeVisit,
  updatedFields: Partial<RealTimeVisit>,
  scope: RecurringEditScope,
  actorName: string,
  actorRole: string
): RealTimeVisit[] {
  const seriesId = targetVisit.seriesId;
  const shouldUpdate = (v: RealTimeVisit) => {
    if (scope === "this_visit" || !seriesId) return v.id === targetVisit.id;
    if (v.seriesId !== seriesId) return false;
    if (scope === "this_and_future") return v.date >= targetVisit.date;
    return true; // entire_series
  };

  return allVisits.map((v) => {
    if (!shouldUpdate(v)) return v;
    const nextStart = updatedFields.startTime ?? v.startTime;
    const nextEnd = updatedFields.endTime ?? v.endTime;
    const nextHours = calculateDurationHours(nextStart, nextEnd);
    const next: RealTimeVisit = {
      ...v,
      ...updatedFields,
      // Keep each visit's own date unless editing a single visit
      date: scope === "this_visit" ? updatedFields.date ?? v.date : v.date,
      scheduledHours: nextHours,
      billableHours: updatedFields.billableHours ?? nextHours,
      payableHours: updatedFields.payableHours ?? nextHours,
      isModifiedFromSchedule: true,
      isSeriesException: scope === "this_visit" && Boolean(seriesId) ? true : v.isSeriesException,
      auditTrail: [
        {
          id: `aud-${Date.now()}-${v.id}`,
          timestamp: new Date().toLocaleString(),
          actor: actorName,
          actorRole,
          action:
            scope === "this_visit"
              ? "Updated Single Visit"
              : scope === "this_and_future"
                ? "Updated This & Future Series Visits"
                : "Updated Entire Recurring Series",
          details: `Schedule ${nextStart}–${nextEnd}, Caregiver: ${updatedFields.caregiverName ?? v.caregiverName ?? "Unassigned"}`,
        },
        ...(v.auditTrail || []),
      ],
    };
    return next;
  });
}

// ============================================================================
// B. LAST-MINUTE CALL-OUTS & OPEN SHIFT COVERAGE
// ============================================================================

export const CALLOUT_STORAGE_KEY = "lilisare_coverage_callouts_v1";

export const INITIAL_CALLOUTS: CallOutRecord[] = [
  {
    id: "CO-9001",
    visitId: "VIS-1007",
    shiftNumber: "#407",
    date: "2026-11-27",
    startTime: "09:00",
    endTime: "13:00",
    clientId: "CL-1002",
    clientName: "Arthur Pendelton",
    householdName: "Pendelton Household",
    address: "118 Maple Lane, Eugene, OR 97401",
    serviceName: "Personal Care & Dementia Support",
    requiredSkills: ["Dementia Care", "Personal Care", "CPR & First Aid"],
    originalCaregiverId: "CG-104",
    originalCaregiverName: "Marcus Vance",
    reportedBy: "Caregiver",
    reportedAt: "2026-11-27 06:45 AM",
    reason: "Sudden Illness / Fever",
    notes: "Caregiver reported flu symptoms early morning and requested immediate coverage.",
    status: "Open",
    assignmentHistory: [
      {
        id: "coh-1",
        timestamp: "2026-11-27 06:45 AM",
        actor: "Marcus Vance (Caregiver App)",
        action: "Call-Out Reported",
        caregiverId: "CG-104",
        caregiverName: "Marcus Vance",
        details: "Visit #407 flagged for agency replacement coverage. Auto-assignment disabled.",
      },
    ],
  },
  {
    id: "CO-9002",
    visitId: "VIS-1012",
    shiftNumber: "#412",
    date: "2026-11-27",
    startTime: "14:00",
    endTime: "18:00",
    clientId: "CL-1001",
    clientName: "Leo Miller",
    householdName: "Miller Household",
    address: "742 Evergreen Terrace, Springfield, OR 97477",
    serviceName: "CES Waiver (Children's Extensive Support)",
    requiredSkills: ["Pediatric Care", "Sensory Support"],
    originalCaregiverId: "CG-107",
    originalCaregiverName: "Clara Jenkins",
    reportedBy: "Agency Staff",
    reportedAt: "2026-11-27 08:10 AM",
    reason: "Family Emergency / Transit Delay",
    notes: "Afternoon split shift requires qualified pediatric coverage. Parent notified.",
    status: "Candidates Reviewed",
    assignmentHistory: [
      {
        id: "coh-2",
        timestamp: "2026-11-27 08:10 AM",
        actor: "Dana Jenkins, MSW",
        action: "Call-Out Recorded",
        caregiverId: "CG-107",
        caregiverName: "Clara Jenkins",
        details: "Flagged afternoon split shift for coverage review.",
      },
      {
        id: "coh-3",
        timestamp: "2026-11-27 08:25 AM",
        actor: "Dana Jenkins, MSW",
        action: "Candidates Screened",
        details: "Shortlisted eligible active caregivers with Pediatric Care clearance.",
      },
    ],
  },
];

export function getCallOutsFromStorage(): CallOutRecord[] {
  if (typeof window === "undefined") return INITIAL_CALLOUTS;
  try {
    const raw = window.localStorage.getItem(CALLOUT_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(CALLOUT_STORAGE_KEY, JSON.stringify(INITIAL_CALLOUTS));
      return INITIAL_CALLOUTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_CALLOUTS;
  } catch {
    return INITIAL_CALLOUTS;
  }
}

export function saveCallOutsToStorage(records: CallOutRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CALLOUT_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(SCHEDULING_SYNC_EVENT));
}

export function createCallOutForVisit(
  visit: RealTimeVisit,
  reportedBy: "Caregiver" | "Agency Staff",
  reason: string,
  notes: string,
  actorName: string
): CallOutRecord {
  const existingVisits = getVisitsFromStorage();
  const updatedVisits = existingVisits.map((v) =>
    v.id === visit.id
      ? {
          ...v,
          status: "Unassigned" as VisitStatus,
          caregiverId: null,
          caregiverName: null,
          isModifiedFromSchedule: true,
          modificationReason: `Call-Out: ${reason}`,
          auditTrail: [
            {
              id: `aud-co-${Date.now()}`,
              timestamp: new Date().toLocaleString(),
              actor: actorName,
              actorRole: reportedBy,
              action: "Call-Out Flagged for Replacement Coverage",
              reason,
              details: `Original caregiver ${visit.caregiverName || "Unassigned"} removed. Pending agency approval for replacement.`,
            },
            ...(v.auditTrail || []),
          ],
        }
      : v
  );
  saveVisitsToStorage(updatedVisits);

  const newCallOut: CallOutRecord = {
    id: `CO-${Date.now().toString().slice(-4)}`,
    visitId: visit.id,
    shiftNumber: visit.shiftNumber,
    date: visit.date,
    startTime: visit.startTime,
    endTime: visit.endTime,
    clientId: visit.clientId,
    clientName: visit.clientName,
    householdName: visit.householdName,
    address: visit.address,
    serviceName: visit.serviceName,
    requiredSkills: visit.requiredSkills,
    originalCaregiverId: visit.caregiverId,
    originalCaregiverName: visit.caregiverName || "Unassigned",
    reportedBy,
    reportedAt: new Date().toLocaleString(),
    reason,
    notes,
    status: "Open",
    assignmentHistory: [
      {
        id: `coh-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        actor: actorName,
        action: "Call-Out Reported",
        caregiverId: visit.caregiverId,
        caregiverName: visit.caregiverName,
        details: `${reason}${notes ? ` — ${notes}` : ""}`,
      },
    ],
  };

  const callOuts = getCallOutsFromStorage();
  saveCallOutsToStorage([newCallOut, ...callOuts]);
  return newCallOut;
}

export function assignReplacementCaregiver(
  callOutId: string,
  caregiver: CaregiverRecord,
  actorName: string
): void {
  const callOuts = getCallOutsFromStorage();
  const target = callOuts.find((c) => c.id === callOutId);
  if (!target) return;

  const visits = getVisitsFromStorage();
  const updatedVisits = visits.map((v) =>
    v.id === target.visitId
      ? {
          ...v,
          caregiverId: caregiver.id,
          caregiverName: caregiver.name,
          caregiverClass: `${caregiver.type} (${caregiver.employmentClassification})`,
          caregiverRegion: caregiver.personalInfo?.address?.city || "Springfield",
          status: "Scheduled" as VisitStatus,
          isModifiedFromSchedule: true,
          modificationReason: "Replacement Assigned (Call-Out Coverage)",
          auditTrail: [
            {
              id: `aud-rep-${Date.now()}`,
              timestamp: new Date().toLocaleString(),
              actor: actorName,
              actorRole: "Agency Scheduler",
              action: "Replacement Caregiver Assigned",
              details: `Assigned ${caregiver.name} to replace ${target.originalCaregiverName} (${target.reason}).`,
            },
            ...(v.auditTrail || []),
          ],
        }
      : v
  );
  saveVisitsToStorage(updatedVisits);

  const updatedCallOuts = callOuts.map((c) =>
    c.id === callOutId
      ? {
          ...c,
          status: "Assigned" as const,
          replacementCaregiverId: caregiver.id,
          replacementCaregiverName: caregiver.name,
          assignedAt: new Date().toLocaleString(),
          assignedBy: actorName,
          assignmentHistory: [
            {
              id: `coh-rep-${Date.now()}`,
              timestamp: new Date().toLocaleString(),
              actor: actorName,
              action: "Replacement Approved & Assigned",
              caregiverId: caregiver.id,
              caregiverName: caregiver.name,
              details: `Agency approved replacement: ${caregiver.name} notified with client & visit instructions.`,
            },
            ...c.assignmentHistory,
          ],
        }
      : c
  );
  saveCallOutsToStorage(updatedCallOuts);
}

// ============================================================================
// C. EVV OPERATIONAL THRESHOLDS & LATE / MISSING VISIT EVALUATION
// ============================================================================

export const EVV_THRESHOLDS_KEY = "lilisare_evv_schedule_thresholds_v1";

export const DEFAULT_EVV_THRESHOLD_RULES: EvvScheduleThresholdRule[] = [
  {
    id: "rule-ces",
    programName: "CES Waiver",
    lateGraceMinutes: 15,
    missingStartAlertMinutes: 30,
    earlyDepartureThresholdMinutes: 15,
    requireGpsOrIvr: true,
  },
  {
    id: "rule-medicaid",
    programName: "Medicaid",
    lateGraceMinutes: 10,
    missingStartAlertMinutes: 25,
    earlyDepartureThresholdMinutes: 15,
    requireGpsOrIvr: true,
  },
  {
    id: "rule-private",
    programName: "Private Duty",
    lateGraceMinutes: 20,
    missingStartAlertMinutes: 45,
    earlyDepartureThresholdMinutes: 20,
    requireGpsOrIvr: false,
  },
];

export function getEvvThresholdRules(): EvvScheduleThresholdRule[] {
  if (typeof window === "undefined") return DEFAULT_EVV_THRESHOLD_RULES;
  try {
    const raw = window.localStorage.getItem(EVV_THRESHOLDS_KEY);
    if (!raw) return DEFAULT_EVV_THRESHOLD_RULES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EVV_THRESHOLD_RULES;
  } catch {
    return DEFAULT_EVV_THRESHOLD_RULES;
  }
}

export function saveEvvThresholdRules(rules: EvvScheduleThresholdRule[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EVV_THRESHOLDS_KEY, JSON.stringify(rules));
  window.dispatchEvent(new Event(SCHEDULING_SYNC_EVENT));
}

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Evaluates a visit's expected schedule timing vs actual EVV events using configurable payer/program rules.
 * Never treats a visit as missed merely because the caregiver hasn't clocked in at the exact scheduled minute.
 */
export function evaluateVisitEvvOperationalStatus(
  visit: RealTimeVisit,
  rules: EvvScheduleThresholdRule[] = DEFAULT_EVV_THRESHOLD_RULES,
  referenceDate = "2026-11-27",
  referenceTime = "10:15"
): OperationalEvvEvaluation {
  const matchedRule =
    rules.find((r) =>
      visit.serviceName.toLowerCase().includes(r.programName.toLowerCase())
    ) || rules[0];

  if (visit.status === "Missed") {
    return {
      alertType: "Incomplete / Missed Visit",
      severity: "critical",
      varianceMinutes: 0,
      message: "Visit marked missed / incomplete — requires supervisor follow-up.",
      ruleApplied: matchedRule.programName,
    };
  }

  if (visit.evvStatus === "Exception") {
    return {
      alertType: "Verification Pending",
      severity: "warning",
      varianceMinutes: 0,
      message: "EVV exception or telemetry unavailable — verification pending.",
      ruleApplied: matchedRule.programName,
    };
  }

  const schedStart = parseTimeToMinutes(visit.startTime);
  const schedEnd = parseTimeToMinutes(visit.endTime);

  // Check completed / in-progress actual clock-in
  if (visit.clockInActual) {
    const actualStart = parseTimeToMinutes(visit.clockInActual);
    const startVariance = actualStart - schedStart;

    if (visit.clockOutActual) {
      const actualEnd = parseTimeToMinutes(visit.clockOutActual);
      const earlyBy = schedEnd - actualEnd;
      if (earlyBy > matchedRule.earlyDepartureThresholdMinutes) {
        return {
          alertType: "Early Departure Review",
          severity: "warning",
          varianceMinutes: -earlyBy,
          message: `Ended ${earlyBy}m earlier than scheduled (threshold ${matchedRule.earlyDepartureThresholdMinutes}m).`,
          ruleApplied: matchedRule.programName,
        };
      }
    }

    if (startVariance > matchedRule.lateGraceMinutes) {
      return {
        alertType: "Late Clock-In",
        severity: "warning",
        varianceMinutes: startVariance,
        message: `Clocked in +${startVariance}m after scheduled start (grace ${matchedRule.lateGraceMinutes}m).`,
        ruleApplied: matchedRule.programName,
      };
    }

    return {
      alertType: "On Time",
      severity: "ok",
      varianceMinutes: startVariance,
      message: "EVV clock-in within payer tolerance.",
      ruleApplied: matchedRule.programName,
    };
  }

  // Visit has not started yet — compare against reference time on referenceDate
  if (visit.date === referenceDate && visit.status === "Scheduled") {
    const nowMins = parseTimeToMinutes(referenceTime);
    const lateBy = nowMins - schedStart;

    if (lateBy >= matchedRule.missingStartAlertMinutes) {
      return {
        alertType: "Missing-Start Alert",
        severity: "critical",
        varianceMinutes: lateBy,
        message: `No EVV clock-in ${lateBy}m past scheduled start (alert threshold ${matchedRule.missingStartAlertMinutes}m).`,
        ruleApplied: matchedRule.programName,
      };
    }

    if (lateBy > 0) {
      return {
        alertType: "Potentially Late",
        severity: "warning",
        varianceMinutes: lateBy,
        message: `Not started (+${lateBy}m past start, within ${matchedRule.missingStartAlertMinutes}m alert window).`,
        ruleApplied: matchedRule.programName,
      };
    }
  }

  if (visit.date < referenceDate && visit.status === "Scheduled") {
    return {
      alertType: "Incomplete / Missed Visit",
      severity: "critical",
      varianceMinutes: 0,
      message: "Past scheduled date without EVV completion.",
      ruleApplied: matchedRule.programName,
    };
  }

  return {
    alertType: "On Time",
    severity: "info",
    varianceMinutes: 0,
    message: "Scheduled — awaiting visit start.",
    ruleApplied: matchedRule.programName,
  };
}

// ============================================================================
// E. SCHEDULING INSIGHTS: AUTHORIZED HOURS VS SCHEDULED & OVERTIME RULES
// ============================================================================

export const OVERTIME_RULES_KEY = "lilisare_overtime_rules_v1";

export const DEFAULT_OVERTIME_RULES: OvertimeRuleConfig[] = [
  {
    id: "ot-w2-ft",
    employmentType: "W-2 Full-Time",
    weeklyOvertimeThresholdHours: 40,
    dailyOvertimeThresholdHours: 8,
    warningThresholdPercent: 85,
    enabled: true,
  },
  {
    id: "ot-w2-pt",
    employmentType: "W-2 Part-Time",
    weeklyOvertimeThresholdHours: 30,
    dailyOvertimeThresholdHours: 8,
    warningThresholdPercent: 85,
    enabled: true,
  },
  {
    id: "ot-1099",
    employmentType: "1099 Contractor",
    weeklyOvertimeThresholdHours: 45,
    dailyOvertimeThresholdHours: 10,
    warningThresholdPercent: 90,
    enabled: true,
  },
];

export function getOvertimeRules(): OvertimeRuleConfig[] {
  if (typeof window === "undefined") return DEFAULT_OVERTIME_RULES;
  try {
    const raw = window.localStorage.getItem(OVERTIME_RULES_KEY);
    if (!raw) return DEFAULT_OVERTIME_RULES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_OVERTIME_RULES;
  } catch {
    return DEFAULT_OVERTIME_RULES;
  }
}

export function saveOvertimeRules(rules: OvertimeRuleConfig[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OVERTIME_RULES_KEY, JSON.stringify(rules));
  window.dispatchEvent(new Event(SCHEDULING_SYNC_EVENT));
}

export function computeClientHoursInsights(
  visits: RealTimeVisit[],
  clients: ClientRecord[]
): ClientHoursInsight[] {
  const activeVisits = visits.filter((v) => !v.isRemoved);
  return clients
    .map((client) => {
      const clientVisits = activeVisits.filter((v) => v.clientId === client.id);
      const scheduledWeeklyHours = clientVisits.reduce((acc, v) => acc + v.scheduledHours, 0);
      const completedHours = clientVisits
        .filter((v) => v.status === "Completed" || v.status === "Verified")
        .reduce((acc, v) => acc + v.scheduledHours, 0);
      const authorizedWeeklyHours =
        clientVisits[0]?.authorizedWeeklyCap ||
        client.carePlan?.authorizedWeeklyHours ||
        40;
      const varianceHours = Math.round((scheduledWeeklyHours - authorizedWeeklyHours) * 10) / 10;

      const status: ClientHoursInsight["status"] =
        varianceHours > 0
          ? "Over Auth"
          : scheduledWeeklyHours >= authorizedWeeklyHours * 0.85
            ? "Approaching Cap"
            : "Within Auth";

      return {
        clientId: client.id,
        clientName: client.name,
        householdName: client.household?.name || `${client.name} Household`,
        authorizationNumber: client.authorization?.authNumber || clientVisits[0]?.authorizationNumber || "AUTH-PENDING",
        authorizedWeeklyHours,
        scheduledWeeklyHours: Math.round(scheduledWeeklyHours * 10) / 10,
        completedHours: Math.round(completedHours * 10) / 10,
        varianceHours,
        status,
        visitCount: clientVisits.length,
      };
    })
    .filter((item) => item.visitCount > 0 || item.varianceHours > 0)
    .sort((a, b) => b.varianceHours - a.varianceHours);
}

export function computeCaregiverOvertimeInsights(
  visits: RealTimeVisit[],
  caregivers: CaregiverRecord[],
  rules: OvertimeRuleConfig[] = DEFAULT_OVERTIME_RULES
): CaregiverOvertimeInsight[] {
  const activeVisits = visits.filter((v) => !v.isRemoved && v.caregiverId);
  return caregivers
    .filter((cg) => cg.status === "Active")
    .map((cg) => {
      const cgVisits = activeVisits.filter((v) => v.caregiverId === cg.id);
      const scheduledHours = Math.round(cgVisits.reduce((acc, v) => acc + v.scheduledHours, 0) * 10) / 10;
      const actualWorkedHours = Math.round(
        cgVisits
          .filter((v) => v.status === "Completed" || v.status === "Verified" || v.status === "In-Progress")
          .reduce((acc, v) => acc + v.scheduledHours, 0) * 10
      ) / 10;

      const matchedRule =
        rules.find((r) =>
          r.enabled &&
          (cg.employmentClassification.toLowerCase().includes("1099")
            ? r.employmentType.includes("1099")
            : cg.employmentClassification.toLowerCase().includes("part")
              ? r.employmentType.includes("Part-Time")
              : r.employmentType.includes("Full-Time"))
        ) || rules[0];

      const threshold = matchedRule?.weeklyOvertimeThresholdHours || 40;
      const warningPct = matchedRule?.warningThresholdPercent || 85;
      const overtimeHours = Math.max(0, Math.round((scheduledHours - threshold) * 10) / 10);
      const utilizationPercent = Math.round((scheduledHours / threshold) * 100);

      const status: CaregiverOvertimeInsight["status"] =
        scheduledHours > threshold
          ? "Overtime"
          : utilizationPercent >= warningPct
            ? "Approaching OT"
            : "Normal";

      return {
        caregiverId: cg.id,
        caregiverName: cg.name,
        employmentClassification: cg.employmentClassification,
        scheduledHours,
        actualWorkedHours,
        weeklyThresholdHours: threshold,
        overtimeHours,
        utilizationPercent,
        status,
        visitCount: cgVisits.length,
      };
    })
    .sort((a, b) => b.utilizationPercent - a.utilizationPercent);
}
