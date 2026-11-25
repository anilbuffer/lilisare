import {
  EvvVisitRecord,
  EvvKpiSummary,
  EvvVerificationStatus,
  EvvVisitStatus,
  EvvExceptionType,
  EvvReviewNote,
  EvvTimelineEvent,
} from "@/types/evvVisit";
import { INITIAL_REALTIME_VISITS, getVisitsFromStorage } from "@/lib/scheduling/schedulingStore";
import { INITIAL_CLIENTS } from "@/lib/clients/mockData";
import { INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { LILISARE_SERVICES } from "@/lib/services";

export const EVV_STORAGE_KEY = "lilisare_evv_visits_v2";
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
];

/**
 * Standard Caregiver Pool synchronized with /admin/caregivers/
 */
const CAREGIVER_ROSTER = [
  { id: "CG-102", name: "Sarah Miller", phone: "(541) 555-0199", role: "Family Caregiver (W-2)", classification: "W-2" },
  { id: "CG-101", name: "Rahul Sharma", phone: "(303) 555-8821", role: "Certified Nurse Aide (CNA)", classification: "W-2" },
  { id: "CG-103", name: "Priya Patel", phone: "(720) 555-4122", role: "Home Health Aide (HHA)", classification: "W-2" },
  { id: "CG-104", name: "David Wilson", phone: "(720) 555-9012", role: "Personal Care Worker", classification: "Direct Care Worker" },
  { id: "CG-105", name: "Clara Jenkins", phone: "(541) 555-0245", role: "Direct Care Worker", classification: "1099" },
  { id: "CG-106", name: "Marcus Vance", phone: "(503) 555-8812", role: "Certified Nurse Aide (CNA)", classification: "W-2" },
  { id: "CG-107", name: "Elena Rostova", phone: "(303) 555-1144", role: "Direct Care Professional", classification: "Direct Care Worker" },
  { id: "CG-108", name: "Samuel O'Connor", phone: "(720) 555-3399", role: "Direct Support Professional (DSP)", classification: "W-2" },
  { id: "CG-109", name: "Maya Lin", phone: "(303) 555-2255", role: "Home Health Aide (HHA)", classification: "W-2" },
  { id: "CG-110", name: "James Chen", phone: "(720) 555-6677", role: "Homemaker Care Specialist", classification: "Direct Care Worker" },
  { id: "CG-111", name: "Hannah Abbott", phone: "(303) 555-4422", role: "Direct Support Professional", classification: "W-2" },
  { id: "CG-112", name: "Jesse Pinkman", phone: "(720) 555-8833", role: "Homemaker", classification: "1099" },
  { id: "CG-113", name: "Tanya Rivera", phone: "(303) 555-7799", role: "Personal Care Aide", classification: "W-2" },
  { id: "CG-114", name: "Carlos Mendez", phone: "(503) 555-4819", role: "Live-In Attendant", classification: "W-2" },
];

/**
 * Standard Client Pool synchronized with /admin/clients/ & /admin/households/
 */
const CLIENT_ROSTER = [
  { id: "CL-1001", name: "Leo Miller", address: "742 Evergreen Terrace, Springfield, OR 97477", medicaidId: "OR-MED-1001", phone: "(541) 555-0199", householdId: "hh-1001", householdName: "Miller Household" },
  { id: "CL-1002", name: "Marcus Whitfield", address: "1248 Oakwood Drive, Cedar Falls, IA 50613", medicaidId: "IA-MED-1002", phone: "(319) 555-3820", householdId: "hh-1002", householdName: "Whitfield Household" },
  { id: "CL-1003", name: "Lucas Santos", address: "1842 Beacon Hill Dr, Des Moines, IA 50315", medicaidId: "IA-MED-1003", phone: "(515) 555-0142", householdId: "hh-1003", householdName: "Santos Household" },
  { id: "CL-1004", name: "Raymond Chen", address: "5500 E 6th Ave, Denver, CO 80220", medicaidId: "CO-MED-1004", phone: "(303) 555-0550", householdId: "hh-1004", householdName: "Chen Household" },
  { id: "CL-1005", name: "Sophia Patel", address: "1940 Colorado Blvd, Denver, CO 80220", medicaidId: "CO-MED-1005", phone: "(303) 555-1940", householdId: "hh-1005", householdName: "Patel Household" },
  { id: "CL-1006", name: "Evelyn Foster", address: "880 Broadway, Boulder, CO 80302", medicaidId: "CO-MED-1006", phone: "(303) 555-8800", householdId: "hh-1006", householdName: "Foster Household" },
  { id: "CL-1007", name: "John Smith", address: "1284 Oakridge Ave, Denver, CO 80204", medicaidId: "CO-MED-994102", phone: "(303) 555-0142", householdId: "hh-1007", householdName: "Smith Residence" },
  { id: "CL-1008", name: "Michael Brown", address: "450 Spruce St, Boulder, CO 80302", medicaidId: "CO-MED-841920", phone: "(303) 555-0198", householdId: "hh-1008", householdName: "Brown Household" },
  { id: "CL-1009", name: "Emily Jones", address: "7820 S University Blvd, Centennial, CO 80122", medicaidId: "CO-MED-772154", phone: "(303) 555-0814", householdId: "hh-1009", householdName: "Jones Residence" },
  { id: "CL-1010", name: "Beatrice Hall", address: "2201 S Oneida St, Denver, CO 80224", medicaidId: "CO-MED-1010", phone: "(303) 555-2201", householdId: "hh-1010", householdName: "Hall Household" },
  { id: "CL-1011", name: "Walter White", address: "308 Negra Arroyo Ln, Albuquerque, NM 87104", medicaidId: "NM-MED-1011", phone: "(505) 555-0308", householdId: "hh-1011", householdName: "White Household" },
  { id: "CL-1012", name: "Diana Ross", address: "670 Wadsworth Blvd, Lakewood, CO 80214", medicaidId: "CO-MED-1012", phone: "(303) 555-0670", householdId: "hh-1012", householdName: "Ross Residence" },
];

/**
 * Single source of truth services from LILISARE_SERVICES
 */
const SERVICE_ROSTER = [
  { name: "Personal Care", code: "T1019" },
  { name: "Homemaker", code: "S5130" },
  { name: "In-Home Support Services (IHSS)", code: "T1019-IHSS" },
  { name: "CES Waiver (Children’s Extensive Support)", code: "CES-WVR" },
  { name: "Respite Care", code: "T1005" },
  { name: "Companion Care", code: "S5125" },
  { name: "CNA (Certified Nurse Aide)", code: "T1019" },
  { name: "Family Caregiver", code: "S5125" },
];

function createInitialVisits(): EvvVisitRecord[] {
  const visits: EvvVisitRecord[] = [];

  // 1. Illustrative Record 1: Rahul Sharma, Client John Smith, 10:00 AM – 2:00 PM, Personal Care, Verified
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
    visitStatus: "Completed",
    verificationStatus: "Verified",
    geofenceRadiusFeet: 250,
    clockInLocation: {
      address: "1284 Oakridge Ave, Denver, CO 80204",
      lat: 39.7392,
      lng: -104.9903,
      accuracyMeters: 6,
      withinGeofence: true,
      distanceFeet: 42,
      timestamp: "2026-11-25 10:01:14 AM",
      method: "Mobile App GPS",
    },
    clockOutLocation: {
      address: "1284 Oakridge Ave, Denver, CO 80204",
      lat: 39.7392,
      lng: -104.9903,
      accuracyMeters: 5,
      withinGeofence: true,
      distanceFeet: 38,
      timestamp: "2026-11-25 02:02:40 PM",
      method: "Mobile App GPS",
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
    clientSignatureTimestamp: "2026-11-25 02:01:12 PM",
    signatureType: "Digital Signature",
    billingReadiness: "Ready for Billing",
    payrollReadiness: "Ready for Payroll",
    aggregator: "Sandata",
    aggregatorStatus: "Accepted",
    aggregatorSubmissionId: "SAN-CO-8829104",
    reviewNotes: [],
    timeline: [
      {
        id: "t-001-1",
        timestamp: "2026-11-25 07:00 AM",
        actor: "System Engine",
        actorRole: "Scheduling Engine",
        event: "Visit Scheduled",
        details: "Shift locked from weekly recurring master template.",
      },
      {
        id: "t-001-2",
        timestamp: "2026-11-25 10:01 AM",
        actor: "Rahul Sharma",
        actorRole: "Caregiver (Mobile App)",
        event: "Clock-in Captured",
        details: "GPS verified within 42ft of client home. Accuracy 6m.",
      },
      {
        id: "t-001-3",
        timestamp: "2026-11-25 01:58 PM",
        actor: "Rahul Sharma",
        actorRole: "Caregiver (Mobile App)",
        event: "Care Notes & Tasks Submitted",
        details: "4/4 ADL tasks completed. Client digital signature attached.",
      },
      {
        id: "t-001-4",
        timestamp: "2026-11-25 02:02 PM",
        actor: "Rahul Sharma",
        actorRole: "Caregiver (Mobile App)",
        event: "Clock-out Captured",
        details: "Clock-out location verified within geofence (38ft).",
      },
      {
        id: "t-001-5",
        timestamp: "2026-11-25 02:03 PM",
        actor: "EVV Verification Engine",
        actorRole: "Automated Compliance",
        event: "EVV 6/6 Elements Verified",
        details: "All federal 21st Century CURES Act criteria passed. Forwarded to Sandata aggregator.",
      },
    ],
  });

  // 2. Illustrative Record 2: Priya Patel, Client Michael Brown, 9:00 AM – In progress, Homemaker, Missing clock-out
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
    visitStatus: "In Progress",
    verificationStatus: "Exception",
    exceptionType: "MISSING_CLOCK_IN_OUT",
    exceptionTitle: "Missing clock-out",
    exceptionDescription: "Shift scheduled until 1:00 PM. Currently >2 hours past planned shift end with no clock-out timestamp recorded.",
    exceptionDateFlagged: "2026-11-25 01:15 PM",
    geofenceRadiusFeet: 250,
    clockInLocation: {
      address: "450 Spruce St, Boulder, CO 80302",
      lat: 40.015,
      lng: -105.2705,
      accuracyMeters: 8,
      withinGeofence: true,
      distanceFeet: 55,
      timestamp: "2026-11-25 08:58:22 AM",
      method: "Mobile App GPS",
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
    signatureType: "Digital Signature",
    billingReadiness: "Hold (Exception)",
    payrollReadiness: "Hold (Exception)",
    aggregator: "Sandata",
    aggregatorStatus: "Pending Submission",
    reviewNotes: [
      {
        id: "rn-002-1",
        reviewerName: "Dana Jenkins, Operations Admin",
        reviewerRole: "Admin Supervisor",
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
        actorRole: "Caregiver (Mobile App)",
        event: "Clock-in Captured",
        details: "GPS verified at 450 Spruce St. Geofence distance 55ft.",
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

  // 3. Illustrative Record 3: David Wilson, Client Emily Jones, 8:30 AM – 11:30 AM, Personal Care, Location issue
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
    visitStatus: "Completed",
    verificationStatus: "Exception",
    exceptionType: "LOCATION_VERIFICATION",
    exceptionTitle: "Location verification issue",
    exceptionDescription: "Clock-in GPS coordinates recorded 1,480 feet outside designated residential geofence (250ft threshold).",
    exceptionDateFlagged: "2026-11-25 08:32 AM",
    geofenceRadiusFeet: 250,
    clockInLocation: {
      address: "8100 S University Blvd, Centennial, CO 80122",
      lat: 39.5742,
      lng: -104.9589,
      accuracyMeters: 28,
      withinGeofence: false,
      distanceFeet: 1480,
      timestamp: "2026-11-25 08:31:05 AM",
      method: "Mobile App GPS",
    },
    clockOutLocation: {
      address: "7820 S University Blvd, Centennial, CO 80122",
      lat: 39.5781,
      lng: -104.9592,
      accuracyMeters: 7,
      withinGeofence: true,
      distanceFeet: 40,
      timestamp: "2026-11-25 11:33:10 AM",
      method: "Mobile App GPS",
    },
    sixElements: {
      serviceType: { verified: true, value: "T1019 - Personal Care" },
      individualReceiving: { verified: true, value: "Emily Jones (CO-MED-772154)" },
      dateOfService: { verified: true, value: "2026-11-25" },
      locationOfService: {
        verified: false,
        value: "Clock-in at 8100 S University Blvd (1,480ft outside geofence)",
        notes: "Location discrepancy flagged for coordinator review",
      },
      individualProviding: { verified: true, value: "David Wilson (CG-104)" },
      timeBeginsAndEnds: { verified: true, value: "08:31 AM – 11:33 AM (3.03 hrs)" },
    },
    tasksCompleted: ["Assistance with dressing", "Meal preparation", "Range of motion exercises"],
    careNotes: "Client was walking with assistance. Clock-in occurred at local pharmacy entrance while picking up physician-ordered prescription before entering residence.",
    clientSignatureCaptured: true,
    clientSignatureTimestamp: "2026-11-25 11:30:15 AM",
    signatureType: "Digital Signature",
    billingReadiness: "Hold (Exception)",
    payrollReadiness: "Hold (Exception)",
    aggregator: "Sandata",
    aggregatorStatus: "Pending Submission",
    reviewNotes: [
      {
        id: "rn-003-1",
        reviewerName: "Carlos Mendez, Billing Specialist",
        reviewerRole: "Billing Specialist",
        timestamp: "2026-11-25 12:15 PM",
        note: "Caregiver notes indicate pharmacy pickup at shift start. Contacted caregiver to verify prescription receipt.",
        action: "INVESTIGATION_STARTED",
        reasonCode: "RC-04",
        reasonDescription: "Authorized alternate care location / Community prescription run",
      },
    ],
    timeline: [
      {
        id: "t-003-1",
        timestamp: "2026-11-25 08:31 AM",
        actor: "David Wilson",
        actorRole: "Caregiver (Mobile App)",
        event: "Clock-in Outside Geofence",
        details: "Recorded at 8100 S University Blvd (1,480ft distance). Flagged as Location Exception.",
        badgeType: "warning",
      },
      {
        id: "t-003-2",
        timestamp: "2026-11-25 11:33 AM",
        actor: "David Wilson",
        actorRole: "Caregiver (Mobile App)",
        event: "Clock-out Inside Geofence",
        details: "Recorded inside residential boundary (40ft).",
      },
      {
        id: "t-003-3",
        timestamp: "2026-11-25 12:15 PM",
        actor: "Carlos Mendez",
        actorRole: "Billing Specialist",
        event: "Review Note Added",
        details: "Caregiver verified community pharmacy run at shift commencement.",
      },
    ],
  });

  // Additional 9 Exception Records (Total 12 Exceptions)
  const exceptionPool = [
    {
      id: "EVV-2026-004",
      visitNumber: "#404",
      schedulingVisitId: "VIS-1004",
      clientName: "Leo Miller",
      clientId: "CL-1001",
      caregiverName: "Clara Jenkins",
      caregiverId: "CG-105",
      serviceName: "CES Waiver (Children’s Extensive Support)",
      serviceCode: "CES-WVR",
      scheduledStartTime: "07:30",
      scheduledEndTime: "11:30",
      actualClockInTime: "08:45",
      actualClockOutTime: "11:30",
      actualDurationHours: 2.75,
      visitStatus: "Completed" as EvvVisitStatus,
      verificationStatus: "Exception" as EvvVerificationStatus,
      exceptionType: "LATE_OR_EARLY" as EvvExceptionType,
      exceptionTitle: "Late arrival (+75 mins)",
      exceptionDescription: "Caregiver clocked in 75 minutes past scheduled start time due to severe traffic delay on I-25.",
    },
    {
      id: "EVV-2026-005",
      visitNumber: "#405",
      schedulingVisitId: "VIS-1007",
      clientName: "Eleanor Ruth Whitfield",
      clientId: "CL-1003",
      caregiverName: "Marcus Vance",
      caregiverId: "CG-106",
      serviceName: "In-Home Support Services (IHSS)",
      serviceCode: "T1019-IHSS",
      scheduledStartTime: "09:00",
      scheduledEndTime: "13:00",
      actualClockInTime: "09:02",
      actualClockOutTime: "11:15",
      actualDurationHours: 2.22,
      visitStatus: "Completed" as EvvVisitStatus,
      verificationStatus: "Exception" as EvvVerificationStatus,
      exceptionType: "LATE_OR_EARLY" as EvvExceptionType,
      exceptionTitle: "Early departure (-105 mins)",
      exceptionDescription: "Client had unscheduled outpatient medical appointment; caregiver released early at client request.",
    },
    {
      id: "EVV-2026-006",
      visitNumber: "#406",
      schedulingVisitId: "VIS-1009",
      clientName: "Robert DeLuca",
      clientId: "CL-1004",
      caregiverName: "Elena Rostova",
      caregiverId: "CG-107",
      serviceName: "Personal Care",
      serviceCode: "T1019",
      scheduledStartTime: "11:00",
      scheduledEndTime: "15:00",
      actualClockInTime: "11:05",
      actualClockOutTime: "17:30",
      actualDurationHours: 6.42,
      visitStatus: "Completed" as EvvVisitStatus,
      verificationStatus: "Exception" as EvvVerificationStatus,
      exceptionType: "SCHEDULE_MISMATCH" as EvvExceptionType,
      exceptionTitle: "Scheduled vs actual discrepancy (+2.5 hrs)",
      exceptionDescription: "Actual shift duration exceeded authorized scheduled window by 2.5 hours without prior schedule revision.",
    },
    {
      id: "EVV-2026-007",
      visitNumber: "#407",
      schedulingVisitId: "VIS-1010",
      clientName: "Angela Martinez",
      clientId: "CL-1005",
      caregiverName: "Samuel O'Connor",
      caregiverId: "CG-108",
      serviceName: "Respite Care",
      serviceCode: "T1005",
      scheduledStartTime: "12:00",
      scheduledEndTime: "16:00",
      actualClockInTime: "12:01",
      actualClockOutTime: "16:02",
      actualDurationHours: 4.02,
      visitStatus: "Completed" as EvvVisitStatus,
      verificationStatus: "Exception" as EvvVerificationStatus,
      exceptionType: "MISSING_VISIT_INFO" as EvvExceptionType,
      exceptionTitle: "Missing visit information (No client signature)",
      exceptionDescription: "Care note recorded but client verification signature/voice attestation is missing.",
    },
    {
      id: "EVV-2026-008",
      visitNumber: "#408",
      schedulingVisitId: "VIS-1014",
      clientName: "Grace Hopper",
      clientId: "CL-1006",
      caregiverName: "Maya Lin",
      caregiverId: "CG-109",
      serviceName: "Companion Care",
      serviceCode: "S5125",
      scheduledStartTime: "10:30",
      scheduledEndTime: "14:30",
      actualClockInTime: undefined,
      actualClockOutTime: "14:32",
      actualDurationHours: 4.0,
      visitStatus: "Completed" as EvvVisitStatus,
      verificationStatus: "Exception" as EvvVerificationStatus,
      exceptionType: "MISSING_CLOCK_IN_OUT" as EvvExceptionType,
      exceptionTitle: "Missing clock-in",
      exceptionDescription: "Clock-out recorded via mobile app, but start time clock-in record was omitted.",
    },
    {
      id: "EVV-2026-009",
      visitNumber: "#409",
      schedulingVisitId: "VIS-1015",
      clientName: "Arthur Dent",
      clientId: "CL-1002",
      caregiverName: "James Chen",
      caregiverId: "CG-110",
      serviceName: "Homemaker",
      serviceCode: "S5130",
      scheduledStartTime: "08:00",
      scheduledEndTime: "12:00",
      actualClockInTime: "08:02",
      actualClockOutTime: "12:04",
      actualDurationHours: 4.03,
      visitStatus: "Completed" as EvvVisitStatus,
      verificationStatus: "Exception" as EvvVerificationStatus,
      exceptionType: "LOCATION_VERIFICATION" as EvvExceptionType,
      exceptionTitle: "Location verification issue (GPS accuracy low)",
      exceptionDescription: "Clock-in GPS accuracy was +/- 95 meters due to basement apartment reception.",
    },
    {
      id: "EVV-2026-010",
      visitNumber: "#410",
      schedulingVisitId: "VIS-1016",
      clientName: "Beatrice Hall",
      clientId: "CL-1010",
      caregiverName: "Hannah Abbott",
      caregiverId: "CG-111",
      serviceName: "Personal Care",
      serviceCode: "T1019",
      scheduledStartTime: "13:00",
      scheduledEndTime: "17:00",
      actualClockInTime: "13:05",
      actualClockOutTime: undefined,
      actualDurationHours: 2.7,
      visitStatus: "In Progress" as EvvVisitStatus,
      verificationStatus: "Under Review" as EvvVerificationStatus,
      exceptionType: "SCHEDULE_MISMATCH" as EvvExceptionType,
      exceptionTitle: "Shift overlap inquiry",
      exceptionDescription: "Caregiver previously logged a concurrent telephonic check-in for another agency client.",
    },
    {
      id: "EVV-2026-011",
      visitNumber: "#411",
      schedulingVisitId: "VIS-1017",
      clientName: "Walter White",
      clientId: "CL-1011",
      caregiverName: "Jesse Pinkman",
      caregiverId: "CG-112",
      serviceName: "Homemaker",
      serviceCode: "S5130",
      scheduledStartTime: "09:30",
      scheduledEndTime: "13:30",
      actualClockInTime: undefined,
      actualClockOutTime: undefined,
      actualDurationHours: 0,
      visitStatus: "Missed" as EvvVisitStatus,
      verificationStatus: "Exception" as EvvVerificationStatus,
      exceptionType: "MISSING_CLOCK_IN_OUT" as EvvExceptionType,
      exceptionTitle: "Unreported missed visit",
      exceptionDescription: "Scheduled shift time elapsed with zero clock-in or clock-out timestamps detected.",
    },
    {
      id: "EVV-2026-012",
      visitNumber: "#412",
      schedulingVisitId: "VIS-1018",
      clientName: "Diana Ross",
      clientId: "CL-1012",
      caregiverName: "Tanya Rivera",
      caregiverId: "CG-113",
      serviceName: "Personal Care",
      serviceCode: "T1019",
      scheduledStartTime: "14:00",
      scheduledEndTime: "18:00",
      actualClockInTime: "14:02",
      actualClockOutTime: undefined,
      actualDurationHours: 1.7,
      visitStatus: "In Progress" as EvvVisitStatus,
      verificationStatus: "Correction Required" as EvvVerificationStatus,
      exceptionType: "MISSING_VISIT_INFO" as EvvExceptionType,
      exceptionTitle: "Care plan task checklist incomplete",
      exceptionDescription: "Caregiver submitted interim care notes with unselected mandatory medication observation step.",
    },
  ];

  exceptionPool.forEach((ex, idx) => {
    const cl = CLIENT_ROSTER.find((c) => c.id === ex.clientId) || CLIENT_ROSTER[idx % CLIENT_ROSTER.length];
    const cg = CAREGIVER_ROSTER.find((c) => c.id === ex.caregiverId) || CAREGIVER_ROSTER[idx % CAREGIVER_ROSTER.length];

    visits.push({
      id: ex.id,
      visitNumber: ex.visitNumber,
      date: DEMO_DATE,
      schedulingVisitId: ex.schedulingVisitId,
      clientId: cl.id,
      clientName: cl.name,
      clientPhone: cl.phone,
      clientAddress: cl.address,
      clientMedicaidId: cl.medicaidId,
      householdId: cl.householdId,
      householdName: cl.householdName,
      caregiverId: cg.id,
      caregiverName: cg.name,
      caregiverPhone: cg.phone,
      caregiverRole: cg.role,
      caregiverClassification: cg.classification,
      serviceName: ex.serviceName,
      serviceCode: ex.serviceCode,
      payerName: "Health First Colorado (Medicaid)",
      authorizationNumber: `AUTH-CO-2026-${5000 + idx}`,
      authorizedHours: 20,
      billRate: 34.0,
      payRate: 22.0,
      scheduledStartTime: ex.scheduledStartTime,
      scheduledEndTime: ex.scheduledEndTime,
      scheduledDurationHours: 4.0,
      actualClockInTime: ex.actualClockInTime,
      actualClockOutTime: ex.actualClockOutTime,
      actualDurationHours: ex.actualDurationHours,
      visitStatus: ex.visitStatus,
      verificationStatus: ex.verificationStatus,
      exceptionType: ex.exceptionType,
      exceptionTitle: ex.exceptionTitle,
      exceptionDescription: ex.exceptionDescription,
      exceptionDateFlagged: `${DEMO_DATE} ${ex.scheduledStartTime}`,
      geofenceRadiusFeet: 250,
      clockInLocation: ex.actualClockInTime
        ? {
            address: cl.address,
            lat: 39.7047,
            lng: -105.0814,
            accuracyMeters: 12,
            withinGeofence: ex.exceptionType !== "LOCATION_VERIFICATION",
            distanceFeet: ex.exceptionType === "LOCATION_VERIFICATION" ? 850 : 35,
            timestamp: `${DEMO_DATE} ${ex.actualClockInTime} AM`,
            method: "Mobile App GPS",
          }
        : undefined,
      clockOutLocation: ex.actualClockOutTime
        ? {
            address: cl.address,
            lat: 39.7047,
            lng: -105.0814,
            accuracyMeters: 10,
            withinGeofence: true,
            distanceFeet: 25,
            timestamp: `${DEMO_DATE} ${ex.actualClockOutTime} PM`,
            method: "Mobile App GPS",
          }
        : undefined,
      sixElements: {
        serviceType: { verified: true, value: `${ex.serviceCode} - ${ex.serviceName}` },
        individualReceiving: { verified: true, value: `${cl.name} (${cl.medicaidId})` },
        dateOfService: { verified: true, value: DEMO_DATE },
        locationOfService: {
          verified: ex.exceptionType !== "LOCATION_VERIFICATION",
          value: `${cl.address}`,
        },
        individualProviding: { verified: true, value: `${cg.name} (${cg.id})` },
        timeBeginsAndEnds: {
          verified: !["MISSING_CLOCK_IN_OUT", "SCHEDULE_MISMATCH"].includes(ex.exceptionType || ""),
          value: `${ex.actualClockInTime || "Missing"} – ${ex.actualClockOutTime || "Missing"}`,
        },
      },
      tasksCompleted: ["ADL Assistance", "Meal preparation", "Safety check"],
      careNotes: "Visit service delivered as authorized. Exception flagged for coordinator review.",
      clientSignatureCaptured: ex.exceptionType !== "MISSING_VISIT_INFO",
      signatureType: "Digital Signature",
      billingReadiness: "Hold (Exception)",
      payrollReadiness: "Hold (Exception)",
      aggregator: "Sandata",
      aggregatorStatus: "Pending Submission",
      reviewNotes: [
        {
          id: `rn-ex-${idx}`,
          reviewerName: "Dana Jenkins, MSW",
          reviewerRole: "Agency Operations Admin",
          timestamp: `${DEMO_DATE} 12:30 PM`,
          note: `Flagged automatically by system rule: ${ex.exceptionTitle}. Review required prior to billing lock.`,
          action: "INVESTIGATION_STARTED",
        },
      ],
      timeline: [
        {
          id: `t-ex-${idx}-1`,
          timestamp: `${DEMO_DATE} ${ex.scheduledStartTime}`,
          actor: "System Engine",
          actorRole: "Scheduling Engine",
          event: "Visit Scheduled",
          details: "Shift locked from schedule plan.",
        },
        {
          id: `t-ex-${idx}-2`,
          timestamp: `${DEMO_DATE} ${ex.actualClockInTime || ex.scheduledStartTime}`,
          actor: "EVV Monitoring Engine",
          actorRole: "Automated Compliance",
          event: `Exception Flagged: ${ex.exceptionTitle}`,
          details: ex.exceptionDescription || "",
          badgeType: "warning",
        },
      ],
    });
  });

  // Now populate remaining records to reach exact target numbers:
  // 32 In Progress (we have 2 in progress exceptions + 30 standard verified in-progress)
  // 84 Completed (we have 9 completed exceptions + 1 verified record + 74 standard verified completed)
  // 12 Scheduled
  // Total Visits = 128!
  let recordCounter = 13;

  // 30 In Progress
  for (let i = 0; i < 30; i++) {
    const cg = CAREGIVER_ROSTER[i % CAREGIVER_ROSTER.length];
    const cl = CLIENT_ROSTER[i % CLIENT_ROSTER.length];
    const svc = SERVICE_ROSTER[i % SERVICE_ROSTER.length];
    const startHour = 8 + (i % 6);
    const startStr = `${String(startHour).padStart(2, "0")}:00`;
    const endStr = `${String(startHour + 4).padStart(2, "0")}:00`;
    const actualIn = `${String(startHour).padStart(2, "0")}:0${i % 5}`;
    const visitId = `EVV-2026-${String(recordCounter).padStart(3, "0")}`;

    visits.push({
      id: visitId,
      visitNumber: `#${400 + recordCounter}`,
      date: DEMO_DATE,
      schedulingVisitId: i < INITIAL_REALTIME_VISITS.length ? INITIAL_REALTIME_VISITS[i].id : `VIS-${1000 + recordCounter}`,
      clientId: cl.id,
      clientName: cl.name,
      clientPhone: cl.phone,
      clientAddress: cl.address,
      clientMedicaidId: cl.medicaidId,
      householdId: cl.householdId,
      householdName: cl.householdName,
      caregiverId: cg.id,
      caregiverName: cg.name,
      caregiverPhone: cg.phone,
      caregiverRole: cg.role,
      caregiverClassification: cg.classification,
      serviceName: svc.name,
      serviceCode: svc.code,
      payerName: "Health First Colorado (Medicaid)",
      authorizationNumber: `AUTH-CO-2026-${7000 + i}`,
      authorizedHours: 20,
      billRate: 34.0,
      payRate: 22.0,
      scheduledStartTime: startStr,
      scheduledEndTime: endStr,
      scheduledDurationHours: 4.0,
      actualClockInTime: actualIn,
      actualClockOutTime: undefined,
      actualDurationHours: 2.1,
      visitStatus: "In Progress",
      verificationStatus: "Pending",
      geofenceRadiusFeet: 250,
      clockInLocation: {
        address: cl.address,
        lat: 39.7392 + (i * 0.002),
        lng: -104.9903 - (i * 0.002),
        accuracyMeters: 6,
        withinGeofence: true,
        distanceFeet: 35 + (i * 2),
        timestamp: `${DEMO_DATE} ${actualIn} AM`,
        method: "Mobile App GPS",
      },
      sixElements: {
        serviceType: { verified: true, value: `${svc.code} - ${svc.name}` },
        individualReceiving: { verified: true, value: `${cl.name} (${cl.medicaidId})` },
        dateOfService: { verified: true, value: DEMO_DATE },
        locationOfService: { verified: true, value: `${cl.address} (Within geofence)` },
        individualProviding: { verified: true, value: `${cg.name} (${cg.id})` },
        timeBeginsAndEnds: { verified: false, value: `Clocked in at ${actualIn} AM; in progress` },
      },
      tasksCompleted: ["ADL hygiene", "Nutritional support"],
      careNotes: "Shift actively in progress. Routine morning care delivered safely.",
      clientSignatureCaptured: false,
      signatureType: "Digital Signature",
      billingReadiness: "Awaiting Verification",
      payrollReadiness: "Awaiting Verification",
      aggregator: "Sandata",
      aggregatorStatus: "Pending Submission",
      reviewNotes: [],
      timeline: [
        {
          id: `t-${recordCounter}-1`,
          timestamp: `${DEMO_DATE} ${startStr}`,
          actor: "System Engine",
          actorRole: "Scheduling Engine",
          event: "Visit Scheduled",
          details: "Shift locked from roster.",
        },
        {
          id: `t-${recordCounter}-2`,
          timestamp: `${DEMO_DATE} ${actualIn}`,
          actor: cg.name,
          actorRole: "Caregiver (Mobile App)",
          event: "Clock-in Verified",
          details: `Inside residential geofence (${35 + (i * 2)}ft).`,
        },
      ],
    });
    recordCounter++;
  }

  // 74 Completed
  for (let i = 0; i < 74; i++) {
    const cg = CAREGIVER_ROSTER[i % CAREGIVER_ROSTER.length];
    const cl = CLIENT_ROSTER[i % CLIENT_ROSTER.length];
    const svc = SERVICE_ROSTER[i % SERVICE_ROSTER.length];
    const startHour = 6 + (i % 8);
    const startStr = `${String(startHour).padStart(2, "0")}:00`;
    const endStr = `${String(startHour + 4).padStart(2, "0")}:00`;
    const actualIn = `${String(startHour).padStart(2, "0")}:0${(i % 5) + 1}`;
    const actualOut = `${String(startHour + 4).padStart(2, "0")}:0${(i % 4) + 1}`;
    const visitId = `EVV-2026-${String(recordCounter).padStart(3, "0")}`;

    visits.push({
      id: visitId,
      visitNumber: `#${400 + recordCounter}`,
      date: DEMO_DATE,
      schedulingVisitId: i < INITIAL_REALTIME_VISITS.length ? INITIAL_REALTIME_VISITS[i].id : `VIS-${1000 + recordCounter}`,
      clientId: cl.id,
      clientName: cl.name,
      clientPhone: cl.phone,
      clientAddress: cl.address,
      clientMedicaidId: cl.medicaidId,
      householdId: cl.householdId,
      householdName: cl.householdName,
      caregiverId: cg.id,
      caregiverName: cg.name,
      caregiverPhone: cg.phone,
      caregiverRole: cg.role,
      caregiverClassification: cg.classification,
      serviceName: svc.name,
      serviceCode: svc.code,
      payerName: "Health First Colorado (Medicaid)",
      authorizationNumber: `AUTH-CO-2026-${8000 + i}`,
      authorizedHours: 20,
      billRate: 34.0,
      payRate: 22.0,
      scheduledStartTime: startStr,
      scheduledEndTime: endStr,
      scheduledDurationHours: 4.0,
      actualClockInTime: actualIn,
      actualClockOutTime: actualOut,
      actualDurationHours: 4.0,
      visitStatus: "Completed",
      verificationStatus: "Verified",
      geofenceRadiusFeet: 250,
      clockInLocation: {
        address: cl.address,
        lat: 39.7392 + (i * 0.001),
        lng: -104.9903 - (i * 0.001),
        accuracyMeters: 5,
        withinGeofence: true,
        distanceFeet: 40 + (i % 25),
        timestamp: `${DEMO_DATE} ${actualIn} AM`,
        method: "Mobile App GPS",
      },
      clockOutLocation: {
        address: cl.address,
        lat: 39.7392 + (i * 0.001),
        lng: -104.9903 - (i * 0.001),
        accuracyMeters: 5,
        withinGeofence: true,
        distanceFeet: 36 + (i % 25),
        timestamp: `${DEMO_DATE} ${actualOut} PM`,
        method: "Mobile App GPS",
      },
      sixElements: {
        serviceType: { verified: true, value: `${svc.code} - ${svc.name}` },
        individualReceiving: { verified: true, value: `${cl.name} (${cl.medicaidId})` },
        dateOfService: { verified: true, value: DEMO_DATE },
        locationOfService: { verified: true, value: `${cl.address} (Verified within 250ft geofence)` },
        individualProviding: { verified: true, value: `${cg.name} (${cg.id})` },
        timeBeginsAndEnds: { verified: true, value: `${actualIn} AM – ${actualOut} PM (4.0 hrs)` },
      },
      tasksCompleted: ["ADL assistance", "Meal prep", "Mobility transfer", "Hydration check"],
      careNotes: "Completed authorized care plan tasks. Client was safe, stable, and rested.",
      clientSignatureCaptured: true,
      clientSignatureTimestamp: `${DEMO_DATE} ${actualOut} PM`,
      signatureType: "Digital Signature",
      billingReadiness: "Ready for Billing",
      payrollReadiness: "Ready for Payroll",
      aggregator: "Sandata",
      aggregatorStatus: "Accepted",
      aggregatorSubmissionId: `SAN-CO-${900000 + i}`,
      reviewNotes: [],
      timeline: [
        {
          id: `t-${recordCounter}-1`,
          timestamp: `${DEMO_DATE} ${startStr}`,
          actor: "System Engine",
          actorRole: "Scheduling Engine",
          event: "Visit Scheduled",
          details: "Shift locked from master schedule.",
        },
        {
          id: `t-${recordCounter}-2`,
          timestamp: `${DEMO_DATE} ${actualIn}`,
          actor: cg.name,
          actorRole: "Caregiver (Mobile App)",
          event: "Clock-in Verified",
          details: "GPS inside geofence.",
        },
        {
          id: `t-${recordCounter}-3`,
          timestamp: `${DEMO_DATE} ${actualOut}`,
          actor: cg.name,
          actorRole: "Caregiver (Mobile App)",
          event: "Clock-out & Care Note Submitted",
          details: "Completed with client digital attestation.",
        },
        {
          id: `t-${recordCounter}-4`,
          timestamp: `${DEMO_DATE} ${actualOut}`,
          actor: "EVV Verification Engine",
          actorRole: "Automated Compliance",
          event: "EVV Verified",
          details: "All 6 elements satisfied. Sent to Sandata aggregator.",
        },
      ],
    });
    recordCounter++;
  }

  // 12 Scheduled
  for (let i = 0; i < 12; i++) {
    const cg = CAREGIVER_ROSTER[i % CAREGIVER_ROSTER.length];
    const cl = CLIENT_ROSTER[i % CLIENT_ROSTER.length];
    const svc = SERVICE_ROSTER[i % SERVICE_ROSTER.length];
    const startHour = 17 + (i % 3);
    const startStr = `${String(startHour).padStart(2, "0")}:00`;
    const endStr = `${String(startHour + 3).padStart(2, "0")}:00`;
    const visitId = `EVV-2026-${String(recordCounter).padStart(3, "0")}`;

    visits.push({
      id: visitId,
      visitNumber: `#${400 + recordCounter}`,
      date: DEMO_DATE,
      schedulingVisitId: i < INITIAL_REALTIME_VISITS.length ? INITIAL_REALTIME_VISITS[i].id : `VIS-${1000 + recordCounter}`,
      clientId: cl.id,
      clientName: cl.name,
      clientPhone: cl.phone,
      clientAddress: cl.address,
      clientMedicaidId: cl.medicaidId,
      householdId: cl.householdId,
      householdName: cl.householdName,
      caregiverId: cg.id,
      caregiverName: cg.name,
      caregiverPhone: cg.phone,
      caregiverRole: cg.role,
      caregiverClassification: cg.classification,
      serviceName: svc.name,
      serviceCode: svc.code,
      payerName: "Health First Colorado (Medicaid)",
      authorizationNumber: `AUTH-CO-2026-${9000 + i}`,
      authorizedHours: 20,
      billRate: 34.0,
      payRate: 22.0,
      scheduledStartTime: startStr,
      scheduledEndTime: endStr,
      scheduledDurationHours: 3.0,
      visitStatus: "Scheduled",
      verificationStatus: "Pending",
      geofenceRadiusFeet: 250,
      sixElements: {
        serviceType: { verified: true, value: `${svc.code} - ${svc.name}` },
        individualReceiving: { verified: true, value: `${cl.name} (${cl.medicaidId})` },
        dateOfService: { verified: true, value: DEMO_DATE },
        locationOfService: { verified: false, value: `${cl.address} (Pending clock-in)` },
        individualProviding: { verified: true, value: `${cg.name} (${cg.id})` },
        timeBeginsAndEnds: { verified: false, value: `Scheduled: ${startStr} – ${endStr}` },
      },
      tasksCompleted: [],
      careNotes: "Evening shift scheduled.",
      clientSignatureCaptured: false,
      billingReadiness: "Awaiting Verification",
      payrollReadiness: "Awaiting Verification",
      aggregator: "Sandata",
      aggregatorStatus: "Pending Submission",
      reviewNotes: [],
      timeline: [
        {
          id: `t-${recordCounter}-1`,
          timestamp: `${DEMO_DATE} 08:00 AM`,
          actor: "System Engine",
          actorRole: "Scheduling Engine",
          event: "Visit Scheduled",
          details: "Upcoming evening shift confirmed.",
        },
      ],
    });
    recordCounter++;
  }

  // Additional Multi-Date Visits to support operational date filtering (Nov 23, 24, 26, 27)
  const additionalDates = [
    { date: "2026-11-24", count: 16, defaultStatus: "Completed" as const, defaultVerification: "Verified" as const },
    { date: "2026-11-23", count: 12, defaultStatus: "Completed" as const, defaultVerification: "Verified" as const },
    { date: "2026-11-26", count: 16, defaultStatus: "Scheduled" as const, defaultVerification: "Pending" as const },
    { date: "2026-11-27", count: 12, defaultStatus: "Scheduled" as const, defaultVerification: "Pending" as const },
  ];

  additionalDates.forEach(({ date, count, defaultStatus, defaultVerification }) => {
    for (let k = 0; k < count; k++) {
      const cl = CLIENT_ROSTER[(recordCounter + k) % CLIENT_ROSTER.length];
      const cg = CAREGIVER_ROSTER[(recordCounter + k) % CAREGIVER_ROSTER.length];
      const svc = LILISARE_SERVICES[(recordCounter + k) % LILISARE_SERVICES.length];
      const startHour = 8 + (k % 6);
      const endHour = startHour + 4;
      const startStr = `${String(startHour).padStart(2, "0")}:00`;
      const endStr = `${String(endHour).padStart(2, "0")}:00`;

      const isException = defaultStatus === "Completed" && k === 2;
      const vStatus = isException ? "Exception" : defaultVerification;
      const exceptionType = isException ? ("LOCATION_VERIFICATION" as const) : undefined;
      const clockInActual = defaultStatus === "Completed" ? `${String(startHour).padStart(2, "0")}:03` : undefined;
      const clockOutActual = defaultStatus === "Completed" ? `${String(endHour).padStart(2, "0")}:01` : undefined;

      visits.push({
        id: `EVV-2026-${String(recordCounter).padStart(3, "0")}`,
        visitNumber: `#${500 + recordCounter}`,
        date,
        schedulingVisitId: `VIS-${1000 + recordCounter}`,
        clientId: cl.id,
        clientName: cl.name,
        clientPhone: cl.phone,
        clientAddress: cl.address,
        clientMedicaidId: cl.medicaidId,
        householdId: cl.householdId,
        householdName: cl.householdName,
        caregiverId: cg.id,
        caregiverName: cg.name,
        caregiverPhone: cg.phone,
        caregiverRole: cg.role,
        caregiverClassification: cg.classification,
        serviceName: svc.name,
        serviceCode: svc.code,
        payerName: "Health First Colorado (Medicaid)",
        authorizationNumber: `AUTH-CO-2026-${8000 + recordCounter}`,
        authorizedHours: 20,
        billRate: 34.0,
        payRate: 22.0,
        scheduledStartTime: startStr,
        scheduledEndTime: endStr,
        scheduledDurationHours: 4.0,
        actualClockInTime: clockInActual,
        actualClockOutTime: clockOutActual,
        actualDurationHours: defaultStatus === "Completed" ? 4.0 : undefined,
        visitStatus: defaultStatus,
        verificationStatus: vStatus,
        exceptionType,
        exceptionTitle: isException ? "Location Discrepancy" : undefined,
        exceptionDescription: isException ? "Clock-in recorded outside geofence buffer." : undefined,
        geofenceRadiusFeet: 250,
        clockInLocation: clockInActual
          ? {
              address: cl.address,
              lat: 39.7392,
              lng: -104.9903,
              accuracyMeters: isException ? 240 : 6,
              withinGeofence: !isException,
              distanceFeet: isException ? 380 : 35,
              timestamp: `${date} ${clockInActual}`,
              method: "Mobile App GPS",
            }
          : undefined,
        clockOutLocation: clockOutActual
          ? {
              address: cl.address,
              lat: 39.7392,
              lng: -104.9903,
              accuracyMeters: 5,
              withinGeofence: true,
              distanceFeet: 30,
              timestamp: `${date} ${clockOutActual}`,
              method: "Mobile App GPS",
            }
          : undefined,
        sixElements: {
          serviceType: { verified: true, value: `${svc.code} - ${svc.name}` },
          individualReceiving: { verified: true, value: `${cl.name} (${cl.medicaidId})` },
          dateOfService: { verified: true, value: date },
          locationOfService: { verified: !isException, value: cl.address },
          individualProviding: { verified: true, value: `${cg.name} (${cg.id})` },
          timeBeginsAndEnds: {
            verified: defaultStatus === "Completed",
            value: defaultStatus === "Completed" ? `${startStr} – ${endStr}` : `Scheduled: ${startStr} – ${endStr}`,
          },
        },
        tasksCompleted: defaultStatus === "Completed" ? ["Personal Hygiene", "Meal Preparation"] : [],
        careNotes: defaultStatus === "Completed" ? "Shift completed without client issues." : "Scheduled upcoming visit.",
        clientSignatureCaptured: defaultStatus === "Completed",
        billingReadiness: vStatus === "Verified" ? "Ready for Billing" : "Awaiting Verification",
        payrollReadiness: vStatus === "Verified" ? "Ready for Payroll" : "Awaiting Verification",
        aggregator: "Sandata",
        aggregatorStatus: vStatus === "Verified" ? "Accepted" : "Pending Submission",
        reviewNotes: [],
        timeline: [
          {
            id: `t-${recordCounter}-1`,
            timestamp: `${date} 08:00 AM`,
            actor: "System Engine",
            actorRole: "Scheduling Engine",
            event: "Visit Scheduled",
            details: `Shift created for ${date}.`,
          },
        ],
      });
      recordCounter++;
    }
  });

  return visits;
}

export const INITIAL_EVV_VISITS: EvvVisitRecord[] = createInitialVisits();

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

export function getEvvVisitById(id: string): EvvVisitRecord | undefined {
  const visits = getEvvVisitsFromStorage();
  const searchId = id.toLowerCase().trim();

  // Try direct match in EVV visits
  const match =
    visits.find((v) => v.id.toLowerCase() === searchId) ||
    visits.find((v) => v.visitNumber.toLowerCase() === searchId) ||
    visits.find((v) => v.schedulingVisitId?.toLowerCase() === searchId) ||
    INITIAL_EVV_VISITS.find((v) => v.id.toLowerCase() === searchId) ||
    INITIAL_EVV_VISITS.find((v) => v.schedulingVisitId?.toLowerCase() === searchId);

  if (match) return match;

  // Cross-lookup in stored scheduling visits or INITIAL_REALTIME_VISITS from scheduling
  const storedVisits = typeof window !== "undefined" ? getVisitsFromStorage() : INITIAL_REALTIME_VISITS;
  const realtimeVisit =
    storedVisits.find((v) => v.id.toLowerCase() === searchId) ||
    INITIAL_REALTIME_VISITS.find((v) => v.id.toLowerCase() === searchId);
  if (realtimeVisit) {
    // Synthesize an EVV record matching this scheduling visit
    return {
      id: realtimeVisit.id,
      visitNumber: realtimeVisit.shiftNumber,
      date: realtimeVisit.date,
      schedulingVisitId: realtimeVisit.id,
      clientId: realtimeVisit.clientId,
      clientName: realtimeVisit.clientName,
      clientPhone: "(541) 555-0199",
      clientAddress: realtimeVisit.address,
      clientMedicaidId: "OR-MED-1001",
      householdId: realtimeVisit.householdId,
      householdName: realtimeVisit.householdName,
      caregiverId: realtimeVisit.caregiverId || "CG-102",
      caregiverName: realtimeVisit.caregiverName || "Unassigned Caregiver",
      caregiverPhone: "(541) 555-0199",
      caregiverRole: realtimeVisit.caregiverClass || "Direct Care Worker",
      caregiverClassification: "W-2",
      serviceName: realtimeVisit.serviceName,
      serviceCode: realtimeVisit.serviceCode,
      payerName: "Health First Colorado (Medicaid)",
      authorizationNumber: realtimeVisit.authorizationNumber,
      authorizedHours: realtimeVisit.authorizedWeeklyCap || 20,
      billRate: realtimeVisit.billRate,
      payRate: realtimeVisit.payRate,
      scheduledStartTime: realtimeVisit.startTime,
      scheduledEndTime: realtimeVisit.endTime,
      scheduledDurationHours: realtimeVisit.scheduledHours,
      actualClockInTime: realtimeVisit.clockInActual,
      actualClockOutTime: realtimeVisit.clockOutActual,
      actualDurationHours: realtimeVisit.billableHours,
      visitStatus:
        realtimeVisit.status === "In-Progress"
          ? "In Progress"
          : realtimeVisit.status === "Completed" || realtimeVisit.status === "Verified"
          ? "Completed"
          : "Scheduled",
      verificationStatus:
        realtimeVisit.evvStatus === "Verified"
          ? "Verified"
          : realtimeVisit.status === "In-Progress"
          ? "Pending"
          : "Pending",
      geofenceRadiusFeet: 250,
      clockInLocation: {
        address: realtimeVisit.address,
        lat: 44.0462,
        lng: -123.022,
        accuracyMeters: 6,
        withinGeofence: true,
        distanceFeet: 35,
        timestamp: `${realtimeVisit.date} ${realtimeVisit.clockInActual || realtimeVisit.startTime}`,
        method: "Mobile App GPS",
      },
      clockOutLocation: realtimeVisit.clockOutActual
        ? {
            address: realtimeVisit.address,
            lat: 44.0462,
            lng: -123.022,
            accuracyMeters: 5,
            withinGeofence: true,
            distanceFeet: 28,
            timestamp: `${realtimeVisit.date} ${realtimeVisit.clockOutActual}`,
            method: "Mobile App GPS",
          }
        : undefined,
      sixElements: {
        serviceType: { verified: true, value: `${realtimeVisit.serviceCode} - ${realtimeVisit.serviceName}` },
        individualReceiving: { verified: true, value: realtimeVisit.clientName },
        dateOfService: { verified: true, value: realtimeVisit.date },
        locationOfService: { verified: true, value: realtimeVisit.address },
        individualProviding: { verified: Boolean(realtimeVisit.caregiverName), value: realtimeVisit.caregiverName || "Unassigned" },
        timeBeginsAndEnds: {
          verified: Boolean(realtimeVisit.clockInActual && realtimeVisit.clockOutActual),
          value: `${realtimeVisit.clockInActual || realtimeVisit.startTime} – ${
            realtimeVisit.clockOutActual || realtimeVisit.endTime
          }`,
        },
      },
      tasksCompleted: ["ADL hygiene", "Nutritional support", "Sensory calming"],
      careNotes: realtimeVisit.careNoteSummary || "Care provided per authorized care plan.",
      clientSignatureCaptured: true,
      clientSignatureTimestamp: `${realtimeVisit.date} 04:00 PM`,
      signatureType: "Digital Signature",
      billingReadiness: realtimeVisit.evvStatus === "Verified" ? "Ready for Billing" : "Awaiting Verification",
      payrollReadiness: realtimeVisit.evvStatus === "Verified" ? "Ready for Payroll" : "Awaiting Verification",
      aggregator: "Sandata",
      aggregatorStatus: "Accepted",
      reviewNotes: [],
      timeline: [
        {
          id: `t-rt-${realtimeVisit.id}-1`,
          timestamp: `${realtimeVisit.date} ${realtimeVisit.startTime}`,
          actor: "System Engine",
          actorRole: "Scheduling Engine",
          event: "Shift Scheduled",
          details: "Shift locked from scheduling master roster.",
        },
        {
          id: `t-rt-${realtimeVisit.id}-2`,
          timestamp: `${realtimeVisit.date} ${realtimeVisit.clockInActual || realtimeVisit.startTime}`,
          actor: realtimeVisit.caregiverName || "Caregiver",
          actorRole: "Caregiver (Mobile App)",
          event: "Clock-in Verified",
          details: "Verified inside authorized household geofence.",
        },
      ],
    };
  }

  return undefined;
}

export function calculateEvvKpis(visits: EvvVisitRecord[]): EvvKpiSummary {
  const totalVisits = visits.length;
  const inProgress = visits.filter((v) => v.visitStatus === "In Progress").length;
  const completed = visits.filter((v) => v.visitStatus === "Completed").length;
  const exceptions = visits.filter(
    (v) =>
      v.verificationStatus === "Exception" ||
      v.verificationStatus === "Under Review" ||
      v.verificationStatus === "Correction Required"
  ).length;
  const scheduled = visits.filter((v) => v.visitStatus === "Scheduled").length;

  return {
    totalVisits,
    inProgress,
    completed,
    exceptions,
    scheduled,
  };
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
  const newNote: EvvReviewNote = {
    id: `rn-${Date.now()}`,
    reviewerName,
    reviewerRole,
    timestamp: new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    note,
    action,
    reasonCode,
    reasonDescription,
  };

  const newTimelineEvent: EvvTimelineEvent = {
    id: `t-action-${Date.now()}`,
    timestamp: new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
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
        ? "Ready for Billing"
        : current.billingReadiness,
    payrollReadiness:
      resolveException && current.visitStatus === "Completed"
        ? "Ready for Payroll"
        : current.payrollReadiness,
  };

  visits[index] = updated;
  saveEvvVisitsToStorage(visits);
  return updated;
}

export function exportEvvVisitsCsv(visits: EvvVisitRecord[]): void {
  const headers = [
    "Visit ID",
    "Date",
    "Caregiver Name",
    "Caregiver ID",
    "Client Name",
    "Client ID",
    "Service Code",
    "Service Name",
    "Scheduled Time",
    "Actual Clock-In",
    "Actual Clock-Out",
    "Duration (Hrs)",
    "Visit Status",
    "Verification Status",
    "Exception Issue",
    "Aggregator Status",
    "Billing Readiness",
  ];

  const rows = visits.map((v) => [
    `"${v.id}"`,
    `"${v.date}"`,
    `"${v.caregiverName}"`,
    `"${v.caregiverId}"`,
    `"${v.clientName}"`,
    `"${v.clientId}"`,
    `"${v.serviceCode}"`,
    `"${v.serviceName}"`,
    `"${v.scheduledStartTime} - ${v.scheduledEndTime}"`,
    `"${v.actualClockInTime || "N/A"}"`,
    `"${v.actualClockOutTime || "N/A"}"`,
    `"${v.actualDurationHours ?? v.scheduledDurationHours}"`,
    `"${v.visitStatus}"`,
    `"${v.verificationStatus}"`,
    `"${v.exceptionTitle || "None"}"`,
    `"${v.aggregatorStatus}"`,
    `"${v.billingReadiness}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `lilisare_evv_visits_${DEMO_DATE}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
