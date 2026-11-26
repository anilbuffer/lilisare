import {
  EvvVisitRecord,
  EvvKpiSummary,
  EvvVerificationStatus,
  EvvVisitStatus,
  EvvAggregatorStatus,
  EvvBillingReadiness,
  EvvPayrollReadiness,
  EvvExceptionType,
  EvvReviewNote,
  EvvTimelineEvent,
  EvvCorrection,
  EvvSubmissionRecord,
  EvvToleranceRule,
  EvvReviewer,
  EvvCaptureMethod,
} from "@/types/evvVisit";
import { INITIAL_REALTIME_VISITS, getVisitsFromStorage } from "@/lib/scheduling/schedulingStore";

export const EVV_STORAGE_KEY = "lilisare_evv_visits_v3";
export const EVV_SUBMISSIONS_KEY = "lilisare_evv_submissions_v1";
export const EVV_RULES_KEY = "lilisare_evv_rules_v1";
export const EVV_SYNC_EVENT = "lilisare_evv_visits_sync";

export const DEMO_DATE = "2026-11-25";

export const EVV_REASON_CODES = [
  { code: "RC-01", label: "Caregiver forgot to clock in/out (Mobile app neglected)" },
  { code: "RC-02", label: "Mobile device failure / Dead battery" },
  { code: "RC-03", label: "Cellular connectivity loss / Offline sync delayed" },
  { code: "RC-04", label: "Community outing / Authorized alternate care location" },
  { code: "RC-05", label: "Medical emergency during shift" },
  { code: "RC-06", label: "Client delayed arrival / Unscheduled schedule shift" },
  { code: "RC-07", label: "GPS signal drift / High-rise residential interference" },
  { code: "RC-08", label: "Telephony IVR backup utilized" },
  { code: "RC-09", label: "Client refused signature / Physical inability to sign" },
  { code: "RC-10", label: "Payer Medicaid ID or Service Code mismatch" },
];

export const EVV_RESOLUTION_CODES = [
  { code: "RES-01", label: "Approved minor time variance within policy tolerance" },
  { code: "RES-02", label: "Manual time entry verified via telephony IVR audit log" },
  { code: "RES-03", label: "Alternate service location verified with client care plan" },
  { code: "RES-04", label: "Client paper signature form received and filed" },
  { code: "RES-05", label: "Client voice attestation verified by phone supervisor" },
  { code: "RES-06", label: "Caregiver timesheet correction approved by supervisor" },
  { code: "RES-07", label: "Resubmitted with corrected Medicaid authorization ID" },
  { code: "RES-08", label: "Schedule adjustment retroactively authorized by case manager" },
];

export const EVV_REVIEWERS: EvvReviewer[] = [
  { id: "REV-1", name: "Dana Jenkins, MSW", role: "Agency Operations Admin", email: "dana.jenkins@lilisare.com", avatarInitials: "DJ" },
  { id: "REV-2", name: "Carlos Mendez, RN", role: "Clinical Supervisor", email: "carlos.mendez@lilisare.com", avatarInitials: "CM" },
  { id: "REV-3", name: "Marcus Vance", role: "Lead Dispatcher & Scheduler", email: "marcus.vance@lilisare.com", avatarInitials: "MV" },
  { id: "REV-4", name: "Sarah Alverez", role: "Billing & Compliance Auditor", email: "sarah.alverez@lilisare.com", avatarInitials: "SA" },
];

export const INITIAL_EVV_RULES: EvvToleranceRule[] = [
  {
    id: "RULE-001",
    ruleName: "Colorado Medicaid Standard (HCBS/EBD)",
    payer: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    serviceCode: "ALL",
    serviceName: "All HCBS Services",
    clockInToleranceMinutes: 10,
    clockOutToleranceMinutes: 10,
    earlyArrivalHandling: "Allow within Grace",
    lateArrivalHandling: "Allow within Grace",
    earlyDepartureHandling: "Require Supervisor Approval",
    lateDepartureHandling: "Allow within Grace",
    reviewRequired: false,
    approvalRequired: false,
    effectiveDate: "2026-01-01",
    isActive: true,
    description: "Standard state Medicaid tolerance window allowing +/-10 minutes arrival/departure without flagging exception.",
  },
  {
    id: "RULE-002",
    ruleName: "CES Waiver Strict Tolerance & Geofence",
    payer: "Health First Colorado (Medicaid)",
    program: "CES",
    serviceCode: "CES-WVR",
    serviceName: "Children's Extensive Support",
    clockInToleranceMinutes: 7,
    clockOutToleranceMinutes: 7,
    earlyArrivalHandling: "Flag for Review",
    lateArrivalHandling: "Require Reason",
    earlyDepartureHandling: "Flag Exception",
    lateDepartureHandling: "Require Overtime Approval",
    reviewRequired: true,
    approvalRequired: true,
    effectiveDate: "2026-01-01",
    isActive: true,
    description: "High-acuity pediatric waiver requires strict 7-minute window and supervisor sign-off on any geofence variance.",
  },
  {
    id: "RULE-003",
    ruleName: "IHSS Extended Grace Rule",
    payer: "Health First Colorado (Medicaid)",
    program: "IHSS",
    serviceCode: "T1019-IHSS",
    serviceName: "In-Home Support Services",
    clockInToleranceMinutes: 15,
    clockOutToleranceMinutes: 15,
    earlyArrivalHandling: "Allow",
    lateArrivalHandling: "Allow within Grace",
    earlyDepartureHandling: "Allow within Grace",
    lateDepartureHandling: "Allow within Grace",
    reviewRequired: false,
    approvalRequired: false,
    effectiveDate: "2026-02-01",
    isActive: true,
    description: "Family-directed care model permits up to 15 minutes variance to accommodate household schedules.",
  },
  {
    id: "RULE-004",
    ruleName: "Commercial & Private Duty Policy",
    payer: "Commercial / Private Insurance",
    program: "Private Duty",
    serviceCode: "ALL",
    serviceName: "All Commercial Services",
    clockInToleranceMinutes: 15,
    clockOutToleranceMinutes: 15,
    earlyArrivalHandling: "Round to Schedule",
    lateArrivalHandling: "Allow within Grace",
    earlyDepartureHandling: "Flag Exception",
    lateDepartureHandling: "Require Overtime Approval",
    reviewRequired: false,
    approvalRequired: false,
    effectiveDate: "2026-01-01",
    isActive: true,
    description: "Private pay visits adhere to scheduled rounding rules unless overtime is formally authorized.",
  },
];

function createInitialVisits(): EvvVisitRecord[] {
  const visits: EvvVisitRecord[] = [];

  // 1. Illustrative Record 1: Rahul Sharma, Client John Smith
  // 10:00 - 14:00, Actual: 10:01 - 14:02 (+1m / +2m -> WITHIN TOLERANCE)
  // Scenario A & F: Verified, Cleared for Billing, Cleared for Payroll
  visits.push({
    id: "EVV-2026-001",
    visitNumber: "#401",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1011",
    clientId: "CL-1007",
    clientName: "John Smith",
    clientPhone: "(303) 555-0142",
    clientAddress: "1284 Oakridge Ave, Denver, CO 80204",
    clientMedicaidId: "CO-MED-994102",
    householdId: "hh-1007",
    householdName: "Smith Residence",
    caregiverId: "CG-101",
    caregiverName: "Rahul Sharma",
    caregiverPhone: "(303) 555-8821",
    caregiverRole: "Certified Nurse Aide (CNA)",
    caregiverClassification: "W-2",
    serviceName: "Personal Care",
    serviceCode: "T1019",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-4410",
    authorizedHours: 20,
    billRate: 34.0,
    payRate: 22.5,
    scheduledStartTime: "10:00",
    scheduledEndTime: "14:00",
    scheduledDurationHours: 4.0,
    actualClockInTime: "10:01",
    actualClockOutTime: "14:02",
    actualDurationHours: 4.02,
    varianceMinutes: 3,
    varianceDisplay: "+1m in / +2m out (Within tolerance)",
    varianceStatus: "Within Tolerance",
    captureMethod: "Mobile GPS",
    visitStatus: "Completed",
    verificationStatus: "Verified",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Verified",
    clockInLocation: {
      address: "1284 Oakridge Ave, Denver, CO 80204",
      lat: 39.7392,
      lng: -104.9903,
      accuracyMeters: 6,
      withinGeofence: true,
      distanceFeet: 42,
      timestamp: "2026-11-25 10:01:14 AM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "1284 Oakridge Ave, Denver, CO 80204",
    },
    clockOutLocation: {
      address: "1284 Oakridge Ave, Denver, CO 80204",
      lat: 39.7392,
      lng: -104.9903,
      accuracyMeters: 5,
      withinGeofence: true,
      distanceFeet: 38,
      timestamp: "2026-11-25 02:02:40 PM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "1284 Oakridge Ave, Denver, CO 80204",
    },
    patientVerification: {
      signatureCaptured: "Yes",
      voiceVerificationCaptured: "Not applicable",
      patientConfirmedService: "Yes",
      patientConfirmedTime: "Yes",
      verificationTimestamp: "2026-11-25 02:02:45 PM",
      signatureType: "Digital Signature",
      evidenceRef: "SIG-CO-2026-4410-01",
    },
    sixElements: {
      serviceType: { verified: true, value: "T1019 - Personal Care" },
      individualReceiving: { verified: true, value: "John Smith (CO-MED-994102)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: true, value: "1284 Oakridge Ave, Denver, CO 80204 (Within geofence, 42ft)" },
      individualProviding: { verified: true, value: "Rahul Sharma (CG-101)" },
      timeBeginsAndEnds: { verified: true, value: "10:01 AM – 02:02 PM (4.02 hrs)" },
    },
    tasksCompleted: ["Assistance with transfers", "Bathing & hygiene", "Nutritional lunch meal prep", "Medication reminder"],
    careNotes: "Client was alert and in good spirits. Assisted with warm sponge bath and provided balance support. Prepared chicken vegetable soup.",
    clientSignatureCaptured: true,
    clientSignatureTimestamp: "2026-11-25 02:02 PM",
    signatureType: "Digital Signature",
    billingReadiness: "Cleared for Billing",
    payrollReadiness: "Cleared for Payroll",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Accepted",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    aggregatorSubmissionId: "SUB-2026-9810",
    reviewNotes: [
      {
        id: "rn-001-1",
        reviewerName: "System Audit Engine",
        reviewerRole: "Automated Compliance",
        timestamp: "2026-11-25 02:05 PM",
        note: "Visit verified automatically: 6 federal elements validated, variance (+1m / +2m) is within 10-minute tolerance.",
        action: "NOTE_ADDED",
      },
    ],
    timeline: [
      {
        id: "t-001-1",
        timestamp: "2026-11-25 10:01 AM",
        actor: "Rahul Sharma",
        actorRole: "Caregiver (Mobile GPS)",
        event: "Clock-in Verified",
        details: "GPS geofence match (42ft from service address).",
        badgeType: "success",
      },
      {
        id: "t-001-2",
        timestamp: "2026-11-25 02:02 PM",
        actor: "Rahul Sharma",
        actorRole: "Caregiver (Mobile GPS)",
        event: "Clock-out & Digital Signature Captured",
        details: "Client John Smith signed digitally on caregiver device.",
        badgeType: "success",
      },
      {
        id: "t-001-3",
        timestamp: "2026-11-25 02:15 PM",
        actor: "EVV Aggregator Engine",
        actorRole: "State Gateway",
        event: "Aggregator Ingestion Accepted",
        details: "Transmission SUB-2026-9810 confirmed with response code 200.",
        badgeType: "success",
      },
    ],
  });

  // 2. Illustrative Record 2: Priya Patel, Client Michael Brown
  // In progress, Scheduled 09:00 - 13:00, Actual 08:58 - In Progress
  // Scenario B: Missing clock-out (>2 hrs overdue), Exception
  visits.push({
    id: "EVV-2026-002",
    visitNumber: "#402",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1012",
    clientId: "CL-1008",
    clientName: "Michael Brown",
    clientPhone: "(303) 555-0198",
    clientAddress: "450 Spruce St, Boulder, CO 80302",
    clientMedicaidId: "CO-MED-841920",
    householdId: "hh-1008",
    householdName: "Brown Household",
    caregiverId: "CG-103",
    caregiverName: "Priya Patel",
    caregiverPhone: "(720) 555-4122",
    caregiverRole: "Home Health Aide (HHA)",
    caregiverClassification: "W-2",
    serviceName: "Homemaker",
    serviceCode: "S5130",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-1189",
    authorizedHours: 15,
    billRate: 31.0,
    payRate: 20.0,
    scheduledStartTime: "09:00",
    scheduledEndTime: "13:00",
    scheduledDurationHours: 4.0,
    actualClockInTime: "08:58",
    actualClockOutTime: undefined,
    actualDurationHours: 6.8,
    varianceMinutes: -2,
    varianceDisplay: "-2m in / Clock-out Missing",
    varianceStatus: "Missing Events",
    captureMethod: "Mobile GPS",
    visitStatus: "In Progress",
    verificationStatus: "Exception",
    exceptionType: "MISSING_CLOCK_IN_OUT",
    exceptionTitle: "Missing clock-out",
    exceptionReason: "Missing clock-out (>2 hrs past planned shift end)",
    exceptionDescription: "Shift scheduled until 1:00 PM. Currently >2 hours past planned shift end with no clock-out timestamp recorded.",
    exceptionDateFlagged: "2026-11-25 01:15 PM",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Verified",
    clockInLocation: {
      address: "450 Spruce St, Boulder, CO 80302",
      lat: 40.015,
      lng: -105.2705,
      accuracyMeters: 8,
      withinGeofence: true,
      distanceFeet: 55,
      timestamp: "2026-11-25 08:58:22 AM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "450 Spruce St, Boulder, CO 80302",
    },
    patientVerification: {
      signatureCaptured: "No",
      voiceVerificationCaptured: "No",
      patientConfirmedService: "Not captured",
      patientConfirmedTime: "Not captured",
      signatureType: "None",
    },
    sixElements: {
      serviceType: { verified: true, value: "S5130 - Homemaker" },
      individualReceiving: { verified: true, value: "Michael Brown (CO-MED-841920)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: true, value: "450 Spruce St, Boulder, CO 80302 (Within geofence, 55ft)" },
      individualProviding: { verified: true, value: "Priya Patel (CG-103)" },
      timeBeginsAndEnds: { verified: false, value: "Clock-in 08:58 AM; Clock-out MISSING", notes: "Awaiting end time" },
    },
    tasksCompleted: ["Light housekeeping", "Laundry", "Trash removal"],
    careNotes: "In-progress shift. Completed kitchen sanitation and started laundry cycle.",
    clientSignatureCaptured: false,
    signatureType: "Declined",
    billingReadiness: "Blocked",
    payrollReadiness: "Blocked",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Not Submitted",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    assignedReviewer: "Dana Jenkins, MSW",
    reviewNotes: [
      {
        id: "rn-002-1",
        reviewerName: "Dana Jenkins, MSW",
        reviewerRole: "Agency Operations Admin",
        timestamp: "2026-11-25 01:45 PM",
        note: "Sent mobile push notification reminder to Priya Patel to confirm shift completion and submit clock-out.",
        action: "INVESTIGATION_STARTED",
      },
    ],
    timeline: [
      {
        id: "t-002-1",
        timestamp: "2026-11-25 08:58 AM",
        actor: "Priya Patel",
        actorRole: "Caregiver (Mobile GPS)",
        event: "Clock-in Captured",
        details: "GPS verified at 450 Spruce St. Geofence distance 55ft.",
        badgeType: "info",
      },
      {
        id: "t-002-2",
        timestamp: "2026-11-25 01:15 PM",
        actor: "EVV Monitoring Engine",
        actorRole: "Automated Compliance",
        event: "Exception Flagged: Overdue Clock-out",
        details: "Scheduled end was 01:00 PM. Shift exceeded grace period (+15 mins) without clock-out.",
        badgeType: "warning",
      },
    ],
  });

  // 3. Illustrative Record 3: David Wilson, Client Emily Jones
  // 08:30 - 11:30, Actual: 08:31 - 11:33 (+1m / +3m time variance is within tolerance!)
  // Scenario C & F: Location issue (GPS recorded 1,480 ft outside geofence).
  // Note: Time variance is within tolerance, so exception is strictly location!
  visits.push({
    id: "EVV-2026-003",
    visitNumber: "#403",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1013",
    clientId: "CL-1009",
    clientName: "Emily Jones",
    clientPhone: "(303) 555-0814",
    clientAddress: "7820 S University Blvd, Centennial, CO 80122",
    clientMedicaidId: "CO-MED-772154",
    householdId: "hh-1009",
    householdName: "Jones Residence",
    caregiverId: "CG-104",
    caregiverName: "David Wilson",
    caregiverPhone: "(720) 555-9012",
    caregiverRole: "Personal Care Worker",
    caregiverClassification: "Direct Care Worker",
    serviceName: "Personal Care",
    serviceCode: "T1019",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-7833",
    authorizedHours: 18,
    billRate: 34.0,
    payRate: 22.0,
    scheduledStartTime: "08:30",
    scheduledEndTime: "11:30",
    scheduledDurationHours: 3.0,
    actualClockInTime: "08:31",
    actualClockOutTime: "11:33",
    actualDurationHours: 3.03,
    varianceMinutes: 4,
    varianceDisplay: "+1m in / +3m out (Time within tol.)",
    varianceStatus: "Within Tolerance",
    captureMethod: "Mobile GPS",
    visitStatus: "Completed",
    verificationStatus: "Exception",
    exceptionType: "LOCATION_VERIFICATION",
    exceptionTitle: "Location verification issue",
    exceptionReason: "Outside approved service location (1,480ft from residence)",
    exceptionDescription: "Clock-in GPS coordinates recorded 1,480 feet outside designated residential geofence (250ft threshold).",
    exceptionDateFlagged: "2026-11-25 08:32 AM",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Outside Geofence",
    clockInLocation: {
      address: "8100 S University Blvd, Centennial, CO 80122",
      lat: 39.5742,
      lng: -104.9589,
      accuracyMeters: 28,
      withinGeofence: false,
      distanceFeet: 1480,
      timestamp: "2026-11-25 08:31:05 AM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "7820 S University Blvd, Centennial, CO 80122",
    },
    clockOutLocation: {
      address: "7820 S University Blvd, Centennial, CO 80122",
      lat: 39.5781,
      lng: -104.9592,
      accuracyMeters: 7,
      withinGeofence: true,
      distanceFeet: 40,
      timestamp: "2026-11-25 11:33:10 AM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "7820 S University Blvd, Centennial, CO 80122",
    },
    patientVerification: {
      signatureCaptured: "Yes",
      voiceVerificationCaptured: "Not applicable",
      patientConfirmedService: "Yes",
      patientConfirmedTime: "Yes",
      verificationTimestamp: "2026-11-25 11:33:20 AM",
      signatureType: "Digital Signature",
      evidenceRef: "SIG-CO-2026-7833-03",
    },
    sixElements: {
      serviceType: { verified: true, value: "T1019 - Personal Care" },
      individualReceiving: { verified: true, value: "Emily Jones (CO-MED-772154)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: {
        verified: false,
        value: "Clock-in 1,480ft outside geofence (8100 S University Blvd)",
        notes: "Requires supervisor investigation of alternate location",
      },
      individualProviding: { verified: true, value: "David Wilson (CG-104)" },
      timeBeginsAndEnds: { verified: true, value: "08:31 AM – 11:33 AM (3.03 hrs)" },
    },
    tasksCompleted: ["Grooming & dressing", "Ambulation assistance", "Breakfast prep"],
    careNotes: "Met client at nearby pharmacy plaza before returning to residence. Assisted with morning routine and safe transfer.",
    clientSignatureCaptured: true,
    clientSignatureTimestamp: "2026-11-25 11:33 AM",
    signatureType: "Digital Signature",
    billingReadiness: "Blocked",
    payrollReadiness: "Ready for Review",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Submitted",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    aggregatorSubmissionId: "SUB-2026-9811",
    assignedReviewer: "Carlos Mendez, RN",
    reviewNotes: [
      {
        id: "rn-003-1",
        reviewerName: "Carlos Mendez, RN",
        reviewerRole: "Clinical Supervisor",
        timestamp: "2026-11-25 09:10 AM",
        note: "Caregiver contacted: Clock-in occurred at Walgreens pharmacy accompanying client for urgent prescription pickup. Verifying care plan authorized community outing.",
        action: "INVESTIGATION_STARTED",
      },
    ],
    timeline: [
      {
        id: "t-003-1",
        timestamp: "2026-11-25 08:31 AM",
        actor: "David Wilson",
        actorRole: "Caregiver (Mobile GPS)",
        event: "Clock-in Flagged (Outside Geofence)",
        details: "Coordinates captured at 8100 S University Blvd (1,480ft outside 250ft perimeter).",
        badgeType: "warning",
      },
      {
        id: "t-003-2",
        timestamp: "2026-11-25 11:33 AM",
        actor: "David Wilson",
        actorRole: "Caregiver (Mobile GPS)",
        event: "Clock-out & Signature Verified",
        details: "Clock-out GPS within geofence (40ft). Digital signature recorded.",
        badgeType: "success",
      },
    ],
  });

  // 4. Illustrative Record 4: Clara Jenkins, Client Raymond Chen
  // 08:00 - 16:00, Actual: 08:00 - 16:00 (Telephony IVR)
  // Verified, Cleared for Billing
  visits.push({
    id: "EVV-2026-004",
    visitNumber: "#404",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1008",
    clientId: "CL-1004",
    clientName: "Raymond Chen",
    clientPhone: "(303) 555-0550",
    clientAddress: "5500 E 6th Ave, Denver, CO 80220",
    clientMedicaidId: "CO-MED-1004",
    householdId: "hh-1004",
    householdName: "Chen Household",
    caregiverId: "CG-105",
    caregiverName: "Clara Jenkins",
    caregiverPhone: "(541) 555-0245",
    caregiverRole: "Direct Care Worker",
    caregiverClassification: "1099",
    serviceName: "Companion Care",
    serviceCode: "S5125",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-3390",
    authorizedHours: 24,
    billRate: 29.0,
    payRate: 19.5,
    scheduledStartTime: "08:00",
    scheduledEndTime: "16:00",
    scheduledDurationHours: 8.0,
    actualClockInTime: "08:00",
    actualClockOutTime: "16:00",
    actualDurationHours: 8.0,
    varianceMinutes: 0,
    varianceDisplay: "On schedule (0m)",
    varianceStatus: "On Schedule",
    captureMethod: "Telephony / IVR",
    visitStatus: "Completed",
    verificationStatus: "Verified",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Verified",
    clockInLocation: {
      address: "5500 E 6th Ave, Denver, CO 80220 (Client Home Landline)",
      withinGeofence: true,
      timestamp: "2026-11-25 08:00:10 AM",
      method: "Telephony / IVR",
      coordinatesAvailable: false,
      approvedAddress: "5500 E 6th Ave, Denver, CO 80220",
    },
    clockOutLocation: {
      address: "5500 E 6th Ave, Denver, CO 80220 (Client Home Landline)",
      withinGeofence: true,
      timestamp: "2026-11-25 04:00:15 PM",
      method: "Telephony / IVR",
      coordinatesAvailable: false,
      approvedAddress: "5500 E 6th Ave, Denver, CO 80220",
    },
    patientVerification: {
      signatureCaptured: "Not applicable",
      voiceVerificationCaptured: "Yes",
      patientConfirmedService: "Yes",
      patientConfirmedTime: "Yes",
      verificationTimestamp: "2026-11-25 04:01:00 PM",
      signatureType: "Voice Attestation",
      evidenceRef: "IVR-AUDIO-2026-3390-04",
      notes: "Client authenticated via registered home landline caller ID (303) 555-0550 and voice pin.",
    },
    sixElements: {
      serviceType: { verified: true, value: "S5125 - Companion Care" },
      individualReceiving: { verified: true, value: "Raymond Chen (CO-MED-1004)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: true, value: "5500 E 6th Ave, Denver, CO (Registered Client Landline)" },
      individualProviding: { verified: true, value: "Clara Jenkins (CG-105)" },
      timeBeginsAndEnds: { verified: true, value: "08:00 AM – 04:00 PM (8.00 hrs)" },
    },
    tasksCompleted: ["Companionship & cognitive stimulation", "Safety monitoring", "Meal preparation"],
    careNotes: "Completed full 8-hour shift. Client was engaged in memory exercises and light garden walk.",
    clientSignatureCaptured: true,
    clientSignatureTimestamp: "2026-11-25 04:01 PM",
    signatureType: "Voice Attestation",
    billingReadiness: "Cleared for Billing",
    payrollReadiness: "Cleared for Payroll",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Accepted",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    aggregatorSubmissionId: "SUB-2026-9812",
    reviewNotes: [],
    timeline: [
      {
        id: "t-004-1",
        timestamp: "2026-11-25 08:00 AM",
        actor: "Clara Jenkins",
        actorRole: "Caregiver (Telephony IVR)",
        event: "Telephony Clock-in Verified",
        details: "Call placed from registered client phone (303) 555-0550.",
        badgeType: "success",
      },
      {
        id: "t-004-2",
        timestamp: "2026-11-25 04:00 PM",
        actor: "Clara Jenkins",
        actorRole: "Caregiver (Telephony IVR)",
        event: "Telephony Clock-out & Voice Attestation",
        details: "Client voice PIN confirmed service hours.",
        badgeType: "success",
      },
    ],
  });

  // 5. Illustrative Record 5: Marcus Vance, Client Sophia Patel
  // Fixed Device / FOB Token
  visits.push({
    id: "EVV-2026-005",
    visitNumber: "#405",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1009",
    clientId: "CL-1005",
    clientName: "Sophia Patel",
    clientPhone: "(303) 555-1940",
    clientAddress: "1940 Colorado Blvd, Denver, CO 80220",
    clientMedicaidId: "CO-MED-1005",
    householdId: "hh-1005",
    householdName: "Patel Household",
    caregiverId: "CG-106",
    caregiverName: "Marcus Vance",
    caregiverPhone: "(503) 555-8812",
    caregiverRole: "Certified Nurse Aide (CNA)",
    caregiverClassification: "W-2",
    serviceName: "CES Waiver (Children’s Extensive Support)",
    serviceCode: "CES-WVR",
    payerName: "Health First Colorado (Medicaid)",
    program: "CES",
    authorizationNumber: "AUTH-CO-2026-9921",
    authorizedHours: 16,
    billRate: 42.0,
    payRate: 26.0,
    scheduledStartTime: "07:00",
    scheduledEndTime: "11:00",
    scheduledDurationHours: 4.0,
    actualClockInTime: "07:02",
    actualClockOutTime: "11:01",
    actualDurationHours: 3.98,
    varianceMinutes: 1,
    varianceDisplay: "+2m in / +1m out (Within 7m CES tol.)",
    varianceStatus: "Within Tolerance",
    captureMethod: "Fixed Device",
    visitStatus: "Completed",
    verificationStatus: "Verified",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Verified",
    clockInLocation: {
      address: "1940 Colorado Blvd, Denver, CO 80220 (Fixed In-Home FOB: FOB-9042)",
      withinGeofence: true,
      timestamp: "2026-11-25 07:02:15 AM",
      method: "Fixed Device",
      coordinatesAvailable: false,
      approvedAddress: "1940 Colorado Blvd, Denver, CO 80220",
    },
    clockOutLocation: {
      address: "1940 Colorado Blvd, Denver, CO 80220 (Fixed In-Home FOB: FOB-9042)",
      withinGeofence: true,
      timestamp: "2026-11-25 11:01:20 AM",
      method: "Fixed Device",
      coordinatesAvailable: false,
      approvedAddress: "1940 Colorado Blvd, Denver, CO 80220",
    },
    patientVerification: {
      signatureCaptured: "Yes",
      voiceVerificationCaptured: "Not applicable",
      patientConfirmedService: "Yes",
      patientConfirmedTime: "Yes",
      verificationTimestamp: "2026-11-25 11:01:45 AM",
      signatureType: "Digital Signature",
      evidenceRef: "FOB-CO-2026-9921-05",
      notes: "Mother/Authorized Representative signed digitally on tablet.",
    },
    sixElements: {
      serviceType: { verified: true, value: "CES-WVR - Children's Extensive Support" },
      individualReceiving: { verified: true, value: "Sophia Patel (CO-MED-1005)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: true, value: "1940 Colorado Blvd (Fixed In-Home FOB Unit #9042)" },
      individualProviding: { verified: true, value: "Marcus Vance (CG-106)" },
      timeBeginsAndEnds: { verified: true, value: "07:02 AM – 11:01 AM (3.98 hrs)" },
    },
    tasksCompleted: ["Pediatric sensory integration", "G-tube feed support", "Mobility transfer"],
    careNotes: "Morning routine completed without distress. G-tube flush successful per nursing protocol.",
    clientSignatureCaptured: true,
    clientSignatureTimestamp: "2026-11-25 11:01 AM",
    signatureType: "Digital Signature",
    billingReadiness: "Cleared for Billing",
    payrollReadiness: "Cleared for Payroll",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Accepted",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    aggregatorSubmissionId: "SUB-2026-9813",
    reviewNotes: [],
    timeline: [
      {
        id: "t-005-1",
        timestamp: "2026-11-25 07:02 AM",
        actor: "Marcus Vance",
        actorRole: "Caregiver (Fixed Device)",
        event: "Fixed Device Token Captured",
        details: "In-home FOB serial #FOB-9042 rolling passcode authenticated.",
        badgeType: "success",
      },
    ],
  });

  // 6. Record 6: Elena Rostova, Client Evelyn Foster
  // 09:00 - 13:00, Actual: 09:00 - 15:30 (+2.5 hrs unauthorized overtime)
  // Scenario: Duration mismatch exception, Blocked for billing & payroll review
  visits.push({
    id: "EVV-2026-006",
    visitNumber: "#406",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1010",
    clientId: "CL-1006",
    clientName: "Evelyn Foster",
    clientPhone: "(303) 555-8800",
    clientAddress: "880 Broadway, Boulder, CO 80302",
    clientMedicaidId: "CO-MED-1006",
    householdId: "hh-1006",
    householdName: "Foster Household",
    caregiverId: "CG-107",
    caregiverName: "Elena Rostova",
    caregiverPhone: "(303) 555-1144",
    caregiverRole: "Direct Care Professional",
    caregiverClassification: "Direct Care Worker",
    serviceName: "Homemaker",
    serviceCode: "S5130",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-7711",
    authorizedHours: 12,
    billRate: 31.0,
    payRate: 20.0,
    scheduledStartTime: "09:00",
    scheduledEndTime: "13:00",
    scheduledDurationHours: 4.0,
    actualClockInTime: "09:00",
    actualClockOutTime: "15:30",
    actualDurationHours: 6.5,
    varianceMinutes: 150,
    varianceDisplay: "+2.5 hrs (Outside tolerance)",
    varianceStatus: "Outside Tolerance",
    captureMethod: "Mobile GPS",
    visitStatus: "Completed",
    verificationStatus: "Exception",
    exceptionType: "DURATION_MISMATCH",
    exceptionTitle: "Visit duration mismatch (+2.5 hrs unauthorized)",
    exceptionReason: "Visit duration mismatch (+2.5 hrs unauthorized extension)",
    exceptionDescription: "Actual shift duration exceeded authorized scheduled window by 2.5 hours without prior schedule revision.",
    exceptionDateFlagged: "2026-11-25 03:35 PM",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Verified",
    clockInLocation: {
      address: "880 Broadway, Boulder, CO 80302",
      lat: 40.015,
      lng: -105.279,
      accuracyMeters: 5,
      withinGeofence: true,
      distanceFeet: 30,
      timestamp: "2026-11-25 09:00:10 AM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "880 Broadway, Boulder, CO 80302",
    },
    clockOutLocation: {
      address: "880 Broadway, Boulder, CO 80302",
      lat: 40.015,
      lng: -105.279,
      accuracyMeters: 6,
      withinGeofence: true,
      distanceFeet: 35,
      timestamp: "2026-11-25 03:30:15 PM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "880 Broadway, Boulder, CO 80302",
    },
    patientVerification: {
      signatureCaptured: "Yes",
      voiceVerificationCaptured: "Not applicable",
      patientConfirmedService: "Yes",
      patientConfirmedTime: "No",
      verificationTimestamp: "2026-11-25 03:30:40 PM",
      signatureType: "Digital Signature",
      notes: "Client signed but noted caregiver stayed to help family with unexpected emergency.",
    },
    sixElements: {
      serviceType: { verified: true, value: "S5130 - Homemaker" },
      individualReceiving: { verified: true, value: "Evelyn Foster (CO-MED-1006)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: true, value: "880 Broadway, Boulder, CO 80302" },
      individualProviding: { verified: true, value: "Elena Rostova (CG-107)" },
      timeBeginsAndEnds: { verified: false, value: "09:00 AM – 03:30 PM (6.5 hrs vs 4.0 scheduled)", notes: "Exceeds schedule" },
    },
    tasksCompleted: ["Extended home cleaning", "Laundry", "Family emergency support"],
    careNotes: "Stayed beyond schedule at daughter's request due to minor water leak in kitchen.",
    clientSignatureCaptured: true,
    clientSignatureTimestamp: "2026-11-25 03:30 PM",
    signatureType: "Digital Signature",
    billingReadiness: "Blocked",
    payrollReadiness: "Blocked",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Queued",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    aggregatorSubmissionId: "SUB-2026-9814",
    assignedReviewer: "Marcus Vance",
    reviewNotes: [
      {
        id: "rn-006-1",
        reviewerName: "Marcus Vance",
        reviewerRole: "Lead Dispatcher & Scheduler",
        timestamp: "2026-11-25 03:45 PM",
        note: "Flagged +2.5 hour overtime. Checking weekly authorization cap with Case Manager before approving billing.",
        action: "INVESTIGATION_STARTED",
      },
    ],
    timeline: [],
  });

  // 7. Record 7: Samuel O'Connor, Client Angela Martinez
  // 12:00 - 16:00, Actual: 12:01 - 16:02 (+1m / +2m time variance is within tolerance!)
  // Scenario D & F: Patient verification missing (signature missing)
  // Note: Consistent tolerance: 1-2m variance is NOT the exception reason!
  visits.push({
    id: "EVV-2026-007",
    visitNumber: "#407",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1010",
    clientId: "CL-1005",
    clientName: "Angela Martinez",
    clientPhone: "(303) 555-4921",
    clientAddress: "1420 Champa St, Denver, CO 80202",
    clientMedicaidId: "CO-MED-7719",
    householdId: "hh-1005",
    householdName: "Martinez Household",
    caregiverId: "CG-108",
    caregiverName: "Samuel O'Connor",
    caregiverPhone: "(720) 555-3399",
    caregiverRole: "Direct Support Professional (DSP)",
    caregiverClassification: "W-2",
    serviceName: "Respite Care",
    serviceCode: "T1005",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-8802",
    authorizedHours: 12,
    billRate: 32.0,
    payRate: 21.0,
    scheduledStartTime: "12:00",
    scheduledEndTime: "16:00",
    scheduledDurationHours: 4.0,
    actualClockInTime: "12:01",
    actualClockOutTime: "16:02",
    actualDurationHours: 4.02,
    varianceMinutes: 3,
    varianceDisplay: "+1m in / +2m out (Time within tol.)",
    varianceStatus: "Within Tolerance",
    captureMethod: "Mobile GPS",
    visitStatus: "Completed",
    verificationStatus: "Exception",
    exceptionType: "MISSING_VISIT_INFO",
    exceptionTitle: "Missing visit information (No client signature)",
    exceptionReason: "Patient verification missing (No client signature or voice attestation)",
    exceptionDescription: "Care note recorded and location verified within geofence, but client verification signature/voice attestation was not captured upon departure.",
    exceptionDateFlagged: "2026-11-25 04:05 PM",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Verified",
    clockInLocation: {
      address: "1420 Champa St, Denver, CO 80202",
      lat: 39.747,
      lng: -104.996,
      accuracyMeters: 6,
      withinGeofence: true,
      distanceFeet: 40,
      timestamp: "2026-11-25 12:01:10 PM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "1420 Champa St, Denver, CO 80202",
    },
    clockOutLocation: {
      address: "1420 Champa St, Denver, CO 80202",
      lat: 39.747,
      lng: -104.996,
      accuracyMeters: 6,
      withinGeofence: true,
      distanceFeet: 45,
      timestamp: "2026-11-25 04:02:18 PM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "1420 Champa St, Denver, CO 80202",
    },
    patientVerification: {
      signatureCaptured: "No",
      voiceVerificationCaptured: "No",
      patientConfirmedService: "Not captured",
      patientConfirmedTime: "Not captured",
      signatureType: "Declined",
      notes: "Caregiver reported client was sleeping at shift conclusion; family caregiver departed early.",
    },
    sixElements: {
      serviceType: { verified: true, value: "T1005 - Respite Care" },
      individualReceiving: { verified: true, value: "Angela Martinez (CO-MED-7719)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: true, value: "1420 Champa St, Denver, CO 80202" },
      individualProviding: { verified: true, value: "Samuel O'Connor (CG-108)" },
      timeBeginsAndEnds: { verified: true, value: "12:01 PM – 04:02 PM (4.02 hrs)" },
    },
    tasksCompleted: ["Companionship", "Recreational support", "Snack prep"],
    careNotes: "Client rested comfortably throughout afternoon. No clinical changes.",
    clientSignatureCaptured: false,
    signatureType: "Declined",
    billingReadiness: "Blocked",
    payrollReadiness: "Ready for Review",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Queued",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    assignedReviewer: "Sarah Alverez",
    reviewNotes: [
      {
        id: "rn-007-1",
        reviewerName: "Sarah Alverez",
        reviewerRole: "Billing & Compliance Auditor",
        timestamp: "2026-11-25 04:15 PM",
        note: "Requested paper exception form or telephone follow-up from family caregiver to confirm hours.",
        action: "CORRECTION_REQUESTED",
      },
    ],
    timeline: [],
  });

  // 8. Record 8: Maya Lin, Client Grace Hopper
  // Scenario G FIX: Previously showed "Not Started" while Completed!
  // Scheduled: 10:30 - 14:30.
  // Coherent data: Shift was completed, but mobile app crashed at start, so clock-in was omitted.
  // Clock-out was recorded at 14:32.
  // Correction submitted by Maya Lin for clock-in: 10:30 AM (Reason: Mobile app crashed on arrival).
  // Status: Completed, Verification: Correction Required
  visits.push({
    id: "EVV-2026-008",
    visitNumber: "#408",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1014",
    clientId: "CL-1006",
    clientName: "Grace Hopper",
    clientPhone: "(303) 555-9018",
    clientAddress: "7200 E Hampden Ave, Denver, CO 80224",
    clientMedicaidId: "CO-MED-1014",
    householdId: "hh-1006",
    householdName: "Hopper Residence",
    caregiverId: "CG-109",
    caregiverName: "Maya Lin",
    caregiverPhone: "(303) 555-2255",
    caregiverRole: "Home Health Aide (HHA)",
    caregiverClassification: "W-2",
    serviceName: "Companion Care",
    serviceCode: "S5125",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-5541",
    authorizedHours: 14,
    billRate: 29.0,
    payRate: 19.5,
    scheduledStartTime: "10:30",
    scheduledEndTime: "14:30",
    scheduledDurationHours: 4.0,
    actualClockInTime: undefined, // Missing clock-in
    actualClockOutTime: "14:32",
    actualDurationHours: 4.0,
    varianceMinutes: 2,
    varianceDisplay: "Clock-in Missing / +2m out",
    varianceStatus: "Missing Events",
    captureMethod: "Mobile GPS",
    visitStatus: "Completed",
    verificationStatus: "Correction Required",
    exceptionType: "MISSING_CLOCK_IN_OUT",
    exceptionTitle: "Missing clock-in",
    exceptionReason: "Missing clock-in (Clock-out captured at 14:32 via Mobile App)",
    exceptionDescription: "Clock-out recorded via mobile app at 14:32, but start time clock-in event was omitted due to caregiver app crash.",
    exceptionDateFlagged: "2026-11-25 02:35 PM",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Verified",
    clockOutLocation: {
      address: "7200 E Hampden Ave, Denver, CO 80224",
      lat: 39.653,
      lng: -104.898,
      accuracyMeters: 6,
      withinGeofence: true,
      distanceFeet: 35,
      timestamp: "2026-11-25 02:32:15 PM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "7200 E Hampden Ave, Denver, CO 80224",
    },
    patientVerification: {
      signatureCaptured: "Yes",
      voiceVerificationCaptured: "Not applicable",
      patientConfirmedService: "Yes",
      patientConfirmedTime: "Yes",
      verificationTimestamp: "2026-11-25 02:32:45 PM",
      signatureType: "Digital Signature",
      evidenceRef: "SIG-CO-2026-5541-08",
    },
    sixElements: {
      serviceType: { verified: true, value: "S5125 - Companion Care" },
      individualReceiving: { verified: true, value: "Grace Hopper (CO-MED-1014)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: true, value: "7200 E Hampden Ave, Denver, CO 80224 (Within geofence, 35ft)" },
      individualProviding: { verified: true, value: "Maya Lin (CG-109)" },
      timeBeginsAndEnds: { verified: false, value: "Clock-in MISSING; Clock-out 02:32 PM", notes: "Correction submitted: 10:30 AM" },
    },
    tasksCompleted: ["Companion activities", "Light lunch meal prep", "Cognitive reading"],
    careNotes: "Completed full shift. Mobile app crashed upon arrival at 10:30 AM; device restarted later. Client confirmed start time.",
    clientSignatureCaptured: true,
    clientSignatureTimestamp: "2026-11-25 02:32 PM",
    signatureType: "Digital Signature",
    billingReadiness: "Blocked",
    payrollReadiness: "Blocked",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Retry Required",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    aggregatorSubmissionId: "SUB-2026-9816",
    aggregatorRejectionReason: "ERR-422: Missing mandatory clock-in timestamp in payload",
    assignedReviewer: "Dana Jenkins, MSW",
    corrections: [
      {
        id: "cor-008-1",
        visitId: "EVV-2026-008",
        fieldChanged: "actualClockInTime",
        originalValue: "[Omitted / App Crash]",
        correctedValue: "10:30 AM",
        reason: "RC-02: Mobile device failure / Dead battery on arrival",
        submittedBy: "Maya Lin (Caregiver)",
        submittedAt: "2026-11-25 02:35 PM",
        status: "Pending Approval",
      },
    ],
    reviewNotes: [
      {
        id: "rn-008-1",
        reviewerName: "Dana Jenkins, MSW",
        reviewerRole: "Agency Operations Admin",
        timestamp: "2026-11-25 02:45 PM",
        note: "Caregiver Maya Lin submitted timesheet correction for 10:30 AM arrival with client signature verification attached. Awaiting supervisor approval.",
        action: "INVESTIGATION_STARTED",
        reasonCode: "RC-02",
        reasonDescription: "Mobile device failure / Dead battery",
      },
    ],
    timeline: [
      {
        id: "t-008-1",
        timestamp: "2026-11-25 02:32 PM",
        actor: "Maya Lin",
        actorRole: "Caregiver (Mobile GPS)",
        event: "Clock-out & Client Signature Recorded",
        details: "Clock-out GPS verified at client residence. Client confirmed 10:30 AM arrival.",
        badgeType: "info",
      },
      {
        id: "t-008-2",
        timestamp: "2026-11-25 02:35 PM",
        actor: "Maya Lin",
        actorRole: "Caregiver (Portal Correction)",
        event: "Correction Submitted: Clock-in 10:30 AM",
        details: "Reason code RC-02: Device failure. Pending agency approval.",
        badgeType: "warning",
      },
    ],
  });

  // 9. Record 9: James Chen, Client Arthur Dent
  // 08:00 - 12:00, Actual: 08:02 - 12:04 (+2m / +4m time variance is within tolerance!)
  // Scenario C & F: Location accuracy low (GPS accuracy +/-95m due to basement apartment reception)
  // Time variance is within tolerance, so exception is strictly location accuracy!
  visits.push({
    id: "EVV-2026-009",
    visitNumber: "#409",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1015",
    clientId: "CL-1002",
    clientName: "Arthur Dent",
    clientPhone: "(319) 555-3820",
    clientAddress: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    clientMedicaidId: "IA-MED-1002",
    householdId: "hh-1002",
    householdName: "Dent Household",
    caregiverId: "CG-110",
    caregiverName: "James Chen",
    caregiverPhone: "(720) 555-6677",
    caregiverRole: "Homemaker Care Specialist",
    caregiverClassification: "Direct Care Worker",
    serviceName: "Homemaker",
    serviceCode: "S5130",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-4488",
    authorizedHours: 16,
    billRate: 31.0,
    payRate: 20.0,
    scheduledStartTime: "08:00",
    scheduledEndTime: "12:00",
    scheduledDurationHours: 4.0,
    actualClockInTime: "08:02",
    actualClockOutTime: "12:04",
    actualDurationHours: 4.03,
    varianceMinutes: 6,
    varianceDisplay: "+2m in / +4m out (Time within tol.)",
    varianceStatus: "Within Tolerance",
    captureMethod: "Mobile GPS",
    visitStatus: "Completed",
    verificationStatus: "Exception",
    exceptionType: "LOCATION_VERIFICATION",
    exceptionTitle: "Location verification issue (GPS accuracy low)",
    exceptionReason: "Location verification failed (GPS accuracy +/-95m in basement unit)",
    exceptionDescription: "Clock-in GPS accuracy was +/- 95 meters due to basement apartment reception.",
    exceptionDateFlagged: "2026-11-25 08:05 AM",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Accuracy Low",
    clockInLocation: {
      address: "1248 Oakwood Drive, Cedar Falls, IA 50613",
      lat: 42.534,
      lng: -92.445,
      accuracyMeters: 95,
      withinGeofence: true,
      distanceFeet: 110,
      timestamp: "2026-11-25 08:02:10 AM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    },
    clockOutLocation: {
      address: "1248 Oakwood Drive, Cedar Falls, IA 50613",
      lat: 42.534,
      lng: -92.445,
      accuracyMeters: 88,
      withinGeofence: true,
      distanceFeet: 105,
      timestamp: "2026-11-25 12:04:15 PM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "1248 Oakwood Drive, Cedar Falls, IA 50613",
    },
    patientVerification: {
      signatureCaptured: "Yes",
      voiceVerificationCaptured: "Not applicable",
      patientConfirmedService: "Yes",
      patientConfirmedTime: "Yes",
      verificationTimestamp: "2026-11-25 12:04:30 PM",
      signatureType: "Digital Signature",
      evidenceRef: "SIG-IA-2026-4488-09",
    },
    sixElements: {
      serviceType: { verified: true, value: "S5130 - Homemaker" },
      individualReceiving: { verified: true, value: "Arthur Dent (IA-MED-1002)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: false, value: "1248 Oakwood Drive (Low GPS accuracy +/-95m)", notes: "Basement drift" },
      individualProviding: { verified: true, value: "James Chen (CG-110)" },
      timeBeginsAndEnds: { verified: true, value: "08:02 AM – 12:04 PM (4.03 hrs)" },
    },
    tasksCompleted: ["Kitchen cleaning", "Linen change", "Dishes & surfaces"],
    careNotes: "Completed routine housekeeping. Cellular signal was weak inside basement apartment.",
    clientSignatureCaptured: true,
    clientSignatureTimestamp: "2026-11-25 12:04 PM",
    signatureType: "Digital Signature",
    billingReadiness: "Ready for Review",
    payrollReadiness: "Ready for Review",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Acknowledgement Pending",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    aggregatorSubmissionId: "SUB-2026-9817",
    assignedReviewer: "Carlos Mendez, RN",
    reviewNotes: [
      {
        id: "rn-009-1",
        reviewerName: "Carlos Mendez, RN",
        reviewerRole: "Clinical Supervisor",
        timestamp: "2026-11-25 08:30 AM",
        note: "Caregiver noted persistent cellular drift in garden level apartment. Corroborated with previous visit telemetry history.",
        action: "INVESTIGATION_STARTED",
        reasonCode: "RC-07",
        reasonDescription: "GPS signal drift / High-rise residential interference",
      },
    ],
    timeline: [],
  });

  // 10. Record 10: Hannah Abbott, Client Beatrice Hall
  // In progress
  visits.push({
    id: "EVV-2026-010",
    visitNumber: "#410",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1016",
    clientId: "CL-1010",
    clientName: "Beatrice Hall",
    clientPhone: "(303) 555-2201",
    clientAddress: "2201 S Oneida St, Denver, CO 80224",
    clientMedicaidId: "CO-MED-1010",
    householdId: "hh-1010",
    householdName: "Hall Household",
    caregiverId: "CG-111",
    caregiverName: "Hannah Abbott",
    caregiverPhone: "(303) 555-4422",
    caregiverRole: "Direct Support Professional",
    caregiverClassification: "W-2",
    serviceName: "Personal Care",
    serviceCode: "T1019",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-6632",
    authorizedHours: 20,
    billRate: 34.0,
    payRate: 22.0,
    scheduledStartTime: "13:00",
    scheduledEndTime: "17:00",
    scheduledDurationHours: 4.0,
    actualClockInTime: "13:05",
    actualClockOutTime: undefined,
    actualDurationHours: 2.7,
    varianceMinutes: 5,
    varianceDisplay: "+5m in / In Progress",
    varianceStatus: "Within Tolerance",
    captureMethod: "Mobile GPS",
    visitStatus: "In Progress",
    verificationStatus: "Pending",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Verified",
    clockInLocation: {
      address: "2201 S Oneida St, Denver, CO 80224",
      lat: 39.676,
      lng: -104.908,
      accuracyMeters: 6,
      withinGeofence: true,
      distanceFeet: 35,
      timestamp: "2026-11-25 01:05:10 PM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "2201 S Oneida St, Denver, CO 80224",
    },
    patientVerification: {
      signatureCaptured: "No",
      voiceVerificationCaptured: "No",
      patientConfirmedService: "Not captured",
      patientConfirmedTime: "Not captured",
      signatureType: "None",
    },
    sixElements: {
      serviceType: { verified: true, value: "T1019 - Personal Care" },
      individualReceiving: { verified: true, value: "Beatrice Hall (CO-MED-1010)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: true, value: "2201 S Oneida St, Denver, CO 80224" },
      individualProviding: { verified: true, value: "Hannah Abbott (CG-111)" },
      timeBeginsAndEnds: { verified: true, value: "Clock-in 01:05 PM (Active shift)" },
    },
    tasksCompleted: ["Personal grooming", "Lunch assistance"],
    careNotes: "Active shift progressing smoothly.",
    clientSignatureCaptured: false,
    signatureType: "Declined",
    billingReadiness: "Not Evaluated",
    payrollReadiness: "Not Evaluated",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Not Submitted",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    reviewNotes: [],
    timeline: [],
  });

  // 11. Record 11: Jesse Pinkman, Client Walter White
  // Scenario E: Aggregator rejection!
  // Completed visit, but Aggregator status is REJECTED (Medicaid ID mismatch in state registry).
  // Demonstrates independent readiness: Billing is Blocked, while Payroll is Cleared for Payroll!
  visits.push({
    id: "EVV-2026-011",
    visitNumber: "#411",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1017",
    clientId: "CL-1011",
    clientName: "Walter White",
    clientPhone: "(505) 555-0308",
    clientAddress: "308 Negra Arroyo Ln, Albuquerque, NM 87104",
    clientMedicaidId: "NM-MED-1011",
    householdId: "hh-1011",
    householdName: "White Household",
    caregiverId: "CG-112",
    caregiverName: "Jesse Pinkman",
    caregiverPhone: "(720) 555-8833",
    caregiverRole: "Homemaker",
    caregiverClassification: "1099",
    serviceName: "Companion Care",
    serviceCode: "S5125",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-1011",
    authorizedHours: 15,
    billRate: 29.0,
    payRate: 19.5,
    scheduledStartTime: "14:00",
    scheduledEndTime: "17:00",
    scheduledDurationHours: 3.0,
    actualClockInTime: "14:01",
    actualClockOutTime: "17:02",
    actualDurationHours: 3.02,
    varianceMinutes: 3,
    varianceDisplay: "+1m in / +2m out (Time within tol.)",
    varianceStatus: "Within Tolerance",
    captureMethod: "Mobile GPS",
    visitStatus: "Completed",
    verificationStatus: "Exception",
    exceptionType: "AGGREGATOR_REJECTED",
    exceptionTitle: "Aggregator rejected submission",
    exceptionReason: "Aggregator rejected submission (Medicaid ID mismatch in state registry)",
    exceptionDescription: "State aggregator returned HTTP 422: Client Medicaid recipient ID NM-MED-1011 not found in Colorado eligibility file.",
    exceptionDateFlagged: "2026-11-25 05:15 PM",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Verified",
    clockInLocation: {
      address: "308 Negra Arroyo Ln, Albuquerque, NM 87104",
      lat: 35.084,
      lng: -106.65,
      accuracyMeters: 5,
      withinGeofence: true,
      distanceFeet: 25,
      timestamp: "2026-11-25 02:01:10 PM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "308 Negra Arroyo Ln, Albuquerque, NM 87104",
    },
    clockOutLocation: {
      address: "308 Negra Arroyo Ln, Albuquerque, NM 87104",
      lat: 35.084,
      lng: -106.65,
      accuracyMeters: 5,
      withinGeofence: true,
      distanceFeet: 22,
      timestamp: "2026-11-25 05:02:14 PM",
      method: "Mobile GPS",
      coordinatesAvailable: true,
      approvedAddress: "308 Negra Arroyo Ln, Albuquerque, NM 87104",
    },
    patientVerification: {
      signatureCaptured: "Yes",
      voiceVerificationCaptured: "Not applicable",
      patientConfirmedService: "Yes",
      patientConfirmedTime: "Yes",
      verificationTimestamp: "2026-11-25 05:02:40 PM",
      signatureType: "Digital Signature",
      evidenceRef: "SIG-NM-2026-1011-11",
    },
    sixElements: {
      serviceType: { verified: true, value: "S5125 - Companion Care" },
      individualReceiving: { verified: false, value: "Walter White (NM-MED-1011 - Registry Mismatch)", notes: "State error 422" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: true, value: "308 Negra Arroyo Ln" },
      individualProviding: { verified: true, value: "Jesse Pinkman (CG-112)" },
      timeBeginsAndEnds: { verified: true, value: "02:01 PM – 05:02 PM (3.02 hrs)" },
    },
    tasksCompleted: ["Light cleaning", "Safety oversight", "Errand companionship"],
    careNotes: "Completed shift as assigned. Client confirmed hours.",
    clientSignatureCaptured: true,
    clientSignatureTimestamp: "2026-11-25 05:02 PM",
    signatureType: "Digital Signature",
    billingReadiness: "Blocked",
    payrollReadiness: "Cleared for Payroll",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Rejected",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    aggregatorSubmissionId: "SUB-2026-9815",
    aggregatorRejectionReason: "ERR-404: Client Medicaid ID NM-MED-1011 mismatch in state registry",
    assignedReviewer: "Sarah Alverez",
    reviewNotes: [
      {
        id: "rn-011-1",
        reviewerName: "Sarah Alverez",
        reviewerRole: "Billing & Compliance Auditor",
        timestamp: "2026-11-25 05:25 PM",
        note: "Checking with Intake Coordinator: Client was recently transferred from New Mexico Medicaid to Colorado Health First. Updated authorization number pending from county.",
        action: "INVESTIGATION_STARTED",
        reasonCode: "RC-10",
        reasonDescription: "Payer Medicaid ID or Service Code mismatch",
      },
    ],
    timeline: [
      {
        id: "t-011-1",
        timestamp: "2026-11-25 05:15 PM",
        actor: "EVV Aggregator Engine",
        actorRole: "State Gateway",
        event: "Transmission Rejected by State Aggregator",
        details: "ERR-404: Client Medicaid ID NM-MED-1011 not found in state eligibility roster.",
        badgeType: "error",
      },
    ],
  });

  // 12. Record 12: Carlos Mendez, Client Diana Ross
  // Scheduled visit (Upcoming later today)
  visits.push({
    id: "EVV-2026-012",
    visitNumber: "#412",
    date: DEMO_DATE,
    schedulingVisitId: "VIS-1018",
    clientId: "CL-1012",
    clientName: "Diana Ross",
    clientPhone: "(303) 555-0670",
    clientAddress: "670 Wadsworth Blvd, Lakewood, CO 80214",
    clientMedicaidId: "CO-MED-1012",
    householdId: "hh-1012",
    householdName: "Ross Residence",
    caregiverId: "CG-114",
    caregiverName: "Carlos Mendez",
    caregiverPhone: "(503) 555-4819",
    caregiverRole: "Live-In Attendant",
    caregiverClassification: "W-2",
    serviceName: "Personal Care",
    serviceCode: "T1019",
    payerName: "Health First Colorado (Medicaid)",
    program: "HCBS-EBD",
    authorizationNumber: "AUTH-CO-2026-8199",
    authorizedHours: 25,
    billRate: 34.0,
    payRate: 22.5,
    scheduledStartTime: "18:00",
    scheduledEndTime: "22:00",
    scheduledDurationHours: 4.0,
    varianceMinutes: 0,
    varianceDisplay: "Upcoming Shift",
    varianceStatus: "On Schedule",
    captureMethod: "Mobile GPS",
    visitStatus: "Scheduled",
    verificationStatus: "Pending",
    geofenceRadiusFeet: 250,
    locationVerificationStatus: "Unavailable",
    patientVerification: {
      signatureCaptured: "Unknown",
      voiceVerificationCaptured: "Unknown",
      patientConfirmedService: "Not captured",
      patientConfirmedTime: "Not captured",
    },
    sixElements: {
      serviceType: { verified: true, value: "T1019 - Personal Care" },
      individualReceiving: { verified: true, value: "Diana Ross (CO-MED-1012)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: { verified: true, value: "670 Wadsworth Blvd, Lakewood, CO 80214" },
      individualProviding: { verified: true, value: "Carlos Mendez (CG-114)" },
      timeBeginsAndEnds: { verified: false, value: "Scheduled: 06:00 PM – 10:00 PM" },
    },
    tasksCompleted: [],
    careNotes: "Upcoming shift. Caregiver notified via mobile shift dispatch.",
    clientSignatureCaptured: false,
    signatureType: "Declined",
    billingReadiness: "Not Evaluated",
    payrollReadiness: "Not Evaluated",
    aggregator: "Sandata" as any,
    aggregatorStatus: "Not Submitted",
    aggregatorProvider: "EVV Aggregator (State Interface)",
    reviewNotes: [],
    timeline: [
      {
        id: "t-012-1",
        timestamp: "2026-11-25 08:00 AM",
        actor: "System Engine",
        actorRole: "Scheduling Engine",
        event: "Visit Scheduled & Dispatched",
        details: "Shift dispatched to mobile app.",
        badgeType: "info",
      },
    ],
  });

  return visits;
}

export const INITIAL_EVV_VISITS: EvvVisitRecord[] = createInitialVisits();

export const INITIAL_EVV_SUBMISSIONS: EvvSubmissionRecord[] = [
  {
    id: "SUB-2026-9810",
    visitId: "EVV-2026-001",
    clientName: "John Smith",
    caregiverName: "Rahul Sharma",
    serviceName: "Personal Care (T1019)",
    serviceDate: DEMO_DATE,
    submissionTimestamp: "2026-11-25 02:15 PM",
    providerName: "EVV Aggregator (State Interface)",
    status: "Accepted",
    responseCode: "ACK-200",
    responseReason: "All 6 federal elements validated. State visit token issued: #TOK-992144.",
    retryCount: 0,
    lastAttemptAt: "2026-11-25 02:15 PM",
    nextRetryState: "None (Accepted)",
    reconciliationStatus: "Reconciled",
    payloadSummary: {
      provider: "LiliSphere Health LLC",
      procedure: "T1019",
      caregiver_id: "CG-101",
      client_id: "CL-1007",
      clock_in: "2026-11-25T10:01:14Z",
      clock_out: "2026-11-25T14:02:40Z",
      lat: 39.7392,
      lng: -104.9903,
      signature: true,
    },
  },
  {
    id: "SUB-2026-9811",
    visitId: "EVV-2026-003",
    clientName: "Emily Jones",
    caregiverName: "David Wilson",
    serviceName: "Personal Care (T1019)",
    serviceDate: DEMO_DATE,
    submissionTimestamp: "2026-11-25 11:45 AM",
    providerName: "EVV Aggregator (State Interface)",
    status: "Submitted",
    responseCode: "QUEUED-102",
    responseReason: "Payload received by aggregator gateway; pending state ingestion batch run.",
    retryCount: 0,
    lastAttemptAt: "2026-11-25 11:45 AM",
    nextRetryState: "Awaiting Batch Run (Scheduled 18:00)",
    reconciliationStatus: "Pending Response",
    payloadSummary: {
      procedure: "T1019",
      caregiver_id: "CG-104",
      client_id: "CL-1009",
      clock_in: "2026-11-25T08:31:05Z",
      clock_out: "2026-11-25T11:33:10Z",
      distance_feet: 1480,
    },
  },
  {
    id: "SUB-2026-9812",
    visitId: "EVV-2026-004",
    clientName: "Raymond Chen",
    caregiverName: "Clara Jenkins",
    serviceName: "Companion Care (S5125)",
    serviceDate: DEMO_DATE,
    submissionTimestamp: "2026-11-25 04:05 PM",
    providerName: "EVV Aggregator (State Interface)",
    status: "Accepted",
    responseCode: "ACK-200",
    responseReason: "Telephony IVR audio hash and registered landline caller ID matched state database.",
    retryCount: 0,
    lastAttemptAt: "2026-11-25 04:05 PM",
    nextRetryState: "None (Accepted)",
    reconciliationStatus: "Reconciled",
    payloadSummary: {
      method: "Telephony / IVR",
      phone: "(303) 555-0550",
      caller_id_verified: true,
    },
  },
  {
    id: "SUB-2026-9813",
    visitId: "EVV-2026-005",
    clientName: "Sophia Patel",
    caregiverName: "Marcus Vance",
    serviceName: "CES Waiver (CES-WVR)",
    serviceDate: DEMO_DATE,
    submissionTimestamp: "2026-11-25 11:15 AM",
    providerName: "EVV Aggregator (State Interface)",
    status: "Accepted",
    responseCode: "ACK-200",
    responseReason: "Fixed In-Home FOB serial token authenticated.",
    retryCount: 0,
    lastAttemptAt: "2026-11-25 11:15 AM",
    nextRetryState: "None (Accepted)",
    reconciliationStatus: "Reconciled",
    payloadSummary: {
      method: "Fixed FOB Device",
      fob_serial: "FOB-9042",
      rolling_code_valid: true,
    },
  },
  {
    id: "SUB-2026-9814",
    visitId: "EVV-2026-006",
    clientName: "Evelyn Foster",
    caregiverName: "Elena Rostova",
    serviceName: "Homemaker (S5130)",
    serviceDate: DEMO_DATE,
    submissionTimestamp: "2026-11-25 03:40 PM",
    providerName: "EVV Aggregator (State Interface)",
    status: "Queued",
    responseCode: "QUEUED-101",
    responseReason: "Transmission staged for nocturnal EDI 837P reconciliation batch.",
    retryCount: 0,
    lastAttemptAt: "2026-11-25 03:40 PM",
    nextRetryState: "Scheduled Batch (00:00 MT)",
    reconciliationStatus: "Pending Response",
  },
  {
    id: "SUB-2026-9815",
    visitId: "EVV-2026-011",
    clientName: "Walter White",
    caregiverName: "Jesse Pinkman",
    serviceName: "Companion Care (S5125)",
    serviceDate: DEMO_DATE,
    submissionTimestamp: "2026-11-25 05:15 PM",
    providerName: "EVV Aggregator (State Interface)",
    status: "Rejected",
    responseCode: "ERR-404",
    responseReason: "Client Medicaid ID NM-MED-1011 mismatch in state registry. Recipient not eligible in Colorado jurisdiction.",
    retryCount: 2,
    lastAttemptAt: "2026-11-25 05:15 PM",
    nextRetryState: "Retry Available (Pending Medicaid ID Correction)",
    reconciliationStatus: "Unreconciled",
    payloadSummary: {
      client_medicaid_id: "NM-MED-1011",
      error_field: "individualReceiving.id",
      status: "REJECTED_BY_STATE",
    },
  },
  {
    id: "SUB-2026-9816",
    visitId: "EVV-2026-008",
    clientName: "Grace Hopper",
    caregiverName: "Maya Lin",
    serviceName: "Companion Care (S5125)",
    serviceDate: DEMO_DATE,
    submissionTimestamp: "2026-11-25 02:40 PM",
    providerName: "EVV Aggregator (State Interface)",
    status: "Retry Required",
    responseCode: "ERR-422",
    responseReason: "Missing mandatory clock-in timestamp in payload (Federal Element #6 incomplete).",
    retryCount: 1,
    lastAttemptAt: "2026-11-25 02:40 PM",
    nextRetryState: "Awaiting Timesheet Correction Approval",
    reconciliationStatus: "Unreconciled",
    payloadSummary: {
      clock_in: null,
      clock_out: "2026-11-25T14:32:15Z",
      missing: "timeBegins",
    },
  },
  {
    id: "SUB-2026-9817",
    visitId: "EVV-2026-009",
    clientName: "Arthur Dent",
    caregiverName: "James Chen",
    serviceName: "Homemaker (S5130)",
    serviceDate: DEMO_DATE,
    submissionTimestamp: "2026-11-25 12:15 PM",
    providerName: "EVV Aggregator (State Interface)",
    status: "Acknowledgement Pending",
    responseCode: "ACK-PENDING",
    responseReason: "Payload delivered to external aggregator server; awaiting asynchronous batch acceptance token.",
    retryCount: 0,
    lastAttemptAt: "2026-11-25 12:15 PM",
    nextRetryState: "Polling State API (interval 15m)",
    reconciliationStatus: "Pending Response",
  },
];

/**
 * Storage helpers
 */
export function getEvvVisitsFromStorage(): EvvVisitRecord[] {
  if (typeof window === "undefined") return INITIAL_EVV_VISITS;
  try {
    const raw = localStorage.getItem(EVV_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EVV_STORAGE_KEY, JSON.stringify(INITIAL_EVV_VISITS));
      return INITIAL_EVV_VISITS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading EVV visits from localStorage", err);
    return INITIAL_EVV_VISITS;
  }
}

export function saveEvvVisitsToStorage(visits: EvvVisitRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVV_STORAGE_KEY, JSON.stringify(visits));
    window.dispatchEvent(new CustomEvent(EVV_SYNC_EVENT));
  } catch (err) {
    console.error("Error saving EVV visits to localStorage", err);
  }
}

export function getEvvSubmissionsFromStorage(): EvvSubmissionRecord[] {
  if (typeof window === "undefined") return INITIAL_EVV_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(EVV_SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(EVV_SUBMISSIONS_KEY, JSON.stringify(INITIAL_EVV_SUBMISSIONS));
      return INITIAL_EVV_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_EVV_SUBMISSIONS;
  }
}

export function saveEvvSubmissionsToStorage(submissions: EvvSubmissionRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVV_SUBMISSIONS_KEY, JSON.stringify(submissions));
    window.dispatchEvent(new CustomEvent(EVV_SYNC_EVENT));
  } catch (err) {
    console.error("Error saving EVV submissions to localStorage", err);
  }
}

export function getEvvRulesFromStorage(): EvvToleranceRule[] {
  if (typeof window === "undefined") return INITIAL_EVV_RULES;
  try {
    const raw = localStorage.getItem(EVV_RULES_KEY);
    if (!raw) {
      localStorage.setItem(EVV_RULES_KEY, JSON.stringify(INITIAL_EVV_RULES));
      return INITIAL_EVV_RULES;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_EVV_RULES;
  }
}

export function saveEvvRulesToStorage(rules: EvvToleranceRule[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVV_RULES_KEY, JSON.stringify(rules));
    window.dispatchEvent(new CustomEvent(EVV_SYNC_EVENT));
  } catch (err) {
    console.error("Error saving EVV rules to localStorage", err);
  }
}

export function saveEvvRule(rule: EvvToleranceRule): void {
  const rules = getEvvRulesFromStorage();
  const index = rules.findIndex((r) => r.id === rule.id);
  if (index >= 0) {
    rules[index] = rule;
  } else {
    rules.unshift(rule);
  }
  saveEvvRulesToStorage(rules);
}

export function toggleEvvRule(ruleId: string): void {
  const rules = getEvvRulesFromStorage();
  const target = rules.find((r) => r.id === ruleId);
  if (target) {
    target.isActive = !target.isActive;
    saveEvvRulesToStorage(rules);
  }
}

export function getEvvVisitById(id: string): EvvVisitRecord | undefined {
  const visits = getEvvVisitsFromStorage();
  const searchId = id.toLowerCase().trim();

  const match =
    visits.find((v) => v.id.toLowerCase() === searchId) ||
    visits.find((v) => v.visitNumber.toLowerCase() === searchId) ||
    visits.find((v) => v.schedulingVisitId?.toLowerCase() === searchId) ||
    INITIAL_EVV_VISITS.find((v) => v.id.toLowerCase() === searchId);

  return match;
}

export function calculateEvvKpis(visits: EvvVisitRecord[]): EvvKpiSummary {
  const todaysVisits = visits.length;
  const inProgress = visits.filter((v) => v.visitStatus === "In Progress").length;
  const pendingVerification = visits.filter(
    (v) => v.visitStatus === "Completed" && v.verificationStatus === "Pending"
  ).length;
  const exceptions = visits.filter(
    (v) =>
      v.verificationStatus === "Exception" ||
      v.verificationStatus === "Under Review" ||
      v.verificationStatus === "Correction Required"
  ).length;
  const clearedForBilling = visits.filter((v) => v.billingReadiness === "Cleared for Billing").length;
  const aggregatorRejected = visits.filter((v) => v.aggregatorStatus === "Rejected").length;

  return {
    todaysVisits,
    inProgress,
    pendingVerification,
    exceptions,
    clearedForBilling,
    aggregatorRejected,
    totalVisits: todaysVisits,
  };
}

/**
 * Exception Resolution Workflow
 */
export function resolveEvvException(
  visitId: string,
  reasonCode: string,
  resolutionCode: string,
  reviewerNotes: string,
  reviewerName: string = "Dana Jenkins, MSW"
): EvvVisitRecord | null {
  const visits = getEvvVisitsFromStorage();
  const index = visits.findIndex((v) => v.id.toLowerCase() === visitId.toLowerCase());
  if (index === -1) return null;

  const current = visits[index];
  const reasonObj = EVV_REASON_CODES.find((r) => r.code === reasonCode);
  const resObj = EVV_RESOLUTION_CODES.find((r) => r.code === resolutionCode);
  const now = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const newNote: EvvReviewNote = {
    id: `rn-${Date.now()}`,
    reviewerName,
    reviewerRole: "Agency Operations Admin",
    timestamp: now,
    note: reviewerNotes || `Exception resolved: ${resObj?.label || resolutionCode}`,
    action: "EXCEPTION_RESOLVED",
    reasonCode,
    reasonDescription: reasonObj?.label,
    resolutionCode,
  };

  const newTimelineEvent: EvvTimelineEvent = {
    id: `t-res-${Date.now()}`,
    timestamp: now,
    actor: reviewerName,
    actorRole: "Agency Operations Admin",
    event: "Exception Resolved & Verified",
    details: `Reason: ${reasonObj?.label || reasonCode} | Resolution: ${resObj?.label || resolutionCode}. Notes: ${reviewerNotes || "None"}`,
    badgeType: "success",
  };

  // If visit was completed, resolve to Verified and evaluate downstream billing
  const updated: EvvVisitRecord = {
    ...current,
    verificationStatus: "Verified",
    resolutionCode,
    resolutionLabel: resObj?.label,
    resolutionNotes: reviewerNotes,
    resolutionTimestamp: now,
    reviewNotes: [newNote, ...current.reviewNotes],
    timeline: [newTimelineEvent, ...current.timeline],
    billingReadiness: current.visitStatus === "Completed" ? "Cleared for Billing" : current.billingReadiness,
    payrollReadiness: current.visitStatus === "Completed" ? "Cleared for Payroll" : current.payrollReadiness,
    aggregatorStatus: current.aggregatorStatus === "Rejected" ? "Queued" : current.aggregatorStatus,
  };

  visits[index] = updated;
  saveEvvVisitsToStorage(visits);
  return updated;
}

/**
 * Approve minor variance (within policy)
 */
export function approveMinorVariance(
  visitId: string,
  reviewerName: string = "Dana Jenkins, MSW",
  notes: string = "Minor variance approved per agency tolerance policy."
): EvvVisitRecord | null {
  return resolveEvvException(visitId, "RC-01", "RES-01", notes, reviewerName);
}

/**
 * Request correction from caregiver
 */
export function requestCaregiverCorrection(
  visitId: string,
  reviewerName: string = "Dana Jenkins, MSW",
  notes: string
): EvvVisitRecord | null {
  const visits = getEvvVisitsFromStorage();
  const index = visits.findIndex((v) => v.id.toLowerCase() === visitId.toLowerCase());
  if (index === -1) return null;

  const current = visits[index];
  const now = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const newNote: EvvReviewNote = {
    id: `rn-${Date.now()}`,
    reviewerName,
    reviewerRole: "Agency Operations Admin",
    timestamp: now,
    note: notes,
    action: "CORRECTION_REQUESTED",
  };

  const newTimeline: EvvTimelineEvent = {
    id: `t-req-${Date.now()}`,
    timestamp: now,
    actor: reviewerName,
    actorRole: "Agency Operations Admin",
    event: "Correction Requested from Caregiver",
    details: notes,
    badgeType: "warning",
  };

  const updated: EvvVisitRecord = {
    ...current,
    verificationStatus: "Correction Required",
    billingReadiness: "Blocked",
    payrollReadiness: "Blocked",
    reviewNotes: [newNote, ...current.reviewNotes],
    timeline: [newTimeline, ...current.timeline],
  };

  visits[index] = updated;
  saveEvvVisitsToStorage(visits);
  return updated;
}

/**
 * Bulk actions
 */
export function bulkAssignReviewer(visitIds: string[], reviewerName: string): number {
  const visits = getEvvVisitsFromStorage();
  let updatedCount = 0;
  const now = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  visits.forEach((v) => {
    if (visitIds.includes(v.id)) {
      v.assignedReviewer = reviewerName;
      v.reviewNotes.unshift({
        id: `rn-assign-${Date.now()}-${Math.random()}`,
        reviewerName: "System Dispatch",
        reviewerRole: "Operations Coordinator",
        timestamp: now,
        note: `Assigned for exception review to ${reviewerName}.`,
        action: "REVIEWER_ASSIGNED",
      });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    saveEvvVisitsToStorage(visits);
  }
  return updatedCount;
}

export function bulkResolveVariances(visitIds: string[], reviewerName: string, notes: string): { processed: number; skipped: string[] } {
  const visits = getEvvVisitsFromStorage();
  const skipped: string[] = [];
  let processed = 0;

  visits.forEach((v) => {
    if (visitIds.includes(v.id)) {
      // Safeguard: Do not auto-resolve missing clock-in or location issues
      if (v.exceptionType === "MISSING_CLOCK_IN_OUT" || v.exceptionType === "LOCATION_VERIFICATION") {
        skipped.push(`${v.id} (${v.exceptionReason || "Missing clock or location issue requires manual evidence"})`);
        return;
      }
      v.verificationStatus = "Verified";
      v.resolutionCode = "RES-01";
      v.resolutionLabel = "Approved minor time variance within policy tolerance";
      v.resolutionNotes = notes;
      v.billingReadiness = v.visitStatus === "Completed" ? "Cleared for Billing" : v.billingReadiness;
      v.payrollReadiness = v.visitStatus === "Completed" ? "Cleared for Payroll" : v.payrollReadiness;
      processed++;
    }
  });

  if (processed > 0) {
    saveEvvVisitsToStorage(visits);
  }
  return { processed, skipped };
}

/**
 * Retry an aggregator submission
 */
export function retryEvvSubmission(submissionId: string): boolean {
  const submissions = getEvvSubmissionsFromStorage();
  const subIndex = submissions.findIndex((s) => s.id === submissionId);
  if (subIndex === -1) return false;

  const target = submissions[subIndex];
  const now = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  target.retryCount += 1;
  target.lastAttemptAt = now;
  target.status = "Queued";
  target.responseCode = "QUEUED-RETRY";
  target.responseReason = "Transmission re-queued into Colorado state aggregator ingestion buffer.";
  target.nextRetryState = "Batch Processing";
  target.reconciliationStatus = "Pending Response";

  saveEvvSubmissionsToStorage(submissions);

  // Also update corresponding visit aggregator status
  const visits = getEvvVisitsFromStorage();
  const visitIndex = visits.findIndex((v) => v.id === target.visitId);
  if (visitIndex !== -1) {
    visits[visitIndex].aggregatorStatus = "Queued";
    saveEvvVisitsToStorage(visits);
  }

  return true;
}

export function addEvvReviewNote(
  visitId: string,
  reviewerName: string,
  reviewerRole: string,
  note: string,
  action: EvvReviewNote["action"],
  reasonCode?: string,
  reasonDescription?: string,
  resolveException?: boolean
): EvvVisitRecord | null {
  const visits = getEvvVisitsFromStorage();
  const index = visits.findIndex((v) => v.id.toLowerCase() === visitId.toLowerCase());
  if (index === -1) return null;

  const current = visits[index];
  const now = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const newNote: EvvReviewNote = {
    id: `rn-${Date.now()}`,
    reviewerName,
    reviewerRole,
    timestamp: now,
    note,
    action,
    reasonCode,
    reasonDescription,
  };

  const newTimelineEvent: EvvTimelineEvent = {
    id: `t-action-${Date.now()}`,
    timestamp: now,
    actor: reviewerName,
    actorRole: reviewerRole,
    event:
      action === "EXCEPTION_RESOLVED"
        ? "Exception Resolved & Verified"
        : action === "CORRECTION_REQUESTED"
          ? "Correction Requested from Caregiver"
          : "Staff Review Note Added",
    details: `${note}${reasonCode ? ` (Reason Code: ${reasonCode} - ${reasonDescription})` : ""}`,
    badgeType: action === "EXCEPTION_RESOLVED" ? "success" : "info",
  };

  const updated: EvvVisitRecord = {
    ...current,
    reviewNotes: [newNote, ...current.reviewNotes],
    timeline: [newTimelineEvent, ...current.timeline],
    verificationStatus: resolveException
      ? "Verified"
      : action === "CORRECTION_REQUESTED"
        ? "Correction Required"
        : action === "INVESTIGATION_STARTED"
          ? "Under Review"
          : current.verificationStatus,
    billingReadiness:
      resolveException && current.visitStatus === "Completed"
        ? "Cleared for Billing"
        : current.billingReadiness,
    payrollReadiness:
      resolveException && current.visitStatus === "Completed"
        ? "Cleared for Payroll"
        : current.payrollReadiness,
  };

  visits[index] = updated;
  saveEvvVisitsToStorage(visits);
  return updated;
}

/**
 * CSV Export
 */
export function exportEvvVisitsCsv(visits: EvvVisitRecord[]): void {
  const headers = [
    "Visit ID",
    "Shift #",
    "Date",
    "Caregiver Name",
    "Caregiver ID",
    "Client Name",
    "Client ID",
    "Client Medicaid ID",
    "Service Code",
    "Service Name",
    "Scheduled Start",
    "Scheduled End",
    "Actual Clock-In",
    "Actual Clock-Out",
    "Variance",
    "Capture Method",
    "Location Status",
    "Patient Verification",
    "Visit Status",
    "Verification Status",
    "Exception Reason",
    "Aggregator Status",
    "Billing Readiness",
    "Payroll Readiness",
  ];

  const rows = visits.map((v) => [
    `"${v.id}"`,
    `"${v.visitNumber}"`,
    `"${v.date}"`,
    `"${v.caregiverName}"`,
    `"${v.caregiverId}"`,
    `"${v.clientName}"`,
    `"${v.clientId}"`,
    `"${v.clientMedicaidId}"`,
    `"${v.serviceCode}"`,
    `"${v.serviceName}"`,
    `"${v.scheduledStartTime}"`,
    `"${v.scheduledEndTime}"`,
    `"${v.actualClockInTime || "--"}"`,
    `"${v.actualClockOutTime || "--"}"`,
    `"${v.varianceDisplay || "0m"}"`,
    `"${v.captureMethod}"`,
    `"${v.locationVerificationStatus}"`,
    `"${v.patientVerification?.signatureCaptured === "Yes" ? "Signed" : "Unsigned"}"`,
    `"${v.visitStatus}"`,
    `"${v.verificationStatus}"`,
    `"${v.exceptionReason || "None"}"`,
    `"${v.aggregatorStatus}"`,
    `"${v.billingReadiness}"`,
    `"${v.payrollReadiness}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `lilisare_evv_operational_audit_${DEMO_DATE}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
